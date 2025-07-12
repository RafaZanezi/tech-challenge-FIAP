export default class AuthController {
    static async login(body: any ): Promise<string> {
        // Logic for user authentication
        if (body.username === 'admin' && body.password === 'password') {
            return 'Login successful';
        } else {
            throw new Error('Invalid credentials');
        }
    }

    static async logout(): Promise<string> {
        // Logic for user logout
        return 'Logout successful';
    }
}