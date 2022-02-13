import axios, {AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse} from "axios"

export const JWT_ACCESS_TOKEN_KEY = "p3admin-access-token"
export const JWT_REFRESH_TOKEN_KEY = "p3admin-refresh-token"

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
    return Promise.reject(error);
}

const onResponse = (response: AxiosResponse): AxiosResponse => {
    return response;
}

const onResponseError = async (error: AxiosError): Promise<any> => {
    const originalRequest = error.config
    if (error.response && error.response.status === 401 && error.response.data === "Your JWT token is expired") {
        // JWT token expired -> refresh it
        const token = localStorage.getItem(JWT_REFRESH_TOKEN_KEY)
        if (token) {
            // TODO when refresh doesn't work then refresh token is most likely also expired
            // TODO --> log out user and return to login page
            const refreshResponse = await axios.post(
                "/refresh-token",
                null,
                {
                    headers: {
                        "Authorization": `Bearer ${JSON.parse(token)}`
                    }
                }
            )

            if (refreshResponse.status === 200 && refreshResponse.data) {
                // TODO fix this properly --> maybe useContext to have token set/get globally available?
                localStorage.setItem(JWT_ACCESS_TOKEN_KEY, JSON.stringify(refreshResponse.data["access-token"]))
                localStorage.setItem(JWT_REFRESH_TOKEN_KEY, JSON.stringify(refreshResponse.data["refresh-token"]))
                // got new tokens -> update the existing ones and run the previous request once more
                return axios(originalRequest)
            }
        }
    }

    return Promise.reject(error);
}

const setupAxiosGlobal = (instance: AxiosInstance) => {
    instance.defaults.baseURL = "http://localhost:8080/api/v1"
    instance.defaults.headers.common["Content-Type"] = "application/json"
    instance.interceptors.request.use(onRequest, onRequestError)
    instance.interceptors.response.use(onResponse, onResponseError)
}

setupAxiosGlobal(axios)

export const apiLogin = (username: string, password: string): Promise<any> => {
    const params = new URLSearchParams()
    params.append("username", username)
    params.append("password", password)

    return axios.post(
        "/login",
        params,
        {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }
    )
}
