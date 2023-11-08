import React from 'react';
import HeaderComponent from "@/shared/components/header";
import { useAuth } from "@/shared/utils/auth-context";
import { Button, Checkbox, Form, Input, Layout,Radio, notification, Modal,Spin} from "antd";
import axios from "axios";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useState } from "react";
import { set, useForm } from "react-hook-form";
const { Content } = Layout;
import {useEffect} from "react";
import { useRouter } from "next/router";

    type FetchUserDetail={
        id:number,
        username:string,
    //    
        isadmin:boolean,
        issuperadmin:boolean,
        isuser:boolean,
        projectList:Array<{id:number,project_name:string}>
    }
    export default function editUser({data, onClose}:any){

        const[userDetail,setUserDetail]=useState<any>(data.userDetail.userList[0])
        const [name, setName] = useState<any>(data.userDetail.userList[0].username);
        const [userProjectAvailable, setUserProjectAvailable] = useState([]);
        // const [userProjectAvailable, setUserProjectAvailable] = useState(data.userDetail.projectAvailable[0]);
        const [userProjectList , setUserProjectList] = useState(data.userDetail.projectList[0]);
        // var radioCheck=[];
        // if(data.userDetail.userList[0].isadmin){
        //     radioCheck.push("admin")
        // }else if(data.userDetail.userList[0].issuperadmin){
        //     radioCheck.push("superadmin")
        // }else if(data.userDetail.userList[0].isuser){
        //     radioCheck.push("user")
        // }
        const [isAdmin, setUserisadmin] = useState<boolean>(data.userDetail.userList[0].isadmin);
        // const [userissuperadmin, setUserissuperadmin] = useState<boolean>(data.userDetail.userList[0].issuperadmin);
        // const[userisuser, setUserisuser] = useState<boolean>(data.userDetail.userList[0].isuser);
     
        const [username, setUsername] = useState("");
        const router = useRouter()
    const [password, setPassword] = useState("");
   
    const { token, userID } = useAuth()
 
    // const [projectList, setProjectList] = useState<{ id: number; project_name: string }[]>([]);
    const [projectList, setProjectList] = useState([]);
    const[projectAvailable,setProjectAvailable]=useState<{ id: number; project_name: string }[]>([]);
    // const [ec2List, setEC2List] = useState<any>(data.entire_list.ec2_instance_list);
    const[ec2List,setEC2List]=useState<any>([]);
    const [rdsList, setRDSList] = useState<any>(data.entire_list.rds_identifiers);
    const [vmList, setVMList] = useState<any>(data.entire_list.vmList);
    const [selectedProject, setSelectedProject] = useState<any>(data.userDetail.projectAvailable.filter((topItem: any) => data.userDetail.projectList.some((existItem: any) => existItem.id == topItem.id)).map((item: any) => item.id))
    // const [selectedec2, setSelectedEc2] = useState<any>(data.entire_list.ec2_instance_list.filter((topItem: any) => data.project_detail.aws_ec2_list.some((existItem: any) => existItem.id == topItem.id)).map((item: any) => item.id))
    const [userec2,setUserec2]=useState<any>(data.entire_list.ec2_instance_list.filter((topItem: any) => data.userDetail.ec2List.some((existItem: any) => existItem.instance_id== topItem.id)).map((item: any) => item.id))

    const [userrds,setUserrds]=useState<any>(data.entire_list.rds_identifiers.filter((topItem: any) => data.userDetail.rdsList.some((existItem: any) => existItem.identifier_id== topItem.id)).map((item: any) => item.id))
    const [uservm,setUservm]=useState<any>(data.entire_list.vmList.filter((topItem: any) => data.userDetail.vmList.some((existItem: any) => existItem.instance_id== topItem.id)).map((item: any) => item.id))
   
    const [open, setOpen] = useState(false);
    const showModal = () => {
        setOpen(true);
    };

    const getdistinctValues = (data: any) => {
        if (Array.isArray(data)) {
            const distinctObjects = data.reduce((acc: any, obj: any) => {
                acc[obj.id] = obj;
                return acc;
            }, {});
            const distinctArray = Object.values(distinctObjects);
            console.log(distinctArray);
            return distinctArray;
        } else {
            return [];
        }
    };
     
    const [projectCheckList, setProjectCheckList] = useState(data.projectList ? data.projectList : []);
    const [ec2CheckList, setEc2CheckList] = useState(data.ec2List ? getdistinctValues(data.ec2List) : []);
    const [rdsCheckList, setRDSCheckList] = useState(data.rdsList ? getdistinctValues(data.rdsList) : []);
    const [vmCheckList, setVMCheckList] = useState(data.vmList ? getdistinctValues(data.vmList) : []);
   console.log("ec2CheckList.......",ec2CheckList)
   console.log("project_chechlist",projectList)

    type FetchedValues = {
        userissuperadmin: boolean;
        userisadmin: boolean;
        userisuser: boolean;
      };
    const { register, handleSubmit,setValue, getValues, watch} = useForm<any>({
        defaultValues: {
            "name": data.userDetail.userList[0].username,
            "userisadmin": data.userDetail.userList[0].isadmin,
            "userissuperadmin": data.userDetail.userList[0].issuperadmin,
            "userisuser": data.userDetail.userList[0].isuser,
            // "role":radioCheck,
            "projectList": selectedProject,
            "ec2Instances": userec2,
            "rdsIdentifiers": userrds,
            "vmInstances": uservm
            // "ec2Instances": data.entire_list.ec2_instance_list.filter((topItem: any) => data.project_detail.aws_ec2_list.some((existItem: any) => existItem.id == topItem.id)).map((item: any) => item.id)
        }
    }
    );
 
    const [radioValue, setRadioValue] = useState('userisuser'); // Default value set to 'userisuser'
    const fetchedValues = {
      userissuperadmin: data.userDetail.userList[0].issuperadmin,
      userisadmin: data.userDetail.userList[0].isadmin,
      userisuser:  data.userDetail.userList[0].isuser,
    };
  
  useEffect(() => {
      if (fetchedValues.userissuperadmin) {
          setRadioValue('userissuperadmin');
      }
       if (fetchedValues.userisadmin) {
              setRadioValue('userisadmin');
          }
      if (fetchedValues.userisuser){
              setRadioValue('userisuser');
          }
  
  }, [fetchedValues.userissuperadmin]);


  const handleRadioChange = (e: any) => {
    setRadioValue(e.target.value);
    if (e.target.value === 'userisuser') {
      setValue('userisuser', true);
      setValue('userissuperadmin', false);
      setValue('userisadmin', false);
    } else if (e.target.value === 'userissuperadmin') {
      setValue('userissuperadmin', true);
      setValue('userisadmin', false);
      setValue('userisuser', false);
    } else {
      setValue('userisadmin', true);
      setValue('userissuperadmin', false);
      setValue('userisuser', false);
    }
  };
       
        
    console.log("isuser:", data.userDetail.userList[0].isuser);
    console.log("isadmin:", data.userDetail.userList[0].isadmin);
    console.log("project", userProjectAvailable);
    console.log("projectList", projectList);
    const projectId = selectedProject.map((project: any) => project.id);
    console.log("projectid..", selectedProject);
    console.log("select", selectedProject);
    console.log("ec2", ec2List);

    const { userissuperadmin, userisadmin, userisuser } = watch();

   
       
        useEffect(() => {
            // Check if data is an array, and set the state accordingly
            if (Array.isArray(data.userDetail.projectAvailable)) {
                setUserProjectAvailable(data.userDetail.projectAvailable);
            } else if (data.userDetail.projectAvailable && typeof data.userDetail.projectAvailable === 'object') {
                // If it's not an array, but an object, create an array with the single object
                setUserProjectAvailable([data.userDetail.projectAvailable] as never[]);
            }
        }, [data.userDetail.projectAvailable]);



   
        const handleProjectListChange = (value: any) => {
            // getProjectList()
            // setProjectList(value);
            setValue("projectList", value);
            setSelectedProject(value);
        };
        // const handleEC2ListChange = (setValue: any) => {
        //     // setEC2List(setValue);
        //     setValue("ec2Instances", setValue)
        // };
        // const handleRDSListChange = (setValue: any) => {
        //     // setRDSList(setValue);
        //     setValue("rdsIdentifiers", setValue)
        // };
        // const handleVMListChange = (setValue: any) => {
        //     // setVMList(setValue);
        //     setValue("rdsIdentifiers", setValue)
        // };
   
   
   
        const customHandleSubmit = async (e: any) => {
        handleSubmit((formData, e) => {
            // console.log(formData)

        })()
    }
    const onSubmit = async (formdata: any) => {
        var formValues: any = {
            id: data.userDetail.userList[0].id,
            username: formdata.name,
            isSuperAdmin: formdata.userissuperadmin,
            isAdmin: formdata.userisadmin,
            isUser: formdata.userisuser,
            updated_project_id: formdata.projectList,
            project_id: data.userDetail.projectList[0].id,
            user_project_id: selectedProject,
            ec2Instances: formdata.ec2Instances,
            rdsIdentifiers: formdata.rdsIdentifiers,
            vmInstances: formdata.vmInstances,
            
        };
       console.log("formValues",formValues)
        try {
            
            await axios.post('/api/add-user', formValues, { headers: { 'Authorization': token, action: "edit", userID } }).then((response: any) => {
                if (response.status == 200) {
                    notification.success({
                        message: 'Success',
                        description: 'User updated Successfully',
                        placement: 'topRight',
                        duration: 3
                    });
                    // router.push('/add-user');
                    onClose();
                }
            })

//  if (isAdmin) {
//                 console.log("called")
//                 axios.get('/api/get-project-list', { headers: { authorization: token, id: '', isAdmin, userID } }).then((response: any) => {
//                     if (response.data.projectList && response.data.projectList.length > 0) {
//                         setProjectCheckList(response.data.projectList);
    
//                         var ec2List: any = []
//                         var rdsList: any = []
//                         var vmList: any = []
//                         for (const projects of response.data.projectList) {
//                             axios.get('/api/get-project-list', { headers: { authorization: token, id: projects.id } }).then((response: any) => {
//                                 ec2List.push(...response.data.aws_ec2_list)
//                                 rdsList.push(...response.data.aws_rds_list)
//                                 vmList.push(...response.data.gcp_vm_list)

//                                 // setEc2CheckList(getdistinctValues(ec2List));
//                                 setRDSCheckList(getdistinctValues(rdsList));
                            
//                                 setVMCheckList(getdistinctValues(vmList))
//                             })
//                         }
//                     } else {
//                         setProjectCheckList([])
//                         // setEc2CheckList([]);
//                         setRDSCheckList([]);
//                         // setVMCheckList(vmList);
//                         setVMCheckList([])
//                     }
    
//                 })
//             }


         
        } catch (error) {
            notification.error({
                message: 'Error',
                description: 'Issue in editing the user details',
                placement: 'topRight',
                duration: 3
            });
            console.error(error);
        }

    };

    console.log("projectCheckList_edit", projectCheckList);
    // console.log("ec2CheckList_edit", ec2CheckList);
    console.log("from_edit_user",projectCheckList)

    useEffect(() => {
        if (token == "") {
            router.push('/')
        }
    })

    const handleOk = () => {
        setOpen(false);
        onClose();
    };

    const handleCancel = () => {
        // console.log('Clicked cancel button');
        setOpen(false);
    };
    const isDisabled = isAdmin ? !watch("projectList") : !(watch("projectList") || (watch("ec2Instances")?.length || watch("rdsIdentifiers")?.length || watch("vmInstances")?.length));
   
        return (
            // data
            <Layout>
                 <Modal
                title="Title"
                open={open}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <p>Are you sure you wan to go back to list?</p>
            </Modal>

            <Content style={{ padding: "50px", display: 'flex', justifyContent: 'center', alignContent: 'center' }}>

                <div style={{ width: "50%" }}>
                        <div style={{ marginBottom: "20px" }}>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h1>Update User</h1>
                            <Button type="primary" onClick={showModal}>Back to List</Button>
                            {/* <Button type="primary" onClick={() => { router.push('/add-user'); }}>Back to List</Button> */}
                        </div>

                        </div>

                        <form 
                        onSubmit={handleSubmit(onSubmit)}
                        >
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }} className="form-control">
                            <label style={{ marginRight: '16px', fontWeight: 'bold' }}>Name</label>
                            <Input defaultValue={getValues("name")}  {...register("name", { required: true })} onChange={(newValue) => setValue("name", newValue.target.value)} readOnly />
                        </div>


                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                            <label style={{ marginRight: '16px', fontWeight: 'bold' }}>Select Role</label>
                  
                                <Radio.Group
                                        value={radioValue}
                                        // defaultchecked={radioValue}
                                        onChange={handleRadioChange}
                                    
                                    >
                                    
                                        <Radio value='userissuperadmin'   {...register('userissuperadmin')} 
                                                onChange={handleRadioChange} disabled >Super Admin</Radio>
                                        <Radio value='userisadmin'   {...register('userisadmin')} 
                                                onChange={handleRadioChange}  disabled >Admin</Radio>
                                        <Radio value='userisuser'   {...register('userisuser')} 
                                                onChange={handleRadioChange} disabled  >User</Radio>
                                    </Radio.Group>
                                      </div>      

                        {/* label="Select Project(s)" rules={[{ required: (isuser || isadmin) ? true : false, message: "Please select at least one project" */}
                        {/* <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                            <label style={{ marginRight: '16px', fontWeight: 'bold' }}>Select Project</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
             

                            <Checkbox.Group defaultValue={getValues("projectList")} onChange={(newValue) => setValue("projectList", newValue)}    
                            style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(3, 1fr)",
                                        gap: "10px",
                                    }}>
                                {userProjectAvailable.map((project: any) => (
                                    <Checkbox key={project.id} value={project.id} {...register("projectList")}>
                                        {project.project_name}
                                    </Checkbox>
                                ))}
                            </Checkbox.Group>
                            </div>

                                    </div> */}

