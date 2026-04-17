import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { motion } from "framer-motion";
import {
  User,
  Phone,
  ShieldCheck,
  Camera,
  Save,
  Lock,
  Wrench,
  Star,
  Activity,
  MessageCircle,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
export function ProfilePage() {
  const user = useQuery(api.auth.loggedInUser);
  const updateProfile = useMutation(api.users.updateProfile);
  const completedJobs = useQuery(api.requests.listCompletedRequests) ?? [];
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
  });
  React.useEffect(() => {
    if (user) {
      setFormData({ name: user.name || "", phone: user.phone || "" });
    }
  }, [user]);
  const handleSave = async () => {
    try {
      await updateProfile(formData);
      setIsEditing(false);
      toast.success("تم تحديث الملف الشخصي بنجاح");
    } catch (err) {
      toast.error("فشل في تحديث الملف الشخصي");
    }
  };
  const openWhatsAppPreview = () => {
    if (!user?.phone) return;
    window.open(`https://wa.me/${user.phone}`, "_blank");
  };
  if (!user) return null;
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="py-8 md:py-12 space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="text-right">
            <h1 className="text-3xl font-black">إدارة الحساب</h1>
            <p className="text-muted-foreground">الملف الشخصي وإعدادات التوثيق في موريتانيا.</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={cn(
              "rounded-full px-6 py-2 text-sm",
              user.kycStatus === 'verified' ? "bg-emerald-600" : "bg-amber-500"
            )}>
              {user.kycStatus === 'verified' ? 'حساب موثق' : 'بانتظار التوثيق'}
            </Badge>
            <Badge variant="outline" className="rounded-full px-4 py-2">
              {user.role === 'worker' ? 'فني محترف' : user.role === 'admin' ? 'مدير المنصة' : 'عميل'}
            </Badge>
          </div>
        </header>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card className="rounded-[2.5rem] shadow-soft border-none overflow-hidden bg-card">
              <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                <div className="relative">
                  <div className="w-32 h-32 rounded-[2rem] bg-primary/10 flex items-center justify-center text-5xl font-black text-primary border-4 border-white shadow-lg overflow-hidden">
                    {user.name?.[0] || 'ع'}
                  </div>
                  <button className="absolute bottom-0 right-0 bg-white p-2 rounded-xl shadow-md border hover:bg-accent transition-colors">
                    <Camera className="w-5 h-5 text-primary" />
                  </button>
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{user.name || "مستخدم صنعة"}</h3>
                  <p className="text-muted-foreground text-sm flex items-center justify-center gap-2">
                    <Phone className="w-3 h-3" /> {user.phone || "لا يوجد رقم"}
                  </p>
                </div>
                {user.role === 'worker' && (
                  <div className="flex flex-col items-center gap-1">
                     <div className="flex items-center gap-1 text-amber-500 font-black text-xl">
                        <Star className="w-6 h-6 fill-current" />
                        <span>{user.trustScore?.toFixed(1) || "5.0"}</span>
                     </div>
                     <p className="text-xs text-muted-foreground">تقييم الثقة العام</p>
                  </div>
                )}
              </CardContent>
            </Card>
            {user.role === 'worker' && (
              <Card className="rounded-3xl shadow-soft border-none bg-emerald-50/50 p-6 space-y-4">
                <h4 className="font-bold text-right flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-primary" /> حالة التوثيق</h4>
                {user.kycStatus === 'verified' ? (
                  <div className="space-y-3">
                    <p className="text-sm text-emerald-700">تم التحقق من هويتك بنجاح. مهاراتك الموثقة تظهر الآن للعملاء.</p>
                    <Button onClick={openWhatsAppPreview} variant="outline" size="sm" className="w-full rounded-xl gap-2">
                      <MessageCircle className="w-4 h-4 text-emerald-600" /> معاينة زر واتساب
                    </Button>
                  </div>
                ) : user.kycStatus === 'pending' ? (
                  <p className="text-sm text-amber-600">طلب التوثيق قيد المراجعة حالياً من قبل الإدارة.</p>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-destructive flex items-center gap-1"><AlertCircle className="w-4 h-4" /> لم يتم التوثيق بعد.</p>
                    <Button className="w-full rounded-xl" onClick={() => window.location.href='/worker/kyc'}>بدء التوثيق الآن</Button>
                  </div>
                )}
              </Card>
            )}
          </div>
          <div className="lg:col-span-2 space-y-6">
            <Card className="rounded-[2.5rem] shadow-soft border-none">
              <CardHeader className="border-b px-8 py-6 flex flex-row items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" /> المعلومات الشخصية
                </CardTitle>
                <Button variant={isEditing ? "outline" : "default"} onClick={() => setIsEditing(!isEditing)} className="rounded-xl">
                  {isEditing ? "إلغاء" : "تعديل البيانات"}
                </Button>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2 text-right">
                    <Label htmlFor="name">الاسم الثلاثي</Label>
                    <Input id="name" disabled={!isEditing} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="rounded-xl bg-secondary h-12" />
                  </div>
                  <div className="space-y-2 text-right">
                    <Label htmlFor="phone">رقم الهاتف (بانكيلي)</Label>
                    <Input id="phone" disabled={!isEditing} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="rounded-xl bg-secondary h-12" />
                  </div>
                </div>
                {isEditing && (
                  <Button onClick={handleSave} className="w-full h-12 rounded-xl gap-2 font-bold shadow-lg">
                    <Save className="w-5 h-5" /> حفظ التغييرات
                  </Button>
                )}
              </CardContent>
            </Card>
            <Card className="rounded-[2.5rem] shadow-soft border-none overflow-hidden">
               <CardHeader className="px-8 py-6 border-b">
                 <CardTitle className="text-xl flex items-center gap-2">
                   <Activity className="w-5 h-5 text-primary" /> سجل التقييمات
                 </CardTitle>
               </CardHeader>
               <CardContent className="p-0 divide-y">
                 {completedJobs.length === 0 ? (
                   <div className="p-12 text-center text-muted-foreground">لا توجد تقييمات مسجلة بعد.</div>
                 ) : (
                   completedJobs.slice(0, 5).map(job => (
                     <div key={job._id} className="p-6 flex items-center justify-between">
                       <div className="text-right">
                         <p className="font-bold">{job.serviceType}</p>
                         <p className="text-xs text-muted-foreground">{job.client?.name || "عميل"}</p>
                       </div>
                       <div className="flex items-center gap-1 text-amber-500 font-bold">
                         <Star className="w-4 h-4 fill-current" /> 5.0
                       </div>
                     </div>
                   ))
                 )}
               </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}