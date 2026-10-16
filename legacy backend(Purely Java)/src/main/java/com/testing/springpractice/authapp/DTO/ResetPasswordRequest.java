package com.testing.springpractice.authapp.DTO;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResetPasswordRequest {
    private String newpassword;
    private String OTP;
    private String username;

}
