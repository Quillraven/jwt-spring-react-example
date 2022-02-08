package io.p3admin.configuration;

import com.auth0.jwt.algorithms.Algorithm;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.p3admin.filter.AppAuthenticationFilter;
import io.p3admin.filter.AppAuthorizationFilter;
import io.p3admin.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import static io.p3admin.model.domain.Permission.Privilege.WRITE;
import static io.p3admin.model.domain.Permission.getSpringAuthority;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityCfg extends WebSecurityConfigurerAdapter {
    public static final String JWT_CLAIM_KEY_ROLES = "roles";

    private final UserService userService;
    private final PasswordEncoder pwdEncoder;

    @Bean
    public Algorithm jwtAlgorithm() {
        // TODO get secret from database
        return Algorithm.HMAC256("SECRET");
    }

    @Bean
    @Override
    public AuthenticationManager authenticationManagerBean() throws Exception {
        return super.authenticationManagerBean();
    }


    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.userDetailsService(userService).passwordEncoder(pwdEncoder);
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        var authMgr = getApplicationContext().getBean(AuthenticationManager.class);
        var algorithm = getApplicationContext().getBean(Algorithm.class);
        var objectMapper = getApplicationContext().getBean(ObjectMapper.class);
        var authFilter = new AppAuthenticationFilter(authMgr, algorithm, objectMapper);
        // set custom login URL instead of Spring's /login
        authFilter.setFilterProcessesUrl("/api/v1/login");

        http
                .csrf().disable()
                .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                .and()
                .authorizeRequests()
                .antMatchers("/api/v1/roles").hasAuthority(getSpringAuthority("User", WRITE))
                .antMatchers("/api/v1/permissions").hasAuthority(getSpringAuthority("User", WRITE))
                .anyRequest().authenticated()
                .and()
                .addFilter(authFilter)
                .addFilterBefore(new AppAuthorizationFilter(algorithm), UsernamePasswordAuthenticationFilter.class);
    }
}
