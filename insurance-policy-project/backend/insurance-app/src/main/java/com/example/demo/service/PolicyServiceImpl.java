package com.example.demo.service;

import java.util.List;
import org.springframework.stereotype.Service;
import com.example.demo.entity.Policy;
import com.example.demo.repository.PolicyRepository;

@Service
public class PolicyServiceImpl implements PolicyService {

    private final PolicyRepository repo;

    public PolicyServiceImpl(PolicyRepository repo) {
        this.repo = repo;
    }

    @Override
    public Policy createPolicy(Policy policy) {
        return repo.save(policy);
    }

    @Override
    public List<Policy> getAllPolicies() {
        return repo.findAll();
    }

    @Override
    public Policy getPolicyById(int id) {
        return repo.findById(id).orElse(null);
    }

    @Override
    public void deletePolicy(int id) {
        repo.deleteById(id);
    }
}

