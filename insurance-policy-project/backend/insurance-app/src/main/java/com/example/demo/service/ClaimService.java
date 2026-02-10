package com.example.demo.service;

import java.util.List;
import com.example.demo.dto.ClaimRequest;
import com.example.demo.entity.Claim;

public interface ClaimService {
    Claim raiseClaim(ClaimRequest request);
    List<Claim> getAllClaims();
    List<Claim> getClaimsByCustomerPolicyId(int customerPolicyId);
}

