package com.office.my_little_blog.admin;

import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;


//@DataJpaTest // JPA 관련 Bean 만 로딩
@ActiveProfiles("test")
@SpringBootTest
class AdminAuthorityRepositoryTest {

    @Autowired
    AdminAuthorityRepository repository;

    @Test
    void existsByAdminRoleTest() {
        // given
        AdminAuthorityEntity entity = AdminAuthorityEntity
                .builder()
                .adminRole(AdminRole.SUPER_ADMIN)
                .build();

        repository.save(entity);

        // when
        boolean exists = repository.existsByAdminRole(AdminRole.SUPER_ADMIN);

        // then
        Assertions.assertThat(exists).isTrue();
    }
}