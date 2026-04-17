import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { motion } from "framer-motion";
import { 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Clock, 
  AlertCircle,
  ArrowRight,
  Navigation,
  MessageCircle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Id } from "@convex/_generated/dataModel";
export function LiveTracking() {
  const { requestId } = useParams<{ requestId: string }>();
  const job = useQuery(api.requests.getJobDetails, { requestId: requestId as Id<"service_requests"> });
  const [timer, setTimer] = useState(0);
  useEffect(() => {
    let interval: any;
    if (job?.status === "in_progress" && job.actualStartTime) {
      interval = setInterval(() => {
        setTimer(Math.floor((Date.now() - job.actualStartTime!) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [job]);
  if (!job) return <div className="p-12 text-center">جاري تحميل بيانات التتبع...</div>;
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-12 space-y-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/client" className="p-2 hover:bg-accent rounded-full">
              <ArrowRight className="w-6 h-6" />
            </Link>
            <h1 className="text-2xl font-black">تتبع الطلب</h1>
          </div>
          <Badge className={cn(
            "rounded-full px-4 py-1",
            job.status === 'accepted' ? "bg-blue-100 text-blue-700" : 
            job.status === 'in_progress' ? "bg-green-100 text-green-700" : "bg-slate-100"
          )}>
            {job.status === 'accepted' ? 'الفني في الطريق' : 
             job.status === 'arrived' ? 'وصل الفني' :
             job.status === 'in_progress' ? 'جاري العمل' : 'بانتظار الموافقة'}
          </Badge>
        </header>
        {/* Live Map Placeholder */}
        <div className="relative aspect-video rounded-3xl bg-slate-100 border-2 overflow-hidden shadow-inner flex items-center justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-200/50 via-transparent to-transparent opacity-50" />
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center"
          >
            <Navigation className="w-12 h-12 text-primary animate-bounce" />
          </motion.div>
          <div className="absolute bottom-6 inset-x-6 flex justify-center">
             <Card className="rounded-2xl shadow-xl border-none glass-card px-6 py-3 flex items-center gap-4">
                <Clock className="w-5 h-5 text-primary" />
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">الوقت المقدر للوصول</p>
                  <p className="font-bold">{job.workerETA || 12} دقيقة</p>
                </div>
             </Card>
          </div>
        </div>
        {/* Worker Info Card */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 rounded-3xl border-none shadow-soft overflow-hidden">
            <CardContent className="p-8 flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary">
                {job.worker?.name?.[0] || 'ف'}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold">{job.worker?.name || "فني صنعة"}</h3>
                  <Badge className="bg-green-100 text-green-700">موثق <ShieldCheck className="w-3 h-3 mr-1" /></Badge>
                </div>
                <p className="text-muted-foreground">{job.serviceType}</p>
                <div className="flex gap-4 pt-2">
                  <Button size="sm" variant="outline" className="rounded-xl gap-2"><Phone className="w-4 h-4" /> اتصال</Button>
                  <Button size="sm" variant="outline" className="rounded-xl gap-2"><MessageCircle className="w-4 h-4" /> مراسلة</Button>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={cn(
            "rounded-3xl border-none shadow-soft flex flex-col items-center justify-center p-8 transition-colors",
            job.status === "in_progress" ? "bg-primary text-primary-foreground" : "bg-card"
          )}>
            {job.status === "in_progress" ? (
              <>
                <p className="text-sm opacity-80 mb-2">مدة العمل الحالية</p>
                <p className="text-4xl font-black tabular-nums">{formatTime(timer)}</p>
              </>
            ) : (
              <>
                <AlertCircle className="w-8 h-8 text-amber-500 mb-2" />
                <p className="text-center font-bold">بانتظار وصول الفني لبدء العمل</p>
              </>
            )}
          </Card>
        </div>
        {/* SOS Button Section */}
        <section className="bg-destructive/5 rounded-3xl p-8 border-2 border-dashed border-destructive/20 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-right">
            <h4 className="text-xl font-bold text-destructive">زر الطوارئ SOS</h4>
            <p className="text-muted-foreground text-sm">استخدم هذا الزر فقط في حالات الطوارئ القصوى أو الخطر.</p>
          </div>
          <Button variant="destructive" size="lg" className="rounded-full px-12 animate-glow shadow-primary">
            تنبيه الطوارئ
          </Button>
        </section>
      </div>
    </div>
  );
}