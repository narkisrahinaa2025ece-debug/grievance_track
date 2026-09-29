package com.example.grievance.service;

import com.example.grievance.dto.GrievanceRequest;
import com.example.grievance.dto.GrievanceResponse;
import com.example.grievance.entity.Category;
import com.example.grievance.entity.Department;
import com.example.grievance.entity.Grievance;
import com.example.grievance.entity.GrievanceStatus;
import com.example.grievance.entity.Priority;
import com.example.grievance.repository.CategoryRepository;
import com.example.grievance.repository.DepartmentRepository;
import com.example.grievance.repository.GrievanceRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class GrievanceService {

    private final GrievanceRepository grievanceRepository;
    private final CategoryRepository categoryRepository;
    private final DepartmentRepository departmentRepository;

    public GrievanceService(
            GrievanceRepository grievanceRepository,
            CategoryRepository categoryRepository,
            DepartmentRepository departmentRepository) {

        this.grievanceRepository = grievanceRepository;
        this.categoryRepository = categoryRepository;
        this.departmentRepository = departmentRepository;
    }

    // CREATE GRIEVANCE
    public GrievanceResponse createGrievance(GrievanceRequest request) {

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() ->
                        new RuntimeException("Category not found"));

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() ->
                        new RuntimeException("Department not found"));

        LocalDateTime createdAt = LocalDateTime.now();

        LocalDateTime dueDate =
                createdAt.plusDays(category.getSlaDays());

        Grievance grievance = new Grievance();

        grievance.setTitle(request.getTitle());
        grievance.setDescription(request.getDescription());
        grievance.setCitizenName(request.getCitizenName());
        grievance.setCitizenEmail(request.getCitizenEmail());
        grievance.setLocation(request.getLocation());

        grievance.setCategory(category);
        grievance.setDepartment(department);

        grievance.setStatus(GrievanceStatus.SUBMITTED);
        grievance.setPriority(Priority.MEDIUM);

        grievance.setCreatedAt(createdAt);
        grievance.setDueDate(dueDate);

        Grievance savedGrievance =
                grievanceRepository.save(grievance);

        return convertToResponse(savedGrievance);
    }

    // GET ALL GRIEVANCES
    public List<GrievanceResponse> getAllGrievances() {

        return grievanceRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    // GET GRIEVANCE BY ID
    public GrievanceResponse getGrievanceById(Long id) {

        Grievance grievance = grievanceRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Grievance not found"));

        return convertToResponse(grievance);
    }

    // UPDATE GRIEVANCE STATUS
    public GrievanceResponse updateStatus(
            Long id,
            GrievanceStatus newStatus) {

        Grievance grievance = grievanceRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Grievance not found"));

        grievance.setStatus(newStatus);

        // When complaint is resolved,
        // automatically store the resolution time.
        if (newStatus == GrievanceStatus.RESOLVED) {
            grievance.setResolvedAt(LocalDateTime.now());
        }

        Grievance updatedGrievance =
                grievanceRepository.save(grievance);

        return convertToResponse(updatedGrievance);
    }

    // CONVERT ENTITY TO RESPONSE DTO
    private GrievanceResponse convertToResponse(
            Grievance grievance) {

        GrievanceResponse response =
                new GrievanceResponse();

        response.setId(grievance.getId());
        response.setTitle(grievance.getTitle());
        response.setDescription(grievance.getDescription());

        response.setCitizenName(
                grievance.getCitizenName()
        );

        response.setCitizenEmail(
                grievance.getCitizenEmail()
        );

        response.setLocation(
                grievance.getLocation()
        );

        response.setCategoryName(
                grievance.getCategory().getName()
        );

        response.setDepartmentName(
                grievance.getDepartment().getName()
        );

        response.setStatus(
                grievance.getStatus()
        );

        response.setPriority(
                grievance.getPriority()
        );

        response.setCreatedAt(
                grievance.getCreatedAt()
        );

        response.setDueDate(
                grievance.getDueDate()
        );

        response.setResolvedAt(
                grievance.getResolvedAt()
        );

        return response;
    }
}