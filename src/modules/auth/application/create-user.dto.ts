import { UserRole } from "../../../shared/domain/enums/user-role.enum";

export interface CreateUserRequest {
  name: string;
  role: UserRole;
  password: string;
}

export interface CreateUserResponse {
  id: number;
  role: UserRole;
  name: string;
}
