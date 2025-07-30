import { CreateSupplyUseCase } from '../../application/use-cases/create-supply.use-case';
import { DeleteSupplyUseCase } from '../../application/use-cases/delete-supply.use-case';
import { FindAllSuppliesUseCase } from '../../application/use-cases/find-all-supplies.use-case';
import { FindSupplyUseCase } from '../../application/use-cases/find-supply.use-case';
import { UpdateSupplyUseCase } from '../../application/use-cases/update-supply.use-case';

export default class SupplyController {
    constructor(
        private readonly createSupplyUseCase: CreateSupplyUseCase,
        private readonly updateSupplyUseCase: UpdateSupplyUseCase,
        private readonly findAllSuppliesUseCase: FindAllSuppliesUseCase,
        private readonly findSupplyUseCase: FindSupplyUseCase,
        private readonly deleteSupplyUseCase: DeleteSupplyUseCase
    ) {}

    public create = async (req, res) => {
        try {
            const response = await this.createSupplyUseCase.execute(req.body);
            
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
            const supplyData = { ...req.body, id: parseInt(req.params.id) };
            const response = await this.updateSupplyUseCase.execute(supplyData);
            
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
            const supplyId = req.params.id;

            if (supplyId) {
                const response = await this.findSupplyUseCase.execute({ id: parseInt(supplyId) });
                return res.status(200).json({
                    success: true,
                    data: response
                });
            }

            const response = await this.findAllSuppliesUseCase.execute();
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
            const supplyId = parseInt(req.params.id);
            await this.deleteSupplyUseCase.execute(supplyId);
            
            res.status(200).json({
                success: true,
                message: 'Insumo deletado com sucesso'
            });
        } catch (error) {
            res.status(error?.statusCode ?? 500).json({
                success: false,
                message: error?.message ?? 'Ocorreu um erro ao processar'
            });
        }
    }
}
