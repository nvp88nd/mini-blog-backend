import { supabase } from "./supabase.js";

export class AuthService {
    async register(email, password, username) {
        if (!email || !password || !username) {
            throw new Error("Email, password, và username là bắt buộc.");
        }
        if (password.length < 6) {
            throw new Error("Mật khẩu phải có ít nhất 6 ký tự.");
        }
        if (username.length < 3) {
            throw new Error("Tên người dùng phải có ít nhất 3 ký tự.");
        }

        const existingUser = await supabase
            .from('profiles')
            .select('username')
            .eq('username', username)
            .single();
        if (existingUser.data) {
            throw new Error("Tên người dùng đã tồn tại.");
        }

        const { data: authData, error: signUpError } = await supabase.auth.signUp({
            email,
            password
        });
        if (signUpError) {
            throw new Error(signUpError.message);
        }

        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .insert([{
                id: authData.user.id,
                username: username,
                avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`,
                email: email
            }])
            .select()
            .single();
        if (profileError) {
            throw new Error(profileError.message);
        }

        return {
            user: {
                id: authData.user.id,
                email: authData.user.email,
                username: profileData.username,
                avatar_url: profileData.avatar_url
            },
            session: authData.session
        }
    }

    async login(email, password) {
        if (!email || !password) {
            throw new Error("Email và mật khẩu là bắt buộc.");
        }
        const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (signInError) {
            throw new Error('Email hoặc mật khẩu không đúng.');
        }

        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();
        if (profileError) {
            throw new Error("Không thể lấy thông tin người dùng.");
        }

        return {
            user: {
                id: authData.user.id,
                email: authData.user.email,
                username: profileData.username,
                avatar_url: profileData.avatar_url
            },
            session: authData.session
        };
    }

    async logout() {
        const { error } = await supabase.auth.signOut();
        if (error) {
            throw new Error(error.message);
        }
        return true;
    }

    async getCurrentUser(token) {
        if (!token) {
            throw new Error("Token không hợp lệ.");
        }

        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (!user || error) {
            throw new Error("Token không hợp lệ hoặc đã hết hạn.");
        }

        const { data: profileData, profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
        if (profileError) {
            throw new Error("Không thể lấy thông tin người dùng.");
        }

        return {
            id: user.id,
            email: user.email,
            username: profileData.username,
            avatar_url: profileData.avatar_url
        };
    }

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
}

export default new AuthService();