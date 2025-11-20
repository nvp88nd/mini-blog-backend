import commentService from "../services/commentService.js";

function getToken(req) {
    return req.headers.authorization?.replace('Bearer ', '');
}

export async function getCommentsByPostId(req, res) {
    const { postId } = req.params;
    try {
        const { data, error } = await commentService.getCommentsByPostId(postId);
        if (error) {
            return res.status(400).json({ error: error.message });
        }
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function createComment(req, res) {
    const { postId, content } = req.body;
    const token = getToken(req);

    if (!postId || !content) {
        return res.status(400).json({ error: "Thiếu thông tin." });
    }

    try {
        const comment = await commentService.createComment(postId, content, token);
        return res.status(201).json({ message: 'Thêm bình luận thành công!', ...comment });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function deleteComment(req, res) {
    const { id } = req.params;
    const token = getToken(req);

    try {
        const result = await commentService.deleteComment(id, token);
        return res.status(200).json({ message: 'Xóa bình luận thành công!', ...result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}