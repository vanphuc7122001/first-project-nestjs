import { Injectable } from "@nestjs/common";
import { UserRepository } from "../repositories";

@Injectable()
export class UserSerivce {
  constructor(private readonly _userRepository: UserRepository) {}

  async findUserByEmail(email: string) {
    return await this._userRepository.findOne({
      where: {
        email,
      },
    });
  }
}
