package com.office.my_little_blog.category;

import com.office.my_little_blog.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@Slf4j
@Controller
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping("/category-titles")
    ApiResponse<List<CategoryTitleDto>> getAllCategoryTitles() {
        log.info("getAllCategoryTitles()");
        List<CategoryTitleDto> getAllCategoryTitles = categoryService.getAllCategoryTitles();
        return ApiResponse.ok(getAllCategoryTitles);
    }


}
