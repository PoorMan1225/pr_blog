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
     * @return
     */
    public List<CategoryDto> getAllCategories() {
        List<CategoryEntity> categories = categoryRepository.findAll();
        List<CategoryDto> categoryDtoList = new ArrayList<>();
        Map<Integer, CategoryDto> map = new HashMap<>();

        for (CategoryEntity categoryEntity : categories) {
            if (categoryEntity.getParent() == null) {
                CategoryDto dto = categoryMapper.toDto(categoryEntity);
                map.put(categoryEntity.getNo(), dto);
                categoryDtoList.add(dto);
            }
        }

        for (CategoryEntity categoryEntity : categories) {
            if (categoryEntity.getParent() != null) {
                CategoryDto parentDto = map.get(categoryEntity.getParent().getNo());
                if (parentDto != null) {
                    parentDto.getChildren().add(categoryMapper.toDto(categoryEntity));
                } else {
                    throw new CategoryMappingException("부모 없는 카테고리가 존재합니다.");
                }
            }
        }
        return categoryDtoList;
    }

    /**
     * 카테고리를 실제로 디비에 저장한다.
     */
    @Transactional
    public void updateCategories(List<CategoryDto> categories) {
        for (CategoryDto parent : categories) {
            CategoryEntity parentEntity = categoryRepository.save(categoryMapper.toEntity(parent));

            for (CategoryDto child : parent.getChildren()) {
                CategoryEntity childEntity = categoryMapper.toEntity(child);
                childEntity.setParent(parentEntity);
                categoryRepository.save(childEntity);
            }
        }
    }
}
