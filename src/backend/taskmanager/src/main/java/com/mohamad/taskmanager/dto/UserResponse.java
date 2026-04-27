package com.mohamad.taskmanager.dto;

import com.mohamad.taskmanager.model.Role;
import com.mohamad.taskmanager.model.User;

public record UserResponse(
        int id,
        String username,
        String email,
        String phoneNumber,
        Role role
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getRole()
        );
    }
}
