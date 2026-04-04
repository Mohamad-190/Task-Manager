package com.mohamad.taskmanager.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.mohamad.taskmanager.model.Task;
import com.mohamad.taskmanager.repositories.TaskRepository;

import java.util.List;

@Service
public class TaskService {
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
        return taskRepository.save(task);
    }

    public void deleteTask(int id) {
        if (!taskRepository.existsById(id)) {
            throw new IllegalArgumentException("Task existiert nicht");
        }
        taskRepository.deleteById(id);
    }

}
