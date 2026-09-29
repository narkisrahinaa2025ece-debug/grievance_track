package com.example.grievance.controller;

import com.example.grievance.entity.Escalation;
import com.example.grievance.service.EscalationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/escalations")
@CrossOrigin(origins = "http://localhost:5173")
public class EscalationController {

    private final EscalationService escalationService;

    public EscalationController(EscalationService escalationService) {
        this.escalationService = escalationService;
    }

    @GetMapping
    public ResponseEntity<List<Escalation>> getAllEscalations() {
        return ResponseEntity.ok(
                escalationService.getAllEscalations()
        );
    }
}