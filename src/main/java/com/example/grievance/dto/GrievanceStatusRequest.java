package com.example.grievance.dto;

import com.example.grievance.entity.GrievanceStatus;
import jakarta.validation.constraints.NotNull;

public class GrievanceStatusRequest {

    @NotNull(message = "Status is required")
    private GrievanceStatus status;

    public GrievanceStatusRequest() {
    }

    public GrievanceStatus getStatus() {
        return status;
    }

    public void setStatus(GrievanceStatus status) {
        this.status = status;
    }
}