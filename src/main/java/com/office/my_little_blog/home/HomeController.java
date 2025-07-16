package com.office.my_little_blog.home;

import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.security.core.userdetails.User;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Slf4j
@Controller
public class HomeController {

    @GetMapping({"", "/"})
    public String home(@AuthenticationPrincipal User user, Model model) {
        log.info("home()");
        boolean isAdmin = user != null;
        model.addAttribute("isAdmin", isAdmin);
        return "pages/home";
    }
}
