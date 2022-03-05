package io.p3admin.controller;

import io.p3admin.model.domain.Patient;
import io.p3admin.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class PatientController {
    private final PatientService patientService;

    @GetMapping("/patients")
    Page<Patient> getPatients(Pageable pageable) {
        return patientService.getPatients(pageable);
    }

    @PostMapping("/patients")
    Patient savePatient(@Valid @RequestBody Patient patient) {
        return patientService.savePatient(patient);
    }

    @PutMapping("/patients")
    Patient updatePatient(@Valid @RequestBody Patient patient) {
        return patientService.updatePatient(patient);
    }
}
