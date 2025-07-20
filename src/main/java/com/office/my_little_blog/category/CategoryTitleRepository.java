package com.office.my_little_blog.category;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface CategoryTitleRepository extends JpaRepository<CategoryTitleEntity, Integer> {
    List<CategoryTitleEntity> findAllByOrderByNoAsc();
}
