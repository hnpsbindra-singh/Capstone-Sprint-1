package com.testing.springpractice.authapp.repo;

import com.testing.springpractice.authapp.models.Users;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepo extends MongoRepository<Users, String> {
    Users findByUsername(String email);


}
