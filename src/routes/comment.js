import express from "express";
import { supabase } from "../services/supabase.js";

const router = express.Router();

router.post("/", async (req, res) => {
    const { post_id, author_id, content } = req.body;

    const { data, error } = await supabase
        .from("comments")
        .insert([{ post_id, author_id, content }])
        .select();

    if (error) return res.status(400).json({ error: error.message });
    res.json(data[0]);
});

export default router;
