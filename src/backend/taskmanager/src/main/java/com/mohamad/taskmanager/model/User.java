package com.mohamad.taskmanager.model;

import jakarta.persistence.*;

import java.util.List;


@Entity
@Table(name = "users")
public class User {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int Id;
    @Column(nullable = false, unique = true)
    private String username;
    private String password;
    @OneToMany(mappedBy = "user")
    private List<Task> tasks;
    @Enumerated(EnumType.STRING)
    private Role role;

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        if (username == null || username.isEmpty()) {
            throw new IllegalArgumentException("Username darf nicht leer sein");
        }
        this.username = username;
    }

    public int getId() {
        return Id;
    }
}