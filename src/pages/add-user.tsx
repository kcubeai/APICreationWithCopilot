import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { Spin } from 'antd';
import { Button, Checkbox, Form, Input, Layout, Radio, Table, notification,Modal } from "antd";
const { useForm } = Form;
const { Header, Content } = Layout;
import { useAuth } from "@/shared/utils/auth-context";
import { useRouter } from "next/router";
import Head from "next/head";
import HeaderComponent from "@/shared/components/header";
import axios from "axios";
import { GetServerSideProps } from "next";
import EditUserByListing from '@/shared/components/edit_user';
// import isEqual from 'lodash/isEqual';
import { set } from "react-hook-form";
export default function AddUserWithNamePasswordEmail({ data }: any) {
    const [loading, setLoading] = useState<boolean>(true);
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
  
    const [action, setAction] = useState<string>("add");
    // const [ec2CheckList, setEc2CheckList] = useState(data.ec2List ? data.ec2List.filter((item: any) => !item.status.includes("termin")) : []);
    // const [rdsCheckList, setRDSCheckList] = useState(data.rdsList ? data.rdsList.filter((item: any) => !item.status.includes("delet")) : []);
    // const [vmCheckList, setVMCheckList] = useState(data.vmList ? data.vmList : [])
    const getdistinctValues = (data: any) => {
        const distinctObjects = data.reduce((acc: any, obj: any) => {
            // If the status is not 'termin', keep the object
            // if (!obj.status.includes("termin") && !obj.status.includes("dele")) {
            acc[obj.id] = obj;
            // }
            return acc;
        }, {});
      

        // Convert the object back to an array
        const distinctArray = Object.values(distinctObjects);
        return distinctArray
    }
   

    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
    const [ec2CheckList, setEc2CheckList] = useState(data.ec2List ? getdistinctValues(data.ec2List) : []);
    const [rdsCheckList, setRDSCheckList] = useState(data.rdsList ? getdistinctValues(data.rdsList) : []);
    const [vmCheckList, setVMCheckList] = useState(data.vmList ? getdistinctValues(data.vmList) : []);
    const [showEdit, setShowEdit] = useState<boolean>(false);
    const [editDetails, setEditDetails] = useState<any>({});
    const [showList, setShowList] = useState<boolean>(true);
    const [open, setOpen] = useState(false);
    
    const [passwordError, setPasswordError] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const[project_user,setProject_user]=useState<any>([]);
    const[userwithproject,setUserwithproject]=useState<any>([]);
    const searchInProgress = useRef(false);
    // setLoading(true);
    // useEffect(() => {
        
    //     setLoading(false);
    // }, [data]);

    useEffect(() => {
        if (data !== null) {
          setLoading(true)
          if (data !== undefined) {
    
            if (data.length > 0) {
                setLoading(false)
            }
          }
        //   data = undefined
        
          setTimeout(() => { setLoading(false) }, 1000)
        }
    }, [data])
    const showModal = () => {
        setOpen(true);
    };
    const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(event.target.value);
    };

    const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(event.target.value);

        // const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

        if (!passwordRegex.test(password)) {
            setPasswordError('Password must contain at least 8 characters, including at least one letter and one number.');
        } else {
            setPasswordError('');
        }
    };

    const handlePasswordBlur = () => {
        // Notify the user when they move to the next field (on blur)
        if (passwordError) {
            console.log('Error: Password is not valid.');
            // You can show a notification or perform other actions to notify the user
        }
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
                if (record.issuperadmin) {
                    return <Button  type="primary" disabled >Edit</Button>;
                }
                else{
             
                    return <Button  type="primary" //redirect to the [edit-user].tsx page with the respective user id
                 
                    onClick={() => {
                        setLoading(true);
                        setShowList(false);
                        setShowEdit(true);
                        editUser(record);
                        getProjectList();   
                    
                    }}>Edit</Button>;
                    // onClick={() => router.push(`/edit_user/${record.id}`)} >Edit</Button>;
    
                
            }
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
        setUserList([])
        axios.post('/api/add-user', { id: record.id }, { headers: { "authorization": token, action: 'delete', userID } }).then((response: any) => {
            if (response.data.status == 200) {
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
    const memoizedProjectUser = useMemo(() => project_user, [project_user]);
    useEffect(() => {
     
        if (project_user.length > 0) {
            const prevProjectUser = project_user;  
            getProjectuser();

             if (prevProjectUser !== project_user) {
                setProject_user(project_user);
            }
        }
    }, [memoizedProjectUser]); 

    // useEffect(() => {
    //     if (userwithproject.length > 0) {
    //         setUserwithproject(userwithproject);
    // }
    // }, [userwithproject]);

    // useEffect(() => {
    //     if (userwithproject == "") {
          
    //     }

    // }, [userwithproject])

    const memoizedUserWithProject = useMemo(() => userwithproject, [userwithproject]);

    useEffect(() => {
        if (token == "") {
            router.push('/login')
        }
        if (isAdmin) {
 
            handleSearch() 
        }
   
    }, [memoizedUserWithProject, isAdmin])
    // useEffect(() => {
    //     // Code to run on mount
    // }, [project_user]);

   // Added token as a dependency
    
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
    const handleUsernameBlur = () => {
        // Check if the username contains whitespace
        if (/\s/.test(username)) {
            setUsernameError('Username cannot contain spaces');
        } else {
            setUsernameError('');
        }
    };
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

    const handleReset = () => {
        const userproj = axios.get(`/api/get-user-list`, {
            headers: { 
                'Context-Type': 'application/json',
                'Authorization': token ,
                // id: edit,
                id: userID,
        },

       
        })
    };


  
    const handleSearch = async () => {
       await fetchProjectsFromDB();

            const filtered = userList.filter((item: any) => {
                if (userwithproject.includes(item.id) && item.isuser) {
                    // console.log("filter c",item)
                    return true
                }
            });
            setFilterList(filtered);

        // console.log("filter",filteredWishlist)  
        // console.log("filter1",userwithproject.includes(item.id))
    };


    const isFormValid = () => {
        if (username.length < 1) return false;
        if (password.length < 1) return false;
        if (!passwordRegex.test(password)) return false;
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



    const editUser = async (record: any) => {
         // const {edit} = context.query;
        // const id = Array.isArray(edit) ? edit[0] : edit;
        // console.log(record.id)
        // const res = await axios.get(process.env.NEXT_PUBLIC_MOCK_PATH+`/api/get-user-list`, {
            const res = await axios.get(`/api/get-user-list`, {
            headers: { 
               'Context-Type': 'application/json',
               'Authorization': token ,
               // id: edit,
               id: record.id,
       },
      
       })
        const list = await axios.get('/api/sync', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token,
            }
        })

        const proj = await axios.get('/api/get-project-list', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token,
                id: record.id,
                // isSuperAdmin: record.issuperadmin,
                // isAdmin: record.isadmin,
            }
            
        })

        var projectList: any = [];
        var ec2List: any = [];
        var rdsList: any = [];
        var userList: any = []
        var vmList: any = [];
        await axios.get('/api/get-user-list', { headers: { 'Authorization': token, } }).then((response: any) => {
            if (response.data.userList && response.data.userList.length > 0) {
                userList.push(...response.data.userList);
    
            }
    
        })
        await axios.get('/api/get-project-list', { headers: {  'Authorization': token, id: '', isSuperAdmin: true } }).then((response: any) => {
            if (response.data.projectList && response.data.projectList.length > 0) {
                projectList.push(...response.data.projectList);
    
            }
    
        })
        for (const projects of projectList) {
            await axios.get('/api/get-project-list', { headers: { 'Authorization': token, id: projects.id } }).then((response: any) => {
                ec2List.push(...response.data.aws_ec2_list)
                rdsList.push(...response.data.aws_rds_list)
                vmList.push(...response.data.gcp_vm_list)
            })
        }
        // const data: any = { projectList, ec2List, rdsList, userList, vmList }

      // const data: any = { project_detail: res.data, entire_list: list.data }
      const data: any={userDetail:res.data, entire_list: list.data, project_detail: proj.data, projectList, ec2List, rdsList, userList, vmList}
    //   console.log("data", data)
      // return { props: { data } };
      setEditDetails(data);
      setTimeout(() => {
        setLoading(false);
        setShowList(false);
        setShowEdit(true);
    
    }, 2000);
      
    }
    const handleSubmit = (event: any) => {
        const formValues = form.getFieldsValue()
        axios.post('/api/add-user', formValues, { headers: { "authorization": token, userID } }).then((response: any) => {
            getUserList()
            if (response.data.status == 200) {
                notification.success({
                    message: 'Success',
                    description: "User added successfully",
                    placement: 'topRight',
                    duration: 3
                });
                form.resetFields();
                setShowAdd(false);
                setShowList(true);
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
 
    interface Project {
        id: string;
    }

    const fetchProjectsFromDB = async () => {
    // async function fetchProjectsFromDB()  {   
        try{
         
            // console.log("user", userID)
       await axios.get('/api/get-project-list', { headers: { authorization: token, id: '', isAdmin, userID } }).then((response: any) => {
       
            if (response.data && response.data.projectList && Array.isArray(response.data.projectList) && response.data.projectList.length > 0) {
                const project_user1 = response.data.projectList.map((item: any) => item.id);
                setProject_user(project_user1);
              
                console.log("user_proj", project_user);
              } else {
                setProject_user([]);
                console.error('Invalid or empty projectList in the API response:', response.data);
    
              }
        })
        
    }
        catch (error) {
            console.error('Error fetching data:', error);

          }

    }
   


    // async function getProjectuser() {     
       const getProjectuser = async () => {       
        // console.log("projectforuser_api_get",project_user)

        const project_user_1= project_user

        try{  
            // await fetchProjectsFromDB();
                
         axios.get('/api/get-project-user', { headers: { authorization: token, 'Content-Type': 'application/json',
        'project_user': JSON.stringify(project_user)} }).then((response: any) => {
            // console.log("api called",response.data.data)

            if (Array.isArray(response.data.data) && response.data.data.length > 0) {
            const user_mapped_project = response.data.data.map((item: any) => item.user_id);
        
            // setUserwithproject(user_mapped_project);
            if (user_mapped_project.length !== userwithproject.length) { // Use a deep equality check
                setUserwithproject(user_mapped_project);
            }
            // console.log("project_user_final_decalred",userwithproject)
            }
            else {
                setUserwithproject([]);
                console.error("project_user_final",'response.data is not an array:', response.data.data);
              }
        })
    }
    catch (error) {
        console.error('Error fetching data:', error);
      }
    }



    const getProjectList = () => {
        if (isAdmin) {
            // console.log("called")
            axios.get('/api/get-project-list', { headers: { authorization: token, id: '', isAdmin, userID } }).then((response: any) => {
                if (response.data.projectList && response.data.projectList.length > 0) {
                    setProjectCheckList(response.data.projectList);

                    var ec2List: any = []
                    var rdsList: any = []
                    var vmList: any = []
                    for (const projects of response.data.projectList) {
                        axios.get('/api/get-project-list', { headers: { authorization: token, id: projects.id } }).then((response: any) => {
                            ec2List.push(...response.data.aws_ec2_list)
                            rdsList.push(...response.data.aws_rds_list)
                            vmList.push(...response.data.gcp_vm_list)

                            // setEc2CheckList(ec2List.filter((item: any) => !item.status.includes("termin")));
                            // setRDSCheckList(rdsList.filter((item: any) => !item.status.includes("delet")));
                            setEc2CheckList(getdistinctValues(ec2List));
                            setRDSCheckList(getdistinctValues(rdsList));
                            // setVMCheckList(vmList);
                            setVMCheckList(getdistinctValues(vmList))
                        })
                    }
                } else {
                    setProjectCheckList([])
                    setEc2CheckList([]);
                    setRDSCheckList([]);
                    // setVMCheckList(vmList);
                    setVMCheckList([])
                }

                // setEc2CheckList(ec2List.filter((item: any) => !item.status.includes("termin")));
                // setRDSCheckList(rdsList.filter((item: any) => !item.status.includes("delet")));
                // // setEc2CheckList(getdistinctValues(ec2List));
                // // setRDSCheckList(getdistinctValues(rdsList));
                // setVMCheckList(vmList);

            })
        }
    }

    const handleOk = () => {
        setOpen(false);
        setAction("add")
        setShowList(true)
        setShowAdd(false);
        // setEC2List([]);
        // setRDSList([]);
        // setVMList([]);
        // fetchProjectsFromDB({ id: "", project_name: "" });
        // setName("");
        // setID("");
    };
    


    const handleCancel = () => {
        // console.log('Clicked cancel button');
        setOpen(false);
    };
    return (

        <Layout>
            <Modal
                title="Title"
                open={open}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <p>Are you sure you wan to go back to list?</p>
            </Modal>

            <Head>
                <title>InterCloud Manager</title>
                <meta name="description" content="Generated by create next app" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <HeaderComponent title="Users" />
            <Content style={{ padding: "50px", display: 'flex', justifyContent: 'center', alignContent: 'center' }}>
            <> 
            {showAdd ? (

                    <div style={{ width: "50%" }}>
                        <div style={{ marginBottom: "20px" }}>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h1>Add Users</h1>
                                <Button type="primary" onClick={() => {

                                    getUserList()
                                    form.resetFields();
                                    // setShowAdd(true)
                                    showModal();
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
                                validateStatus={usernameError ? 'error' : ''}
                                help={usernameError}
                            >
                                {/* <Input value={username} onChange={(e) => {
                                    if (!/\s/.test(e.target.value)) {
                                        handleUsernameChange(e)
                                    } else {
                                        
                                        // setError('Username cannot contain spaces');
                                    }
                                }}/> */}

                                    <Input value={username} onChange={handleUsernameChange} onBlur={handleUsernameBlur} autoComplete="off" />
                            </Form.Item>

                            <Form.Item
                                label="Password"
                                name="password"
                                rules={[{ required: true, message: 'Please input your password!' }]}
                                validateStatus={passwordError ? 'error' : ''}
                                help={passwordError}
                            >
                                <Input.Password value={password} onChange={handlePasswordChange} onBlur={handlePasswordBlur} autoComplete="off"/>
                            </Form.Item>
                            <h6 style={{ marginBottom: '20px', padding: '5px' }}>Note: Atleast one special character and  one numerical character required</h6>

                            <Form.Item name="role" label="Select Role" rules={[{ required: true, message: "Please select a role" }]}>
                                <Radio.Group>
                                    {/* {isSuperAdmin ? <Radio value="issuperadmin" onChange={handleSuperAdminChange}>Is Super Admin</Radio> : null} */}
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
                                            if (projectList.some(value => ec2.project_ids.includes(value))) {
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
                                            if (projectList.some(value => rds.project_ids.includes(value))) {
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
                                            if (projectList.some(value => rds.project_ids.includes(value))) {
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
                    </div> 
                     ) : null}
                    {showList ? (<>

                            {loading ? (
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                                <Spin size="large" />
                            </div>
                                
                             ) :(
                    <div style={{ width: "100%" }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2>User List</h2>
                            <Button type="primary" onClick={() => { setShowAdd(true); setShowList(false); getProjectList(); }} >
                                Add User
                            </Button>
                        </div>
                        <Table columns={columns} dataSource={filterUserList} style={{ marginTop: '20px' }} />
                    </div>
                             )
                       
                    }
                      </>) : null}
                      {
                          showEdit ? (<>

                            {loading ? (
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                                <Spin size="large" />
                            </div>
                                 
                                ) :(
                              <EditUserByListing data={editDetails} onClose={() => { setShowList(true); setShowEdit(false) }} />
                                )
                            }
                                </>) : null
                                
                      }
                      </>

            </Content>
        </Layout >

    );

}

export const getServerSideProps: GetServerSideProps = async () => {
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
    
 
    const data: any = { projectList, ec2List, rdsList, userList, vmList };
 
    return { props: { data } }
}

