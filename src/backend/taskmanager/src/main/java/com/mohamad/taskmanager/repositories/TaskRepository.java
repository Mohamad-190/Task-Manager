package com.mohamad.taskmanager.repositories;

import com.mohamad.taskmanager.model.Role;
import com.mohamad.taskmanager.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Integer> {

    List<Task> findByRequiredRole(Role requiredRole);

}
