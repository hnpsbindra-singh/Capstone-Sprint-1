package com.testing.springpractice.authapp.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "Donations")
public class Donation {

    @Id
    private String id;
    private String donorId;
    private String ngoRequestId;
    private String itemName;
    private Long quantity;
    private DonationStatus status;
    private Long donatedAt;
}