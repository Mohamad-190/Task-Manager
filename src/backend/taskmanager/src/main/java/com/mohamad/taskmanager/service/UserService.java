package com.mohamad.taskmanager.service;


import com.mohamad.taskmanager.dto.CreateUserRequest;
import com.mohamad.taskmanager.model.Role;
import com.mohamad.taskmanager.model.User;
import com.mohamad.taskmanager.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private UserRepository userRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(int id) {
        return userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("User nicht gefunden"));
    }

    public User getByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User nicht gefunden"));
    }

    public User createUser(CreateUserRequest req) {
        if (req.username() == null || req.username().isBlank()) {
            throw new IllegalArgumentException("Username darf nicht leer sein");
        }
        if (req.email() == null || req.email().isBlank()) {
            throw new IllegalArgumentException("Email darf nicht leer sein");
        }
        if (req.password() == null || req.password().length() < 8) {
            throw new IllegalArgumentException("Passwort muss mindestens 8 Zeichen lang sein");
        }
        if (req.role() == null) {
            throw new IllegalArgumentException("Rolle darf nicht leer sein");
        }
        if (userRepository.existsByEmail(req.email())) {
            throw new IllegalArgumentException("User mit dieser Email existiert bereits");
        }
        if (userRepository.existsByUsername(req.username())) {
            throw new IllegalArgumentException("Username ist bereits vergeben");
        }

        User user = new User();
        user.setUsername(req.username());
        user.setEmail(req.email());
        user.setPassword(passwordEncoder.encode(req.password()));
        user.setRole(req.role());
        if (req.phoneNumber() != null && !req.phoneNumber().isBlank()) {
            user.setPhoneNumber(req.phoneNumber());
        }

        User saved = userRepository.save(user);
        logger.info("User erstellt: {} (id={}, role={})", saved.getEmail(), saved.getId(), saved.getRole());
        return saved;
    }

    public void changePassword(String email, String oldPassword, String newPassword) {
        if (newPassword == null || newPassword.length() < 8) {
            throw new IllegalArgumentException("Neues Passwort muss mindestens 8 Zeichen lang sein");
        }
        User user = getByEmail(email);
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new IllegalArgumentException("Altes Passwort ist falsch");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        logger.info("Passwort geaendert fuer User: {}", email);
    }

    public User updatePhone(String email, String phoneNumber) {
        User user = getByEmail(email);
        user.setPhoneNumber(phoneNumber);
        User saved = userRepository.save(user);
        logger.info("Telefonnummer aktualisiert fuer User: {}", email);
        return saved;
    }

    public void deleteUser(int id) {
        User user = getUserById(id);
        if (user.getRole() == Role.ADMIN) {
            long adminCount = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == Role.ADMIN)
                    .count();
            if (adminCount <= 1) {
                throw new IllegalArgumentException("Letzten Admin kann nicht geloescht werden");
            }
        }
        logger.info("User wird geloescht: {}", id);
        userRepository.deleteById(id);
        logger.info("User geloescht: {}", id);
    }

}
