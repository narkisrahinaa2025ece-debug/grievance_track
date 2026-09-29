package com.example.grievance.service;

import com.example.grievance.entity.Escalation;
import com.example.grievance.entity.Grievance;
import com.example.grievance.entity.GrievanceStatus;
import com.example.grievance.repository.EscalationRepository;
import com.example.grievance.repository.GrievanceRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SlaEscalationService {

    private final GrievanceRepository grievanceRepository;
    private final EscalationRepository escalationRepository;

    public SlaEscalationService(
            GrievanceRepository grievanceRepository,
            EscalationRepository escalationRepository) {

        this.grievanceRepository = grievanceRepository;
        this.escalationRepository = escalationRepository;
    }

    @Scheduled(fixedRate = 60000)
    public void checkOverdueGrievances() {

        LocalDateTime now = LocalDateTime.now();

        List<Grievance> grievances = grievanceRepository.findAll();

        for (Grievance grievance : grievances) {

            boolean completed =
                    grievance.getStatus() == GrievanceStatus.RESOLVED
                            || grievance.getStatus() == GrievanceStatus.CLOSED;

            boolean overdue =
                    grievance.getDueDate() != null
                            && grievance.getDueDate().isBefore(now);

            boolean alreadyEscalated =
                    grievance.getStatus() == GrievanceStatus.ESCALATED;

            if (overdue && !completed && !alreadyEscalated) {

                grievance.setStatus(GrievanceStatus.ESCALATED);

                grievanceRepository.save(grievance);

                Escalation escalation = new Escalation();

                escalation.setGrievance(grievance);
                escalation.setReason(
                        "SLA deadline exceeded"
                );
                escalation.setEscalatedTo(
                        grievance.getDepartment().getOfficerName()
                );
                escalation.setEscalatedAt(now);

                escalationRepository.save(escalation);

                System.out.println(
                        "SLA ESCALATION: Grievance ID "
                                + grievance.getId()
                                + " has been escalated."
                );
            }
        }
    }
}