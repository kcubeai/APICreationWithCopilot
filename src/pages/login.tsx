
import axios from 'axios';
import { useState } from 'react';

import { useAuth } from '@/shared/utils/auth-context';
import { useRouter } from 'next/router';
import { decrypt, encrypt } from '@/shared/crypto';
export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const { setToken, setIsAdmin, setisUser, setIsSuperAdmin, setUserId } = useAuth()
    const router = useRouter()
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {

        event.preventDefault();
        try {
            //@ts-ignore
            var encPassword = encrypt(password, process.env.NEXT_PUBLIC_CYPHERKEY)
            //@ts-ignore
            var decpass = decrypt(encPassword, process.env.NEXT_PUBLIC_CYPHERKEY);

            var req = {
                url: '/api/login',
                body: { username, password: encPassword }
            }
            const response = await axios.post('/api/login', { username, password: encPassword });

            if (response.status === 200) {
                setIsAdmin(response.data.isAdmin)
                setIsSuperAdmin(response.data.isSuperAdmin)
                setisUser(response.data.isUser)
                setToken(response.data.token);
                setUserId(response.data.id)

                // sessionStorage.setItem('token', response.data.token);
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('isAdmin', response.data.isAdmin);
                localStorage.setItem('isSuperAdmin', response.data.isSuperAdmin);
                localStorage.setItem('userID', response.data.id);
                router.push('/dashboard');
            }
        } catch (error) {
            console.error(error);
            setError('Invalid username or password');
        }
    };

    const isFormValid = () => {
        return username !== '' && password !== '' && passwordRegex.test(password);
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
                <h1 style={{ marginBottom: '20px' }}>Login</h1>
                {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}
                <label htmlFor="username" style={{ marginBottom: '10px' }}>Username</label>
                <input id="username" type="text" value={username} onChange={(e) => {
                    if (!/\s/.test(e.target.value)) {
                        setUsername(e.target.value);
                        setError('');
                    } else {
                        // setError('Username cannot contain spaces');
                    }
                }} style={{ marginBottom: '20px', padding: '5px' }} />
                <label htmlFor="password" style={{ marginBottom: '10px' }}>Password</label>
                <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ marginBottom: '20px', padding: '5px' }} />
                {/* <h6 style={{ marginBottom: '20px', padding: '5px' }}>Note:one special character and  one numerical character required</h6> */}
                <button type="submit" style={{ padding: '5px 10px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', cursor: isFormValid() ? 'pointer' : 'not-allowed', opacity: isFormValid() ? 1 : 0.5 }} disabled={!isFormValid()}>Login</button>
            </form>
        </div>
    )
}
