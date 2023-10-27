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
    const { id, username, password, role } = req.body;
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
            if (action == 'delete') {
                const delete_user_query = await DBCONNECT(`update user_detail set isactive=false where id=${id}`)
                const user_list = await DBCONNECT('select * from user_detail where isactive=true');
                const update_log = await DBCONNECT(`insert into user_action_logs (user_id,action,log_time) values(${userID},'deleted the user with id ${id}',NOW())`);
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

            // else if (action == 'get') {
            //     // view particular user details
            //     const user_detail = await DBCONNECT(`select * from public.user_detail where id=${id}`);
            //     // const user_project = await DBCONNECT(`select project_id from users_projects where user_id=${id}`);
            //     // const user_ec2 = await DBCONNECT(`select instance_id from users_ec2 where user_id=${id}`);
            //     // const user_rds = await DBCONNECT(`select identifier_id from users_rds where user_id=${id}`);

            //     // const user_vm = await DBCONNECT(`select instance_id from users_vm where user_id=${id}`);
            //     // res.status(200).json({ status: 200, message: 'User Details', userDetail: user_detail.rows, userProject: user_project.rows, userEc2: user_ec2.rows, userRds: user_rds.rows, userVm: user_vm.rows });
            //     res.status(200).json({ status: 200, message: 'User Details', user_detail});
            // }

            else if (action == 'get') {
                
                const user_data = await DBCONNECT(`select * from public.user_detail where id=${id}`);
                res.status(200).json({ status: 200, message: 'User Details', user_data});
            }



            
            else {
                let isadmin = role == "isadmin" ? true : false;
                let issuperadmin = role == "issuperadmin" ? true : false;
                let isuser = role == "isuser" ? true : false;

                const userAddQuery = `INSERT into user_detail (username,password,created_date,isadmin,issuperadmin,isuser,isactive) values ('${username}','${password}',NOW(),${isadmin},${issuperadmin},${isuser},true) Returning id;`;
                const insert_result = await DBCONNECT(userAddQuery);
                const update_log = await DBCONNECT(`insert into user_action_logs (user_id,action,log_time) values(${userID},'added the user with id ${insert_result.rows[0].id}',NOW())`);
                if (insert_result.rows[0].id != "") {
                    const { projectList } = req.body;
                    if (!issuperadmin) {
                        if (projectList && projectList.length > 0) {
                            for (const project of projectList) {
                                const user_project_query = `INSERT into users_projects (user_id,project_id) values (${insert_result.rows[0].id},${project})`;
                                const addProject = await DBCONNECT(user_project_query);
                            }

                        }
                    }
                    if (isuser) {
                        const { ec2List } = req.body;
                        if (ec2List && ec2List.length > 0) {
                            for (const project of ec2List) {
                                const user_ec2_query = `INSERT into users_ec2 (user_id,instance_id) values (${insert_result.rows[0].id},'${project}')`;
                                const addProject = await DBCONNECT(user_ec2_query);
                            }

                        }
                        const { rdsList } = req.body;
                        if (rdsList && rdsList.length > 0) {
                            for (const project of rdsList) {
                                const user_ec2_query = `INSERT into users_rds (user_id,identifier_id) values (${insert_result.rows[0].id},'${project}')`;
                                const addProject = await DBCONNECT(user_ec2_query);
                            }

                        }
                        const { vmList } = req.body;
                        if (vmList && vmList.length > 0) {
                            for (const project of vmList) {
                                const user_vm_query = `INSERT into users_vm (user_id,instance_id) values (${insert_result.rows[0].id},'${project}')`;
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