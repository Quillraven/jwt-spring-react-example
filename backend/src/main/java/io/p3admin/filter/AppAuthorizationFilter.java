package io.p3admin.filter;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Arrays;
import java.util.stream.Collectors;

import static io.p3admin.configuration.SecurityCfg.JWT_CLAIM_KEY_ROLES;

@RequiredArgsConstructor
public class AppAuthorizationFilter extends OncePerRequestFilter {
    private static final String AUTH_PREFIX = "Bearer ";

    private final Algorithm algorithm;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        var path = request.getServletPath();
        var authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);

        // do not run filter for login page or if authentication format is missing or wrong
        return "/login".equals(path) || authHeader == null || !authHeader.startsWith(AUTH_PREFIX);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        var authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        var token = authHeader.substring(AUTH_PREFIX.length());
        var jwtVerifier = JWT.require(algorithm).build();
        var decodedJwt = jwtVerifier.verify(token);
        var username = decodedJwt.getSubject();
        var roles = decodedJwt.getClaim(JWT_CLAIM_KEY_ROLES).asArray(String.class);

        var authToken = new UsernamePasswordAuthenticationToken(
                username,
                null,
                Arrays.stream(roles).map(SimpleGrantedAuthority::new).collect(Collectors.toSet())
        );
        SecurityContextHolder.getContext().setAuthentication(authToken);

        filterChain.doFilter(request, response);
    }
}
