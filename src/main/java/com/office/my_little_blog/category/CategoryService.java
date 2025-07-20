package com.office.my_little_blog.category;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryTitleRepository categoryTitleRepository;

    /**
     * 모든 카테고리 타이틀 정보 가져오기
     * 카테고리 타이틀 정보를 가져오기 때문에 캐시 처리 .
     */
    @Cacheable("categoryTitles")
    public List<CategoryTitleDto> getAllCategoryTitles() {
        List<CategoryTitleEntity> categoryTitles = categoryTitleRepository.findAllByOrderByNoAsc();
        return categoryTitles.stream().map(CategoryTitleEntity::toDto).toList();
    }
}
