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

export class AdminService {
    async checkAdminRole(token) {
        const supa = supabaseWithAuth(token);
        const { data: { user }, error } = await supa.auth.getUser(token);

        if (error || !user) {
            throw new Error("Không thể xác thực người dùng");
        }

        const { data: profile } = await supa
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (profile?.role !== "admin") {
            throw new Error("Bạn không có quyền truy cập");
        }

        return true;
    }

    async getDashboardStats(token) {
        await this.checkAdminRole(token);

        const { count: totalUsers } = await supabase
            .from("profiles")
            .select("*", { count: "exact", head: true });

        const { count: totalPosts } = await supabase
            .from("posts")
            .select("*", { count: "exact", head: true });

        const { count: totalComments } = await supabase
            .from("comments")
            .select("*", { count: "exact", head: true });

        const { data: recentPosts } = await supabase
            .from("posts_with_all")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(5);

        return {
            totalUsers: totalUsers || 0,
            totalPosts: totalPosts || 0,
            totalComments: totalComments || 0,
            recentPosts: recentPosts || []
        };
    }

    async getAllUsers(token) {
        await this.checkAdminRole(token);

        const { data, error } = await supabase
            .from("profiles")
            .select(`
                id,
                username,
                email,
                avatar_url,
                role,
                is_active,
                created_at
            `)
            .order("created_at", { ascending: false });

        if (error) throw error;
        return data;
    }

    async getAllPostsAdmin(token) {
        await this.checkAdminRole(token);

        const { data, error } = await supabase
            .from("posts_with_all")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;
        return data;
    }

    async deleteUser(userId, token) {
        await this.checkAdminRole(token);
        const supa = supabaseWithAuth(token);

        // Xóa tất cả bài viết của user
        const { data: posts } = await supa
            .from("posts")
            .select("id, post_images(image_url)")
            .eq("author_id", userId);

        // Xóa ảnh từ storage
        if (posts) {
            for (const post of posts) {
                if (post.post_images?.length) {
                    for (const img of post.post_images) {
                        const path = img.image_url.split('/storage/v1/object/public/post-images/')[1];
                        if (path) {
                            await supa.storage.from("post-images").remove([path]);
                        }
                    }
                }
            }
        }

        // Xóa user (cascade sẽ xóa posts và comments)
        const { error } = await supa
            .from("profiles")
            .delete()
            .eq("id", userId);

        if (error) throw error;
        return true;
    }

    async deletePost(postId, token) {
        await this.checkAdminRole(token);
        const supa = supabaseWithAuth(token);

        // Lấy thông tin ảnh
        const { data: post } = await supa
            .from("posts")
            .select("post_images(image_url)")
            .eq("id", postId)
            .single();

        // Xóa ảnh từ storage
        if (post?.post_images?.length) {
            for (const img of post.post_images) {
                const path = img.image_url.split('/storage/v1/object/public/post-images/')[1];
                if (path) {
                    await supa.storage.from("post-images").remove([path]);
                }
            }
        }

        // Xóa bài viết
        const { error } = await supa
            .from("posts")
            .delete()
            .eq("id", postId);

        if (error) throw error;
        return true;
    }

    async toggleUserStatus(userId, token) {
        await this.checkAdminRole(token);
        const supa = supabaseWithAuth(token);

        const { data: user } = await supa
            .from("profiles")
            .select("is_active")
            .eq("id", userId)
            .single();
        console.log(!user.is_active);
        const { data, error } = await supa
            .from("profiles")
            .update({ is_active: !user.is_active })
            .eq("id", userId)
            .select()
            .maybeSingle();
        console.log(data);
        if (error) throw error;
        return data;
    }
}

export default new AdminService();