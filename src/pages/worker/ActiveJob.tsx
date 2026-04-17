import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
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
  if (!job) return <div className="p-12 text-center font-bold">جاري تحميل بيانات المهمة...</div>;
  const handleStatusUpdate = async () => {
    let nextStatus: "arrived" | "in_progress" | "completed";
    if (job.status === "accepted") nextStatus = "arrived";
    else if (job.status === "arrived") nextStatus = "in_progress";
    else nextStatus = "completed";
    try {
      await updateStatus({ requestId: job._id, status: nextStatus });
      toast.success(nextStatus === "completed" ? "تم إتمام العمل بنجاح!" : "تم تحديث حالة المهمة");
      if (nextStatus === "completed") setTimeout(() => navigate("/worker"), 1500);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="py-8 md:py-12 space-y-8 text-right">
        <header className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/worker")} className="rounded-full">
            <ArrowRight className="w-6 h-6" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-black">المهمة الحالية: {job.serviceType}</h1>
            <p className="text-muted-foreground flex items-center gap-2 mt-1"><MapPin className="w-4 h-4" /> {job.address}</p>
          </div>
        </header>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <Card className="rounded-3xl border-none shadow-soft bg-accent/5">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-2xl font-black text-primary shadow-sm">{job.client?.name?.[0] || 'ع'}</div>
                    <div>
                      <p className="text-xs text-muted-foreground">صاحب الطلب</p>
                      <p className="font-bold text-lg">{job.client?.name || "عميل صنعة"}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="secondary" className="rounded-full h-12 w-12"><Phone className="w-5 h-5" /></Button>
                    <Button size="icon" variant="secondary" className="rounded-full h-12 w-12"><MessageSquare className="w-5 h-5" /></Button>
                  </div>
                </div>
                <Button variant="outline" className="w-full h-14 rounded-2xl gap-3 border-dashed">
                  <Navigation className="w-5 h-5 text-primary" /> فتح الموقع في خرائط جوجل <ExternalLink className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
            <div className="grid grid-cols-2 gap-4">
               <Card className="rounded-3xl border-none shadow-soft p-6 flex flex-col items-center justify-center gap-1">
                  <Clock className="w-8 h-8 text-primary" />
                  <p className="text-xs text-muted-foreground">مدة التنفيذ</p>
                  <p className="text-3xl font-black tabular-nums">{formatTime(timer)}</p>
               </Card>
               <Card className="rounded-3xl border-none shadow-soft p-6 flex flex-col items-center justify-center gap-1">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  <p className="text-xs text-muted-foreground">المبلغ المستحق</p>
                  <p className="text-3xl font-black">{job.price || 250} MRU</p>
               </Card>
            </div>
          </div>
          <div className="space-y-6">
            <Button
              size="lg"
              onClick={handleStatusUpdate}
              className={cn(
                "w-full h-24 rounded-[2rem] text-xl font-black shadow-xl transition-all",
                job.status === "accepted" ? "bg-primary" : "bg-emerald-600"
              )}
            >
              {job.status === "accepted" ? "وصلت للموقع" : job.status === "arrived" ? "بدء العمل" : "إتمام العمل"}
            </Button>
            <Card className="rounded-3xl border-2 border-dashed border-amber-200 bg-amber-50">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-amber-700 font-bold"><AlertTriangle className="w-5 h-5" /> تنبيهات السلامة الموريتانية</div>
                <ul className="text-sm text-amber-800 space-y-3 list-disc pr-4">
                  <li>التزم بالزي الرسمي والأدوات المهنية.</li>
                  <li>يمنع طلب أي مبالغ إضافية نقداً خارج النظام.</li>
                  <li>تأكد من نظافة المكان بعد الانتهاء من العمل.</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}