import {Box, Button, Grid, InputAdornment, TextField} from "@mui/material";
import {AccountCircle, LockRounded} from "@mui/icons-material";
import {apiLogin} from "../api";
import React, {useRef} from "react";

interface AppLoginProps {
    setAccessToken: (value: string) => void,
    setRefreshToken: (value: string) => void
}

const AppLogin = ({setAccessToken, setRefreshToken}: AppLoginProps) => {
    const userRef = useRef<HTMLInputElement>(null)
    const pwdRef = useRef<HTMLInputElement>(null)

    const doLogin = async (event: React.MouseEvent) => {
        event.preventDefault()

        const username = userRef.current?.value
        const pwd = pwdRef.current?.value

        if (!username || !pwd) {
            return
        }

        const response = await apiLogin(username, pwd)
        if (response.status === 200 && response.data) {
            // successful login -> store JWT access and refresh token
            setAccessToken(response.data["access-token"])
            setRefreshToken(response.data["refresh-token"])
        }
    }

    return (
        <Box sx={{bgcolor: "background.default"}}>
            <Grid container style={{minHeight: "100vh"}}>
                <Grid item container xs={12} sm={6}
                      direction={"column"}
                      justifyContent={"center"}
                      alignItems={"center"}
                >
                    <Grid item>
                        <img
                            src={"logo.png"}
                            alt={"logo"}
                            style={{width: "10vw"}}
                        />
                    </Grid>
                    <Grid item container justifyContent={"center"} alignItems={"center"} spacing={2}>
                        <form style={{display: "flex", flexDirection: "column"}}>
                            <TextField id={"username"} label={"Username"}
                                       inputRef={userRef}
                                       variant={"outlined"} margin={"normal"}
                                       InputProps={{
                                           startAdornment: (
                                               <InputAdornment position={"start"}><AccountCircle/></InputAdornment>)
                                       }}
                            />
                            <TextField id={"password"} label={"Password"}
                                       inputRef={pwdRef}
                                       variant={"outlined"} type={"password"} margin={"normal"}
                                       InputProps={{
                                           startAdornment: (
                                               <InputAdornment position={"start"}><LockRounded/></InputAdornment>)
                                       }}
                            />
                            <Button color={"primary"} variant={"contained"} type={"submit"}
                                    onClick={doLogin}
                                    style={{marginTop: "1em"}}
                            >
                                Log in
                            </Button>
                            <Button variant={"outlined"} style={{marginTop: "1em"}}>
                                Forgot password?
                            </Button>
                        </form>
                    </Grid>
                </Grid>

                <Grid item xs={12} sm={6}>
                    <img
                        src={"banner.jpg"}
                        alt={"banner"}
                        style={{width: "100%", height: "100%", objectFit: "cover"}}
                    />
                </Grid>
            </Grid>
        </Box>
    )
}

export default AppLogin
