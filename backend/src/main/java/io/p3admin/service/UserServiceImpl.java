package io.p3admin.service;

import io.p3admin.model.domain.Permission;
import io.p3admin.model.domain.Role;
import io.p3admin.model.domain.User;
import io.p3admin.repository.PermissionRepository;
import io.p3admin.repository.RoleRepository;
import io.p3admin.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import javax.transaction.Transactional;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class UserServiceImpl implements UserService, UserDetailsService {
    private final UserRepository userRepo;
    private final RoleRepository roleRepo;
    private final PermissionRepository permissionRepo;
    private final PasswordEncoder pwdEncoder;

    /**
     * This method is called by the {@link io.p3admin.filter.JwtAuthenticationFilter#attemptAuthentication} method
     * when a user tries to log in.
     */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        log.debug("Loading user by username {}", username);
        return userRepo.findByUsername(username)
                .map(user -> org.springframework.security.core.userdetails.User.builder()
                        .username(user.getUsername())
                        .password(user.getPassword())
                        .disabled(!user.isEnabled())
                        .roles(user.getSpringRoles())
                        .authorities(user.getSpringAuthorities())
                        .build()
                )
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User " + username + " not found"));
    }

    @Override
    public Page<User> getUsers(int page, int pageSize) {
        log.debug("Getting users of page {} with size {}", page, pageSize);
        return userRepo.findAll(PageRequest.of(page, pageSize));
    }

    @Override
    public User getUser(String username) {
        log.debug("Get user with username {}", username);
        return userRepo.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User " + username + " not found"));
    }

    @Override
    public User getUserOrNull(String username) {
        log.debug("Get user or null with username {}", username);
        return userRepo.findByUsername(username)
                .orElse(null);
    }

    @Override
    public User saveUser(User user) {
        log.debug("Saving user: {}", user);

        if (user.hasNoPassword() || user.hasNoUsername()) {
            throw new ResponseStatusException(BAD_REQUEST, "User must have a username and password");
        }

        user.setPassword(pwdEncoder.encode(user.getPassword()));
        return userRepo.save(user);
    }

    @Override
    public Page<Role> getRoles(int page, int pageSize) {
        log.debug("Getting roles of page {} with size {}", page, pageSize);
        return roleRepo.findAll(PageRequest.of(page, pageSize));
    }

    @Override
    public Role saveRole(Role role) {
        log.debug("Saving role: {}", role);
        return roleRepo.save(role);
    }

    @Override
    public Page<Permission> getPermissions(int page, int pageSize) {
        log.debug("Getting permissions of page {} with size {}", page, pageSize);
        return permissionRepo.findAll(PageRequest.of(page, pageSize));
    }

    @Override
    public Permission savePermission(Permission permission) {
        log.debug("Saving permission: {}", permission);
        return permissionRepo.save(permission);
    }

    @Override
    public void addRoleToUser(String username, String roleName) {
        log.debug("Adding role {} to user {}", roleName, username);
        if (username == null || username.isBlank() || roleName == null || roleName.isBlank()) {
            throw new ResponseStatusException(BAD_REQUEST, "username and roleName must be provided");
        }

        var user = getUser(username);
        var role = roleRepo.findByName(roleName)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Role " + roleName + " not found"));

        user.getRoles().add(role);
    }

    @Override
    public void addPermissionToRole(String roleName, String domainObject, Permission.Privilege privilege) {
        log.debug("Adding privilege {} for domain {} to role {}", privilege, domainObject, roleName);
        if (roleName == null || roleName.isBlank() || domainObject == null || domainObject.isBlank() || privilege == null) {
            throw new ResponseStatusException(BAD_REQUEST, "roleName, domainObject and privilege must be provided");
        }

        var role = roleRepo.findByName(roleName)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Role " + roleName + " not found"));

        var permission = permissionRepo.findByDomainObjectAndPrivilege(domainObject, privilege)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Permission " + domainObject + ":" + privilege + " not found"));

        role.getPermissions().add(permission);
    }
}
