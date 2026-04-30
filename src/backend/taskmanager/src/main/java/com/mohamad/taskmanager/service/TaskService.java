package com.mohamad.taskmanager.service;

import com.mohamad.taskmanager.dto.CreateTaskRequest;
import com.mohamad.taskmanager.dto.UpdateTaskRequest;
import com.mohamad.taskmanager.model.Role;
import com.mohamad.taskmanager.model.Task;
import com.mohamad.taskmanager.model.User;
import com.mohamad.taskmanager.repositories.TaskRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TaskService {

    private static final Logger logger = LoggerFactory.getLogger(TaskService.class);

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserService userService;

    public List<Task> listForUser(User currentUser) {
        if (currentUser.getRole() == Role.ADMIN) {
            return taskRepository.findAll();
        }
        return taskRepository.findByRequiredRole(currentUser.getRole());
    }

    public List<Task> listAssignedTo(int userId) {
        userService.getUserById(userId);
        return taskRepository.findByUser_Id(userId);
    }

    public Task getForUser(int id, User currentUser) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Task nicht gefunden"));
        if (currentUser.getRole() != Role.ADMIN && task.getRequiredRole() != currentUser.getRole()) {
            throw new AccessDeniedException("Kein Zugriff auf diesen Task");
        }
        return task;
    }

    public Task createTask(CreateTaskRequest req, User admin) {
        if (req.title() == null || req.title().isBlank()) {
            throw new IllegalArgumentException("Titel darf nicht leer sein");
        }
        if (req.requiredRole() == null) {
            throw new IllegalArgumentException("RequiredRole darf nicht leer sein");
        }
        if (req.requiredRole() == Role.ADMIN) {
            throw new IllegalArgumentException("Tasks koennen nicht der Rolle ADMIN zugeordnet werden");
        }

        Task task = new Task();
        task.setTitle(req.title());
        task.setDescription(req.description());
        task.setPriority(req.priority());
        task.setDueDate(req.dueDate());
        task.setRequiredRole(req.requiredRole());
        task.setCreatedBy(admin);

        if (req.assigneeId() != null) {
            User assignee = userService.getUserById(req.assigneeId());
            if (assignee.getRole() != req.requiredRole()) {
                throw new IllegalArgumentException(
                        "Assignee hat Rolle " + assignee.getRole() + ", erforderlich ist " + req.requiredRole());
            }
            task.setUser(assignee);
            task.setClaimedAt(LocalDateTime.now());
        }

        Task saved = taskRepository.save(task);
        logger.info("Task erstellt: {} (id={}, requiredRole={}, assignee={})",
                saved.getTitle(), saved.getId(), saved.getRequiredRole(),
                saved.getUser() != null ? saved.getUser().getEmail() : "-");
        return saved;
    }

    public Task updateTask(int id, UpdateTaskRequest req) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Task nicht gefunden"));
        if (req.title() != null) {
            task.setTitle(req.title());
        }
        if (req.description() != null) {
            task.setDescription(req.description());
        }
        if (req.priority() != null) {
            task.setPriority(req.priority());
        }
        if (req.dueDate() != null) {
            task.setDueDate(req.dueDate());
        }
        if (req.requiredRole() != null) {
            if (req.requiredRole() == Role.ADMIN) {
                throw new IllegalArgumentException("Tasks koennen nicht der Rolle ADMIN zugeordnet werden");
            }
            if (task.getUser() != null && task.getUser().getRole() != req.requiredRole()) {
                throw new IllegalArgumentException(
                        "Aktueller Assignee passt nicht zur neuen Rolle - bitte zuerst neu zuweisen oder freigeben");
            }
            task.setRequiredRole(req.requiredRole());
        }
        Task saved = taskRepository.save(task);
        logger.info("Task aktualisiert: id={}", saved.getId());
        return saved;
    }

    public void deleteTask(int id) {
        if (!taskRepository.existsById(id)) {
            throw new IllegalArgumentException("Task existiert nicht");
        }
        logger.info("Task wird geloescht: {}", id);
        taskRepository.deleteById(id);
    }

    public Task claimTask(int id, User currentUser) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Task nicht gefunden"));
        if (task.isCompleted()) {
            throw new IllegalArgumentException("Task ist bereits erledigt");
        }
        if (task.getUser() != null) {
            throw new IllegalArgumentException("Task ist bereits zugewiesen");
        }
        if (currentUser.getRole() != task.getRequiredRole()) {
            throw new AccessDeniedException("Du hast nicht die passende Rolle fuer diesen Task");
        }
        task.setUser(currentUser);
        task.setClaimedAt(LocalDateTime.now());
        Task saved = taskRepository.save(task);
        logger.info("Task uebernommen: id={} von {}", saved.getId(), currentUser.getEmail());
        return saved;
    }

    public Task releaseTask(int id, User currentUser) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Task nicht gefunden"));
        if (task.isCompleted()) {
            throw new IllegalArgumentException("Erledigte Tasks koennen nicht freigegeben werden");
        }
        if (task.getUser() == null) {
            throw new IllegalArgumentException("Task ist nicht zugewiesen");
        }
        boolean isAssignee = task.getUser().getId() == currentUser.getId();
        boolean isAdmin = currentUser.getRole() == Role.ADMIN;
        if (!isAssignee && !isAdmin) {
            throw new AccessDeniedException("Nur der Assignee oder ein Admin kann den Task freigeben");
        }
        task.setUser(null);
        task.setClaimedAt(null);
        Task saved = taskRepository.save(task);
        logger.info("Task freigegeben: id={} von {}", saved.getId(), currentUser.getEmail());
        return saved;
    }

    public Task completeTask(int id, User currentUser) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Task nicht gefunden"));
        if (task.isCompleted()) {
            throw new IllegalArgumentException("Task ist bereits erledigt");
        }
        boolean isAssignee = task.getUser() != null && task.getUser().getId() == currentUser.getId();
        boolean isAdmin = currentUser.getRole() == Role.ADMIN;
        if (!isAssignee && !isAdmin) {
            throw new AccessDeniedException("Nur der Assignee oder ein Admin kann den Task abschliessen");
        }
        task.setCompleted(true);
        task.setCompletedAt(LocalDateTime.now());
        Task saved = taskRepository.save(task);
        logger.info("Task erledigt: id={} von {}", saved.getId(), currentUser.getEmail());
        return saved;
    }

    public Task assignTask(int id, int userId) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Task nicht gefunden"));
        if (task.isCompleted()) {
            throw new IllegalArgumentException("Erledigte Tasks koennen nicht neu zugewiesen werden");
        }
        User assignee = userService.getUserById(userId);
        if (assignee.getRole() != task.getRequiredRole()) {
            throw new IllegalArgumentException(
                    "Assignee hat Rolle " + assignee.getRole() + ", erforderlich ist " + task.getRequiredRole());
        }
        task.setUser(assignee);
        task.setClaimedAt(LocalDateTime.now());
        Task saved = taskRepository.save(task);
        logger.info("Task zugewiesen: id={} an {}", saved.getId(), assignee.getEmail());
        return saved;
    }
}
