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
  Activity
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
  if (!user) return null;
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="py-8 md:py-12 space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="text-right">
            <h1 className="text-3xl font-black">الملف الشخصي</h1>
            <p className="text-muted-foreground">إدارة معلومات حسابك وتفضيلاتك في صنعة.</p>
          </div>
          <Badge className={cn(
            "rounded-full px-6 py-2 text-sm",
            user.role === 'worker' ? "bg-primary" : "bg-emerald-600"
          )}>
            {user.role === 'worker' ? 'فني محترف' : user.role === 'admin' ? 'مدير المنصة' : 'عميل'}
          </Badge>
        </header>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card className="rounded-[2.5rem] shadow-soft border-none overflow-hidden">
              <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-[2rem] bg-primary/10 flex items-center justify-center text-5xl font-black text-primary border-4 border-white shadow-lg overflow-hidden">
                    {user.name?.[0] || 'ع'}
                  </div>
                  <button className="absolute bottom-0 right-0 bg-white p-2 rounded-xl shadow-md border hover:bg-accent transition-colors">
                    <Camera className="w-5 h-5 text-primary" />
                  </button>
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{user.name || "مستخدم صنعة"}</h3>
                  <p className="text-muted-foreground text-sm">{user.phone || "رقم الهاتف غير مسجل"}</p>
                </div>
                {user.role === 'worker' && (
                  <div className="flex items-center gap-1 text-amber-500 font-black">
                    <Star className="w-5 h-5 fill-current" />
                    <span>{user.trustScore?.toFixed(1) || "5.0"}</span>
                    <span className="text-xs text-muted-foreground font-normal mr-1">(تقييم عام)</span>
                  </div>
                )}
              </CardContent>
            </Card>
            {user.role === 'worker' && (
              <Card className="rounded-3xl shadow-soft border-none bg-emerald-50/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-primary" /> مهاراتك الموثقة
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {user.kycStatus === 'verified' ? (
                    ["سباكة", "كهرباء"].map(s => (
                      <Badge key={s} variant="secondary" className="bg-white">{s}</Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">أكمل توثيق KYC لإظهار مهاراتك.</p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
          <div className="lg:col-span-2 space-y-6">
            <Card className="rounded-[2.5rem] shadow-soft border-none">
              <CardHeader className="border-b px-8 py-6 flex flex-row items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" /> المعلومات الشخصية
                </CardTitle>
                <Button 
                  variant={isEditing ? "outline" : "default"} 
                  onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
                  className="rounded-xl"
                >
                  {isEditing ? "إلغاء" : "تعديل الملف"}
                </Button>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2 text-right">
                    <Label htmlFor="name">الاسم بالكامل</Label>
                    <Input 
                      id="name" 
                      disabled={!isEditing} 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="rounded-xl bg-secondary h-12"
                    />
                  </div>
                  <div className="space-y-2 text-right">
                    <Label htmlFor="phone">رقم الهاتف (موريتانيا)</Label>
                    <div className="relative">
                      <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="phone" 
                        disabled={!isEditing} 
                        value={formData.phone} 
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        className="rounded-xl bg-secondary h-12 pr-10"
                      />
                    </div>
                  </div>
                </div>
                {isEditing && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <Button onClick={handleSave} className="w-full h-12 rounded-xl gap-2 font-bold shadow-lg">
                      <Save className="w-5 h-5" /> حفظ التغييرات
                    </Button>
                  </motion.div>
                )}
              </CardContent>
            </Card>
            <Card className="rounded-[2.5rem] shadow-soft border-none bg-destructive/5">
              <CardHeader className="px-8 py-6">
                <CardTitle className="text-xl flex items-center gap-2 text-destructive">
                  <Lock className="w-5 h-5" /> الأمان والحماية
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 flex items-center justify-between">
                <div className="text-right">
                  <p className="font-bold">تغيير كلمة المرور</p>
                  <p className="text-sm text-muted-foreground">ننصح بتغيير كلمة المرور بانتظام لحماية حسابك.</p>
                </div>
                <Button variant="outline" className="rounded-xl border-destructive text-destructive hover:bg-destructive/10">إعادة تعيين</Button>
              </CardContent>
            </Card>
            <Card className="rounded-[2.5rem] shadow-soft border-none overflow-hidden">
              <CardHeader className="px-8 py-6 border-b">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" /> ملخص النشاط
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-3 divide-x divide-x-reverse">
                  <div className="p-8 text-center">
                    <p className="text-3xl font-black text-primary">12</p>
                    <p className="text-xs text-muted-foreground">عمليات مكتملة</p>
                  </div>
                  <div className="p-8 text-center">
                    <p className="text-3xl font-black text-emerald-600">0</p>
                    <p className="text-xs text-muted-foreground">نزاعات مفتوحة</p>
                  </div>
                  <div className="p-8 text-center">
                    <p className="text-3xl font-black text-primary">2</p>
                    <p className="text-xs text-muted-foreground">سنوات خبرة</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}