package com.office.my_little_blog.domain.admin;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Entity
@Table
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserAuthorityEntity {
    @Id
    @Column(name = "no")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int no;

    @Column(name = "auth_no", nullable = false, unique = true)
    private int authNo;

    @Column(name = "name", unique = true, nullable = false)
    private String name;

    @Builder
    public UserAuthorityEntity(int authNo, String name) {
        this.authNo = authNo;
        this.name = name;
    }
}
