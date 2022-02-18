package io.p3admin.model.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import java.util.Objects;

@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"domain_object", "privilege"}))
@Entity
public class Permission {
    public enum Privilege {
        READ, WRITE, DELETE
    }

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(nullable = false, name = "domain_object")
    @NotBlank(message = "domain_object must be non blank")
    private String domainObject;

    @Column(nullable = false)
    @Enumerated(value = EnumType.STRING)
    private Privilege privilege;

    public Permission() {
    }

    public Permission(String domainObject, Privilege privilege) {
        this.domainObject = domainObject;
        this.privilege = privilege;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDomainObject() {
        return domainObject;
    }

    public void setDomainObject(String name) {
        this.domainObject = name;
    }

    public Privilege getPrivilege() {
        return privilege;
    }

    public void setPrivilege(Privilege privilege) {
        this.privilege = privilege;
    }

    @JsonIgnore
    public String getSpringAuthority() {
        return getSpringAuthority(domainObject, privilege);
    }

    public static String getSpringAuthority(String domainObject, Privilege privilege) {
        return domainObject + ":" + privilege.name();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Permission that = (Permission) o;
        return domainObject.equals(that.domainObject) && privilege == that.privilege;
    }

    @Override
    public int hashCode() {
        return Objects.hash(domainObject, privilege);
    }

    @Override
    public String toString() {
        return "Permission{" +
                "id=" + id +
                ", domainObject='" + domainObject + '\'' +
                ", privilege=" + privilege +
                '}';
    }
}
