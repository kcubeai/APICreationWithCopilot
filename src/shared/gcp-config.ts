// import Compute from '@google-cloud/compute';
// import {auth} from 'google-auth-library';
// const instancesClient = new Compute.InstancesClient();

// export default async function vminstances() {
//     // const authClient = await auth.getClient({
//     //     keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
//     //     scopes: 'https://www.googleapis.com/auth/sqladmin',
//     // });
//     const aggListRequest = instancesClient.aggregatedListAsync({
//         project: 'kcube-ai',
//         maxResults: 5,

//     });

// }

import { google } from 'googleapis'
import serviceAccountKey from '../shared/utils/kcube-ai-acae742bd8eb.json';
import { DBCONNECT } from './database';


// export default async function gcpConfig() {

//     // jwtClient.authorize((err, tokens: any) => {
//     //     if (err) {
//     //         console.error('Authentication error:', err);
//     //         return;
//     //     }
//     //     console.log("tokens...........", tokens)

//     //     return tokens.access_token;
//     // });
//     jwtClient.authorize().then((response: any) => {
//         console.log("response...........", response)
//         return response;
//     }, (error: any) => {
//         console.log("error...........", error)
//         return error;
//     })

// }
// export const jwtClient = new google.auth.JWT({
//     email: serviceAccountKey.client_email,
//     key: serviceAccountKey.private_key,
//     scopes: ['https://www.googleapis.com/auth/cloud-platform'],
// });
// previous code


// export const jwtClient = new google.auth.JWT({
//     // email: serviceAccountKey.client_email,
//     // key: serviceAccountKey.private_key,
//     email: process.env.GCP_CLIENT_EMAIL,
//     key:process.env.GCP_PRIVATE_KEY,
//     scopes: ['https://www.googleapis.com/auth/cloud-platform'],
// });



const getGcpEmail = async() => {
    const gcp_email_query = await DBCONNECT('select email from public.configuration where id=2');
    const gcp_email: string = gcp_email_query.rows[0].email;
  
    return gcp_email;
   
};
const getGcpkey = async() => {
    const gcp_key_query = await DBCONNECT('select access_key from public.configuration where id=2');
    
    const gcp_key: string = gcp_key_query.rows[0].access_key;
    // console.log('gcp_key_query',gcp_key);
    return gcp_key;
    // console.log('gcp_key_query',gcp_key);
};


// const google_email = getGoogleEmail();

const createJWTClient = async () => {
    const gcp_email = await getGcpEmail();
    const gcp_key = await getGcpkey();
    const formattedKey = gcp_key.replace(/\\n/g, '\n');
    // console.log('gcp_email', formattedKey);

    // const decodedString = atob(gcp_key);

    // console.log('gcp', `"${gcp_key}"`);
    // console.log('gcp1', process.env.GCP_PRIVATE_KEY);
  
    const jwtClient = new google.auth.JWT({
             email: gcp_email,
            // key: process.env.GCP_PRIVATE_KEY, // Add double quotes to gcp_key
            // key:`"${gcp_key}"`,
            key: formattedKey,
            scopes: ['https://www.googleapis.com'],
    });
  
    return jwtClient;
};
  
  // Usage example
//   const main = async () => {
//     const jwtClient = await createJWTClient();
//     // Now you can use jwtClient for authentication
//     // ...
//   };
  
//   main();


export { createJWTClient };

// (async () => {
//     const google_email_query = await DBCONNECT('select access_key_id from public.configuration where id=2');
//     const google_email: string = google_email_query.rows[0].access_key_id;

//     // Rest of your code here
    // const jwtClient = new google.auth.JWT({
    //     email: google_email,
    //     key: google_email,
    //     scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    // });

// })();
