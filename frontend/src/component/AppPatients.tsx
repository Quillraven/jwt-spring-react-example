import React, { useEffect, useState } from 'react';
import { DataGrid, GridCellEditCommitParams, GridColDef } from '@mui/x-data-grid';
import { Alert, Button, Container, Typography } from '@mui/material';
import patientService, { IPatient } from '../service/patient-service';
import AppPatientDialog from './AppPatientDialog';

const AppPatients = () => {
  const [rows, setRows] = useState<IPatient[]>([])
  const [size, setSize] = useState(50)
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [error, setError] = useState('')
  const [showNewPatient, setShowNewPatient] = useState(false)

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 50,
      editable: false
    },
    {
      field: 'active',
      headerName: 'Active',
      width: 90,
      editable: true,
      type: 'boolean'
    },
    {
      field: 'firstname',
      headerName: 'First Name',
      width: 170,
      editable: true
    },
    {
      field: 'lastname',
      headerName: 'Last Name',
      width: 170,
      editable: true
    },
    {
      field: 'socialSecurityNumber',
      headerName: 'Social Security Number',
      width: 200,
      editable: true
    },
    {
      field: 'email',
      headerName: 'E-Mail',
      width: 270,
      editable: true
    }
  ]

  const onCellEditCommit = async (params: GridCellEditCommitParams) => {
    const patient = rows.filter(it => it.id === params.id)[0]
    const attr = params.field as keyof IPatient
    const oldValue = patient[attr]
    const newValue = params.value
    if (oldValue !== newValue) {
      // cell value changed -> update patient
      try {
        const newPatient = await patientService.updatePatient({ ...patient, [attr]: newValue })
        setError('')
        setRows((prev) => prev.map(it => it.id === newPatient.id ? { ...it, ...newPatient } : it))
      } catch (_) {
        // could not update patient -> reset value
        setError('Could not save patient data - please try again!')
        setRows(prev => [...prev])
      }
    }
  }

  const onSaveDialog = async (patient: IPatient) => {
    // patient successfully created -> add it to top of table
    setRows(prev => [patient, ...prev])
    setShowNewPatient(false)
    setTotal(prev => prev + 1)
  }

  const onPageChange = async (newPage:number, pageSize:number = size) => {
    setPage(newPage)
    setSize(pageSize)
    const pageable = await patientService.getPatients(newPage, pageSize)
    setRows(pageable.content)
    setTotal(pageable.totalElements)
  }

  useEffect(() => {
    (async () => {
      await onPageChange(0)
    })()
  }, [patientService])

  return (
        <Container>
            <AppPatientDialog show={showNewPatient} onSave={onSaveDialog} onClose={() => setShowNewPatient(false)}/>
            <Typography variant={'h3'}>
                Patients
            </Typography>
            <Button color={'primary'} variant={'contained'} style={{ marginBottom: 6 }}
                    onClick={() => setShowNewPatient(true)}
            >
                New Patient
            </Button>
            <DataGrid
                autoHeight={true}
                rows={rows}
                columns={columns}
                pageSize={size}
                rowCount={total}
                pagination={true}
                checkboxSelection={false}
                disableSelectionOnClick={true}
                paginationMode={'server'}
                experimentalFeatures={{ preventCommitWhileValidating: true }}
                onCellEditCommit={onCellEditCommit}
                onPageSizeChange={(newSize) => onPageChange(page, newSize)}
                onPageChange={(newPage) => onPageChange(newPage, size)}
            />
            {
                error &&
                <Alert severity={'error'}>{error}</Alert>
            }
        </Container>
  )
}

export default AppPatients
