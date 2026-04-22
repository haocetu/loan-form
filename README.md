# 📋 Loan Form — Đăng ký vay vốn

Landing page thu thập thông tin khách hàng vay vốn, lưu trữ trên Supabase.

## Cấu trúc project

```
loan-form/
├── app/
│   ├── api/contacts/route.ts   ← API endpoint POST /api/contacts
│   ├── globals.css              ← Stylesheet
│   ├── layout.tsx               ← Root layout (SEO, fonts)
│   └── page.tsx                 ← Landing page + form
├── lib/
│   └── supabaseClient.ts        ← Supabase server client
├── .env.example                 ← Template biến môi trường
├── .env.local                   ← Biến môi trường (bạn điền vào)
├── .gitignore
├── next.config.mjs
├── package.json
├── tsconfig.json
└── README.md
```

---

## 1️⃣ Cài đặt Node.js (nếu chưa có)

### Windows
Tải từ https://nodejs.org → chọn bản **LTS** → cài đặt.

### Ubuntu / WSL
```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
```

Kiểm tra:
```bash
node --version   # v22.x.x
npm --version    # 10.x.x
```

---

## 2️⃣ Thiết lập Supabase

1. Truy cập https://supabase.com → tạo project mới
2. Vào **SQL Editor** → chạy lệnh sau:

```sql
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  loan_amount NUMERIC,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- (Tuỳ chọn) Bật RLS nhưng cho phép service role insert
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
```

3. Lấy các key từ **Settings → API**:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

---

## 3️⃣ Cấu hình biến môi trường

Mở file `.env.local` và điền giá trị:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
```

> ⚠️ **KHÔNG** commit file `.env.local` lên git.

---

## 4️⃣ Chạy local

```bash
cd loan-form
npm install
npm run dev
```

Mở trình duyệt: http://localhost:3000

---

## 5️⃣ Deploy lên Vercel

### Cách 1: Vercel CLI
```bash
npm i -g vercel
vercel
```

### Cách 2: Kết nối GitHub (khuyên dùng)
1. Push code lên GitHub
2. Truy cập https://vercel.com → **Import** repo
3. Vercel tự detect Next.js → nhấn **Deploy**

### Cấu hình ENV trên Vercel
1. Vào project trên Vercel → **Settings → Environment Variables**
2. Thêm 3 biến:

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Production, Preview, Development |

3. Nhấn **Redeploy** để áp dụng.

---

## 🔒 Bảo mật

- `SUPABASE_SERVICE_ROLE_KEY` **chỉ dùng ở backend** (API route), không bao giờ gửi về client.
- Client chỉ thấy `NEXT_PUBLIC_*` variables.
- API route validate dữ liệu server-side trước khi insert.
