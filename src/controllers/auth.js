import authService from "../services/authService.js";

export async function register(req, res) {
    try {
        const { email, password, username } = req.body;
        const result = await authService.register(email, password, username);
        res.status(201).json({
            message: "Đăng ký thành công.",
            ...result
        });
    } catch (error) {
        const statusCode = error.message.includes("đã tồn tại") ? 400 : 500;
        res.status(statusCode).json({ error: error.message });
    }
}

export async function login(req, res) {
    try {
        const { email, password } = req.body;
        const result = await authService.login(email, password);
        res.status(200).json({
            message: "Đăng nhập thành công.",
            ...result
        });
    } catch (error) {
        const statusCode = error.message.includes("không đúng") ? 401 : 500;
        res.status(statusCode).json({ error: error.message });
    }
}

export async function logout(req, res) {
    try {
        const result = await authService.logout();
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

export async function getMe(req, res) {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        const result = await authService.getCurrentUser(token);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}