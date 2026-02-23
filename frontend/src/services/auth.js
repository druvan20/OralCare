import API from "./api";

export const loginUser = (data) =>
  API.post("/api/auth/login", data);

export const registerUser = (data) =>
  API.post("/api/auth/register", data);

/** Resend email verification link. Backend: POST /api/auth/resend-verify { email } */
export const resendVerificationEmail = (email) =>
  API.post("/api/auth/resend-verify", { email });

/** Verify email with token from link. Backend: GET /api/auth/verify-email?token=... */
export const verifyEmailToken = (token) =>
  API.get("/api/auth/verify-email", { params: { token } });

/** Send OTP to email (via SMTP). Backend: POST /api/auth/send-otp { email } */
export const sendEmailOtp = (email) =>
  API.post("/api/auth/send-otp", { email });

export const verifyEmailOtp = (email, otp) =>
  API.post("/api/auth/verify-otp", { email, otp });
