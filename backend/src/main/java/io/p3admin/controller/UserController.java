package io.p3admin.controller;

import io.p3admin.model.domain.Permission;
import io.p3admin.model.domain.Role;
import io.p3admin.model.domain.User;
import io.p3admin.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/users")
    Page<User> getUsers(Pageable pageable) {
        return userService.getUsers(pageable);
    }

    @GetMapping("/roles")
    Page<Role> getRoles(Pageable pageable) {
        return userService.getRoles(pageable);
    }

    @GetMapping("/permissions")
    Page<Permission> getPermissions(Pageable pageable) {
        return userService.getPermissions(pageable);
    }

    @PostMapping("/refresh-token")
    void refreshToken(HttpServletRequest request, HttpServletResponse response) {
        userService.refreshToken(request, response);
    }
}
