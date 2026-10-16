package com.testing.springpractice.authapp.Service;

import com.testing.springpractice.authapp.DTO.LoginRequest;
import com.testing.springpractice.authapp.DTO.ProfileRequest;
import com.testing.springpractice.authapp.DTO.ProfileResponse;
import com.testing.springpractice.authapp.Security.JwtUtils;
import com.testing.springpractice.authapp.repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.testing.springpractice.authapp.models.Users;

import java.security.SecureRandom;

@Service
public class ProfileService {

    @Autowired
    UserRepo repo;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    MyUserDetailsService userDetailsService;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired
    EmailService emailService;

    public ProfileResponse register(ProfileRequest profile){
        Users us = new Users();
        us.setUsername(profile.getUsername());
        us.setName(profile.getName());
        us.setPassword(passwordEncoder.encode(profile.getPassword()));
        us.setRole(profile.getRole());

        Users saved = repo.save(us);
        return maptores(saved);
    }

    private ProfileResponse maptores(Users us) {
        ProfileResponse response = new ProfileResponse();
        response.setId(us.getId());
        response.setUsername(us.getUsername());
        response.setName(us.getName());
        response.setPassword(us.getPassword());
        response.setIsverified(us.isIsverified());
        response.setRole(us.getRole());
        return response;
    }

    public String login(LoginRequest request) {
        String token;
       try{
           authenticate(request.getUsername(), request.getPassword());
           Users us = repo.findByUsername(request.getUsername());

           if(us == null){
               throw new RuntimeException("User not found");
           }

           if(!us.isIsverified()){
               throw new RuntimeException("Please verify your account first");
           }
           token = jwtUtils.generateToken(request.getUsername(), us.getRole());
       }catch (Exception e){
           e.printStackTrace();
           throw new RuntimeException("Invalid credentials");
       }
        return token;
    }

    private void authenticate(String username, String password) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(username, password));
    }

    public void sendresetOtp(String username){
        Users us = repo.findByUsername(username);
        if(us == null){
            System.out.println("User not found");
            return;
        }
        String otp = String.format("%06d", new SecureRandom().nextInt(1000000));

        long expry = System.currentTimeMillis() + (15*60*1000);

        us.setResetOTP(otp);
        us.setResetOTPexpireAt(expry);
        repo.save(us);

        try{
            emailService.sendRestotp(username, otp);
        } catch (Exception e){
            System.out.println("faliure in sending email");

        }
    }

    public void resetPassword(String username, String otp, String newPassword){

        Users us = repo.findByUsername(username);
        if(us.getResetOTP()==null||!us.getResetOTP().equals(otp)){
           throw new RuntimeException("Invalid OTP");
        }
        if(us.getResetOTPexpireAt()<System.currentTimeMillis()){
            throw new RuntimeException("OTP expired");
        }
        us.setPassword(passwordEncoder.encode(newPassword));
        us.setResetOTP(null);

        repo.save(us);

    }

    public void sendOTP(String username){
        Users us = repo.findByUsername(username);

        if(us == null){
            System.out.println("User not found");
            return ;
        }

        if(us.isIsverified()){
            System.out.println("User already verified");
            return ;
        }
        String otp = String.format("%06d", new SecureRandom().nextInt(1000000));

        long expry = System.currentTimeMillis() + (15*60*1000);

        us.setVerifyOTP(otp);
        us.setOtpexpiredat(expry);
        repo.save(us);

        try{
            emailService.sendRestotp(username, otp);
        } catch (Exception e){
            System.out.println("faliure in sending email");

        }

    }

    public String verifyOTP(String username, String otp){

        Users us = repo.findByUsername(username);

        if(us == null){
            return "User not found";
        }

        if(us.isIsverified()){
            return "Already verified";
        }

        if(us.getVerifyOTP() == null){
            return "No OTP generated";
        }

        // check expiry
        if(us.getOtpexpiredat() < System.currentTimeMillis()){
            return "OTP expired";
        }

        // check match
        if(!us.getVerifyOTP().equals(otp)){
            return "Invalid OTP";
        }

        // success
        us.setIsverified(true);
        us.setVerifyOTP(null); // clear OTP
        us.setOtpexpiredat(0);

        repo.save(us);

        return "User verified successfully";
    }
}
