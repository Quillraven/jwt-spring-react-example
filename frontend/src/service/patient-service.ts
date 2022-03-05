import api, { IPageable } from './api';

export interface IPatient {
    id?: number
    active: boolean
    socialSecurityNumber: string
    firstname: string
    lastname: string
    email: string | null
}

const getPatients = async (page: number, size: number = 50): Promise<IPageable<IPatient>> => {
  const response = await api.get(
    '/patients',
    {
      params: {
        page,
        size
      }
    }
  )
  return Promise.resolve(response.data)
}

const savePatient = async (patient: IPatient): Promise<IPatient> => {
  const response = await api.post(
    '/patients',
    { ...patient }
  )
  return response.data
}

const updatePatient = async (patient: IPatient): Promise<IPatient> => {
  const response = await api.put(
    '/patients',
    { ...patient }
  )
  return response.data
}

const patientService = {
  getPatients,
  savePatient,
  updatePatient
}

export default patientService
