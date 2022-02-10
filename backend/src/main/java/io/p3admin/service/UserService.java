package io.p3admin.service;

import io.p3admin.model.domain.Permission;
import io.p3admin.model.domain.Role;
import io.p3admin.model.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.security.core.userdetails.UserDetailsService;

public interface UserService extends UserDetailsService {
    Page<User> getUsers(int page, int pageSize);

    User getUser(String username);

    User getUserOrNull(String username);

    User saveUser(User user);

    Page<Role> getRoles(int page, int pageSize);

    Role saveRole(Role role);

    Page<Permission> getPermissions(int page, int pageSize);

    Permission savePermission(Permission permission);

    void addRoleToUser(String username, String roleName);

    void addPermissionToRole(String roleName, String domainObject, Permission.Privilege privilege);
}
