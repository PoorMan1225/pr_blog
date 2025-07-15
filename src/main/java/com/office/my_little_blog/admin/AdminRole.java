package com.office.my_little_blog.admin;

import lombok.Getter;

/**
 * 관리자 권한 정보 클래스
 */
@Getter
public enum AdminRole {

    SUPER_ADMIN(1, "최고 관리자"),
    ADMIN(2, "일반 관리자");

    private final String description;
    private final int adminNo;

    AdminRole(int adminNo, String description) {
        this.adminNo = adminNo;
        this.description = description;
    }
}
