package com.office.my_little_blog.global.config;

import com.office.my_little_blog.admin.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminDataInitializer {

    private final AdminAuthorityRepository authorityRepository;
    private final AdminRepository adminRepository;

    private final PasswordEncoder passwordEncoder;

    // 생성자 주입을 통해 필요한 리포지토리와 PasswordEncoder를 가져옵니다.
    public AdminDataInitializer(AdminAuthorityRepository authorityRepository,
                                AdminRepository adminRepository,
                                PasswordEncoder passwordEncoder) {
        this.authorityRepository = authorityRepository;
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // @Order(1) : 역할(Role) 초기화가 먼저 진행되도록 합니다.
    @Bean
    @Order(1)
    public CommandLineRunner initRoles() {
        return args -> {
            if (!authorityRepository.existsByAdminRole(AdminRole.SUPER_ADMIN)) {
                authorityRepository.save(
                        AdminAuthorityEntity.builder()
                                .adminRole(AdminRole.SUPER_ADMIN)
                                .build()
                );
            }
//
            if (!authorityRepository.existsByAdminRole(AdminRole.ADMIN)) {
                authorityRepository.save(
                        AdminAuthorityEntity.builder()
                                .adminRole(AdminRole.ADMIN)
                                .build()
                );
            }
        };
    }

    // @Order(2) : 사용자 초기화는 역할 초기화 이후에 진행되도록 합니다.
    @Bean
    @Order(2)
    public CommandLineRunner initAdmins() {
        return args -> {
            if (!adminRepository.existsByLoginId("superadmin")) {
                AdminAuthorityEntity superAdminRole = authorityRepository.findByAdminRole(AdminRole.SUPER_ADMIN)
                        .orElseThrow(() -> new RuntimeException("SUPER_ADMIN role not found"));

                adminRepository.save(
                        AdminEntity.builder()
                                .loginId("superadmin")
                                .loginPwd(passwordEncoder.encode("superadmin")) // 비밀번호 암호화
                                .adminAuthorityEntity(superAdminRole) // 기존에 존재하는 역할을 조회해서 연결
                                .build()
                );
            }

            if (!adminRepository.existsByLoginId("admin")) {
                AdminAuthorityEntity adminRole = authorityRepository.findByAdminRole(AdminRole.ADMIN)
                        .orElseThrow(() -> new RuntimeException("ADMIN role not found"));

                adminRepository.save(
                        AdminEntity.builder()
                                .loginId("admin")
                                .loginPwd(passwordEncoder.encode("admin")) // 비밀번호 암호화
                                .adminAuthorityEntity(adminRole) // 기존에 존재하는 역할을 조회해서 연결
                                .build()
                );
            }
        };
    }
}