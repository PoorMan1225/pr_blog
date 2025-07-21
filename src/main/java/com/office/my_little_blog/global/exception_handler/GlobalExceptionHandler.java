package com.office.my_little_blog.global.exception_handler;

import com.office.my_little_blog.global.error.ErrorCode;
import com.office.my_little_blog.global.exception.CategoryMappingException;
import com.office.my_little_blog.global.response.ApiResponse;
import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;


@RestControllerAdvice
public class GlobalExceptionHandler {
    // DTO 검증 실패
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<?>> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(DefaultMessageSourceResolvable::getDefaultMessage)
                .findFirst()
                .orElse("입력값이 올바르지 않습니다.");
        ApiResponse<?> apiResponse = ApiResponse.error(ErrorCode.INVALID_PARMS.name(), message);
        return ResponseEntity.badRequest().body(apiResponse);
    }

    @ExceptionHandler(CategoryMappingException.class)
    public ResponseEntity<ApiResponse<?>> categoryMappingError(CategoryMappingException ex) {
        ApiResponse<?> apiResponse = ApiResponse.error(ErrorCode.INVALID_CATEGORY_MAPPING.name(), ex.getMessage());
        return ResponseEntity.badRequest().body(apiResponse);
    }
}
