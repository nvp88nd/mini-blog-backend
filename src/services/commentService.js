import { createClient } from "@supabase/supabase-js";
import { supabase } from "./supabase.js";

function supabaseWithAuth(token) {
    return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
        global: {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        }
    });
}

export class CommentService {
    async getCommentsByPostId(postId) {
        const { data, error } = await supabase
            .from("comments_with_user")
            .select("*")
            .eq("post_id", postId)
            .order("created_at", { ascending: true });

        return { data, error };
    }

    async createComment(postId, content, user_jwt) {
        const supa = supabaseWithAuth(user_jwt);

        // Lấy thông tin user từ JWT
        const { data: { user }, error: userError } = await supa.auth.getUser(user_jwt);
        if (userError || !user) {
            throw new Error("Không thể xác thực người dùng.");
        }

        const { data, error } = await supa
            .from("comments")
            .insert([{
                post_id: postId,
                author_id: user.id,
                content: content.trim()
            }])
            .select(`
                *,
                profiles:author_id (
                    id,
                    username,
                    avatar_url
                )
            `)
            .single();

        if (error) {
            throw error;
        }

        // Format lại data để phù hợp với frontend
        return {
            id: data.id,
            content: data.content,
            created_at: data.created_at,
            user: {
                id: data.profiles.id,
                username: data.profiles.username,
                avatar_url: data.profiles.avatar_url
            }
        };
    }

    async deleteComment(commentId, user_jwt) {
        const supa = supabaseWithAuth(user_jwt);

        // Kiểm tra quyền sở hữu
        const { data: comment, error: fetchError } = await supa
            .from("comments")
            .select("author_id")
            .eq("id", commentId)
            .single();

        if (fetchError) {
            throw new Error("Không tìm thấy bình luận.");
        }

        const { data: { user }, error: userError } = await supa.auth.getUser(user_jwt);
        if (userError || !user) {
            throw new Error("Không thể xác thực người dùng.");
        }

        if (comment.author_id !== user.id) {
            throw new Error("Bạn không có quyền xóa bình luận này.");
        }

        const { error } = await supa
            .from("comments")
            .delete()
            .eq("id", commentId);

        if (error) {
            throw error;
        }

        return { success: true };
    }
}

export default new CommentService();