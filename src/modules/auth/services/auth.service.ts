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

import { AUTH_ERRORS } from "src/content/errors";
import { AUTH_SUCCESS } from "src/content/succeses";
import { AccountStatus } from "../enums";
import { AuthQueueService } from "./auth-queue.service";
import { CONFIG_VAR } from "@config/index";
import { ConfigService } from "@nestjs/config";
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
    private readonly _authQueueService: AuthQueueService
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
      throw new ConflictException(AUTH_ERRORS.AUTH_01.message);
    }

    const user = await this._userService.create({
      email,
      firstName,
      lastName,
      adminStatus: AccountStatus.INACTIVE,
      userStatus: AccountStatus.ACTIVE,
      isAdmin: false,
      isUser: true,
      isSaler: false,
      password: await this._hashPassword(password),
      salerStatus: AccountStatus.INACTIVE,
    });

    const excludeField = ["password", "createdAt", "updatedAt", "deletedAt"];

    Object.keys(user).forEach(
      (key) => excludeField.includes(key) && delete user[key]
    );

    const { accessToken, refreshToken } = await this.generateTokensForUser(
      user
    );

    return { accessToken, refreshToken };
  }

  /**
   * Login user with email and password
   */
  async userLogin(data: JwtAccessPayload) {
    const excludeField = ["password", "createdAt", "updatedAt", "deletedAt"];

    if (!data.isUser || data.userStatus !== AccountStatus.ACTIVE) {
      throw new ForbiddenException(AUTH_ERRORS.AUTH_02.message);
    }

    Object.keys(data).forEach(
      (key) => excludeField.includes(key) && delete data[key]
    );

    const result = await this.generateTokensForUser(data);

    return new HttpSuccessResponse(result);
  }

  async salerLogin(data: JwtAccessPayload) {
    const excludeField = ["password", "createdAt", "updatedAt", "deletedAt"];

    if (!data.isSaler || data.salerStatus !== AccountStatus.ACTIVE) {
      throw new ForbiddenException(AUTH_ERRORS.AUTH_02.message);
    }

    Object.keys(data).forEach(
      (key) => excludeField.includes(key) && delete data[key]
    );

    const { accessToken, refreshToken } = await this.generateTokensForUser(
      data
    );

    return { accessToken, refreshToken };
  }

  async userRefreshToken(refresh: string) {
    const verifyToken = await this._verifyToken(refresh, ACCESS_TOKEN);

    const foundUser = await this._userService.findOne({
      where: {
        id: (verifyToken as JwtPayload).id,
        deletedAt: null,
      },
    });

    if (!foundUser) {
      throw new UnauthorizedException(AUTH_ERRORS.AUTH_03.message);
    }

    if (!foundUser.isUser || foundUser.userStatus !== AccountStatus.ACTIVE) {
      throw new ForbiddenException(AUTH_ERRORS.AUTH_04.message);
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
      isSaler: foundUser.isSaler,
      salerStatus: foundUser.salerStatus,
    };

    const accessToken = this._signPayload(payload, ACCESS_TOKEN);

    return {
      accessToken,
    };
  }

  async adminRefreshToken(data: RefreshTokenDto) {
    const verifyToken = await this._verifyToken(
      data.refresh,
      ADMIN_REFRESH_TOKEN
    );

    const foundUser = await this._userService.findOne({
      where: {
        id: (verifyToken as JwtPayload).id,
        deletedAt: null,
      },
    });

    if (!foundUser) {
      throw new UnauthorizedException(AUTH_ERRORS.AUTH_03.message);
    }

    if (!foundUser.isAdmin || foundUser.adminStatus !== AccountStatus.ACTIVE) {
      throw new ForbiddenException(AUTH_ERRORS.AUTH_04.message);
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
      isSaler: foundUser.isSaler,
      salerStatus: foundUser.salerStatus,
    };

    const accessToken = this._signPayload(payload, ADMIN_ACCESS_TOKEN);

    return {
      accessToken,
    };
  }

  async salerRefreshToken(data: RefreshTokenDto) {
    const verifyToken = await this._verifyToken(data.refresh, REFRESH_TOKEN);

    const foundUser = await this._userService.findOne({
      where: {
        id: (verifyToken as JwtPayload).id,
        deletedAt: null,
      },
    });

    if (!foundUser) {
      throw new UnauthorizedException(AUTH_ERRORS.AUTH_03.message);
    }

    if (!foundUser.isSaler || foundUser.salerStatus !== AccountStatus.ACTIVE) {
      throw new ForbiddenException(AUTH_ERRORS.AUTH_04.message);
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
      isSaler: foundUser.isSaler,
      salerStatus: foundUser.salerStatus,
    };

    const accessToken = this._signPayload(payload, ACCESS_TOKEN);

    return {
      accessToken,
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
      throw new BadRequestException(AUTH_ERRORS.AUTH_05.message);
    }

    if (!isOldPasswordMatchOldPasswordInDB) {
      throw new BadRequestException(AUTH_ERRORS.AUTH_06.message);
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
      success: true,
    };
  }

  async forgotPassword(email: string) {
    const foundUser = await this._userService.findOne({
      where: {
        email,
        deletedAt: null,
      },
    });

    if (!foundUser) {
      throw new NotFoundException(AUTH_ERRORS.AUTH_07.message);
    }

    // sign for got password token
    const token = this._signPayload({ id: foundUser.id }, FORGOT_TOKEN);
    await Promise.all([
      this._userService.update({
        data: {
          forgetPasswordToken: token,
        },
        where: {
          id: foundUser.id,
        },
      }),
      this._authQueueService.addJobSendForgotPasswordMail(token, email), // handle after
    ]);

    return {
      success: true,
    };
  }

  async verifyForgotPassword(token: string) {
    const result = await this._verifyToken(token, FORGOT_TOKEN);
    return result;
  }

  async resetPassword(data: ResetPasswordDto) {
    const { new_password, forgot_password_token } = data;

    const foundUser = await this._userService.findOne({
      where: {
        forgetPasswordToken: forgot_password_token,
        deletedAt: null,
      },
    });

    if (!foundUser) {
      throw new NotFoundException(AUTH_ERRORS.AUTH_08.message);
    }

    const isCurrentPasswordMatchOldPassword = await this._comparePasswords(
      new_password,
      foundUser.password
    );

    if (isCurrentPasswordMatchOldPassword) {
      throw new BadRequestException(AUTH_ERRORS.AUTH_05.message);
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
      success: true,
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
        throw new NotFoundException(AUTH_ERRORS.AUTH_07.message);
      });

    return {
      success: true,
    };
  }

  async adminLogin(data: JwtAccessPayload) {
    const excludeField = ["password", "createdAt", "updatedAt", "deletedAt"];
    if (!data.isAdmin || data.adminStatus !== AccountStatus.ACTIVE) {
      throw new ForbiddenException(AUTH_ERRORS.AUTH_02.message);
    }

    Object.keys(data).forEach(
      (key) => excludeField.includes(key) && delete data[key]
    );

    const { accessToken, refreshToken } = await this.generateTokensForAdmin(
      data
    );

    return { accessToken, refreshToken };
  }

  async getOwnProfile(id: string) {
    const result = await this._userService.findOne({
      where: {
        id,
        deletedAt: null,
      },
      select: {
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    if (!result) {
      throw new NotFoundException(AUTH_ERRORS.AUTH_09.message);
    }

    return result;
  }

  /** ============================== Passport ============================== */
  // For local strategy
  async validateUser(email: string, password: string) {
    const user = await this._userService.findUserByEmail(email);

    if (!user || !user.password) {
      throw new UnauthorizedException(AUTH_ERRORS.AUTH_10.message);
    }

    const isPasswordValid = await this._comparePasswords(
      password,
      user.password
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException(AUTH_ERRORS.AUTH_11.message);
    }

    return user;
  }

  async validatePermissionAdmin(payload: JwtAccessPayload) {
    const { email, isAdmin, adminStatus } = payload;

    if (!isAdmin || adminStatus !== AccountStatus.ACTIVE) {
      throw new ForbiddenException(AUTH_ERRORS.AUTH_12.message);
    }

    return await this._userService.findUserByEmail(email);
  }

  async validatePermissionUser(payload: JwtAccessPayload) {
    const { email, isUser, userStatus } = payload;

    if (!isUser || userStatus !== AccountStatus.ACTIVE) {
      throw new ForbiddenException(AUTH_ERRORS.AUTH_12.message);
    }

    return await this._userService.findUserByEmail(email);
  }

  async validatePermissionSaler(payload: JwtAccessPayload) {
    const { email, isSaler, salerStatus } = payload;

    console.log("is saler", isSaler, "saler status", salerStatus);
    if (!isSaler || salerStatus !== AccountStatus.ACTIVE) {
      throw new ForbiddenException(AUTH_ERRORS.AUTH_12.message);
    }

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
