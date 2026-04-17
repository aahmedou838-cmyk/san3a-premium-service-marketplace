import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import { Camera, CheckCircle, ShieldCheck, Upload, User, Wrench, ArrowLeft, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Id } from "@convex/_generated/dataModel";
const SKILLS = ["سباكة", "كهرباء", "نجارة", "ميكانيكا", "تكييف", "دهانات", "تنظيف", "أثاث"];
export function WorkerKYC() {
  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    skills: [] as string[],
    idFileId: null as Id<"files"> | null,
    previewUrl: null as string | null,
  });
  const webcamRef = useRef<Webcam>(null);
  const navigate = useNavigate();
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const saveFileMetadata = useMutation(api.files.saveFileMetadata);
  const submitKYC = useMutation(api.users.submitKYC);
  const user = useQuery(api.auth.loggedInUser);
  const captureAndUpload = useCallback(async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return;
    setUploading(true);
    try {
      const response = await fetch(imageSrc);
      const blob = await response.blob();
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": "image/jpeg" },
        body: blob,
      });
      const { storageId } = await result.json();
      const { fileId } = await saveFileMetadata({
        storageId,
        filename: "id_verification.jpg",
        mimeType: "image/jpeg",
        size: blob.size,
        description: "Worker ID Verification Selfie",
      });
      setFormData(prev => ({ ...prev, idFileId: fileId, previewUrl: imageSrc }));
      toast.success("تم رفع الصورة بنجاح");
    } catch (err) {
      toast.error("فشل رفع الصورة. حاول مرة أخرى.");
    } finally {
      setUploading(false);
    }
  }, [webcamRef, generateUploadUrl, saveFileMetadata]);
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
        idFileId: formData.idFileId ?? undefined,
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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="py-8 md:py-12 lg:py-16 space-y-8">
        <div className="space-y-4 text-center">
          <h1 className="text-3xl font-black text-primary">توثيق الهوية (San3a)</h1>
          <p className="text-muted-foreground">أكمل الخطوات التالية للانضمام إلى قائمة المحترفين الموثوقين في موريتانيا.</p>
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
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-right">
                    <Label htmlFor="name">الاسم الكامل (كما في الهوية)</Label>
                    <Input id="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="الاسم الثلاثي" className="rounded-xl" />
                  </div>
                  <div className="space-y-2 text-right">
                    <Label htmlFor="phone">رقم الهاتف (بانكيلي/مصرفي)</Label>
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
                  <CardTitle className="flex items-center gap-2 text-right">
                    <ShieldCheck className="w-5 h-5 text-primary" /> مصادقة الهوية الرقمية
                  </CardTitle>
                  <CardDescription className="text-right">يرجى التقاط صورة واضحة لوجهك مع بطاقة التعريف الوطنية.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {!formData.previewUrl ? (
                    <div className="aspect-video relative rounded-2xl overflow-hidden bg-muted border-2 border-dashed flex items-center justify-center">
                      <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" className="absolute inset-0 w-full h-full object-cover" />
                      <Button onClick={captureAndUpload} disabled={uploading} variant="secondary" className="z-10 rounded-full shadow-lg gap-2">
                        {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />} 
                        {uploading ? "جاري الرفع..." : "التقاط ورفع"}
                      </Button>
                    </div>
                  ) : (
                    <div className="aspect-video relative rounded-2xl overflow-hidden border">
                      <img src={formData.previewUrl} alt="ID Preview" className="w-full h-full object-cover" />
                      <Button onClick={() => setFormData({...formData, idFileId: null, previewUrl: null})} variant="destructive" size="sm" className="absolute top-2 right-2 rounded-full">
                        إعادة التصوير
                      </Button>
                    </div>
                  )}
                  <div className="flex gap-4">
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1 rounded-xl">رجوع</Button>
                    <Button disabled={!formData.idFileId || uploading} onClick={() => setStep(3)} className="flex-1 rounded-xl">المتابعة</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Card className="rounded-3xl shadow-soft border-none">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-right">
                    <Wrench className="w-5 h-5 text-primary" /> التخصصات المهنية
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {SKILLS.map(skill => (
                      <button
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className={cn(
                          "px-4 py-3 rounded-xl border text-sm font-medium transition-all",
                          formData.skills.includes(skill) ? "bg-primary text-primary-foreground border-primary shadow-md" : "hover:bg-accent text-muted-foreground"
                        )}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-4">
                    <Button variant="outline" onClick={() => setStep(2)} className="flex-1 rounded-xl">رجوع</Button>
                    <Button disabled={formData.skills.length === 0} onClick={handleSubmit} className="flex-1 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold">إرسال للمراجعة</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6 py-12">
              <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">تم إرسال طلب التوثيق!</h2>
                <p className="text-muted-foreground max-w-sm mx-auto">سيقوم فريق صنعة بمراجعة هويتك خلال 24 ساعة. ستصلك رسالة عبر واتساب أو إشعار فور الموافقة.</p>
              </div>
              <Button onClick={() => navigate("/worker")} className="rounded-xl px-12">العودة للوحة التحكم</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}