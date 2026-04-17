import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  ArrowUpRight
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
export function WorkerDashboard() {
  const navigate = useNavigate();
  const user = useQuery(api.auth.loggedInUser);
  const activeJobs = useQuery(api.requests.listActiveRequests) ?? [];
  const earnings = useQuery(api.requests.getWorkerEarnings) ?? { total: 0, weekly: 0, chartData: [] };
  const acceptContract = useMutation(api.requests.acceptContract);
  const toggleOnline = useMutation(api.users.toggleOnlineStatus);
  const updateLocation = useMutation(api.users.updateLocation);
  const [isOnline, setIsOnline] = useState(user?.isOnline ?? false);
  // Sync internal state with user data
  useEffect(() => {
    if (user?.isOnline !== undefined) setIsOnline(user.isOnline);
  }, [user?.isOnline]);
  // Real-time location tracking for online workers
  useEffect(() => {
    if (!isOnline || user?.kycStatus !== "verified") return;
    const reportLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          updateLocation({ location: { lat: pos.coords.latitude, lng: pos.coords.longitude } });
        },
        (err) => console.warn("Location error", err),
        { enableHighAccuracy: true }
      );
    };
    reportLocation();
    const interval = setInterval(reportLocation, 30000); // 30s updates
    return () => clearInterval(interval);
  }, [isOnline, user?.kycStatus, updateLocation]);
  const handleToggleOnline = async (val: boolean) => {
    try {
      await toggleOnline({ isOnline: val });
      setIsOnline(val);
      toast.success(val ? "أنت متصل الآن في نواكشوط" : "أنت غير متصل");
    } catch (err) {
      toast.error("فشل في تغيير الحالة");
    }
  };
  const handleAcceptJob = async (requestId: any) => {
    try {
      await acceptContract({ requestId });
      toast.success("تم قبول المهمة!");
      navigate(`/worker/job/${requestId}`);
    } catch (err) {
      toast.error("فشل في قبول المهمة");
    }
  };
  const currentJob = activeJobs.find(j => j.status !== 'completed' && j.status !== 'cancelled');
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="py-8 md:py-10 space-y-8">
        {currentJob && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="rounded-3xl border-primary bg-primary/5 shadow-lg overflow-hidden">
              <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6 text-right">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center">
                    <Clock className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">مهمة جارية الآن في نواكشوط</h4>
                    <p className="text-sm text-muted-foreground">{currentJob.serviceType} • {currentJob.address}</p>
                  </div>
                </div>
                <Button onClick={() => navigate(`/worker/job/${currentJob._id}`)} className="rounded-xl px-8 gap-2">المتابعة <ChevronLeft className="w-4 h-4" /></Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 rounded-3xl border-none shadow-soft bg-gradient-to-bl from-card to-emerald-50">
            <CardContent className="p-8 flex items-center gap-6 text-right">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-primary/10 border-4 border-white flex items-center justify-center text-3xl font-bold text-primary">{user?.name?.[0] || 'ف'}</div>
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1 border-2 border-white"><ShieldCheck className="w-4 h-4 text-white" /></div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black">{user?.name || "فني موريتاني"}</h2>
                  <Badge className="bg-emerald-100 text-emerald-700">موثق</Badge>
                </div>
                <p className="text-muted-foreground">رقم الهاتف: {user?.phone || "غير مسجل"}</p>
                <div className="flex items-center gap-1 text-amber-500"><Star className="w-4 h-4 fill-current" /><span className="font-bold">{user?.trustScore?.toFixed(1) || "5.0"}</span></div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-none shadow-soft overflow-hidden">
            <CardContent className={cn("p-8 h-full flex flex-col items-center justify-center gap-4 transition-colors", isOnline ? "bg-emerald-50" : "bg-slate-50")}>
              <div className={cn("p-4 rounded-full", isOnline ? "bg-emerald-500 text-white" : "bg-slate-400 text-white")}><Power className="w-8 h-8" /></div>
              <div className="text-center">
                <p className="font-bold text-lg">{isOnline ? "أنت متصل الآن" : "أنت غير متصل"}</p>
                <p className="text-sm text-muted-foreground">فعل وضع الاتصال لاستقبال طلبات نواكشوط</p>
              </div>
              <Switch checked={isOnline} onCheckedChange={handleToggleOnline} className="data-[state=checked]:bg-emerald-500" />
            </CardContent>
          </Card>
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            <StatCard title="إجمالي الأرباح" value={`${earnings.total} MRU`} icon={Wallet} color="text-emerald-500" />
            <StatCard title="أرباح الأسبوع" value={`${earnings.weekly} MRU`} icon={TrendingUp} color="text-blue-500" />
            <Card className="col-span-2 rounded-3xl border-none shadow-soft p-6">
              <div className="flex items-center justify-between mb-6 text-right">
                <h4 className="font-bold text-lg">تحليل الأرباح الأسبوعي (MRU)</h4>
                <Button variant="ghost" size="sm" className="text-primary font-bold">سحب الرصيد <ArrowUpRight className="w-4 h-4 mr-1" /></Button>
              </div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={earnings.chartData}>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} formatter={(v: any) => [`${v} MRU`, "المبلغ"]} />
                    <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-right">الطلبات القريبة في منطقتك</h3>
            {isOnline ? <JobCard onAccept={() => handleAcceptJob("mock-id")} /> : (
              <div className="bg-accent/10 rounded-3xl p-8 text-center space-y-4 border-2 border-dashed border-primary/20">
                <Power className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
                <p className="text-sm text-muted-foreground">فعل وضع الاتصال لتبدأ في استقبال الطلبات في نواكشوط.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <Card className="rounded-2xl border-none shadow-soft">
      <CardContent className="p-6 flex items-center gap-4 text-right">
        <div className={cn("p-3 rounded-xl bg-muted/50", color)}><Icon className="w-5 h-5" /></div>
        <div><p className="text-xs text-muted-foreground">{title}</p><p className="text-lg font-bold">{value}</p></div>
      </CardContent>
    </Card>
  );
}
function JobCard({ onAccept }: any) {
  return (
    <Card className="rounded-2xl shadow-soft border-primary/10 hover:border-primary transition-all text-right">
      <CardContent className="p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div className="text-right">
            <Badge variant="outline" className="mb-2">سباكة</Badge>
            <h4 className="text-lg font-bold">إصلاح تسريب مياه</h4>
          </div>
          <div className="text-left"><span className="text-xl font-black text-primary">250 MRU</span></div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> تفرغ زينة (1.2 كم)</span>
        </div>
        <Button onClick={onAccept} className="w-full bg-primary text-white rounded-xl">قبول المهمة</Button>
      </CardContent>
    </Card>
  );
}