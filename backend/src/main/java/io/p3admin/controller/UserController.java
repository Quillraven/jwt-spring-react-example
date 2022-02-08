package io.p3admin.controller;

import io.p3admin.model.domain.Permission;
import io.p3admin.model.domain.Role;
import io.p3admin.model.domain.User;
import io.p3admin.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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

    // TODO refresh token endpoint
}
