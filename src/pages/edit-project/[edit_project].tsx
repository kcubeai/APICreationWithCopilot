import HeaderComponent from "@/shared/components/header";
import { useAuth } from "@/shared/utils/auth-context";
import { Button, Checkbox, Form, Input, Layout, notification } from "antd";
import axios from "axios";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";
const { Content } = Layout;
export default function EditProjectsByListingEC2ListandRDSList({ data }: any) {
    const [projectName, setProjectName] = useState<any>(data.project_detail.project_details.project_name)
    const [ec2List, setEC2List] = useState<any>(data.entire_list.ec2_instance_list);
    var defaultOptions: any = [];
    const router = useRouter()
    // data.entire_list.ec2_instance_list.forEach((topItem: any) => { defaultOptions.push({ label: topItem.name, value: topItem.id }) })
    // const [ec2List, setEC2List] = useState<any>(defaultOptions);
    const [rdsList, setRDSList] = useState<any>(data.entire_list.rds_identifiers);
    const [vmList, setVMList] = useState<any>(data.entire_list.vmList);
    const [selectedec2, setSelectedEc2] = useState<any>(data.entire_list.ec2_instance_list.filter((topItem: any) => data.project_detail.aws_ec2_list.some((existItem: any) => existItem.id == topItem.id)).map((item: any) => item.id))
    const [selectedrds, setSelectedRDS] = useState<any>(data.entire_list.rds_identifiers.filter((topItem: any) => data.project_detail.aws_rds_list.some((existItem: any) => existItem.id == topItem.id)).map((item: any) => item.id))
    const [selectedvm, setSelectedVM] = useState<any>(data.entire_list.vmList.filter((topItem: any) => data.project_detail.gcp_vm_list.some((existItem: any) => existItem.id == topItem.id)).map((item: any) => item.id))
    const { register, handleSubmit, setError, clearErrors, formState: { errors }, control, setValue, getValues, watch } = useForm<any>({
        defaultValues: {
            "projectName": data.project_detail.project_details.project_name,
            "ec2Instances": selectedec2,
            "rdsIdentifiers": selectedrds,
            "vmInstances": selectedvm
            // "ec2Instances": data.entire_list.ec2_instance_list.filter((topItem: any) => data.project_detail.aws_ec2_list.some((existItem: any) => existItem.id == topItem.id)).map((item: any) => item.id)
        }
    });
    const { token, userID } = useAuth()
    const customHandleSubmit = async (e: any) => {
        handleSubmit((formData, e) => {
            console.log(formData)

        })()
    }
    const onSubmit = async (formdata: any) => {
        var formValues: any = {
            id: data.project_detail.project_details.id,
            name: formdata.projectName,
            ec2Instances: formdata.ec2Instances,
            rdsIdentifiers: formdata.rdsIdentifiers,
            vmInstances: formdata.vmInstances
        };
        try {
            await axios.post('/api/add-project', formValues, { headers: { 'Authorization': token, action: "edit", userID } }).then((response: any) => {
                if (response.status == 200) {
                    notification.success({
                        message: 'Success',
                        description: 'Project updated Successfully',
                        placement: 'topRight',
                        duration: 3
                    });
                    router.push('/add-projects');
                }
            })
        } catch (error) {
            notification.error({
                message: 'Error',
                description: 'Issue in editing the project details',
                placement: 'topRight',
                duration: 3
            });
            console.error(error);
        }

    };
    return (
        <Layout>
            <HeaderComponent title="" />
            <Content style={{ padding: "50px", display: 'flex', justifyContent: 'center', alignContent: 'center' }}>
                {/* <Checkbox.Group
                    options={ec2List}
                    defaultValue={selectedec2}
                // onChange={onChange}
                /> */}
                <div style={{ width: "50%" }}>
                    {/* Add project form goes here */}
                    <div style={{ marginBottom: "20px" }}>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h1>Add Projects</h1>
                            <Button type="primary" onClick={() => { router.push('/add-projects'); }}>Back to List</Button>
                        </div>

                    </div>

                    {/* <Form > */}
                    {/* <Form.Item
                            label="Project Name"
                            name="name"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input the project name!',
                                },
                            ]}
                        >
                            <Input defaultValue={projectName} {...register("projectName", { required: true })} />
                        </Form.Item> */}
                    {/* <form onClick={customHandleSubmit}> */}
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }} className="form-control">
                            <label style={{ marginRight: '16px', fontWeight: 'bold' }}>Project Name</label>
                            <Input defaultValue={getValues("projectName")}  {...register("projectName", { required: true })} onChange={(newValue) => setValue("projectName", newValue.target.value)} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                            <label style={{ marginRight: '16px', fontWeight: 'bold' }}>EC2 Instances</label>
                            <Checkbox.Group defaultValue={getValues("ec2Instances")} onChange={(newValue) => setValue("ec2Instances", newValue)}>
                                {ec2List.map((ec2: any) => (
                                    <Checkbox key={ec2.id} value={ec2.id}  {...register('ec2Instances')} // Register the Checkbox with the group
                                    >
                                        {ec2.name}
                                    </Checkbox>
                                ))}

                            </Checkbox.Group>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                            <label style={{ marginRight: '16px', fontWeight: 'bold' }}>RDS Identifiers</label>
                            <Checkbox.Group defaultValue={getValues("rdsIdentifiers")} onChange={(newValue) => setValue("rdsIdentifiers", newValue)}>
                                {rdsList.map((rds: any) => (
                                    <Checkbox key={rds.id} value={rds.id} {...register("rdsIdentifiers")}>
                                        {rds.name}
                                    </Checkbox>
                                ))}
                            </Checkbox.Group>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                            <label style={{ marginRight: '16px', fontWeight: 'bold' }}>VM Instances</label>
                            <Checkbox.Group defaultValue={getValues("vmInstances")} onChange={(newValue) => setValue("vmInstances", newValue)}>
                                {vmList.map((rds: any) => (
                                    <Checkbox key={rds.id} value={rds.id} {...register("vmInstances")}>
                                        {rds.name}
                                    </Checkbox>
                                ))}
                            </Checkbox.Group>
                        </div>
                        <Button htmlType="submit" disabled={!watch("projectName") || !(watch("ec2Instances")?.length || watch("rdsIdentifiers")?.length || watch("vmInstances")?.length)}>
                            Edit Project
                        </Button>
                    </form>
                </div>
            </Content>
        </Layout>
    )
}
// This gets called on every request
export const getServerSideProps: GetServerSideProps = async (context) => {
    const { edit_project } = context.query;
    const res = await axios.get(process.env.NEXT_PUBLIC_MOCK_PATH + '/api/get-project-list', {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': process.env.NEXT_PUBLIC_APP_KEY,
            id: edit_project,
            isSuperAdmin: true,
        }
    })
    const list = await axios.get(process.env.NEXT_PUBLIC_MOCK_PATH + '/api/sync', {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': process.env.NEXT_PUBLIC_APP_KEY,
        }
    })
    const data: any = { project_detail: res.data, entire_list: list.data }
    // Pass data to the page via props
    return { props: { data } }
}
