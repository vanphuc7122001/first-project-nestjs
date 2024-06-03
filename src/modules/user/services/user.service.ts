import * as bcrypt from "bcryptjs";

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { AccountStatus } from "./../../auth/enums";
import { BaseQueryParams } from "@common/dtos";
import { BlockAccountDto } from "../dtos";
import { CreateSubadminDto } from "../dtos";
import { Prisma } from "@prisma/client";
import { UserRepository } from "../repositories";

@Injectable()
export class UserSerivce {
  constructor(private readonly _userRepository: UserRepository) {}

  async createSubadmin(data: CreateSubadminDto) {
    const { email, password, firstName, lastName } = data;
    const foundUser = await this.findUserByEmail(email);

    if (foundUser) {
      throw new ConflictException("The email is already exists");
    }

    const salt = await bcrypt.genSalt(10);

    await this.create({
      email,
      firstName,
      lastName,
      password: await bcrypt.hash(password, salt),
      adminStatus: AccountStatus.ACTIVE,
      userStatus: AccountStatus.BLOCK,
      isAdmin: false,
      isSubAdmin: true,
      isUser: false,
    });

    return {
      message: "Create subadmin successfully",
    };
  }

  async blockSubaAdminOrUser(data: BlockAccountDto) {
    const { type, id } = data;

    const account = await this.findOneOrThrow({ where: { id } }).catch(() => {
      throw new NotFoundException("Account not found");
    });

    if (type === "sub-admin" && account.isSubAdmin) {
      await this.update({
        where: {
          id,
        },
        data: {
          adminStatus: AccountStatus.BLOCK,
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
      message: "Block account successfully",
    };
  }

  async unBlockSubaAdminOrUser(data: BlockAccountDto) {
    const { type, id } = data;

    const account = await this.findOneOrThrow({ where: { id } }).catch(() => {
      throw new NotFoundException("Account not found");
    });

    if (type === "sub-admin" && account.isSubAdmin) {
      await this.update({
        where: {
          id,
        },
        data: {
          adminStatus: AccountStatus.ACTIVE,
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
      message: "UnBlock account successfully",
    };
  }

  async removeAccount(id: string) {
    await Promise.all([
      this.findOneOrThrow({
        where: {
          id,
        },
      }).catch(() => {
        throw new NotFoundException("User not found");
      }),
      this.update({
        where: {
          id,
        },
        data: {
          deletedAt: new Date(),
        },
      }),
    ]);

    return {
      message: "Deleted successfully!",
    };
  }

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

  async create(data: Prisma.UserCreateInput) {
    return await this._userRepository.create(data);
  }

  async update(params: Prisma.UserUpdateArgs) {
    return await this._userRepository.update(params);
  }
}
