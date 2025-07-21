package com.office.my_little_blog.category;

/**
 * 카테고리 타이틀의 정보 초기 데이터베이스에 저장용
 */
public enum CategoryTitle {
    EMPTY(1, "Empty"),
    CSS(2, "CSS"),
    JAVA_SCRIPT(3, "JavaScript"),
    UNITY(4, "Unity"),
    HTML(5, "HTML"),
    JAVA(6, "Java"),
    SPRING(7, "Spring");

    private final int id;
    private final String displayName;

    CategoryTitle(int id, String displayName) {
        this.id = id;
        this.displayName = displayName;
    }

    public int getId() {
        return id;
    }

    public String getDisplayName() {
        return displayName;
    }
}