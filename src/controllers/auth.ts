import { Request, Response } from 'express';
import { User } from "../entities/auth-user";
import { UserGateway } from "../gateways/user";
import { DatabaseConnection } from "../interfaces/connection";
import { UserGatewayInterface } from "../interfaces/gateways";
import { AuthPresenter } from "../presenters/auth";
import { verifyAndReturnError } from "../presenters/verify-and-return-error";
import { UserUseCases } from "../usecases/user";
import { AuthenticatedRequest, addToBlacklist } from "../api/middlewares";

export class AuthController {
    private dbConnection: DatabaseConnection;
    private userGateway: UserGatewayInterface;
    private userUseCase: UserUseCases;

    constructor(dbConnection: DatabaseConnection) {
        this.dbConnection = dbConnection;
        this.userGateway = new UserGateway(this.dbConnection);
        this.userUseCase = new UserUseCases(this.userGateway);
    }

    public register = async (req: Request, res: Response) => {
        try {
            const { name, password, role } = req.body;

            if (!name || !password || !role) {
                const presenter = new AuthPresenter();
                presenter.presentBadRequest('Nome, senha e função são obrigatórios');
                return res.status(presenter.getStatusCode()).send(presenter.getResponse());
            }

            const result = await this.userUseCase.registerUser(name, password, role);

            const presenter = new AuthPresenter();
            presenter.presentRegister(result.user, result.token);

            res.status(presenter.getStatusCode()).send(presenter.getResponse());
        } catch (error) {
            verifyAndReturnError(error, res);
        }
    }

    public login = async (req: Request, res: Response) => {
        try {
            const { name, password } = req.body;

            if (!name || !password) {
                const presenter = new AuthPresenter();
                presenter.presentBadRequest('Nome e senha são obrigatórios');
                return res.status(presenter.getStatusCode()).send(presenter.getResponse());
            }

            const result = await this.userUseCase.loginUser(name, password);

            const presenter = new AuthPresenter();
            presenter.presentLogin(result.user, result.token);

            res.status(presenter.getStatusCode()).send(presenter.getResponse());
        } catch (error) {
            verifyAndReturnError(error, res);
        }
    }

    public logout = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const token = req.headers["authorization"]?.replace("Bearer ", "");
            
            if (token) {
                addToBlacklist(token);
            }

            const presenter = new AuthPresenter();
            presenter.presentLogout();

            res.status(presenter.getStatusCode()).send(presenter.getResponse());
        } catch (error) {
            verifyAndReturnError(error, res);
        }
    }

    public profile = async (req: AuthenticatedRequest, res: Response) => {
        try {
            if (!req.user?.id) {
                const presenter = new AuthPresenter();
                presenter.presentUnauthorized('Usuário não autenticado');
                return res.status(presenter.getStatusCode()).send(presenter.getResponse());
            }

            const user = await this.userUseCase.getUserById(parseInt(req.user.id));

            const presenter = new AuthPresenter();
            presenter.presentProfile(user);

            res.status(presenter.getStatusCode()).send(presenter.getResponse());
        } catch (error) {
            verifyAndReturnError(error, res);
        }
    }
}