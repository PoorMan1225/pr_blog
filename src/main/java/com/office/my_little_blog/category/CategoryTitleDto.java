package com.office.my_little_blog.category;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CategoryTitleDto {
    private int no;
    private String title;

    public CategoryTitleEntity toEntity() {
        return CategoryTitleEntity.builder()
                .no(this.no)
                .title(this.title)
                .build();
    }
}
