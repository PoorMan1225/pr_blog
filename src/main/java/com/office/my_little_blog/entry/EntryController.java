package com.office.my_little_blog.entry;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Slf4j
@Controller
@RequiredArgsConstructor
public class EntryController {

    @GetMapping("/entries")
    public String entries() {
        return "pages/entries";
    }
}
