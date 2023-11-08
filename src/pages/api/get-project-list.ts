import { DBCONNECT } from "@/shared/database";
import { logger } from "@/shared/logger";
import { decrypt } from '@/shared/crypto';
export default async function handler(req: any, res: any) {
    const authorization: any = req.headers['authorization'];
    // const { id } = req.query;
    const id: any = req.headers['id']

    console.log("id from header", id)

    const isSuperAdmin: any = req.headers['issuperadmin']
    const isAdmin: any = req.headers['isadmin']
    const userID: any = req.headers['userid'];
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

        if (id == "") {
           
            if (isSuperAdmin) {

                let query = ``;
                query = `SELECT * FROM projects WHERE isactive=true`;

                logger.info(` [${req.method} ${req.url} ] Executing query to check user credentials: ${query}`);
                const result = await DBCONNECT(query);
                try {

                    const result = await DBCONNECT(query);
                    res.status(200).json({ message: 'Projects Listed Successfully.', projectList: result.rows });

                }
                catch (error) {
                    console.log(error)
                    logger.error(`[${req.method} ${req.url} ] Error in fetching the project list`)
                    res.status(500).json({ message: 'Error in fetching the project list' });
                }
            } else if (isAdmin) {
                let query = await DBCONNECT(`SELECT project_id FROM users_assigned_with_projects where user_id=${userID}`);
                console.log(query.rows, `SELECT project_id FROM users_assigned_with_projects where user_id=${userID}`)
                if (query.rows.length > 0) {
                    var project_ids = query.rows.map((item: any) => item.project_id)
                    let list_query = `Select * from projects where id in (${project_ids})`
                    // const result = await DBCONNECT(list_query);
                    try {

                        // const result = await DBCONNECT(query);
                        const result = await DBCONNECT(list_query);
                        res.status(200).json({ message: 'Projects Listed Successfully.', projectList: result.rows });

                    }
                    catch (error) {
                        console.log(error)
                        logger.error(`[${req.method} ${req.url} ] Error in fetching the project list`)
                        res.status(500).json({ message: 'Error in fetching the project list' });
                    }
                } else {
                    res.status(200).json({ message: 'No projects for this admin user', projectList: [] });
                }
            } else {
                res.status(200).json({ message: 'Projects Listed Successfully.', projectList: [] });
            }
        } 
        // else if (id == '') {
        //     if (isSuperAdmin) {

        //         let query = ``;
        //         query = `SELECT * FROM projects`;

        //         logger.info(` [${req.method} ${req.url} ] Executing query to check user credentials: ${query}`);
        //         const result = await DBCONNECT(query);
        //         try {

        //             const result = await DBCONNECT(query);
        //             res.status(200).json({ message: 'Projects Listed Successfully.', projectList: result.rows });

        //         }
        //         catch (error) {
        //             logger.error(`[${req.method} ${req.url} ] Error in fetching the project list`)
        //             res.status(500).json({ message: 'Error in fetching the project list' });
        //         }
        //     } else if (isAdmin) {
        //         let query = await DBCONNECT(`SELECT project_id FROM users_assigned_with_projects where user_id=${userID}`);
        //         var project_ids = query.rows.map((item: any) => item.project_id)
        //         let list_query = `Select * from projects where id in (${project_ids})`
        //         // const result = await DBCONNECT(list_query);
        //         try {

        //             // const result = await DBCONNECT(query);
        //             const result = await DBCONNECT(list_query);
        //             res.status(200).json({ message: 'Projects Listed Successfully.', projectList: result.rows });

        //         }
        //         catch (error) {
        //             logger.error(`[${req.method} ${req.url} ] Error in fetching the project list`)
        //             res.status(500).json({ message: 'Error in fetching the project list' });
        //         }
        //     } else {
        //         res.status(200).json({ message: 'Projects Listed Successfully.', projectList: [] });
        //     }
        // }
        else {
            // console.log("id returned")
            const project_detail = await DBCONNECT(`Select * from projects where id=${id} AND isactive=true`)
            const ec2_list = `select * from ec2_instances where id in (select service_id from service_assigned_with_projects where project_id=${id} and service_type='ec2' and isactive=true)`
            const rds_list = `select * from rds_identifiers where id in (select service_id from service_assigned_with_projects where project_id=${id} and service_type='rds' and isactive=true)`
            const vm_list = `select * from vm_instances where id in (select service_id from service_assigned_with_projects where project_id=${id} and service_type='vm' and isactive=true)`
            // const aws_ec2_list = await DBCONNECT(`Select * from ec2_instances where project_id=${id}`)
            // const aws_rds_list = await DBCONNECT(`Select * from rds_identifiers where project_id=${id}`)
            // const gcp_vm_list = await DBCONNECT(`Select * from vm_instances where project_id=${id}`)
            const aws_ec2_list = await DBCONNECT(ec2_list)
            const aws_rds_list = await DBCONNECT(rds_list)
            const gcp_vm_list = await DBCONNECT(vm_list)
            let ec2_list_with_project_name = [];
            let rds_list_with_project_name = [];
            let vm_list_with_project_name = [];
            if (aws_ec2_list.rows.length > 0) {
                for (const item of aws_ec2_list.rows) {
                    const project_name =
                        await DBCONNECT(`select jsonb_agg(project_name) from projects where id in (select project_id from service_assigned_with_projects where service_id='${item.id}' and isactive=true) and isactive=true`)
                    const project_ids = await DBCONNECT(`select jsonb_agg(project_id) from service_assigned_with_projects where service_id='${item.id}' and isactive=true`)
                    item.project_name = project_name.rows[0].jsonb_agg;
                    item.project_ids = project_ids.rows[0].jsonb_agg;
                    ec2_list_with_project_name.push(item)
                }
            }
            if (aws_rds_list.rows.length > 0) {
                for (const item of aws_rds_list.rows) {
                    const project_name =
                        await DBCONNECT(`select jsonb_agg(project_name) from projects where id in (select project_id from service_assigned_with_projects where service_id='${item.id}' and isactive=true) and isactive=true`)
                    const project_ids = await DBCONNECT(`select jsonb_agg(project_id) from service_assigned_with_projects where service_id='${item.id}' and isactive=true`)
                    item.project_name = project_name.rows[0].jsonb_agg;
                    item.project_ids = project_ids.rows[0].jsonb_agg;
                    rds_list_with_project_name.push(item)
                }
            }
            if (gcp_vm_list.rows.length > 0) {
                for (const item of gcp_vm_list.rows) {
                    const project_name =
                        await DBCONNECT(`select jsonb_agg(project_name) from projects where id in (select project_id from service_assigned_with_projects where service_id='${item.id}' and isactive=true) and isactive=true`)
                    const project_ids = await DBCONNECT(`select jsonb_agg(project_id) from service_assigned_with_projects where service_id='${item.id}' and isactive=true`)
                    item.project_name = project_name.rows[0].jsonb_agg;
                    item.project_ids = project_ids.rows[0].jsonb_agg;
                    vm_list_with_project_name.push(item)
                }
            }
            // res.status(200).json({ aws_ec2_list: aws_ec2_list.rows, aws_rds_list: aws_rds_list.rows, project_details: project_detail.rows[0], gcp_vm_list: gcp_vm_list.rows })
            res.status(200).json({ aws_ec2_list: ec2_list_with_project_name, aws_rds_list: rds_list_with_project_name, project_details: project_detail.rows[0], 
                gcp_vm_list: vm_list_with_project_name 
            })

        }
    } else {
        logger.error(
            `[${req.method} ${req.url}] - Authorization missing`
        )
        res.status(403).json({ error: 'Authorization missing' });
    }
}