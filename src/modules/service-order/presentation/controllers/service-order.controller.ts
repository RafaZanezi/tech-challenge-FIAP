import { ServiceOrderStatus } from '../../../../shared/domain/enums/service-order-status.enum';
import { CreateOSUseCase } from '../../application/use-cases/create-os.use-case';
import { FindAllOSUseCase } from '../../application/use-cases/find-all-os.use-case';
import { FindOSUseCase } from '../../application/use-cases/find-os.use-case';
import { UpdateOSUseCase } from '../../application/use-cases/update-os.use-case';
import { UpdateServicesAndSuppliesUseCase } from '../../application/use-cases/update-services-and-supplies.use-case';

export default class ServiceOrderController { 
    constructor(
        private readonly createOSUseCase: CreateOSUseCase,
        private readonly updateOSUseCase: UpdateOSUseCase,
        private readonly updateServicesAndSuppliesUseCase: UpdateServicesAndSuppliesUseCase,
        private readonly findAllOSUseCase: FindAllOSUseCase,
        private readonly findOSUseCase: FindOSUseCase
    ) { }

    public create = async (req, res) => {
        try {
            const response = await this.createOSUseCase.execute(req.body);

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

    public find = async (req, res) => {
        try {
            const osId = req.params.id;

            if (osId) {
                const response = await this.findOSUseCase.execute({ id: parseInt(osId) });
                return res.status(200).json({
                    success: true,
                    data: response
                });
            }

            const response = await this.findAllOSUseCase.execute();
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

    public startDiagnosis = async (req, res) => {
        try {
            const { id } = req.params;

            const response = await this.updateOSUseCase.execute({
                id,
                status: ServiceOrderStatus.IN_DIAGNOSIS
            });

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
            const response = await this.updateServicesAndSuppliesUseCase.execute({id: req.params.id, ...req.body});

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

    public submitForApproval = async (req, res) => {
        try {
            const { id } = req.params;

            const response = await this.updateOSUseCase.execute({
                id,
                status: ServiceOrderStatus.WAITING_FOR_APPROVAL
            });

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

    public approve = async (req, res) => {
        try {
            const { id } = req.params;

            const response = await this.updateOSUseCase.execute({
                id,
                status: ServiceOrderStatus.APPROVED
            });

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

    public startExecution = async (req, res) => {
        try {
            const { id } = req.params;

            const response = await this.updateOSUseCase.execute({
                id,
                status: ServiceOrderStatus.IN_PROGRESS
            });

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

    public finalize = async (req, res) => {
        try {
            const { id } = req.params;

            const response = await this.updateOSUseCase.execute({
                id,
                status: ServiceOrderStatus.FINISHED,
                finishedAt: new Date()
            });

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

    public deliver = async (req, res) => {
        try {
            const { id } = req.params;

            const response = await this.updateOSUseCase.execute({
                id,
                status: ServiceOrderStatus.DELIVERED
            });

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

    public cancel = async (req, res) => {
        try {
            const { id } = req.params;

            const response = await this.updateOSUseCase.execute({
                id,
                status: ServiceOrderStatus.CANCELLED,
                finishedAt: new Date()
            });

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
}
