import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  ShieldCheck,
  Clock,
  AlertCircle,
  ArrowRight,
  MessageCircle,
  CheckCircle2,
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
import { toast } from "sonner";
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
    if (workerLoc?.lat && workerLoc?.lng && clientLoc?.lat && clientLoc?.lng) {
      const bounds = L.latLngBounds([workerLoc.lat, workerLoc.lng], [clientLoc.lat, clientLoc.lng]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [workerLoc, clientLoc, map]);
  return null;
}
export function LiveTracking() {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const job = useQuery(api.requests.getJobDetails, { requestId: requestId as Id<"service_requests"> });
  const reportSOS = useMutation(api.requests.reportSOS);
  const [timer, setTimer] = useState(0);
  const [showReview, setShowReview] = useState(false);
  const [sosActive, setSosActive] = useState(false);
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
  }, [job?.status, job?.actualStartTime]);
  const handleSOS = async () => {
    if (!job) return;
    try {
      const clientLocation = job.location || { lat: 18.0735, lng: -15.9582 };
      await reportSOS({ requestId: job._id, location: clientLocation });
      setSosActive(true);
      toast.error("تم إرسال إشارة الاستغاثة. سيتم التواصل معك فوراً.");
    } catch (err) {
      toast.error("فشل في إرسال الإشارة. يرجى الاتصال بالشرطة.");
    }
  };
  if (!job) return <div className="p-12 text-center font-bold">جاري تحميل بيانات التتبع...</div>;
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  const clientLocation = job.location || { lat: 18.0735, lng: -15.9582 };
  const workerLoc = job.worker?.location;
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="py-8 md:py-12 space-y-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/client")} className="rounded-full">
              <ArrowRight className="w-6 h-6" />
            </Button>
            <h1 className="text-2xl font-black">تتبع الرحلة</h1>
          </div>
          <Badge className={cn(
            "rounded-full px-4 py-1 font-bold",
            job.status === 'accepted' ? "bg-blue-500 text-white animate-pulse" :
            job.status === 'in_progress' ? "bg-emerald-500 text-white" :
            job.status === 'completed' ? "bg-slate-500 text-white" : "bg-muted text-muted-foreground"
          )}>
            {job.status === 'accepted' ? 'الفني في الطريق' :
             job.status === 'arrived' ? 'وصل الفني' :
             job.status === 'in_progress' ? 'جاري العمل' :
             job.status === 'completed' ? 'تم الإكمال' : 'بانتظار الموافقة'}
          </Badge>
        </header>
        <div className="relative aspect-video rounded-[2rem] overflow-hidden shadow-2xl border-4 border-card">
          <MapContainer center={[clientLocation.lat, clientLocation.lng]} zoom={15} style={{ height: "100%", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[clientLocation.lat, clientLocation.lng]} icon={clientIcon} />
            {workerLoc?.lat && workerLoc?.lng && (
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
                  <p className="text-xs text-muted-foreground">الوصول المتوقع</p>
                  <p className="font-bold text-lg">{job.workerETA || 12} دقيقة</p>
                </div>
             </Card>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 rounded-[2rem] shadow-soft overflow-hidden">
            <CardContent className="p-8 flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl font-black text-primary border-2 border-primary/5">
                {job.worker?.name?.[0] || 'ف'}
              </div>
              <div className="flex-1 space-y-1 text-right">
                <div className="flex items-center gap-2 justify-end">
                  <Badge className="bg-emerald-100 text-emerald-700 font-bold">موثق <ShieldCheck className="w-3 h-3 mr-1" /></Badge>
                  <h3 className="text-xl font-bold">{job.worker?.name || "فني معتمد"}</h3>
                </div>
                <p className="text-muted-foreground">{job.serviceType}</p>
                <div className="flex gap-4 pt-4 justify-end">
                  <Button onClick={() => window.open(`https://wa.me/${job.worker?.phone}`, '_blank')} className="rounded-xl gap-2 bg-emerald-600 hover:bg-emerald-700 font-bold shadow-lg transition-transform active:scale-95">
                    واتساب <MessageCircle className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" className="rounded-xl gap-2 h-11">
                    اتصال <Phone className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={cn(
            "rounded-[2rem] shadow-soft flex flex-col items-center justify-center p-8 transition-all duration-500",
            job.status === "in_progress" ? "bg-primary text-primary-foreground scale-105" : "bg-card"
          )}>
            {job.status === "in_progress" ? (
              <>
                <p className="text-sm opacity-80 mb-2 font-medium">مدة العمل</p>
                <p className="text-4xl font-black tabular-nums">{formatTime(timer)}</p>
              </>
            ) : job.status === "completed" ? (
              <div className="text-center space-y-4">
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
                <p className="font-black text-xl">تم الإنجاز</p>
                <Button className="rounded-xl px-8 font-bold" onClick={() => setShowReview(true)}>تقييم العمل</Button>
              </div>
            ) : (
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                  <Clock className="w-6 h-6 animate-spin-slow" />
                </div>
                <p className="font-bold">الفني في الطريق</p>
                <p className="text-xs text-muted-foreground">يرجى البقاء في الموقع المتفق عليه.</p>
              </div>
            )}
          </Card>
        </div>
        <section className={cn(
          "rounded-[2.5rem] p-10 border-4 border-dashed flex flex-col md:flex-row items-center justify-between gap-8 transition-all duration-300",
          sosActive ? "bg-red-500 border-red-600 animate-pulse" : "bg-destructive/5 border-destructive/20"
        )}>
          <div className="space-y-2 text-center md:text-right">
            <h4 className={cn("text-2xl font-black", sosActive ? "text-white" : "text-destructive")}>
              {sosActive ? "وضع الطوارئ مفعل" : "زر الاستغاثة SOS"}
            </h4>
            <p className={cn("text-lg", sosActive ? "text-white/90" : "text-muted-foreground")}>
              {sosActive ? "المساعدة في الطريق إليك، لا تغلق التطبيق." : "اضغط هنا فقط في حالة الخطر الشديد."}
            </p>
          </div>
          {!sosActive && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="lg" className="rounded-full px-16 h-16 text-xl animate-glow shadow-primary font-black transition-transform hover:scale-105">
                  طلب استغاثة
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent dir="rtl" className="rounded-[2.5rem]">
                <AlertDialogHeader className="text-right">
                  <AlertDialogTitle className="text-2xl font-black text-destructive">هل أنت متأكد؟</AlertDialogTitle>
                  <AlertDialogDescription className="text-lg">سيتم إرسال موقعك الدقيق فوراً لفرق الأمن والإدارة لدينا.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-row gap-4 mt-6">
                  <AlertDialogAction onClick={handleSOS} className="bg-destructive text-white rounded-2xl flex-1 h-12 text-lg font-bold">نعم، أنا في خطر</AlertDialogAction>
                  <AlertDialogCancel className="rounded-2xl flex-1 h-12">إلغاء</AlertDialogCancel>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </section>
      </div>
      <ReviewModal requestId={job._id} isOpen={showReview} onClose={() => { setShowReview(false); navigate("/client"); }} />
    </div>
  );
}