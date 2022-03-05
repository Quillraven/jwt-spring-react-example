package io.p3admin;

import io.p3admin.model.domain.Role;
import io.p3admin.model.domain.User;
import io.p3admin.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
@Slf4j
public class BackendApplication {
    @Bean
    public CommandLineRunner createDefaultRolesAndUsers(UserService userService) {
        return args -> {
            if (userService.getUserOrNull("admin") != null) {
                // defaults already created -> do nothing
                log.info("Default roles and users already created");
                return;
            }

            log.info("Creating default roles and users");
            for (Role.RoleType roleType : Role.RoleType.values()) {
                userService.saveRole(new Role(roleType));
            }

            userService.saveUser(new User("admin", "admin", "admin@p3admin.at"));
            userService.addRoleToUser("admin", Role.RoleType.ADMIN);

            userService.saveUser(new User("therapist", "therapist", "therapist@p3admin.at"));
            userService.addRoleToUser("therapist", Role.RoleType.THERAPIST);

            userService.saveUser(new User("secretary", "secretary", "secretary@p3admin.at"));
            userService.addRoleToUser("secretary", Role.RoleType.SECRETARY);
        };
    }

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }
}
