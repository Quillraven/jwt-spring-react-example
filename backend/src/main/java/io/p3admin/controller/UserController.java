package io.p3admin.controller;

import io.p3admin.model.domain.Permission;
import io.p3admin.model.domain.Role;
import io.p3admin.model.domain.User;
import io.p3admin.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/users")
    Page<User> getUsers(@RequestParam int page, @RequestParam int pageSize) {
        return userService.getUsers(page, pageSize);
    }

    @GetMapping("/roles")
    Page<Role> getRoles(@RequestParam int page, @RequestParam int pageSize) {
        return userService.getRoles(page, pageSize);
    }

    @GetMapping("/permissions")
    Page<Permission> getPermissions(@RequestParam int page, @RequestParam int pageSize) {
        return userService.getPermissions(page, pageSize);
    }

    @PostMapping("/refresh-token")
    void refreshToken(HttpServletRequest request, HttpServletResponse response) {
        userService.refreshToken(request, response);
    }
}
