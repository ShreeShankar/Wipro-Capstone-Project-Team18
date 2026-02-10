package com.example.demo.service;

import java.util.List;
import com.example.demo.dto.PaymentRequest;
import com.example.demo.entity.Payment;

public interface PaymentService {
    Payment makePayment(PaymentRequest request);
    List<Payment> getAllPayments();
    List<Payment> getPaymentsByCustomerPolicyId(int customerPolicyId);
}
