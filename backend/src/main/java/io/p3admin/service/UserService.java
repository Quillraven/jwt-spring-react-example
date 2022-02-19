package io.p3admin.service;

import io.p3admin.model.domain.Permission;
import io.p3admin.model.domain.Role;
import io.p3admin.model.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetailsService;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public interface UserService extends UserDetailsService {
    void refreshToken(HttpServletRequest request, HttpServletResponse response);

    Page<User> getUsers(Pageable pageable);

    User getUser(String username);

    User getUserOrNull(String username);

    User saveUser(User user);

    Page<Role> getRoles(Pageable pageable);

    Role saveRole(Role role);

    Page<Permission> getPermissions(Pageable pageable);

    Permission savePermission(Permission permission);

    void addRoleToUser(String username, String roleName);

    void addPermissionToRole(String roleName, String domainObject, Permission.Privilege privilege);
}
