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
  FileText
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
      await reportDispute({ requestId, reason: "شكوى بخصوص الجودة" });
      toast.success("تم تسجيل شكواك للإدارة الموريتانية.");
    } catch (err) {
      toast.error("فشل في إرسال الشكوى");
    }
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="py-8 md:py-12 space-y-8 text-right">
        <header>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-primary" /> سجل العمليات
          </h1>
          <p className="text-muted-foreground mt-1">عرض تاريخ طلباتك السابقة في موريتانيا.</p>
        </header>
        {history.length === 0 ? (
          <div className="py-20 text-center space-y-4 bg-accent/5 rounded-3xl border-2 border-dashed">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto opacity-20" />
            <h3 className="text-xl font-bold">لا يوجد طلبات مكتملة بعد</h3>
          </div>
        ) : (
          <div className="grid gap-4">
            {history.map((req, index) => (
              <motion.div key={req._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                <Card className="rounded-3xl border-none shadow-soft hover:shadow-md transition-shadow">
                  <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4 w-full">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary"><CheckCircle2 className="w-6 h-6" /></div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg">{req.serviceType}</h4>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {req.actualEndTime ? format(req.actualEndTime, "d MMMM yyyy", { locale: ar }) : "تاريخ غير متوفر"}</span>
                          <span className="flex items-center gap-1"><User className="w-3 h-3" /> {req.worker?.name || "فني معتمد"}</span>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="text-xl font-black text-primary">{req.price || 250} MRU</p>
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">مكتمل</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                      <Button variant="outline" size="sm" className="rounded-xl flex-1 md:flex-none">تقرير الخدمة</Button>
                      <Button variant="ghost" size="sm" className="rounded-xl text-destructive hover:bg-destructive/10" onClick={() => handleReport(req._id)}>
                        <AlertTriangle className="w-4 h-4 ml-1" /> تقديم شكوى
                      </Button>
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