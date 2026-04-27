package com.mohamad.taskmanager.dto;

import com.mohamad.taskmanager.model.Role;

import java.time.LocalDate;

public record UpdateTaskRequest(
        String title,
        String description,
        String priority,
        LocalDate dueDate,
        Role requiredRole
) {}
