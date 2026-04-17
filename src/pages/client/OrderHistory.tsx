import React from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { motion } from "framer-motion";
import { 
  ClipboardList, 
  Calendar, 
  User, 
  CheckCircle2, 
  AlertTriangle,
  FileText,
  ChevronLeft
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { toast } from "sonner";
export function OrderHistory() {
  const history = useQuery(api.requests.listCompletedRequests) ?? [];
  const reportDispute = useMutation(api.requests.reportDispute);
  const handleReport = async (requestId: any) => {
    try {
      await reportDispute({ requestId, reason: "مشكلة في جودة الخدمة" });
      toast.success("تم إرسال بلاغك للإدارة، سنقوم بالتواصل معك قريباً.");
    } catch (err) {
      toast.error("فشل في إرسال البلاغ");
    }
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-12 space-y-8">
        <header>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-primary" /> سجل الطلبات
          </h1>
          <p className="text-muted-foreground mt-1">تصفح تاريخ طلباتك والتقارير المالية.</p>
        </header>
        {history.length === 0 ? (
          <div className="py-20 text-center space-y-4 bg-accent/5 rounded-3xl border-2 border-dashed">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto opacity-20" />
            <h3 className="text-xl font-bold">لا يوجد طلبات سابقة</h3>
            <p className="text-muted-foreground">بمجرد إتمام أول طلب، سيظهر هنا.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {history.map((req, index) => (
              <motion.div
                key={req._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="rounded-3xl border-none shadow-soft hover:shadow-md transition-shadow">
                  <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div className="text-right">
                        <h4 className="font-bold text-lg">{req.serviceType}</h4>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {req.actualEndTime ? format(req.actualEndTime, "d MMMM yyyy", { locale: ar }) : "غير متوفر"}</span>
                          <span className="flex items-center gap-1"><User className="w-3 h-3" /> {req.worker?.name || "فني صنعة"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 w-full md:w-auto">
                      <div className="text-left md:text-right flex-1 md:flex-none">
                        <p className="text-xl font-black text-primary">{req.price} ر.س</p>
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">مكتمل</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="rounded-xl">الفاتورة</Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleReport(req._id)}
                        >
                          <AlertTriangle className="w-4 h-4 ml-1" /> إبلاغ
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}