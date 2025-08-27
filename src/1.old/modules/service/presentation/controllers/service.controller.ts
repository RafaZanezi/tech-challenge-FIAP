import { CreateServiceUseCase } from '../../application/use-cases/create-service.use-case';
import { DeleteServiceUseCase } from '../../application/use-cases/delete-service.use-case';
import { FindAllServicesUseCase } from '../../application/use-cases/find-all-services.use-case';
import { FindServiceUseCase } from '../../application/use-cases/find-service.use-case';
import { UpdateServiceUseCase } from '../../application/use-cases/update-service.use-case';

export default class ServiceController {
    constructor(
        private readonly createServiceUseCase: CreateServiceUseCase,
        private readonly updateServiceUseCase: UpdateServiceUseCase,
        private readonly findAllServicesUseCase: FindAllServicesUseCase,
        private readonly findServiceUseCase: FindServiceUseCase,
        private readonly deleteServiceUseCase: DeleteServiceUseCase
    ) {}

    public create = async (req, res) => {
        try {
            const response = await this.createServiceUseCase.execute(req.body);
            
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
            const serviceData = { ...req.body, id: parseInt(req.params.id) };
            const response = await this.updateServiceUseCase.execute(serviceData);
            
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
            const serviceId = req.params.id;

            if (serviceId) {
                const response = await this.findServiceUseCase.execute({ id: parseInt(serviceId) });
                return res.status(200).json({
                    success: true,
                    data: response
                });
            }

            const response = await this.findAllServicesUseCase.execute();
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
            const serviceId = parseInt(req.params.id);
            await this.deleteServiceUseCase.execute(serviceId);
            
            res.status(200).json({
                success: true,
                message: 'Serviço deletado com sucesso'
            });
        } catch (error) {
            res.status(error?.statusCode ?? 500).json({
                success: false,
                message: error?.message ?? 'Ocorreu um erro ao processar'
            });
        }
    }
}
