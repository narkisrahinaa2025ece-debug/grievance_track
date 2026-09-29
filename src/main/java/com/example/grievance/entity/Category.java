package com.example.grievance.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "categories")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    private Integer slaDays;

    @Column(nullable = false)
    private String description;

    public Category() {
    }

    public Category(String name, Integer slaDays, String description) {
        this.name = name;
        this.slaDays = slaDays;
        this.description = description;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getSlaDays() {
        return slaDays;
    }

    public void setSlaDays(Integer slaDays) {
        this.slaDays = slaDays;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}