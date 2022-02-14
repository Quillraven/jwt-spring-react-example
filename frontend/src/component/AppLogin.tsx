import {Box, Button, Grid, IconButton, InputAdornment, TextField, useTheme} from "@mui/material";
import {AccountCircle, Brightness4, Brightness7, LockRounded} from "@mui/icons-material";
import React, {useRef} from "react";
import {useAuth} from "../context/AuthContext";

interface AppLoginProps {
    toggleColorMode: () => void
}

const AppLogin = (props: AppLoginProps) => {
    const userRef = useRef<HTMLInputElement>(null)
    const pwdRef = useRef<HTMLInputElement>(null)
    const theme = useTheme()
    const {login} = useAuth()

    const doLogin = async (event: React.MouseEvent) => {
        event.preventDefault()

        const username = userRef.current?.value
        const pwd = pwdRef.current?.value

        if (!username || !pwd) {
            return
        }

        const response = await login(username, pwd)
        if (response.status !== 200) {
            // login not successful
            // TODO show error to user
        }
    }

    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    bgcolor: 'background.default',
                    color: 'text.primary',
                    marginLeft: "1em",
                }}
            >
                {theme.palette.mode} mode
                <IconButton sx={{ml: 1}} onClick={props.toggleColorMode} color="inherit">
                    {theme.palette.mode === 'dark' ? <Brightness7/> : <Brightness4/>}
                </IconButton>
            </Box>

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
        </>
    )
}

export default AppLogin
