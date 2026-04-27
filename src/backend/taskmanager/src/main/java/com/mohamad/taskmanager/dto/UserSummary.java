package com.mohamad.taskmanager.dto;

import com.mohamad.taskmanager.model.Role;
import com.mohamad.taskmanager.model.User;

public record UserSummary(int id, String username, String email, Role role) {
    public static UserSummary from(User user) {
        if (user == null) {
            return null;
        }
        return new UserSummary(user.getId(), user.getUsername(), user.getEmail(), user.getRole());
    }
}
