package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.demo.entity.Claim;

public interface ClaimRepository extends JpaRepository<Claim, Integer> {
}

