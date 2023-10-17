import { DBCONNECT } from "@/shared/database";
import { logger } from "@/shared/logger";
import { AnyArn } from "aws-sdk/clients/groundstation";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { username } = req.body;
    const query = `SELECT * FROM user_detail WHERE isactive=true`;
    try {

        const result = await DBCONNECT(query);
        const newArray = result.rows.map((obj: any) => {
            const { ['password']: omit, ...rest } = obj; // Use destructuring to omit the specified property
            return rest;
        });
        res.status(200).json({ message: 'Users Listed Successfully.', userList: newArray });

    }
    catch (error) {
        logger.error(`[${req.method} ${req.url} ] Error in fetching the user list`)
        res.status(500).json({ message: 'Error in fetching the user list' });
    }
}