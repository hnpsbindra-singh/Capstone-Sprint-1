package com.testing.springpractice.authapp.DTO;

import com.testing.springpractice.authapp.models.DonationStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateDonation {
    private String itemName;
    private Long quantity;
    private DonationStatus status;
    private Long donatedAt;
}
