package io.p3admin.service;

import io.p3admin.model.domain.Patient;
import io.p3admin.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class PatientServiceImpl implements PatientService {
    private final PatientRepository patientRepo;

    @Override
    public Page<Patient> getPatients(Pageable pageable) {
        log.debug("Getting patients for pageable {}", pageable);
        return patientRepo.findAll(pageable);
    }

    @Override
    public Patient savePatient(Patient patient) {
        log.debug("Saving patient '{}'", patient);
        return patientRepo.save(patient);
    }

    @Override
    public Patient updatePatient(Patient patient) {
        log.debug("Updating patient '{}'", patient);
        return patientRepo.findById(patient.getId())
                .map(existingPatient -> {
                    existingPatient.setActive(patient.isActive());
                    existingPatient.setFirstname(patient.getFirstname());
                    existingPatient.setLastname(patient.getLastname());
                    existingPatient.setEmail(patient.getEmail());
                    existingPatient.setSocialSecurityNumber(patient.getSocialSecurityNumber());
                    return patientRepo.save(existingPatient);
                }).orElseGet(() -> patientRepo.save(patient));
    }
}
