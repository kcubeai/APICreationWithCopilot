// pages/api/update-username.js
import { NextApiRequest, NextApiResponse } from "next";
import fs from 'fs';
import { logger } from '@/shared/logger';
import { decrypt } from '@/shared/crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authorization: any = req.headers['authorization'];
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
              const envPath = './.env.local';
              const currentEnv = fs.readFileSync(envPath, 'utf8');

              let updatedEnv = currentEnv;

              if (req.body.newUsername) {
                // Update USERNAME if provided
                updatedEnv = updatedEnv.replace(/USERNAME=.*/, `USERNAME=${req.body.newUsername}`);
                // const intialupdate = currentEnv.replace(/USERNAME=.*/, `USERNAME=${req.body.newUsername}`);
                // updatedEnv = intialupdate.replace(/TOKEN=.*/, `TOKEN=${req.body.newUsernamekey}`);
              }
              if(req.body.newUsernamekey){
                // Update TOKEN if provided
                updatedEnv = updatedEnv.replace(/TOKEN=.*/, `TOKEN=${req.body.newUsernamekey}`);
              }

              if (req.body.newToken) {
                // Update TOKEN if provided
                updatedEnv = updatedEnv.replace(/TOKEN=.*/, `TOKEN=${req.body.newToken}`);
              }

              fs.writeFileSync(envPath, updatedEnv);

              res.status(200).json({ success: true, message: 'Credentials updated successfully!' });
            } catch (error) {
              console.error('Error updating credentials:', error);
              res.status(500).json({ success: false, message: 'Error updating credentials. Please try again.' });
            }
          } else {
            res.status(405).json({ success: false, message: 'Method Not Allowed' });
          }

} else {
  logger.error(
      `[${req.method} ${req.url}] - Authorization missing`
  )
  res.status(403).json({ error: 'Authorization missing' });
}
}

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method === 'POST') {
//     try {
//       const envPath = './.env.local';
//       const currentEnv = fs.readFileSync(envPath, 'utf8');

//       // Assuming your .env.local file has a line like: USERNAME=oldUsername
//       const newEnv = currentEnv.replace(/USERNAME=.*/, `USERNAME=${req.body.newUsername}`);

//       fs.writeFileSync(envPath, newEnv);

//       res.status(200).json({ success: true, message: 'Username updated successfully!' });
//     } catch (error) {
//       console.error('Error updating username:', error);
//       res.status(500).json({ success: false, message: 'Error updating username. Please try again.' });
//     }
//   } else {
//     res.status(405).json({ success: false, message: 'Method Not Allowed' });
//   }
// }


// // pages/api/updateConfig.ts
// import { NextApiRequest, NextApiResponse } from 'next';
// import * as fs from 'fs';

// interface AppConfig {
//   USER_NAME: string;
// }

// let config: AppConfig = {
//   USER_NAME: process.env.NEXT_PUBLIC_USER_NAME || 'defaultUserName',
// };

// export const getConfig = (): AppConfig => {
//   return config;
// };

// export default (req: NextApiRequest, res: NextApiResponse): void => {
//   if (req.method === 'POST') {
//     const newConfig = req.body;

//     config = { ...config, ...newConfig };

//     // Update .env file
//     const envContent = Object.entries(config)
//       .map(([key, value]) => `${key}=${value}`)
//       .join('\n');

//     fs.writeFileSync('.env', envContent);

//     res.status(200).json({ success: true });
//   } else {
//     res.status(405).json({ error: 'Method Not Allowed' });
//   }
// };