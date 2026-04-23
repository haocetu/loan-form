import { createSupabaseServerClient } from "@/lib/supabaseClient";

export async function fetchLoanApplications(page: number = 1, pageSize: number = 10) {
  const supabase = createSupabaseServerClient();

  // Calculate offset
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("loan_applications")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Error fetching loan applications:", error);
    throw new Error("Failed to fetch applications");
  }

  return {
    data,
    count: count || 0,
    totalPages: count ? Math.ceil(count / pageSize) : 0,
  };
}
