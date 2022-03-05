package io.p3admin.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@ControllerAdvice
public class ValidationErrorController {
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<Map<String, String>> handleFieldValidationError(MethodArgumentNotValidException e) {
        var errorMap = e.getBindingResult().getAllErrors()
                .stream().filter(error -> error instanceof FieldError)
                .collect(
                        Collectors.toMap(
                                error -> ((FieldError) error).getField(),
                                error -> Optional.ofNullable(error.getDefaultMessage()).orElse("")
                        )
                );

        return new ResponseEntity<>(errorMap, HttpStatus.BAD_REQUEST);
    }
}
