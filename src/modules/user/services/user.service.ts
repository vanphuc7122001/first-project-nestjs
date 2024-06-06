import * as bcrypt from "bcryptjs";

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { AccountStatus } from "./../../auth/enums";
import { BaseQueryParams } from "@common/dtos";
import { BlockAccountDto } from "../dtos";
import { CreateSalerDto } from "../dtos";
import { Prisma } from "@prisma/client";
import { USER_ERRORS } from "src/content/errors";
import { USER_SUCCESS } from "src/content/succeses";
import { UserRepository } from "../repositories";

@Injectable()
export class UserSerivce {
  constructor(private readonly _userRepository: UserRepository) {}

  /** ============================== CRUD ============================== */
  async createSaler(data: CreateSalerDto) {
    const { email, password, firstName, lastName } = data;
    const foundUser = await this.findUserByEmail(email);

    if (foundUser) {
      throw new ConflictException(USER_ERRORS.USER_02.message);
    }

    const salt = await bcrypt.genSalt(10);

    const result = await this.create(
      {
        email,
        firstName,
        lastName,
        password: await bcrypt.hash(password, salt),
        adminStatus: AccountStatus.INACTIVE,
        userStatus: AccountStatus.INACTIVE,
        isAdmin: false,
        isSaler: true,
        isUser: false,
        salerStatus: AccountStatus.ACTIVE,
      },
      {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      }
    );

    return {
      ...result,
    };
  }

  async blockSalerOrUser(data: BlockAccountDto) {
    const { type, id } = data;

    const account = await this.findOneOrThrow({ where: { id } }).catch(() => {
      throw new NotFoundException(USER_ERRORS.USER_01.message);
    });

    if (type === "saler" && account.isSaler) {
      await this.update({
        where: {
          id,
        },
        data: {
          salerStatus: AccountStatus.BLOCK,
        },
      });
    } else if (type === "user" && account.isUser) {
      await this.update({
        where: {
          id,
        },
        data: {
          userStatus: AccountStatus.BLOCK,
        },
      });
    }

    return {
      message: USER_SUCCESS.BLOCK_ACCOUNT,
    };
  }

  async unBlockSalerOrUser(data: BlockAccountDto) {
    const { type, id } = data;

    const account = await this.findOneOrThrow({ where: { id } }).catch(() => {
      throw new NotFoundException(USER_ERRORS.USER_01.message);
    });

    if (type === "saler" && account.isSaler) {
      await this.update({
        where: {
          id,
        },
        data: {
          salerStatus: AccountStatus.ACTIVE,
        },
      });
    } else if (type === "user" && account.isUser) {
      await this.update({
        where: {
          id,
        },
        data: {
          userStatus: AccountStatus.BLOCK,
        },
      });
    }

    return {
      success: true,
    };
  }

  async removeAccount(id: string) {
    await this.findOneOrThrow({
      where: {
        id,
      },
    }).catch(() => {
      throw new NotFoundException(USER_ERRORS.USER_01.message);
    }),
      await this.update({
        where: {
          id,
        },
        data: {
          deletedAt: new Date(),
        },
      });

    return {};
  }

  /** ============================== Func general ============================== */

  async findAll(query: BaseQueryParams) {
    const { page = 1, limit = 10, search } = query;

    const [count, data] = await Promise.all([
      this._userRepository.count({
        where: {
          email: {
            contains: search,
          },
          deletedAt: null,
        },
      }),
      this._userRepository.findMany({
        where: {
          email: {
            contains: search,
          },
          deletedAt: null,
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      count,
      data,
    };
  }

  async findOne(params: Prisma.UserFindFirstArgs) {
    return await this._userRepository.findOne(params);
  }

  async findUserByEmail(email: string) {
    return await this._userRepository.findOne({
      where: {
        email,
        deletedAt: null,
      },
    });
  }

  async findUserById(id: string) {
    return await this._userRepository.findOne({
      where: {
        id,
      },
    });
  }

  async findOneOrThrow(params: Prisma.UserFindFirstOrThrowArgs) {
    return this._userRepository.findOneOrThrow(params);
  }

  async create(data: Prisma.UserCreateInput, select?: Prisma.UserSelect) {
    return await this._userRepository.create(data, select);
  }

  async update(params: Prisma.UserUpdateArgs) {
    return await this._userRepository.update(params);
  }
}
