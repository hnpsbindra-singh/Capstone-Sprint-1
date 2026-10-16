package com.testing.springpractice.authapp.Service;

import com.testing.springpractice.authapp.models.FloodReport;
import com.testing.springpractice.authapp.repo.FloodReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminService {
    @Autowired
    FloodReportRepository floodReportRepository;
    public List<FloodReport> reports() {
        return floodReportRepository.findAll();
    }
}
