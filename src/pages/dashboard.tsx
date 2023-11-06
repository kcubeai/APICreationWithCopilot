

import axios from 'axios';
import { useEffect, useState } from 'react';

import { LogoutOutlined, UserAddOutlined } from '@ant-design/icons';
import { Table, Spin, Layout, Button, notification } from 'antd';
import { useAuth } from '@/shared/utils/auth-context';
import { useRouter } from 'next/router';
const { Content } = Layout;
import Head from 'next/head';
import HeaderComponent from '@/shared/components/header';
import moment from 'moment';
export default function Login() {
    const [dataforEC2, setDataEC2] = useState<any>("");
    const [dataforRDS, setDataRDS] = useState<any>("");
    const [dataforVM, setDataVM] = useState<any>("");
    const { token, setToken, isAdmin, isSuperAdmin, isUser, userID } = useAuth();
    const router = useRouter();
    const [selectedType, setSelectedType] = useState('EC2');

    const handleTypeChange = (type: string) => {
        setSelectedType(type);
    };
    const columnsforEC2 = [
        // {
        //     title: 'Instance ID',
        //     dataIndex: 'id',
        //     key: 'id',
        // },
        {
            title: 'S.No',
            dataIndex: 'serialNo',
            key: 'serialNo',
            render: (text: string, record: any, index: number) => index + 1
        },
        {
            title: 'Instance Name',
            dataIndex: 'name',
            key: 'name',
        }, {
            title: 'Project Name',
            dataIndex: 'project_name',
            key: 'project_name',
        },
        // {
        //     title: 'Launch Time',
        //     dataIndex: 'launchTime',
        //     key: 'launchTime',
        // },
        {
            title: "Last Changes On",
            dataIndex: "state_changed_date",
            key: "state_changed_date",
            render: (text: string, record: any) => {
                if (record.state_changed_date != "") {

                    var date = moment(record.state_changed_date).format('YYYY-MM-DD HH:mm');
                    // console.log()
                    return date + ` IST`;
                } else {
                    return ""
                }
            }
        },
        {
            title: 'State',
            dataIndex: 'state',
            key: 'state',
        },

        {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            render: (text: string, record: any) => {
                if (record.state === 'stopped') {
                    return <Button type="primary" onClick={() => startInstance(record.id)}>Start</Button>;
                } else if (record.state === 'running') {
                    return <Button type="primary" onClick={() => stopInstance(record.id)}>Stop</Button>;
                } else {
                    return null;
                }
            }
        }

    ];
    const columnsforRDS = [
        {
            title: 'S.No',
            dataIndex: 'serialNo',
            key: 'serialNo',
            render: (text: string, record: any, index: number) => index + 1
        },
        {
            title: 'Server Name',
            dataIndex: 'name',
            key: 'name',
        }, {
            title: 'Project Name',
            dataIndex: 'project_name',
            key: 'project_name',
        },
        // {
        //     title: 'Launch Time',
        //     dataIndex: 'launchTime',
        //     key: 'launchTime',
        // },
        {
            title: "Last Changes On",
            dataIndex: "state_changed_date",
            key: "state_changed_date",
            render: (text: string, record: any) => {
                if (record.state_changed_date != "") {

                    var date = moment(record.state_changed_date).format('YYYY-MM-DD HH:mm');
                    // console.log()
                    return date + ` IST`;
                } else {
                    return ""
                }
            }
        },
        {
            title: 'State',
            dataIndex: 'state',
            key: 'state',
        },
        {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            render: (text: string, record: any) => {
                if (record.state === 'stopped') {
                    return <Button type="primary" onClick={() => startInstance(record.id)}>Start</Button>;
                } else if (record.state === 'available') {
                    return <Button type="primary" onClick={() => stopInstance(record.id)}>Stop</Button>;
                } else {
                    return null;
                }
            }
        }
    ];
    const columnsforVM = [
        {
            title: 'S.No',
            dataIndex: 'serialNo',
            key: 'serialNo',
            render: (text: string, record: any, index: number) => index + 1
        },
        {
            title: 'Instance Name',
            dataIndex: 'name',
            key: 'name',
        }, {
            title: 'Project Name',
            dataIndex: 'project_name',
            key: 'project_name',
        },
        // {
        //     title: 'Launch Time',
        //     dataIndex: 'launchTime',
        //     key: 'launchTime',
        // },
        {
            title: "Last Changes On",
            dataIndex: "state_changed_date",
            key: "state_changed_date",
            render: (text: string, record: any) => {
                if (record.state_changed_date != "") {

                    var date = moment(record.state_changed_date).format('YYYY-MM-DD HH:mm');
                    // console.log()
                    return date + ` IST`;
                } else {
                    return ""
                }
            }
        },
        {
            title: 'State',
            dataIndex: 'state',
            key: 'state',
        },
        {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            render: (text: string, record: any) => {
                if (record.state === 'TERMINATED') {
                    return <Button type="primary" onClick={() => startInstance(record.id)}>Start</Button>;
                } else if (record.state === 'RUNNING') {
                    return <Button type="primary" onClick={() => stopInstance(record.id)}>Stop</Button>;
                } else {
                    return null;
                }
            }
        }
    ];
    const fetchData = (selectedtype: string) => {

        try {
            axios.get('/api/get-list', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${token}`,
                    'type': selectedtype,
                    'id': userID,


                }
            }).then((response) => {
                if (response.status == 200) {
                    if (selectedType == "EC2") {
                        if (response.data.instanceList.length > 0) {
                            response.data.instanceList.forEach((item: any) => {
                                if (item.project_name != "") {

                                    var project_string = item.project_name.map((value: any) => `${value}`).join(', ');
                                    item.project_name = project_string;
                                } else {
                                    item.project_name = ""
                                }
                            })
                            setDataEC2(response.data.instanceList)
                        } else {
                            setDataEC2([])
                        }
                        // return
                    }
                    if (selectedType == "RDS") {
                        if (response.data.instanceList.length > 0) {
                            response.data.instanceList.forEach((item: any) => {
                                if (item.project_name != "") {

                                    var project_string = item.project_name.map((value: any) => `${value}`).join(', ');
                                    item.project_name = project_string;
                                } else {
                                    item.project_name = ""
                                }
                            })
                            setDataRDS(response.data.instanceList)
                        } else {
                            setDataRDS([])
                        }
                        // return
                    }
                    if (selectedType == "VM") {
                        if (response.data.instanceList.length > 0) {
                            response.data.instanceList.forEach((item: any) => {
                                if (item.project_name != "") {

                                    var project_string = item.project_name.map((value: any) => `${value}`).join(', ');
                                    item.project_name = project_string;
                                } else {
                                    item.project_name = ""
                                }
                            })
                            setDataVM(response.data.instanceList)
                        } else {
                            setDataVM([])
                        }
                        // return
                    }
                }
            }, error => {
                notification.error({
                    message: 'Error',
                    description: error.response.data.error,
                    placement: 'topRight',
                    duration: 3
                });
                setDataRDS([]);
                setDataEC2([]);
                setDataVM([])
            });
        } catch (error) {

        }
    }
    useEffect(() => {
        if (selectedType != "") {
            sync()
        }

    }, [selectedType])
    useEffect(() => {
        if (token == "") {
            router.push('/login')
        } else {

        }
    })

    const stopInstance = (id: string) => {

        axios.get('/api/change-state', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${token}`,
                'type': selectedType,
                'instance_id': id,
                'state': 'stop',
                userID
            }
        }).then((response) => {

            notification.info({
                message: 'Info',
                description: response.data.message,
                placement: 'topRight',
                duration: 3
            });
            sync()
            setTimeout(() => {
                sync()

            }, 12000)
        }).catch((error) => {

            notification.error({
                message: 'Error',
                description: error.response.data.error,
                placement: 'topRight',
                duration: 3
            });
        });
    }

    const startInstance = (id: string) => {

        axios.get('/api/change-state', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${token}`,
                'type': selectedType,
                'instance_id': id,
                'state': 'start',
                userID
            }
        }).then((response) => {

            notification.info({
                message: 'Info',
                description: response.data.message,
                placement: 'topRight',
                duration: 3
            });
            sync()
            setTimeout(() => {
                sync()
            }, 12000)
        }).catch((error) => {

            notification.error({
                message: 'Error',
                description: error.response.data.error,
                placement: 'topRight',
                duration: 3
            });
        });
    }
    const sync = () => {
        axios.get('/api/sync', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${token}`,
            }
        }).then((response) => {

            fetchData(selectedType)
        }).catch((error) => {

            notification.error({
                message: 'Error',
                description: error.response.data.error,
                placement: 'topRight',
                duration: 3
            });
        });
    }

    return (
        <Layout>
            <Head>
                <title>InterCloud Manager</title>
                <meta name="description" content="Generated by create next app" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <HeaderComponent title="Dashboard" />
            <Content style={{ padding: '50px' }}>
                <div style={{ marginBottom: '20px' }}>
                    <div style={{ marginBottom: '20px', marginTop: '20px' }}>
                        <h2>Select Type</h2>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <Button type={selectedType === 'EC2' ? 'primary' : 'default'} onClick={() => handleTypeChange('EC2')}>
                            AWS EC2
                        </Button>
                        <Button type={selectedType === 'RDS' ? 'primary' : 'default'} onClick={() => handleTypeChange('RDS')}>
                            AWS RDS
                        </Button>
                        <Button type={selectedType === 'VM' ? 'primary' : 'default'} onClick={() => handleTypeChange('VM')}>
                            GCP VM
                        </Button>

                    </div>
                </div>


                {selectedType === 'EC2' ? (
                    <div>
                        <div style={{ marginBottom: '20px' }}>
                            <h2>EC2 Instances</h2>
                        </div>
                        <div>
                            {dataforEC2 ? (
                                <Table dataSource={dataforEC2} columns={columnsforEC2} rowClassName={(record) => {
                                    // Add a custom class to the row if the "Project" column contains an empty string
                                    if (record.project_name === '') {
                                        return 'highlighted-row';
                                    }
                                    return '';
                                }} />
                            ) : (
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                                    <Spin size="large" />
                                </div>
                            )}
                        </div>
                    </div>

                ) : null}

                {selectedType == "RDS" ?
                    (<div>
                        <div style={{ marginBottom: '20px' }}>
                            <h2>RDS Servers</h2>
                        </div>
                        <div>
                            {dataforRDS ? (
                                <Table dataSource={dataforRDS} columns={columnsforRDS} rowClassName={(record) => {
                                    // Add a custom class to the row if the "Project" column contains an empty string
                                    if (record.project_name === '') {
                                        return 'highlighted-row';
                                    }
                                    return '';
                                }} />
                            ) : (
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                                    <Spin size="large" />
                                </div>
                            )}
                        </div>
                    </div>)
                    : null}
                {selectedType == "VM" ? (<div>
                    <div style={{ marginBottom: '20px' }}>
                        <h2>RDS Servers</h2>
                    </div>
                    <div>
                        {dataforRDS ? (
                            <Table dataSource={dataforVM} columns={columnsforVM} rowClassName={(record) => {
                                // Add a custom class to the row if the "Project" column contains an empty string
                                if (record.project_name === '') {
                                    return 'highlighted-row';
                                }
                                return '';
                            }} />
                        ) : (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                                <Spin size="large" />
                            </div>
                        )}
                    </div>
                </div>) : null}




            </Content>
        </Layout>
    );
}



