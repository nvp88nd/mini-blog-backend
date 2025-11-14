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

export class PostService {
    async getUserPosts(userId) {
        const { data, error } = await supabase.rpc("get_user_posts", { uid: userId });
        return { data, error };
    }

    async createPost(userId, title, content, user_jwt) {
        const supa = supabaseWithAuth(user_jwt);
        const { data, error } = await supa
            .from("posts")
            .insert([{
                author_id: userId,
                title,
                content
            }])
            .select()
            .single();
        if (error) {
            throw error;
        }
        return data;
    };

    async editPost(postId, title, content, user_jwt) {
        const supa = supabaseWithAuth(user_jwt);
        const { data, error } = await supa
            .from("posts")
            .update({
                title,
                content
            })
            .eq('id', postId)
            .select()
            .single();
        if (error) {
            throw error;
        }
        return data;
    };

    async uploadImages(userId, files, postId, user_jwt) {
        const supa = supabaseWithAuth(user_jwt);
        const uploadedUrls = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const ext = file.originalname.split('.').pop();
            const fileName = `${userId}/${Date.now()}_${i}.${ext}`;

            const { error: uploadError } = await supa.storage
                .from("post-images")
                .upload(fileName, file.buffer, {
                    contentType: file.mimetype,
                    upsert: false,
                });
            if (uploadError) {
                console.error('uploadImages: storage upload error for', fileName, uploadError);
                continue;
            }

            const { data: { publicUrl }, } = supa.storage.from("post-images").getPublicUrl(fileName);

            uploadedUrls.push({
                post_id: postId,
                image_url: publicUrl,
                order: i
            });
        }
        if (uploadedUrls.length > 0) {
            const { error } = await supa
                .from("post_images")
                .insert(uploadedUrls);
            if (error) {
                throw error;
            }
        }
        return { data: uploadedUrls };
    };

    async deleteImage(id, user_jwt) {
        const supa = supabaseWithAuth(user_jwt);
        const { data: img, error: imgErr } = await supa
            .from("post_images")
            .select("image_url")
            .eq("id", id)
            .single();
        if (imgErr) {
            throw imgErr;
        }
        if (!img) {
            throw new Error("Không tìm thấy ảnh!");
        }

        await this.deleteImageInStorage(img, user_jwt);

        const { error: errDel } = await supa
            .from("post_images")
            .delete()
            .eq('id', id);
        if (errDel) {
            throw errDel;
        }

        return true;
    };

    async deleteImageInStorage(img, user_jwt) {
        const supa = supabaseWithAuth(user_jwt);
        if (img.image_url.startsWith(`${process.env.SUPABASE_URL}/storage/v1/object/public/`)) {
            const path = img.image_url.split('/storage/v1/object/public/post-images/')[1];
            if (path) {
                const { error: storageErr } = await supa.storage
                    .from("post-images")
                    .remove([path]);
                if (storageErr && storageErr.message) {
                    throw new Error(`Lỗi lưu trữ: ${storageErr.message}`);
                }
            }
        }
    };

    async deletePost(id, user_jwt) {
        const supa = supabaseWithAuth(user_jwt);
        const { data: post, error: postErr } = await supa
            .from("posts")
            .select(`post_images (
                    id,
                    image_url
                )`
            )
            .eq('id', id)
            .single();
        if (postErr) {
            throw imgErr;
        }
        if (post?.post_images?.length) {
            for (const img of post.post_images) {
                await this.deleteImageInStorage(img, user_jwt)
            }
        }
        const { error } = await supa.from("posts").delete().eq('id', id);
        if (error) {
            throw error;
        }
        return true;
    };
}

export default new PostService();