import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseClient";

interface ContactPayload {
  full_name?: string;
  phone?: string;
  email?: string | null;
  loan_amount?: number | null;
  note?: string | null;
}

/**
 * POST /api/contacts
 *
 * Receives contact form data, validates required fields,
 * and inserts a new row into the Supabase "contacts" table.
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body: ContactPayload;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Dữ liệu gửi lên không hợp lệ (invalid JSON)." },
        { status: 400 }
      );
    }

    const { full_name, phone, email, loan_amount, note } = body;

    // --- Server-side validation ---
    const errors: string[] = [];

    if (!full_name || typeof full_name !== "string" || !full_name.trim()) {
      errors.push("Họ tên (full_name) là bắt buộc.");
    }

    if (!phone || typeof phone !== "string" || !phone.trim()) {
      errors.push("Số điện thoại (phone) là bắt buộc.");
    } else if (!/^[0-9]{9,11}$/.test(phone.trim())) {
      errors.push("Số điện thoại không hợp lệ (9-11 chữ số).");
    }

    if (loan_amount !== null && loan_amount !== undefined) {
      if (typeof loan_amount !== "number" || isNaN(loan_amount) || loan_amount < 0) {
        errors.push("Số tiền vay (loan_amount) phải là số dương.");
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: errors.join(" "), details: errors },
        { status: 400 }
      );
    }

    // --- Insert into Supabase ---
    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
      .from("contacts")
      .insert({
        full_name: full_name!.trim(),
        phone: phone!.trim(),
        email: email?.trim() || null,
        loan_amount: loan_amount ?? null,
        note: typeof note === "string" ? note.trim() || null : null,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "Không thể lưu thông tin. Vui lòng thử lại sau." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Đăng ký thành công!",
        contact: data,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Unexpected error in POST /api/contacts:", err);
    return NextResponse.json(
      { error: "Lỗi hệ thống. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
