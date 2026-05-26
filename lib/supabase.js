import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lxgaiwzyyayzenowesta.supabase.co';
const supabaseAnonKey = 'sb_publishable_CsT9IrqtqisHqDYwQ5ph_A_jxlovO_d';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);