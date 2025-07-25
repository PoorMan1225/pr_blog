package com.office.my_little_blog.admin;

import com.office.my_little_blog.category.CategoryDto;
import com.office.my_little_blog.category.CategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;


@Slf4j
@Controller
@RequiredArgsConstructor
@RequestMapping("/admin")
public class AdminController {

    private final CategoryService categoryService;

    @GetMapping("")
    public String adminPage() {
        log.info("adminPage()");
        return "/pages/admin";
    }

    @GetMapping("/category")
    public String sectionCategory() {
        log.info("sectionCategory()");
        return "layout/admin/section_category :: category";
    }

    @GetMapping("/board")
    public String sectionBoard() {
        log.info("sectionBoard()");
        return "layout/admin/section_board :: board";
    }
}
