package com.testing.springpractice.authapp.DTO;

import com.testing.springpractice.authapp.models.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfileResponse {
    private String Id;
    private String Name;
    private String username;
    private Role role;
    private String password;
    private boolean Isverified;
}
