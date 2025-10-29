import { supabase } from "../services/supabase.js";

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
    const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .single();

    if (error) return res.status(400).json({ error: error.message });

    const { data: comments } = await supabase
        .from("comments")
        .select("*")
        .eq("post_id", id)
        .order("created_at", { ascending: true });
    res.json({ ...data, comments });
};