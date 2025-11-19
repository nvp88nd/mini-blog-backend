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

export class UserService {
    async getUserById(userId) {
        const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        if (error) {
            throw new Error("Không thể lấy thông tin người dùng.");
        }
        return {
            id: profileData.id,
            email: profileData.email,
            username: profileData.username,
            avatar_url: profileData.avatar_url,
            bio: profileData.bio || null,
            created_at: profileData.created_at
        };
    }

    async updateUser(userId, username, bio, file_avatar, user_jwt) {
        const supa = supabaseWithAuth(user_jwt);

        let avatarUrl = null;

        if (file_avatar) {
            const ext = file_avatar.originalname.split('.').pop();
            const fileName = `${userId}/avatar_${Date.now()}.${ext}`;

            const { error: uploadError } = await supa.storage
                .from("avatars")
                .upload(fileName, file_avatar.buffer, {
                    contentType: file_avatar.mimetype,
                    upsert: true,
                });

            if (uploadError) {
                console.error("updateUser: avatar upload error", uploadError);
                throw uploadError;
            }

            const { data: { publicUrl } } = supa
                .storage
                .from("avatars")
                .getPublicUrl(fileName);

            avatarUrl = publicUrl;
        }

        const updateData = {};
        if (username !== undefined) updateData.username = username;
        if (bio !== undefined) updateData.bio = bio;
        if (avatarUrl) updateData.avatar_url = avatarUrl;

        const { data, error } = await supa
            .from("profiles")
            .update(updateData)
            .eq("id", userId)
            .select()
            .single();

        if (error) {
            console.error("updateUser: update profiles error", error);
            throw error;
        }

        return { data };
    }

}

export default new UserService();