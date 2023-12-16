// write a function to update the AWS config using access key id and secret key id
// Path: shared/aws-config.ts
import AWS from 'aws-sdk';
import { NextApiRequest, NextApiResponse } from 'next';
import { DBCONNECT } from '../shared/database';
import { Credentials } from 'aws-sdk';


 const updateAWSConfig = async () => {

        
        try{
        const aws_key_id_query = await DBCONNECT('select access_key_id from public.configuration where id=1');
        const aws_key_id:string = aws_key_id_query.rows[0].access_key_id;

        const secret_access_key_query = await DBCONNECT('select access_key from public.configuration where id=1');
       const secret_access_key:string = secret_access_key_query.rows[0].access_key;

    //    const region_query = await DBCONNECT('select region from public.configuration where id=1');
    //    const region:string = region_query.rows[0].region;
    //    console.log('keyvalue',region);
        // console.log('keyvalue',aws_key_id, secret_access_key);

        const region = 'us-east-1';
        AWS.config.update({
            accessKeyId: aws_key_id,
            secretAccessKey: secret_access_key,
            region: region,
            
        });

        console.log('keyvalue1',region)
        
        // await testAWSAuthentication();

        console.log('AWS configuration updated successfully');
    } catch (error: any) {
        console.error('Error updating AWS configuration:', error.message);

      
    }
};


//       updateAWSConfig();
// // })();
// // // Create an EC2 and RDS client

const initializeAWS = async () => {
    try {
      await updateAWSConfig();
      // Create AWS service instances after updating the configuration
      const ec2 = new AWS.EC2();
      const rds = new AWS.RDS();
      
      // Export the 'ec2' and 'rds' instances
      return { ec2, rds };
    } catch (error:any) {
      console.error('Error initializing AWS:', error.message);
      // Handle initialization error
      throw error; // Rethrow the error if needed
    }
  };
  
  // Call the initialization function and export the instances
  const { ec2, rds } = await initializeAWS();
  export { ec2, rds };