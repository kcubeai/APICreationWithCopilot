import { useEffect, useState } from "react";

import { Button, Checkbox, Form, Input, Layout, Radio, Table, notification } from "antd";
const { useForm } = Form;
const { Header, Content } = Layout;
import { useAuth } from "@/shared/utils/auth-context";
import { useRouter } from "next/router";
import Head from "next/head";
import HeaderComponent from "@/shared/components/header";
import axios from "axios";
import { GetServerSideProps } from "next";
export default function AddUserWithNamePasswordEmail({ data }: any) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isadmin, setAdmin] = useState(false);
    const [form] = useForm();
    const { token, isSuperAdmin, isAdmin, isUser, userID } = useAuth()
    const router = useRouter()
    const [issuperadmin, setIsSuperAdmin] = useState(false);
    const [isuser, setIsUser] = useState(false);
    const [projectList, setProjectList] = useState([]);
    const [ec2List, setEc2List] = useState([]);
    const [rdsList, setRDSList] = useState([]);
    const [VMList, setVMList] = useState([]); isAdmin
    const [showAdd, setShowAdd] = useState<boolean>(false);
    const [userList, setUserList] = useState(data.userList ? data.userList : [])
    const [filterUserList, setFilterList] = useState<any>(userList);
    const [projectCheckList, setProjectCheckList] = useState(data.projectList ? data.projectList : []);
    const [ec2CheckList, setEc2CheckList] = useState(data.ec2List ? data.ec2List : []);
    const [rdsCheckList, setRDSCheckList] = useState(data.rdsList ? data.rdsList : []);
    const [vmCheckList, setVMCheckList] = useState(data.vmList ? data.vmList : [])
    const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(event.target.value);
    };

    const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(event.target.value);
    };
    const columns = [
        {
            title: 'S.No',
            dataIndex: 'serialNo',
            key: 'serialNo',
            render: (text: string, record: any, index: number) => index + 1
        }, {
            title: 'User Name',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            render: (text: string, record: any) => {
                if (record.issuperadmin) {
                    return "Super Admin";
                }
                if (record.isadmin) {
                    return "Admin"
                }
                if (record.isuser) {
                    return "User"
                }
            }
        },
        {
            title: 'Edit',
            dataIndex: 'edit',
            key: 'edit',
            render: (text: string, record: any) => {
                return <Button disabled type="primary" >Edit</Button>;
            }
        },

        {
            title: 'Delete',
            dataIndex: 'delete',
            key: 'delete',
            render: (text: string, record: any) => {
                return <Button type="dashed" onClick={() => deleteUser(record)} >Delete</Button>;
            }
        }
    ];

    const deleteUser = (record: any) => {
        axios.post('/api/add-user', { id: record.id }, { headers: { "authorization": token, action: 'delete', userID } }).then((response: any) => {
            if (response.data.status == 200) {
                debugger;
                setUserList(response.data.userList)
                getUserList()
                notification.success({
                    message: 'Success',
                    description: "User Deleted successfully",
                    placement: 'topRight',
                    duration: 3
                });
                form.resetFields();
                setShowAdd(false)
            }
        }, (error: any) => {
            notification.error({
                message: 'Error',
                description: "Issue in adding USers",
                placement: 'topRight',
                duration: 3
            });
        })
    }
    useEffect(() => {
        if (token == "") {
            router.push('/login')
        }
        if (isAdmin) {
            handleSearch()
            // getProjectList()
        }
    }, [])

    const handleSuperAdminChange = (event: any) => {
        setIsSuperAdmin(event.target.checked);
        if (event.target.checked) {
            setAdmin(false)
            setIsUser(false)
            setProjectList([])
            setEc2List([])
            setRDSList([])
            setVMList([])
            form.resetFields(['projectList', 'ec2List', 'rdsList', 'vmList'])
        }
    };
    const getUserList = async () => {
        await axios.get('/api/get-user-list', { headers: { Authorization: token } }).then((response: any) => {
            if (response.data.userList && response.data.userList.length > 0) {
                setUserList(response.data.userList);

            } else {
                setUserList([])
            }

        })
    }
    const handleAdminChange = (event: any) => {
        setAdmin(event.target.checked);
        if (event.target.checked) {
            setIsSuperAdmin(false)
            setIsUser(false)
            setEc2List([])
            setRDSList([])
            setVMList([])
            form.resetFields(['ec2List', 'rdsList', 'vmList'])
        }
    };

    const handleUserChange = (event: any) => {
        setIsUser(event.target.checked);
        if (event.target.checked) {
            setAdmin(false)
            setIsSuperAdmin(false)
        }
    };

    const handleProjectListChange = (value: any) => {
        setProjectList(value);
    };
    const handleEC2ListChange = (value: any) => {
        setEc2List(value);
    };
    const handleRDSListChange = (value: any) => {
        setRDSList(value);
    };
    const handleVMListChange = (value: any) => {
        setVMList(value);
    };
    const handleSearch = () => {
        const filtered = userList.filter((item: any) => {
            if (item.isuser) {
                return true
            }
        });

        setFilterList(filtered);
    };
    const isFormValid = () => {
        if (username.length < 1) return false;
        if (password.length < 1) return false;
        if (!isadmin && !isuser && !issuperadmin) return true;
        return true;
    };
    const isEntireValid = () => {
        var valid = isFormValid();
        if (valid) {
            if (isadmin) {
                if (projectList.length < 1) {
                    return false
                } else {
                    return true
                }
            }
            if (isuser) {
                if (projectList.length < 1) {
                    return false
                } else {
                    if (ec2List.length > 0 || rdsList.length > 0 || VMList.length > 0) {
                        return true
                    } else {
                        return false
                    }
                }
            }
            if (issuperadmin) {
                return true
            }
            return false;
        }

    }
    const handleSubmit = (event: any) => {
        const formValues = form.getFieldsValue()
        axios.post('/api/add-user', formValues, { headers: { "authorization": token, userID } }).then((response: any) => {
            if (response.data.status == 200) {

                setUserList(response.data.userList);
                getUserList()
                notification.success({
                    message: 'Success',
                    description: "User eleted successfully",
                    placement: 'topRight',
                    duration: 3
                });
                form.resetFields();
                setShowAdd(false)
            }
        }, (error: any) => {
            notification.error({
                message: 'Error',
                description: "Issue in adding USers",
                placement: 'topRight',
                duration: 3
            });
        })
    }
    const getProjectList = () => {
        if (isAdmin) {
            // console.log("called")
            axios.get('/api/get-project-list', { headers: { authorization: token, id: '', isAdmin, userID } }).then((response: any) => {
                if (response.data.projectList && response.data.projectList.length > 0) {
                    setProjectCheckList(response.data.projectList);

                }
                var ec2List: any = []
                var rdsList: any = []
                var vmList: any = []
                for (const projects of response.data.projectList) {
                    axios.get('/api/get-project-list', { headers: { authorization: token, id: projects.id } }).then((response: any) => {
                        ec2List.push(...response.data.aws_ec2_list)
                        rdsList.push(...response.data.aws_rds_list)
                        vmList.push(...response.data.gcp_vm_list)
                    })
                }
                setEc2CheckList(ec2List);
                setRDSCheckList(rdsList);
                setVMCheckList(vmList);

            })
        }
    }
    return (

        <Layout>

            <Head>
                <title>COPILOT</title>
                <meta name="description" content="Generated by create next app" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <HeaderComponent title="Users" />
            <Content style={{ padding: "50px", display: 'flex', justifyContent: 'center', alignContent: 'center' }}>
                {showAdd ?

                    <div style={{ width: "50%" }}>
                        <div style={{ marginBottom: "20px" }}>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h1>Add Users</h1>
                                <Button type="primary" onClick={() => {

                                    getUserList()
                                    form.resetFields();
                                    setShowAdd(false)
                                }}>Back to List</Button>
                            </div>

                        </div>
                        <Form form={form}
                            name="basic"

                            onFinish={handleSubmit}
                            initialValues={{ remember: true }}
                        >
                            <Form.Item
                                label="Username"
                                name="username"
                                rules={[{ required: true, message: 'Please input your username!' }]}
                            >
                                <Input value={username} onChange={handleUsernameChange} />
                            </Form.Item>

                            <Form.Item
                                label="Password"
                                name="password"
                                rules={[{ required: true, message: 'Please input your password!' }]}
                            >
                                <Input.Password value={password} onChange={handlePasswordChange} />
                            </Form.Item>
                            <Form.Item name="role" label="Select Role" rules={[{ required: true, message: "Please select a role" }]}>
                                <Radio.Group>
                                    {isSuperAdmin ? <Radio value="issuperadmin" onChange={handleSuperAdminChange}>Is Super Admin</Radio> : null}
                                    {isSuperAdmin ? <Radio value="isadmin" onChange={handleAdminChange}>Is Admin</Radio> : null}

                                    <Radio value="isuser" onChange={handleUserChange}>Is User</Radio>
                                </Radio.Group>
                            </Form.Item>

                            {(isadmin || isuser) ?
                                <Form.Item name="projectList" label="Select Project(s)" rules={[{ required: (isuser || isadmin) ? true : false, message: "Please select at least one project" }]}>
                                    <Checkbox.Group onChange={handleProjectListChange} >
                                        {projectCheckList.map((ec2: any) => (
                                            <Checkbox key={ec2.id} value={ec2.id}>
                                                {ec2.project_name}
                                            </Checkbox>
                                        ))}
                                    </Checkbox.Group>
                                </Form.Item>
                                : null}

                            {(isuser) ? <>
                                <Form.Item name="ec2List" label="Select EC2">
                                    <Checkbox.Group onChange={handleEC2ListChange}>
                                        {ec2CheckList.map((ec2: any) => {
                                            //@ts-ignore
                                            if (projectList.includes(ec2.project_id)) {
                                                return (
                                                    <Checkbox key={ec2.id} value={ec2.id}>
                                                        {ec2.name}
                                                    </Checkbox>
                                                );
                                            }
                                            return null;
                                        })}
                                    </Checkbox.Group>
                                </Form.Item>
                                <Form.Item name="rdsList" label="Select RDS">
                                    <Checkbox.Group onChange={handleRDSListChange} >
                                        {rdsCheckList.map((rds: any) => {
                                            //@ts-ignore
                                            if (projectList.includes(rds.project_id)) {
                                                return (

                                                    <Checkbox key={rds.id} value={rds.id} >
                                                        {rds.name}
                                                    </Checkbox>
                                                );
                                            }
                                            return null;
                                        })}
                                    </Checkbox.Group>
                                </Form.Item>
                                <Form.Item name="vmList" label="Select VM" >
                                    <Checkbox.Group onChange={handleVMListChange}>
                                        {vmCheckList.map((rds: any) => {
                                            //@ts-ignore
                                            if (projectList.includes(rds.project_id)) {
                                                return (

                                                    <Checkbox key={rds.id} value={rds.id} >
                                                        {rds.name}
                                                    </Checkbox>
                                                );
                                            }
                                            return null;
                                        })}
                                    </Checkbox.Group>
                                </Form.Item>
                            </>
                                : null}

                            <Form.Item>
                                <Button
                                    type="primary"
                                    disabled={!isEntireValid()}
                                    onClick={() => { handleSubmit(form); }}
                                >
                                    Add User
                                </Button>
                            </Form.Item>
                        </Form>
                    </div> : <><div style={{ width: "100%" }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2>User List</h2>
                            <Button type="primary" onClick={() => { setShowAdd(true); getProjectList(); }} >
                                Add User
                            </Button>
                        </div>
                        <Table columns={columns} dataSource={filterUserList} style={{ marginTop: '20px' }} />
                    </div></>}

            </Content>
        </Layout >

    );

}

