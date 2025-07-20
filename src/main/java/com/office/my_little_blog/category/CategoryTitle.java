package com.office.my_little_blog.category;

/**
 * 카테고리 타이틀의 정보 초기 데이터베이스에 저장용
 */
public enum CategoryTitle {
    CSS(1, "CSS"),
    JAVA_SCRIPT(2, "JavaScript"),
    UNITY(3, "Unity"),
    HTML(4, "HTML"),
    JAVA(5, "Java"),
    SPRING(6, "Spring");

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