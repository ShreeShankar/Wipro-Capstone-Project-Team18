package com.example.demo;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.core.env.Environment;

import java.util.Arrays;

@SpringBootApplication
public class InsuranceAppApplication {

	private static final Logger logger = LoggerFactory.getLogger(InsuranceAppApplication.class);

	public static void main(String[] args) {
		SpringApplication.run(InsuranceAppApplication.class, args);
	}

	@Bean
	public CommandLineRunner logDatabaseConfig(Environment env,
			@Value("${spring.datasource.url:unknown}") String dbUrl) {
		return args -> {
			logger.info("================================================================================");
			logger.info("Application Startup Configuration:");
			logger.info("Active Profiles: {}", Arrays.toString(env.getActiveProfiles()));
			logger.info("Datasource URL: {}", dbUrl);
			logger.info("================================================================================");
		};
	}
}
