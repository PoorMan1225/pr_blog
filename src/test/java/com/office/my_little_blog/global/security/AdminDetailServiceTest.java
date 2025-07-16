package com.office.my_little_blog.global.security;

import com.office.my_little_blog.admin.*;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootTest
class AdminDetailServiceTest {

    @Autowired
    private AdminDetailService adminDetailService;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private AdminAuthorityRepository adminAuthorityRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    @DisplayName("사용자 아이디 있는지 테스트 ")
    void adminIdTest() {
        // when
        UserDetails userDetails = adminDetailService.loadUserByUsername("superadmin");

        // then
        Assertions.assertThat(userDetails.getUsername()).isEqualTo("superadmin");
    }
    @Test
    @DisplayName("사용자 패스워드 맞는지 테스트 ")
    void adminPwdTest() {
        // when
        UserDetails userDetails = adminDetailService.loadUserByUsername("superadmin");

        // then
        Assertions.assertThat(
                passwordEncoder.matches("superadmin", userDetails.getPassword())
        ).isTrue();
    }
}