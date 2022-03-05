import {
  Alert,
  AlertTitle,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  TextField
} from '@mui/material';
import { useRef, useState } from 'react';
import patientService, { IPatient } from '../service/patient-service';

interface AppPatientModalProps {
    show: boolean
    onSave: (patient:IPatient) => void
    onClose: () => void
}

const AppPatientDialog = (props: AppPatientModalProps) => {
  const { show, onClose } = props
  const firstNameRef = useRef<HTMLInputElement>()
  const [firstNameError, setFirstNameError] = useState(false)
  const lastNameRef = useRef<HTMLInputElement>()
  const [lastNameError, setLastNameError] = useState(false)
  const socialSecurityRef = useRef<HTMLInputElement>()
  const [socialSecurityError, setSocialSecurityError] = useState(false)
  const mailRef = useRef<HTMLInputElement>()
  const [apiError, setApiError] = useState('')

  const onSave = async () => {
    const firstname = firstNameRef.current?.value
    const lastname = lastNameRef.current?.value
    const socialSecurity = socialSecurityRef.current?.value

    if (!firstname || !lastname || !socialSecurity) {
      // mandatory input missing
      setFirstNameError(!firstname)
      setLastNameError(!lastname)
      setSocialSecurityError(!socialSecurity)
      return
    }

    // valid mandatory input -> create new patient
    setFirstNameError(false)
    setLastNameError(false)
    setSocialSecurityError(false)
    try {
      const newPatient = await patientService.savePatient({
        active: true,
        socialSecurityNumber: socialSecurity,
        firstname: firstname,
        lastname: lastname,
        email: mailRef.current?.value ?? null
      })
      setApiError('')
      props.onSave(newPatient)
    } catch (error:any) {
      // couldn't save patient -> show alert
      setApiError(`Reason: ${JSON.stringify(error.response.data)}`)
    }
  }

  return (
        <Dialog open={show} onClose={onClose}>
            <DialogTitle>New Patient</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    To create a new patient, please enter the First Name, Last Name and
                    Social Security Number. E-Mail is not mandatory.
                </DialogContentText>

                <Stack direction={'column'}>
                    <TextField
                        autoFocus={true}
                        margin={'dense'}
                        id={'firstname'}
                        label={'First Name'}
                        type={'text'}
                        inputRef={firstNameRef}
                        error={firstNameError}
                        helperText={firstNameError ? 'First Name cannot be empty' : ''}
                    />
                    <TextField
                        margin={'dense'}
                        id={'lastname'}
                        label={'Last Name'}
                        type={'text'}
                        inputRef={lastNameRef}
                        error={lastNameError}
                        helperText={lastNameError ? 'Last Name cannot be empty' : ''}
                    />
                    <TextField
                        margin={'dense'}
                        id={'socialSecurityNumber'}
                        label={'Social Security Number'}
                        type={'text'}
                        inputRef={socialSecurityRef}
                        error={socialSecurityError}
                        helperText={socialSecurityError ? 'Social Security Number cannot be empty' : ''}
                    />
                    <TextField
                        margin={'dense'}
                        id={'email'}
                        label={'E-Mail'}
                        type={'email'}
                        inputRef={mailRef}
                    />
                </Stack>

                {
                    apiError &&
                    <Alert severity={'error'}>
                        <AlertTitle>Could not save new patient - <strong>Please try again!</strong></AlertTitle>
                        {apiError}
                    </Alert>
                }

            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={onSave}>Save</Button>
            </DialogActions>
        </Dialog>
  )
}

export default AppPatientDialog
