import React, { useState, createContext, useContext, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';



interface AuthContextInterface {
    token: string,
    updateToken: Function,
    redirect: string,
    preSite: Function,
    initializing: boolean,
    logOut: Function,
    currentDb: string,
    updateDBUID: Function,
    // userObject: UserObject,
    updateUserObject: Function,
    currentPage: string,
    setCurrentPage: Function
}



type AuthContextType = {
    token: string;
    updateToken: Function,
    isAdmin: boolean;
    isSuperAdmin: boolean;
    isUser: boolean;
    userID: any;
    gcpToken: string;
    setToken: (token: string) => void;
    setIsAdmin: (isAdmin: boolean) => void;
    setIsSuperAdmin: (isSuperAdmin: boolean) => void;
    setisUser: (isUser: boolean) => void;
    setUserId: (userId: any) => void;
    setGCPToken: (gcpToken: any) => void;
}

export const AuthContext = createContext<AuthContextType>({
    token: "",
    updateToken: (token: string) => { },
    isAdmin: false,
    isSuperAdmin: false,
    isUser: false,
    userID: "",
    gcpToken: "",
    setToken: (token: string) => { },
    setIsAdmin: (isAdmin: boolean) => { },
    setIsSuperAdmin: (isSuperAdmin: boolean) => { },
    setisUser: (isUser: boolean) => { },
    setUserId: (userID: any) => { },
    setGCPToken: (gcpToken: string) => { }
})

export const AuthProvider = ({ children }: { children: React.ReactElement }) => {
    const [token, setToken] = useState<string>("")

    // const [token, setToken] = useState<string>(() => {
    //     const tokenFromSession = sessionStorage.getItem('token');
    //     return tokenFromSession ? tokenFromSession : '';
    // });

    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
    const [isUser, setisUser] = useState<boolean>(false);
    const [userID, setUserId] = useState<any>("");
    const [gcpToken, setGCPToken] = useState<string>("");

    const [redirect, setRedirect] = useState<string>('');
    const [initializing, setInitializing] = useState<boolean>(true)
    const [currentPage, setCurrentPage] = useState<string>('')


    const router = useRouter()
    // const checkExpiry = () => {
    //     axios.post('/api/protected/check', null, { headers: { 'Authorization': `Bearer ${token}` } })
    //         .then(response => {
    //         })
    //         .catch(error => {
    //             logOut();
    //         })
    //     if (token !== '') {
    //         setTimeout(() => {
    //             checkExpiry()
    //         }, (60 * 60 * 1000))
    //     }
    // }

    useEffect(() => {
        const getTokenFromSession = sessionStorage.getItem('token') ? sessionStorage.getItem('token') : null
      

        setCurrentPage(router.pathname)
        if (getTokenFromSession !== null) {
            setToken(getTokenFromSession)
        }
     
        const getRedirectFromSession = sessionStorage.getItem('redirect') ? sessionStorage.getItem('redirect') : null
        if (getRedirectFromSession !== null) {
            setRedirect(getRedirectFromSession)
        }
        // if (token !== '') {
        //     checkExpiry()
        // }
        setInitializing(false)
    }, [token, redirect, router.events])

    const updateToken = (token: string) => {
        sessionStorage.setItem('token', token)
        setToken(token)
    }

 
  

    // const preSite = (path: string) => {
    //     sessionStorage.setItem('redirect', path)
    //     setRedirect(path)
    // }

    // const logOut = () => {
    //     setToken('')
    //     sessionStorage.clear()
    //     router.push('/login')
    // }
    return (
        <AuthContext.Provider value={{ token,updateToken, isAdmin, isSuperAdmin, isUser, userID, gcpToken, setGCPToken, setUserId, setToken, setIsAdmin, setIsSuperAdmin, setisUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)