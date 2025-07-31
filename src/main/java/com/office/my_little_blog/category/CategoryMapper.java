package com.office.my_little_blog.category;

import com.office.my_little_blog.global.exception.CategoryMappingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;

@Component
public class CategoryMapper {
    private final CategoryTitleRepository titleRepository;
    private final CategoryRepository categoryRepository;

    @Autowired
    public CategoryMapper(CategoryTitleRepository titleRepository, CategoryRepository categoryRepository) {
        this.titleRepository = titleRepository;
        this.categoryRepository = categoryRepository;
    }

    @Transactional(readOnly = true)
    public CategoryEntity toEntity(CategoryDto dto) {
        CategoryTitleEntity titleEntity = titleRepository.findById(dto.getCategoryTag())
                .orElseThrow(() -> new CategoryMappingException("카테고리 태그 값을 찾을 수 없습니다."));

        if (dto.hasServerId()) {
            // 기존 엔티티 가져와서 수정 (기존 엔티티 가져와서 수정안하면 db 랑 동기화가 안된다.)
            CategoryEntity existing = categoryRepository.findById(dto.getServerId())
                    .orElseThrow(() -> new IllegalStateException("수정 대상이 존재하지 않습니다."));

            existing.setTitleEntity(titleEntity);

            if(!dto.hasParent()) existing.setParentEntity(null);
            existing.setOrderNo(dto.getOrderNo());
            existing.setCategoryTitle(dto.getCategoryTitle());
            return existing;
        }

        // 신규 생성
        return CategoryEntity.builder()
                .titleEntity(titleEntity)
                .orderNo(dto.getOrderNo())
                .categoryTitle(dto.getCategoryTitle())
                .build();
    }

    public CategoryDto toDto(CategoryEntity entity) {
        return CategoryDto.builder()
                .categoryTag(entity.getTitleEntity().getNo())
                .categoryTitle(entity.getCategoryTitle())
                .state(CategoryState.DEFAULT)
                .orderNo(entity.getOrderNo())
                .children(new ArrayList<>())
                .serverId(entity.getNo())
                .build();
    }
}
