import React, { createContext, useEffect, useMemo, useState } from 'react';
import { createTheme, CssBaseline, responsiveFontSizes, ThemeProvider } from '@mui/material';
import AppLogin from './component/AppLogin';
import AppPatients from './component/AppPatients';
import { Route, Routes, useNavigate } from 'react-router-dom';
import authService, { EVENT_LOGIN, EVENT_LOGOUT } from './service/auth-service';

export const ColorModeContext = createContext({
  toggleColorMode: () => {
  }
})

type ColorMode = 'light' | 'dark'

function App () {
  const navigate = useNavigate()
  const [mode, setMode] = useState<ColorMode>('light')
  const colorMode = useMemo(() => ({
    toggleColorMode: () => {
      setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    }
  }),
  []
  );
  const theme = useMemo(() => {
    let theme = createTheme({
      palette: {
        mode
      }
    })
    theme = responsiveFontSizes(theme)
    return theme
  },
  [mode]
  );
  const [user, setUser] = useState(authService.currentUser)

  const onLogin = (e: Event) => {
    if (e instanceof CustomEvent) {
      setUser(e.detail.user)
    }
  }

  const onLogout = () => {
    setUser(null)
  }

  useEffect(() => {
    if (user) {
      navigate('/home', { replace: true })
    } else {
      navigate('/', { replace: true })
    }

    document.addEventListener(EVENT_LOGIN, onLogin)
    document.addEventListener(EVENT_LOGOUT, onLogout)

    return () => {
      document.removeEventListener(EVENT_LOGIN, onLogin)
      document.removeEventListener(EVENT_LOGOUT, onLogout)
    }
  }, [navigate, user])

  return (
        <React.Fragment>
            <CssBaseline/>
            <ColorModeContext.Provider value={colorMode}>
                <ThemeProvider theme={theme}>
                    <Routes>
                        <Route path={'/'} element={<AppLogin toggleColorMode={colorMode.toggleColorMode}/>}/>
                        <Route path={'/home'} element={<AppPatients/>}/>
                    </Routes>
                </ThemeProvider>
            </ColorModeContext.Provider>
        </React.Fragment>
  )
}

export default App;
