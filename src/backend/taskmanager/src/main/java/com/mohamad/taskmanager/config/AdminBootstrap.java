package com.mohamad.taskmanager.config;

import com.mohamad.taskmanager.model.Role;
import com.mohamad.taskmanager.model.User;
import com.mohamad.taskmanager.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminBootstrap implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(AdminBootstrap.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String username;
    private final String email;
    private final String password;
    private final String phone;

    public AdminBootstrap(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${admin.bootstrap.username}") String username,
            @Value("${admin.bootstrap.email}") String email,
            @Value("${admin.bootstrap.password}") String password,
            @Value("${admin.bootstrap.phone:}") String phone
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.username = username;
        this.email = email;
        this.password = password;
        this.phone = phone;
    }

    @Override
    public void run(String... args) {
        boolean adminExists = userRepository.findAll().stream()
                .anyMatch(u -> u.getRole() == Role.ADMIN);
        if (adminExists) {
            logger.info("Admin existiert bereits, Bootstrap uebersprungen.");
            return;
        }
        if (email == null || email.isBlank() || password == null || password.isBlank()) {
            logger.warn("ADMIN_EMAIL/ADMIN_PASSWORD nicht gesetzt - kein Admin angelegt.");
            return;
        }
        if (userRepository.existsByEmail(email)) {
            logger.warn("User mit Email {} existiert bereits, aber ist kein Admin. Bootstrap uebersprungen.", email);
            return;
        }
        User admin = new User();
        admin.setUsername(username);
        admin.setEmail(email);
        admin.setPassword(passwordEncoder.encode(password));
        admin.setRole(Role.ADMIN);
        if (phone != null && !phone.isBlank()) {
            admin.setPhoneNumber(phone);
        }
        userRepository.save(admin);
        logger.info("Admin-Account angelegt: {}", email);
    }
}
