import { UserRole } from "./types";

export interface JwtPayload {
  id: string;
  email: string;
  role: UserRole;
}