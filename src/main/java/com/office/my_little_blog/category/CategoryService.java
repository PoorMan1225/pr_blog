package com.office.my_little_blog.category;

import com.office.my_little_blog.global.exception.CategoryMappingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

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
     * 모든 카테고리 Entity를 받아서 dto 로 변환 후 전달.
     *
     * @return 정렬된 리스트 반환.
     */
    @Transactional(readOnly = true)
    public List<CategoryDto> getAllCategories() {
        List<CategoryEntity> categories = categoryRepository.findAll();
        List<CategoryDto> categoryDtoList = new ArrayList<>();
        Map<Integer, CategoryDto> map = new HashMap<>();

        for (CategoryEntity categoryEntity : categories) {
            if (categoryEntity.getParentEntity() == null) {
                CategoryDto dto = categoryMapper.toDto(categoryEntity);
                map.put(categoryEntity.getNo(), dto);
                categoryDtoList.add(dto);
            }
        }
        // 부모 먼저 졍렬
        categoryDtoList.sort(Comparator.comparingInt(CategoryDto::getOrderNo));

        // 자식 넣기
        for (CategoryEntity categoryEntity : categories) {
            if (categoryEntity.getParentEntity() != null) {
                CategoryDto parent = map.get(categoryEntity.getParentEntity().getNo());
                if (parent != null) {
                    parent.getChildren().add(categoryMapper.toDto(categoryEntity));
                }
            }
        }
        // 자식 정렬
        for (CategoryDto categoryDto : categoryDtoList) {
            categoryDto.getChildren().sort(Comparator.comparingInt(CategoryDto::getOrderNo));
        }
        return categoryDtoList;
    }

    /**
     * 카테고리를 실제로 디비에 저장한다.
     */
    @Transactional
    public void updateCategories(List<CategoryDto> categories) {
        List<CategoryEntity> toSave = new ArrayList<>();
        List<CategoryEntity> toDelete = new ArrayList<>();

        for (CategoryDto parentDto : categories) {
            CategoryEntity parentEntity = categoryMapper.toEntity(parentDto);

            switch (parentDto.getState()) {
                case ADD, UPDATE -> {
                    toSave.add(parentEntity);
                    collectChildEntities(parentDto, parentEntity, toSave, toDelete);
                }
                // 삭제의 경우 자식을 먼저넣고 후에 부모를 삭제한다.
                case DELETE -> {
                    collectChildEntities(parentDto, parentEntity, toSave, toDelete);
                    toDelete.add(parentEntity);
                }
                case DEFAULT -> {
                    collectChildEntities(parentDto, parentEntity, toSave, toDelete);
                }
            }
        }
        // 모아서 처리하는게 훨씬 효율적이다.
        if (!toSave.isEmpty()) categoryRepository.saveAll(toSave);
        if (!toDelete.isEmpty()) categoryRepository.deleteAll(toDelete);
    }

    private void collectChildEntities(CategoryDto parentDto,
                                      CategoryEntity parentEntity,
                                      List<CategoryEntity> toSave,
                                      List<CategoryEntity> toDelete) {
        for (CategoryDto childDto : parentDto.getChildren()) {
            CategoryEntity childEntity = categoryMapper.toEntity(childDto);
            childEntity.setParentEntity(parentEntity);

            switch (childDto.getState()) {
                case ADD, UPDATE -> toSave.add(childEntity);
                case DELETE -> toDelete.add(childEntity);
            }
        }
    }
}
