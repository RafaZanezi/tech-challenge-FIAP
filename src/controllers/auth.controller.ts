import bcrypt from 'bcrypt';
import database from '../config/database';

export default class AuthController {
    static readonly register = async (req, res) => {
        const { name, role, password } = req.body;

        if (!name || !role || !password) {
            return res.status(400).json({ message: 'Nome, função e senha são obrigatórios' });
        }

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);

        try {
            const verifyDuplicity = await database.query('select * from users where name = $1 and role = $2', [name, role]);

            if (verifyDuplicity.rows.length > 0) {
                return res.status(400).json({ message: 'Nome de usuário já existe, faça login para continuar' });
            }

            const result = await database.query('insert into users (name, password, role) values ($1, $2, $3)', [name, hashedPassword, role]);

            if (result.rowCount === 0) {
                return res.status(400).json({ message: 'Erro ao registrar usuário' });
            }

            return res.status(201).json({ message: 'Usuário registrado com sucesso' });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    static readonly login = async (req, res) => {
        const { name, password } = req.body;

        if (!name || !password) {
            return res.status(400).json({ message: 'Informe nome e senha para fazer login' });
        }

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);
        console.log(hashedPassword);

        try {
            const result = await database.query('select * from users where name = $1', [name]);

            if (result.rows.length === 0) {
                return res.status(400).json({ message: 'Usuário não encontrado' });
            }

            const user = result.rows[0];

            const passwordMatched = await bcrypt.compare(password, user.password);

            if (!passwordMatched) {
                return res.status(400).json({ message: 'Senha incorreta' });
            }

            // retornar aqui o token JWT
            return res.status(200).json({ message: 'Login bem-sucedido' });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    static async logout(): Promise<string> {
        // Logic for user logout
        return 'Logout successful';
    }
}