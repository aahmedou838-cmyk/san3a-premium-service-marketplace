import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import {
  ShieldCheck,
  Star,
  Briefcase,
  Clock,
  Award,
  MapPin,
  Share2,
  MessageCircle,
  CheckCircle2,
  Eye,
  Calendar,
  Sparkles,
  Copy,
  Printer,
  Quote,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Id } from "@convex/_generated/dataModel";
import { format, formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { ThemeToggle } from "@/components/ThemeToggle";

const levelFor = (score: number) => {
  if (score >= 4.8) return { label: "ممتاز", color: "from-emerald-500 to-teal-500", ring: "ring-emerald-300" };
  if (score >= 4.3) return { label: "جيد جداً", color: "from-blue-500 to-indigo-500", ring: "ring-blue-300" };
  if (score >= 3.5) return { label: "موثّق", color: "from-amber-500 to-orange-500", ring: "ring-amber-300" };
  return { label: "جديد", color: "from-slate-400 to-slate-500", ring: "ring-slate-300" };
};

export function TrustProfile() {
  const { workerId } = useParams<{ workerId: string }>();
  const profile = useQuery(
    api.trust.getPublicProfile,
    workerId ? { workerId: workerId as Id<"users"> } : "skip"
  );
  const incView = useMutation(api.trust.incrementProfileView);
  const viewedRef = useRef(false);

  useEffect(() => {
    if (workerId && !viewedRef.current) {
      viewedRef.current = true;
      incView({ workerId: workerId as Id<"users"> }).catch(() => {});
    }
  }, [workerId, incView]);

  const shareUrl = useMemo(
    () => (typeof window !== "undefined" ? window.location.href : ""),
    []
  );

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("تم نسخ رابط الملف");
    } catch {
      toast.error("تعذر نسخ الرابط");
    }
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(
      `هذا ملف الثقة الرقمي الخاص بي على تطبيق صنعة — يمكنك مراجعة تقييماتي وأعمالي:\n${shareUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const printCard = () => window.print();

  if (profile === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-bold" dir="rtl">
        جاري تحميل ملف الثقة…
      </div>
    );
  }

  if (profile === null) {
    return (
      <EmptyState
        title="ملف غير موجود"
        message="لم نتمكن من العثور على ملف الثقة المطلوب. تأكد من صحة الرابط."
      />
    );
  }

  if (profile.notVerified) {
    return (
      <EmptyState
        title="ملف غير مفعّل بعد"
        message="هذا الفني لم يكمل عملية التوثيق بعد. سيظهر الملف العام بعد الموافقة من إدارة صنعة."
      />
    );
  }

  const level = levelFor(profile.trustScore);
  const joined = format(profile.joinedAt, "MMMM yyyy", { locale: ar });

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 pb-20 print:bg-white"
      dir="rtl"
    >
      <ThemeToggle />
      {/* Top bar */}
      <header className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex items-center justify-between print:hidden">
        <Link to="/" className="text-3xl font-black text-primary tracking-tighter">
          صنعة
        </Link>
        <Badge className="rounded-full px-4 py-1.5 bg-emerald-100 text-emerald-700 border-none font-bold">
          <ShieldCheck className="w-4 h-4 ml-1" /> ملف ثقة رقمي
        </Badge>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-10">
        {/* Hero / Trust Card */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-[3rem] border border-primary/10 bg-card shadow-2xl print:shadow-none print:border print:rounded-xl"
        >
          <div
            className={cn(
              "absolute inset-0 opacity-10 bg-gradient-to-br",
              level.color
            )}
          />
          <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="relative p-8 md:p-12 grid md:grid-cols-[auto_1fr_auto] gap-8 items-center">
            <div className="flex flex-col items-center gap-4">
              <div
                className={cn(
                  "w-36 h-36 rounded-[2.5rem] flex items-center justify-center text-6xl font-black text-white shadow-2xl ring-8 ring-white bg-gradient-to-br",
                  level.color
                )}
              >
                {profile.avatarInitial}
              </div>
              {profile.kycVerified && (
                <Badge className="rounded-full px-4 py-1.5 bg-emerald-600 hover:bg-emerald-600 text-white border-none font-bold shadow-lg">
                  <ShieldCheck className="w-4 h-4 ml-1" /> موثّق رسمياً
                </Badge>
              )}
            </div>

            <div className="space-y-4 text-right">
              <div className="space-y-2">
                <h1 className="text-4xl md:text-5xl font-black tracking-tight">
                  {profile.name}
                </h1>
                <p className="text-xl text-muted-foreground font-bold flex items-center gap-2 justify-end">
                  <MapPin className="w-5 h-5 text-primary" /> {profile.city}
                  {profile.experienceYears > 0 && (
                    <>
                      <span className="mx-2">•</span>
                      <Briefcase className="w-5 h-5 text-primary" />
                      {profile.experienceYears} سنوات خبرة
                    </>
                  )}
                </p>
              </div>

              {/* Trust score gauge */}
              <div className="flex items-center gap-4 flex-wrap justify-end">
                <div className="flex items-center gap-3 bg-amber-50 text-amber-700 rounded-2xl px-5 py-3 border border-amber-200 shadow-sm">
                  <Star className="w-8 h-8 fill-current" />
                  <div className="text-right leading-tight">
                    <div className="text-3xl font-black tabular-nums">
                      {profile.trustScore.toFixed(1)}
                    </div>
                    <div className="text-xs font-bold opacity-70">
                      من {profile.totalReviews} تقييم
                    </div>
                  </div>
                </div>
                <div
                  className={cn(
                    "rounded-2xl px-5 py-3 text-white shadow-lg bg-gradient-to-br flex items-center gap-3",
                    level.color
                  )}
                >
                  <Award className="w-7 h-7" />
                  <div className="text-right leading-tight">
                    <div className="text-xs font-bold opacity-80">مستوى الثقة</div>
                    <div className="text-lg font-black">{level.label}</div>
                  </div>
                </div>
                <div className="rounded-2xl px-5 py-3 bg-card border shadow-sm flex items-center gap-3">
                  <Eye className="w-6 h-6 text-primary" />
                  <div className="text-right leading-tight">
                    <div className="text-xs text-muted-foreground font-bold">مشاهدات الملف</div>
                    <div className="text-lg font-black">{profile.profileViews}</div>
                  </div>
                </div>
              </div>

              {profile.bio && (
                <p className="text-lg leading-relaxed text-foreground/90 max-w-2xl mr-auto pt-2 border-r-4 border-primary/30 pr-4">
                  “{profile.bio}”
                </p>
              )}
            </div>

            {/* QR Code */}
            <div className="hidden md:flex flex-col items-center gap-3 bg-white p-5 rounded-2xl shadow-xl border">
              <QRCodeSVG value={shareUrl} size={140} level="M" includeMargin={false} />
              <p className="text-xs font-bold text-muted-foreground text-center leading-tight">
                امسح الرمز
                <br />
                للاطلاع على الملف
              </p>
            </div>
          </div>

          {/* Action bar */}
          <div className="relative px-8 md:px-12 pb-8 flex flex-wrap gap-3 justify-end print:hidden">
            <Button
              onClick={shareWhatsApp}
              className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-bold gap-2 h-12 px-6 shadow-lg"
            >
              <MessageCircle className="w-5 h-5" /> مشاركة عبر واتساب
            </Button>
            <Button
              onClick={copyLink}
              variant="outline"
              className="rounded-2xl font-bold gap-2 h-12 px-6"
            >
              <Copy className="w-5 h-5" /> نسخ الرابط
            </Button>
            <Button
              onClick={printCard}
              variant="outline"
              className="rounded-2xl font-bold gap-2 h-12 px-6"
            >
              <Printer className="w-5 h-5" /> طباعة البطاقة
            </Button>
          </div>
        </motion.section>

        {/* Trust Metrics */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            icon={CheckCircle2}
            label="مهام مكتملة"
            value={profile.completedJobsCount.toString()}
            accent="text-emerald-600 bg-emerald-50"
          />
          <MetricCard
            icon={Sparkles}
            label="نسبة الإنجاز"
            value={`${profile.completionRate}%`}
            accent="text-primary bg-primary/10"
          />
          <MetricCard
            icon={ShieldCheck}
            label="بدون نزاعات"
            value={`${profile.disputeFreeRate}%`}
            accent="text-indigo-600 bg-indigo-50"
          />
          <MetricCard
            icon={Clock}
            label="زمن الاستجابة"
            value={`${profile.avgResponseMinutes} د`}
            accent="text-amber-600 bg-amber-50"
          />
        </section>

        {/* Skills */}
        {profile.skills.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-black flex items-center gap-3 text-right">
              <Briefcase className="w-6 h-6 text-primary" /> التخصصات الموثّقة
            </h2>
            <div className="flex flex-wrap gap-3">
              {profile.skills.map((skill) => (
                <div
                  key={skill}
                  className="px-6 py-3 rounded-2xl bg-card border-2 border-primary/10 shadow-sm font-bold flex items-center gap-2 hover:shadow-md transition-shadow"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  {skill}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Portfolio */}
        {profile.portfolioUrls.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-black flex items-center gap-3 text-right">
              <Sparkles className="w-6 h-6 text-primary" /> معرض الأعمال السابقة
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {profile.portfolioUrls.map((url, i) => (
                <motion.div
                  key={url}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="aspect-square rounded-3xl overflow-hidden shadow-lg border bg-muted"
                >
                  <img
                    src={url}
                    alt={`عمل سابق ${i + 1}`}
                    loading="lazy"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Reviews */}
        {profile.reviews.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-black flex items-center gap-3 text-right">
              <Quote className="w-6 h-6 text-primary" /> ماذا يقول العملاء
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {profile.reviews.map((r, i) => (
                <Card
                  key={i}
                  className="rounded-3xl border-none shadow-soft overflow-hidden"
                >
                  <CardContent className="p-6 space-y-4 text-right">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={cn(
                              "w-5 h-5",
                              s <= r.rating
                                ? "text-amber-500 fill-current"
                                : "text-muted-foreground/20"
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground font-bold">
                        {formatDistanceToNow(r.timestamp, {
                          addSuffix: true,
                          locale: ar,
                        })}
                      </span>
                    </div>
                    {r.comment && (
                      <p className="text-base leading-relaxed font-medium">
                        {r.comment}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground font-bold border-t pt-3">
                      — {r.clientName}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Timeline footer */}
        <section className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 rounded-3xl bg-card border">
          <div className="flex items-center gap-3 text-muted-foreground font-bold">
            <Calendar className="w-5 h-5 text-primary" />
            عضو في صنعة منذ {joined}
          </div>
          <div className="text-sm text-muted-foreground font-medium">
            يتم تحديث هذا الملف تلقائياً مع كل خدمة جديدة
          </div>
        </section>

        {/* CTA to onboard */}
        <section className="print:hidden text-center space-y-4 py-10 border-t">
          <p className="text-muted-foreground font-bold">
            تريد ملف ثقة رقمي لأعمالك؟
          </p>
          <Link to="/">
            <Button className="rounded-2xl px-10 h-14 text-lg font-black bg-primary hover:bg-primary/90 shadow-xl gap-2">
              <Share2 className="w-5 h-5" /> انضم إلى صنعة
            </Button>
          </Link>
        </section>
      </main>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: any;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <Card className="rounded-3xl border-none shadow-soft hover:shadow-lg transition-all">
      <CardContent className="p-6 text-right space-y-3">
        <div
          className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center",
            accent
          )}
        >
          <Icon className="w-6 h-6" />
        </div>
        <div className="text-3xl font-black tracking-tight">{value}</div>
        <div className="text-sm font-bold text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-8"
      dir="rtl"
    >
      <Card className="max-w-md rounded-[2.5rem] border-none shadow-glass p-10 text-center space-y-5">
        <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center">
          <ShieldCheck className="w-10 h-10 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-black">{title}</h1>
        <p className="text-muted-foreground leading-relaxed">{message}</p>
        <Link to="/">
          <Button className="rounded-xl w-full">العودة للرئيسية</Button>
        </Link>
      </Card>
    </div>
  );
}
