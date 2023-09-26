import { NextApiRequest, NextApiResponse } from 'next';
import { DBCONNECT } from '../../shared/database';
import { createAccessToken } from '@/shared/jwt-token';
import { encrypt } from '@/shared/crypto';
/**
 * Handles login requests.
 * @param req - The HTTP request object.
 * @param res - The HTTP response object.
 * @returns A JSON response indicating whether the login was successful or not.
 */
import { logger } from '@/shared/logger';
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { username, password } = req.body;
    const query = `SELECT * FROM users WHERE username='${username}' and password='${password}'`;
    logger.info(`Executing query to check user credentials: ${query}`);
    const result = await DBCONNECT(query);
    if (result.rows.length > 0) {
        if (result.rows[0].username == username) {
            const token = createAccessToken(username)
            /**
             * Encrypts the APP_KEY environment variable using the `encrypt` function.
             * If APP_KEY is not defined, an empty string is used instead.
             * @returns The encrypted key.
             */
            const enckey = encrypt(process.env.APP_KEY ? process.env.APP_KEY : "")
            res.status(200).json({ message: 'Login Successful', token: token + ' ' + enckey });
        } else {
            logger.error(`[${req.method} ${req.url} ] Invalid Credentials`)
            res.status(500).json({ message: 'Invalid Credentials' });
        }
    } else {
        logger.error(`[${req.method} ${req.url} ] Invalid Credentials`)
        res.status(500).json({ message: 'Invalid Credentials' });
    }
}