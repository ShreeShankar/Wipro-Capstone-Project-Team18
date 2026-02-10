package com.example.demo.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.dto.AssignPolicyRequest;
import com.example.demo.entity.Customer;
import com.example.demo.entity.CustomerPolicy;
import com.example.demo.entity.Policy;
import com.example.demo.repository.CustomerPolicyRepository;
import com.example.demo.repository.CustomerRepository;
import com.example.demo.repository.PolicyRepository;

@Service
public class CustomerPolicyServiceImpl implements CustomerPolicyService {

    private final CustomerPolicyRepository customerPolicyRepo;
    private final CustomerRepository customerRepo;
    private final PolicyRepository policyRepo;

    public CustomerPolicyServiceImpl(CustomerPolicyRepository customerPolicyRepo,
                                     CustomerRepository customerRepo,
                                     PolicyRepository policyRepo) {
        this.customerPolicyRepo = customerPolicyRepo;
        this.customerRepo = customerRepo;
        this.policyRepo = policyRepo;
    }

    @Override
    public CustomerPolicy assignPolicy(AssignPolicyRequest request) {

        Customer customer = customerRepo.findById(request.getCustomerId()).orElse(null);
        Policy policy = policyRepo.findById(request.getPolicyId()).orElse(null);

        if (customer == null || policy == null) {
            return null;
        }

        CustomerPolicy cp = new CustomerPolicy();
        cp.setCustomer(customer);
        cp.setPolicy(policy);
        cp.setStartDate(request.getStartDate());
        cp.setEndDate(request.getEndDate());
        cp.setStatus(request.getStatus());
        cp.setPremiumAmount(request.getPremiumAmount());

        return customerPolicyRepo.save(cp);
    }

    @Override
    public List<CustomerPolicy> getAllAssignments() {
        return customerPolicyRepo.findAll();
    }

    @Override
    public CustomerPolicy getById(int id) {
        return customerPolicyRepo.findById(id).orElse(null);
    }
}

