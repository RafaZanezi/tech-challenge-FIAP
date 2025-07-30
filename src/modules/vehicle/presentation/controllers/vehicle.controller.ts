
import { CreateVehicleUseCase } from '../../application/use-cases/create-vehicle.use-case';
import { DeleteVehicleUseCase } from '../../application/use-cases/delete-vehicle.use-case';
import { FindAllVehiclesUseCase } from '../../application/use-cases/find-all-vehicles.use-case';
import { FindVehicleUseCase } from '../../application/use-cases/find-vehicle.use-case';
import { UpdateVehicleUseCase } from '../../application/use-cases/update-vehicle.use-case';

export default class VehicleController {
    constructor(
        private readonly createVehicleUseCase: CreateVehicleUseCase,
        private readonly updateVehicleUseCase: UpdateVehicleUseCase,
        private readonly findAllVehiclesUseCase: FindAllVehiclesUseCase,
        private readonly findVehicleUseCase: FindVehicleUseCase,
        private readonly deleteVehicleUseCase: DeleteVehicleUseCase
    ) {}

    public create = async (req, res) => {
        try {
            const response = await this.createVehicleUseCase.execute(req.body);
            
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
            const vehicleData = { ...req.body, id: parseInt(req.params.id) };
            const response = await this.updateVehicleUseCase.execute(vehicleData);
            
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
            const vehicleId = req.params.id;

            if (vehicleId) {
                const response = await this.findVehicleUseCase.execute({ id: parseInt(vehicleId) });
                return res.status(200).json({
                    success: true,
                    data: response
                });
            }

            const response = await this.findAllVehiclesUseCase.execute();
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
            const vehicleId = parseInt(req.params.id);
            await this.deleteVehicleUseCase.execute(vehicleId);
            
            res.status(200).json({
                success: true,
                message: 'Veículo deletado com sucesso'
            });
        } catch (error) {
            res.status(error?.statusCode ?? 500).json({
                success: false,
                message: error?.message ?? 'Ocorreu um erro ao processar'
            });
        }
    }
}
