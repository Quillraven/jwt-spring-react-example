package io.p3admin;

import io.p3admin.model.domain.Permission;
import io.p3admin.model.domain.Role;
import io.p3admin.model.domain.User;
import io.p3admin.service.UserService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Set;

@SpringBootApplication
public class BackendApplication {
    @Bean
    public PasswordEncoder pwdEncoder() {
        return new BCryptPasswordEncoder(10);
    }

    @Bean
    public CommandLineRunner roleAndPermissionLoader(UserService userService) {
        // TODO remove dummy data loader when we have a development db with test data
        return args -> {
            var permissionUserRead = new Permission("User", Permission.Privilege.READ);
            var permissionUserWrite = new Permission("User", Permission.Privilege.WRITE);
            userService.savePermission(permissionUserRead);
            userService.savePermission(permissionUserWrite);

            var roleAdmin = new Role("Admin", Set.of(permissionUserRead, permissionUserWrite));
            var roleUser = new Role("User", Set.of(permissionUserRead));
            userService.saveRole(roleAdmin);
            userService.saveRole(roleUser);

            userService.saveUser(new User(
                    "klausm",
                    "klausm",
                    "simonklausner@gmail.com",
                    Set.of(roleUser)
            ));
            userService.saveUser(new User(
                    "admin",
                    "admin",
                    "p3admin@noreply.com",
                    Set.of(roleAdmin, roleUser)
            ));
        };
    }

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }
}
