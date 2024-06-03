import * as bcrypt from "bcryptjs";

import {
  ACCESS_TOKEN,
  ADMIN_ACCESS_TOKEN,
  ADMIN_REFRESH_TOKEN,
  AFFILICATE_ACCESS_TOKEN,
  AFFILICATE_REFRESH_TOKEN,
  FORGOT_TOKEN,
  REFRESH_TOKEN,
} from "../constants";
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import {
  ChangePasswordDto,
  GetStartedDto,
  JwtAccessPayload,
  JwtRefreshPayload,
  RefreshTokenDto,
  RegisterDto,
  ResetPasswordDto,
} from "../dtos";
import { JwtPayload, SignOptions, decode, sign, verify } from "jsonwebtoken";

import { AccountStatus } from "../enums";
import { CONFIG_VAR } from "@config/index";
import { ConfigService } from "@nestjs/config";
import { EmailService } from "@shared/email/services";
import { HttpSuccessResponse } from "@common/responses";
import { UserSerivce } from "@modules/user/services";

export type TokenType =
  | typeof ACCESS_TOKEN
  | typeof REFRESH_TOKEN
  | typeof FORGOT_TOKEN
  | typeof AFFILICATE_ACCESS_TOKEN
  | typeof AFFILICATE_REFRESH_TOKEN
  | typeof ADMIN_ACCESS_TOKEN
  | typeof ADMIN_REFRESH_TOKEN;

@Injectable()
export class AuthService {
  private readonly _jwtKeys: {
    [ACCESS_TOKEN]: string;
    [REFRESH_TOKEN]: string;
    [FORGOT_TOKEN]: string;
    [ADMIN_ACCESS_TOKEN]: string;
    [ADMIN_REFRESH_TOKEN]: string;
  };

  private readonly _jwtOptions: {
    [ACCESS_TOKEN]: SignOptions;
    [REFRESH_TOKEN]: SignOptions;
    [FORGOT_TOKEN]: SignOptions;
    [ADMIN_ACCESS_TOKEN]: SignOptions;
    [ADMIN_REFRESH_TOKEN]: SignOptions;
  };

  constructor(
    private readonly _configService: ConfigService,
    private readonly _userService: UserSerivce,
    private readonly _emailService: EmailService
  ) {
    this._jwtKeys = {
      [ACCESS_TOKEN]: this._configService.get(
        CONFIG_VAR.JWT_SECRET,
        "default_secret"
      ),
      [REFRESH_TOKEN]: this._configService.get(
        CONFIG_VAR.JWT_REFRESH_SECRET,
        "default_secret"
      ),
      [FORGOT_TOKEN]: this._configService.get(
        CONFIG_VAR.JWT_FORGOT_SECRET,
        "default_secret"
      ),
      [ADMIN_ACCESS_TOKEN]: this._configService.get(
        CONFIG_VAR.ADMIN_JWT_SECRET,
        "default_secret"
      ),
      [ADMIN_REFRESH_TOKEN]: this._configService.get(
        CONFIG_VAR.ADMIN_JWT_REFRESH_SECRET,
        "default_secret"
      ),
    };

    this._jwtOptions = {
      [ACCESS_TOKEN]: {
        expiresIn: this._configService.get(CONFIG_VAR.JWT_EXPIRES_IN),
      },
      [REFRESH_TOKEN]: {
        expiresIn: this._configService.get(CONFIG_VAR.JWT_REFRESH_EXPIRES_IN),
      },
      [FORGOT_TOKEN]: {
        expiresIn: this._configService.get(CONFIG_VAR.JWT_FORGOT_EXPIRES_IN),
      },
      [ADMIN_ACCESS_TOKEN]: {
        expiresIn: this._configService.get(CONFIG_VAR.JWT_EXPIRES_IN),
      },
      [ADMIN_REFRESH_TOKEN]: {
        expiresIn: this._configService.get(CONFIG_VAR.JWT_REFRESH_EXPIRES_IN),
      },
    };
  }

  /**
   * Register user with email and password
   * If user is already registered with social login, add local login provider
   */
  async register(data: RegisterDto) {
    const { email, password, firstName, lastName } = data;

    const foundUser = await this._userService.findUserByEmail(email);

    if (foundUser) {
      throw new ConflictException("Email already exists");
    }

    const user = await this._userService.create({
      email,
      firstName,
      lastName,
      adminStatus: AccountStatus.BLOCK,
      userStatus: AccountStatus.ACTIVE,
      isAdmin: false,
      isUser: true,
      password: await this._hashPassword(password),
    });

    const excludeField = ["password", "createdAt", "updatedAt", "deletedAt"];

    Object.keys(user).forEach(
      (key) => excludeField.includes(key) && delete user[key]
    );

    const result = await this.generateTokensForUser(user);

    return new HttpSuccessResponse(result);
  }

