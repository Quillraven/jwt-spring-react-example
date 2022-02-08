package io.p3admin.configuration;

import io.p3admin.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.crypto.password.PasswordEncoder;

import static io.p3admin.model.domain.Permission.Privilege.WRITE;
import static io.p3admin.model.domain.Permission.getSpringAuthority;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityCfg extends WebSecurityConfigurerAdapter {
    private final UserService userService;
    private final PasswordEncoder pwdEncoder;

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.userDetailsService(userService).passwordEncoder(pwdEncoder);
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        // TODO replace httpBasic with JWT
        http
                .csrf().disable()
                .authorizeRequests()
                .antMatchers("/api/v1/roles").hasAuthority(getSpringAuthority("User", WRITE))
                .antMatchers("/api/v1/permissions").hasAuthority(getSpringAuthority("User", WRITE))
                .anyRequest().authenticated()
                .and()
                .httpBasic();
    }
}
