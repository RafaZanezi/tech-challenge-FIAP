import { User } from '../../../../entities/user';

export interface AuthRepository {
  registerUser(name: string, password: string, role: string): Promise<User>;
  loginUser(name: string, password: string): Promise<User>;
}
