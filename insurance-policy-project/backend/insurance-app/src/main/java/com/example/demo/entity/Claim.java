package com.example.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "claims")
public class Claim {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne
    @JoinColumn(name = "customer_policy_id")
    private CustomerPolicy customerPolicy;

    private double claimAmount;

    private LocalDate claimDate;

    private String claimStatus;   

    private String description;

    public Claim() {}

    
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public CustomerPolicy getCustomerPolicy() { return customerPolicy; }
    public void setCustomerPolicy(CustomerPolicy customerPolicy) { this.customerPolicy = customerPolicy; }

    public double getClaimAmount() { return claimAmount; }
    public void setClaimAmount(double claimAmount) { this.claimAmount = claimAmount; }

    public LocalDate getClaimDate() { return claimDate; }
    public void setClaimDate(LocalDate claimDate) { this.claimDate = claimDate; }

    public String getClaimStatus() { return claimStatus; }
    public void setClaimStatus(String claimStatus) { this.claimStatus = claimStatus; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
