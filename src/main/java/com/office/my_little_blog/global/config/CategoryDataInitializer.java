package com.office.my_little_blog.global.config;

import com.office.my_little_blog.category.CategoryTitle;
import com.office.my_little_blog.category.CategoryTitleEntity;
import com.office.my_little_blog.category.CategoryTitleRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Configuration
public class CategoryDataInitializer {

    private final CategoryTitleRepository categoryTitleRepository;

    // 생성자 주입을 통해 필요한 리포지토리와 PasswordEncoder를 가져옵니다.
    public CategoryDataInitializer(CategoryTitleRepository categoryTitleRepository) {
        this.categoryTitleRepository = categoryTitleRepository;
    }

    // @Order(1) : 역할(Role) 초기화가 먼저 진행되도록 합니다.
    @Bean
    @Order(1)
    @Transactional
    public CommandLineRunner initCategoryTitles() {
        return args -> {
            List<CategoryTitleEntity> newCategoryTitles = new ArrayList<>();
            for(CategoryTitle categoryTitle : CategoryTitle.values()) {
                // exists 도 경합이 발생할 수 있지만 여기서는 읽기가 없기 때문에 발생할 가능성이 없다.
                if (!categoryTitleRepository.existsById(categoryTitle.getId())) {
                    newCategoryTitles.add(
                            CategoryTitleEntity.builder()
                                    .no(categoryTitle.getId())
                                    .title(categoryTitle.getDisplayName())
                                    .build()
                    );
                }
            }
            // 한번의 데이터 저장
            if (!newCategoryTitles.isEmpty()) {
                categoryTitleRepository.saveAll(newCategoryTitles);
            }
        };
    }
}