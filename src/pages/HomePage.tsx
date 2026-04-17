import React from "react";
import { Authenticated, Unauthenticated, useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { SignInForm } from "@/components/SignInForm";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion } from "framer-motion";
import { User, Briefcase, Sparkles, CheckCircle, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
export function HomePage() {
  const user = useQuery(api.auth.loggedInUser);
  const setRoleMutation = useMutation(api.users.setUserRole);
  const navigate = useNavigate();
  const handleRoleSelection = async (role: "client" | "worker") => {
    try {
      await setRoleMutation({ role });
      navigate(role === "worker" ? "/worker/kyc" : "/client");
    } catch (error) {
      console.error("Failed to set role", error);
    }
  };
  const navigateToDashboard = () => {
    if (user?.role === "worker") {
      navigate(user.kycStatus === "verified" ? "/worker" : "/worker/kyc");
    } else {
      navigate("/client");
    }
  };
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden" dir="rtl">
      <ThemeToggle />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-16 lg:py-24 text-center">
          <Unauthenticated>
            <div className="max-w-md mx-auto space-y-10">
              <div className="flex flex-col items-center gap-6">
                <div className="w-24 h-24 rounded-[2rem] bg-primary flex items-center justify-center shadow-2xl rotate-3">
                  <Sparkles className="w-12 h-12 text-white animate-pulse" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-5xl font-black tracking-tight text-gradient-primary">صنعة (San3a)</h1>
                  <p className="text-xl text-muted-foreground font-medium">خدماتك الموثوقة في موريتانيا</p>
                </div>
              </div>
              <div className="bg-card p-8 rounded-[2.5rem] shadow-glass border relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
                <SignInForm />
              </div>
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                <Smartphone className="w-4 h-4" /> التسجيل متاح لكافة أرقام الهاتف في موريتانيا
              </p>
            </div>
          </Unauthenticated>
          <Authenticated>
            <div className="space-y-12">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <h1 className="text-4xl md:text-7xl font-black">أهلاً بك في <span className="text-primary">صنعة</span></h1>
                <p className="text-2xl text-muted-foreground max-w-2xl mx-auto">
                  {user?.role
                    ? `مرحباً بك مجدداً: ${user?.phone || "مستخدم صنعة"}`
                    : "المنصة الأولى لربط المهنيين بالعملاء في موريتانيا. اختر طريقك للمتابعة."}
                </p>
              </motion.div>
              {!user?.role ? (
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                  <RoleCard
                    title="أبحث عن فني"
                    description="سباكة، كهرباء، ميكانيكا.. احصل على أفضل الخدمات في نواكشوط بضغطة زر."
                    icon={User}
                    color="bg-primary"
                    onClick={() => handleRoleSelection("client")}
                  />
                  <RoleCard
                    title="أنا مقدم خدمة"
                    description="انضم لأكبر شبكة محترفين في موريتانيا وابدأ بزيادة دخلك اليوم من منزلك."
                    icon={Briefcase}
                    color="bg-emerald-600"
                    onClick={() => handleRoleSelection("worker")}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-8">
                  <div className="flex items-center gap-3 text-emerald-600 font-black text-2xl bg-emerald-50 px-8 py-4 rounded-2xl border border-emerald-100">
                    <CheckCircle className="w-8 h-8" />
                    أنت مسجل كـ {user.role === 'client' ? 'عميل' : 'فني محترف'}
                  </div>
                  <Button size="lg" className="rounded-full px-16 h-16 text-xl font-bold shadow-xl hover:scale-105 transition-all" onClick={navigateToDashboard}>
                    الدخول للوحة التحكم
                  </Button>
                </div>
              )}
            </div>
          </Authenticated>
        </div>
      </div>
    </div>
  );
}
function RoleCard({ title, description, icon: Icon, color, onClick }: any) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-card p-10 rounded-[3rem] shadow-soft border-2 border-transparent hover:border-primary/20 text-right flex flex-col gap-6 transition-all"
    >
      <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg", color)}>
        <Icon className="w-10 h-10 text-white" />
      </div>
      <div className="space-y-3">
        <h3 className="text-3xl font-black">{title}</h3>
        <p className="text-muted-foreground text-lg leading-relaxed">{description}</p>
      </div>
      <div className="mt-auto pt-4 flex items-center gap-2 text-primary font-black text-lg">
        بدء الاستخدام ←
      </div>
    </motion.button>
  );
}