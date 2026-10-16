package com.testing.springpractice.authapp.Service;

import com.testing.springpractice.authapp.models.Users;
import com.testing.springpractice.authapp.repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class MyUserDetailsService implements UserDetailsService {
    @Autowired
    UserRepo rep;
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Users user = rep.findByUsername(username);
        if(user == null){
            System.out.println("user Not Found");
            return null;
        }
        return user;

    }
}
