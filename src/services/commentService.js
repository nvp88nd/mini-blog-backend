import { createClient } from "@supabase/supabase-js";
import { supabase } from "./supabase.js";

function supabaseWithAuth(token) {
    return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
        global: {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        }
    })
}

export class CommentService {
    async getCommentsByPostId(postId) {
        const { data, error } = await supabase
            .from("comments")
            .select(`
                id,
                content,
                created_at,
                user:author_id (
                    id,
                    username,
                    avatar_url
                )
            `)
            .eq("post_id", postId)
            .order("created_at", { ascending: true });

        if (error) throw error;
        return data;
    }

    async createComment(postId, authorId, content, token) {
        const supa = supabaseWithAuth(token);

        // Tạo comment
        const { data: comment, error: commentError } = await supa
            .from("comments")
            .insert([{
                post_id: postId,
                author_id: authorId,
                content: content.trim()
            }])
            .select(`
                id,
                content,
                created_at,
                user:author_id (
                    id,
                    username,
                    avatar_url
                )
            `)
            .single();

        if (commentError) throw commentError;

        // Cập nhật comment_count cho post
        await this.updatePostCommentCount(postId);

        return comment;
    }

    async deleteComment(commentId, userId, token) {
        const supa = supabaseWithAuth(token);

        // Kiểm tra quyền sở hữu
        const { data: comment } = await supa
            .from("comments")
            .select("author_id, post_id")
            .eq("id", commentId)
            .single();

        if (!comment) {
            throw new Error("Không tìm thấy bình luận");
        }

        if (comment.author_id !== userId) {
            throw new Error("Bạn không có quyền xóa bình luận này");
        }

        // Xóa comment
        const { error } = await supa
            .from("comments")
            .delete()
            .eq("id", commentId);

        if (error) throw error;

        // Cập nhật comment_count
        await this.updatePostCommentCount(comment.post_id);

        return true;
    }

    async updateComment(commentId, userId, content, token) {
        const supa = supabaseWithAuth(token);

        // Kiểm tra quyền sở hữu
        const { data: comment } = await supa
            .from("comments")
            .select("author_id")
            .eq("id", commentId)
            .single();

        if (!comment) {
            throw new Error("Không tìm thấy bình luận");
        }

        if (comment.author_id !== userId) {
            throw new Error("Bạn không có quyền chỉnh sửa bình luận này");
        }

        // Cập nhật comment
        const { data: updatedComment, error } = await supa
            .from("comments")
            .update({ content: content.trim() })
            .eq("id", commentId)
            .select(`
                id,
                content,
                created_at,
                user:author_id (
                    id,
                    username,
                    avatar_url
                )
            `)
            .single();

        if (error) throw error;
        return updatedComment;
    }

    async updatePostCommentCount(postId) {
        const { count } = await supabase
            .from("comments")
            .select("*", { count: "exact", head: true })
            .eq("post_id", postId);

        await supabase
            .from("posts")
            .update({ comment_count: count || 0 })
            .eq("id", postId);
    }
}

export default new CommentService();