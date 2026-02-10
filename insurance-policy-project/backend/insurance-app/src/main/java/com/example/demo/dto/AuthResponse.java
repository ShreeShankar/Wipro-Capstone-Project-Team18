package com.example.demo.dto;

public class AuthResponse {

    private String token;
    private String email;
    private String role;
    private String name;

    public AuthResponse(String token, String email, String role, String name) {
        this.token = token;
        this.email = email;
        this.role = role;
        this.name = name;
    }

    public String getToken() { return token; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
    public String getName() { return name; }
}
