package com.office.my_little_blog.global.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;

import java.io.IOException;

/**
 * Spring security 에서 AccessDeniedHandler 인터페이스를 구현한 클래스는
 * 접근 거부 (Access Denied) 시 실행 되는 핸들러 기능을 가지게 된다.
 * 즉 인가(Authority) 실패 시 동작하게 된다.
 */
@Slf4j
public class AdminAccessDeniedHandler implements AccessDeniedHandler {
    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException accessDeniedException) throws IOException, ServletException {
        log.info("AdminAccessDeniedHandler : handle()");
        response.sendRedirect("/admin/login");
    }
}
