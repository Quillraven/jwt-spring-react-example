package io.p3admin.repository;

import io.p3admin.model.domain.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, Long> {
    Optional<Permission> findByDomainObjectAndPrivilege(String domainObject, Permission.Privilege privilege);
}
