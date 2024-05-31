export class JwtAccessPayload {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  isAdmin: string;
  adminStatus?: string;
  userStatus?: string;
  isUser: string;
}
