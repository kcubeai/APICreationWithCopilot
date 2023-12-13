import { NextApiRequest, NextApiResponse } from 'next';
import { DBCONNECT } from '../../shared/database';
import { decrypt } from '@/shared/crypto';
import { logger } from '@/shared/logger';

/**
 * Adds a new user to the database.
 * @param req - The HTTP request object.
 * @param res - The HTTP response object.
 * @returns A JSON response indicating success or failure.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    logger.debug(`[${req.method} ${req.url}] - Request received with body: ${JSON.stringify(req.body)}`);
    const { id, username, password, role,isadmin,issuperadmin,isuser,project,ec2Instances,rdsIdentifiers,vmInstances,updated_project_id } = req.body;
    const action = req.headers['action'];
    const authorization: any = req.headers['authorization'];
    const userID: any = req.headers['userid']
    logger.debug(`[${req.method} ${req.url}] - Authorization header: ${authorization}`);
    if (authorization) {
        if (authorization !== process.env.APP_KEY) {
            if (authorization.split(" ")[1]) {
                //@ts-ignore
                var deckey = decrypt(authorization.split(" ")[1], process.env.CYPHERKEY)
                if (deckey !== process.env.APP_KEY) {
                    logger.error(
                        `[${req.method} ${req.url}] - Unauthorized Token`
                    )
                    res.status(403).json({ error: 'Unauthorized Token' });
                    return;
                }
            } else {
                logger.error(
                    `[${req.method} ${req.url}] - Unauthorized Token`
                )
                res.status(403).json({ error: 'Unauthorized Token' });
                return;
            }
        }
        try {
            const userName = await DBCONNECT(`select username from user_detail where id=${userID}`)
            if (action == 'delete') {
                const delete_user_query = await DBCONNECT(`update user_detail set isactive=false where id=${id} returning username`)
                const user_list = await DBCONNECT('select * from user_detail where isactive=true');
                const update_log = await DBCONNECT(`insert into user_action_logs (user_id,action,log_time,user_name) values(${userID},'deleted the user "${delete_user_query.rows[0].username}" with id ${id}',NOW(),'${userName.rows[0].username}')`);
                res.status(200).json({ status: 200, message: 'User deleted successfully', userList: user_list.rows });
            } 
            
               // else if condition to edit user
            //    else if (action == 'ed') {
            //     let isadmin = role == "isadmin" ? true : false;
            //     let issuperadmin = role == "issuperadmin" ? false : true;
            //     let isuser = role == "isuser" ? true : false;
            //     const update_user_query = await DBCONNECT(`update user_detail set username='${username}',password='${password}',isadmin=${isadmin},issuperadmin=${issuperadmin},isuser=${isuser} where id=${id}`)
            //     const user_list = await DBCONNECT('select * from user_detail where isactive=true');
            //     res.status(200).json({ status: 200, message: 'User updated successfully', userList: user_list.rows });
            // }

      
            else if (action == 'get') {
                
                const user_data = await DBCONNECT(`select * from public.user_detail where id=${id}`);
                res.status(200).json({ status: 200, message: 'User Details', user_data});
            }

            else if (action == 'edit') {

                try {
                    // console.log("update_project_id",updated_project_id, id)
                    if (updated_project_id && updated_project_id.length > 0) {
                       const update_project_detail = await DBCONNECT(`SELECT update_user_project(${id}, ARRAY[${updated_project_id}])`);
                     }


                    if (ec2Instances && ec2Instances.length >0) {
                        const aws_ec2_string = ec2Instances.map((value: any) => `'${value}'`).join(', ');
                         const update_ec2_detail = await DBCONNECT(`SELECT update_user_ec2(${id}, ARRAY[${aws_ec2_string}])`);
                        
                       
                        }
                        else{const delete_ec2_user= await DBCONNECT(`delete from users_assigned_with_ec2 where user_id=${id}`)}
                  

                     if ( rdsIdentifiers && rdsIdentifiers.length >0) {
                        const aws_rds_string = rdsIdentifiers.map((value: any) => `'${value}'`).join(', ');
                        const update_rds_detail = await DBCONNECT(`SELECT update_user_rds(${id}, ARRAY[${aws_rds_string}])`);

                  
                        }
                        else{
                            const delete_rds_user = await DBCONNECT(`delete from users_assigned_with_rds where user_id=${id}`)
                        }
                    if (vmInstances && vmInstances.length >0) {
                        const gcp_vm_string = vmInstances.map((value: any) => `'${value}'`).join(', ');
                        const update_vm_detail = await DBCONNECT(`SELECT update_user_vm(${id}, ARRAY[${gcp_vm_string}])`);
                       
                        }
                        else{
                            const delete_vm_user = await DBCONNECT(`delete from users_assigned_with_vm where user_id=${id}`)
                        }


                        res.status(200).json({ message: 'User added successfully' });

                    
                     

              


            }

            catch (error) {
                logger.error(`[${req.method} ${req.url} ] Error in editing the user list`)
                res.status(500).json({ message: 'Error in editing the user list' });
            }
        }




            
            else {
                let isadmin = role == "isadmin" ? true : false;
                let issuperadmin = role == "issuperadmin" ? true : false;
                let isuser = role == "isuser" ? true : false;

                const userAddQuery = `INSERT into user_detail (username,password,created_date,isadmin,issuperadmin,isuser,isactive) values ('${username}','${password}',NOW(),${isadmin},${issuperadmin},${isuser},true) Returning id;`;
                // console.log(userAddQuery)
                const insert_result = await DBCONNECT(userAddQuery);
                const update_log = await DBCONNECT(`insert into user_action_logs (user_id,action,log_time,user_name) values(${userID},'added the user "${username}" with id ${insert_result.rows[0].id}',NOW(),'${userName.rows[0].username}')`);
                if (insert_result.rows[0].id != "") {
                    const { projectList } = req.body;
                    if (!issuperadmin) {
                        if (projectList && projectList.length > 0) {
                            for (const project of projectList) {
                                const user_project_query = `INSERT into users_assigned_with_projects (user_id,project_id) values (${insert_result.rows[0].id},${project})`;
                                const addProject = await DBCONNECT(user_project_query);
                            }

                        }
                    }
                    if (isuser) {
                        const { ec2List } = req.body;
                        if (ec2List && ec2List.length > 0) {
                            for (const project of ec2List) {
                                const user_ec2_query = `INSERT into users_assigned_with_ec2 (user_id,instance_id) values (${insert_result.rows[0].id},'${project}')`;
                                const addProject = await DBCONNECT(user_ec2_query);
                            }

                        }
                        const { rdsList } = req.body;
                        if (rdsList && rdsList.length > 0) {
                            for (const project of rdsList) {
                                const user_ec2_query = `INSERT into users_assigned_with_rds (user_id,identifier_id) values (${insert_result.rows[0].id},'${project}')`;
                                const addProject = await DBCONNECT(user_ec2_query);
                            }

                        }
                        const { vmList } = req.body;
                        if (vmList && vmList.length > 0) {
                            for (const project of vmList) {
                                const user_vm_query = `INSERT into users_assigned_with_vm (user_id,instance_id) values (${insert_result.rows[0].id},'${project}')`;
                                const addProject = await DBCONNECT(user_vm_query);
                            }

                        }
                    }
                }
                res.status(200).json({ status: 200, message: 'User Added Successfully' })
            }


        } catch (error) {
            logger.error(
                `[${req.method} ${req.url}] - Issue is adding new User ${error}`
            )
            res.status(500).json({ message: 'Issue is adding new User', error: error })
        }

    } else {
        logger.error(
            `[${req.method} ${req.url}] - Authorization missing`
        )
        res.status(403).json({ error: 'Authorization missing' });
    }
}