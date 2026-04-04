package com.mohamad.taskmanager.service;


import com.mohamad.taskmanager.model.User;
import com.mohamad.taskmanager.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.mohamad.taskmanager.model.Task;
import com.mohamad.taskmanager.repositories.TaskRepository;

import java.util.List;

@Service
public class UserService {
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
        return userRepository.save(user);
    }

    public void deleteUser(int id) {
        if (!userRepository.existsById(id)) {
            throw new IllegalArgumentException("User existiert nicht");
        }
        userRepository.deleteById(id);
    }


}
