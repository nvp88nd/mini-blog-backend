import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const key = process.env.SUPABASE_KEY;
if (!key) {
    console.warn("SUPABASE key is not set. Please set SUPABASE_SERVICE_ROLE_KEY or SUPABASE_KEY in .env");
}

export const supabase = createClient(
    process.env.SUPABASE_URL,
    key
);
