import { supabaseWithAuth } from "../utils/supabaseClient.js";

export const checkAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace("Bearer ", "");
        if (!token) {
            return res.status(401).json({ error: "Missing token" });
        }

        const supa = supabaseWithAuth(token);
        const { data: profile, error } = await supa
            .from("profiles")
            .select("role")
            .eq("id", (await supa.auth.getUser()).data.user.id)
            .single();

        if (error) throw error;

        if (profile.role !== "admin") {
            return res.status(403).json({ error: "Access denied: Admin only" });
        }

        next();
    } catch (err) {
        res.status(403).json({ error: err.message });
    }
};
