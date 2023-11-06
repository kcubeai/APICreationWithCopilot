import { Table, Button, Layout, Form, Input, Checkbox, notification } from 'antd';
import { useEffect, useState } from 'react';
import axios from 'axios';
import HeaderComponent from '@/shared/components/header';
import { useAuth } from '../shared/utils/auth-context';
import { error } from 'console';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import EditProjectsByListingEC2ListandRDSList from '@/shared/components/editComponent';
import Head from 'next/head';
// import EditProjectsByListingEC2ListandRDSList from './edit-project/[edit_project]';
const { Content } = Layout;
const { useForm } = Form;

export default function AddProjectsByListingEC2ListandRDSList({ data }: any) {
    const [showAddUser, setAddUser] = useState<boolean>(false)
    const [showList, setShowList] = useState<boolean>(true);
    const { token, isSuperAdmin, isAdmin, isUser, userID } = useAuth()
    const router = useRouter()
    const [form] = useForm();
    const [ec2List, setEC2List] = useState<any>([]);
    const [rdsList, setRDSList] = useState<any>([]);
    const [vmList, setVMList] = useState<any>([]);
    const [projects, setProjects] = useState(data.projectList ? data.projectList : []);
    const [action, setAction] = useState<string>("add");
    const [name, setName] = useState("")
    const [selectedId, setID] = useState<any>("");
    const [selectedEc2, setEC2] = useState<any>([]);
    const [selectedRDS, setRDS] = useState<any>([])
    const [selectedVM, setVM] = useState<any>([]);
    const [showEdit, setShowEdit] = useState<boolean>(false);
    const [editDetails, setEditDetails] = useState<any>({});
    const columns = [
        {
            title: 'S.No',
            dataIndex: 'serialNo',
            key: 'serialNo',
            render: (text: string, record: any, index: number) => index + 1
        }, {
            title: 'Project Name',
            dataIndex: 'project_name',
            key: 'project_name',
        },
        {
            title: 'Edit',
            dataIndex: 'edit',
            key: 'edit',
            render: (text: string, record: any) => {
                return <Button type="primary" onClick={() => {
                    editProject(record);
                    // router.push(`/edit-project/${record.id}`)
                }}>Edit</Button>;
            }
        },
        {
            title: 'Delete',
            dataIndex: 'delete',
            key: 'delete',
            render: (text: string, record: any) => {
                return <Button type="dashed" onClick={() => deleteProject(record)}>Delete</Button>;
            }
        }
    ];
    const editProject = async (record: any) => {
        const res = await axios.get('/api/get-project-list', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token,
                id: record.id,
                isSuperAdmin: true,
            }
        })
        const list = await axios.get('/api/sync', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token,
            }
        })
        const data: any = { project_detail: res.data, entire_list: list.data }
        setEditDetails(data);
        setShowList(false);
        setShowEdit(true);
    }
    const deleteProject = (record: any) => {
        axios.post('/api/add-project', { id: record.id }, { headers: { 'Authorization': token, action: "delete", userID } }).then((response: any) => {

            fetchProjectsFromDB({ id: "", project_name: "" });
            notification.success({
                message: 'Success',
                description: response.data.message,
                placement: 'topRight',
                duration: 3
            });
        }).catch((error: any) => {
            notification.error({
                message: 'Info',
                description: error.response.data.error,
                placement: 'topRight',
                duration: 3
            });
        })

    }
    const [formValues, setFormValues] = useState({
        id: "",
        name: '',
        ec2Instances: [],
        rdsIdentifiers: [],
        vmInstances: []
    });

    const handleFormValuesChange = (changedValues: any, allValues: any) => {
        setFormValues(allValues);
        setShowList(false);
        setAddUser(true);
    };
    useEffect(() => {
        if (token == "") {
            router.push('/login')
        }
    })
    const isFormValid = () => {
        return ((formValues.name && formValues.name.length > 0) && ((formValues.ec2Instances && formValues.ec2Instances.length > 0) || (formValues.rdsIdentifiers && formValues.rdsIdentifiers.length > 0) || (formValues.vmInstances && formValues.vmInstances.length > 0)))
    }
    const handleAddProject = () => {
        // Add new project to the list
        setAction("add")
        setShowList(false);
        setAddUser(true);
        getProjectList([], [], "", "")
    };
    const getProjectList = async (aws_ec2: any, aws_rds: any, id: any, proj_name: any) => {

        await axios.get('/api/sync', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${token}`,
            }
        }).then((response: any) => {
            const { ec2_instance_list, rds_identifiers, project_details, vmList } = response.data;
            // console.log(response.data);
            const updatedec2List: any = ec2_instance_list.filter((topItem: any) => aws_ec2.some((existItem: any) => existItem.id == topItem.id)).map((item: any) => item.id);
            ec2_instance_list.forEach((topItem: any) => aws_ec2.some((existItem: any) => { if (existItem.id === topItem.id) { topItem.checked = true; } else { topItem.checked = false; } }))
            const updatedrdsList: any = rds_identifiers.filter((topItem: any) => aws_rds.some((existItem: any) => existItem.id === topItem.id)).map((item: any) => item.id);
            rds_identifiers.forEach((topItem: any) => aws_rds.some((existItem: any) => { if (existItem.id === topItem.id) { topItem.checked = true; } else { topItem.checked = false; } }))
            const updatedvmList: any = vmList.filter((topItem: any) => aws_rds.some((existItem: any) => existItem.id === topItem.id)).map((item: any) => item.id);
            vmList.forEach((topItem: any) => aws_rds.some((existItem: any) => { if (existItem.id === topItem.id) { topItem.checked = true; } else { topItem.checked = false; } }))
            setEC2(updatedec2List);
            setRDS(updatedrdsList)
            setFormValues({ "id": id, "name": proj_name, "ec2Instances": updatedec2List, "rdsIdentifiers": updatedrdsList, "vmInstances": updatedvmList })

            var filtered_ec2_list = ec2_instance_list.filter((item: any) => !item.status.includes("termin"));
            var filtered_rds_list = rds_identifiers.filter((item: any) => !item.status.includes("delet"));
            var defaultOptions: any = []
            ec2_instance_list.forEach((topItem: any) => { defaultOptions.push({ label: topItem.name, value: topItem.id }) })

            setEC2List(defaultOptions);
            setRDSList(filtered_rds_list);
            setVMList(vmList)
        })
    }
    const fetchProjectsFromDB = async (record: any) => {
        try {
            axios.get('/api/get-project-list', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${token}`,
                    id: record.id,
                    isSuperAdmin,
                }
            }).then((response: any) => {
                if (record.id == "") {
                    setProjects(response.data.projectList)
                } else {
                    getProjectList(response.data.aws_ec2_list, response.data.aws_rds_list, record.id, record.project_name)
                }

            })
        } catch (error) {
            console.error(error);
        }
    };
    const handleFormSubmit = (event: any) => {
        try {

            axios.post('/api/add-project', formValues, { headers: { 'Authorization': token, action, userID } }).then((response: any) => {
                getProjectList([], [], "", "")
                notification.success({
                    message: 'Success',
                    description: response.data.message,
                    placement: 'topRight',
                    duration: 3
                });
                setFormValues({
                    id: "",
                    name: '',
                    ec2Instances: [],
                    rdsIdentifiers: [],
                    vmInstances: []
                })
                form.resetFields();
                setAction("add")
                setShowList(true);
                setAddUser(false);
                setEC2List([]);
                setRDSList([]);
                setVMList([]);
                fetchProjectsFromDB({ id: "", project_name: "" });
                setName("");
                setID("");
            }).catch((error: any) => {
                notification.error({
                    message: 'Info',
                    description: error.response.data.error,
                    placement: 'topRight',
                    duration: 3
                });
            })
        } catch (error: any) {
            notification.error({
                message: 'Info',
                description: error.response.data.error,
                placement: 'topRight',
                duration: 3
            });
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
            <HeaderComponent title="Projects" />
            <Content style={{ padding: "50px", display: 'flex', justifyContent: 'center', alignContent: 'center' }}>
                <>

                    {showAddUser ? (
                        <div style={{ width: "50%" }}>
                            {/* Add project form goes here */}
                            <div style={{ marginBottom: "20px" }}>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h1>Add Projects</h1>
                                    <Button type="primary" onClick={() => {
                                        setAction("add")
                                        setShowList(true)
                                        setAddUser(false);
                                        setEC2List([]);
                                        setRDSList([]);
                                        setVMList([]);
                                        fetchProjectsFromDB({ id: "", project_name: "" });
                                        setName("");
                                        setID("");
                                    }}>Back to List</Button>
                                </div>

                            </div>

                            <Form form={form}
                                onFinish={handleFormSubmit}
                                onValuesChange={handleFormValuesChange}
                                initialValues={formValues}
                            >
                                <Form.Item
                                    label="Project Name"
                                    name="name"
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Please input the project name!',
                                        },
                                    ]}
                                >
                                    <Input defaultValue={name} disabled={action === "edit"} />
                                </Form.Item>
                                <Form.Item
                                    label="EC2 Instances"
                                    // valuePropName="value"
                                    name="ec2Instances"
                                >
                                    <Checkbox.Group
                                        options={ec2List}
                                        defaultValue={selectedEc2}
                                    // onChange={onChange}
                                    />
                                    {/* <Checkbox.Group name="ec2Instances" defaultValue={selectedEc2}>
                                    {ec2List.map((ec2: any) => (
                                        <Checkbox key={ec2.id} value={ec2.id} checked={action == "edit" ? ec2.checked : false}>
                                            {ec2.name}
                                        </Checkbox>
                                    ))}
                                </Checkbox.Group> */}
                                    {/* disabled={(action == "add" && ec2.is_mapped)} */}
                                </Form.Item>
                                <Form.Item
                                    label="RDS Identifiers"
                                    name="rdsIdentifiers"
                                // valuePropName="value"
                                >
                                    {/* value={selectedRDS} */}
                                    <Checkbox.Group value={selectedRDS} >
                                        {rdsList.map((rds: any) => (
                                            <Checkbox key={rds.id} value={rds.id} checked={action == "edit" ? rds.checked : false}>
                                                {rds.name}
                                            </Checkbox>
                                        ))}
                                        {/* disabled={(action == "add" && rds.is_mapped)}  */}
                                    </Checkbox.Group>
                                </Form.Item>
                                <Form.Item
                                    label="VM Instances"
                                    name="vmInstances"
                                    valuePropName="value"
                                >
                                    {/* value={selectedVM} */}
                                    <Checkbox.Group name="vmInstances" value={selectedVM}>
                                        {vmList.map((rds: any) => (
                                            <Checkbox key={rds.id} value={rds.id}>
                                                {rds.name}
                                            </Checkbox>
                                        ))}
                                        {/* disabled={rds.is_mapped} */}
                                    </Checkbox.Group>
                                </Form.Item>
                                <Form.Item>
                                    <Button style={{ cursor: isFormValid() ? 'pointer' : 'not-allowed', opacity: isFormValid() ? 1 : 0.5 }}
                                        type="primary"
                                        htmlType="submit"
                                        disabled={!isFormValid()}
                                    >
                                        {action === "add" ? "Add Project" : "Edit Project"}
                                    </Button>
                                </Form.Item>
                            </Form>
                        </div>
                    ) : null}
                    {showList ? (
                        <div style={{ width: "100%" }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2>Projects List</h2>
                                <Button type="primary" onClick={handleAddProject} >
                                    Add Project
                                </Button>
                            </div>
                            <Table columns={columns} dataSource={projects} style={{ marginTop: '20px' }} />
                        </div>
                    ) : null}
                    {
                        showEdit ? (<>
                            <EditProjectsByListingEC2ListandRDSList data={editDetails} onClose={() => { setShowList(true); setShowEdit(false) }} />
                        </>) : null
                    }
                </>
            </Content>

        </Layout>
    )
}
export const getServerSideProps: GetServerSideProps = async () => {
    var projectList: any = [];
    await axios.get(process.env.NEXT_PUBLIC_MOCK_PATH + '/api/get-project-list', { headers: { Authorization: process.env.NEXT_PUBLIC_APP_KEY, id: '', isSuperAdmin: true } }).then((response: any) => {
        if (response.data.projectList && response.data.projectList.length > 0) {
            projectList.push(...response.data.projectList);

        }

    })
    const data: any = { projectList }
    console.log(projectList)
    // Pass data to the page via props
    return { props: { data } }
}