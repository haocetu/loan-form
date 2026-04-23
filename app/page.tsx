"use client";

import { useState, type FormEvent, type ChangeEvent } from "react";
import Image from "next/image";
import logoImg from "../images/logo.png";
import bannerImg from "../images/shfinance_mini.png";

/* ──────────── Types ──────────── */

interface FormData {
  full_name: string;
  phone: string;
  living_area: string;
  living_area_other: string;
  job_type: string;
  job_type_other: string;
  monthly_income: string;
  monthly_income_other: string;
  income_method: string;
  income_method_other: string;
  debt_history: string;
  debt_history_other: string;
  loan_amount: string;
}

interface FormErrors {
  full_name?: string;
  phone?: string;
  living_area?: string;
  living_area_other?: string;
  job_type?: string;
  job_type_other?: string;
  monthly_income?: string;
  monthly_income_other?: string;
  income_method?: string;
  income_method_other?: string;
  debt_history?: string;
  debt_history_other?: string;
  loan_amount?: string;
}

type SubmitStatus = "idle" | "loading" | "success" | "error";

/* ──────────── Constants ──────────── */

const MAX_TEXT_LENGTH = 100;
const MAX_PHONE_LENGTH = 11;
const MAX_LOAN_AMOUNT = 1000000000;

/* ──────────── Radio Options ──────────── */

const LIVING_AREA_OPTIONS = [
  "Thành phố Hồ Chí Minh",
  "Thành phố Hà Nội",
  "Thành phố Đà Nẵng",
];

const JOB_TYPE_OPTIONS = [
  "Làm việc hưởng lương (Công ty, cơ quan nhà nước,...)",
  "Kinh doanh tự do / Chủ doanh nghiệp",
];

const MONTHLY_INCOME_OPTIONS = ["Dưới 8 triệu", "Trên 8 triệu"];

const INCOME_METHOD_OPTIONS = ["Chuyển khoản qua ngân hàng", "Tiền mặt"];

const DEBT_HISTORY_OPTIONS = [
  "Chưa bao giờ (Thanh toán đúng hạn)",
  "Đã từng trễ hạn dưới 10 ngày",
  "Đã từng trễ hạn trên 30 ngày / Có nợ xấu",
  "Tôi chưa từng vay vốn ở đâu",
];

/* ──────────── Initial state ──────────── */

const INITIAL_FORM: FormData = {
  full_name: "",
  phone: "",
  living_area: "",
  living_area_other: "",
  job_type: "",
  job_type_other: "",
  monthly_income: "",
  monthly_income_other: "",
  income_method: "",
  income_method_other: "",
  debt_history: "",
  debt_history_other: "",
  loan_amount: "",
};

/* ──────────── Component ──────────── */

