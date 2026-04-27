package com.mohamad.taskmanager.dto;

import com.mohamad.taskmanager.model.Role;

public record CreateUserRequest(
        String username,
        String email,
        String password,
        Role role,
        String phoneNumber
) {}
