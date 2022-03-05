import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import authService from './auth-service';

export interface IPageable<T> {
    content: T[],
    number: number
    size: number
    first: boolean
    last: boolean
    empty: boolean
    numberOfElements: number
    totalElements: number
    totalPages: number
    sort: {
        empty: boolean
        sorted: boolean
        unsorted: boolean
    }
}

const onRequest = (config: AxiosRequestConfig): AxiosRequestConfig => {
  if (config.url !== '/login' && config.url !== '/refresh-token') {
    // add JWT access token to any non-login/refresh-token request
    const token = authService.currentUser()?.accessToken
    if (token && config.headers) {
      // JWT token available -> use it
      config.headers.Authorization = `Bearer ${token}`
    }
  }

  return config
}

const onRequestError = (error: AxiosError): Promise<AxiosError> => {
  return Promise.reject(error)
}

const onResponse = (response: AxiosResponse): AxiosResponse => {
  return response
}

const onResponseError = async (error: AxiosError): Promise<any> => {
  const response = error.response

  if (response?.status === 403) {
    // unauthorized request: e.g. user did not log out properly and tries to enter system after token is expired
    // -> logout and bring him back to login page
    authService.logout()
  } else if (response && response.status === 401 && response.data === 'Your JWT token is expired') {
    // JWT token expired -> refresh it
    const newUser = await authService.refreshToken()
    if (newUser) {
      // got new tokens -> run the previous request once more
      return api(error.config)
    }
  } else if (response && response.config && response.config.url === '/refresh-token') {
    // error when trying to refresh JWT token
    // -> logout user and request a new login
    authService.logout()
  }

  return Promise.reject(error);
}

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(onRequest, onRequestError)
api.interceptors.response.use(onResponse, onResponseError)

export default api
