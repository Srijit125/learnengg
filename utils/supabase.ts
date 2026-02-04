import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.REACT_APP_SUPABASE_URL || "http://127.0.0.1:54321";
const supabaseKey =
  process.env.REACT_APP_SECRET_KEY ||
  "eyJhbGciOiJFUzI1NiIsImtpZCI6ImI4MTI2OWYxLTIxZDgtNGYyZS1iNzE5LWMyMjQwYTg0MGQ5MCIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MjA4NDI1Mzk4NH0.xGvGTqzY9X4xxz88IlIf8VwSg779Z8iaLHdz41NfkL9Gtp7wP4PpPbCGS2xVfmxleqvTa3lhyIxpLiOdocAw9A";

export const supabase = createClient(supabaseUrl!, supabaseKey!);