  /**
   * Login user with email and password
   */
  async login(data: JwtAccessPayload) {
    const excludeField = ["password", "createdAt", "updatedAt", "deletedAt"];

    if (!data.isUser || data.userStatus !== AccountStatus.ACTIVE) {
      throw new ForbiddenException(
        "Account is blocked or you are not access to resource"
      );
    }

    Object.keys(data).forEach(
      (key) => excludeField.includes(key) && delete data[key]
    );

    const result = await this.generateTokensForUser(data);

    return new HttpSuccessResponse(result);
  }

  async userRefreshToken(refresh: string) {
    const verifyToken = await this._verifyToken(refresh, ACCESS_TOKEN);

    const foundUser = await this._userService
      .findOneOrThrow({
        where: {
          id: (verifyToken as JwtPayload).id,
          deletedAt: null,
        },
      })
      .catch(() => {
        throw new UnauthorizedException("Suspected refresh token leak");
      });

    if (!foundUser.isUser || foundUser.userStatus !== AccountStatus.ACTIVE) {
      throw new ForbiddenException(
        "You do not have permission to access this resource"
      );
    }

    const payload: JwtAccessPayload = {
      id: foundUser.id,
      email: foundUser.email,
      firstName: foundUser.firstName,
      isAdmin: foundUser.isAdmin,
      isUser: foundUser.isUser,
      lastName: foundUser.lastName,
      adminStatus: foundUser.adminStatus,
      userStatus: foundUser.userStatus,
    };

    return new HttpSuccessResponse({
      accessToken: this._signPayload(payload, ACCESS_TOKEN),
    });
  }

  async adminRefreshToken(data: RefreshTokenDto) {
    const verifyToken = await this._verifyToken(
      data.refresh,
      ADMIN_REFRESH_TOKEN
    );

    const foundUser = await this._userService
      .findOneOrThrow({
        where: {
          id: (verifyToken as JwtPayload).id,
          deletedAt: null,
        },
      })
      .catch(() => {
        throw new UnauthorizedException("Suspected refresh token leak");
      });

    if (!foundUser.isAdmin || foundUser.adminStatus !== AccountStatus.ACTIVE) {
      throw new ForbiddenException(
        "You do not have permission to access this resource"
      );
    }

    const payload: JwtAccessPayload = {
      id: foundUser.id,
      email: foundUser.email,
      firstName: foundUser.firstName,
      isAdmin: foundUser.isAdmin,
      isUser: foundUser.isUser,
      lastName: foundUser.lastName,
      adminStatus: foundUser.adminStatus,
      userStatus: foundUser.userStatus,
    };

    return {
      accessToken: this._signPayload(payload, ADMIN_ACCESS_TOKEN),
    };
  }

  async changePassword(data: ChangePasswordDto, id: string) {
    const { oldPassword, newPassword } = data;

    const { password: passwordInDb } = await this._userService.findOne({
      where: {
        id,
        deletedAt: null,
      },
    });

    const isNewPasswordMatchOldPassword = await this._comparePasswords(
      newPassword,
      passwordInDb
    );

    const isOldPasswordMatchOldPasswordInDB = await this._comparePasswords(
      oldPassword,
      passwordInDb
    );

    if (isNewPasswordMatchOldPassword) {
      throw new BadRequestException(
        "The new password must not match the old password."
      );
    }

    if (!isOldPasswordMatchOldPasswordInDB) {
      throw new BadRequestException(
        "The old password must match the old password in db."
      );
    }

    await this._userService.update({
      data: {
        password: await this._hashPassword(newPassword),
      },
      where: {
        id,
      },
    });

    return {
      message: "Password updated successfully",
    };
  }

  async forgotPassword(email: string) {
    const found = await this._userService
      .findOneOrThrow({
        where: {
          email,
          deletedAt: null,
        },
      })
      .catch(() => {
        throw new NotFoundException("Email does not exist");
      });

    // sign for got password token
    const token = this._signPayload({ id: found.id }, FORGOT_TOKEN);
    await Promise.all([
      this._userService.update({
        data: {
          forgetPasswordToken: token,
        },
        where: {
          id: found.id,
        },
      }),
      this._emailService.sendForgotPasswordEmail({
        forgotPasswordToken: token,
        toAddress: email,
        subject: "Forgot password",
      }),
    ]);

    return {
      message: "Check mail to reset password",
    };
  }

