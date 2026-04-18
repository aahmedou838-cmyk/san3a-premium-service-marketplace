import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { motion } from "framer-motion";
import {
  Image as ImageIcon,
  Trash2,
  Save,
  ArrowRight,
  ShieldCheck,
  Briefcase,
  MapPin,
  Sparkles,
  Upload,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const SKILLS = [
  "سباكة",
  "كهرباء",
  "نجارة",
  "ميكانيكا",
  "تكييف",
  "دهانات",
  "تنظيف",
  "أثاث",
];
const CITIES = [
  "نواكشوط",
  "نواذيبو",
  "روصو",
  "كيفة",
  "أطار",
  "كيهيدي",
  "زويرات",
  "العيون",
];

export function WorkerProfileEditor() {
  const navigate = useNavigate();
  const user = useQuery(api.auth.loggedInUser);
  const portfolio = useQuery(api.users.getMyPortfolioUrls) ?? [];
  const updateProfile = useMutation(api.users.updateWorkerProfile);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const saveFileMetadata = useMutation(api.files.saveFileMetadata);
  const addPortfolioFile = useMutation(api.users.addPortfolioFile);
  const removePortfolioFile = useMutation(api.users.removePortfolioFile);

  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [experienceYears, setExperienceYears] = useState<number>(0);
  const [city, setCity] = useState("نواكشوط");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    setBio(user.bio || "");
    setSkills(user.skills || []);
    setExperienceYears(user.experienceYears || 0);
    setCity(user.city || "نواكشوط");
  }, [user?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleSkill = (s: string) => {
    setSkills((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ bio, skills, experienceYears, city });
      toast.success("تم حفظ ملفك الشخصي");
    } catch (err: any) {
      toast.error(err.message || "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} أكبر من 5MB`);
          continue;
        }
        const url = await generateUploadUrl();
        const result = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        const { storageId } = await result.json();
        const { fileId } = await saveFileMetadata({
          storageId,
          filename: file.name,
          mimeType: file.type,
          size: file.size,
          description: "Worker portfolio image",
        });
        await addPortfolioFile({ fileId });
      }
      toast.success("تم رفع الصور");
    } catch (err: any) {
      toast.error(err.message || "فشل الرفع");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = async (fileId: string) => {
    try {
      await removePortfolioFile({ fileId: fileId as any });
      toast.success("تم حذف الصورة");
    } catch {
      toast.error("فشل الحذف");
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="py-8 md:py-12 space-y-8">
        <header className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/worker")}
            className="rounded-full"
          >
            <ArrowRight className="w-6 h-6" />
          </Button>
          <div className="flex-1 text-right">
            <h1 className="text-3xl font-black">ملف الثقة الرقمي</h1>
            <p className="text-muted-foreground">
              عدّل معلومات ملفك الشخصي ومعرض أعمالك الذي يراه العملاء.
            </p>
          </div>
          {user.kycStatus === "verified" && (
            <Button
              onClick={() => navigate(`/trust/${user._id}`)}
              variant="outline"
              className="rounded-xl gap-2 hidden md:flex"
            >
              <ExternalLink className="w-4 h-4" /> معاينة الملف العام
            </Button>
          )}
        </header>

        {user.kycStatus !== "verified" && (
          <Card className="rounded-3xl border-2 border-amber-200 bg-amber-50">
            <CardContent className="p-6 text-right flex items-center gap-4">
              <ShieldCheck className="w-10 h-10 text-amber-600 shrink-0" />
              <p className="text-sm text-amber-900 leading-relaxed">
                ملفك العام لن يكون مرئياً للزبائن قبل إكمال التوثيق (KYC). يمكنك
                تعبئة المعلومات الآن وسيتم نشرها تلقائياً بعد الموافقة.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Bio */}
        <Card className="rounded-[2.5rem] border-none shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-right">
              <Sparkles className="w-5 h-5 text-primary" /> نبذة تعريفية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 400))}
              placeholder="عرّف بنفسك بجملتين أو ثلاث. مثال: فني سباكة منزلية بخبرة 8 سنوات، متخصص في كشف التسربات وإصلاح السخانات."
              className="rounded-2xl min-h-28 text-right p-5 text-base bg-muted/30 border-none focus:ring-2 focus:ring-primary"
              dir="rtl"
            />
            <p className="text-xs text-muted-foreground text-right">
              {bio.length}/400 حرف
            </p>
          </CardContent>
        </Card>

        {/* City + Experience */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="rounded-3xl border-none shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-right">
                <MapPin className="w-5 h-5 text-primary" /> المدينة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {CITIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCity(c)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-sm font-bold border-2 transition",
                      city === c
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-transparent bg-muted hover:bg-muted/70"
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-none shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-right">
                <Briefcase className="w-5 h-5 text-primary" /> سنوات الخبرة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                type="number"
                min={0}
                max={60}
                value={experienceYears}
                onChange={(e) =>
                  setExperienceYears(parseInt(e.target.value) || 0)
                }
                className="rounded-xl h-14 text-3xl font-black text-center bg-muted/30 border-none"
              />
              <p className="text-xs text-muted-foreground text-center">
                عدد السنوات التي قضيتها في المهنة
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Skills */}
        <Card className="rounded-[2.5rem] border-none shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-right">
              <ShieldCheck className="w-5 h-5 text-primary" /> التخصصات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {SKILLS.map((skill) => (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={cn(
                    "px-6 py-3 rounded-2xl text-base font-bold border-2 transition-all",
                    skills.includes(skill)
                      ? "bg-primary text-primary-foreground border-primary shadow-lg"
                      : "bg-card hover:bg-accent border-transparent"
                  )}
                >
                  {skill}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Portfolio */}
        <Card className="rounded-[2.5rem] border-none shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-right">
              <ImageIcon className="w-5 h-5 text-primary" /> معرض الأعمال
              <Badge variant="outline" className="rounded-full ml-2">
                {portfolio.length}/12
              </Badge>
            </CardTitle>
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || portfolio.length >= 12}
              className="rounded-xl gap-2"
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {uploading ? "جاري الرفع…" : "رفع صور"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => handleUpload(e.target.files)}
            />
          </CardHeader>
          <CardContent>
            {portfolio.length === 0 ? (
              <div className="py-14 text-center space-y-3 border-4 border-dashed rounded-3xl">
                <ImageIcon className="w-14 h-14 mx-auto text-muted-foreground opacity-30" />
                <p className="text-muted-foreground font-bold">
                  أضف صوراً من أعمالك السابقة ليشاهدها العملاء قبل حجزك.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {portfolio.map((p) => (
                  <motion.div
                    key={p.fileId}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative group aspect-square rounded-2xl overflow-hidden shadow-md"
                  >
                    <img
                      src={p.url}
                      alt="portfolio"
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => handleRemove(p.fileId)}
                      className="absolute top-2 left-2 w-10 h-10 rounded-full bg-destructive text-white shadow-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      aria-label="حذف"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Save */}
        <div className="sticky bottom-4 md:bottom-8 z-20">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full h-16 rounded-[2rem] text-xl font-black shadow-2xl gap-3"
          >
            {saving ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Save className="w-6 h-6" />
            )}
            {saving ? "جاري الحفظ…" : "حفظ ملف الثقة"}
          </Button>
        </div>
      </div>
    </div>
  );
}
