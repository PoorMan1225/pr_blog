package com.office.my_little_blog.category;

import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.Arrays;
import java.util.Comparator;
import java.util.List;


@ActiveProfiles("test")
@SpringBootTest
class CategoryTitleRepositoryTest {

    @Autowired
    CategoryTitleRepository repository;

    @Test
    @DisplayName("카테고리 최초 데이터 잘 넣었는지 확인해봄")
    void categoryTitleInitTest() {
        // given

        // when
        List<CategoryTitle> expected = Arrays.stream(CategoryTitle.values())
                .sorted(Comparator.comparingInt(CategoryTitle::getId))
                .toList();

        List<CategoryTitleEntity> actual = repository.findAllByOrderByNoAsc();

        // then
        for (int i = 0; i < expected.size(); i++) {
            CategoryTitleEntity entity = actual.get(i);
            CategoryTitle enumValue = expected.get(i);

            Assertions.assertThat(entity.getNo()).isEqualTo(enumValue.getId());
            Assertions.assertThat(entity.getTitle()).isEqualTo(enumValue.getDisplayName());
        }
    }
}