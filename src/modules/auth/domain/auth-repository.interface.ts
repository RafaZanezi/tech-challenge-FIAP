import { User } from './user.entity';

export interface AuthRepository {
  registerUser(name: string, password: string, role: string): Promise<User>;
  loginUser(name: string, password: string): Promise<User>;
}