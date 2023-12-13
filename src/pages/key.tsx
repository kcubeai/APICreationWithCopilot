// pages/update-username.js
import { ChangeEvent, useEffect, useState } from 'react';
import { Layout, Button, notification, Input, Table, Modal } from 'antd';
const { Content } = Layout;
import Head from 'next/head';
import HeaderComponent from '@/shared/components/header';
import { useAuth } from '@/shared/utils/auth-context';
import { networkInterfaces } from 'os';
import router from 'next/router';
import axios from 'axios';
import { set } from 'firebase/database';

export default function UpdateCredentials() {
  const { token, setToken, isAdmin, isSuperAdmin, isUser, userID } = useAuth();
  const [awsaccessid, setAwsaccessid] = useState('');
  const [awskey, setAwskey] = useState('');
  const [gcpkey, setGcpkey] = useState('');
  const [showAws, setShowAws] = useState(false);
  const [showGcp, setShowGcp] = useState(false);
  const [showserver, setShowserver] = useState(true);
  const [email, setemail] = useState('');
  const [error, setError] = useState('');
  const[serverid,setserverid]=useState('');
  const [server_detail, setserver_detail] = useState<any>([]);
  const [aws_detail, setAws_detail] = useState<any>([]);
  const [selected_server, setSelected_server] = useState('');
  const [open, setOpen] = useState(false);

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Provider',
      dataIndex: 'provider',
      key: 'provider',
    },
    {
      title: 'Server Name',
      dataIndex: 'server_name',
      key: 'server_name',
    },
    {
      title: 'Edit',
      key: 'Edit',
      render: (text: any, record: any) => (
        <Button type="primary" onClick={() => {
          // handleUpdate(record.id, record.provider), 
          update(record)
        }}>
          Edit
        </Button>
      ),
    }
  ]

  const showModal = () => {
    setOpen(true);
};

  const update = async (record: any) => {
    // console.log("record", record.id, record.provider, record.server_name);
  
    try {
      if (record.provider === 'AWS') {
        setShowAws(true);
        setShowGcp(false);
        setShowserver(false);
  
        const response = await axios.get('/api/update_config', {
          headers: { Authorization: token, action: 'edit', id: record.id },
        });
  
        handleServerResponse(record, response);
      } else if (record.provider === 'GCP') {
        setShowAws(false);
        setShowGcp(true);
        setShowserver(false);
  
        const response = await axios.get('/api/update_config', {
          headers: { Authorization: token, action: 'edit', id: record.id },
        });
  
        handleServerResponse(record, response);
      }
    } catch (error) {
      console.error('Error updating data:', error);
      // Handle error appropriately, e.g., show a notification or set an error state
    }
  };
  
  const handleServerResponse = (record: any, response: any) => {
    if (response.data.selected_server != null) {

      const selected_server_detail = response.data.selected_server[0];
      const selected_server_name = selected_server_detail.server_name;
      setSelected_server(selected_server_name);
      setserverid(selected_server_detail.id);
  
      if (record.provider === 'AWS') {
        setAwsaccessid(selected_server_detail.access_key_id);
        setAwskey(selected_server_detail.access_key);
      } else if (record.provider === 'GCP') {
        setGcpkey(selected_server_detail.access_key);
        setemail(selected_server_detail.email);
      }
    }
  };
  

  
   
  const getserverlist = async () => {
    try {
      const response = await axios.get('/api/update_config', {
        headers: { Authorization: token, action: 'get' },
      });
  
      if (response.data.server_detail != null) {
        setserver_detail(response.data.server_detail);
      } else {
     
      }
    } catch (error) {
      console.error('Error fetching server details:', error);
     
    }
  };
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAwsaccessid(e.target.value);
    setError('');
  };
 const handleUsernameChangekey = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAwskey(e.target.value);
    setError('');
  };
  const handleTokenChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setGcpkey(e.target.value);
    setError('');
  };
  const handleemailchange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setemail(e.target.value);
    setError('');
  };

  useEffect(() => {
    if (token === "") {
      router.push('/login');
      return;
    } else {
        getserverlist();
    }
  }, [token]);

  useEffect(() => {
    // Get the value of 'selected_server' after being refreshed
     
  }, [selected_server]);
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
                    'id':`${serverid}`
            },
            body: JSON.stringify({ awsaccessid, awskey, userID }),
        });

        const data = await response.json();
      
        if (data.success) {
           

            setTimeout(() => {
              notification.success({
                message: 'Success',
                description: data.message,
              });

              // router.push('/dashboard');
            }, 1200);
        } else {
            notification.error({
                message: 'Error',
                description: 'Error updating access key. Please try again.',
            });
        }
    } catch (error) {
        console.error('Error updating username:', error);
        notification.error({
            message: 'Error',
            description: 'Error updating username. Please try again.',
        });
    }
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
           'id':`${serverid}`
        },
        body: JSON.stringify({gcpkey,email,userID }),
      });

      const data = await response.json();

 
      if (data.success) {
           

        setTimeout(() => {
          notification.success({
            message: 'Success',
            description: data.message,
          });

          // router.push('/dashboard');
        }, 1200);
    } else {
        notification.error({
            message: 'Error',
            description: 'Error updating access key. Please try again.',
        });
    }
    } catch (error) {
      console.error('Error updating token:', error);
      alert('Error updating token. Please try again.');
    }
  };

  

  return (

    <Layout>

            <Modal
                title="Title"
                open={open}
                // onOk={handleOk}
                // onCancel={handleCancel}
               >
                <p>Are you sure you wan to go back ?</p>
            </Modal>
         <Head>
             <title>InterCloud Manager</title>
             <meta name="description" content="Generated by create next app" />
             <meta name="viewport" content="width=device-width, initial-scale=1" />
             <link rel="icon" href="/favicon.ico" />
         </Head>
       <HeaderComponent title="Servers" />
       <Content style={{ padding: "50px"}}>
  
<div>
                       

                     
                     
                        <div>
                             {showAws && (
                            <>
                                       

                                          <div style={{ width: "50%" }}>
                                          <div style={{ marginBottom: "20px" }}>

                                          <div style={{ display: 'flex', justifyContent: 'left', alignItems: 'center', marginLeft: '10' }}>
                                          <h1>Update server details</h1>
                                          
                                          </div>

                                      </div></div>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px',marginTop:'20px' }}>
                                          <label style={{ marginRight: '16px', fontWeight: 'bold' }}>
                                              Name:
                                              <Input type="text" value={selected_server}   />
                                          </label>
                                      </div>
                                      {/* <Input value={selected_server} readOnly /> */}
                                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px',marginTop:'20px' }}>
                                          <label style={{ marginRight: '16px', fontWeight: 'bold' }}>
                                              AWS Access ID:
                                              <Input type="text" value={awsaccessid} onChange={handleUsernameChange} />
                                          </label>
                                      </div>

                                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px',marginTop:'20px' }}>
                                          <label style={{ marginRight: '16px', fontWeight: 'bold' }}>
                                              AWS Access Key:
                                              <Input.TextArea rows={4} value={awskey} onChange={handleUsernameChangekey} />
                                          </label>
                                      </div>
                                      <div>

                                      {error && <p style={{ color: 'red' }}>{error}</p>}
                                      </div>

                                      <div style={{ marginTop: '20px', display: 'flex' }}>
                                        
                                      <div style={{ marginRight: '20px' }}>
                                          <Button type="primary" onClick={() => {
                                            setShowserver(true);
                                            setShowAws(false);
                                          }}>
                                            Back
                                          </Button>
                                        </div>
                                        <div>
                                          <Button type='primary' onClick={handleUpdateAws}>
                                            Update
                                          </Button>
                                        </div>
                                      
                                      </div>
                             
                            </>
                        )}
                        {showGcp && (
                            <>

                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px',marginTop:'20px' }}>
                                <label style={{ marginRight: '16px', fontWeight: 'bold' }}>
                                    Name:
                                    <Input type="text" value={selected_server}   />
                                </label>
                            </div>
                            {/* <Input value={selected_server} readOnly /> */}

                             <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px',marginTop:'20px' }}>
                                <label style={{ marginRight: '16px', fontWeight: 'bold' }}>
                                    Email:
                                    <Input type="text" value={email} onChange={handleemailchange} />
                                </label>
                            </div>
                            <div>

                            </div>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px',marginTop:'20px' }}>
                                <label style={{ marginRight: '16px', fontWeight: 'bold' }}>
                                    GCP Private Key:
                                    <Input.TextArea rows={4} value={gcpkey} onChange={handleTokenChange} />
                                </label>
                            </div>

                            <div>

                                {error && <p style={{ color: 'red' }}>{error}</p>}
                                </div>

                              

                                <div style={{ marginTop: '20px', display: 'flex' }}>
                              
                              <div style={{ marginRight: '20px' }}>
                                  <Button type="primary" onClick={() => {
                                    setShowserver(true);
                                    setShowGcp(false);
                                  }}>
                                    Back
                                  </Button>
                                </div>
                                <div>
                                <Button type='primary' onClick={handleUpdateGcp}>
                                    Update
                                </Button>
                                </div>
                               
                              </div>
                            </>
                        )}

                    {showserver && (
                            <>
                            <div style={{  justifyContent: 'left', alignItems: 'center', marginLeft: '10' }}>
                             <h1>Server Details</h1>
                            <Table columns={columns} dataSource={server_detail} style={{width: '100%', marginTop: '20px' }} />
                            </div>
                            </>
                        )}
                        </div>
                    </div>

    </Content>

    </Layout>
  );
}
