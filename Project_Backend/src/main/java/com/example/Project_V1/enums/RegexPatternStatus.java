package com.example.Project_V1.enums;

public enum RegexPatternStatus {
    DRAFT,
    PENDING,
    APPROVED,
    REJECTED;

    public static RegexPatternStatus fromString(String value) {
        if (value == null) return null;
        return switch (value.trim().toUpperCase()) {
            case "DRAFT" -> DRAFT;
            case "PENDING" -> PENDING;
            case "APPROVED" -> APPROVED;
            case "REJECTED" -> REJECTED;
            default -> null;
        };
    }

    public String toDisplayValue() {
        return switch (this) {
            case DRAFT -> "Draft";
            case PENDING -> "Pending";
            case APPROVED -> "Approved";
            case REJECTED -> "Rejected";
        };
    }
}
