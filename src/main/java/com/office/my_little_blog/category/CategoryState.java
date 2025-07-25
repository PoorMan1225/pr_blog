package com.office.my_little_blog.category;

/**
 * 카테고리 변경시 상태 관리
 * 해당 상태를 통해서 삭제 할지 추가할지 변경할지 정함
 */
public enum CategoryState {
    UPDATE,
    ADD,
    DELETE,
    DEFAULT
}
