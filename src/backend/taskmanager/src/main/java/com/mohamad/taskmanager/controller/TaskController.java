package com.mohamad.taskmanager.controller;

import com.mohamad.taskmanager.dto.AssignTaskRequest;
import com.mohamad.taskmanager.dto.CreateTaskRequest;
import com.mohamad.taskmanager.dto.TaskResponse;
import com.mohamad.taskmanager.dto.UpdateTaskRequest;
import com.mohamad.taskmanager.model.User;
import com.mohamad.taskmanager.service.TaskService;
import com.mohamad.taskmanager.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;
    private final UserService userService;

    public TaskController(TaskService taskService, UserService userService) {
        this.taskService = taskService;
        this.userService = userService;
    }

    @GetMapping
    public List<TaskResponse> getAllTasks(@AuthenticationPrincipal UserDetails principal) {
        User me = userService.getByEmail(principal.getUsername());
        return taskService.listForUser(me).stream().map(TaskResponse::from).toList();
    }

    @GetMapping("/{id}")
    public TaskResponse getTaskById(@PathVariable int id,
                                    @AuthenticationPrincipal UserDetails principal) {
        User me = userService.getByEmail(principal.getUsername());
        return TaskResponse.from(taskService.getForUser(id, me));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TaskResponse> createTask(@RequestBody CreateTaskRequest req,
                                                   @AuthenticationPrincipal UserDetails principal) {
        User admin = userService.getByEmail(principal.getUsername());
        return ResponseEntity.status(201).body(TaskResponse.from(taskService.createTask(req, admin)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public TaskResponse updateTask(@PathVariable int id, @RequestBody UpdateTaskRequest req) {
        return TaskResponse.from(taskService.updateTask(id, req));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTask(@PathVariable int id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/claim")
    public TaskResponse claim(@PathVariable int id,
                              @AuthenticationPrincipal UserDetails principal) {
        User me = userService.getByEmail(principal.getUsername());
        return TaskResponse.from(taskService.claimTask(id, me));
    }

    @PostMapping("/{id}/release")
    public TaskResponse release(@PathVariable int id,
                                @AuthenticationPrincipal UserDetails principal) {
        User me = userService.getByEmail(principal.getUsername());
        return TaskResponse.from(taskService.releaseTask(id, me));
    }

    @PostMapping("/{id}/complete")
    public TaskResponse complete(@PathVariable int id,
                                 @AuthenticationPrincipal UserDetails principal) {
        User me = userService.getByEmail(principal.getUsername());
        return TaskResponse.from(taskService.completeTask(id, me));
    }

    @PutMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public TaskResponse assign(@PathVariable int id, @RequestBody AssignTaskRequest req) {
        return TaskResponse.from(taskService.assignTask(id, req.userId()));
    }
}
