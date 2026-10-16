package com.testing.springpractice.authapp.Controller;

import com.testing.springpractice.authapp.DTO.*;
import com.testing.springpractice.authapp.Service.EmailService;
import com.testing.springpractice.authapp.Service.ProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    ProfileService service;

    @Autowired
    EmailService emailService;
    @PostMapping("/register")
    public ProfileResponse register(@RequestBody ProfileRequest request){
        ProfileResponse register = service.register(request);
        emailService.sendWelcome(request.getUsername(), request.getName());
        return register;


    }

    @PostMapping("/login")
    public String login(@RequestBody LoginRequest request){
        return service.login(request);

    }

    @PostMapping("/send-reset-otp")
    public void sendResetotp(@RequestParam String username){
        try {
            service.sendresetOtp(username);
        }
        catch (Exception e){
            e.printStackTrace();
        }

    }

    @PostMapping("/reset-password")
    public void resetpassword(@RequestBody ResetPasswordRequest resetPasswordRequest){
        service.resetPassword(resetPasswordRequest.getUsername(), resetPasswordRequest.getOTP(), resetPasswordRequest.getNewpassword());
    }

    @PostMapping("/send-otp")
    public void sendotp(@RequestParam String username){
        service.sendOTP(username);
    }

    @GetMapping("/get")
    void get(){
        System.out.println("helloji");
    }


    @PostMapping("/verify-otp")
    public String verifyOtp(
            @RequestParam String username,
            @RequestParam String otp){

        String res = service.verifyOTP(username, otp);
        return res;
    }



}
