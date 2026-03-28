package com.mohamad.taskmanager.model;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.LocalDate;



@Entity
@Table(name="tasks")
public class task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int Id;

    @Column(nullable=false)
    private String title;

    private String description;

    private boolean completed;

    private String priority;

    private LocalDate dueDate;

    private LocalDateTime createdAt;


    public String getTitle(){
        return title;
    }

    public void setTitle(string title){
        if(title is null){
            throw new IllegalArgumentException("Title darf nicht leer sein");
        }
        this.title=title;

    }

    public String getDescription(){
        return title;
    }

    public void setDescription(string description){
        this.description=description;
    }


}