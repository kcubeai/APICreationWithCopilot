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
export const jwtClient = new google.auth.JWT({
    // email: serviceAccountKey.client_email,
    // key: serviceAccountKey.private_key,
    email: process.env.GCP_CLIENT_EMAIL,
    key:process.env.GCP_PRIVATE_KEY,
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
});
