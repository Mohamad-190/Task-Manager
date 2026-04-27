package com.mohamad.taskmanager.controller;

import com.mohamad.taskmanager.dto.ChangePasswordRequest;
import com.mohamad.taskmanager.dto.CreateUserRequest;
import com.mohamad.taskmanager.dto.UpdatePhoneRequest;
import com.mohamad.taskmanager.dto.UserResponse;
import com.mohamad.taskmanager.model.User;
import com.mohamad.taskmanager.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserResponse> getAllUsers() {
        return userService.getAllUsers().stream().map(UserResponse::from).toList();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse getUserById(@PathVariable int id) {
        return UserResponse.from(userService.getUserById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> createUser(@RequestBody CreateUserRequest req) {
        User created = userService.createUser(req);
        return ResponseEntity.status(201).body(UserResponse.from(created));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable int id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public UserResponse me(@AuthenticationPrincipal UserDetails principal) {
        return UserResponse.from(userService.getByEmail(principal.getUsername()));
    }

    @PutMapping("/me/password")
    public ResponseEntity<Void> changeOwnPassword(@AuthenticationPrincipal UserDetails principal,
                                                  @RequestBody ChangePasswordRequest req) {
        userService.changePassword(principal.getUsername(), req.oldPassword(), req.newPassword());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/me/phone")
    public UserResponse updateOwnPhone(@AuthenticationPrincipal UserDetails principal,
                                       @RequestBody UpdatePhoneRequest req) {
        return UserResponse.from(userService.updatePhone(principal.getUsername(), req.phoneNumber()));
    }
}
