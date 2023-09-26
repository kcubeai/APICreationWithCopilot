import AWS from 'aws-sdk';
import { NextApiRequest, NextApiResponse } from 'next';
import * as utils from '../../shared/aws-config'
import { decrypt } from '@/shared/crypto';
import { logger } from '@/shared/logger';


/**
 * Changes the state of an EC2 instance or RDS database based on the provided action and type.
 * @param req - The Next.js API request object.
 * @param res - The Next.js API response object.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    logger.debug(`[${req.method} ${req.url}] Request received with headers: ${JSON.stringify(req.headers)}`);
    var instanceId: any = req.headers['instance_id'] ? req.headers['instance_id'] : "";
    const action = req.headers['action'];
    const type = req.headers['type'];
    const authorization: any = req.headers['authorization'];
    if (authorization) {
        if (authorization !== process.env.APP_KEY) {
            if (authorization.split(" ")[1]) {
                var deckey = decrypt(authorization.split(" ")[1])
                if (deckey !== process.env.APP_KEY) {
                    logger.error(`[${req.method} ${req.url}] Unauthorized Token`);
                    res.status(403).json({ error: 'Unauthorized Token' });
                    return;
                }
            } else {
                logger.error(`[${req.method} ${req.url}] Unauthorized Token`);
                res.status(403).json({ error: 'Unauthorized Token' });
                return;
            }
        }
        try {

            if (type == "EC2") {
                if (action == 'stop') {
                    await utils.ec2.stopInstances({ InstanceIds: [instanceId] }).promise();
                    logger.info(`Instance ${instanceId} stopped successfully.`);
                    res.status(200).json({ message: `Instance stopped successfully.` });
                } else if (action == "start") {

                    await utils.ec2.startInstances({ InstanceIds: [instanceId] }).promise();
                    logger.info(`Instance ${instanceId} initiated successfully.`);
                    res.status(200).json({ message: `Instance ${instanceId} initiated successfully.` });
                } else {
                    logger.error(`[${req.method} ${req.url}] Invalid Action`);
                    res.status(500).json({ message: 'Invalid Action' });
                }
            }
            else {
                //@ts-ignore
                if (action == 'stop') {
                    await utils.rds.stopDBInstance({ DBInstanceIdentifier: instanceId }).promise();
                    logger.info(`RDS ${instanceId} stopped successfully.`);
                    res.status(200).json({ message: `RDS stopped successfully.` });
                } else if (action == "start") {

                    await utils.rds.startDBInstance({ DBInstanceIdentifier: instanceId }).promise();
                    logger.info(`RDS ${instanceId} initiated successfully.`);
                    res.status(200).json({ message: `RDS initiated successfully.` });
                } else {
                    logger.error(`[${req.method} ${req.url}] Invalid Action`);
                    res.status(500).json({ message: 'Invalid Action' });
                }
            }

        } catch (error: any) {
            console.log(error)
            if (error.statusCode == 403) {
                logger.error(`[${req.method} ${req.url}] Unauthorized Action`);
                res.status(403).json({ error: 'Unauthorized Action' });
            } else if (error.statusCode == 400) {
                logger.error(`[${req.method} ${req.url}] Invalid instance Id`);
                res.status(400).json({ error: 'Invalid instance Id' });
            } else {
                logger.error(`[${req.method} ${req.url}] Internal Server Error`);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        }
    }
    else {
        logger.error(`[${req.method} ${req.url}] Authorization missing`);
        res.status(403).json({ error: 'Authorization missing' });
    }
};
