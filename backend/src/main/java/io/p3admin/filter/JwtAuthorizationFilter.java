package io.p3admin.filter;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.exceptions.TokenExpiredException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
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
import static io.p3admin.configuration.SecurityCfg.LOGIN_END_POINT;

@RequiredArgsConstructor
@Slf4j
public class JwtAuthorizationFilter extends OncePerRequestFilter {
    private static final String AUTH_PREFIX = "Bearer ";

    private final Algorithm algorithm;
    private final ObjectMapper objectMapper;

    public static boolean isInvalidAuthorizationRequest(HttpServletRequest request) {
        var authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        return authHeader == null || !authHeader.startsWith(AUTH_PREFIX);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        var path = request.getServletPath();

        // do not run filter for login/refresh-token page or if authentication format is missing or wrong
        return LOGIN_END_POINT.equals(path) || ("/api/v1/refresh-token").equals(path) || isInvalidAuthorizationRequest(request);
    }

    private void writeErrorResponse(HttpServletResponse response, HttpStatus status, String text) throws IOException {
        response.setStatus(status.value());
        objectMapper.writeValue(
                response.getOutputStream(),
                text
        );
    }

    public static String getJwtToken(HttpServletRequest request) {
        var authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        return authHeader.substring(AUTH_PREFIX.length());
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        try {
            var token = getJwtToken(request);
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
        } catch (TokenExpiredException e) {
            log.error("JWT token expired");
            writeErrorResponse(response, HttpStatus.UNAUTHORIZED, "Your JWT token is expired");
        } catch (JWTVerificationException e) {
            log.error("JWT token not verified");
            writeErrorResponse(response, HttpStatus.BAD_REQUEST, "Could not decode JWT token");
        } finally {
            filterChain.doFilter(request, response);
        }
    }
}
