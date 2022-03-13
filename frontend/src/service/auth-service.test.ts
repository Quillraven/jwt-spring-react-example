import { Role, User } from './auth-service';

type GetRolesTestTuple = [Role[], Role[], boolean]
test.each<GetRolesTestTuple>([
  [[Role.Admin], [], false],
  [[Role.Admin], [Role.Admin], true],
  [[Role.Admin], [Role.Therapist], false],
  [[Role.Admin, Role.Therapist], [Role.Therapist], true],
  [[Role.Therapist], [Role.Admin, Role.Therapist], true],
  [[], [Role.Admin], false]
])('%# - test getRoles: userRoles=%p, checkRoles=%p, expected=%s', (userRoles, checkRoles, expected) => {
  const user = new User('access', 'refresh', userRoles)

  expect(user.hasAnyRole(...checkRoles)).toEqual(expected)
})
