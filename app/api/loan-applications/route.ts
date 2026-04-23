import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseClient";

interface LoanApplicationPayload {
  full_name?: string;
  phone?: string;
  living_area?: string;
  job_type?: string;
  monthly_income?: string;
  income_method?: string;
  debt_history?: string;
  loan_amount?: number;
}

const MAX_TEXT_LENGTH = 100;
const MAX_LOAN_AMOUNT = 1000000000; // VNĐ

/**
 * POST /api/loan-applications
 *
 * Receives loan application form data, validates required fields,
 * and inserts a new row into the Supabase "loan_applications" table.
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body: LoanApplicationPayload;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Dữ liệu gửi lên không hợp lệ (invalid JSON)." },
        { status: 400 }
      );
    }

    const {
      full_name,
      phone,
      living_area,
      job_type,
      monthly_income,
      income_method,
      debt_history,
      loan_amount,
    } = body;

    // --- Server-side validation ---
    const errors: string[] = [];

    if (!full_name || typeof full_name !== "string" || !full_name.trim()) {
      errors.push("Họ tên (full_name) là bắt buộc.");
    } else if (full_name.trim().length > MAX_TEXT_LENGTH) {
      errors.push(`Họ tên tối đa ${MAX_TEXT_LENGTH} ký tự.`);
    }

    if (!phone || typeof phone !== "string" || !phone.trim()) {
      errors.push("Số điện thoại (phone) là bắt buộc.");
    } else if (!/^[0-9]{9,11}$/.test(phone.trim())) {
      errors.push("Số điện thoại không hợp lệ (9-11 chữ số).");
    }

    if (!living_area || typeof living_area !== "string" || !living_area.trim()) {
      errors.push("Khu vực sinh sống (living_area) là bắt buộc.");
    } else if (living_area.trim().length > MAX_TEXT_LENGTH) {
      errors.push(`Khu vực sinh sống tối đa ${MAX_TEXT_LENGTH} ký tự.`);
    }

    if (!job_type || typeof job_type !== "string" || !job_type.trim()) {
      errors.push("Loại hình công việc (job_type) là bắt buộc.");
    } else if (job_type.trim().length > MAX_TEXT_LENGTH) {
      errors.push(`Loại hình công việc tối đa ${MAX_TEXT_LENGTH} ký tự.`);
    }

    if (
      !monthly_income ||
      typeof monthly_income !== "string" ||
      !monthly_income.trim()
    ) {
      errors.push("Thu nhập bình quân (monthly_income) là bắt buộc.");
    } else if (monthly_income.trim().length > MAX_TEXT_LENGTH) {
      errors.push(`Thu nhập bình quân tối đa ${MAX_TEXT_LENGTH} ký tự.`);
    }

    if (
      !income_method ||
      typeof income_method !== "string" ||
      !income_method.trim()
    ) {
      errors.push("Hình thức nhận thu nhập (income_method) là bắt buộc.");
    } else if (income_method.trim().length > MAX_TEXT_LENGTH) {
      errors.push(`Hình thức nhận thu nhập tối đa ${MAX_TEXT_LENGTH} ký tự.`);
    }

    if (
      !debt_history ||
      typeof debt_history !== "string" ||
      !debt_history.trim()
    ) {
      errors.push("Lịch sử nợ (debt_history) là bắt buộc.");
    } else if (debt_history.trim().length > MAX_TEXT_LENGTH) {
      errors.push(`Lịch sử nợ tối đa ${MAX_TEXT_LENGTH} ký tự.`);
    }

    if (loan_amount === null || loan_amount === undefined) {
      errors.push("Số tiền mong muốn vay (loan_amount) là bắt buộc.");
    } else if (
      typeof loan_amount !== "number" ||
      isNaN(loan_amount) ||
      loan_amount <= 0
    ) {
      errors.push("Số tiền vay phải là số lớn hơn 0");
    } else if (loan_amount > MAX_LOAN_AMOUNT) {
      errors.push(`Số tiền vay tối đa là 1 tỷ VNĐ.`);
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
      .from("loan_applications")
      .insert({
        full_name: full_name!.trim(),
        phone: phone!.trim(),
        living_area: living_area!.trim(),
        job_type: job_type!.trim(),
        monthly_income: monthly_income!.trim(),
        income_method: income_method!.trim(),
        debt_history: debt_history!.trim(),
        loan_amount: loan_amount!,
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
        application: data,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Unexpected error in POST /api/loan-applications:", err);
    return NextResponse.json(
      { error: "Lỗi hệ thống. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
