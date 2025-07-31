package com.office.my_little_blog.category;

import com.office.my_little_blog.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;

@Slf4j
@Controller
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @ResponseBody
    @GetMapping("/category-titles")
    public ResponseEntity<ApiResponse<List<CategoryTitleDto>>> getAllCategoryTitles() {
        log.info("getAllCategoryTitles()");
        List<CategoryTitleDto> getAllCategoryTitles = categoryService.getAllCategoryTitles();
        return new ResponseEntity<>(ApiResponse.ok(getAllCategoryTitles), HttpStatus.OK);
    }

    @ResponseBody
    @PatchMapping("/categories")
    public ResponseEntity<ApiResponse<?>> updateCategories(@RequestBody List<CategoryDto> categories) {
        log.info("patch updateCategories()");
        categoryService.updateCategories(categories);
        return new ResponseEntity<>(ApiResponse.ok("SAVE SUCCESS"), HttpStatus.OK);
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getAllCategories() {
        log.info("getAllCategories()");
        List<CategoryDto> list = categoryService.getAllCategories();
        return new ResponseEntity<>(ApiResponse.ok(list), HttpStatus.OK);
    }
}
