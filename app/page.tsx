"use client";

import { useState, type FormEvent, type ChangeEvent } from "react";

interface FormData {
  full_name: string;
  phone: string;
  email: string;
  loan_amount: string;
  note: string;
}

interface FormErrors {
  full_name?: string;
  phone?: string;
}

type SubmitStatus = "idle" | "loading" | "success" | "error";

export default function HomePage() {
  const [formData, setFormData] = useState<FormData>({
    full_name: "",
    phone: "",
    email: "",
    loan_amount: "",
    note: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  /** Update form field */
  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear field error on change
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  /** Client-side validation */
  function validate(): boolean {
    const newErrors: FormErrors = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = "Vui lòng nhập họ tên";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại";
    } else if (!/^[0-9]{9,11}$/.test(formData.phone.trim())) {
      newErrors.phone = "Số điện thoại không hợp lệ (9-11 chữ số)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  /** Submit form */
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!validate()) return;

    setStatus("loading");
    setErrorMessage("");

    try {
      const payload = {
        full_name: formData.full_name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || null,
        loan_amount: formData.loan_amount
          ? parseFloat(formData.loan_amount)
          : null,
        note: formData.note.trim() || null,
      };

      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Có lỗi xảy ra, vui lòng thử lại.");
      }

      setStatus("success");
      // Reset form after success
      setFormData({
        full_name: "",
        phone: "",
        email: "",
        loan_amount: "",
        note: "",
      });
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Có lỗi xảy ra, vui lòng thử lại."
      );
    }
  }

  return (
    <div className="page-wrapper">
      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <div className="logo-icon">V</div>
          <div className="logo-text">
            Vay<span>Capital</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <h1>Đăng ký vay vốn nhanh chóng</h1>
        <p>
          Điền thông tin bên dưới để được tư vấn và hỗ trợ giải ngân trong thời
          gian sớm nhất.
        </p>
      </section>

      {/* Form */}
      <section className="form-section">
        <div className="form-card">
          {/* Success message */}
          {status === "success" && (
            <div className="alert alert-success" role="alert">
              <span className="alert-icon">✅</span>
              <span>
                Đăng ký thành công! Chúng tôi sẽ liên hệ bạn trong thời gian
                sớm nhất.
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
            {/* Full Name */}
            <div className="form-group">
              <label htmlFor="full_name" className="form-label">
                Họ và tên <span className="required">*</span>
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                className={`form-input ${errors.full_name ? "input-error" : ""}`}
                placeholder="Nguyễn Văn A"
                value={formData.full_name}
                onChange={handleChange}
                disabled={status === "loading"}
              />
              {errors.full_name && (
                <p className="field-error">{errors.full_name}</p>
              )}
            </div>

            {/* Phone */}
            <div className="form-group">
              <label htmlFor="phone" className="form-label">
                Số điện thoại <span className="required">*</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className={`form-input ${errors.phone ? "input-error" : ""}`}
                placeholder="0901234567"
                value={formData.phone}
                onChange={handleChange}
                disabled={status === "loading"}
              />
              {errors.phone && (
                <p className="field-error">{errors.phone}</p>
              )}
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email <span className="optional">(không bắt buộc)</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="form-input"
                placeholder="email@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={status === "loading"}
              />
            </div>

            {/* Loan Amount */}
            <div className="form-group">
              <label htmlFor="loan_amount" className="form-label">
                Số tiền muốn vay (VNĐ){" "}
                <span className="optional">(không bắt buộc)</span>
              </label>
              <input
                id="loan_amount"
                name="loan_amount"
                type="number"
                className="form-input"
                placeholder="50000000"
                min="0"
                value={formData.loan_amount}
                onChange={handleChange}
                disabled={status === "loading"}
              />
            </div>

            {/* Note */}
            <div className="form-group">
              <label htmlFor="note" className="form-label">
                Ghi chú <span className="optional">(không bắt buộc)</span>
              </label>
              <textarea
                id="note"
                name="note"
                className="form-textarea"
                placeholder="Thông tin thêm về nhu cầu vay..."
                value={formData.note}
                onChange={handleChange}
                disabled={status === "loading"}
              />
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
        © {new Date().getFullYear()} VayCapital. Mọi quyền được bảo lưu.
      </footer>
    </div>
  );
}
