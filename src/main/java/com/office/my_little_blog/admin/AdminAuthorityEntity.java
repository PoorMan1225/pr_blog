package com.office.my_little_blog.admin;

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
public class AdminAuthorityEntity {
    @Id
    @Column(name = "no")
    @GeneratedValue(strategy = GenerationType.IDENTITY)                 // id
    private int no;

    @Column(name = "auth_no", nullable = false, unique = true)          // 권한 번호
    private int authNo;

    @Enumerated(EnumType.STRING)
    @Column(name = "admin_role_name", nullable = true)
    private AdminRole adminRole;

    @Builder
    public AdminAuthorityEntity(AdminRole adminRole) {
        this.authNo = adminRole.getAdminNo();
        this.adminRole = adminRole;
    }
}
