

import { google } from 'googleapis'
import serviceAccountKey from '../shared/utils/kcube-ai-acae742bd8eb.json';
import { DBCONNECT } from './database';



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

  
    const jwtClient = new google.auth.JWT({
             email: gcp_email,
            // key: process.env.GCP_PRIVATE_KEY, // Add double quotes to gcp_key
            // key:`"${gcp_key}"`,
            key: formattedKey,
            scopes: ['https://www.googleapis.com'],
    });
  
    return jwtClient;
};
  



export { createJWTClient };

