import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import { Camera, CheckCircle, ShieldCheck, Upload, User, Wrench, ArrowLeft, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
const SKILLS = ["سباكة", "كهرباء", "نجارة", "ميكانيكا", "تكييف", "دهانات", "تنظيف", "أثاث"];
export function WorkerKYC() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    skills: [] as string[],
    idImage: null as string | null,
  });
  const webcamRef = useRef<Webcam>(null);
  const navigate = useNavigate();
  const submitKYC = useMutation(api.users.submitKYC);
  const user = useQuery(api.auth.loggedInUser);
  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setFormData(prev => ({ ...prev, idImage: imageSrc }));
      toast.success("تم التقاط الصورة بنجاح");
    }
  }, [webcamRef]);
  const toggleSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill) 
        ? prev.skills.filter(s => s !== skill) 
        : [...prev.skills, skill]
    }));
  };
  const handleSubmit = async () => {
    try {
      await submitKYC({
        name: formData.name,
        phone: formData.phone,
        skills: formData.skills,
      });
      setStep(4);
    } catch (err) {
      toast.error("حدث خطأ أثناء إرسال البيانات");
    }
  };
  if (user?.kycStatus === "verified") {
    navigate("/worker");
    return null;
  }
  const stepsCount = 3;
  const progress = (step / stepsCount) * 100;
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-12 lg:py-16 space-y-8">
        <div className="space-y-4 text-center">
          <h1 className="text-3xl font-black text-primary">توثيق الهوية والمهارات</h1>
          <p className="text-muted-foreground">أكمل الخطوات التالية للانضمام إلى قائمة المحترفين الموثوقين.</p>
          <Progress value={progress} className="h-2 w-full max-w-md mx-auto" />
        </div>
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Card className="rounded-3xl shadow-soft border-none">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" /> المعلومات الأساسية
                  </CardTitle>
                  <CardDescription>نحتاج لبياناتك الشخصية للتواصل معك.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">الاسم الكامل</Label>
                    <Input id="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="أدخل اسمك كما في الهوية" className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">رقم الجوال</Label>
                    <Input id="phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="05xxxxxxxx" className="rounded-xl" />
                  </div>
                  <Button disabled={!formData.name || !formData.phone} onClick={() => setStep(2)} className="w-full rounded-xl gap-2 mt-4">
                    المتابعة <ArrowLeft className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Card className="rounded-3xl shadow-soft border-none">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-primary" /> التحقق من الهوية
                  </CardTitle>
                  <CardDescription>يرجى تصوير بطاقة الهوية الوطنية لضمان أمان المستخدمين.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {!formData.idImage ? (
                    <div className="aspect-video relative rounded-2xl overflow-hidden bg-muted border-2 border-dashed flex items-center justify-center">
                      <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" className="absolute inset-0 w-full h-full object-cover" />
                      <Button onClick={capture} variant="secondary" className="z-10 rounded-full shadow-lg">
                        <Camera className="w-5 h-5 ml-2" /> التقاط الصورة
                      </Button>
                    </div>
                  ) : (
                    <div className="aspect-video relative rounded-2xl overflow-hidden border">
                      <img src={formData.idImage} alt="ID" className="w-full h-full object-cover" />
                      <Button onClick={() => setFormData({...formData, idImage: null})} variant="destructive" size="sm" className="absolute top-2 right-2 rounded-full">
                        إعادة التصوير
                      </Button>
                    </div>
                  )}
                  <div className="flex gap-4">
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1 rounded-xl">رجوع</Button>
                    <Button disabled={!formData.idImage} onClick={() => setStep(3)} className="flex-1 rounded-xl">المتابعة</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Card className="rounded-3xl shadow-soft border-none">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-primary" /> تخصصات العمل
                  </CardTitle>
                  <CardDescription>اختر المهارات التي تتقنها لتلقي الطلبات المناسبة.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {SKILLS.map(skill => (
                      <button
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className={cn(
                          "px-4 py-3 rounded-xl border text-sm font-medium transition-all",
                          formData.skills.includes(skill) ? "bg-primary text-primary-foreground border-primary" : "hover:bg-accent text-muted-foreground"
                        )}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-4">
                    <Button variant="outline" onClick={() => setStep(2)} className="flex-1 rounded-xl">رجوع</Button>
                    <Button disabled={formData.skills.length === 0} onClick={handleSubmit} className="flex-1 rounded-xl bg-secondary hover:bg-secondary/90 text-white">إرسال الطلب</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6 py-12">
              <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">تم استلام طلبك بنجاح!</h2>
                <p className="text-muted-foreground max-w-sm mx-auto">سيقوم فريق المراجعة بالتحقق من بياناتك وتوثيق حسابك خلال 24 ساعة.</p>
              </div>
              <Button onClick={() => navigate("/worker")} className="rounded-xl px-12">العودة للوحة التحكم</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}