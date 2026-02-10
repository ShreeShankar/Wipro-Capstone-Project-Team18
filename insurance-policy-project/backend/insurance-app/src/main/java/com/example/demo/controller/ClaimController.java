package com.example.demo.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.example.demo.dto.ClaimRequest;
import com.example.demo.entity.Claim;
import com.example.demo.service.ClaimService;

@RestController
@RequestMapping("/claims")
@CrossOrigin(origins = "*")
public class ClaimController {

    private final ClaimService service;

    public ClaimController(ClaimService service) {
        this.service = service;
    }

    @PostMapping
    public Claim raise(@RequestBody ClaimRequest request) {
        return service.raiseClaim(request);
    }

    @GetMapping
    public List<Claim> all() {
        return service.getAllClaims();
    }

    @GetMapping("/by-customer-policy/{id}")
    public List<Claim> byCustomerPolicy(@PathVariable int id) {
        return service.getClaimsByCustomerPolicyId(id);
    }
}
