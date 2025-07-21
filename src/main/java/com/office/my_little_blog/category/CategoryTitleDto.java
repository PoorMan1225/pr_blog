package com.office.my_little_blog.category;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CategoryTitleDto {
    @JsonProperty("no")
    private int no;

    @JsonProperty("title")
    private String title;

    public CategoryTitleEntity toEntity() {
        return CategoryTitleEntity.builder()
                .no(this.no)
                .title(this.title)
                .build();
    }
}
