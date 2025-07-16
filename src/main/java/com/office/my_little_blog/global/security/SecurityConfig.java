package com.office.my_little_blog.global.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;

@Slf4j
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationFailureHandler customFailerHandler() {
        return new CustomAuthenticationFailureHandler();
    }

    @Bean
    public AuthenticationSuccessHandler customSuccessHandler() {
        return new CustomAuthenticationSuccessHandler();
    }

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.disable());
        http
                .authorizeHttpRequests(auth -> auth
                                .requestMatchers(
                                        "/",
                                        "/css/**",
                                        "/icon/**",
                                        "/img/**",
                                        "/js/**",
                                        "/admin/login"
                                )
                                .permitAll()
//                        .requestMatchers("/planner/**").hasAnyRole("USER")
                                .anyRequest()
                                .authenticated()
                );

        http
                // 스프링 시큐리티가 제공해주는 기본 폼
                .formLogin(login -> login
                                .loginPage("/admin/login")                        // 스프링 시큐리티가 제공해주는 기본 로그인 폼 대신에 우리가 지정한 로그인 폼 지정
                                .loginProcessingUrl("/admin/login")               // 로그인 프로세스 를 진행할 url 설정
                                .usernameParameter("login_id")                    // 폼에서 전달할 매핑 아이디 이름
                                .passwordParameter("login_pwd")                   // 폼에서 전달할 매핑 pw 이름
                                .successHandler(customSuccessHandler())
                                .failureHandler(customFailerHandler())
                );

        http
                .sessionManagement(session -> session
                        .maximumSessions(1)                                     // 한 클라이언트만 허용
                        .maxSessionsPreventsLogin(false)                        // 새 로그인 허용, 기존 세션 만료
                        .expiredUrl("/admin/login?expire=true")                 // 만료 시 이동 url
                );

//        http
//                .logout(logout -> logout.logoutUrl("/member/signout_confirm")
//                        .logoutSuccessHandler((request, response, authentication) -> {
//                            log.info("signout logoutSuccessHandler()");
//
//                            String targetURI = "/";
//                            response.sendRedirect(targetURI);
//                        }));
        return http.build();
    }
}
