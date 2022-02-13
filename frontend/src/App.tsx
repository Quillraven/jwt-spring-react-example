import React, {createContext, useMemo, useState} from 'react';
import {Box, createTheme, CssBaseline, IconButton, responsiveFontSizes, Theme, ThemeProvider} from "@mui/material";
import {Brightness4, Brightness7} from "@mui/icons-material";
import AppLogin from "./component/AppLogin";
import useLocalStorage from "./hook/useLocalStorage";
import {JWT_ACCESS_TOKEN_KEY, JWT_REFRESH_TOKEN_KEY} from "./api";
import AppUsers from "./component/AppUsers";

const ColorModeContext = createContext({
    toggleColorMode: () => {
    }
})

type ColorMode = "light" | "dark"

const loginPage = (
    theme: Theme,
    colorMode: { toggleColorMode: () => void },
    setAccessToken: (value: string) => void,
    setRefreshToken: (value: string) => void
) => {
    return (
        <React.Fragment>
            <CssBaseline/>
            <ColorModeContext.Provider value={colorMode}>
                <ThemeProvider theme={theme}>
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
                        <IconButton sx={{ml: 1}} onClick={colorMode.toggleColorMode} color="inherit">
                            {theme.palette.mode === 'dark' ? <Brightness7/> : <Brightness4/>}
                        </IconButton>
                    </Box>
                    <AppLogin setAccessToken={setAccessToken} setRefreshToken={setRefreshToken}/>
                </ThemeProvider>
            </ColorModeContext.Provider>
        </React.Fragment>
    );
}

const userPage = (theme: Theme, colorMode: { toggleColorMode: () => void }) => {
    return (
        <React.Fragment>
            <CssBaseline/>
            <ColorModeContext.Provider value={colorMode}>
                <ThemeProvider theme={theme}>
                    <AppUsers/>
                </ThemeProvider>
            </ColorModeContext.Provider>
        </React.Fragment>
    )
}

function App() {
    const [mode, setMode] = useState<ColorMode>("light")
    const colorMode = useMemo(() => ({
            toggleColorMode: () => {
                setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
            },
        }),
        [],
    );
    const theme = useMemo(() => {
            let theme = createTheme({
                palette: {
                    mode,
                },
            })
            theme = responsiveFontSizes(theme)
            return theme
        },
        [mode],
    );

    const [accessToken, setAccessToken] = useLocalStorage(JWT_ACCESS_TOKEN_KEY, null)
    const [refreshToken, setRefreshToken] = useLocalStorage(JWT_REFRESH_TOKEN_KEY, null)

    if (!accessToken) {
        // log in still required -> show login page
        return loginPage(theme, colorMode, setAccessToken, setRefreshToken)
    } else {
        return userPage(theme, colorMode)
    }
}

export default App;
