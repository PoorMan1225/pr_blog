package com.office.my_little_blog.category;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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

    @JsonProperty("isChanged")
    private boolean isChanged;  // 이런 네이밍이면 isIsChanged 로 나오기 때문에 getter 규칙이 그래서 @JsonProperty로 만들어 줘야한다.

    public boolean hasParent() {
        return !Objects.isNull(parentId);
    }

    public boolean hasServerId() {
        return !Objects.isNull(serverId);
    }
}
