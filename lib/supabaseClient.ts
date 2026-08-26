import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://rhyywqdnjpffdjosinmq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoeXl3cWRuanBmZmRqb3Npbm1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1NzQ5OTYsImV4cCI6MjEwMzE1MDk5Nn0.txbkh_7wOrpY2EB-mO72Hv5GZcNEjgIpMHw8bglHvHc";

export const supabase = createClient(supabaseUrl, supabaseKey);