export default function HomePage() {
  const [formData, setFormData] = useState<FormData>({ ...INITIAL_FORM });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  /* ── Helpers ── */

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;

    let newValue = value;
    if (name === "loan_amount") {
      // Remove non-digit characters and format with dots
      const digits = value.replace(/\D/g, "");
      newValue = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    setFormData((prev) => ({ ...prev, [name]: newValue }));

    // Clear field error on change
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function handleRadio(field: keyof FormData, value: string) {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      // Clear "other" text when switching away from "Mục khác"
      if (value !== "__other__") {
        next[`${field}_other` as keyof FormData] = "";
      }
      return next;
    });

    // Clear errors
    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
      [`${field}_other`]: undefined,
    }));
  }

  /* ── Validation ── */

  function validate(): boolean {
    const e: FormErrors = {};

    // 1. Họ và tên
    if (!formData.full_name.trim()) {
      e.full_name = "Vui lòng nhập";
    } else if (formData.full_name.trim().length > MAX_TEXT_LENGTH) {
      e.full_name = `Tối đa ${MAX_TEXT_LENGTH} ký tự`;
    }

    // 2. Số điện thoại
    if (!formData.phone.trim()) {
      e.phone = "Vui lòng nhập";
    } else if (!/^[0-9]{9,11}$/.test(formData.phone.trim())) {
      e.phone = "Số điện thoại không hợp lệ (9-11 chữ số)";
    }

    // 3. Khu vực sinh sống
    if (!formData.living_area) {
      e.living_area = "Vui lòng chọn";
    } else if (formData.living_area === "__other__") {
      if (!formData.living_area_other.trim()) {
        e.living_area_other = "Vui lòng nhập";
      } else if (formData.living_area_other.trim().length > MAX_TEXT_LENGTH) {
        e.living_area_other = `Tối đa ${MAX_TEXT_LENGTH} ký tự`;
      }
    }

    // 4. Loại hình công việc
    if (!formData.job_type) {
      e.job_type = "Vui lòng chọn";
    } else if (formData.job_type === "__other__") {
      if (!formData.job_type_other.trim()) {
        e.job_type_other = "Vui lòng nhập";
      } else if (formData.job_type_other.trim().length > MAX_TEXT_LENGTH) {
        e.job_type_other = `Tối đa ${MAX_TEXT_LENGTH} ký tự`;
      }
    }

    // 5. Thu nhập bình quân
    if (!formData.monthly_income) {
      e.monthly_income = "Vui lòng chọn";
    } else if (formData.monthly_income === "__other__") {
      if (!formData.monthly_income_other.trim()) {
        e.monthly_income_other = "Vui lòng nhập";
      } else if (
        formData.monthly_income_other.trim().length > MAX_TEXT_LENGTH
      ) {
        e.monthly_income_other = `Tối đa ${MAX_TEXT_LENGTH} ký tự`;
      }
    }

    // 6. Hình thức nhận thu nhập
    if (!formData.income_method) {
      e.income_method = "Vui lòng chọn";
    } else if (formData.income_method === "__other__") {
      if (!formData.income_method_other.trim()) {
        e.income_method_other = "Vui lòng nhập";
      } else if (formData.income_method_other.trim().length > MAX_TEXT_LENGTH) {
        e.income_method_other = `Tối đa ${MAX_TEXT_LENGTH} ký tự`;
      }
    }

    // 7. Lịch sử nợ
    if (!formData.debt_history) {
      e.debt_history = "Vui lòng chọn";
    } else if (formData.debt_history === "__other__") {
      if (!formData.debt_history_other.trim()) {
        e.debt_history_other = "Vui lòng nhập";
      } else if (formData.debt_history_other.trim().length > MAX_TEXT_LENGTH) {
        e.debt_history_other = `Tối đa ${MAX_TEXT_LENGTH} ký tự`;
      }
    }

    // 8. Số tiền mong muốn vay
    if (!formData.loan_amount.trim()) {
      e.loan_amount = "Vui lòng nhập số tiền hợp lệ";
    } else {
      const amountStr = formData.loan_amount.replace(/\./g, "");
      const amount = parseFloat(amountStr);
      if (isNaN(amount) || amount <= 0) {
        e.loan_amount = "Số tiền vay phải là số lớn hơn 0";
      } else if (amount > MAX_LOAN_AMOUNT) {
        e.loan_amount = `Số tiền vay tối đa là 1 tỷ VNĐ`;
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  /* ── Submit ── */

  async function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    if (!validate()) return;

    setStatus("loading");
    setErrorMessage("");

    try {
      /** Resolve radio "other" values */
      const resolve = (field: keyof FormData, otherField: keyof FormData) =>
        formData[field] === "__other__"
          ? formData[otherField].trim()
          : formData[field];

      const payload = {
        full_name: formData.full_name.trim(),
        phone: formData.phone.trim(),
        living_area: resolve("living_area", "living_area_other"),
        job_type: resolve("job_type", "job_type_other"),
        monthly_income: resolve("monthly_income", "monthly_income_other"),
        income_method: resolve("income_method", "income_method_other"),
        debt_history: resolve("debt_history", "debt_history_other"),
        loan_amount: parseFloat(formData.loan_amount.replace(/\./g, "")),
      };

      const res = await fetch("/api/loan-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Có lỗi xảy ra, vui lòng thử lại.");
      }

      setStatus("success");
      setFormData({ ...INITIAL_FORM });
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Có lỗi xảy ra, vui lòng thử lại.",
      );
    } finally {
      // Scroll to the form section to show the status message
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }

  /* ── Radio field renderer ── */

  function renderRadioField(
    label: string,
    field: keyof FormData,
    options: string[],
    otherField: keyof FormData,
  ) {
    return (
      <div className="form-group">
        <label className="form-label">
          {label} <span className="required">*</span>
        </label>
        <div className="radio-group">
          {options.map((opt) => (
            <label
              key={opt}
              className={`radio-option ${formData[field] === opt ? "selected" : ""}`}
            >
              <input
                type="radio"
                name={field}
                value={opt}
                checked={formData[field] === opt}
                onChange={() => handleRadio(field, opt)}
                disabled={status === "loading"}
              />
              {opt}
            </label>
          ))}

          {/* "Mục khác" option */}
          <label
            className={`radio-option ${formData[field] === "__other__" ? "selected" : ""}`}
          >
            <input
              type="radio"
              name={field}
              value="__other__"
              checked={formData[field] === "__other__"}
              onChange={() => handleRadio(field, "__other__")}
              disabled={status === "loading"}
            />
            Mục khác
          </label>

          {/* Conditional text input for "Mục khác" */}
          {formData[field] === "__other__" && (
            <input
              type="text"
              name={otherField}
              className={`radio-other-input ${errors[otherField as keyof FormErrors] ? "input-error" : ""}`}
              placeholder="Vui lòng nhập cụ thể..."
              maxLength={MAX_TEXT_LENGTH}
              value={formData[otherField]}
              onChange={handleChange}
              disabled={status === "loading"}
            />
          )}
        </div>

        {errors[field as keyof FormErrors] && (
          <p className="field-error">{errors[field as keyof FormErrors]}</p>
        )}
        {errors[otherField as keyof FormErrors] && (
          <p className="field-error">
            {errors[otherField as keyof FormErrors]}
          </p>
        )}
      </div>
    );
  }

  /* ──────────── Render ──────────── */

  return (
    <div className="page-wrapper">
      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <Image
            src={logoImg}
            alt="Shinhan Finance Logo"
            width={40}
            height={40}
            style={{ objectFit: "contain" }}
          />
          <div className="logo-text">
            Shinhan <span>Finance</span>
          </div>
        </div>
      </header>

      {/* Banner */}
      <section
        className="banner"
        style={{
          width: "100%",
          maxWidth: "560px",
          margin: "32px auto 0",
          padding: "0 24px",
        }}
      >
        <Image
          src={bannerImg}
          alt="Shinhan Finance Banner"
          priority
          sizes="(max-width: 560px) 100vw, 560px"
          style={{
            width: "100%",
            height: "auto",
            borderRadius: "12px",
            display: "block",
            boxShadow: "0 4px 24px rgba(0, 0, 0, 0.08)",
          }}
        />
      </section>

      {/* Hero */}
      <section className="hero">
        <h1>Vay tiêu dùng SHINHAN FINANCE</h1>
        <p>
          <b>
            Hạn mức tối đa 13 lần thu nhập, khoản vay từ 10 - 500 triệu đồng
          </b>
        </p>
        <p>
          Hồ sơ online 100% - Duyệt và giải ngân nhanh chóng <br />
          Không thế chấp tài sản
          <br />
          Không phí thẩm định
          <br />
          Không phí làm hồ sơ
          <br />
        </p>
      </section>

      {/* Form */}
      <section className="form-section" id="form-section">
        <div className="form-card">
          {/* Success message */}
          {status === "success" && (
            <div className="alert alert-success" role="alert">
              <span>
                Đăng ký thành công! Chúng tôi sẽ liên hệ bạn trong thời gian sớm
                nhất.
              </span>
            </div>
          )}

          {/* Error message */}
          {status === "error" && (
            <div className="alert alert-error" role="alert">
              <span className="alert-icon">❌</span>
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* 1. Họ và tên */}
            <div className="form-group">
              <label htmlFor="full_name" className="form-label">
                Họ và tên <span className="required">*</span>
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                className={`form-input ${errors.full_name ? "input-error" : ""}`}
                // placeholder="Nguyễn Văn A"
                maxLength={MAX_TEXT_LENGTH}
                value={formData.full_name}
                onChange={handleChange}
                disabled={status === "loading"}
              />
              {errors.full_name && (
                <p className="field-error">{errors.full_name}</p>
              )}
            </div>

            {/* 2. Số điện thoại (Zalo) */}
            <div className="form-group">
              <label htmlFor="phone" className="form-label">
                Số điện thoại (Zalo) <span className="required">*</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className={`form-input ${errors.phone ? "input-error" : ""}`}
                // placeholder="0912345678"
                maxLength={MAX_PHONE_LENGTH}
                value={formData.phone}
                onChange={handleChange}
                disabled={status === "loading"}
              />
              {errors.phone && <p className="field-error">{errors.phone}</p>}
            </div>

            {/* 3. Khu vực sinh sống */}
            {renderRadioField(
              "Khu vực sinh sống",
              "living_area",
              LIVING_AREA_OPTIONS,
              "living_area_other",
            )}

            {/* 4. Loại hình công việc */}
            {renderRadioField(
              "Loại hình công việc hiện tại của bạn",
              "job_type",
              JOB_TYPE_OPTIONS,
              "job_type_other",
            )}

            {/* 5. Thu nhập bình quân hàng tháng */}
            {renderRadioField(
              "Thu nhập bình quân hàng tháng của bạn (VNĐ)",
              "monthly_income",
              MONTHLY_INCOME_OPTIONS,
              "monthly_income_other",
            )}

            {/* 6. Hình thức nhận thu nhập hàng tháng */}
            {renderRadioField(
              "Hình thức nhận thu nhập hàng tháng của bạn",
              "income_method",
              INCOME_METHOD_OPTIONS,
              "income_method_other",
            )}

            {/* 7. Lịch sử nợ / trễ hạn */}
            {renderRadioField(
              "Bạn đã từng thanh toán trễ hạn khoản vay hoặc dùng thẻ tín dụng bao giờ chưa?",
              "debt_history",
              DEBT_HISTORY_OPTIONS,
              "debt_history_other",
            )}

            {/* 8. Số tiền mong muốn vay */}
            <div className="form-group">
              <label htmlFor="loan_amount" className="form-label">
                Số tiền bạn mong muốn vay <span className="required">*</span>
              </label>
              <div className="input-suffix">
                <input
                  id="loan_amount"
                  name="loan_amount"
                  type="text"
                  inputMode="numeric"
                  className={`form-input ${errors.loan_amount ? "input-error" : ""}`}
                  // placeholder="100"
                  value={formData.loan_amount}
                  onChange={handleChange}
                  disabled={status === "loading"}
                />
                <span className="suffix-label">VNĐ</span>
              </div>
              {errors.loan_amount && (
                <p className="field-error">{errors.loan_amount}</p>
              )}
            </div>

            {/* Submit */}
            <button
              id="btn-submit"
              type="submit"
              className="btn-submit"
              disabled={status === "loading"}
            >
              {status === "loading" ? (
                <>
                  <span className="spinner" />
                  Đang gửi...
                </>
              ) : (
                "Gửi đăng ký"
              )}
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        © {new Date().getFullYear()} - Mọi quyền được bảo lưu.
      </footer>
    </div>
  );
}
