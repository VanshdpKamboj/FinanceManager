package com.example.Project_V1.util;

import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private JwtUtil jwtUtil;
    private final String testSecret = "thisIsAVeryLongSecretKeyForTestingPurposesAndItNeedsToBeAtLeast256BitsLong";
    private final Long testExpiration = 86400000L; // 24 hours

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret", testSecret);
        ReflectionTestUtils.setField(jwtUtil, "expiration", testExpiration);
    }

    @Test
    void generateToken_Success() {
        String username = "testuser";
        String token = jwtUtil.generateToken(username);

        assertNotNull(token);
        assertFalse(token.isEmpty());
    }

    @Test
    void getUsernameFromToken_Success() {
        String username = "testuser";
        String token = jwtUtil.generateToken(username);

        String extractedUsername = jwtUtil.getUsernameFromToken(token);

        assertEquals(username, extractedUsername);
    }

    @Test
    void getExpirationDateFromToken_Success() {
        String username = "testuser";
        String token = jwtUtil.generateToken(username);

        Date expirationDate = jwtUtil.getExpirationDateFromToken(token);

        assertNotNull(expirationDate);
        assertTrue(expirationDate.after(new Date()));
    }

    @Test
    void isTokenExpired_NotExpired() {
        String username = "testuser";
        String token = jwtUtil.generateToken(username);

        Boolean isExpired = jwtUtil.isTokenExpired(token);

        assertFalse(isExpired);
    }

    @Test
    void validateToken_Valid() {
        String username = "testuser";
        String token = jwtUtil.generateToken(username);

        Boolean isValid = jwtUtil.validateToken(token, username);

        assertTrue(isValid);
    }

    @Test
    void validateToken_InvalidUsername() {
        String username = "testuser";
        String token = jwtUtil.generateToken(username);

        Boolean isValid = jwtUtil.validateToken(token, "differentuser");

        assertFalse(isValid);
    }

    @Test
    void getClaimFromToken_Success() {
        String username = "testuser";
        String token = jwtUtil.generateToken(username);

        String subject = jwtUtil.getClaimFromToken(token, Claims::getSubject);

        assertEquals(username, subject);
    }

    @Test
    void generateToken_DifferentUsernamesGenerateDifferentTokens() {
        String token1 = jwtUtil.generateToken("user1");
        String token2 = jwtUtil.generateToken("user2");

        assertNotEquals(token1, token2);
    }
}
