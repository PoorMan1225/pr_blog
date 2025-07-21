package com.office.my_little_blog.category;

import com.office.my_little_blog.global.exception.CategoryMappingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryTitleRepository categoryTitleRepository;
    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    /**
     * 모든 카테고리 타이틀 정보 가져오기
     * 카테고리 타이틀 정보를 가져오기 때문에 캐시 처리 .
     */
    @Cacheable("categoryTitles")
    @Transactional(readOnly = true)
    public List<CategoryTitleDto> getAllCategoryTitles() {
        List<CategoryTitleEntity> categoryTitles = categoryTitleRepository.findAllByOrderByNoAsc();
        return categoryTitles.stream().map(CategoryTitleEntity::toDto).toList();
    }

    /**
     * 카테고리를 실제로 디비에 저장한다.
     */
    @Transactional
    public void updateCategories(List<CategoryDto> categories) {
        Map<String, CategoryEntity> entityMap = new HashMap<>();

        // 1. 모든 DTO를 Entity로 변환하고 map에 저장 (부모와 자식 모두)
        categories.forEach(dto -> {
            CategoryEntity entity = categoryMapper.toEntity(dto);
            entityMap.put(dto.getId(), entity);
        });

        log.info("mappings");
        // 2. 부모-자식 관계 설정
        categories.forEach(dto -> {
            if (dto.hasParent()) {
                CategoryEntity child = entityMap.get(dto.getId());
                CategoryEntity parent = entityMap.get(dto.getParentId());
                if(parent == null)
                    throw new CategoryMappingException("부모 엔티티를 찾을수 없습니다.");
                child.setParent(parent);
            }
        });
        log.info("chages");

        // 3. 변경된 엔티티만 필터링해서 저장
        List<CategoryEntity> changedEntities = categories.stream()
                .filter(CategoryDto::isChanged)
                .map(dto -> entityMap.get(dto.getId()))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        log.info("changedEntities = {}", categories.stream().toList());
        if (!changedEntities.isEmpty()) {
            // save all 을 하면 jpa 가 자동으로 pk 가 있으면 업데이트 하고 아니면 insert 한다.
            log.info("saveAll");
            categoryRepository.saveAll(changedEntities);
        }
    }
}
