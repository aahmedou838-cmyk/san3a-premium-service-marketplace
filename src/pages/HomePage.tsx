import React from "react";
import { Authenticated, Unauthenticated, useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { SignInForm } from "@/components/SignInForm";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion } from "framer-motion";
import { User, Briefcase, Sparkles, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
export function HomePage() {
  const user = useQuery(api.auth.loggedInUser);
  const setRoleMutation = useMutation(api.users.setUserRole);
  const navigate = useNavigate();
  const handleRoleSelection = async (role: "client" | "worker") => {
    await setRoleMutation({ role });
    navigate(role === "client" ? "/client" : "/worker");
  };
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <ThemeToggle />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-16 lg:py-24 text-center">
          <Unauthenticated>
            <div className="max-w-md mx-auto space-y-8">
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center shadow-xl">
                  <Sparkles className="w-10 h-10 text-white animate-pulse" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-gradient-primary">صنعة (San3a)</h1>
                <p className="text-muted-foreground">منصتك الموثوقة لخدمات المنازل المتميزة</p>
              </div>
              <div className="bg-card p-8 rounded-3xl shadow-soft border">
                <SignInForm />
              </div>
            </div>
          </Unauthenticated>
          <Authenticated>
            <div className="space-y-12">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <h1 className="text-4xl md:text-6xl font-black">مرحباً بك في <span className="text-primary">صنعة</span></h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  {user?.role 
                    ? `أهلاً بك مرة أخرى، ${user?.email}` 
                    : "كيف يمكننا مساعدتك اليوم؟ يرجى اختيار نوع حسابك للمتابعة."}
                </p>
              </motion.div>
              {!user?.role ? (
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                  <RoleCard 
                    title="أبحث عن فني"
                    description="سباكة، كهرباء، نجارة.. ابحث عن أفضل المحترفين في منطقتك بضغطة زر."
                    icon={User}
                    color="bg-primary"
                    onClick={() => handleRoleSelection("client")}
                  />
                  <RoleCard 
                    title="أنا مقدم خدمة"
                    description="انضم إلى شبكة المحترفين لدينا، ابدأ في استقبال الطلبات وزيادة دخلك اليوم."
                    icon={Briefcase}
                    color="bg-secondary"
                    onClick={() => handleRoleSelection("worker")}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-6">
                  <div className="flex items-center gap-2 text-green-500 font-bold text-xl">
                    <CheckCircle className="w-6 h-6" />
                    تم تحديد دورك كـ {user.role === 'client' ? 'عميل' : 'مقدم خدمة'}
                  </div>
                  <Button 
                    size="lg" 
                    className="rounded-full px-12"
                    onClick={() => navigate(user.role === "client" ? "/client" : "/worker")}
                  >
                    الانتقال للوحة التحكم
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
      className="bg-card p-8 rounded-[2.5rem] shadow-soft border text-right flex flex-col gap-6 transition-shadow hover:shadow-xl"
    >
      <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center", color)}>
        <Icon className="w-8 h-8 text-white" />
      </div>
      <div className="space-y-2">
        <h3 className="text-2xl font-bold">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </div>
      <div className="mt-auto pt-4 flex items-center gap-2 text-primary font-bold">
        اختر هذا الدور ←
      </div>
    </motion.button>
  );
}