package io.p3admin.filter;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import javax.servlet.FilterChain;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static io.p3admin.configuration.SecurityCfg.JWT_CLAIM_KEY_ROLES;
import static java.util.Map.entry;

@Slf4j
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends UsernamePasswordAuthenticationFilter {
    // one second = 1000; one minute = 1000 * 60
    private static final int ACCESS_TOKEN_VALID_DURATION = 1000 * 60 * 5;
    private static final int REFRESH_TOKEN_VALID_DURATION = 1000 * 60 * 15;

    private final AuthenticationManager authMgr;
    private final Algorithm algorithm;
    private final ObjectMapper objectMapper;

    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response) throws AuthenticationException {
        var username = request.getParameter("username");
        var password = request.getParameter("password");

        log.debug("User {} tries to login", username);
        return authMgr.authenticate(new UsernamePasswordAuthenticationToken(username, password));
    }

    public static void createAndAddJwtTokens(
            String username,
            List<String> roles,
            Algorithm algorithm,
            ObjectMapper objectMapper,
            HttpServletRequest request,
            HttpServletResponse response
    ) throws IOException {
        log.info("Creating new JWT Token for username {}", username);

        var accessToken = JWT.create()
                .withSubject(username)
                .withExpiresAt(new Date(System.currentTimeMillis() + ACCESS_TOKEN_VALID_DURATION))
                .withIssuer(request.getRequestURL().toString())
                .withClaim(JWT_CLAIM_KEY_ROLES, roles)
                .sign(algorithm);

        var refreshToken = JWT.create()
                .withSubject(username)
                .withExpiresAt(new Date(System.currentTimeMillis() + REFRESH_TOKEN_VALID_DURATION))
                .withIssuer(request.getRequestURL().toString())
                .sign(algorithm);

        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(
                response.getOutputStream(),
                Map.ofEntries(
                        entry("access-token", accessToken),
                        entry("refresh-token", refreshToken)
                )
        );
    }

    /**
     * Create JWT token on successful login.
     * This method is called when {@link io.p3admin.service.UserService#loadUserByUsername} returns a valid user.
     */
    @Override
    protected void successfulAuthentication(HttpServletRequest request, HttpServletResponse response, FilterChain chain, Authentication authResult) throws IOException {
        var user = (User) authResult.getPrincipal();
        var authorities = user.getAuthorities().stream().map(GrantedAuthority::getAuthority).collect(Collectors.toList());
        createAndAddJwtTokens(user.getUsername(), authorities, algorithm, objectMapper, request, response);
    }
}
