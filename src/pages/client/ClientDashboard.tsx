import React, { useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import {
  Zap,
  Droplets,
  Car,
  Sparkles,
  Navigation,
  CheckCircle2,
  ChevronLeft,
  Maximize2,
  Star,
  MessageCircle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { DigitalContract } from "@/components/contracts/DigitalContract";
import { Dialog, DialogContent } from "@/components/ui/dialog";
const services = [
  { id: "plumbing", name: "سباكة", icon: Droplets, color: "text-blue-500", bg: "bg-blue-50" },
  { id: "electricity", name: "كهرباء", icon: Zap, color: "text-yellow-500", bg: "bg-yellow-50" },
  { id: "mechanic", name: "ميكانيكا", icon: Car, color: "text-red-500", bg: "bg-red-50" },
  { id: "cleaning", name: "تنظيف", icon: Sparkles, color: "text-emerald-500", bg: "bg-emerald-50" },
];
const NOUAKCHOTT_CENTER: [number, number] = [18.0735, -15.9582];
const workerIcon = new L.DivIcon({
  html: `<div class="w-10 h-10 bg-primary rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-wrench"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg></div>`,
  className: "",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});
export function ClientDashboard() {
  const navigate = useNavigate();
  const createRequest = useMutation(api.requests.createRequest);
  const activeRequests = useQuery(api.requests.listActiveRequests) ?? [];
  const nearbyWorkers = useQuery(api.users.listNearbyWorkers) ?? [];
  const acceptContract = useMutation(api.requests.acceptContract);
  const user = useQuery(api.auth.loggedInUser);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isContractOpen, setIsContractOpen] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const handleServiceClick = async (serviceName: string) => {
    try {
      await createRequest({
        serviceType: serviceName,
        address: "نواكشوط، تفرغ زينة",
      });
      toast.success("تم إرسال طلبك! جاري البحث عن فني...");
    } catch (err: any) {
      toast.error(err.message || "فشل في إنشاء الطلب");
    }
  };
  const openWhatsApp = (phone: string, name: string) => {
    const msg = encodeURIComponent(`مرحباً ${name}، أرغب في الاستفسار عن خدمة عبر تطبيق صنعة.`);
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="py-8 md:py-12 space-y-12">
        <section className="space-y-2 text-right">
          <h2 className="text-3xl font-black tracking-tight">اطلب خدمتك الآن</h2>
          <p className="text-muted-foreground">أفضل الفنيين الموثقين في نواكشوط بانتظار خدمتك.</p>
        </section>
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <motion.button key={service.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleServiceClick(service.name)} className="group text-right">
              <Card className="border-none shadow-soft hover:shadow-xl transition-all h-full bg-card rounded-3xl overflow-hidden">
                <CardContent className="p-8 flex flex-col items-center gap-4">
                  <div className={cn("w-20 h-20 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-6", service.bg)}>
                    <service.icon className={cn("w-10 h-10", service.color)} />
                  </div>
                  <span className="font-bold text-xl">{service.name}</span>
                </CardContent>
              </Card>
            </motion.button>
          ))}
        </section>
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">الفنيين المتواجدين الآن</h3>
            <Button variant="ghost" size="sm" onClick={() => setIsMapExpanded(!isMapExpanded)} className="gap-2">
              <Maximize2 className="w-4 h-4" /> {isMapExpanded ? "تصغير الخريطة" : "تكبير الخريطة"}
            </Button>
          </div>
          <div className={cn("relative transition-all duration-500 ease-in-out z-10", isMapExpanded ? "h-[600px]" : "h-[350px]")}>
            <MapContainer center={NOUAKCHOTT_CENTER} zoom={13} style={{ height: "100%", width: "100%" }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {nearbyWorkers.map((worker) => worker.location && (
                <Marker key={worker._id} position={[worker.location.lat, worker.location.lng]} icon={workerIcon}>
                  <Popup>
                    <div className="text-right space-y-2 p-2 min-w-[150px]">
                      <div className="flex items-center justify-between gap-4">
                         <p className="font-bold m-0">{worker.name || "فني موثق"}</p>
                         <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                            <Star className="w-3 h-3 fill-current" /> {worker.trustScore?.toFixed(1) || "5.0"}
                         </div>
                      </div>
                      <p className="text-xs text-muted-foreground m-0">متواجد الآن في نواكشوط</p>
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" className="flex-1 h-8 text-[10px]" onClick={() => handleServiceClick("خدمة فورية")}>طلب الآن</Button>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => openWhatsApp(worker.phone!, worker.name!)}>
                          <MessageCircle className="w-4 h-4 text-emerald-600" />
                        </Button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </section>
        {activeRequests.length > 0 && (
          <section className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2 text-right">
              <Navigation className="w-5 h-5 text-primary" /> طلباتك الحالية
            </h3>
            <div className="grid gap-4">
              {activeRequests.map((req) => (
                <Card key={req._id} className="rounded-3xl border-primary/20 bg-card overflow-hidden border shadow-lg">
                  <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6 text-right">
                    <div className="flex items-center gap-4 w-full">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg">{req.serviceType}</h4>
                        <p className="text-sm text-muted-foreground">حالة الطلب: {req.status === 'pending' ? 'بانتظار قبول العقد' : 'جاري العمل'}</p>
                      </div>
                      <div className="text-left">
                        <p className="font-black text-primary text-xl">250 MRU</p>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                      {req.status === 'pending' ? (
                        <Button onClick={() => { setSelectedRequest(req); setIsContractOpen(true); }} className="flex-1 rounded-xl px-8 font-bold">عرض العقد الرقمي</Button>
                      ) : (
                        <Button onClick={() => navigate(`/client/track/${req._id}`)} variant="secondary" className="flex-1 rounded-xl gap-2 font-bold">تتبع الفني <ChevronLeft className="w-4 h-4" /></Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
      <Dialog open={isContractOpen} onOpenChange={setIsContractOpen}>
        <DialogContent className="max-w-2xl p-0 bg-transparent border-none">
          {selectedRequest && (
            <DigitalContract
              requestId={selectedRequest._id}
              serviceType={selectedRequest.serviceType}
              workerName="فني صنعة معتمد"
              clientName={user?.name || "عميل صنعة"}
              estimatedPrice={250}
              onAccept={async () => {
                await acceptContract({ requestId: selectedRequest._id });
                setIsContractOpen(false);
                toast.success("تم توقيع العقد بنجاح!");
                navigate(`/client/track/${selectedRequest._id}`);
              }}
              onCancel={() => setIsContractOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}