export class Vehicle {
    public licensePlate: string;
    public brand: string;
    public model: string;
    public year: number;
    public clientId: string;

    public isValidPlate(): boolean {
        // Implement logic to validate the vehicle plate
        return true; // Simplified example
    }
}
