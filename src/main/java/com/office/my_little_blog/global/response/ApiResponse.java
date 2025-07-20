package com.office.my_little_blog.global.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 공통 api response 클래스
 */
@Getter
@AllArgsConstructor
public class ApiResponse<T> {
    private boolean success;
    private String code;
    private String message;
    private T data;

    // T 타입 매개변수 받아서 T 리턴
    public static <T> ApiResponse<T> create(boolean success, String code, String message, T data) {
        return new ApiResponse<>(success, code, message, data);
    }

    public static <T> ApiResponse<T> ok(T data) {
        return create(true, "OK", null, data);
    }

    public static ApiResponse<?> error(String code, String message) {
        return create(false, code, message, null);
    }
}
