package com.mohamad.taskmanager.repositories;

import com.mohamad.taskmanager.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends  JpaRepository<Task, Integer>{


}
