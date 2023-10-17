import { NextApiRequest, NextApiResponse } from 'next';
import { DBCONNECT } from '../../shared/database';
import { createAccessToken } from '@/shared/jwt-token';
import { decrypt, encrypt } from '@/shared/crypto';
/**
 * Handles login requests.
 * @param req - The HTTP request object.
 * @param res - The HTTP response object.
 * @returns A JSON response indicating whether the login was successful or not.
 */
import { logger } from '@/shared/logger';
export default async function handler(req: any, res: any) {
    const { username, password } = req.body;
    //@ts-ignore
    var decryptedPassword = await decrypt(password, process.env.CYPHERKEY)
    const query = `SELECT * FROM user_detail WHERE username='${username}' and password='${decryptedPassword}' and isactive=true`;
    logger.info(` [${req.method} ${req.url} ] Executing query to check user credentials: ${query}`);
    const result = await DBCONNECT(query);
    if (result.rows.length > 0) {
        if (result.rows[0].username == username) {
            const token = createAccessToken(username)
            const update_log = await DBCONNECT(`insert into user_logs (user_id,last_login) values(${result.rows[0].id},NOW())`);
            //@ts-ignore
            const enckey = encrypt(process.env.APP_KEY ? process.env.APP_KEY : "", process.env.CYPHERKEY)
            res.status(200).json({ message: 'Login Successful', token: token + ' ' + enckey, isAdmin: result.rows[0].isadmin, isSuperAdmin: result.rows[0].issuperadmin, isUser: result.rows[0].isuser, id: result.rows[0].id });
        } else {
            logger.error(`[${req.method} ${req.url} ] Invalid Credentials`)
            res.status(500).json({ message: 'Invalid Credentials' });
        }
    } else {
        logger.error(`[${req.method} ${req.url} ] Invalid Credentials`)
        res.status(500).json({ message: 'Invalid Credentials' });
    }
}

