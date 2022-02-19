import axios, {AxiosError, AxiosRequestConfig, AxiosResponse} from "axios";
import React, {useContext} from "react";
import useLocalStorage from "../hook/useLocalStorage";

export const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
    headers: {"Content-Type": "application/json"},
})

interface IAuthContext {
    authenticated: boolean
    login: (username: string, password: string) => Promise<any>
    logout: () => void
}

const AUTH_CONTEXT = React.createContext<IAuthContext | undefined>(undefined)

export const useAuth = (): IAuthContext => {
    const ctx = useContext(AUTH_CONTEXT)
    if (!ctx) {
        throw Error("Component is not wrapper around AuthProvider")
    }
    return ctx
}

const AuthProvider: React.FC = ({children}) => {
    const JWT_ACCESS_TOKEN_KEY = "p3admin-access-token";
    const JWT_REFRESH_TOKEN_KEY = "p3admin-refresh-token";
    const [accessToken, setAccessToken] = useLocalStorage<string | undefined>(JWT_ACCESS_TOKEN_KEY, undefined)
    const [, setRefreshToken] = useLocalStorage<string | undefined>(JWT_REFRESH_TOKEN_KEY, undefined)

    const onRequest = (config: AxiosRequestConfig): AxiosRequestConfig => {
        if (config.url !== "/login" && config.url !== "/refresh-token") {
            // add JWT access token to any non-login/refresh-token request
            const token = localStorage.getItem(JWT_ACCESS_TOKEN_KEY)
            if (token && config.headers) {
                // JWT token available and not set yet -> use it
                config.headers["Authorization"] = `Bearer ${JSON.parse(token)}`
            }
        }

        return config
    }

    const onRequestError = (error: AxiosError): Promise<AxiosError> => {
        return Promise.reject(error)
    }

    const onResponse = (response: AxiosResponse): AxiosResponse => {
        if (response.config && response.config.url === "/login" && response.status === 200) {
            // successful login -> store access and refresh token
            setAccessToken(response.data["access-token"])
            setRefreshToken(response.data["refresh-token"])
        }
        return response
    }

    const onResponseError = async (error: AxiosError): Promise<any> => {
        const response = error.response

        if (response && response.status === 401 && response.data === "Your JWT token is expired") {
            // JWT token expired -> refresh it
            const token = localStorage.getItem(JWT_REFRESH_TOKEN_KEY)
            if (token) {
                const refreshResponse = await api.post(
                    "/refresh-token",
                    null,
                    {headers: {"Authorization": `Bearer ${JSON.parse(token)}`}}
                )

                if (refreshResponse.status === 200 && refreshResponse.data) {
                    // got new tokens -> update the existing ones and run the previous request once more
                    setAccessToken(refreshResponse.data["access-token"])
                    setRefreshToken(refreshResponse.data["refresh-token"])
                    return api(error.config)
                }
            }
        } else if (response && response.config && response.config.url === "/refresh-token") {
            // error when trying to refresh JWT token
            // -> logout user and request a new login
            logout()
        }

        return Promise.reject(error);
    }

    api.interceptors.request.use(onRequest, onRequestError)
    api.interceptors.response.use(onResponse, onResponseError)

    const login = (username: string, password: string): Promise<any> => {
        const params = new URLSearchParams()
        params.append("username", username)
        params.append("password", password)

        return api.post(
            "/login",
            params,
            {headers: {"Content-Type": "application/x-www-form-urlencoded"}}
        )
    }

    const logout = () => {
        // clear tokens of local storage
        setRefreshToken(undefined)
        setAccessToken(undefined)
    }

    return (
        <AUTH_CONTEXT.Provider value={{
            authenticated: accessToken,
            login,
            logout
        }}>
            {children}
        </AUTH_CONTEXT.Provider>
    )
}

export default AuthProvider