package com.example.Project_V1.enums;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class RegexPatternStatusTest {

    @Test
    void testAllEnumValues() {
        RegexPatternStatus[] statuses = RegexPatternStatus.values();
        assertEquals(4, statuses.length);
        assertTrue(containsStatus(statuses, RegexPatternStatus.DRAFT));
        assertTrue(containsStatus(statuses, RegexPatternStatus.PENDING));
        assertTrue(containsStatus(statuses, RegexPatternStatus.APPROVED));
        assertTrue(containsStatus(statuses, RegexPatternStatus.REJECTED));
    }

    @Test
    void testValueOf() {
        assertEquals(RegexPatternStatus.DRAFT, RegexPatternStatus.valueOf("DRAFT"));
        assertEquals(RegexPatternStatus.PENDING, RegexPatternStatus.valueOf("PENDING"));
        assertEquals(RegexPatternStatus.APPROVED, RegexPatternStatus.valueOf("APPROVED"));
        assertEquals(RegexPatternStatus.REJECTED, RegexPatternStatus.valueOf("REJECTED"));
    }

    @Test
    void testValueOf_InvalidValue_ThrowsException() {
        assertThrows(IllegalArgumentException.class, () -> {
            RegexPatternStatus.valueOf("INVALID");
        });
    }

    @Test
    void testEnumEquality() {
        RegexPatternStatus draft1 = RegexPatternStatus.DRAFT;
        RegexPatternStatus draft2 = RegexPatternStatus.valueOf("DRAFT");
        
        assertEquals(draft1, draft2);
        assertSame(draft1, draft2);
    }

    @Test
    void testEnumInequality() {
        assertNotEquals(RegexPatternStatus.DRAFT, RegexPatternStatus.PENDING);
        assertNotEquals(RegexPatternStatus.APPROVED, RegexPatternStatus.REJECTED);
    }

    @Test
    void testEnumToString() {
        assertEquals("DRAFT", RegexPatternStatus.DRAFT.toString());
        assertEquals("PENDING", RegexPatternStatus.PENDING.toString());
        assertEquals("APPROVED", RegexPatternStatus.APPROVED.toString());
        assertEquals("REJECTED", RegexPatternStatus.REJECTED.toString());
    }

    @Test
    void testEnumName() {
        assertEquals("DRAFT", RegexPatternStatus.DRAFT.name());
        assertEquals("PENDING", RegexPatternStatus.PENDING.name());
        assertEquals("APPROVED", RegexPatternStatus.APPROVED.name());
        assertEquals("REJECTED", RegexPatternStatus.REJECTED.name());
    }

    @Test
    void testEnumOrdinal() {
        assertEquals(0, RegexPatternStatus.DRAFT.ordinal());
        assertEquals(1, RegexPatternStatus.PENDING.ordinal());
        assertEquals(2, RegexPatternStatus.APPROVED.ordinal());
        assertEquals(3, RegexPatternStatus.REJECTED.ordinal());
    }

    @Test
    void testEnumSwitchStatement() {
        String result = switch (RegexPatternStatus.APPROVED) {
            case DRAFT -> "draft";
            case PENDING -> "pending";
            case APPROVED -> "approved";
            case REJECTED -> "rejected";
        };
        
        assertEquals("approved", result);
    }

    private boolean containsStatus(RegexPatternStatus[] statuses, RegexPatternStatus status) {
        for (RegexPatternStatus s : statuses) {
            if (s == status) {
                return true;
            }
        }
        return false;
    }
}
