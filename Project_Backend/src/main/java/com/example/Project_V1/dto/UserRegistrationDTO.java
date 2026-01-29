package com.example.Project_V1.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserRegistrationDTO {
    @NotBlank(message = "Username is required")
    @Size(message = "Username must be between 3 and 50 characters")
    private String username;

    @NotBlank(message= "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "Role is required")
    @jakarta.validation.constraints.Pattern(
            regexp = "(?i)^(Normal_user|checker|maker)$",
            message = "Role must be one of: Normal_user, checker, maker"
    )
    private String role;
}