package com.office.my_little_blog.category;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Objects;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CategoryDto {
    @NotNull(message = "id는 필수입니다.")
    @JsonProperty("id")
    private String id;

    @JsonProperty("serverId")
    private Integer serverId;

    @JsonProperty("parentId")
    private String parentId;

    @NotBlank(message = "타이틀은 필수입니다.")
    @Size(max = 100, message = "타이틀은 최대 100자까지 가능합니다.")
    @JsonProperty("categoryTitle")
    private String categoryTitle;

    @JsonProperty("categoryTag")
    private Integer categoryTag;

    @JsonProperty("state")
    private CategoryState state;

    @JsonProperty("orderNo")
    private int orderNo;

    @JsonProperty("children")
    private List<CategoryDto> children;

    public boolean hasParent() {
        return !Objects.isNull(parentId);
    }

    public boolean hasServerId() {
        return !Objects.isNull(serverId);
    }
}
