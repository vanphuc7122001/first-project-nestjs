import { AuthGuard } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { LOCAL_STRATEGY } from "../strategies";

@Injectable()
export class LocalAuthGuard extends AuthGuard(LOCAL_STRATEGY) {}
