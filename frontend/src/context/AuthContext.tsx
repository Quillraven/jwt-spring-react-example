import axios, {AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse} from "axios";
import React, {useContext, useMemo} from "react";
import useLocalStorage from "../hook/useLocalStorage";

interface IAuthContext {
    accessToken: string | undefined
    login: (username: string, password: string) => Promise<any>
    logout: () => void
    api: AxiosInstance
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
    const [accessToken, setAccessToken] = useLocalStorage<string | undefined>("p3admin-access-token", undefined)
    const [refreshToken, setRefreshToken] = useLocalStorage<string | undefined>("p3admin-refresh-token", undefined)

    const logout = React.useCallback(() => {
        // clear tokens of local storage
        setAccessToken(undefined)
        setRefreshToken(undefined)
    }, [setAccessToken, setRefreshToken])

    const api = useMemo<AxiosInstance>(() => {
        const onRequest = (config: AxiosRequestConfig): AxiosRequestConfig => {
            if (config.url !== "/login" && config.url !== "/refresh-token") {
                // add JWT access token to any non-login/refresh-token request
                if (accessToken && config.headers) {
                    // JWT token available and not set yet -> use it
                    config.headers["Authorization"] = `Bearer ${accessToken}`
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
                if (refreshToken) {
                    const refreshResponse = await api.post(
                        "/refresh-token",
                        null,
                        {headers: {"Authorization": `Bearer ${refreshToken}`}}
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

        const instance = axios.create({
            baseURL: process.env.REACT_APP_API_BASE_URL,
            headers: {"Content-Type": "application/json"},
        })

        instance.interceptors.request.use(onRequest, onRequestError)
        instance.interceptors.response.use(onResponse, onResponseError)

        return instance
    }, [accessToken, logout, refreshToken, setAccessToken, setRefreshToken])

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

    return (
        <AUTH_CONTEXT.Provider value={{
            accessToken,
            login,
            logout,
            api
        }}>
            {children}
        </AUTH_CONTEXT.Provider>
    )
}

export default AuthProvider