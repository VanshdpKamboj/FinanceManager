package com.example.Project_V1.service;

import com.example.Project_V1.dto.AuthResponseDTO;
import com.example.Project_V1.dto.UserLoginDTO;
import com.example.Project_V1.dto.UserRegistrationDTO;
import com.example.Project_V1.entity.User;
import com.example.Project_V1.enums.UserRole;
import com.example.Project_V1.repository.UserRepository;
import com.example.Project_V1.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthenticationManager authenticationManager;

    public AuthResponseDTO register(UserRegistrationDTO registrationDTO) {
        if (userRepository.existsByUsername(registrationDTO.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        if (userRepository.existsByEmail(registrationDTO.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        UserRole role = UserRole.fromString(registrationDTO.getRole());
        if (role == null) {
            throw new RuntimeException("Role must be one of: Normal_user, checker, maker");
        }

        User user = new User();
        user.setUsername(registrationDTO.getUsername());
        user.setEmail(registrationDTO.getEmail());
        user.setPassword(passwordEncoder.encode(registrationDTO.getPassword()));
        user.setRole(role);

        user = userRepository.save(user);

        String token = jwtUtil.generateToken(user.getUsername());

        return new AuthResponseDTO(token, "Bearer", user.getId(), user.getUsername(), user.getEmail(), user.getRole().toDisplayValue());
    }

    public AuthResponseDTO login(UserLoginDTO loginDTO) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginDTO.getUsernameOrEmail(),
                        loginDTO.getPassword()
                )
        );

        User user = userRepository.findByUsernameOrEmail(
                loginDTO.getUsernameOrEmail(),
                loginDTO.getUsernameOrEmail()
        ).orElseThrow(() -> new UsernameNotFoundException("User not found"));

        String token = jwtUtil.generateToken(user.getUsername());

        return new AuthResponseDTO(token, "Bearer", user.getId(), user.getUsername(), user.getEmail(), user.getRole().toDisplayValue());
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }
}
