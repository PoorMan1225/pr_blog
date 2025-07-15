package com.office.my_little_blog.global.config;

import com.office.my_little_blog.admin.AdminAuthorityEntity;
import com.office.my_little_blog.admin.AdminAuthorityRepository;
import com.office.my_little_blog.admin.AdminRole;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {
    @Bean
    CommandLineRunner initDatabase(AdminAuthorityRepository authorityRepository) {
        return args -> {
            if (!authorityRepository.existsByAdminRole(AdminRole.SUPER_ADMIN)) {     // 슈퍼 관리자 권한
                authorityRepository.save(
                        AdminAuthorityEntity.builder()
                                .adminRole(AdminRole.SUPER_ADMIN)
                                .build()
                );
            }

            if (!authorityRepository.existsByAdminRole(AdminRole.ADMIN)) {            // 일반 관리자 권한
                authorityRepository.save(
                        AdminAuthorityEntity.builder()
                                .adminRole(AdminRole.ADMIN)
                                .build()
                );
            }
        };
    }
}
