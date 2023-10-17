import { logger } from "../../shared/logger";
import { decrypt } from '../../shared/crypto'
import { NextApiRequest, NextApiResponse } from "next";
import { DBCONNECT } from '@/shared/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const authorization: any = req.headers['authorization'];
    const selected_type: any = req.headers['type'];
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
            if (selected_type == 'action_log') {
                const log_list = await DBCONNECT(`SELECT * FROM user_action_logs WHERE log_time >= current_date - INTERVAL '2 days' order by log_time desc limit 50;`)
                res.status(200).json({ log_list: log_list.rows })
            } else if (selected_type == 'login_log') {
                const log_list = await DBCONNECT(`SELECT * FROM user_logs WHERE last_login >= current_date - INTERVAL '5 days' order by last_login desc limit 50;`)
                res.status(200).json({ log_list: log_list.rows })
            }
        } catch (error) {
            res.status(500).json({ error: 'Error in fetching the logs' })
        }

    } else {
        logger.error(
            `[${req.method} ${req.url}] - Authorization missing`
        )
        res.status(403).json({ error: 'Authorization missing' });
    }
}