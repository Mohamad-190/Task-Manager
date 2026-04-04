package com.mohamad.taskmanager.service;


import com.mohamad.taskmanager.model.User;
import com.mohamad.taskmanager.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.mohamad.taskmanager.model.Task;
import com.mohamad.taskmanager.repositories.TaskRepository;

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

    public User createUser(User user) {
        if(user.getUsername() == null || user.getUsername().isEmpty()){
            throw new IllegalArgumentException("Username darf nicht null oder leer sein");
        }
        if(userRepository.existsByUsername(user.getUsername()))
        logger.info("User wird erstellt: {}", user.getUsername());
        String hashedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(hashedPassword);
        User saved = userRepository.save(user);
        logger.info("User erstellt mit ID: {}", saved.getId());
        return saved;
    }

    public void deleteUser(int id) {
        if (!userRepository.existsById(id)) {
            throw new IllegalArgumentException("User existiert nicht");
        }
        logger.info("User wird gelöscht: {}", id);
        userRepository.deleteById(id);
        logger.info("User gelöscht: {}", id);
    }


}
