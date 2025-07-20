package com.office.my_little_blog.admin;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AdminRepository extends JpaRepository<AdminEntity, Integer> {

    Optional<AdminEntity> findByLoginId(String id);

    boolean existsByLoginId(String loginId);

}
