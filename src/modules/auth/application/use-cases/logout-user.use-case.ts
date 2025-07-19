import { UseCase } from '../../../../shared/application/interfaces/use-case.interface';

const blacklist: { [key: string]: boolean } = {};

export class LogoutUserUseCase implements UseCase<null, string> {
    public async execute(request): Promise<string> {
        const token = request.headers.authorization.replace('Bearer ', '');

        blacklist[token] = true;
        setTimeout(() => delete blacklist[token], parseInt(process.env.JWT_EXPIRES) * 1000);

        return 'Logout succeeded';
    }
}
