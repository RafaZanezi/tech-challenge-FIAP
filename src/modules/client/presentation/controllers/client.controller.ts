import { CreateClientUseCase } from '../../application/use-cases/create-client.use-case';

export default class ClientController {
    constructor(
        private createClientUseCase: CreateClientUseCase
    ) {}

}
