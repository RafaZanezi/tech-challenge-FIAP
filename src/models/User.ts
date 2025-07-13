import { UserRole } from "../enums/user-role.enum";

export class User {
    id: number;
    name: string;
    role: UserRole;
}