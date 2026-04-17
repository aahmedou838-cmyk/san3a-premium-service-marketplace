import React from "react";
import { Authenticated, Unauthenticated, useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { SignInForm } from "@/components/SignInForm";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion } from "framer-motion";
import { User, Briefcase, Sparkles, CheckCircle, Smartphone, ShieldCheck } from "lucide-react";
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
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary selection:text-white" dir="rtl">
      <ThemeToggle />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 md:py-20 lg:py-28 text-center">
          <Unauthenticated>
            <div className="max-w-md mx-auto space-y-12">
              <div className="flex flex-col items-center gap-8">
                <motion.div 
                  initial={{ rotate: 0, scale: 0.8 }}
                  animate={{ rotate: 3, scale: 1 }}
                  className="w-28 h-28 rounded-[2.5rem] bg-primary flex items-center justify-center shadow-2xl"
                >
                  <Sparkles className="w-14 h-14 text-white" />
                </motion.div>
                <div className="space-y-3">
                  <h1 className="text-6xl font-black tracking-tight text-gradient-primary">صنعة (San3a)</h1>
                  <p className="text-2xl text-muted-foreground font-bold">خدماتك الموثوقة في موريتانيا</p>
                </div>
              </div>
              <div className="bg-card p-10 rounded-[3rem] shadow-glass border-2 border-primary/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -mr-20 -mt-20 blur-2xl" />
                <SignInForm />
              </div>
              <div className="flex items-center justify-center gap-3 text-muted-foreground">
                <div className="h-px w-8 bg-border" />
                <p className="text-sm font-bold flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-primary" /> متاح لكافة أرقام موريتانيا
                </p>
                <div className="h-px w-8 bg-border" />
              </div>
            </div>
          </Unauthenticated>
          <Authenticated>
            <div className="space-y-16">
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <h1 className="text-5xl md:text-8xl font-black tracking-tighter">أهلاً بك في <span className="text-primary underline decoration-primary/20">صنعة</span></h1>
                <p className="text-2xl md:text-3xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  {user?.role
                    ? `مرحباً بك مجدداً: ${user.phone || user.name || "مستخدم صنعة"}`
                    : "المنصة الموريتانية الأولى لربط المهنيين بالعملاء. كيف يمكننا مساعدتك اليوم؟"}
                </p>
              </motion.div>
              {!user?.role ? (
                <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto px-4">
                  <RoleCard
                    title="أبحث عن فني محترف"
                    description="سباكة، كهرباء، إصلاحات.. احصل على أفضل الفنيين الموثقين بضغطة زر واحدة."
                    icon={User}
                    color="bg-primary shadow-primary/40"
                    onClick={() => handleRoleSelection("client")}
                  />
                  <RoleCard
                    title="أريد تقديم خدماتي"
                    description="انضم لأكبر شبكة محترفين في موريتانيا، وثق هويتك، وابدأ بزيادة دخلك فوراً."
                    icon={Briefcase}
                    color="bg-emerald-600 shadow-emerald-400/40"
                    onClick={() => handleRoleSelection("worker")}
                  />
                </div>
              ) : (
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-10">
                  <div className="flex items-center gap-4 text-emerald-700 font-black text-3xl bg-emerald-50 px-12 py-6 rounded-[2rem] border-2 border-emerald-100 shadow-inner">
                    <CheckCircle className="w-10 h-10" />
                    أنت مسجل كـ {user.role === 'client' ? 'عميل' : 'فني محترف'}
                    {user.kycStatus === 'verified' && <ShieldCheck className="w-10 h-10 text-emerald-600 ml-2" />}
                  </div>
                  <Button 
                    size="lg" 
                    className="rounded-[2rem] px-20 h-20 text-2xl font-black shadow-2xl hover:scale-105 active:scale-95 transition-all bg-primary hover:bg-primary/90" 
                    onClick={navigateToDashboard}
                  >
                    دخول لوحة التحكم ←
                  </Button>
                </motion.div>
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
      whileHover={{ y: -10, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group bg-card p-12 rounded-[4rem] shadow-soft border-4 border-transparent hover:border-primary/10 text-right flex flex-col gap-8 transition-all relative overflow-hidden"
    >
      <div className={cn("w-24 h-24 rounded-[2rem] flex items-center justify-center shadow-2xl transition-transform group-hover:rotate-6", color)}>
        <Icon className="w-12 h-12 text-white" />
      </div>
      <div className="space-y-4 relative z-10">
        <h3 className="text-4xl font-black tracking-tight">{title}</h3>
        <p className="text-muted-foreground text-xl leading-relaxed font-medium">{description}</p>
      </div>
      <div className="mt-auto pt-6 flex items-center gap-2 text-primary font-black text-xl transition-transform group-hover:translate-x-[-10px]">
        بدء الاستخدام ←
      </div>
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mb-16 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.button>
  );
}