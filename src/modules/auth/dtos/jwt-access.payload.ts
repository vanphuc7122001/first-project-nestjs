export class JwtAccessPayload {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  isAdmin: boolean;
  adminStatus?: string;
  userStatus?: string;
  isUser: boolean;
}
