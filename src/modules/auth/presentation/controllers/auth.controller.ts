import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { LoginUserUseCase } from '../../application/use-cases/login-user.use-case';
import { LogoutUserUseCase } from '../../application/use-cases/logout-user.use-case';

const blacklist = {};

export default class AuthController {

    constructor(
        private readonly createUserUsecase: CreateUserUseCase,
        private readonly loginUserUsecase: LoginUserUseCase,
        private readonly logoutUseCase: LogoutUserUseCase
    ) { }

    public register = async (req, res) => {
        try {
            const response = await this.createUserUsecase.execute(req.body);

            res.status(201).json({
                success: true,
                data: response
            });
        } catch (error) {
            res.status(error?.statusCode ?? 500).json({
                success: false,
                message: error?.message ?? 'Ocorreu um erro ao processar'
            });
        }
    }

    public login = async (req, res) => {
        try {
            const response = await this.loginUserUsecase.execute(req.body);

            res.status(200).json({
                success: true,
                data: response
            });
        } catch (error) {
            res.status(error?.statusCode ?? 500).json({
                success: false,
                message: error?.message ?? 'Ocorreu um erro ao processar'
            });
        }
    }

    public logout = async (req, res) => {
        try {
            const response = await this.logoutUseCase.execute(req);

            res.status(200).json({
                success: true,
                message: response
            });
        } catch (error) {
            res.status(error?.statusCode ?? 500).json({
                success: false,
                message: error?.message ?? 'Ocorreu um erro ao processar'
            });
        }
    }
}
