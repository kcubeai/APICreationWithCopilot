// pages/update-username.js
import { ChangeEvent, useEffect, useState } from 'react';
import {  Layout, Button, notification, Input } from 'antd';
const { Content } = Layout;
import Head from 'next/head';
import HeaderComponent from '@/shared/components/header';
import { useAuth } from '@/shared/utils/auth-context';
import { networkInterfaces } from 'os';
import router from 'next/router';




export default function UpdateCredentials() {
  const { token,updateToken, setToken, isAdmin, isSuperAdmin, isUser, userID } = useAuth();
  const [awsaccessid, setAwsaccessid] = useState('');
  const [awskey, setAwskey] = useState('');
  const [gcpkey, setGcpkey] = useState('');
  const [showAws, setShowAws] = useState(false);
    const [showGcp, setShowGcp] = useState(false);
    const [error, setError] = useState('');
    

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAwsaccessid(e.target.value);
    setError('');
  };
 const handleUsernameChangekey = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAwskey(e.target.value);
    setError('');
  };
  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGcpkey(e.target.value);
    setError('');
  };

  useEffect(() => {
    if (token == "") {
        router.push('/login')
    }
})

const handleUpdateAws = async () => {

  if (!awsaccessid.trim()) {
    setError('AWS Access Id cannot be empty');
    return;
  }
  if (!awskey.trim()) {
      setError('AWS Key cannot be empty');
      return;
    }
    try {
        const response = await fetch('/api/update_config', {
            method: 'POST',
            headers: {
                    'authorization': `${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ awsaccessid, awskey, userID }),
        });

        const data = await response.json();
        if (data.success) {
            alert(data.message);
          } else {
            alert('Error updating token. Please try again.');
          }
        } catch (error) {
          console.error('Error updating token:', error);
          alert('Error updating token. Please try again.');
        }
    //     if (data.success) {
    //         notification.success({
    //             message: 'Success',
    //             description: data.message,
    //         });
    //     } else {
    //         notification.error({
    //             message: 'Error',
    //             description: 'Error updating username. Please try again.',
    //         });
    //     }
    // } catch (error) {
    //     console.error('Error updating username:', error);
    //     notification.error({
    //         message: 'Error',
    //         description: 'Error updating username. Please try again.',
    //     });
    // }
};

  const handleUpdateGcp = async () => {

    if (!gcpkey.trim()) {
      setError('GCP Private key cannot be empty');
      return;
    }
    try {
      const response = await fetch('/api/update_config', {
        method: 'POST',
        headers: {
           'authorization': `${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({gcpkey }),
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message);
      } else {
        alert('Error updating token. Please try again.');
      }
    } catch (error) {
      console.error('Error updating token:', error);
      alert('Error updating token. Please try again.');
    }
  };

  return (

    <Layout>
         <Head>
             <title>InterCloud Manager</title>
             <meta name="description" content="Generated by create next app" />
             <meta name="viewport" content="width=device-width, initial-scale=1" />
             <link rel="icon" href="/favicon.ico" />
         </Head>
       <HeaderComponent title="Edit configuration" />
         <Content style={{ padding: '50px' }}>
    {/* <div>
      <h1>Update Credentials</h1>
      <form>
        <label>
          New Username:
          <input type="text" value={newUsername} onChange={handleUsernameChange} />
        </label>
        <br />
        <button type="button" onClick={handleUpdateUsername}>
          Update Username
        </button>
        <br />
        <label>
          New Token:
          <input type="text" value={newToken} onChange={handleTokenChange} />
        </label>
        <br />
        <button type="button" onClick={handleUpdateToken}>
          Update Token
        </button>
      </form>
    </div> */}

<div>
                        <h1>Server Credentials</h1>

                        <div>
                        <Button style={{ marginLeft: '10px' }} type="primary" onClick={() => {setShowAws(true); setShowGcp(false)}}>AWS</Button>
                        <Button style={{ marginLeft: '10px' }} type="primary" onClick={() => {setShowAws(false);setShowGcp(true)}}>GCP</Button>
                       
                        </div>
                        <div>
                             {showAws && (
                            <>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px',marginTop:'20px' }}>
                                <label style={{ marginRight: '16px', fontWeight: 'bold' }}>
                                    AWS Access ID:
                                    <Input type="text" value={awsaccessid} onChange={handleUsernameChange} />
                                </label>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px',marginTop:'20px' }}>
                                <label style={{ marginRight: '16px', fontWeight: 'bold' }}>
                                    AWS Access Key:
                                    <Input type="text" value={awskey} onChange={handleUsernameChangekey} />
                                </label>
                            </div>
                            <div>

                            {error && <p style={{ color: 'red' }}>{error}</p>}
                            </div>

                            <div style={{ marginTop: '20px' }}>
                                <Button type='primary' onClick={handleUpdateAws}>
                                    Update
                                </Button>
                            </div>
                            </>
                        )}
                        {showGcp && (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px',marginTop:'20px' }}>
                                <label style={{ marginRight: '16px', fontWeight: 'bold' }}>
                                    GCP Private Key:
                                    <Input type="text" value={gcpkey} onChange={handleTokenChange} />
                                </label>
                            </div>

                            <div>

                                {error && <p style={{ color: 'red' }}>{error}</p>}
                                </div>

                                <Button type='primary' onClick={handleUpdateGcp}>
                                    Update
                                </Button>
                            </>
                        )}
                        </div>
                    </div>

    </Content>
    </Layout>
  );
}
// export default function UpdateUsername() {
//   const [newUsername, setNewUsername] = useState('');
//   const [newPassword, setNewPassword] = useState('');

//   const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
//     setNewUsername(e.target.value);
//   };

//   const handleSubmit = async (e:any) => {
//     e.preventDefault();

//     try {
//       const response = await fetch('/api/update_config', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ newUsername }),
//       });

//       const data = await response.json();

//       if (data.success) {
//         alert(data.message);
//       } else {
//         alert('Error updating username. Please try again.');
//       }
//     } catch (error) {
//       console.error('Error updating username:', error);
//       alert('Error updating username. Please try again.');
//     }
//   };

//   return (
//     <Layout>
//     <Head>
//         <title>InterCloud Manager</title>
//         <meta name="description" content="Generated by create next app" />
//         <meta name="viewport" content="width=device-width, initial-scale=1" />
//         <link rel="icon" href="/favicon.ico" />
//     </Head>
//     <HeaderComponent title="Dashboard" />
//     <Content style={{ padding: '50px' }}>
    
//     <div>
//       <h1>Server configuration</h1>
//       <form onSubmit={handleSubmit}>
//         <label>
//           New Username:
//           <input type="text" value={newUsername} onChange={handleInputChange} />
//         </label>

//         <label>
//             New Password:
//             <input type="password" value={newPassword} onChange={handleInputChange} />
//         </label>
//         <button type="submit">Update</button>
//       </form>
//     </div>

//     </Content>
//     </Layout>
//   );
// }



// import { useState } from 'react';

// const YourComponent: React.FC = () => {
//   const [userName, setUserName] = useState('');

//   const handleInputChange = (e: any) => {
//     setUserName(e.target.value);
//   };

//   const handleSave = async () => {
//     try {
//       const response = await fetch('/api/updateConfig', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ userName }),
//       });

//       if (response.ok) {
//         console.log('Config updated successfully');
//       } else {
//         console.error('Failed to update config');
//       }
//     } catch (error) {
//       console.error('Error updating config:', error);
//     }
//   };

//   return (
//     <div>
//       <input type="text" value={userName} onChange={handleInputChange} />
//       <button onClick={handleSave}>Save</button>
//     </div>
//   );
// };
