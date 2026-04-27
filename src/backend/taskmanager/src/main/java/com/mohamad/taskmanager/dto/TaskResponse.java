package com.mohamad.taskmanager.dto;

import com.mohamad.taskmanager.model.Role;
import com.mohamad.taskmanager.model.Task;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record TaskResponse(
        int id,
        String title,
        String description,
        boolean completed,
        String priority,
        LocalDate dueDate,
        LocalDateTime createdAt,
        LocalDateTime claimedAt,
        LocalDateTime completedAt,
        Role requiredRole,
        UserSummary assignee,
        UserSummary createdBy
) {
    public static TaskResponse from(Task task) {
        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.isCompleted(),
                task.getPriority(),
                task.getDueDate(),
                task.getCreatedAt(),
                task.getClaimedAt(),
                task.getCompletedAt(),
                task.getRequiredRole(),
                UserSummary.from(task.getUser()),
                UserSummary.from(task.getCreatedBy())
        );
    }
}
