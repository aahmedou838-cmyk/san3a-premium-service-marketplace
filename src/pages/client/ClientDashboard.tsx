import React, { useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useNavigate } from "react-router-dom";
import {
  Zap,
  Droplets,
  Car,
  Sparkles,
  Navigation,
  CheckCircle2,
  ChevronLeft
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
export function ClientDashboard() {
  const navigate = useNavigate();
  const createRequest = useMutation(api.requests.createRequest);
  const activeRequests = useQuery(api.requests.listActiveRequests) ?? [];
  const acceptContract = useMutation(api.requests.acceptContract);
  const user = useQuery(api.auth.loggedInUser);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isContractOpen, setIsContractOpen] = useState(false);
  const handleServiceClick = async (serviceName: string) => {
    try {
      await createRequest({
        serviceType: serviceName,
        address: "نواكشوط، تفرغ زينة",
      });
      toast.success("تم إرسال طلبك! جاري البحث عن فني في نواكشوط...");
    } catch (err: any) {
      toast.error(err.message || "فشل في إنشاء الطلب");
    }
  };
  const openContract = (request: any) => {
    setSelectedRequest(request);
    setIsContractOpen(true);
  };
  const onAcceptContract = async () => {
    if (!selectedRequest) return;
    try {
      await acceptContract({ requestId: selectedRequest._id });
      setIsContractOpen(false);
      toast.success("تم توقيع العقد! الفني في طريقه إليك.");
      navigate(`/client/track/${selectedRequest._id}`);
    } catch (err) {
      toast.error("فشل في قبول العقد");
    }
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="py-8 md:py-12 space-y-12">
        <section className="space-y-2 text-right">
          <h2 className="text-3xl font-black tracking-tight">ما هي الخدمة التي تحتاجها؟</h2>
          <p className="text-muted-foreground">اختر الخدمة وسنقوم بربطك بأفضل الفنيين في موريتانيا.</p>
        </section>
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <motion.button
              key={service.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleServiceClick(service.name)}
              className="group text-right"
            >
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
        {activeRequests.length > 0 && (
          <section className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2 text-right">
              <Navigation className="w-5 h-5 text-primary" /> الطلبات النشطة
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
                        <p className="text-sm text-muted-foreground">الحالة: {req.status === 'pending' ? 'بانتظار الموافقة' : 'جاري التنفيذ'}</p>
                      </div>
                      <div className="text-left">
                        <p className="font-black text-primary text-xl">250 MRU</p>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                      {req.status === 'pending' ? (
                        <Button onClick={() => openContract(req)} className="flex-1 rounded-xl px-8">عرض العقد</Button>
                      ) : (
                        <Button onClick={() => navigate(`/client/track/${req._id}`)} variant="secondary" className="flex-1 rounded-xl gap-2">تتبع الفني <ChevronLeft className="w-4 h-4" /></Button>
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
              onAccept={onAcceptContract}
              onCancel={() => setIsContractOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}