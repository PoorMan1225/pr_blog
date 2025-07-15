package com.office.my_little_blog.admin;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "Admins")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminEntity {

    @Id
    @Column(name = "no")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int no;

    @Column(name = "id", nullable = false, unique = true)
    private String id;

    @Column(name = "pwd", nullable = false)
    private String pwd;

    @ManyToOne
    @JoinColumn(name = "auth_no")
    private AdminAuthorityEntity adminAuthorityEntity; // 참조 권한 번호

    @Column(name = "create_dt", updatable = false)
    private LocalDateTime createDt;                  // 사용자 정보 등록일

    @Column(name = "update_dt")
    private LocalDateTime updateDt;                  // 사용자 정보 수정일

    @PrePersist
    protected void onCreate() {
        this.adminAuthorityEntity = new AdminAuthorityEntity(AdminRole.ADMIN);  // 1: SUPER_ADMIN, 2: ADMIN
        this.createDt = LocalDateTime.now();
        this.updateDt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updateDt = LocalDateTime.now();
    }
}
