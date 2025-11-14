import { supabase } from "../services/supabase.js";
import postService from "../services/postService.js";

function getToken(req) {
    return req.headers.authorization?.replace('Bearer ', '');
}

export async function getAllPosts(req, res) {
    const { data, error } = await supabase
        .from("posts_with_all")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
};

export async function getPostById(req, res) {
    const { id } = req.params;
    const { data, error } = await supabase.rpc("get_post_by_id", { p_id: id });
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
};

export async function getUserPosts(req, res) {
    const { id } = req.params;
    try {
        const { data, error } = await postService.getUserPosts(id);
        if (error) {
            return res.status(400).json({ error: error.message });
        }
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function createPost(req, res) {
    const { userId, title, content } = req.body;
    const images = req.files || [];
    const token = getToken(req);

    if (!userId || !content) {
        return res.status(400).json({ error: "Thiếu thông tin." });
    }

    try {
        const post = await postService.createPost(userId, title, content, token);
        if (images.length > 10) {
            return res.status(400).json({ error: "Bạn chỉ có thể tải lên tối đa 10 ảnh." });
        }
        const { data: uploadedImages } = await postService.uploadImages(userId, images, post.id, token);
        return res.status(200).json({ message: 'Tạo bài viết thành công!', ...post, images: uploadedImages || [] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function editPost(req, res) {
    const { id } = req.params;
    const { userId, title, content } = req.body;
    const images = req.files || [];
    const token = getToken(req);

    if (!userId || !content) {
        return res.status(400).json({ error: "Thiếu thông tin." });
    }

    try {
        const post = await postService.editPost(id, title, content, token);
        const { data: uploadedImages } = await postService.uploadImages(userId, images, post.id, token);
        return res.status(200).json({ message: 'Chỉnh sửa bài viết thành công!', ...post, images: uploadedImages || [] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function deletePost(req, res) {
    const { id } = req.params;
    const token = getToken(req);

    try {
        const data = await postService.deletePost(id, token);
        return res.status(200).json({ ...data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function deleteImage(req, res) {
    const { id } = req.params;
    const token = getToken(req);

    try {
        const result = await postService.deleteImage(id, token);
        return res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}