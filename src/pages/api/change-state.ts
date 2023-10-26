import AWS from 'aws-sdk';
import { NextApiRequest, NextApiResponse } from 'next';
import * as utils from '../../shared/aws-config'
import { decrypt } from '@/shared/crypto';
import { logger } from '@/shared/logger';
import { DBCONNECT } from '@/shared/database';
import * as gcp from "../../shared/gcp-config";

import { google } from 'googleapis'
const compute = google.compute('v1');


/**
 * Changes the state of an EC2 instance or RDS database based on the provided action and type.
 * @param req - The Next.js API request object.
 * @param res - The Next.js API response object.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    logger.debug(`[${req.method} ${req.url}] Request received with headers: ${JSON.stringify(req.headers)}`);
    var instanceId: any = req.headers['instance_id'] ? req.headers['instance_id'] : "";
    const action = req.headers['state'];
    const type = req.headers['type'];
    const authorization: any = req.headers['authorization'];
    const userID: any = req.headers['userid']
    if (authorization) {
        if (authorization !== process.env.APP_KEY) {
            if (authorization.split(" ")[1]) {
                //@ts-ignore
                var deckey = decrypt(authorization.split(" ")[1], process.env.CYPHERKEY)
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
            const username = await DBCONNECT(`select username from user_detail where id=${userID}`)
            if (type == "EC2") {
                if (action == 'stop') {
                    await utils.ec2.stopInstances({ InstanceIds: [instanceId] }).promise();
                    const result = await DBCONNECT(`Update ec2_instances set isstopped=true,status='stopped',state_changed_date=NOW() where id='${instanceId}' returning name;`)
                    const update_log = await DBCONNECT(`insert into user_action_logs (user_id,action,log_time,user_name) values(${userID},'stopped AWS EC2-instance "${result.rows[0].name}" with id ${instanceId}',NOW(),'${username.rows[0].username}')`);
                    logger.info(`Instance ${instanceId} stopped successfully.`);
                    res.status(200).json({ message: `Instance ${instanceId} stopped successfully.` });
                } else if (action == "start") {

                    await utils.ec2.startInstances({ InstanceIds: [instanceId] }).promise();
                    const result = await DBCONNECT(`Update ec2_instances set isstopped=false,status='running',state_changed_date=NOW() where id='${instanceId}' returning name;`)
                    const update_log = await DBCONNECT(`insert into user_action_logs (user_id,action,log_time,user_name) values(${userID},'started AWS EC2-instance "${result.rows[0].name}" with id ${instanceId}',NOW(),'${username.rows[0].username}')`);
                    logger.info(`Instance ${instanceId} initiated successfully.`);
                    res.status(200).json({ message: `Instance ${instanceId} initiated successfully.` });
                } else {
                    logger.error(`[${req.method} ${req.url}] Invalid Action`);
                    res.status(500).json({ message: 'Invalid Action' });
                }
            }
            else if (type == "RDS") {
                //@ts-ignore
                if (action == 'stop') {
                    await utils.rds.stopDBInstance({ DBInstanceIdentifier: instanceId }).promise();
                    const result = await DBCONNECT(`Update rds_identifiers set isstopped=true,status='stopped',state_changed_date=NOW() where id='${instanceId}' returning name;`)
                    const update_log = await DBCONNECT(`insert into user_action_logs (user_id,action,log_time,user_name) values(${userID},'stopped AWS RDS-identifier "${result.rows[0].name}" with id ${instanceId}',NOW(),'${username.rows[0].username}')`);
                    logger.info(`RDS ${instanceId} stopped successfully.`);
                    res.status(200).json({ message: `RDS - ${instanceId} stopped successfully.` });
                } else if (action == "start") {

                    await utils.rds.startDBInstance({ DBInstanceIdentifier: instanceId }).promise();
                    const result = await DBCONNECT(`Update rds_identifiers set isstopped=false,status='available',state_changed_date=NOW() where id='${instanceId}' returning name;`)
                    const update_log = await DBCONNECT(`insert into user_action_logs (user_id,action,log_time,user_name) values(${userID},'started AWS RDS-identifier "${result.rows[0].name}" with id ${instanceId}',NOW(),'${username.rows[0].username}')`);
                    logger.info(`RDS ${instanceId} initiated successfully.`);
                    res.status(200).json({ message: `RDS - ${instanceId} initiated successfully.` });
                } else {
                    logger.error(`[${req.method} ${req.url}] Invalid Action`);
                    res.status(500).json({ message: 'Invalid Action' });
                }
            } else if (type == "VM") {
                if (action == 'stop') {

                    var token = await gcp.jwtClient.authorize();
                    var headers: any = {
                        project: 'kcube-ai', // Replace with your GCP project ID
                        zone: 'us-west1-b', // Replace with your desired zone
                        access_token: token?.access_token,
                        instance: instanceId
                    }
                    const response = await compute.instances.stop(headers);
                    if (response.status == 200) {
                        const result = await DBCONNECT(`Update vm_instances set isstopped=true,status='TERMINATED',state_changed_date=NOW() where id='${instanceId}' returning name;`)
                        const update_log = await DBCONNECT(`insert into user_action_logs (user_id,action,log_time,user_name) values(${userID},'stopped GCP VM-instance "${result.rows[0].name}" with id ${instanceId}',NOW(),'${username.rows[0].username}')`);
                        logger.info(`VM ${instanceId} stopped successfully.`);
                        res.status(200).json({ message: `VM - ${instanceId} stopped successfully.` });
                    }
                } else if (action == "start") {

                    var token = await gcp.jwtClient.authorize();
                    var headers: any = {
                        project: 'kcube-ai', // Replace with your GCP project ID
                        zone: 'us-west1-b', // Replace with your desired zone
                        access_token: token?.access_token,
                        instance: instanceId
                    }
                    const response = await compute.instances.start(headers);
                    if (response.status == 200) {
                        const result = await DBCONNECT(`Update vm_instances set isstopped=false,status='RUNNING',state_changed_date=NOW() where id='${instanceId}' returning name;`)
                        const update_log = await DBCONNECT(`insert into user_action_logs (user_id,action,log_time,user_name) values(${userID},'started GCP VM-instance "${result.rows[0].name}" with id ${instanceId}',NOW(),'${username.rows[0].username}')`);
                        logger.info(`RDS ${instanceId} initiated successfully.`);
                        res.status(200).json({ message: `RDS - ${instanceId} initiated successfully.` });
                    }
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
