import { createClient } from "@/lib/supabase/client";

export default async function TestSupabase() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("test")
    .select("*");

  return (
    <div className="p-10">
      <h1>Supabase Test</h1>

      <pre>
        {JSON.stringify({ data, error }, null, 2)}
      </pre>
    </div>
  );
}