package com.office.my_little_blog.category;

import com.office.my_little_blog.global.exception.CategoryMappingException;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Component
public class CategoryMapper {
    private final CategoryTitleRepository titleRepository;

    public CategoryMapper(CategoryTitleRepository titleRepository) {
        this.titleRepository = titleRepository;
    }

    @Transactional(readOnly = true)
    public CategoryEntity toEntity(CategoryDto dto) {
        CategoryTitleEntity titleEntity = titleRepository.findById(dto.getCategoryTag())
                .orElseThrow(() -> new CategoryMappingException("카테고리 태그 값을 찾을 수 없습니다."));

        CategoryEntity categoryEntity = CategoryEntity.builder()
                .title(titleEntity)
                .orderNo(dto.getOrderNo())
                .categoryTitle(dto.getCategoryTitle())
                .build();

        if (dto.hasServerId()) categoryEntity.setNo(dto.getServerId());
        return categoryEntity;
    }

    public CategoryDto toDto(CategoryEntity entity) {
        return CategoryDto.builder()
                .categoryTag(entity.getTitle().getNo())
                .state(CategoryState.DEFAULT)
                .orderNo(entity.getOrderNo())
                .serverId(entity.getNo())
                .isChanged(false)
                .build();
    }
}
