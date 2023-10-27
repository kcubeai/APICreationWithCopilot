import { DBCONNECT } from "@/shared/database";
import { logger } from "@/shared/logger";
import { decrypt } from '@/shared/crypto';
export default async function handler(req: any, res: any) {
    const authorization: any = req.headers['authorization'];
    const id: any = req.headers['id']

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
                query = `SELECT * FROM projects`;

                logger.info(` [${req.method} ${req.url} ] Executing query to check user credentials: ${query}`);
                const result = await DBCONNECT(query);
                try {

                    const result = await DBCONNECT(query);
                    res.status(200).json({ message: 'Projects Listed Successfully.', projectList: result.rows });

                }
                catch (error) {
                    logger.error(`[${req.method} ${req.url} ] Error in fetching the project list`)
                    res.status(500).json({ message: 'Error in fetching the project list' });
                }
            } else if (isAdmin) {
                let query = await DBCONNECT(`SELECT project_id FROM users_assigned_with_projects where user_id=${userID}`);
                var project_ids = query.rows.map((item: any) => item.project_id)
                let list_query = `Select * from projects where id in (${project_ids})`
                // const result = await DBCONNECT(list_query);
                try {

                    // const result = await DBCONNECT(query);
                    const result = await DBCONNECT(list_query);
                    res.status(200).json({ message: 'Projects Listed Successfully.', projectList: result.rows });

                }
                catch (error) {
                    logger.error(`[${req.method} ${req.url} ] Error in fetching the project list`)
                    res.status(500).json({ message: 'Error in fetching the project list' });
                }
            } else {
                res.status(200).json({ message: 'Projects Listed Successfully.', projectList: [] });
            }
        } else {
            const project_detail = await DBCONNECT(`Select * from projects where id=${id}`)
            const ec2_list = `select * from ec2_instances where id in (select service_id from service_assigned_with_projects where project_id=${id} and service_type='ec2')`
            const rds_list = `select * from rds_identifiers where id in (select service_id from service_assigned_with_projects where project_id=${id} and service_type='rds')`
            const vm_list = `select * from vm_instances where id in (select service_id from service_assigned_with_projects where project_id=${id} and service_type='vm')`
            // const aws_ec2_list = await DBCONNECT(`Select * from ec2_instances where project_id=${id}`)
            // const aws_rds_list = await DBCONNECT(`Select * from rds_identifiers where project_id=${id}`)
            // const gcp_vm_list = await DBCONNECT(`Select * from vm_instances where project_id=${id}`)
            const aws_ec2_list = await DBCONNECT(ec2_list)
            const aws_rds_list = await DBCONNECT(rds_list)
            const gcp_vm_list = await DBCONNECT(vm_list)
            res.status(200).json({ aws_ec2_list: aws_ec2_list.rows, aws_rds_list: aws_rds_list.rows, project_details: project_detail.rows[0], gcp_vm_list: gcp_vm_list.rows })
            
        }
    } else {
        logger.error(
            `[${req.method} ${req.url}] - Authorization missing`
        )
        res.status(403).json({ error: 'Authorization missing' });
    }
}