package io.p3admin.configuration;

import com.auth0.jwt.algorithms.Algorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class PasswordCfg {
    @Bean
    public PasswordEncoder pwdEncoder() {
        return new BCryptPasswordEncoder(10);
    }

    @Bean
    public Algorithm jwtAlgorithm(@Value("${io.p3admin.secret}") String secret) {
        return Algorithm.HMAC256(secret);
    }
}
