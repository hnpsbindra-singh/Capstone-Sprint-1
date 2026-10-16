package com.testing.springpractice.authapp.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender javaMailSender;

    @Value("${spring.mail.properties.mail.smtp.from}")
    private String fromEmail;

    public void sendAcceptance(String toEmail) {

        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setFrom(fromEmail);
        message.setTo(toEmail);

        message.setSubject(
                "Donation Accepted"
        );

        message.setText(
                "Your donation has been accepted by the NGO. \n\n" +
                        "Thank you for supporting flood relief efforts.\n\n" +
                        "Your contribution will help affected families receive essential resources.\n\n" +
                        "Flood Rescue System"
        );

        javaMailSender.send(message);
    }
    public void sendWelcome(String toEmail, String name) {

        SimpleMailMessage mailMessage = new SimpleMailMessage();

        mailMessage.setFrom(fromEmail);
        mailMessage.setTo(toEmail);
        mailMessage.setSubject("Welcome to Flood Rescue System");

        mailMessage.setText(
                "Hi " + name + ",\n\n" +
                        "Welcome to the Flood Rescue System.\n\n" +
                        "Your account has been successfully created.\n" +
                        "You can now report floods, request help, donate resources, " +
                        "and stay connected with rescue operations.\n\n" +
                        "Together, we can help save lives during emergencies.\n\n" +
                        "Stay safe.\n" +
                        "- Flood Rescue Team"
        );

        javaMailSender.send(mailMessage);
    }

    public void sendRestotp(String toEmail, String otp) {

        SimpleMailMessage mailMessage = new SimpleMailMessage();

        mailMessage.setFrom(fromEmail);
        mailMessage.setTo(toEmail);
        mailMessage.setSubject("Flood Rescue OTP");

        mailMessage.setText(
                "Your OTP is: " + otp + "\n\n" +
                        "This OTP is valid for 5 minutes.\n\n" +
                        "If you did not request this, please ignore this email.\n\n" +
                        "- Flood Rescue Team"
        );

        javaMailSender.send(mailMessage);
    }

    public void sendDelieverd(String toEmail) {
        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setFrom(fromEmail);
        message.setTo(toEmail);

        message.setSubject(
                "Donation Received"
        );

        message.setText(
                "Your donation has been received by the NGO. \n\n" +
                        "Thank you for supporting flood relief efforts.\n\n" +
                        "Your contribution will help affected families receive essential resources.\n\n" +
                        "Flood Rescue System"
        );

        javaMailSender.send(message);
    }
}