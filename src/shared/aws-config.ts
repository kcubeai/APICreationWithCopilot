// write a function to update the AWS config using access key id and secret key id
// Path: shared/aws-config.ts
import AWS from 'aws-sdk';
import { NextApiRequest, NextApiResponse } from 'next';
import { DBCONNECT } from '../shared/database';
import { Credentials } from 'aws-sdk';

// (async () => {
    const updateAWSConfig = async () => {
        const aws_key_id_query = await DBCONNECT('select access_key_id from public.aws_configuration');
        const aws_key_id:string = aws_key_id_query.rows[0].access_key_id;

        const secret_access_key_query = await DBCONNECT('select secret_access_key from public.aws_configuration');
       const secret_access_key:string = secret_access_key_query.rows[0].secret_access_key;
        // console.log('keyvalue',aws_key_id, secret_access_key);
        AWS.config.update({
            accessKeyId: aws_key_id,
            secretAccessKey: secret_access_key,
            region: process.env.AWS_REGION,
        });
    };

    // updateAWSConfig();

    // const credentials = AWS.config.credentials as AWS.Credentials;

    // if (credentials) {
    //   credentials.refresh((err) => {
    //     if (err) {
    //       console.error('Error refreshing credentials:', err);
    //     } else {
    //       console.log('Credentials refreshed successfully');
    //     }
    //   });
    // } else {
    //   console.error('Credentials object is null or undefined');
    // }


      updateAWSConfig();
// })();
// // Create an EC2 and RDS client
export const ec2 = new AWS.EC2();
export const rds = new AWS.RDS();
