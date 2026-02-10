package com.example.demo.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.demo.dto.PaymentRequest;
import com.example.demo.entity.CustomerPolicy;
import com.example.demo.entity.Payment;
import com.example.demo.repository.CustomerPolicyRepository;
import com.example.demo.repository.PaymentRepository;

@Service
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepo;
    private final CustomerPolicyRepository customerPolicyRepo;

    public PaymentServiceImpl(PaymentRepository paymentRepo,
                              CustomerPolicyRepository customerPolicyRepo) {
        this.paymentRepo = paymentRepo;
        this.customerPolicyRepo = customerPolicyRepo;
    }

    @Override
    public Payment makePayment(PaymentRequest request) {
        CustomerPolicy cp = customerPolicyRepo.findById(request.getCustomerPolicyId()).orElse(null);
        if (cp == null) return null;

        Payment p = new Payment();
        p.setCustomerPolicy(cp);
        p.setAmount(request.getAmount());
        p.setPaymentDate(request.getPaymentDate());
        p.setPaymentMode(request.getPaymentMode());
        p.setPaymentStatus(request.getPaymentStatus());

        return paymentRepo.save(p);
    }

    @Override
    public List<Payment> getAllPayments() {
        return paymentRepo.findAll();
    }

    @Override
    public List<Payment> getPaymentsByCustomerPolicyId(int customerPolicyId) {
        return paymentRepo.findAll()
                .stream()
                .filter(p -> p.getCustomerPolicy() != null && p.getCustomerPolicy().getId() == customerPolicyId)
                .collect(Collectors.toList());
    }
}
