import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle, 
  Star, 
  TrendingUp, 
  MapPin, 
  Clock, 
  Power,
  ShieldCheck,
  CreditCard
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
export function WorkerDashboard() {
  const [isOnline, setIsOnline] = useState(false);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 space-y-8">
        {/* Status & Trust Profile */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 rounded-3xl border-none shadow-soft bg-gradient-to-bl from-card to-accent/20">
            <CardContent className="p-8 flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-primary/10 border-4 border-white flex items-center justify-center text-3xl font-bold text-primary">ع</div>
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white">
                  <ShieldCheck className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold">علي المحسن</h2>
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">موثق</Badge>
                </div>
                <p className="text-muted-foreground">فني سباكة متخصص • الرياض</p>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-bold">4.9</span>
                  <span className="text-muted-foreground text-sm">(124 تقييم)</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-none shadow-soft overflow-hidden">
            <CardContent className={cn("p-8 h-full flex flex-col items-center justify-center gap-4 transition-colors", isOnline ? "bg-green-50" : "bg-slate-50")}>
              <div className={cn("p-4 rounded-full", isOnline ? "bg-green-500 text-white" : "bg-slate-400 text-white")}>
                <Power className="w-8 h-8" />
              </div>
              <div className="text-center">
                <p className="font-bold text-lg">{isOnline ? "أنت متصل الآن" : "أنت غير متصل"}</p>
                <p className="text-sm text-muted-foreground">قم بالتفعيل لاستقبال الطلبات</p>
              </div>
              <Switch checked={isOnline} onCheckedChange={setIsOnline} className="data-[state=checked]:bg-green-500" />
            </CardContent>
          </Card>
        </div>
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="أرباح اليوم" value="450 ر.س" icon={CreditCard} color="text-emerald-500" />
          <StatCard title="طلبات مكتملة" value="12" icon={CheckCircle} color="text-blue-500" />
          <StatCard title="ساعات العمل" value="6.5" icon={Clock} color="text-purple-500" />
          <StatCard title="معدل القبول" value="98%" icon={TrendingUp} color="text-amber-500" />
        </div>
        {/* Job Requests */}
        <section className="space-y-4">
          <h3 className="text-xl font-bold">طلبات متاحة قريبة</h3>
          <AnimatePresence>
            {isOnline ? (
              <div className="grid md:grid-cols-2 gap-4">
                <JobCard />
                <JobCard />
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-accent/30 rounded-3xl p-12 text-center space-y-2 border-2 border-dashed"
              >
                <Power className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
                <h4 className="text-lg font-bold">ابدأ العمل لتلقي الطلبات</h4>
                <p className="text-muted-foreground">بمجرد تفعيل وضع الاتصال، ستظهر الطلبات القريبة منك هنا.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </div>
  );
}
function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <Card className="rounded-2xl border-none shadow-soft">
      <CardContent className="p-6 flex items-center gap-4">
        <div className={cn("p-3 rounded-xl bg-muted/50", color)}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{title}</p>
          <p className="text-lg font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
function JobCard() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="rounded-2xl shadow-soft border-primary/10 hover:border-primary transition-all">
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <Badge variant="outline" className="mb-2">سباكة طارئة</Badge>
              <h4 className="text-lg font-bold">إصلاح تسريب مياه في المطبخ</h4>
            </div>
            <div className="text-right">
              <span className="text-xl font-black text-primary">150 ر.س</span>
              <p className="text-xs text-muted-foreground">تقديري</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> حي النرجس (2.4 كم)</span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> الآن</span>
          </div>
          <div className="flex gap-2">
            <Button className="flex-1 bg-primary rounded-xl">قبول الطلب</Button>
            <Button variant="ghost" className="flex-1 rounded-xl">تجاهل</Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
import { cn } from "@/lib/utils";