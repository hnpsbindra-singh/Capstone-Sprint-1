package com.testing.springpractice.victimservice.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.security.Principal;

@Getter
@AllArgsConstructor
@Builder
public class JwtPrincipal implements Principal {
    private final String userId;
    private final String username;
    private final String role;

    @Override
    public String getName() {
        return username;
    }
    @Override
    public String toString() {
        return username;
    }
}
