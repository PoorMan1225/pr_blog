package com.office.my_little_blog.admin;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;


@Slf4j
@Controller
@RequestMapping("/admin")
public class AdminController {

    @GetMapping("")
    public String adminPage() {
        return "/pages/admin";
    }

    @GetMapping("/category")
    public String sectionCategory() {
        return "layout/admin/section_category :: category";
    }

    @GetMapping("/board")
    public String sectionBoard() {
        return "layout/admin/section_board :: board";
    }
}
