package com.office.my_little_blog.global.exception;

/**
 * 카테고리 매핑 실패시 발생 예외
 */
public class CategoryMappingException extends RuntimeException {
    public CategoryMappingException(String message) {
        super(message);
    }
}
