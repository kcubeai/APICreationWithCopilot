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
    const { username, password, email, mobile } = req.body;
    const authorization: any = req.headers['authorization'];
    logger.debug(`[${req.method} ${req.url}] - Authorization header: ${authorization}`);
    if (authorization) {
        if (authorization !== process.env.APP_KEY) {
            if (authorization.split(" ")[1]) {
                var deckey = decrypt(authorization.split(" ")[1])
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

        // var decryptedEmail = decrypt(email)
        // var decryptedMobile = decrypt(mobile)
        var decryptedEmail = email
        var decryptedMobile = mobile
        const query = `INSERT INTO users (username, password, created_date, mobile, email) VALUES ('${username}', '${password}', NOW(),'${decryptedMobile}','${decryptedEmail}')`;
        logger.debug(`[${req.method} ${req.url}] - Query: ${query}`);
        const result = await DBCONNECT(query);
        if (result) {
            logger.info('User Added Successfully');
            res.status(200).json({ message: 'User Added Successfully' });
        } else {
            logger.error(
                `[${req.method} ${req.url}] - Error in adding user`
            )
            res.status(500).json({ message: 'Error in adding user' });
        }
    } else {
        logger.error(
            `[${req.method} ${req.url}] - Authorization missing`
        )
        res.status(403).json({ error: 'Authorization missing' });
    }
}