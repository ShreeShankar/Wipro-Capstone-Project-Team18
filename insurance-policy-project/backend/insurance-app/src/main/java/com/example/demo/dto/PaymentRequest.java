package com.example.demo.dto;

import java.time.LocalDate;

public class PaymentRequest {
    private int customerPolicyId;
    private double amount;
    private LocalDate paymentDate;
    private String paymentMode;
    private String paymentStatus;

    public int getCustomerPolicyId() { return customerPolicyId; }
    public void setCustomerPolicyId(int customerPolicyId) { this.customerPolicyId = customerPolicyId; }

    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }

    public LocalDate getPaymentDate() { return paymentDate; }
    public void setPaymentDate(LocalDate paymentDate) { this.paymentDate = paymentDate; }

    public String getPaymentMode() { return paymentMode; }
    public void setPaymentMode(String paymentMode) { this.paymentMode = paymentMode; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
}

