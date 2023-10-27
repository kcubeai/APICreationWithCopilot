import { NextApiRequest, NextApiResponse } from 'next';
import { DBCONNECT } from '../../shared/database';
import { decrypt } from '@/shared/crypto';
import { logger } from '@/shared/logger';

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

        try{

            

        }

    catch (error) {
        logger.error(
            `[${req.method} ${req.url}] - Issue is adding new User ${error}`
        )
        res.status(500).json({ message: 'Issue is adding new User', error: error })
    }
}
        else {
        logger.error(
            `[${req.method} ${req.url}] - Authorization missing`
        )
        res.status(403).json({ error: 'Authorization missing' });
    }
}

