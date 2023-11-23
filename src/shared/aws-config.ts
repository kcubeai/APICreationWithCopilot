// write a function to update the AWS config using access key id and secret key id
// Path: shared/aws-config.ts
import AWS from 'aws-sdk';
import { NextApiRequest, NextApiResponse } from 'next';
import { DBCONNECT } from '../shared/database';
import { Credentials } from 'aws-sdk';

// (async () => {
//     const updateAWSConfig = async () => {

        
//         try{
//         const aws_key_id_query = await DBCONNECT('select access_key_id from public.aws_configuration');
//         const aws_key_id:string = aws_key_id_query.rows[0].access_key_id;

//         const secret_access_key_query = await DBCONNECT('select secret_access_key from public.aws_configuration');
//        const secret_access_key:string = secret_access_key_query.rows[0].secret_access_key;
//         console.log('keyvalue',aws_key_id, secret_access_key);
//         AWS.config.update({
//             accessKeyId: aws_key_id,
//             secretAccessKey: secret_access_key,
//             region: process.env.AWS_REGION,
//         });
        
//         // await testAWSAuthentication();

//         console.log('AWS configuration updated successfully');
//     } catch (error: any) {
//         console.error('Error updating AWS configuration:', error.message);

      
//     }
// };
//     const testAWSAuthentication = async () => {
 
//         const ec2 = new AWS.EC2();
//         await ec2.describeInstances().promise();
//     };
    
// -----
     
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


    // changes--------------
    const updateAWSConfig = async () => {

        
        try{
        const aws_key_id_query = await DBCONNECT('select access_key_id from public.configuration where id=1');
        const aws_key_id:string = aws_key_id_query.rows[0].access_key_id;

        const secret_access_key_query = await DBCONNECT('select access_key from public.configuration where id=1');
       const secret_access_key:string = secret_access_key_query.rows[0].access_key;

       const region_query = await DBCONNECT('select region from public.configuration where id=1');
       const region:string = secret_access_key_query.rows[0].region;

        console.log('keyvalue',aws_key_id, secret_access_key);
        AWS.config.update({
            accessKeyId: aws_key_id,
            secretAccessKey: secret_access_key,
            region: region,
        });
        
        // await testAWSAuthentication();

        console.log('AWS configuration updated successfully');
    } catch (error: any) {
        console.error('Error updating AWS configuration:', error.message);

      
    }
};


      updateAWSConfig();
// })();
// // Create an EC2 and RDS client
export const ec2 = new AWS.EC2();
export const rds = new AWS.RDS();
