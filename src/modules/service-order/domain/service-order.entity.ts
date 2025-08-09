import { Entity } from "../../../shared/domain/entities/entity";
import { ServiceOrderStatus } from "../../../shared/domain/enums/service-order-status.enum";
import { ValidationError } from "../../../shared/domain/errors/domain-errors";
import { Service } from "../../service/domain/service.entity";
import { Supply } from "../../supply/domain/supply.entity";

export interface ServiceOrderProps {
    clientId: number;
    vehicleId: number;
    services: Service[];
    supplies: Supply[];
    createdAt: Date;
    finalizedAt: Date;
    status: ServiceOrderStatus;
    totalServicePrice: number;
}

export class ServiceOrder extends Entity<number> {

    get clientId(): number {
        return this.props.clientId;
    }

    get vehicleId(): number {
        return this.props.vehicleId;
    }

    get services(): Service[] {
        return this.props.services;
    }

    get supplies(): Supply[] {
        return this.props.supplies;
    }

    get createdAt(): Date {
        return this.props.createdAt;
    }

    get finalizedAt(): Date {
        return this.props.finalizedAt;
    }

    get status(): ServiceOrderStatus {
        return this.props.status;
    }

    get totalServicePrice(): number {
        return this.props.totalServicePrice;
    }

    private readonly props: ServiceOrderProps;

    constructor(props: ServiceOrderProps, id?: number) {
        super(id);
        this.validate(props);
        this.props = props;
    }

    public startDiagnosis() {
        if (this.props.status !== ServiceOrderStatus.RECEIVED) {
            throw new ValidationError('A ordem de serviço deve estar recebida para iniciar o diagnóstico');
        }

        this.props.status = ServiceOrderStatus.IN_DIAGNOSIS;
    }

    public updateServices(services: Partial<Service[]>) {
        if (this.props.status !== ServiceOrderStatus.IN_DIAGNOSIS) {
            throw new ValidationError('A ordem de serviço deve estar em diagnóstico para atualizar os serviços');
        }

        this.props.services = services;
    }

    public updateSupplies(supplies: Partial<Supply[]>) {
        if (this.props.status !== ServiceOrderStatus.IN_DIAGNOSIS) {
            throw new ValidationError('A ordem de serviço deve estar em diagnóstico para atualizar os suprimentos');
        }

        this.props.supplies = supplies;
    }

    public submitForApproval() {
        if (this.props.status !== ServiceOrderStatus.IN_DIAGNOSIS) {
            throw new ValidationError('A ordem de serviço deve estar em diagnóstico para ser submetida para aprovação');
        }

        this.props.status = ServiceOrderStatus.WAITING_FOR_APPROVAL;
    }

    public approveOrder() {
        if (this.props.status !== ServiceOrderStatus.WAITING_FOR_APPROVAL) {
            throw new ValidationError('A ordem de serviço deve estar aguardando aprovação para ser aprovada');
        }

        this.props.status = ServiceOrderStatus.APPROVED;
    }

    public startExecution() {
        if (this.props.status !== ServiceOrderStatus.APPROVED) {
            throw new ValidationError('A ordem de serviço deve estar aprovada para iniciar a execução');
        }

        this.props.status = ServiceOrderStatus.IN_PROGRESS;
    }

    public finalizeOrder() {
        if (this.props.status !== ServiceOrderStatus.IN_PROGRESS) {
            throw new ValidationError('A ordem de serviço deve estar em andamento para ser finalizada');
        }

        this.props.status = ServiceOrderStatus.FINISHED;
        this.props.finalizedAt = new Date();
    }

    public deliverOrder() {
        if (this.props.status !== ServiceOrderStatus.FINISHED) {
            throw new ValidationError('A ordem de serviço deve estar finalizada para ser entregue');
        }

        this.props.status = ServiceOrderStatus.DELIVERED;
    }

    public cancelOrder() {
        this.props.status = ServiceOrderStatus.CANCELLED;
    }

    public toJSON() {
        return {
            id: this._id,
            clientId: this.props.clientId,
            vehicleId: this.props.vehicleId,
            services: this.props.services,
            supplies: this.props.supplies,
            createdAt: this.props.createdAt,
            finalizedAt: this.props.finalizedAt,
            status: this.props.status,
        };
    }

    private validate(props: ServiceOrderProps): void {
        if (!props.clientId) {
            throw new ValidationError('ID do cliente é obrigatório');
        }

        if (!props.vehicleId) {
            throw new ValidationError('ID do veículo é obrigatório');
        }

        if (!props.services || props.services.length === 0) {
            throw new ValidationError('Serviços são obrigatórios');
        }

        if (!props.createdAt) {
            throw new ValidationError('Data de criação é obrigatória');
        }
    }
}