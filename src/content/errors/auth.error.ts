export const AUTH_ERRORS = {
  AUTH_01: {
    code: "AUTH_01",
    message: "Email already exist",
  },

  AUTH_02: {
    code: "AUTH_02",
    message: "Account is blocked or you are not access to resource",
  },
  AUTH_03: {
    code: "AUTH_03",
    message: "Suspected refresh token leak",
  },
  AUTH_04: {
    code: "AUTH_04",
    message: "You do not have permission to access this resource",
  },
  AUTH_05: {
    code: "AUTH_05",
    message: "The new password must not match the old password.",
  },
  AUTH_06: {
    code: "AUTH_06",
    message: "The old password must match the old password in db.",
  },
  AUTH_07: {
    code: "AUTH_07",
    message: "Email not found",
  },
  AUTH_08: {
    code: "AUTH_08",
    message: "Token not found",
  },
  AUTH_09: {
    code: "AUTH_09",
    message: "User not found",
  },
  AUTH_10: {
    code: "AUTH_10",
    message: "Invalid credentials",
  },
  AUTH_11: {
    code: "AUTH_11",
    message: "Incorrect email or password",
  },
  AUTH_12: {
    code: "AUTH_12",
    message: "You lack the authorization to access this resource.",
  },
};
