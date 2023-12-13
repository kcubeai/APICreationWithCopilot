import { DBCONNECT } from "@/shared/database";
import { logger } from "@/shared/logger";
import { AnyArn } from "aws-sdk/clients/groundstation";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const authorization: any = req.headers['authorization'];
    const { username } = req.body;
    const userID: any = req.headers['userid'];
    const id: any = req.headers['id'];
    //get the value of id from query string
    // const id = req.query.id;
    
    
    const query = `SELECT * FROM user_detail WHERE isactive=true`;
    
    if (id == null || id == undefined || id == "") {
            try {
                const result = await DBCONNECT(query);
                // const result = await DBCONNECT(`select * from public.user_detail where id=${id}`);
                const newArray = result.rows.map((obj: any) => {
                    const { ['password']: omit, ...rest } = obj; // Use destructuring to omit the specified property
                    return rest;
                });
          
                res.status(200).json({ message: 'All Users Listed Successfully  .', userList: newArray 
            });
                    }
                    
                    catch (error) {
                        logger.error(`[${req.method} ${req.url} ] Error in fetching the user list`)
                        res.status(500).json({ message: 'Error in fetching the user list' });
                    }
        }
     else {
        const result = await DBCONNECT(`select * from public.user_detail where id=${id}`);
        const project = await DBCONNECT(`select * from projects WHERE isactive=true`);

        let query = await DBCONNECT(`SELECT project_id FROM users_assigned_with_projects where user_id=${id}`);
        var project_ids = query.rows.map((item: any) => item.project_id)
        let user_project = await DBCONNECT(`Select * from projects where id in (${project_ids}) AND isactive=true`);
        // const user_project = await DBCONNECT(`select * from users_assigned_with_projects where user_id=${id}`);
        const user_ec2 = await DBCONNECT(`select * from users_assigned_with_ec2 where user_id=${id}`);
        const user_rds = await DBCONNECT(`select * from users_assigned_with_rds where user_id=${id}`);
        const user_vm = await DBCONNECT(`select * from users_assigned_with_vm where user_id=${id}`);

        const newArray = result.rows.map((obj: any) => {
                const { ['password']: omit, ...rest } = obj; // Use destructuring to omit the specified property
                return rest;
            });
        const projectArray = project.rows.map((obj: any) => {
                const { ['project_ids']: omit, ...rest } = obj; // Use destructuring to omit the specified property
                return rest;
            });
        // const userdata=[...newArray, user_project.rows, user_ec2.rows, user_rds.rows, user_vm.rows];
        const userdata=[...newArray];
            res.status(200).json({ status: 200, message: 'User Details', userList: newArray, projectAvailable:projectArray, projectList: user_project.rows, ec2List: user_ec2.rows, rdsList: user_rds.rows, vmList: user_vm.rows});
            // res.status(200).json({ status: 200, message: 'User Details', userList: userdata});
            
        }
}

