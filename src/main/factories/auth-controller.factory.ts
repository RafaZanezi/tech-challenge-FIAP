import AuthController from "../../modules/auth/presentation/controllers/auth.controller";
import { CreateUserUseCase } from "../../modules/auth/application/use-cases/create-user.use-case";
import { LoginUserUseCase } from "../../modules/auth/application/use-cases/login-user.use-case";
import { PostgresAuthRepository } from "../../modules/auth/infrastructure/repositories/postgres-auth.repository";
import { LogoutUserUseCase } from "../../modules/auth/application/use-cases/logout-user.use-case";

export function makeAuthController(): AuthController {
  const userRepository = new PostgresAuthRepository();
  const createUserUseCase = new CreateUserUseCase(userRepository);
  const loginUserUseCase = new LoginUserUseCase(userRepository);
  const logoutUseCase = new LogoutUserUseCase();

  const authController = new AuthController(createUserUseCase, loginUserUseCase, logoutUseCase);

  return authController;
}

