import { NextApiRequest, NextApiResponse } from 'next';
import { DBCONNECT } from "@/shared/database";
import { logger } from "@/shared/logger";
import { AnyArn } from "aws-sdk/clients/groundstation";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const authorization: any = req.headers['authorization'];
        // const { id } = req.query;
        const id_string: any = req.headers['project_user']
        const id =  JSON.parse(id_string);
        // // Extract projectIds from the request body
        // const projectIds = req.headers['project_user'];
       console.log("projectIds....",id, 'Type:', typeof id)

        // Ensure projectIds is an array before constructing the SQL query
        if (!Array.isArray(id) || id.length === 0) {
            return res.status(400).json({ message: 'Invalid projectIds format. Expected an array.' });
        }
        else{

      

        // Construct the SQL query using parameterized values to prevent SQL injection
        // const proj_string = id.map((value: any, index: number) => `${index + 1}`).join(', ');
        // const query = 'SELECT * FROM users_assigned_with_projects WHERE project_id IN (${proj_string})';
        
        // const proj_string = id.map((value: any, index: number) => `${index + 1}`).join(', ');
        // console.log("proj_string....",proj_string, 'Type:', typeof proj_string)
const query = `SELECT * FROM users_assigned_with_projects WHERE project_id IN (${id})`;
        
        const proj_user = await DBCONNECT(query);
        

        res.status(200).json({ data: proj_user.rows });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
}
