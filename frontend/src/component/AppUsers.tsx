import {useEffect, useState} from "react";
import {
    Box,
    Button,
    Checkbox,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from "@mui/material";
import {useAuth} from "../context/AuthContext";

interface IUser {
    username: string
    email: string
    address: string
    enabled: boolean
    createdAt: Date
}

const AppUsers = () => {
    const [users, setUsers] = useState<IUser[]>([]);
    const {api, logout} = useAuth()

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
        [api]
    )

    return (
        <Box sx={{display: "flex", flexDirection: "column", alignItems: "flex-start"}}>
            <Paper sx={{display: "flex", m: 2}}>
                <TableContainer>
                    <Table
                        sx={{minWidth: 750}}
                        aria-labelledby={"User-Table"}
                        size={"small"}
                    >
                        <TableHead>
                            <TableRow>
                                <TableCell>Enabled</TableCell>
                                <TableCell>Username</TableCell>
                                <TableCell>E-Mail</TableCell>
                                <TableCell>Address</TableCell>
                                <TableCell>Created At</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                users.map(it => {
                                    const createdTime = it.createdAt
                                    return (
                                        <TableRow key={it.username}>
                                            <TableCell padding={"checkbox"}>
                                                <Checkbox color={"primary"} checked={it.enabled} disabled={true}/>
                                            </TableCell>
                                            <TableCell>{it.username}</TableCell>
                                            <TableCell>{it.email}</TableCell>
                                            <TableCell>{it.address}</TableCell>
                                            <TableCell>{`${createdTime.toLocaleDateString()} ${createdTime.toLocaleTimeString()}`}</TableCell>
                                        </TableRow>
                                    )
                                })
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Button variant={"outlined"} color={"primary"} onClick={logout} sx={{m: 2}}>Logout</Button>
        </Box>
    )
}

export default AppUsers
