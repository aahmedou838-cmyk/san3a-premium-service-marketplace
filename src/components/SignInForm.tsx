"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./ui/input-otp";
type FormStep = "signIn" | "signUp" | "verifyPhone" | "forgotPassword" | "resetPassword";
type FieldErrorKey = "phone" | "password" | "newPassword" | "otp";
type FieldErrors = Partial<Record<FieldErrorKey, string>>;
const MAURITANIA_PHONE_PATTERN = /^(?:\+222)?[234][0-9]{7}$/;
export function SignInForm() {
  const { signIn } = useAuthActions();
  const [step, setStep] = useState<FormStep>("signUp");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);
  const resetForm = useCallback(() => {
    setPassword("");
    setNewPassword("");
    setOtp("");
    setSubmitting(false);
    setFieldErrors({});
  }, []);
  const clearFieldError = useCallback((field: FieldErrorKey) => {
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  }, []);
  const validateCurrentStep = useCallback(() => {
    const nextErrors: FieldErrors = {};
    const normalizedPhone = phone.trim().replace(/\s/g, "");
    if (step === "signIn" || step === "signUp" || step === "forgotPassword") {
      if (!normalizedPhone) {
        nextErrors.phone = "رقم الهاتف مطلوب.";
      } else if (!MAURITANIA_PHONE_PATTERN.test(normalizedPhone)) {
        nextErrors.phone = "أدخل رقم هاتف موريتاني صحيح (8 أرقام).";
      }
    }
    if (step === "signIn" || step === "signUp") {
      if (!password) nextErrors.password = "كلمة المرور مطلوبة.";
    }
    if (step === "verifyPhone" || step === "resetPassword") {
      if (otp.length !== 6) nextErrors.otp = "أدخل الرمز المكون من 6 أرقام.";
    }
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [phone, otp, password, step]);
  const handleSubmit = useCallback(async () => {
    if (!validateCurrentStep()) return;
    setSubmitting(true);
    let normalizedPhone = phone.trim().replace(/\s/g, "");
    if (!normalizedPhone.startsWith("+222")) normalizedPhone = "+222" + normalizedPhone;
    const formData = new FormData();
    formData.set("email", normalizedPhone); // Using phone as identifier in the 'email' field for the provider
    try {
      switch (step) {
        case "signIn":
          formData.set("password", password);
          formData.set("flow", "signIn");
          await signIn("password", formData);
          break;
        case "signUp":
          formData.set("password", password);
          formData.set("flow", "signUp");
          try {
            await signIn("password", formData);
          } catch (error: any) {
            if (error.message.includes("verify") || error.message.includes("OTP")) {
              setStep("verifyPhone");
              setResendCooldown(60);
              toast.info("تم إرسال رمز التحقق إلى هاتفك.");
              return;
            }
            throw error;
          }
          setStep("verifyPhone");
          setResendCooldown(60);
          toast.info("تم إرسال رمز التحقق إلى هاتفك.");
          break;
        case "verifyPhone":
          formData.set("code", otp);
          formData.set("flow", "email-verification");
          await signIn("password", formData);
          toast.success("تم التحقق من الهاتف بنجاح!");
          break;
        case "forgotPassword":
          formData.set("flow", "reset");
          await signIn("password", formData);
          setStep("resetPassword");
          setResendCooldown(60);
          toast.info("تم إرسال رمز إعادة التعيين.");
          break;
        case "resetPassword":
          formData.set("code", otp);
          formData.set("newPassword", newPassword);
          formData.set("flow", "reset-verification");
          await signIn("password", formData);
          toast.success("تم تغيير كلمة المرور!");
          setStep("signIn");
          break;
      }
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ ما");
    } finally {
      setSubmitting(false);
    }
  }, [step, phone, password, newPassword, otp, signIn, validateCurrentStep]);
  const inputClass = "w-full px-4 py-3 text-base bg-secondary text-right text-secondary-foreground border border-input rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all";
  const buttonClass = "w-full px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-bold rounded-xl disabled:opacity-50";
  return (
    <div className="w-full" dir="rtl">
      <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); void handleSubmit(); }}>
        {(step === "signIn" || step === "signUp" || step === "forgotPassword") && (
          <div>
            <input
              className={inputClass}
              type="tel"
              placeholder="رقم الهاتف (222 xx xxx xxx)"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); clearFieldError("phone"); }}
              disabled={submitting}
            />
            {fieldErrors.phone && <p className="mt-1 text-xs text-destructive">{fieldErrors.phone}</p>}
          </div>
        )}
        {(step === "signIn" || step === "signUp") && (
          <div>
            <input
              className={inputClass}
              type="password"
              placeholder="كلمة المرور"
              value={password}
              onChange={(e) => { setPassword(e.target.value); clearFieldError("password"); }}
              disabled={submitting}
            />
            {fieldErrors.password && <p className="mt-1 text-xs text-destructive">{fieldErrors.password}</p>}
          </div>
        )}
        {(step === "verifyPhone" || step === "resetPassword") && (
          <div className="flex flex-col items-center gap-4">
            <p className="text-sm text-muted-foreground">أدخل الرمز المكون من 6 أرقام المرسل لهاتفك</p>
            <InputOTP maxLength={6} value={otp} onChange={(v) => { setOtp(v); clearFieldError("otp"); }} disabled={submitting}>
              <InputOTPGroup>
                {[...Array(6)].map((_, i) => <InputOTPSlot key={i} index={i} />)}
              </InputOTPGroup>
            </InputOTP>
          </div>
        )}
        {step === "resetPassword" && (
          <input
            className={inputClass}
            type="password"
            placeholder="كلمة المرور الجديدة"
            value={newPassword}
            onChange={(e) => { setNewPassword(e.target.value); clearFieldError("newPassword"); }}
            disabled={submitting}
          />
        )}
        <button className={buttonClass} type="submit" disabled={submitting}>
          {submitting ? "جاري المعالجة..." : step === "signIn" ? "تسجيل الدخول" : "إنشاء حساب جديد"}
        </button>
        <div className="text-center text-sm">
          <button type="button" className="text-primary font-bold" onClick={() => setStep(step === "signIn" ? "signUp" : "signIn")}>
            {step === "signIn" ? "ليس لديك حساب؟ سجل الآن" : "لديك حساب بالفعل؟ سجل دخولك"}
          </button>
        </div>
      </form>
    </div>
  );
}