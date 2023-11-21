import { NextApiRequest, NextApiResponse } from "next";
import * as utils from '../../shared/aws-config';
import { DBCONNECT } from "@/shared/database";
import * as gcp from "../../shared/gcp-config";

import { google } from 'googleapis'
const compute = google.compute('v1');
const sqladmin = google.sqladmin('v1beta4')
export default async function getRDSInstanceListandSaveitinDB(request: NextApiRequest, response: NextApiResponse) {
    try {
        const ec2Instances = await utils.ec2.describeInstances().promise();
          console.log('testtttttttt',utils)     
        // const terminatedinstances = await utils.ec2.describeInstances({ Filters: [{ Name: 'instance-state-name', Values: ['terminated'] }] }).promise();
        // console.log(terminatedinstances, ec2Instances)
        if (ec2Instances && ec2Instances.Reservations && ec2Instances.Reservations.length > 0) {

            for (const reservation of ec2Instances.Reservations) {
                if (reservation.Instances && reservation.Instances.length > 0) {
                    for (const instance of reservation.Instances) {
                        // console.log('instances', instance)
                        const nametag = instance.Tags?.find(tag => tag.Key === "Name");
                        // console.log("instances.......",nametag?.Value);
                        const isavail = await DBCONNECT(`Select * from public.ec2_instances where id='${instance.InstanceId}'`);
                        if (isavail.rows.length == 0) {
                            //@ts-ignore
                            var status = instance.State.Name?.includes('stop') ? true : false;
                            const insert = await DBCONNECT(`INSERT INTO public.ec2_instances (id, name, type,  privateIp, public_ip,status, isstopped) VALUES ('${instance.InstanceId}','${nametag?.Value}','${instance.InstanceType}','${instance.PrivateIpAddress}','${instance.PublicIpAddress}','${instance.State?.Name}',${status})`)
                        } else {
                            //@ts-ignore
                            // if (instance.State.Name?.includes('terminated')) {
                            //     //@ts-ignore
                            //     const insert = await DBCONNECT(`UPDATE public.ec2_instances SET project_id=null, is_mapped=${isavail.rows[0].is_mapped}, isstopped=true, privateIp='${instance.PrivateIpAddress}', public_ip='${instance.PublicIpAddress}',status='${instance.State.Name}' where id='${instance.InstanceId}'`)

                            // } else {
                            //@ts-ignore
                            var status = instance.State.Name?.includes('stop') ? true : false;
                            const nametag = instance.Tags?.find(tag => tag.Key === "Name");
                            // console.log("instances.update......",nametag?.Value);
                            //@ts-ignore
                            
                            const insert = await DBCONNECT(`UPDATE public.ec2_instances SET  isstopped=${status}, name='${nametag?.Value}', privateIp='${instance.PrivateIpAddress}', public_ip='${instance.PublicIpAddress}',status='${instance.State.Name}',type='${instance.InstanceType}' where id='${instance.InstanceId}'`)

                            // }

                        }
                    };
                }
            };
        }
        const rdsInstances = await utils.rds.describeDBInstances().promise();
        // const terminatedIdentifiers = await utils.rds.describeDBInstances({ Filters: [{ Name: 'db-instance-status', Values: ['deleted'] }] }).promise();
        // console.log(terminatedIdentifiers)
        if (rdsInstances && rdsInstances.DBInstances && rdsInstances.DBInstances.length > 0) {

            for (const instance of rdsInstances.DBInstances) {
                const isavail = await DBCONNECT(`Select * from public.rds_identifiers where id='${instance.DBInstanceIdentifier}'`);
                if (isavail.rows.length == 0) {
                    //@ts-ignore
                    var status = instance.DBInstanceStatus?.includes('stop') ? true : false;
                    const insert = await DBCONNECT(`INSERT INTO public.rds_identifiers (id, name,  privateIp, public_ip,status, isstopped, type) VALUES ('${instance.DBInstanceIdentifier}','${instance.DBInstanceIdentifier}','${instance.DBInstanceArn}','${instance.Endpoint?.Address}','${instance.DBInstanceStatus}',${status}, '${instance.DBInstanceClass}')`)
                } else {
                    // if (instance.DBInstanceStatus?.includes('delet')) {
                    //     //@ts-ignore
                    //     const insert = await DBCONNECT(`UPDATE public.rds_identifiers SET project_id=null, is_mapped=${isavail.rows[0].is_mapped}, isstopped=true, privateIp='${instance.DBInstanceArn}', public_ip='${instance.Endpoint?.Address}',status='${instance.DBInstanceStatus}' where id='${instance.DBInstanceIdentifier}'`)

                    // } else {
                    //@ts-ignore
                    var status = instance.DBInstanceStatus?.includes('stop') ? true : false;
                    const insert = await DBCONNECT(`UPDATE public.rds_identifiers SET  isstopped=${status}, privateIp='${instance.DBInstanceArn}', public_ip='${instance.Endpoint?.Address}',status='${instance.DBInstanceStatus}',type='${instance.DBInstanceClass}' where id='${instance.DBInstanceIdentifier}'`)
                    // }
                }
            }
        }
        const ec2instancesList = await DBCONNECT('Select * from ec2_instances');
        const rdsidentifierList = await DBCONNECT('Select * from rds_identifiers');
        var token = await gcp.jwtClient.authorize();
        var headers: any = {
            project: 'kcube-ai', // Replace with your GCP project ID
            zone: 'us-west1-b', // Replace with your desired zone
            access_token: token?.access_token
        }

        // to add vm list uncomment below and line 127
        // const vmList: any = await compute.instances.list(headers).then();
        // if (vmList.status == 200) {
            
        //     if (vmList.data.items?.length > 0) {
        //         for (const instance of vmList.data.items) {
        //             // console.log('instance....',instance)
        //             const isavail = await DBCONNECT(`Select * from public.vm_instances where id='${instance.id}'`);
        //             // console.log(instance.networkInterfaces[0].networkIP)
        //             if (isavail.rows.length == 0) {
        //                 //@ts-ignore
        //                 var status = instance.status?.includes('RUNNING') ? false : true;
        //                 const insert = await DBCONNECT(`INSERT INTO public.vm_instances (id, name,  privateIp, status, isstopped) VALUES ('${instance.id}','${instance.name}','${instance.networkInterfaces[0].networkIP}','${instance.status}',${status})`)
        //             } else {
        //                 //@ts-ignore
        //                 var status = instance.status?.includes('RUNNING') ? false : true;
        //                 const insert = await DBCONNECT(`UPDATE public.vm_instances SET isstopped=${status}, privateIp='${instance.networkInterfaces[0].networkIP}',status='${instance.status}' where id='${instance.id}'`)

        //             }
        //         }
        //     }
        // }
        // const vm_instance_list: any = await DBCONNECT(`Select * from vm_instances`)
        // const sqlList:any = await sqladmin.instances.list(headers).then();
        // if (sqlList.status == 200) {
        //     if (sqlList.data.items?.length > 0) {
        //         for (const instance of sqlList.data.items) {
        //             const isavail = await DBCONNECT(`Select is_mapped from public.sql_instances where id='${instance.name}'`);
        //             console.log(instance.networkInterfaces[0].networkIP)
        //             if (isavail.rows.length == 0) {
        //                 //@ts-ignore
        //                 var status = instance.status?.includes('RUNNING') ? false : true;
        //                 const insert = await DBCONNECT(`INSERT INTO public.sql_instances (id, name, is_mapped, publicip, status, isstopped) VALUES ('${instance.name}','${instance.name}',false,'${instance.ipAddresses[0].ipAddress}','${instance.state}',${status})`)
        //             } else {
        //                 //@ts-ignore
        //                 var status = instance.status?.includes('RUNNING') ? false : true;
        //                 const insert = await DBCONNECT(`UPDATE public.sql_instances SET is_mapped=${isavail.rows[0].is_mapped}, isstopped=${status}, publicip='${instance.ipAddresses[0].ipAddress}',status='${instance.state}' where id='${instance.name}'`)

        //             }
        //         }
        //     }
        // }
        //@ts-ignore
        // , sqlList: sqlList.status == 200 ? sqlList.data.items : [] 
        response.status(200).json({ message: 'Sync successfully', instances: ec2Instances.Reservations[0].Instances, rds: rdsInstances.DBInstances, rds_identifiers: rdsidentifierList.rows, ec2_instance_list: ec2instancesList.rows, 
        // vmList: vm_instance_list.rows 
    })

    }
    catch (error) {
        console.log(error)
        response.status(500).json({ error: 'Sync error', message: error })
    }


}