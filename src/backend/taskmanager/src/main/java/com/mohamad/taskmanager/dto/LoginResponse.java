package com.mohamad.taskmanager.dto;

import com.mohamad.taskmanager.model.Role;

public record LoginResponse(String token, String email, Role role) {}
