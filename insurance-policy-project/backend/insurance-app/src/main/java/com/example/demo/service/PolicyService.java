package com.example.demo.service;

import java.util.List;
import com.example.demo.entity.Policy;

public interface PolicyService {
    Policy createPolicy(Policy policy);
    List<Policy> getAllPolicies();
    Policy getPolicyById(int id);
    void deletePolicy(int id);
}
