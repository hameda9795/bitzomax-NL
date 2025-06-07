package com.bitzomax.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class SignupRequest {
    @NotBlank(message = "Gebruikersnaam is verplicht")
    @Size(min = 3, max = 20, message = "Gebruikersnaam moet tussen 3 en 20 tekens zijn")
    private String username;

    @NotBlank(message = "E-mail is verplicht")
    @Size(max = 50)
    @Email(message = "Voer een geldig e-mailadres in")
    private String email;

    @NotBlank(message = "Wachtwoord is verplicht")
    @Size(min = 6, max = 40, message = "Wachtwoord moet tussen 6 en 40 tekens zijn")
    private String password;

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
