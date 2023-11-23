// pages/api/update-username.js
import { NextApiRequest, NextApiResponse } from "next";
import fs from 'fs';
import { logger } from '@/shared/logger';
import { decrypt } from '@/shared/crypto';
import { DBCONNECT } from "@/shared/database";

import { Console } from "console";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authorization: any = req.headers['authorization'];
  const action = req.headers['action'];
  if (authorization) {
    if (authorization !== process.env.APP_KEY) {
        if (authorization.split(" ")[1]) {
            //@ts-ignore
            var deckey = decrypt(authorization.split(" ")[1], process.env.CYPHERKEY)
            if (deckey !== process.env.APP_KEY) {
                logger.error(
                    `[${req.method} ${req.url}] - Unauthorized Token`
                )
                res.status(403).json({ error: 'Unauthorized Token' });
                return;
            }
        } else {
            logger.error(
                `[${req.method} ${req.url}] - Unauthorized Token`
            )
            res.status(403).json({ error: 'Unauthorized Token' });
            return;
        }
    }

          if (req.method === 'POST') {
            try {

              if (req.body.awsaccessid && req.body.awskey) {
                const userID= req.body.userID;
                console.log('userID',userID);
                const username_query = await DBCONNECT(`select username from user_detail where id=${userID}`);
                const username = username_query.rows[0].username;
                console.log('username',username);
                // const existing_value = await DBCONNECT('select access_key_id,secret_access_key from public.aws_configuration');
                const existing_value = await DBCONNECT('select access_key_id,access_key from public.configuration where id =1');
                const existing_key_id = existing_value.rows[0].access_key_id;
                const existing_secret_access_key = existing_value.rows[0].secret_access_key;
                // const existing_secret_access_key = await DBCONNECT('select secret_access_key from public.aws_configuration');
                // const previous_key_id = await DBCONNECT(`UPDATE public.aws_configuration  SET previous_access_key_id ='${existing_key_id}' , previous_secret_access_key = '${existing_secret_access_key}' `);
                const previous_key_id = await DBCONNECT(`UPDATE public.configuration  SET previous_access_key_id ='${existing_key_id}' , previous_access_key = '${existing_secret_access_key}' WHERE id=1`);

                // const previous_secret_access_key = await DBCONNECT(`UPDATE public.aws_configuration SET PREVIOUS_access_key_id= '${existing_secret_access_key}'`);
        
                // const update_key = await DBCONNECT(`UPDATE public.aws_configuration  SET access_key_id ='${req.body.awsaccessid}' , secret_access_key='${req.body.awskey}', updated_on=NOW()`);
                const update_key = await DBCONNECT(`UPDATE public.configuration  SET access_key_id ='${req.body.awsaccessid}' , access_key='${req.body.awskey}', updated_on=NOW() WHERE id=1 `);
                const update_log = await DBCONNECT(`insert into user_action_logs (user_id,action,log_time,user_name) values('${userID}','aws access key and the secret key has been updated',NOW(),'${username}')`);
              

              
              }

// GCP Credentials update
                  if (req.body.gcpkey && req.body.email) {
                    const userID= req.body.userID;
                    console.log('userID',userID);
                    const username_query = await DBCONNECT(`select username from user_detail where id=${userID}`);
                    const username = username_query.rows[0].username;
                 
                    // const existing_value = await DBCONNECT('select access_key_id,secret_access_key from public.aws_configuration');
                    const existing_value = await DBCONNECT('SELECT access_key, email from public.configuration where id =2');
                    const existing_key = existing_value.rows[0].access_key;
                    const existing_email = existing_value.rows[0].email;
                    // const existing_secret_access_key = await DBCONNECT('select secret_access_key from public.aws_configuration');
                    // const previous_key_id = await DBCONNECT(`UPDATE public.aws_configuration  SET previous_access_key_id ='${existing_key_id}' , previous_secret_access_key = '${existing_secret_access_key}' `);
                    const previous_key_id = await DBCONNECT(`UPDATE public.configuration  SET previous_access_key ='${existing_key}' , previous_email = '${existing_email}' WHERE id=2`);
    
                    // const previous_secret_access_key = await DBCONNECT(`UPDATE public.aws_configuration SET PREVIOUS_access_key_id= '${existing_secret_access_key}'`);
            
                    // const update_key = await DBCONNECT(`UPDATE public.aws_configuration  SET access_key_id ='${req.body.awsaccessid}' , secret_access_key='${req.body.awskey}', updated_on=NOW()`);
                    const update_key = await DBCONNECT(`UPDATE public.configuration  SET access_key ='${req.body.gcpkey}' , email='${req.body.email}', updated_on=NOW() WHERE id=2 `);
                    const update_log = await DBCONNECT(`insert into user_action_logs (user_id,action,log_time,user_name) values('${userID}','gcp key and email has been updated',NOW(),'${username}')`);
                  
    
                  
                  }

        // Remove the unnecessary if statement
      
              // const envPath = './.env.local';
              // const currentEnv = fs.readFileSync(envPath, 'utf8');

              // let updatedEnv = currentEnv;

              // if (req.body.awsaccessid) {
              //   // Update USERNAME if provided
              //   // updatedEnv = updatedEnv.replace(/USERNAME=.*/, `USERNAME=${req.body.awsaccessid}`);
              //   updatedEnv = updatedEnv.replace(/AWS_ACCESS_KEY_ID = .*/, `AWS_ACCESS_KEY_ID =${req.body.awsaccessid}`);
            
              // }
              // if(req.body.awskey){
              //   // Update TOKEN if providedAWS_SECRET_ACCESS_KEY =
              //   // updatedEnv = updatedEnv.replace(/TOKEN=.*/, `TOKEN=${req.body.awskey}`);
              //   updatedEnv = updatedEnv.replace(/AWS_SECRET_ACCESS_KEY =.*/, `AWS_SECRET_ACCESS_KEY =${req.body.awskey}`);
              // }

              // if (req.body.gcpkey) {
              //   // Update TOKEN if provided
              //   updatedEnv = updatedEnv.replace(/GCP_PRIVATE_KEY =.*/, `GCP_PRIVATE_KEY =${req.body.gcpkey}`);
              // }

              // fs.writeFileSync(envPath, updatedEnv);

              res.status(200).json({ success: true, message: 'Credentials updated successfully!' });
            } catch (error) {
              console.error('Error updating credentials:', error);
              res.status(500).json({ success: false, message: 'Error updating credentials. Please try again.' });
            }
          } 
          
          if (action == 'get') {
            const server_detail = await DBCONNECT(`select id, name, access_key_id,access_key, email from public.configuration `);
            
            const servers = server_detail.rows.map((obj: any) => {
              return obj;
          });
          res.status(200).json({ status: 200, message: 'server_details',server_detail:servers});
          }
  
          else {
            res.status(405).json({ success: false, message: 'Method Not Allowed' });
          }

} else {
  logger.error(
      `[${req.method} ${req.url}] - Authorization missing`
  )
  res.status(403).json({ error: 'Authorization missing' });
}
}
