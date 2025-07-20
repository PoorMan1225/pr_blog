package com.office.my_little_blog.category;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Entity
@Table(name = "category_title")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryTitleEntity {
    @Id
    @Column(name = "no", nullable = false)     // 카테고리 타이틀 번호
    private int no;

    @Column(name = "title")                   // 카테고리 타이틀 제목
    private String title;

    public CategoryTitleDto toDto() {
        return CategoryTitleDto.builder()
                .no(this.no)
                .title(this.title)
                .build();
    }
}
