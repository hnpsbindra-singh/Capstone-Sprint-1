package com.testing.springpractice.authapp.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateNgoRequest {

    private String title;
    private String description;
    private String resourceNeeded;
    private Long quantityNeeded;

    private Double latitude;
    private Double longitude;
}