  async verifyForgotPassword(token: string) {
    await this._verifyToken(token, FORGOT_TOKEN);
  }

  async resetPassword(data: ResetPasswordDto) {
    const { new_password, forgot_password_token } = data;

    const foundUser = await this._userService
      .findOneOrThrow({
        where: {
          forgetPasswordToken: forgot_password_token,
          deletedAt: null,
        },
      })
      .catch(() => {
        throw new NotFoundException("Token not found");
      });

    const isCurrentPasswordMatchOldPassword = await this._comparePasswords(
      new_password,
      foundUser.password
    );

    if (isCurrentPasswordMatchOldPassword) {
      throw new BadRequestException(
        "The new password must not match the old password."
      );
    }

    await this._userService.update({
      where: {
        id: foundUser.id,
      },
      data: {
        password: await this._hashPassword(new_password),
        forgetPasswordToken: "",
      },
    });

    return {
      message: "Reset password successfully",
    };
  }

  async getStarted(data: GetStartedDto) {
    await this._userService
      .findOneOrThrow({
        where: {
          email: data.email,
          deletedAt: null,
        },
      })
      .catch(() => {
        throw new NotFoundException("The email does not exist.");
      });

    return {
      message: "The email exists",
    };
  }

  async adminLogin(data: JwtAccessPayload) {
    const excludeField = ["password", "createdAt", "updatedAt", "deletedAt"];
    if (!data.isAdmin || data.adminStatus !== AccountStatus.ACTIVE) {
      throw new ForbiddenException(
        "Account is blocked or you are not access to resource"
      );
    }

    Object.keys(data).forEach(
      (key) => excludeField.includes(key) && delete data[key]
    );

    const result = await this.generateTokensForAdmin(data);

    return new HttpSuccessResponse(result);
  }

  async getOwnProfile(id: string) {
    return new HttpSuccessResponse(
      await this._userService
        .findOneOrThrow({
          where: {
            id,
            deletedAt: null,
          },
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        })
        .catch(() => {
          throw new NotFoundException("User not found!");
        })
    );
  }

  /** ============================== Passport ============================== */
  // For local strategy
  async validateUser(email: string, password: string) {
    const user = await this._userService.findUserByEmail(email);

    if (!user || !user.password) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await this._comparePasswords(
      password,
      user.password
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException("Incorrect email or password");
    }

    return user;
  }

  async validatePermissionAdmin(payload: JwtAccessPayload) {
    const { email, isAdmin, adminStatus } = payload;

    if (!isAdmin || adminStatus !== AccountStatus.ACTIVE)
      throw new ForbiddenException(
        "You lack the authorization to access this resource."
      );

    return await this._userService.findUserByEmail(email);
  }

  async validatePermissionUser(payload: JwtAccessPayload) {
    const { email, isUser, userStatus } = payload;

    if (!isUser || userStatus !== AccountStatus.ACTIVE)
      throw new ForbiddenException(
        "You lack the authorization to access this resource."
      );

    return await this._userService.findUserByEmail(email);
  }

  /** ============================== Passport ============================== */

  /** ============================== General ============================== */
  async generateTokensForAdmin(payload: JwtAccessPayload | JwtRefreshPayload) {
    const [accessToken, refreshToken] = await Promise.all([
      this._signPayload(payload, ADMIN_ACCESS_TOKEN),
      this._signPayload({ id: payload.id }, ADMIN_REFRESH_TOKEN),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async generateTokensForUser(payload: JwtAccessPayload | JwtRefreshPayload) {
    const [accessToken, refreshToken] = await Promise.all([
      this._signPayload(payload, ACCESS_TOKEN),
      this._signPayload({ id: payload.id }, REFRESH_TOKEN),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async _hashPassword(password: string) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  private async _comparePasswords(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  private _signPayload(
    payload: JwtAccessPayload | JwtRefreshPayload,
    type: TokenType
  ) {
    return sign(payload, this._jwtKeys[type], this._jwtOptions[type]);
  }

  private async _verifyToken(token: string, type: string) {
    return new Promise<JwtAccessPayload>((resolve, reject) => {
      verify(token, this._jwtKeys[type], (err, decoded) => {
        if (err) {
          throw reject(err);
        }

        resolve(decoded as JwtAccessPayload);
      });
    });
  }

  private _decodeToken(token: string): string | JwtPayload {
    return decode(token);
  }

  /** ============================== General ============================== */
}
