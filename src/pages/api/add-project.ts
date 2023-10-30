import { DBCONNECT } from "@/shared/database";
import { logger } from "@/shared/logger";
import { NextApiRequest, NextApiResponse } from "next";
import { decrypt } from '@/shared/crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const authorization: any = req.headers['authorization'];
    const action: any = req.headers['action'];
    const { id, name, ec2Instances, rdsIdentifiers, vmInstances } = req.body;
    const userID: any = req.headers['userid']
    const username = await DBCONNECT(`select username from user_detail where id=${userID}`)

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
            if (action == "delete") {
                try {
                    const delete_project_from_service_assigned_with_projects = await DBCONNECT(`delete from service_assigned_with_projects where project_id=${id}`)


                    // const update_query_ec2 = await DBCONNECT(`update ec2_instances set project_id=null,is_mapped=false where project_id=${id}`);
                    // const update_query_rds = await DBCONNECT(`update rds_identifiers set project_id=null,is_mapped=false where project_id=${id}`);
                    // const update_query_vm = await DBCONNECT(`update vm_instances set project_id=null,is_mapped=false where project_id=${id}`);
                    const users_projects = await DBCONNECT(`delete from users_assigned_with_projects where project_id=${id}`);
                    const delete_query = await DBCONNECT(`delete from projects where id=${id} returning project_name`);
                    const update_log = await DBCONNECT(`insert into user_action_logs (user_id,action,log_time,user_name) values(${userID},'deleted the project "${delete_query.rows[0].project_name}" with id ${id}',NOW(),'${username.rows[0].username}')`);
                    res.status(200).json({ message: 'Project Deleted Successfully' })
                } catch (error) {
                    logger.error(
                        `[${req.method} ${req.url}] - Issue in Deleting the project`
                    )
                    res.status(404).json({ error: 'Issue in Deleting the project' });
                }
                return
            } else if (action == "add") {

                try {
                    const insertQuery = `INSERT INTO projects (project_name) VALUES ('${name}') RETURNING id;`

                    const result = await DBCONNECT(insertQuery);
                    const update_log = await DBCONNECT(`insert into user_action_logs (user_id,action,log_time,user_name) values(${userID},'added the project "${name}" with id ${result.rows[0].id}',NOW(),'${username.rows[0].username}')`);
                    if (result.rows.length > 0) {
                        if (ec2Instances && ec2Instances.length > 0) {
                            const aws_ec2_string = ec2Instances.map((value: any) => `'${value}'`).join(', ');
                            console.log(ec2Instances)
                            // const aws_ec2_update_query = `update ec2_instances set is_mapped=true,project_id=${result.rows[0].id} where id in (${aws_ec2_string}) `
                            // const ec2_update = await DBCONNECT(aws_ec2_update_query)
                            const service_assigned_query = await DBCONNECT(`insert into service_assigned_with_projects(service_id,service_type,project_id) SELECT unnest(ARRAY[${aws_ec2_string}]), 'ec2',${result.rows[0].id};`)
                            console.log(service_assigned_query.rows);
                        }
                        if (rdsIdentifiers && rdsIdentifiers.length > 0) {
                            const aws_rds_string = rdsIdentifiers.map((value: any) => `'${value}'`).join(', ');

                            // const aws_rds_update_query = `update rds_identifiers set is_mapped=true,project_id=${result.rows[0].id} where id in (${aws_rds_string}) `
                            // const rds_update = await DBCONNECT(aws_rds_update_query);
                            const service_assigned_query = await DBCONNECT(`insert into service_assigned_with_projects(service_id,service_type,project_id) SELECT unnest(ARRAY[${aws_rds_string}]), 'rds',${result.rows[0].id};`)
                            console.log(service_assigned_query.rows);
                        }
                        if (vmInstances && vmInstances.length > 0) {
                            const gcp_vm_string = vmInstances.map((value: any) => `'${value}'`).join(', ');

                            // const gcp_vm_update_query = `update vm_instances set is_mapped=true,project_id=${result.rows[0].id} where id in (${gcp_vm_string}) `
                            // const gcp_vm_update = await DBCONNECT(gcp_vm_update_query);
                            const service_assigned_query = await DBCONNECT(`insert into service_assigned_with_projects(service_id,service_type,project_id) SELECT unnest(ARRAY[${gcp_vm_string}]), 'vm',${result.rows[0].id};`)
                            console.log(service_assigned_query);
                        }
                    }
                    res.status(200).json({ message: 'Project Added Successfully' })
                } catch (error) {
                    const jsonStringified = JSON.stringify(error);
                    // if (jsonStringified.includes('duplicate key value violates unique constraint')) {
                    if (jsonStringified.includes('already exist')) {
                        logger.error(
                            `[${req.method} ${req.url}] - Project Name Already exists`
                        )
                        res.status(404).json({ error: 'Project Name Already exists' })
                    } else {
                        logger.error(
                            `[${req.method} ${req.url}] - ${error}`
                        )
                        res.status(500).json({ error })
                    }
                }
            } else if (action == "edit") {
                try {
                    // const project_name = await DBCONNECT(`select project_name from projects where id=${id}`);
                    // const update_log = await DBCONNECT(`insert into user_action_logs (user_id,action,log_time,user_name) values(${userID},'edited the project "${project_name.rows[0].project_name}" with id ${id}',NOW(),'${username.rows[0].username}')`);

                    // const aws_ec2_init_update = `update ec2_instances set is_mapped=false, project_id=null where project_id=${id}`;
                    // const aws_rds_init_update = `update rds_identifiers set is_mapped=false, project_id=null where project_id=${id}`;

                    // const ec2_init_update = await DBCONNECT(aws_ec2_init_update)

                    // const rds_init_update = await DBCONNECT(aws_rds_init_update)
                    // if (ec2Instances && ec2Instances.length > 0) {
                    //     const aws_ec2_string = ec2Instances.map((value: any) => `'${value}'`).join(', ');

                    //     const aws_ec2_update_query = `update ec2_instances set is_mapped=true,project_id=${id} where id in (${aws_ec2_string}) `

                    //     const ec2_update = await DBCONNECT(aws_ec2_update_query);
                    // }
                    // if (rdsIdentifiers && rdsIdentifiers.length > 0) {
                    //     const aws_rds_string = rdsIdentifiers.map((value: any) => `'${value}'`).join(', ');

                    //     const aws_rds_update_query = `update rds_identifiers set is_mapped=true,project_id=${id} where id in (${aws_rds_string}) `
                    //     const rds_update = await DBCONNECT(aws_rds_update_query);
                    // }
                    res.status(200).json({ message: 'Project Updated Successfully' })
                } catch (error) {
                    console.log("issue in editing the project", error)
                    logger.error(
                        `[${req.method} ${req.url}] - ${error}  Issue in Editing the project`
                    )
                    res.status(404).json({ error: 'Issue in Editing the project' });
                }
            } else {
                logger.error(
                    `[${req.method} ${req.url}] - Invalid Action`
                )
                res.status(404).json({ error: 'Invalid Action' });
            }
        }
    } else {
        logger.error(
            `[${req.method} ${req.url}] - Unauthorized Token`
        )
        res.status(403).json({ error: 'Unauthorized Token' });
        return;
    }
}