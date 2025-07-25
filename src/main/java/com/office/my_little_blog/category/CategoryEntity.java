package com.office.my_little_blog.category;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;


@Data
@Entity
@Table(name = "category")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "no")
    private int no;

    @ManyToOne
    @JoinColumn(name = "title_no") // FK
    private CategoryTitleEntity title;

    @Column(name = "order_no")
    private int orderNo;

    @ManyToOne
    @JoinColumn(name = "parent_no") // FK (self-reference)
    private CategoryEntity parent;

    @Column(name = "category_title", unique = true, nullable = false)
    private String categoryTitle;

    @Column(name = "create_dt", updatable = false)
    private LocalDateTime createDt;

    @Column(name = "update_dt")
    private LocalDateTime updateDt;

    @PrePersist
    protected void onCreate() {
        this.createDt = LocalDateTime.now();
        this.updateDt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updateDt = LocalDateTime.now();
    }
}

