import { CreateClientUseCase } from '../../application/use-cases/create-client.use-case';
import { DeleteClientUseCase } from '../../application/use-cases/delete-client.use-case';
import { FindAllClientsUseCase } from '../../application/use-cases/find-all-clients.use-case';
import { FindClientsUseCase } from '../../application/use-cases/find-client.use-case';
import { UpdateClientUseCase } from '../../application/use-cases/update-client.use-case';

export default class ClientController {
    constructor(
        private readonly createClientUseCase: CreateClientUseCase,
        private readonly updateClientUseCase: UpdateClientUseCase,
        private readonly findAllClientsUseCase: FindAllClientsUseCase,
        private readonly findClientUseCase: FindClientsUseCase,
        private readonly deleteClientUseCase: DeleteClientUseCase
    ) {}

    public create = async (req, res) => {
        try {
            const response = await this.createClientUseCase.execute(req.body);
            
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

    public update = async (req, res) => {
        try {
            const response = await this.updateClientUseCase.execute({ ...req.body, id: parseInt(req.params.id) });

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

    public find = async (req, res) => {
        try {
            const clientId = req.params.id;

            if (clientId) {
                const response = await this.findClientUseCase.execute({ id: clientId });
                return res.status(200).json({
                    success: true,
                    data: response
                });
            }

            const response = await this.findAllClientsUseCase.execute();
            return res.status(200).json({
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

    public delete = async (req, res) => {
        try {
            const clientId = req.params.id;
            await this.deleteClientUseCase.execute({ id: parseInt(clientId) });
            
            res.status(200).json({
                success: true,
                message: 'Cliente deletado com sucesso'
            });
        } catch (error) {
            res.status(error?.statusCode ?? 500).json({
                success: false,
                message: error?.message ?? 'Ocorreu um erro ao processar'
            });
        }
    }

}
