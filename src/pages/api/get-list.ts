// Path: src/pages/api/get-list.js
import AWS from 'aws-sdk';
import { NextApiRequest, NextApiResponse } from 'next';
import * as utils from '../../shared/aws-config';
import { verify } from 'jsonwebtoken'
import { decrypt, encrypt } from '@/shared/crypto';
import { logger } from '@/shared/logger';


/**
 * Handler function to get a list of instances based on the type of instance (EC2 or RDS).
 * @param request - The HTTP request object.
 * @param response - The HTTP response object.
 * @returns A JSON object containing the list of instances.
 * @throws {Error} If there is an error with the request or the authorization token is invalid.
 */
export default async function handler(request: NextApiRequest, response: NextApiResponse) {
    logger.debug(`[${request.method} ${request.url} ] Request received`);
    const type = request.headers['type'];
    const authorization: any = request.headers['authorization'];
    if (authorization) {

        if (authorization !== process.env.APP_KEY) {
            if (authorization.split(" ")[1]) {
                var deckey = decrypt(authorization.split(" ")[1])
                if (deckey !== process.env.APP_KEY) {
                    logger.error(`[${request.method} ${request.url} ] Unauthorized Token`);
                    response.status(403).json({ error: 'Unauthorized Token' });
                    return;
                }
            } else {
                logger.error(`[${request.method} ${request.url} ] Unauthorized Token`);
                response.status(403).json({ error: 'Unauthorized Token' });
                return;
            }
        }
        try {
            var instanceList: any = [];
            if (type == "EC2") {

                const ec2Instances = await utils.ec2.describeInstances().promise();
                if (ec2Instances && ec2Instances.Reservations && ec2Instances.Reservations.length > 0) {

                    ec2Instances.Reservations.forEach((reservation: any) => {
                        reservation.Instances.forEach((instance: any) => {
                            instanceList.push({
                                id: instance.InstanceId,
                                name: instance.KeyName,
                                state: instance.State.Name,
                                region: instance.Placement.AvailabilityZone,
                                platform: instance.Platform,
                                publicIp: instance.PublicIpAddress,
                                privateIp: instance.PrivateIpAddress,
                                launchTime: instance.LaunchTime,
                            });
                        });
                    });
                }
            } else {
                const rdsInstances = await utils.rds.describeDBInstances().promise();
                if (rdsInstances && rdsInstances.DBInstances && rdsInstances.DBInstances.length > 0) {

                    rdsInstances.DBInstances.forEach((instance: any) => {
                        instanceList.push({
                            id: instance.DBInstanceIdentifier,
                            name: instance.DBName,
                            state: instance.DBInstanceStatus,
                            region: instance.AvailabilityZone,
                            platform: instance.Engine,
                            publicIp: instance.Endpoint.Address,
                            privateIp: instance.DBInstanceArn,
                            launchTime: instance.InstanceCreateTime,
                        });
                    });
                }
            }

            response.status(200).json({ instanceList });
            logger.debug(`[${request.method} ${request.url} ] Request successful`);
        } catch (error: any) {
            if (error.statusCode == 403) {
                logger.error(`[${request.method} ${request.url} ] Unauthorized Action`);
                response.status(403).json({ error: 'Unauthorized Action' });
            } else {
                logger.error(`[${request.method} ${request.url} ] Internal Server Error`);
                response.status(500).json({ error: 'Internal Server Error' });
            }
        }
    } else {
        logger.error(`[${request.method} ${request.url} ] Authorization missing`);
        response.status(403).json({ error: 'Authorization missing' });
    }
}
