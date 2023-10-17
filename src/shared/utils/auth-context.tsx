import React, { createContext, useContext, useState } from "react"

type AuthContextType = {
    token: string;
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
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
    const [isUser, setisUser] = useState<boolean>(false);
    const [userID, setUserId] = useState<any>("");
    const [gcpToken, setGCPToken] = useState<string>("");
    return (
        <AuthContext.Provider value={{ token, isAdmin, isSuperAdmin, isUser, userID, gcpToken, setGCPToken, setUserId, setToken, setIsAdmin, setIsSuperAdmin, setisUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)