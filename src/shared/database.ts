import { Client, Pool } from 'pg';
import { logger } from './logger';

export const DBCONNECT = async (query: string) => {
    const dbHost: any = new Client({
        host: process.env.HOST,
        port: Number(process.env.PORT),
        database: process.env.DB,
        user: process.env.USER,
        password: process.env.PASS,
    })

    dbHost.connect((error: any) => {
        if (error) {
            logger.error("Error in connecting db");
            console.log("Error in connecting db");
        }
        else {
            logger.info('connected');
            console.log('connected');
        }
    })

    setTimeout(() => {
        dbHost.end();
    }, 25000)

    const result = await dbHost.query(query)

    dbHost.end();

    logger.info('Query executed successfully');

    return result;
}