package com.testing.springpractice.victimservice.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FloodScoreRequestDTO {
    @JsonProperty("image_base64")
    public String imageBase64;
}
