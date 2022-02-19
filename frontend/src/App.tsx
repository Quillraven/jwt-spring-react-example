import React, {createContext, useMemo, useState} from 'react';
import {createTheme, CssBaseline, responsiveFontSizes, ThemeProvider} from "@mui/material";
import AppLogin from "./component/AppLogin";
import AppUsers from "./component/AppUsers";
import {useAuth} from "./context/AuthContext";

export const ColorModeContext = createContext({
    toggleColorMode: () => {
    }
})

type ColorMode = "light" | "dark"

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
    const {authenticated} = useAuth()

    return (
        <React.Fragment>
            <CssBaseline/>
            <ColorModeContext.Provider value={colorMode}>
                <ThemeProvider theme={theme}>
                    {authenticated
                        ? <AppUsers/>
                        : <AppLogin toggleColorMode={colorMode.toggleColorMode}/>
                    }
                </ThemeProvider>
            </ColorModeContext.Provider>
        </React.Fragment>
    )
}

export default App;
