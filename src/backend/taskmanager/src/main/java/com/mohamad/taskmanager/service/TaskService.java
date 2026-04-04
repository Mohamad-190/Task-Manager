package com.mohamad.taskmanager.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.mohamad.taskmanager.model.Task;
import com.mohamad.taskmanager.repositories.TaskRepository;


import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class TaskService {
    private static final Logger logger = LoggerFactory.getLogger(TaskService.class);
    @Autowired
    private TaskRepository taskRepository;

    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    public Task getTaskById(int id) {
        return taskRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Task nicht gefunden"));
    }

    public Task createTask(Task task) {
        if(task.getTitle() == null || task.getTitle().isEmpty()){
            throw new IllegalArgumentException("Titel darf nicht null oder leer sein");
        }
        logger.info("Task wird erstellt: {}", task.getTitle());
        Task saved = taskRepository.save(task);
        logger.info("Task erstellt mit ID: {}", saved.getId());
        return saved;
    }

    public void deleteTask(int id) {
        if (!taskRepository.existsById(id)) {
            throw new IllegalArgumentException("Task existiert nicht");
        }
        logger.info("Task wird gelöscht: {}", id);
        taskRepository.deleteById(id);
        logger.info("Task gelöscht: {}", id);
    }

}
