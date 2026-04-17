import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { motion } from "framer-motion";
import {
  Phone,
  ShieldCheck,
  Clock,
  AlertCircle,
  ArrowRight,
  MessageCircle,
  Share2,
  CheckCircle2,
  Navigation
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Id } from "@convex/_generated/dataModel";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ReviewModal } from "@/components/ReviewModal";
const clientIcon = new L.DivIcon({
  html: `<div class="w-8 h-8 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>`,
  className: "",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});
const workerIcon = new L.DivIcon({
  html: `<div class="w-10 h-10 bg-primary rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg></div>`,
  className: "",
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});
function RecenterMap({ workerLoc, clientLoc }: { workerLoc?: any, clientLoc?: any }) {
  const map = useMap();
  useEffect(() => {
    if (workerLoc && clientLoc) {
      const bounds = L.latLngBounds([workerLoc.lat, workerLoc.lng], [clientLoc.lat, clientLoc.lng]);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (workerLoc) {
      map.setView([workerLoc.lat, workerLoc.lng], 15);
    }
  }, [workerLoc, clientLoc, map]);
  return null;
}
export function LiveTracking() {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const job = useQuery(api.requests.getJobDetails, { requestId: requestId as Id<"service_requests"> });
  const [timer, setTimer] = useState(0);
  const [showReview, setShowReview] = useState(false);
  useEffect(() => {
    let interval: any;
    if (job?.status === "in_progress" && job.actualStartTime) {
      interval = setInterval(() => {
        setTimer(Math.floor((Date.now() - job.actualStartTime!) / 1000));
      }, 1000);
    }
    if (job?.status === "completed") {
      setShowReview(true);
    }
    return () => clearInterval(interval);
  }, [job]);
  if (!job) return <div className="p-12 text-center">جاري تحميل بيانات التتبع...</div>;
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  const clientLocation = job.location || { lat: 18.0735, lng: -15.9582 };
  const workerLoc = job.worker?.location;
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-12 space-y-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/client")} className="rounded-full">
              <ArrowRight className="w-6 h-6" />
            </Button>
            <h1 className="text-2xl font-black">تتبع الطلب</h1>
          </div>
          <Badge className={cn(
            "rounded-full px-4 py-1",
            job.status === 'accepted' ? "bg-blue-100 text-blue-700" :
            job.status === 'in_progress' ? "bg-green-100 text-green-700" :
            job.status === 'completed' ? "bg-emerald-100 text-emerald-700" : "bg-slate-100"
          )}>
            {job.status === 'accepted' ? 'الفني في الطريق' :
             job.status === 'arrived' ? 'وصل الفني' :
             job.status === 'in_progress' ? 'جاري العمل' :
             job.status === 'completed' ? 'تم الإكمال' : 'بانتظار الموافقة'}
          </Badge>
        </header>
        {/* Real-time Interactive Map */}
        <div className="relative aspect-video rounded-3xl overflow-hidden shadow-inner border-2">
          <MapContainer center={[clientLocation.lat, clientLocation.lng]} zoom={15} style={{ height: "100%", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[clientLocation.lat, clientLocation.lng]} icon={clientIcon} />
            {workerLoc && (
              <>
                <Marker position={[workerLoc.lat, workerLoc.lng]} icon={workerIcon} />
                <Polyline positions={[[clientLocation.lat, clientLocation.lng], [workerLoc.lat, workerLoc.lng]]} color="hsl(var(--primary))" weight={3} dashArray="10, 10" />
                <RecenterMap workerLoc={workerLoc} clientLoc={clientLocation} />
              </>
            )}
          </MapContainer>
          <div className="absolute bottom-6 right-6 z-10">
             <Card className="rounded-2xl shadow-xl border-none glass-card px-6 py-3 flex items-center gap-4">
                <Clock className="w-5 h-5 text-primary" />
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">الوقت المقدر للوصول</p>
                  <p className="font-bold">{job.workerETA || 12} دقيقة</p>
                </div>
             </Card>
          </div>
          <Button variant="secondary" size="sm" className="absolute top-4 left-4 z-10 rounded-xl gap-2 shadow-lg">
            <Share2 className="w-4 h-4" /> مشاركة الموقع
          </Button>
        </div>
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
            ) : job.status === "completed" ? (
              <div className="text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <p className="font-bold">تم إنجاز المهمة</p>
                <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setShowReview(true)}>إضافة تقييم</Button>
              </div>
            ) : (
              <>
                <AlertCircle className="w-8 h-8 text-amber-500 mb-2" />
                <p className="text-center font-bold">بانتظار وصول الفني لبدء العمل</p>
              </>
            )}
          </Card>
        </div>
        <section className="bg-destructive/5 rounded-3xl p-8 border-2 border-dashed border-destructive/20 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-right">
            <h4 className="text-xl font-bold text-destructive">زر الطوارئ SOS</h4>
            <p className="text-muted-foreground text-sm">استخدم هذا الزر فقط في حالات الطوارئ القصوى أو الخطر.</p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="lg" className="rounded-full px-12 animate-glow shadow-primary">
                تنبيه الطوارئ
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent dir="rtl">
              <AlertDialogHeader>
                <AlertDialogTitle>هل أنت في خطر؟</AlertDialogTitle>
                <AlertDialogDescription>بمجرد التفعيل، سيتم إرسال موقعك الحالي فوراً لفرق الاستجابة السريعة لدينا وللجهات المعنية.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-row-reverse gap-2">
                <AlertDialogAction className="bg-destructive text-white">نعم، أحتاج للمساعدة</AlertDialogAction>
                <AlertDialogCancel>إلغاء</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </section>
      </div>
      {job && (
        <ReviewModal
          requestId={job._id}
          isOpen={showReview}
          onClose={() => { setShowReview(false); navigate("/client"); }}
        />
      )}
    </div>
  );
}