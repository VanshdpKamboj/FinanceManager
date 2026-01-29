package com.example.Project_V1.enums;

public enum UserRole {
    NORMAL_USER,
    CHECKER,
    MAKER;

    public static UserRole fromString(String value) {
        if (value == null) return null;
        return switch (value.trim().toLowerCase()) {
            case "normal_user" -> NORMAL_USER;
            case "checker" -> CHECKER;
            case "maker" -> MAKER;
            default -> null;
        };
    }

    public String toDisplayValue() {
        return switch (this) {
            case NORMAL_USER -> "Normal_user";
            case CHECKER -> "checker";
            case MAKER -> "maker";
        };
    }
}
