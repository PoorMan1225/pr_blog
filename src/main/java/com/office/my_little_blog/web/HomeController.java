package com.office.my_little_blog.web;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Slf4j
@Controller
public class HomeController {

    @GetMapping({"", "/"})
    public String home() {
        log.info("home()");
        return "pages/home";
    }
}
