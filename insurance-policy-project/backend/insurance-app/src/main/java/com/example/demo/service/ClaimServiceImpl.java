package com.example.demo.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.demo.dto.ClaimRequest;
import com.example.demo.entity.Claim;
import com.example.demo.entity.CustomerPolicy;
import com.example.demo.repository.ClaimRepository;
import com.example.demo.repository.CustomerPolicyRepository;

@Service
public class ClaimServiceImpl implements ClaimService {

    private final ClaimRepository claimRepo;
    private final CustomerPolicyRepository customerPolicyRepo;

    public ClaimServiceImpl(ClaimRepository claimRepo,
                            CustomerPolicyRepository customerPolicyRepo) {
        this.claimRepo = claimRepo;
        this.customerPolicyRepo = customerPolicyRepo;
    }

    @Override
    public Claim raiseClaim(ClaimRequest request) {
        CustomerPolicy cp = customerPolicyRepo.findById(request.getCustomerPolicyId()).orElse(null);
        if (cp == null) return null;

        Claim c = new Claim();
        c.setCustomerPolicy(cp);
        c.setClaimAmount(request.getClaimAmount());
        c.setClaimDate(request.getClaimDate());
        c.setClaimStatus(request.getClaimStatus());
        c.setDescription(request.getDescription());

        return claimRepo.save(c);
    }

    @Override
    public List<Claim> getAllClaims() {
        return claimRepo.findAll();
    }

    @Override
    public List<Claim> getClaimsByCustomerPolicyId(int customerPolicyId) {
        return claimRepo.findAll()
                .stream()
                .filter(cl -> cl.getCustomerPolicy() != null && cl.getCustomerPolicy().getId() == customerPolicyId)
                .collect(Collectors.toList());
    }
}
