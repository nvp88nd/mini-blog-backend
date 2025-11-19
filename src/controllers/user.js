import userService from '../services/userService.js';

function getToken(req) {
    return req.headers.authorization?.replace('Bearer ', '');
}

export async function getUserById(req, res) {
    try {
        const userId = req.params.id;
        const result = await userService.getUserById(userId);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

export async function updateUser(req, res) {
    try {
        const userId = req.params.id;
        const { username, bio } = req.body;
        const avatar = req.file;

        if (!userId || !username || username.trim() === '') {
            return res.status(400).json({ error: "Thiếu thông tin." });
        }

        const jwt = getToken(req);
        const result = await userService.updateUser(userId, username, bio, avatar, jwt);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}