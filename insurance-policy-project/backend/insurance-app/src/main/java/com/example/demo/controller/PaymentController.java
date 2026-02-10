package com.example.demo.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.example.demo.dto.PaymentRequest;
import com.example.demo.entity.Payment;
import com.example.demo.service.PaymentService;

@RestController
@RequestMapping("/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    private final PaymentService service;

    public PaymentController(PaymentService service) {
        this.service = service;
    }

    @PostMapping
    public Payment pay(@RequestBody PaymentRequest request) {
        return service.makePayment(request);
    }

    @GetMapping
    public List<Payment> all() {
        return service.getAllPayments();
    }

    @GetMapping("/by-customer-policy/{id}")
    public List<Payment> byCustomerPolicy(@PathVariable int id) {
        return service.getPaymentsByCustomerPolicyId(id);
    }
}

