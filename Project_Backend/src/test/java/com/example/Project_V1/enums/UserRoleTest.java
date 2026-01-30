package com.example.Project_V1.enums;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class UserRoleTest {

    @Test
    void testFromString_NormalUser() {
        UserRole role = UserRole.fromString("Normal_user");
        assertEquals(UserRole.NORMAL_USER, role);
    }

    @Test
    void testFromString_NormalUserLowerCase() {
        UserRole role = UserRole.fromString("normal_user");
        assertEquals(UserRole.NORMAL_USER, role);
    }

    @Test
    void testFromString_Checker() {
        UserRole role = UserRole.fromString("checker");
        assertEquals(UserRole.CHECKER, role);
    }

    @Test
    void testFromString_CheckerUpperCase() {
        UserRole role = UserRole.fromString("CHECKER");
        assertEquals(UserRole.CHECKER, role);
    }

    @Test
    void testFromString_Maker() {
        UserRole role = UserRole.fromString("maker");
        assertEquals(UserRole.MAKER, role);
    }

    @Test
    void testFromString_MakerMixedCase() {
        UserRole role = UserRole.fromString("MaKeR");
        assertEquals(UserRole.MAKER, role);
    }

    @Test
    void testFromString_InvalidRole() {
        UserRole role = UserRole.fromString("invalid");
        assertNull(role);
    }

    @Test
    void testFromString_NullInput() {
        UserRole role = UserRole.fromString(null);
        assertNull(role);
    }

    @Test
    void testFromString_EmptyString() {
        UserRole role = UserRole.fromString("");
        assertNull(role);
    }

    @Test
    void testToDisplayValue_NormalUser() {
        String displayValue = UserRole.NORMAL_USER.toDisplayValue();
        assertEquals("Normal_user", displayValue);
    }

    @Test
    void testToDisplayValue_Checker() {
        String displayValue = UserRole.CHECKER.toDisplayValue();
        assertEquals("checker", displayValue);
    }

    @Test
    void testToDisplayValue_Maker() {
        String displayValue = UserRole.MAKER.toDisplayValue();
        assertEquals("maker", displayValue);
    }

    @Test
    void testAllEnumValues() {
        UserRole[] roles = UserRole.values();
        assertEquals(3, roles.length);
        assertTrue(containsRole(roles, UserRole.NORMAL_USER));
        assertTrue(containsRole(roles, UserRole.CHECKER));
        assertTrue(containsRole(roles, UserRole.MAKER));
    }

    @Test
    void testValueOf() {
        assertEquals(UserRole.NORMAL_USER, UserRole.valueOf("NORMAL_USER"));
        assertEquals(UserRole.CHECKER, UserRole.valueOf("CHECKER"));
        assertEquals(UserRole.MAKER, UserRole.valueOf("MAKER"));
    }

    @Test
    void testFromStringToDisplayValueRoundTrip() {
        UserRole normalUser = UserRole.fromString("Normal_user");
        assertEquals("Normal_user", normalUser.toDisplayValue());

        UserRole checker = UserRole.fromString("checker");
        assertEquals("checker", checker.toDisplayValue());

        UserRole maker = UserRole.fromString("maker");
        assertEquals("maker", maker.toDisplayValue());
    }

    private boolean containsRole(UserRole[] roles, UserRole role) {
        for (UserRole r : roles) {
            if (r == role) {
                return true;
            }
        }
        return false;
    }
}
