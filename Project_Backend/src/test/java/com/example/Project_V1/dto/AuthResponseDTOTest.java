package com.example.Project_V1.dto;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class AuthResponseDTOTest {

    @Test
    void testAllArgsConstructor() {
        AuthResponseDTO dto = new AuthResponseDTO(
                "jwt-token",
                "Bearer",
                1L,
                "testuser",
                "test@example.com",
                "Normal_user"
        );

        assertEquals("jwt-token", dto.getToken());
        assertEquals("Bearer", dto.getType());
        assertEquals(1L, dto.getUserId());
        assertEquals("testuser", dto.getUsername());
        assertEquals("test@example.com", dto.getEmail());
        assertEquals("Normal_user", dto.getRole());
    }

    @Test
    void testSettersAndGetters() {
        AuthResponseDTO dto = new AuthResponseDTO();
        
        dto.setToken("test-token");
        dto.setType("Bearer");
        dto.setUserId(1L);
        dto.setUsername("user");
        dto.setEmail("user@test.com");
        dto.setRole("checker");

        assertEquals("test-token", dto.getToken());
        assertEquals("Bearer", dto.getType());
        assertEquals(1L, dto.getUserId());
        assertEquals("user", dto.getUsername());
        assertEquals("user@test.com", dto.getEmail());
        assertEquals("checker", dto.getRole());
    }

    @Test
    void testNoArgsConstructor() {
        AuthResponseDTO dto = new AuthResponseDTO();
        assertNotNull(dto);
    }
}
