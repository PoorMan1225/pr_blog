package com.office.my_little_blog.web.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Slf4j
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.disable())
                .csrf(csrf -> csrf.disable());

        http
                .authorizeHttpRequests(auth -> auth
                                .requestMatchers(
                                        "/",
                                        "/css/**",
                                        "/img/**",
                                        "/js/**")
                                .permitAll()
//                        .requestMatchers("/planner/**").hasAnyRole("USER")
                                .anyRequest()
                                .authenticated()
                );

        http
                // 스프링 시큐리티가 제공해주는 기본 폼
                .formLogin(login -> login
//                                .loginPage("/admin/login")                      // 스프링 시큐리티가 제공해주는 기본 로그인 폼 대신에 우리가 지정한 로그인 폼 지정
                                .loginProcessingUrl("/admin/login")               // 로그인 프로세스 를 진행할 url 설정
                                .usernameParameter("username")                    // 폼에서 전달할 매핑 아이디 이름
                                .passwordParameter("password")                    // 폼에서 전달할 매핑 pw 이름
                                .successHandler((request, response, authentication) -> { // request, response, 인증객체 (id, pw 포함)
                                    log.info("signin successHandler()");
//                            User user = (User) authentication.getPrincipal();
//                            String targetURI = "/member/signin_result?loginedID=" + user.getUsername();
                                    String targetURI = "/";
                                    response.sendRedirect(targetURI);
                                })
                                .failureHandler((request, response, exception) -> {
                                    log.info("signin failureHandler()");
                                })
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
