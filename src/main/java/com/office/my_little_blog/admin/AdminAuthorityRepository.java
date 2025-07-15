package com.office.my_little_blog.admin;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdminAuthorityRepository extends JpaRepository<AdminAuthorityEntity, Integer> {

    /**
     * 해당 권한이 있는지 여부 확인
     * @param adminRole 어드민 권한
     * @return 권한 여부
     */
    boolean existsByAdminRole(AdminRole adminRole);

}
