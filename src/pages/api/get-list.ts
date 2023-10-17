// Path: src/pages/api/get-list.js
import AWS from 'aws-sdk';
import { NextApiRequest, NextApiResponse } from 'next';
import * as utils from '../../shared/aws-config';
import { verify } from 'jsonwebtoken'
import { decrypt, encrypt } from '@/shared/crypto';
import { logger } from '@/shared/logger';
import { DBCONNECT } from '@/shared/database';


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
    const id: any = request.headers['id'];
    if (authorization) {

        if (authorization !== process.env.APP_KEY) {
            if (authorization.split(" ")[1]) {
                //@ts-ignore
                var deckey = decrypt(authorization.split(" ")[1], process.env.CYPHERKEY)
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
            if (type == "EC2") {


                if (id) {
                    const role = await DBCONNECT(`select isadmin,issuperadmin,isuser from user_detail where id=${id}`);

                    if (role.rows.length > 0) {
                        var instanceList: any = [];
                        if (role.rows[0].issuperadmin) {

                            const list = await DBCONNECT('SELECT * from ec2_instances');
                            if (list.rows.length > 0) {
                                // list.rows.forEach((instance: any) => {
                                for (const instance of list.rows) {
                                    if (instance.project_id) {
                                        const search = await DBCONNECT(`Select project_name from projects where id=${instance.project_id}`);
                                        if (search.rows.length > 0) {
                                            instance.project_name = search.rows[0].project_name;
                                        }
                                    }
                                    instanceList.push({
                                        id: instance.id,
                                        name: instance.name,
                                        state: instance.status,
                                        isstopped: instance.isstopped,
                                        publicIp: instance.public_ip,
                                        privateIp: instance.privateip,
                                        is_mapped: instance.is_mapped,
                                        project_name: instance.project_name ? instance.project_name : "",
                                        state_changed_date: instance.state_changed_date ? instance.state_changed_date : ""
                                    });
                                };
                            }
                            response.status(200).json({ instanceList });
                        }
                        if (role.rows[0].isadmin) {
                            const listofProject = await DBCONNECT(`Select * from users_projects where user_id=${id}`);
                            if (listofProject.rows.length > 0) {
                                for (const project of listofProject.rows) {
                                    const search = await DBCONNECT(`Select project_name from projects where id=${project.project_id}`);
                                    const ec2_list = await DBCONNECT(`Select * from ec2_instances where project_id=${project.project_id}`);
                                    if (ec2_list.rows.length > 0) {
                                        ec2_list.rows.forEach((item: any) => {
                                            instanceList.push({
                                                id: item.id,
                                                name: item.name,
                                                state: item.status,
                                                isstopped: item.isstopped,
                                                publicIp: item.public_ip,
                                                privateIp: item.privateip,
                                                is_mapped: item.is_mapped,
                                                project_name: search.rows[0].project_name ? search.rows[0].project_name : "",
                                                state_changed_date: item.state_changed_date ? item.state_changed_date : ""
                                            });
                                        })
                                    }
                                }
                            }
                            response.status(200).json({ instanceList });
                        }
                        if (role.rows[0].isuser) {
                            const listofProject = await DBCONNECT(`Select * from users_ec2 where user_id=${id}`);
                            if (listofProject.rows.length > 0) {
                                for (const project of listofProject.rows) {
                                    const ec2_list = await DBCONNECT(`Select * from ec2_instances where id='${project.instance_id}'`);
                                    if (ec2_list.rows.length > 0) {
                                        for (const item of ec2_list.rows) {
                                            if (item.project_id) {

                                                const search = await DBCONNECT(`Select project_name from projects where id=${item.project_id}`);

                                                instanceList.push({
                                                    id: item.id,
                                                    name: item.name,
                                                    state: item.status,
                                                    isstopped: item.isstopped,
                                                    publicIp: item.public_ip,
                                                    privateIp: item.privateip,
                                                    is_mapped: item.is_mapped,
                                                    project_name: search.rows[0].project_name ? search.rows[0].project_name : "",
                                                    state_changed_date: item.state_changed_date ? item.state_changed_date : ""
                                                });
                                            }
                                        }
                                    }
                                }

                            }
                            response.status(200).json({ instanceList });
                        }
                    }
                }
            } else if (type == "RDS") {
                if (id) {
                    const role = await DBCONNECT(`select isadmin,issuperadmin,isuser from user_detail where id=${id}`);
                    if (role.rows.length > 0) {
                        var instanceList: any = [];
                        if (role.rows[0].issuperadmin) {


                            const list = await DBCONNECT('SELECT * from rds_identifiers');
                            if (list.rows.length > 0) {
                                for (const instance of list.rows) {
                                    if (instance.project_id) {
                                        const search = await DBCONNECT(`Select project_name from projects where id=${instance.project_id}`);
                                        if (search.rows.length > 0) {
                                            instance.project_name = search.rows[0].project_name;
                                        }
                                    }
                                    instanceList.push({
                                        id: instance.id,
                                        name: instance.name,
                                        state: instance.status,
                                        isstopped: instance.isstopped,
                                        publicIp: instance.public_ip,
                                        privateIp: instance.privateip,
                                        is_mapped: instance.is_mapped,
                                        project_name: instance.project_name ? instance.project_name : "",

                                        state_changed_date: instance.state_changed_date ? instance.state_changed_date : ""
                                    });
                                };
                            }
                            response.status(200).json({ instanceList });
                        }
                        if (role.rows[0].isadmin) {
                            const listofProject = await DBCONNECT(`Select * from users_projects where user_id=${id}`);
                            if (listofProject.rows.length > 0) {
                                for (const project of listofProject.rows) {
                                    const search = await DBCONNECT(`Select project_name from projects where id=${project.project_id}`);

                                    const ec2_list = await DBCONNECT(`Select * from rds_identifiers where project_id=${project.project_id}`);
                                    if (ec2_list.rows.length > 0) {
                                        ec2_list.rows.forEach((item: any) => {
                                            instanceList.push({
                                                id: item.id,
                                                name: item.name,
                                                state: item.status,
                                                isstopped: item.isstopped,
                                                publicIp: item.public_ip,
                                                privateIp: item.privateip,
                                                is_mapped: item.is_mapped,
                                                project_name: search.rows[0].project_name ? search.rows[0].project_name : "",
                                                state_changed_date: item.state_changed_date ? item.state_changed_date : ""
                                            });
                                        })
                                    }
                                }
                            }

                            response.status(200).json({ instanceList });
                        }
                        if (role.rows[0].isuser) {
                            const listofProject = await DBCONNECT(`Select * from users_rds where user_id=${id}`);
                            if (listofProject.rows.length > 0) {
                                for (const project of listofProject.rows) {
                                    const ec2_list = await DBCONNECT(`Select * from rds_identifiers where id='${project.identifier_id}'`);
                                    if (ec2_list.rows.length > 0) {
                                        for (const item of ec2_list.rows) {
                                            if (item.project_id) {
                                                const search = await DBCONNECT(`Select project_name from projects where id=${item.project_id}`);

                                                instanceList.push({
                                                    id: item.id,
                                                    name: item.name,
                                                    state: item.status,
                                                    isstopped: item.isstopped,
                                                    publicIp: item.public_ip,
                                                    privateIp: item.privateip,
                                                    is_mapped: item.is_mapped,
                                                    project_name: search.rows[0].project_name ? search.rows[0].project_name : "",
                                                    state_changed_date: item.state_changed_date ? item.state_changed_date : ""
                                                });
                                            }

                                        }
                                    }
                                }
                            }

                            response.status(200).json({ instanceList });
                        }
                    }
                }
            } else if (type == "VM") {
                if (id) {
                    const role = await DBCONNECT(`select isadmin,issuperadmin,isuser from user_detail where id=${id}`);
                    if (role.rows.length > 0) {
                        var instanceList: any = [];
                        if (role.rows[0].issuperadmin) {


                            const list = await DBCONNECT('SELECT * from vm_instances');
                            if (list.rows.length > 0) {
                                for (const instance of list.rows) {
                                    if (instance.project_id) {
                                        const search = await DBCONNECT(`Select project_name from projects where id=${instance.project_id}`);
                                        if (search.rows.length > 0) {
                                            instance.project_name = search.rows[0].project_name;
                                        }
                                    }
                                    instanceList.push({
                                        id: instance.id,
                                        name: instance.name,
                                        state: instance.status,
                                        isstopped: instance.isstopped,
                                        privateIp: instance.privateip,
                                        is_mapped: instance.is_mapped,
                                        project_name: instance.project_name ? instance.project_name : "",

                                        state_changed_date: instance.state_changed_date ? instance.state_changed_date : ""
                                    });
                                };
                            }
                            response.status(200).json({ instanceList });
                        }
                        if (role.rows[0].isadmin) {
                            const listofProject = await DBCONNECT(`Select * from users_projects where user_id=${id}`);
                            if (listofProject.rows.length > 0) {
                                for (const project of listofProject.rows) {
                                    const search = await DBCONNECT(`Select project_name from projects where id=${project.project_id}`);

                                    const ec2_list = await DBCONNECT(`Select * from vm_instances where project_id=${project.project_id}`);
                                    if (ec2_list.rows.length > 0) {
                                        ec2_list.rows.forEach((item: any) => {
                                            instanceList.push({
                                                id: item.id,
                                                name: item.name,
                                                state: item.status,
                                                isstopped: item.isstopped,
                                                publicIp: item.public_ip,
                                                privateIp: item.privateip,
                                                is_mapped: item.is_mapped,
                                                project_name: search.rows[0].project_name ? search.rows[0].project_name : "",
                                                state_changed_date: item.state_changed_date ? item.state_changed_date : ""
                                            });
                                        })
                                    }
                                }
                            }

                            response.status(200).json({ instanceList });
                        }
                        if (role.rows[0].isuser) {
                            const listofProject = await DBCONNECT(`Select * from users_vm where user_id=${id}`);
                            console.log("project list............", listofProject.rows);
                            if (listofProject.rows.length > 0) {
                                for (const project of listofProject.rows) {
                                    const ec2_list = await DBCONNECT(`Select * from vm_instances where id='${project.instance_id}'`);
                                    if (ec2_list.rows.length > 0) {
                                        for (const item of ec2_list.rows) {
                                            if (item.project_id) {

                                                const search = await DBCONNECT(`Select project_name from projects where id=${item.project_id}`);

                                                instanceList.push({
                                                    id: item.id,
                                                    name: item.name,
                                                    state: item.status,
                                                    isstopped: item.isstopped,
                                                    publicIp: item.public_ip,
                                                    privateIp: item.privateip,
                                                    is_mapped: item.is_mapped,
                                                    project_name: search.rows[0].project_name ? search.rows[0].project_name : "",
                                                    state_changed_date: item.state_changed_date ? item.state_changed_date : ""
                                                });
                                            }
                                        }
                                    }
                                }
                            }

                            response.status(200).json({ instanceList });
                        }
                    }
                }
            } else {

            }

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
