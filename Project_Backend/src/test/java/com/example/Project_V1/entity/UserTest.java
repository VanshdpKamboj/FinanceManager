package com.example.Project_V1.entity;

import com.example.Project_V1.enums.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.ArrayList;

import static org.junit.jupiter.api.Assertions.*;

class UserTest {

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
    }

    @Test
    void testUserSettersAndGetters() {
        user.setId(1L);
        user.setUsername("testuser");
        user.setEmail("test@example.com");
        user.setPassword("password123");
        user.setRole(UserRole.NORMAL_USER);
        user.setCreatedAt(LocalDateTime.now());

        assertEquals(1L, user.getId());
        assertEquals("testuser", user.getUsername());
        assertEquals("test@example.com", user.getEmail());
        assertEquals("password123", user.getPassword());
        assertEquals(UserRole.NORMAL_USER, user.getRole());
        assertNotNull(user.getCreatedAt());
    }

    @Test
    void testUserAllArgsConstructor() {
        LocalDateTime now = LocalDateTime.now();
        User testUser = new User(
                1L,
                "testuser",
                "test@example.com",
                "password123",
                UserRole.MAKER,
                now,
                new ArrayList<>()
        );

        assertEquals(1L, testUser.getId());
        assertEquals("testuser", testUser.getUsername());
        assertEquals("test@example.com", testUser.getEmail());
        assertEquals("password123", testUser.getPassword());
        assertEquals(UserRole.MAKER, testUser.getRole());
        assertEquals(now, testUser.getCreatedAt());
        assertNotNull(testUser.getTransactions());
    }

    @Test
    void testUserNoArgsConstructor() {
        User newUser = new User();
        assertNotNull(newUser);
    }

    @Test
    void testPrePersist() {
        user.setUsername("testuser");
        user.setEmail("test@example.com");
        user.setPassword("password123");
        user.setRole(UserRole.NORMAL_USER);
        
        // Manually call prePersist since we're not using real JPA here
        user.onCreate();
        
        assertNotNull(user.getCreatedAt());
    }

    @Test
    void testTransactionsRelationship() {
        user.setTransactions(new ArrayList<>());
        assertNotNull(user.getTransactions());
        assertTrue(user.getTransactions().isEmpty());

        Transaction transaction = new Transaction();
        transaction.setId(1L);
        user.getTransactions().add(transaction);
        
        assertEquals(1, user.getTransactions().size());
    }

    @Test
    void testDifferentRoles() {
        user.setRole(UserRole.NORMAL_USER);
        assertEquals(UserRole.NORMAL_USER, user.getRole());

        user.setRole(UserRole.MAKER);
        assertEquals(UserRole.MAKER, user.getRole());

        user.setRole(UserRole.CHECKER);
        assertEquals(UserRole.CHECKER, user.getRole());
    }
}
