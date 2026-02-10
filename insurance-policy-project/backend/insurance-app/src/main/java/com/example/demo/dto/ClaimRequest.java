package com.example.demo.dto;

import java.time.LocalDate;

public class ClaimRequest {
    private int customerPolicyId;
    private double claimAmount;
    private LocalDate claimDate;
    private String claimStatus;
    private String description;

    public int getCustomerPolicyId() { return customerPolicyId; }
    public void setCustomerPolicyId(int customerPolicyId) { this.customerPolicyId = customerPolicyId; }

    public double getClaimAmount() { return claimAmount; }
    public void setClaimAmount(double claimAmount) { this.claimAmount = claimAmount; }

    public LocalDate getClaimDate() { return claimDate; }
    public void setClaimDate(LocalDate claimDate) { this.claimDate = claimDate; }

    public String getClaimStatus() { return claimStatus; }
    public void setClaimStatus(String claimStatus) { this.claimStatus = claimStatus; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
