import api from './api';

const STORAGE_KEY_USER = 'p3admin-user'
export const EVENT_LOGOUT = 'logout'
export const EVENT_LOGIN = 'login'

export enum Role {
  Admin = 'ROLE_ADMIN',
  Therapist = 'ROLE_THERAPIST',
  Secretary = 'ROLE_SECRETARY'
}

export class User {
  readonly accessToken: string
  readonly refreshToken: string
  readonly roles: Role[]

  constructor (
    accessToken: string,
    refreshToken: string,
    roles: Role[]
  ) {
    this.accessToken = accessToken
    this.refreshToken = refreshToken
    this.roles = roles ?? []
  }

  hasAnyRole (...roles: Role[]): boolean {
    return this.roles.some(role => roles.includes(role))
  }
}

const storeUser = (data: any): User => {
  const user = new User(data['access-token'], data['refresh-token'], data.roles)
  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user))
  return user
}

const login = async (username: string, password: string): Promise<User> => {
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

const refreshToken = async (): Promise<User> => {
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

const currentUser = (): User | null => {
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
