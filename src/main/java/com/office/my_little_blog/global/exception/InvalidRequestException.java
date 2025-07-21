package com.office.my_little_blog.global.exception;

import lombok.Getter;
import org.springframework.validation.BindingResult;

/**
 * 파라미터 값 잘못들어오면 예외 발생
 */
@Getter
public class InvalidRequestException extends RuntimeException {
    private BindingResult bindingResult;

    public InvalidRequestException(String message) {
        super(message);
    }

    public InvalidRequestException(BindingResult bindingResult) {
         this.bindingResult = bindingResult;
    }
}
