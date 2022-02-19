import {useEffect, useState} from "react";
import {Box, Button, Paper} from "@mui/material";
import {api, useAuth} from "../context/AuthContext";
import AppTable from "./AppTable";

interface IUser {
    username: string
    email: string
    address: string
    enabled: boolean
    createdAt: Date
}

const AppUsers = () => {
    const [users, setUsers] = useState<IUser[]>([]);
    const {logout} = useAuth()

    useEffect(() => {
            (async () => {
                const response = await api.get("/users?page=0&size=50")
                if (response.data?.content) {
                    const userData: IUser[] = response.data.content
                    userData.forEach(it => it.createdAt = new Date(it.createdAt))
                    setUsers(userData)
                }
            })()
        },
        []
    )

    return (
        <Box sx={{display: "flex", flexDirection: "column", alignItems: "flex-start"}}>
            <Paper sx={{display: "flex", m: 2}}>
                <AppTable data={users} keysToShow={["enabled", "username", "email", "createdAt", "address"]}/>
            </Paper>

            <Button variant={"outlined"} color={"primary"} onClick={logout} sx={{m: 2}}>Logout</Button>
        </Box>
    )
}

export default AppUsers
