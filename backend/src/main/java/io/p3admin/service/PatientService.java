package io.p3admin.service;

import io.p3admin.model.domain.Patient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PatientService {
    Page<Patient> getPatients(Pageable pageable);

    Patient savePatient(Patient patient);

    Patient updatePatient(Patient patient);
}
