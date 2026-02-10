package com.example.demo.controller;

import java.util.List;
import org.springframework.web.bind.annotation.*;
import com.example.demo.entity.Policy;
import com.example.demo.service.PolicyService;

@RestController
@RequestMapping("/policies")
@CrossOrigin(origins = "*")
public class PolicyController {

    private final PolicyService service;

    public PolicyController(PolicyService service) {
        this.service = service;
    }

    @PostMapping
    public Policy create(@RequestBody Policy policy) {
        return service.createPolicy(policy);
    }

    @GetMapping
    public List<Policy> getAll() {
        return service.getAllPolicies();
    }

    @GetMapping("/{id}")
    public Policy getById(@PathVariable int id) {
        return service.getPolicyById(id);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable int id) {
        service.deletePolicy(id);
        return "Policy deleted";
    }
}

