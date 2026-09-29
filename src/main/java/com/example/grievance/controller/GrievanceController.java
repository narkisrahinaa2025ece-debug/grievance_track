package com.example.grievance.controller;

import com.example.grievance.dto.GrievanceRequest;
import com.example.grievance.dto.GrievanceResponse;
import com.example.grievance.dto.GrievanceStatusRequest;
import com.example.grievance.entity.GrievanceStatus;
import com.example.grievance.service.GrievanceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/grievances")
@CrossOrigin(origins = "http://localhost:5173")
public class GrievanceController {

    private final GrievanceService grievanceService;

    public GrievanceController(GrievanceService grievanceService) {
        this.grievanceService = grievanceService;
    }

    @PostMapping
    public ResponseEntity<GrievanceResponse> createGrievance(
            @Valid @RequestBody GrievanceRequest request) {

        GrievanceResponse response =
                grievanceService.createGrievance(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    public ResponseEntity<List<GrievanceResponse>> getAllGrievances() {

        List<GrievanceResponse> grievances =
                grievanceService.getAllGrievances();

        return ResponseEntity.ok(grievances);
    }

    @GetMapping("/{id}")
    public ResponseEntity<GrievanceResponse> getGrievanceById(
            @PathVariable Long id) {

        GrievanceResponse response =
                grievanceService.getGrievanceById(id);

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<GrievanceResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody GrievanceStatusRequest request) {

        GrievanceStatus status = request.getStatus();

        GrievanceResponse response =
                grievanceService.updateStatus(id, status);

        return ResponseEntity.ok(response);
    }
}