export const getServerSideProps: GetServerSideProps = async (context) => {
    var projectList: any = [];
    var ec2List: any = [];
    var rdsList: any = [];
    var userList: any = []
    var vmList: any = [];
    await axios.get(process.env.NEXT_PUBLIC_MOCK_PATH + '/api/get-user-list', { headers: { Authorization: process.env.NEXT_PUBLIC_APP_KEY } }).then((response: any) => {
        if (response.data.userList && response.data.userList.length > 0) {
            userList.push(...response.data.userList);

        }

    })
    await axios.get(process.env.NEXT_PUBLIC_MOCK_PATH + '/api/get-project-list', { headers: { Authorization: process.env.NEXT_PUBLIC_APP_KEY, id: '', isSuperAdmin: true } }).then((response: any) => {
        if (response.data.projectList && response.data.projectList.length > 0) {
            projectList.push(...response.data.projectList);

        }

    })
    for (const projects of projectList) {
        await axios.get(process.env.NEXT_PUBLIC_MOCK_PATH + '/api/get-project-list', { headers: { authorization: process.env.NEXT_PUBLIC_APP_KEY, id: projects.id } }).then((response: any) => {
            ec2List.push(...response.data.aws_ec2_list)
            rdsList.push(...response.data.aws_rds_list)
            vmList.push(...response.data.gcp_vm_list)
        })
    }
    const data: any = { projectList, ec2List, rdsList, userList, vmList }
    // console.log(data)
    // Pass data to the page via props
    return { props: { data } }
}