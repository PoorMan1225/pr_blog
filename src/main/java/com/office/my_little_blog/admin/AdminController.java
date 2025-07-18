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
