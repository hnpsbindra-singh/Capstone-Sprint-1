package com.testing.springpractice.victimservice.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Builder
public class JwtPrincipal {
    private final String userId;
    private final String username;
    private final String role;
}
