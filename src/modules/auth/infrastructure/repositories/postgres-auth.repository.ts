import bcrypt from 'bcrypt';
import database from "../../../../main/config/database";
import { BadRequestError } from "../../../../shared/domain/errors/http-errors";
import { User } from "../../domain/user.entity";
import { AuthRepository } from '../../domain/auth-repository.interface';

export class PostgresAuthRepository implements AuthRepository {
    async registerUser(name: string, password: string, role: string): Promise<User> {
        const verifyDuplicate = await database.query('SELECT * FROM users WHERE name = $1', [name]);

        if (verifyDuplicate.rows.length > 0) {
            throw new BadRequestError('User already exists');
        }

        const result = await database.query(
            'INSERT INTO users (name, password, role) VALUES ($1, $2, $3) RETURNING *',
            [name, password, role]
        );

        const dbUser = {
            id: result.rows[0].id,
            name: result.rows[0].name,
            role: result.rows[0].role
        };

        return new User(dbUser, result.rows[0].id);
    }

    async loginUser(name: string, password: string): Promise<User> {
        const result = await database.query('SELECT * FROM users WHERE name = $1', [name]);

        if (result.rows.length === 0) {
            throw new BadRequestError('User not found');
        }

        const user = result.rows[0];

        const passwordMatched = await bcrypt.compare(password, user.password);

        if (!passwordMatched) {
            throw new BadRequestError('Invalid credentials');
        }

        const dbUser = {
            id: result.rows[0].id,
            name: result.rows[0].name,
            role: result.rows[0].role
        };

        return new User(dbUser, result.rows[0].id);
    }
}