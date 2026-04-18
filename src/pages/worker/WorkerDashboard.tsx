import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import {
  Clock,
  Power,
  ShieldCheck,
  ChevronLeft,
  Wallet,
  TrendingUp,
  Star,
  MapPin,
  ArrowUpRight,
  ShieldAlert,
  Award
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import { Share2, Copy, ExternalLink, UserCog, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from "recharts";
export function WorkerDashboard() {
  const navigate = useNavigate();
  const user = useQuery(api.auth.loggedInUser);
  const activeJobs = useQuery(api.requests.listActiveRequests) ?? [];
  const earnings = useQuery(api.requests.getWorkerEarnings) ?? { total: 0, weekly: 0, chartData: [] };
  const acceptContract = useMutation(api.requests.acceptContract);
  const toggleOnline = useMutation(api.users.toggleOnlineStatus);
  const updateLocation = useMutation(api.users.updateLocation);
  const [isOnline, setIsOnline] = useState(user?.isOnline ?? false);
  const [shareOpen, setShareOpen] = useState(false);
  const trustUrl = typeof window !== "undefined" && user?._id
    ? `${window.location.origin}/trust/${user._id}`
    : "";
  const copyTrustLink = async () => {
    try {
      await navigator.clipboard.writeText(trustUrl);
      toast.success("تم نسخ الرابط");
    } catch {
      toast.error("تعذر النسخ");
    }
  };
  const shareTrustWhatsApp = () => {
    const txt = encodeURIComponent(
      `ملف الثقة الرقمي الخاص بي على تطبيق صنعة:\n${trustUrl}`
    );
    window.open(`https://wa.me/?text=${txt}`, "_blank");
  };
  useEffect(() => {
    if (user?.isOnline !== undefined) setIsOnline(user.isOnline);
  }, [user?.isOnline]);
  useEffect(() => {
    if (!isOnline || user?.kycStatus !== "verified") return;
    const reportLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          updateLocation({ location: { lat: pos.coords.latitude, lng: pos.coords.longitude } });
        },
        (err) => console.warn("Location update failed", err),
        { enableHighAccuracy: true }
      );
    };
    reportLocation();
    const interval = setInterval(reportLocation, 45000);
    return () => clearInterval(interval);
  }, [isOnline, user?.kycStatus, updateLocation]);
  const handleToggleOnline = async (val: boolean) => {
    if (user?.kycStatus !== 'verified') {
      toast.error("يرجى إكمال التوثيق أولاً");
      return;
    }
    try {
      await toggleOnline({ isOnline: val });
      setIsOnline(val);
      toast.success(val ? "أنت متصل الآن" : "أنت غير متصل");
    } catch (err) {
      toast.error("فشل تغيير الحالة");
    }
  };
  const getTrustLabel = (score: number) => {
    if (score >= 4.8) return { label: "ممتاز", color: "text-emerald-600 bg-emerald-50" };
    if (score >= 4.0) return { label: "جيد جداً", color: "text-blue-600 bg-blue-50" };
    return { label: "موثق", color: "text-amber-600 bg-amber-50" };
  };
  const currentJob = activeJobs.find(j => j.status !== 'completed' && j.status !== 'cancelled');
  const trustInfo = getTrustLabel(user?.trustScore || 5.0);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="py-8 md:py-12 space-y-10">
        {currentJob && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="rounded-[2.5rem] border-primary/50 bg-primary/5 shadow-2xl overflow-hidden border-2">
              <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-8 text-right">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center shadow-lg">
                    <Clock className="w-8 h-8 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-black text-2xl text-primary">لديك مهمة جارية!</h4>
                    <p className="text-lg text-muted-foreground font-medium">{currentJob.serviceType} • {currentJob.address}</p>
                  </div>
                </div>
                <Button onClick={() => navigate(`/worker/job/${currentJob._id}`)} className="rounded-2xl px-12 h-14 text-xl font-bold gap-3 shadow-xl">المتابعة للعمل <ChevronLeft className="w-6 h-6" /></Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="md:col-span-2 rounded-[3rem] border-none shadow-soft bg-gradient-to-br from-card via-card to-emerald-50/30 overflow-hidden">
            <CardContent className="p-10 flex flex-col sm:flex-row items-center gap-10 text-right">
              <div className="relative">
                <div className="w-32 h-32 rounded-[2.5rem] bg-primary/10 border-8 border-white flex items-center justify-center text-5xl font-black text-primary shadow-xl">
                  {user?.name?.[0] || 'ف'}
                </div>
                {user?.kycStatus === 'verified' && (
                  <div className="absolute -bottom-2 -right-2 bg-emerald-500 rounded-2xl p-2 border-4 border-white shadow-lg">
                    <ShieldCheck className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-4xl font-black tracking-tight">{user?.name || "فني صنعة"}</h2>
                  <Badge className={cn("rounded-full px-6 py-1.5 text-sm font-bold border-none", trustInfo.color)}>
                    <Award className="w-4 h-4 mr-2" /> مستوى {trustInfo.label}
                  </Badge>
                </div>
                <p className="text-xl text-muted-foreground font-medium">الهاتف: {user?.phone || "غير مسجل"}</p>
                <div className="flex items-center gap-2 text-amber-500 font-black text-2xl">
                  <Star className="w-8 h-8 fill-current drop-shadow-sm" />
                  <span>{user?.trustScore?.toFixed(1) || "5.0"}</span>
                </div>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Button
                    onClick={() => setShareOpen(true)}
                    disabled={user?.kycStatus !== "verified"}
                    className="rounded-2xl h-12 gap-2 font-bold bg-primary hover:bg-primary/90 shadow-lg"
                  >
                    <Share2 className="w-5 h-5" /> شارك ملف ثقتي
                  </Button>
                  <Button
                    onClick={() => navigate("/worker/profile-editor")}
                    variant="outline"
                    className="rounded-2xl h-12 gap-2 font-bold"
                  >
                    <UserCog className="w-5 h-5" /> تعديل الملف العام
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-[3rem] border-none shadow-soft overflow-hidden group">
            <CardContent className={cn(
              "p-10 h-full flex flex-col items-center justify-center gap-6 transition-all duration-500",
              isOnline ? "bg-emerald-50" : "bg-slate-50"
            )}>
              <div className={cn(
                "w-24 h-24 rounded-[2rem] flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110",
                isOnline ? "bg-emerald-500 text-white" : "bg-slate-400 text-white"
              )}>
                <Power className="w-12 h-12" />
              </div>
              <div className="text-center space-y-2">
                <p className="font-black text-2xl tracking-tight">{isOnline ? "متصل الآن" : "غير متصل"}</p>
                <p className="text-muted-foreground font-medium">فعل وضع الاتصال لاستقبال الطلبات</p>
              </div>
              <Switch checked={isOnline} onCheckedChange={handleToggleOnline} className="scale-150 data-[state=checked]:bg-emerald-600" />
            </CardContent>
          </Card>
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-2 gap-6">
              <StatCard title="إجمالي الأرباح" value={`${earnings.total} MRU`} icon={Wallet} color="text-emerald-500" />
              <StatCard title="أرباح الأسبوع" value={`${earnings.weekly} MRU`} icon={TrendingUp} color="text-blue-500" />
            </div>
            <Card className="rounded-[3rem] border-none shadow-soft p-10">
              <div className="flex items-center justify-between mb-8 text-right">
                <h4 className="font-black text-2xl">تحليل الأداء الأسبوعي</h4>
                <Button variant="outline" className="rounded-xl font-bold border-primary/20 text-primary">المحفظة الكاملة</Button>
              </div>
              <div className="h-64 w-full">
                {earnings.chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={earnings.chartData}>
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 14, fontWeight: 700 }} />
                      <Tooltip 
                        cursor={{ fill: 'rgba(0,0,0,0.02)' }} 
                        contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '15px' }} 
                        formatter={(v: any) => [`${v} MRU`, "الأرباح"]}
                      />
                      <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground font-bold">لا توجد بيانات متاحة لهذا الأسبوع</div>
                )}
              </div>
            </Card>
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black">طلبات قريبة منك</h3>
              <Badge variant="outline" className="rounded-full">نواكشوط</Badge>
            </div>
            {isOnline ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <JobCard onAccept={() => toast.info("سيتم تحويلك للطلب فوراً")} />
              </motion.div>
            ) : (
              <div className="bg-muted/30 rounded-[3rem] p-12 text-center space-y-6 border-4 border-dashed border-muted flex flex-col items-center">
                <ShieldAlert className="w-16 h-16 text-muted-foreground opacity-30" />
                <p className="text-xl font-bold text-muted-foreground leading-relaxed">فعل وضع الاتصال لتبدأ في جني الأرباح من منزلك.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-8" dir="rtl">
          <DialogHeader className="text-center space-y-3">
            <DialogTitle className="text-2xl font-black">
              ملف ثقتك الرقمي
            </DialogTitle>
            <DialogDescription className="text-base">
              شارك هذا الرابط أو الرمز مع الزبائن لعرض تقييماتك وأعمالك فوراً.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="p-5 bg-white rounded-3xl shadow-xl border">
              <QRCodeSVG value={trustUrl} size={200} level="M" />
            </div>
            <div className="w-full bg-muted/50 rounded-xl p-3 font-mono text-xs text-center break-all">
              {trustUrl}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 pt-2">
            <Button
              onClick={shareTrustWhatsApp}
              className="rounded-xl h-12 bg-emerald-600 hover:bg-emerald-700 gap-1 font-bold"
            >
              <MessageCircle className="w-4 h-4" /> واتساب
            </Button>
            <Button
              onClick={copyTrustLink}
              variant="outline"
              className="rounded-xl h-12 gap-1 font-bold"
            >
              <Copy className="w-4 h-4" /> نسخ
            </Button>
            <Button
              onClick={() => window.open(trustUrl, "_blank")}
              variant="outline"
              className="rounded-xl h-12 gap-1 font-bold"
            >
              <ExternalLink className="w-4 h-4" /> معاينة
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <Card className="rounded-[2rem] border-none shadow-soft group hover:shadow-xl transition-all">
      <CardContent className="p-8 flex items-center gap-6 text-right">
        <div className={cn("w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center transition-transform group-hover:rotate-6 shadow-inner", color)}>
          <Icon className="w-7 h-7" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground font-black mb-1">{title}</p>
          <p className="text-2xl font-black tracking-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
function JobCard({ onAccept }: any) {
  return (
    <Card className="rounded-[2.5rem] shadow-soft border-2 border-primary/5 hover:border-primary/20 transition-all text-right overflow-hidden">
      <CardContent className="p-8 space-y-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <Badge className="bg-primary/10 text-primary border-none rounded-lg px-4 font-bold">سباكة</Badge>
            <h4 className="text-2xl font-black">إصلاح تسريب مياه</h4>
          </div>
          <div className="text-left"><span className="text-3xl font-black text-primary">250 MRU</span></div>
        </div>
        <div className="flex items-center gap-4 text-muted-foreground font-medium">
          <span className="flex items-center gap-1"><MapPin className="w-5 h-5 text-primary" /> تفرغ زينة (1.2 كم)</span>
        </div>
        <Button onClick={onAccept} className="w-full bg-primary text-white rounded-2xl h-14 text-xl font-black shadow-lg hover:bg-primary/90">قبول الطلب الآن</Button>
      </CardContent>
    </Card>
  );
}