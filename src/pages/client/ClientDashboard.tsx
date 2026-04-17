import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import {
  Zap,
  Droplets,
  Wrench,
  Hammer,
  Car,
  Paintbrush,
  Navigation,
  AlertCircle,
  Clock,
  CheckCircle2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { DigitalContract } from "@/components/contracts/DigitalContract";
import { Dialog, DialogContent } from "@/components/ui/dialog";
const services = [
  { id: "electricity", name: "كهربائي", icon: Zap, color: "text-yellow-500", bg: "bg-yellow-50" },
  { id: "plumbing", name: "سباك", icon: Droplets, color: "text-blue-500", bg: "bg-blue-50" },
  { id: "carpentry", name: "نجار", icon: Hammer, color: "text-orange-500", bg: "bg-orange-50" },
  { id: "mechanic", name: "ميكانيكي", icon: Car, color: "text-red-500", bg: "bg-red-50" },
  { id: "ac", name: "فني تكييف", icon: Wrench, color: "text-emerald-500", bg: "bg-emerald-50" },
  { id: "painting", name: "صباغ", icon: Paintbrush, color: "text-purple-500", bg: "bg-purple-50" },
];
export function ClientDashboard() {
  const createRequest = useMutation(api.requests.createRequest);
  const activeRequests = useQuery(api.requests.listActiveRequests) ?? [];
  const acceptContract = useMutation(api.requests.acceptContract);
  const user = useQuery(api.auth.loggedInUser);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isContractOpen, setIsContractOpen] = useState(false);
  const handleServiceClick = async (serviceName: string) => {
    try {
      const requestId = await createRequest({
        serviceType: serviceName,
        address: "الموقع الحالي المكتشف",
      });
      toast.success("تم إرسال طلبك! جاري البحث عن أقرب فني...");
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
    } catch (err) {
      toast.error("فشل في قبول العقد");
    }
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-12 space-y-12">
        <section className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">ما هي الخدمة التي تحتاجها؟</h2>
          <p className="text-muted-foreground">اختر نوع الخدمة وسنقوم بربطك بأقرب فني متخصص.</p>
        </section>
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {services.map((service, idx) => (
            <motion.button
              key={service.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleServiceClick(service.name)}
              className="group"
            >
              <Card className="border-none shadow-soft hover:shadow-xl transition-all h-full bg-card rounded-3xl overflow-hidden">
                <CardContent className="p-6 flex flex-col items-center gap-4">
                  <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-6", service.bg)}>
                    <service.icon className={cn("w-8 h-8", service.color)} />
                  </div>
                  <span className="font-bold text-lg">{service.name}</span>
                </CardContent>
              </Card>
            </motion.button>
          ))}
        </section>
        {activeRequests.length > 0 && (
          <section className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Navigation className="w-5 h-5 text-primary" /> الطلبات النشطة
            </h3>
            <div className="grid gap-4">
              {activeRequests.map((req) => (
                <Card key={req._id} className="rounded-3xl border-primary/20 bg-card overflow-hidden border shadow-lg">
                  <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">{req.serviceType}</h4>
                        <p className="text-sm text-muted-foreground">الحالة: {req.status === 'pending' ? 'بانتظار الموافقة' : 'جاري التنفيذ'}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                      {req.status === 'pending' && (
                        <Button onClick={() => openContract(req)} className="flex-1 rounded-xl">عرض العقد الرقمي</Button>
                      )}
                      <Button variant="outline" className="flex-1 rounded-xl">مراسلة</Button>
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
              workerName="فني معتمد"
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