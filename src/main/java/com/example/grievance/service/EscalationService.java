package com.example.grievance.service;

import com.example.grievance.entity.Escalation;
import com.example.grievance.repository.EscalationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EscalationService {

    private final EscalationRepository escalationRepository;

    public EscalationService(EscalationRepository escalationRepository) {
        this.escalationRepository = escalationRepository;
    }

    public List<Escalation> getAllEscalations() {
        return escalationRepository.findAll();
    }

    public Escalation createEscalation(Escalation escalation) {
        return escalationRepository.save(escalation);
    }
}