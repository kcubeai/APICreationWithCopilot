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
    const [token, setToken] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            // Check if window is defined (i.e., we are in a browser environment)
            const storedToken = localStorage.getItem("token");
            return storedToken || "";
        }

        return "";
    });
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
    // const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    //     if (typeof window !== 'undefined') {
    //         const storedIsAdmin = localStorage.getItem("isAdmin");
    //         return storedIsAdmin === "true";
    //     }

    //     return false;
    // });

    // const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    //     const storedIsAdmin = typeof window !== 'undefined' ? localStorage.getItem("isAdmin") : "";
    //     return storedIsAdmin === "true";
    // });
    // const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    //     try {
    //       const storedIsAdmin = typeof window !== 'undefined' ? localStorage.getItem("isAdmin") : "";
    //       return storedIsAdmin === "true";
    //     } catch (error) {
    //       console.error('Error initializing isAdmin:', error);
    //       return false; // Provide a default value in case of an error
    //     }
    //   });
    // const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(() => {
    //     const storedIsSuperAdmin = typeof window !== 'undefined' ? localStorage.getItem("isSuperAdmin") : "";
    //     return storedIsSuperAdmin === "true";
    // }); 
    // const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    //     try {
    //       const storedIsAdmin = typeof window !== 'undefined' ? localStorage.getItem("isAdmin") : null;
    //       return storedIsAdmin ? JSON.parse(storedIsAdmin) : false;
    //     } catch (error) {
    //       console.error('Error parsing isAdmin:', error);
    //       return false;
    //     }
    //   });
      
    //   const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(() => {
    //     try {
    //       const storedIsSuperAdmin = typeof window !== 'undefined' ? localStorage.getItem("isSuperAdmin") : null;
    //       return storedIsSuperAdmin ? JSON.parse(storedIsSuperAdmin) : false;
    //     } catch (error) {
    //       console.error('Error parsing isSuperAdmin:', error);
    //       return false;
    //     }
    //   });

    // const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    //     if (typeof window !== 'undefined') {
    //         const storedIsAdmin = localStorage.getItem("isAdmin");
    //         return storedIsAdmin ? JSON.parse(storedIsAdmin) : false;
    //     }
    
    //     return false;
    // });
    
    // const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(() => {
    //     if (typeof window !== 'undefined') {
    //         const storedIsSuperAdmin = localStorage.getItem("isSuperAdmin");
    //         return storedIsSuperAdmin ? JSON.parse(storedIsSuperAdmin) : false;
    //     }
    
    //     return false;
    // });

    const [isUser, setisUser] = useState<boolean>(false);
    const [userID, setUserId] = useState<any>("");
    const [gcpToken, setGCPToken] = useState<string>("");

 

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
            setToken(storedToken);
        }
        const isadminFromSession = localStorage.getItem('isAdmin');
        if(isadminFromSession){
            setIsAdmin(isadminFromSession === "true");
        }

        const issuperadminFromSession = localStorage.getItem('isSuperAdmin');
        if(issuperadminFromSession){
            setIsSuperAdmin(issuperadminFromSession === "true");
        }

        const userIDFromSession = localStorage.getItem('userID');
        if(userIDFromSession){
            setUserId(userIDFromSession);
        }
        // localStorage.setItem("isAdmin", isAdmin.toString());
        // localStorage.setItem("isSuperAdmin", isSuperAdmin.toString());

    
    }, [token, isAdmin, isSuperAdmin, userID]);

    // useEffect(() => {
    //     localStorage.setItem("isAdmin", isAdmin.toString());
    // }, [isAdmin]);

    // useEffect(() => {
    //     localStorage.setItem("isSuperAdmin", isSuperAdmin.toString());
    // }, [isSuperAdmin]);

    const router = useRouter()

    const updateToken = (token: string) => {
        localStorage.setItem('token', token)
        setToken(token)
    }

    const logOut = () => {
        setToken('')
        localStorage.clear()
        router.push('/login')
    }

    return (
        <AuthContext.Provider value={{ token, updateToken, isAdmin, isSuperAdmin, isUser, userID, gcpToken, setGCPToken, setUserId, setToken, setIsAdmin, setIsSuperAdmin, setisUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)