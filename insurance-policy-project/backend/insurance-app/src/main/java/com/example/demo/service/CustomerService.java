package com.example.demo.service;

import java.util.List;
import com.example.demo.entity.Customer;

public interface CustomerService {
    Customer createCustomer(Customer customer);
    List<Customer> getAllCustomers();
    Customer getCustomerById(int id);
    void deleteCustomer(int id);
}

