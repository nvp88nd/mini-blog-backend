import adminService from "../services/adminService.js";

function getToken(req) {
    return req.headers.authorization?.replace('Bearer ', '');
}

export async function getDashboardStats(req, res) {
    const token = getToken(req);
    try {
        const stats = await adminService.getDashboardStats(token);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function getAllUsers(req, res) {
    const token = getToken(req);
    try {
        const users = await adminService.getAllUsers(token);
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function getAllPostsAdmin(req, res) {
    const token = getToken(req);
    try {
        const posts = await adminService.getAllPostsAdmin(token);
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function deleteUserById(req, res) {
    const { id } = req.params;
    const token = getToken(req);
    try {
        await adminService.deleteUser(id, token);
        res.json({ message: "Đã xóa người dùng thành công" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function deletePostById(req, res) {
    const { id } = req.params;
    const token = getToken(req);
    try {
        await adminService.deletePost(id, token);
        res.json({ message: "Đã xóa bài viết thành công" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function toggleUserStatus(req, res) {
    const { id } = req.params;
    const token = getToken(req);
    try {
        const user = await adminService.toggleUserStatus(id, token);
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}