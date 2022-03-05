package io.p3admin.configuration;

import com.auth0.jwt.algorithms.Algorithm;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.p3admin.filter.JwtAuthenticationFilter;
import io.p3admin.filter.JwtAuthorizationFilter;
import io.p3admin.model.domain.Role;
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
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityCfg extends WebSecurityConfigurerAdapter {
    public static final String JWT_CLAIM_KEY_ROLES = "roles";
    public static final String LOGIN_END_POINT = "/api/v1/login";

    private final UserService userService;
    private final PasswordEncoder pwdEncoder;

    @Bean
    @Override
    public AuthenticationManager authenticationManagerBean() throws Exception {
        return super.authenticationManagerBean();
    }

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.userDetailsService(userService).passwordEncoder(pwdEncoder);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        var cfgSrc = new UrlBasedCorsConfigurationSource();
        cfgSrc.registerCorsConfiguration("/**", new CorsConfiguration().applyPermitDefaultValues());
        return cfgSrc;
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        var authMgr = getApplicationContext().getBean(AuthenticationManager.class);
        var algorithm = getApplicationContext().getBean(Algorithm.class);
        var objectMapper = getApplicationContext().getBean(ObjectMapper.class);
        var authenticationFilter = new JwtAuthenticationFilter(authMgr, algorithm, objectMapper);
        // set custom login URL instead of Spring's /login
        authenticationFilter.setFilterProcessesUrl(LOGIN_END_POINT);

        http
                .cors()
                .and()
                .csrf().disable()
                .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                .and()
                .authorizeRequests()
                .antMatchers("/api/v1/refresh-token").permitAll()
                .antMatchers("/api/v1/roles").hasRole(Role.RoleType.ADMIN.name())
                .anyRequest().authenticated()
                .and()
                .addFilter(authenticationFilter)
                .addFilterBefore(new JwtAuthorizationFilter(algorithm, objectMapper), UsernamePasswordAuthenticationFilter.class);
    }
}
