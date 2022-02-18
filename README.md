# P3Admin

## Spring JWT React

This is an example application showing how to use JWT authentication within a React app using Spring as a backend.

### Backend

This application uses [MariaDB](https://mariadb.org/) as a database. To run it you can use
[Docker](https://www.docker.com/) by creating a container that is bound to port 3306 running on your localhost. Also,
you need to create a database in it with the name **p3admin_db**:

```
1) mysql -u YOUR_USER -p

2) CREATE DATABASE p3admin_db;
```

When you run the `BackendApplication` then a `CommandLineRunner` is executed that creates some default permissions,
roles and users:

- Permissions
    - User READ
    - User WRITE
- Roles
    - Admin
    - User
- Users
    - admin/admin
    - klausm/klausm

The `configuration` package contains the essentials for the JWT security setup. In the `SecurityCfg` class you will
find `HttpSecurity` configuration which blocks any REST calls to `/api/v1/roles` or `/api/v1/permissions` if a user does
not have the User READ permission.

```Java
.antMatchers("/api/v1/refresh-token").permitAll()
.antMatchers("/api/v1/roles").hasAuthority(getSpringAuthority("User",WRITE))
.antMatchers("/api/v1/permissions").hasAuthority(getSpringAuthority("User",WRITE))
```

The `filter` package contains the JWT specifics for any request made to the backend.

The `JwtAuthenticationFilter` is responsible for the authentication via username and password. If it receives valid
credentials then an AUTH and REFRESH token is created and returned in the HttpResponse.

The `JwtAuthorizationFilter` is then used for each future request to validate the passed JWT Token and to inform Spring
about the authorities (=permissions) that this request has.

If the AUTH token is expired then a user can refresh it by using the `/refresh-token` endpoint of the `UserController`.

Here are some example http requests:

```
### login with admin
curl -X POST --location "http://localhost:8080/api/v1/login" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "username=admin&password=admin"

### refresh a token
curl -X POST --location "http://localhost:8080/api/v1/refresh-token" \
    -H "Authorization: Bearer %JWT_REFRESH_TOKEN%"
    
### getUsers
curl -X GET --location "http://localhost:8080/api/v1/users?page=0&pageSize=50" \
    -H "Authorization: Bearer %JWT_AUTH_TOKEN%"
    
### getRoles - this will not work for the user klausm because of missing permissions
curl -X GET --location "http://localhost:8080/api/v1/roles?page=0&pageSize=50" \
    -H "Authorization: Bearer %JWT_AUTH_TOKEN%"
```

### Frontend

The frontend is a very basic [React](https://reactjs.org/) application in [Typescript](https://www.typescriptlang.org/)
using [Material UI](https://mui.com/) and [Axios](https://github.com/axios/axios).

It has a Login page where you can change the theme between light and dark. Also, in case of an error it will show that.
**Forgot Password?** is not implemented.

After a successful login it fetches the users of the backend with axios. Axios is configured to use interceptors to
automatically refresh the JWT Token whenever necessary and to provide the auth token for each request. Also, the tokens
are stored in the `localStorage` until the user logs out or the token cannot be refreshed anymore. The code can be found
in the `AuthContext.tsx`.

![image](https://user-images.githubusercontent.com/93260/154648237-983a086c-b720-47bd-bf55-e1f731709baa.png)
![image](https://user-images.githubusercontent.com/93260/154648413-7fa87457-a059-4962-906a-c3c4582f9f25.png)
![image](https://user-images.githubusercontent.com/93260/154649328-35b473a4-43f6-44e0-8582-8c7780dc00b1.png)