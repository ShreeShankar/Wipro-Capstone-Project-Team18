package com.example.demo.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.example.demo.dto.AssignPolicyRequest;
import com.example.demo.entity.CustomerPolicy;
import com.example.demo.service.CustomerPolicyService;

@RestController
@RequestMapping("/customer-policies")
@CrossOrigin(origins = "*")
public class CustomerPolicyController {

    private final CustomerPolicyService service;

    public CustomerPolicyController(CustomerPolicyService service) {
        this.service = service;
    }

    // Assign policy to customer
    @PostMapping("/assign")
    public CustomerPolicy assign(@RequestBody AssignPolicyRequest request) {
        return service.assignPolicy(request);
    }

    // Get all assignments
    @GetMapping
    public List<CustomerPolicy> getAll() {
        return service.getAllAssignments();
    }

    // Get assignment by id
    @GetMapping("/{id}")
    public CustomerPolicy getById(@PathVariable int id) {
        return service.getById(id);
    }
}
