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
    
        if (!Array.isArray(id)) {
            return res.status(400).json({ message: 'Invalid projectIds format. Expected an array.' });
        }
        else{

 
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
