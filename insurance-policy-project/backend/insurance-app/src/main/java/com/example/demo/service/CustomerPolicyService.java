package com.example.demo.service;

import java.util.List;
import com.example.demo.dto.AssignPolicyRequest;
import com.example.demo.entity.CustomerPolicy;

public interface CustomerPolicyService {
    CustomerPolicy assignPolicy(AssignPolicyRequest request);
    List<CustomerPolicy> getAllAssignments();
    CustomerPolicy getById(int id);
}

