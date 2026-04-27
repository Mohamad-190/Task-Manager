package com.mohamad.taskmanager.controller;

import com.mohamad.taskmanager.dto.LoginRequest;
import com.mohamad.taskmanager.dto.LoginResponse;
import com.mohamad.taskmanager.model.User;
import com.mohamad.taskmanager.security.JwtService;
import com.mohamad.taskmanager.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserService userService;

    public AuthController(AuthenticationManager authenticationManager,
                          JwtService jwtService,
                          UserService userService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.email(), req.password())
            );
        } catch (AuthenticationException ex) {
            return ResponseEntity.status(401).body("Email oder Passwort falsch");
        }
        User user = userService.getByEmail(req.email());
        String token = jwtService.generateToken(user.getEmail(), user.getRole().name());
        return ResponseEntity.ok(new LoginResponse(token, user.getEmail(), user.getRole()));
    }
}
