package com.office.my_little_blog.global.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/**
 * 로그인 실패시 발생하는 핸들러 커스텀
 */
@Slf4j
public class CustomAuthenticationFailureHandler implements AuthenticationFailureHandler {
    @Override
    public void onAuthenticationFailure(HttpServletRequest request,
                                        HttpServletResponse response,
                                        AuthenticationException exception) throws IOException, ServletException {
        log.info("onAuthenticationFailure()");
        String errorMessage = "아이디 또는 비밀번호가 올바르지 않습니다.";
        if(exception instanceof BadCredentialsException || exception instanceof InternalAuthenticationServiceException) {
            errorMessage = "아이디 또는 비밀번호가 올바르지 않습니다.";
        }
        // 에러메시지를 담아서 리다이렉트
        response.sendRedirect("/admin/login?error=true&message=" + URLEncoder.encode(errorMessage, StandardCharsets.UTF_8));
    }
}
