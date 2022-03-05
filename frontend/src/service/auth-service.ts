import api from './api';

const STORAGE_KEY_USER = 'p3admin-user'
export const EVENT_LOGOUT = 'logout'
export const EVENT_LOGIN = 'login'

export interface IUser {
    accessToken: String
    refreshToken: String
}

const storeUser = (data: any): IUser => {
  const user: IUser = {
    accessToken: data['access-token'],
    refreshToken: data['refresh-token']
  }
  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user))
  return user
}

const login = async (username: string, password: string): Promise<IUser> => {
  const params = new URLSearchParams()
  params.append('username', username)
  params.append('password', password)

  const response = await api.post(
    '/login',
    params,
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  )

  if (response.data) {
    const user = storeUser(response.data)
    document.dispatchEvent(new CustomEvent(EVENT_LOGIN, { detail: { user } }))
    return user
  }

  return Promise.reject(new Error('Response from server is not a valid user'))
}

const refreshToken = async (): Promise<IUser> => {
  const token = currentUser()?.refreshToken
  if (!token) {
    return Promise.reject(new Error('No refresh token available'))
  }

  const response = await api.post(
    '/refresh-token',
    null,
    { headers: { Authorization: `Bearer ${token}` } }
  )

  if (response.data) {
    return storeUser(response.data)
  }

  return Promise.reject(new Error('Response from server is not a valid user'))
}

const logout = () => {
  localStorage.removeItem(STORAGE_KEY_USER)
  document.dispatchEvent(new CustomEvent(EVENT_LOGOUT))
}

const currentUser = (): IUser | null => {
  const user = localStorage.getItem(STORAGE_KEY_USER)
  return user ? JSON.parse(user) : null
}

const authService = {
  login,
  refreshToken,
  logout,
  currentUser
}

export default authService
