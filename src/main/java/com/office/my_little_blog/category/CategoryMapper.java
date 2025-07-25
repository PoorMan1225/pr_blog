package com.office.my_little_blog.category;

import com.office.my_little_blog.global.exception.CategoryMappingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

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
            // 기존 엔티티 가져와서 수정
            CategoryEntity existing = categoryRepository.findById(dto.getServerId())
                    .orElseThrow(() -> new IllegalStateException("수정 대상이 존재하지 않습니다."));

            existing.setTitleEntity(titleEntity);
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

    /**
     * DB 구조가 평면 적 재귀 구조기 때문에 평탄화 작업을 해줘야 한다.
     */
    @Transactional(readOnly = true)
    public List<CategoryEntity> toEntities(List<CategoryDto> dtoList) {
        List<CategoryEntity> categoryEntities = new ArrayList<>();
        for (CategoryDto parentDto : dtoList) {
            CategoryEntity parentEntity = toEntity(parentDto);
            categoryEntities.add(parentEntity);

            for (CategoryDto childDto : parentDto.getChildren()) {
                CategoryEntity childEntity = toEntity(childDto);
                childEntity.setParentEntity(parentEntity);
                categoryEntities.add(childEntity);
            }
        }
        return categoryEntities;
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
