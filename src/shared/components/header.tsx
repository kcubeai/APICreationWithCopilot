import { Table, Spin, Layout, Button, notification } from 'antd';
import { useRouter } from 'next/router';
import { useAuth } from '../utils/auth-context';
import { LogoutOutlined, UserAddOutlined, DashboardOutlined } from '@ant-design/icons';
const { Header, Content } = Layout;
import axios from 'axios';
export default function HeaderComponent(props: any) {
    const { token, setToken, isAdmin, isSuperAdmin, isUser } = useAuth();
    const router = useRouter();
    const handleLogout = () => {
        // setIsEC2(false)
        // setIsGCP(false)
        // setIsRDS(false)
        // setIsAdmin(false)
        sessionStorage.removeItem('token')
        setToken("")
        router.push('/login');
    }
    const sync = () => {
        axios.get('/api/sync', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${token}`,
            }
        }).then((response: any) => {
            console.log(response);
            notification.success({
                message: 'Success',
                description: 'synced successfully',
                placement: 'topRight',
                duration: 3
            });
        }).catch((error: any) => {
            notification.error({
                message: 'Error',
                description: error.response.data.error,
                placement: 'topRight',
                duration: 3
            });
            // Add code to handle error here
        });
    }
    return (
        <>

            <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ color: '#fff' }}>{props.title}</h2>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {!router.asPath.includes('dashboard') && <Button type="primary" onClick={() => router.push('/dashboard')} icon={<DashboardOutlined />}>Dashboard</Button>}
                    {isSuperAdmin && <Button style={{ marginLeft: '10px' }} type="primary" onClick={sync} icon={<UserAddOutlined />}>Sync</Button>}
                    {isSuperAdmin && <Button style={{ marginLeft: '10px' }} type="primary" onClick={() => router.push('/logs')} icon={<UserAddOutlined />}>Logs</Button>}
                    {(isSuperAdmin || isAdmin) && !router.asPath.includes('add-user') && <Button style={{ marginLeft: '10px' }} type="primary" onClick={() => router.push('/add-user')} icon={<UserAddOutlined />}>Users</Button>}
                    {(isSuperAdmin && !router.asPath.includes('add-projects')) && <Button type="primary" style={{ marginLeft: '10px' }} onClick={() => router.push('/add-projects')} icon={<UserAddOutlined />}>Projects</Button>}
                    <Button type="primary" onClick={handleLogout} icon={<LogoutOutlined />} style={{ marginLeft: '10px' }}>Logout</Button>
                </div>
            </Header>
        </>
    )
}