{/* // check on rendering projects vm list */}
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                            <label style={{ marginRight: '16px', fontWeight: 'bold' }}>Select Project</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
             

                    <Checkbox.Group defaultValue={getValues("projectList")} onChange={handleProjectListChange}    
                            style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)",gap: "10px",}}>

                                    {/* <Checkbox.Group onChange={handleProjectListChange} > */}
                                        {projectCheckList.map((ec2: any) => (
                                            <Checkbox key={ec2.id} value={ec2.id}   {...register("projectList", { required: true })}>
                                                {ec2.project_name}
                                            </Checkbox>
                                        ))}
                                    </Checkbox.Group>

                                    </div>
                                    </div>

                        {!getValues("userisadmin") && (
                            <>
                                {/* <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                                    <label style={{ marginRight: '16px', fontWeight: 'bold' }}>EC2 Instances</label>
                                    <Checkbox.Group defaultValue={getValues("ec2Instances")} onChange={(newValue) => setValue("ec2Instances", newValue)}>
                                        {ec2List.map((ec2: any) => (
                                            //@ts-ignore
                                            <Checkbox key={ec2.id} value={ec2.id}  {...register('ec2Instances')}>
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
                                                </div> */}

                                                {/* //changes done  */}

                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                                    <label style={{ marginRight: '16px', fontWeight: 'bold' }}>EC2 Instances</label>
                                    <Checkbox.Group defaultValue={getValues("ec2Instances")}  onChange={(newValue) => setValue("ec2Instances", newValue)}>
                                        {ec2CheckList.map((ec2: any) => {
                                            //@ts-ignore
                                            if (selectedProject.some(value => ec2.project_ids.includes(value))) {
                                                return (
                                                    <Checkbox key={ec2.id} value={ec2.id} checked={getValues("ec2Instances")} {...register('ec2Instances')}>
                                                        {ec2.name}
                                                    </Checkbox>
                                                );
                                            }
                                            return null;
                                        })}
                                    </Checkbox.Group>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                                    <label style={{ marginRight: '16px', fontWeight: 'bold' }}>RDS Identifiers</label>
                                    <Checkbox.Group defaultValue={getValues("rdsIdentifiers")} onChange={(newValue) => setValue("rdsIdentifiers", newValue)}>
                                    {rdsCheckList.map((rds: any) => {
                                            //@ts-ignore
                                            if (selectedProject.some(value => rds.project_ids.includes(value))) {
                                                return (

                                                    <Checkbox key={rds.id} value={rds.id} {...register("rdsIdentifiers")}>
                                                        {rds.name}
                                                    </Checkbox>
                                                );
                                            }
                                            return null;
                                        })}
                                    </Checkbox.Group>
                                </div>

                                
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                                                    <label style={{ marginRight: '16px', fontWeight: 'bold' }}>VM Instances</label>
                                                    <Checkbox.Group defaultValue={getValues("vmInstances")}onChange={(newValue) => setValue("vmInstances", newValue)}>
                                                    {vmCheckList.map((rds: any) => {
                                            //@ts-ignore
                                            if (selectedProject.some(value => rds.project_ids.includes(value))) {
                                                return (

                                                    <Checkbox key={rds.id} value={rds.id} {...register("vmInstances")}>
                                                        {rds.name}
                                                    </Checkbox>
                                                );
                                            }
                                            return null;
                                        })}
                                        </Checkbox.Group>
                                                </div>

                                                
                                </>
                        )}    
                        <Button htmlType="submit" disabled={isDisabled}>
                                                   Update user
                                                </Button>    


                                                                
                        </form>



                    </div> 

         

</Content>
</Layout >
        )

    }

  
      
    // export const getServerSideProps: GetServerSideProps = async (context) => {
    //     const {edit} = context.query;
    //     // const id = Array.isArray(edit) ? edit[0] : edit;
    //     const res = await axios.get(process.env.NEXT_PUBLIC_MOCK_PATH+`/api/get-user-list`, {
            
            
    //          headers: { 
    //             'Context-Type': 'application/json',
    //             'Authorization': process.env.NEXT_PUBLIC_APP_KEY ,
    //             id: edit,
    //     },
    //     // params: {
    //     //     id: id,
    //     // },
    //     })
    //     const list = await axios.get(process.env.NEXT_PUBLIC_MOCK_PATH + '/api/sync', {
    //         headers: {
    //             'Content-Type': 'application/json',
    //             'Authorization': process.env.NEXT_PUBLIC_APP_KEY,
    //         }
    //     })
    //     // const data: any = { project_detail: res.data, entire_list: list.data }
    //     const data: any={userDetail:res.data, entire_list: list.data}
    //     return { props: { data } };
        
    // };
