import { Table, Button, Layout, Form, Input, Checkbox, notification } from 'antd';
import { useEffect, useState } from 'react';
import axios from 'axios';
import HeaderComponent from '@/shared/components/header';
import { useAuth } from '../shared/utils/auth-context';
import { error } from 'console';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
const { Content } = Layout;
const { useForm } = Form;

export default function AddProjectsByListingEC2ListandRDSList({ data }: any) {
    const [showAddUser, setAddUser] = useState<boolean>(false)
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
                return <Button type="primary" onClick={() => editProject(record)}>Edit</Button>;
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
    const editProject = (record: any) => {
        setAction("edit")
        fetchProjectsFromDB(record.id);
        setName(record.project_name)
        setID(record.id)
        setAddUser(true);
    }
    const deleteProject = (record: any) => {
        axios.post('/api/add-project', { id: record.id }, { headers: { 'Authorization': token, action: "delete", userID } }).then((response: any) => {

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
        setAddUser(true);
        getProjectList([], [])
    };
    const getProjectList = async (aws_ec2: any, aws_rds: any) => {
        await axios.get('/api/sync', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${token}`,
            }
        }).then((response: any) => {
            const { ec2_instance_list, rds_identifiers, project_details, vmList } = response.data;
            // console.log(response.data);
            const updatedec2List: any = ec2_instance_list
                .filter((topItem: any) =>
                    aws_ec2.some((existItem: any) => existItem.id === topItem.id)
                )
                .map((item: any) => item.id);
            const updatedrdsList: any = rds_identifiers
                .filter((topItem: any) =>
                    aws_rds.some((existItem: any) => existItem.id === topItem.id)
                )
                .map((item: any) => item.id);
            setEC2(updatedec2List);
            setRDS(updatedrdsList)
            // setVM(vmList);
            // setFormValues(...formValues,{ id: selectedId, name: name, ec2Instances: selectedEc2, rdsIdentifiers: selectedRDS } )
            var filtered_ec2_list = ec2_instance_list.filter((item: any) => !item.status.includes("termin"));
            var filtered_rds_list = rds_identifiers.filter((item: any) => !item.status.includes("delet"));
            setEC2List(filtered_ec2_list);
            setRDSList(filtered_rds_list);
            setVMList(vmList)
            form.setFieldsValue({ id: selectedId, name: name, ec2Instances: selectedEc2, rdsIdentifiers: selectedRDS })

        })
    }
    const fetchProjectsFromDB = async (id: any) => {
        try {
            axios.get('/api/get-project-list', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${token}`,
                    id,
                    isSuperAdmin,
                }
            }).then((response: any) => {
                debugger;
                if (id == "") {
                    setProjects(response.data.projectList)
                } else {
                    getProjectList(response.data.aws_ec2_list, response.data.aws_rds_list)
                }

            })
        } catch (error) {
            console.error(error);
        }
    };
    const handleFormSubmit = (event: any) => {
        try {

            axios.post('/api/add-project', formValues, { headers: { 'Authorization': token, action, userID } }).then((response: any) => {
                getProjectList([], [])
                notification.success({
                    message: 'Success',
                    description: response.data.message,
                    placement: 'topRight',
                    duration: 3
                });
                form.resetFields();
                setAction("add")
                setAddUser(false);
                setEC2List([]);
                setRDSList([]);
                setVMList([]);
                fetchProjectsFromDB("");
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
            <HeaderComponent title="Projects" />
            <Content style={{ padding: "50px", display: 'flex', justifyContent: 'center', alignContent: 'center' }}>

                {showAddUser ? (
                    <div style={{ width: "50%" }}>
                        {/* Add project form goes here */}
                        <div style={{ marginBottom: "20px" }}>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h1>Add Projects</h1>
                                <Button type="primary" onClick={() => {
                                    setAction("add")
                                    setAddUser(false);
                                    setEC2List([]);
                                    setRDSList([]);
                                    setVMList([]);
                                    fetchProjectsFromDB("");
                                    setName("");
                                    setID("");
                                }}>Back to List</Button>
                            </div>

                        </div>

                        <Form form={form} initialValues={{ remember: true }}
                            onFinish={handleFormSubmit}
                            onValuesChange={handleFormValuesChange}
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
                                <Input disabled={action === "edit"} />
                            </Form.Item>
                            <Form.Item
                                label="EC2 Instances"
                                valuePropName="value"
                                name="ec2Instances"
                            >
                                <Checkbox.Group name="ec2Instances" defaultValue={selectedEc2}>
                                    {ec2List.map((ec2: any) => (
                                        <Checkbox key={ec2.id} value={ec2.id} checked={action == "edit" ? ec2.checked : false}>
                                            {ec2.name}
                                        </Checkbox>
                                    ))}
                                </Checkbox.Group>
                                {/* disabled={(action == "add" && ec2.is_mapped)} */}
                            </Form.Item>
                            <Form.Item
                                label="RDS Identifiers"
                                name="rdsIdentifiers"
                                valuePropName="value"
                            >
                                <Checkbox.Group name="rdsIdentifiers" defaultValue={selectedRDS}>
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
                                <Checkbox.Group name="vmInstances" defaultValue={selectedVM}>
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
                ) : (
                    <div style={{ width: "100%" }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2>Projects List</h2>
                            <Button type="primary" onClick={handleAddProject} >
                                Add Project
                            </Button>
                        </div>
                        <Table columns={columns} dataSource={projects} style={{ marginTop: '20px' }} />
                    </div>
                )}
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