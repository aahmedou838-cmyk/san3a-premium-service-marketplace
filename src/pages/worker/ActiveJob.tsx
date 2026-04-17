import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { motion } from "framer-motion";
import {
  MapPin,
  Clock,
  CheckCircle2,
  Navigation,
  ExternalLink,
  Phone,
  MessageSquare,
  AlertTriangle,
  ArrowRight
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Id } from "@convex/_generated/dataModel";
import { cn } from "@/lib/utils";
export function ActiveJob() {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const job = useQuery(api.requests.getJobDetails, { requestId: requestId as Id<"service_requests"> });
  const updateStatus = useMutation(api.requests.updateRequestStatus);
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
  if (!job) return <div className="p-12 text-center">جاري تحميل بيانات المهمة...</div>;
  const handleStatusUpdate = async () => {
    let nextStatus: "arrived" | "in_progress" | "completed";
    if (job.status === "accepted") nextStatus = "arrived";
    else if (job.status === "arrived") nextStatus = "in_progress";
    else nextStatus = "completed";
    try {
      await updateStatus({ requestId: job._id, status: nextStatus });
      toast.success(nextStatus === "completed" ? "تم إتمام المهمة بنجاح!" : "تم تحديث الحالة");
      if (nextStatus === "completed") {
        setTimeout(() => navigate("/worker"), 1500);
      }
    } catch (err) {
      toast.error("فشل في تحديث الحالة");
    }
  };
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-12 space-y-8">
        <header className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/worker")} className="rounded-full">
            <ArrowRight className="w-6 h-6" />
          </Button>
          <div className="space-y-1">
            <h1 className="text-3xl font-black">مهمة نشطة: {job.serviceType}</h1>
            <p className="text-muted-foreground flex items-center gap-2"><MapPin className="w-4 h-4" /> {job.address}</p>
          </div>
        </header>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <Card className="rounded-3xl shadow-soft border-none bg-accent/10">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-xl font-bold">
                      {job.client?.name?.[0] || 'ع'}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">العميل</p>
                      <p className="font-bold">{job.client?.name || "عميل صنعة"}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="secondary" className="rounded-full"><Phone className="w-4 h-4" /></Button>
                    <Button size="icon" variant="secondary" className="rounded-full"><MessageSquare className="w-4 h-4" /></Button>
                  </div>
                </div>
                <div className="p-4 bg-white rounded-2xl border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Navigation className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">فتح الموقع في الخرائط</span>
                  </div>
                  <Button variant="ghost" size="sm" className="gap-2">انتقال <ExternalLink className="w-4 h-4" /></Button>
                </div>
              </CardContent>
            </Card>
            <div className="grid grid-cols-2 gap-4">
               <Card className="rounded-3xl border-none shadow-soft p-6 flex flex-col items-center justify-center gap-2">
                  <Clock className="w-8 h-8 text-primary" />
                  <p className="text-xs text-muted-foreground">وقت العمل</p>
                  <p className="text-2xl font-black tabular-nums">{formatTime(timer)}</p>
               </Card>
               <Card className="rounded-3xl border-none shadow-soft p-6 flex flex-col items-center justify-center gap-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  <p className="text-xs text-muted-foreground">المبلغ المتوقع</p>
                  <p className="text-2xl font-black">{job.price || 250} ر.س</p>
               </Card>
            </div>
          </div>
          <div className="space-y-6">
            <Button
              size="lg"
              onClick={handleStatusUpdate}
              className={cn(
                "w-full h-24 rounded-[2rem] text-xl font-black shadow-lg transition-all",
                job.status === "accepted" ? "bg-primary text-white" :
                job.status === "arrived" ? "bg-emerald-600 text-white" : "bg-destructive text-white"
              )}
            >
              {job.status === "accepted" ? "وصلت للموقع" :
               job.status === "arrived" ? "بدء العمل" : "إتمام المهمة"}
            </Button>
            <Card className="rounded-3xl border-2 border-dashed border-amber-200 bg-amber-50">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-amber-700 font-bold">
                  <AlertTriangle className="w-5 h-5" /> تنبيهات السلامة
                </div>
                <ul className="text-sm text-amber-800 space-y-2 list-disc pr-4">
                  <li>تأكد من ارتداء معدات السلامة اللازمة.</li>
                  <li>قم بتصوير العمل قبل وبعد التنفيذ.</li>
                  <li>لا تطلب مبالغ إضافية خارج المنصة.</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}