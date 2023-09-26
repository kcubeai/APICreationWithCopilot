// write a function to update the AWS config using access key id and secret key id
// Path: shared/aws-config.ts
import AWS from 'aws-sdk';
import { NextApiRequest, NextApiResponse } from 'next';
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});
// // Create an EC2 and RDS client
export const ec2 = new AWS.EC2();
export const rds = new AWS.RDS();
