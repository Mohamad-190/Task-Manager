package com.mohamad.taskmanager.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.LocalDate;


@Entity
@Table(name = "tasks")
public class Task {
    public Task() {
    }

    public Task(String title, String description, boolean completed, String priority, LocalDate dueDate) {
    }


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int Id;

    @Column(nullable = false)
    private String title;

    private String description;

    private boolean completed;

    private String priority;

    private LocalDate dueDate;

    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;


    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        if (title == null || title.isEmpty()) {
            throw new IllegalArgumentException("Title darf nicht leer sein");
        }
        this.title = title;

    }

    public String getDescription() {
        return title;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isCompleted() {
        return completed;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public int getId() {
        return Id;
    }
}