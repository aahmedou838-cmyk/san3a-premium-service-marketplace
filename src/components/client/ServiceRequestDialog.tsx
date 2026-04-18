import React, { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mic, Square, Play, Trash2, MapPin, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Id } from "@convex/_generated/dataModel";
import { getCurrentPosition, hapticTap } from "@/lib/native";

interface Props {
  serviceName: string | null;
  open: boolean;
  onClose: () => void;
  onSubmitted?: (requestId: Id<"service_requests">) => void;
}

export function ServiceRequestDialog({
  serviceName,
  open,
  onClose,
  onSubmitted,
}: Props) {
  const pricing = useQuery(api.requests.getServicePricing) || {};
  const createRequest = useMutation(api.requests.createRequest);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const saveFileMetadata = useMutation(api.files.saveFileMetadata);

  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("نواكشوط، تفرغ زينة");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const range = serviceName
    ? (pricing as any)[serviceName] || { min: 200, max: 700 }
    : { min: 200, max: 700 };

  useEffect(() => {
    if (!open) return;
    getCurrentPosition()
      .then((coords) => setLocation(coords))
      .catch(() => {});
  }, [open]);

  useEffect(() => {
    if (!open) {
      setDescription("");
      setAudioBlob(null);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
      setIsRecording(false);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setIsRecording(true);
    } catch {
      toast.error("تعذر الوصول للميكروفون");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const clearAudio = () => {
    setAudioBlob(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
  };

  const handleSubmit = async () => {
    if (!serviceName) return;
    hapticTap();
    setSubmitting(true);
    try {
      let voiceNoteFileId: Id<"files"> | undefined;
      if (audioBlob) {
        const url = await generateUploadUrl();
        const result = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "audio/webm" },
          body: audioBlob,
        });
        const { storageId } = await result.json();
        const saved = await saveFileMetadata({
          storageId,
          filename: "voice-note.webm",
          mimeType: "audio/webm",
          size: audioBlob.size,
          description: "Service request voice note",
        });
        voiceNoteFileId = saved.fileId;
      }

      const requestId = await createRequest({
        serviceType: serviceName,
        description: description.trim() || undefined,
        voiceNoteFileId,
        address,
        location: location || undefined,
      });
      toast.success("تم إرسال طلبك! جاري البحث عن أقرب فني…");
      onSubmitted?.(requestId);
      onClose();
    } catch (err: any) {
      toast.error(err.message || "فشل في إنشاء الطلب");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg rounded-[2.5rem] p-8" dir="rtl">
        <DialogHeader className="text-right space-y-2">
          <DialogTitle className="text-2xl font-black">
            طلب خدمة: {serviceName || ""}
          </DialogTitle>
          <DialogDescription className="text-base">
            صف المشكلة بإيجاز — يمكنك الكتابة أو تسجيل مقطع صوتي.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-3">
          {/* Price range */}
          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-between">
            <div className="text-right">
              <p className="text-xs font-bold text-muted-foreground">
                نطاق السعر التقريبي
              </p>
              <p className="text-2xl font-black text-primary">
                {range.min} - {range.max}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  MRU
                </span>
              </p>
            </div>
            <div className="text-[11px] text-muted-foreground leading-tight text-left max-w-[40%]">
              يُحدد السعر النهائي بعد المعاينة، وبموافقة الطرفين.
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-bold">وصف المشكلة (اختياري)</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="مثال: تسريب في أنبوب الحمام الرئيسي، يحتاج تبديل فوراً."
              className="rounded-2xl text-right bg-muted/30 border-none min-h-24 p-4"
              dir="rtl"
            />
          </div>

          {/* Voice note */}
          <div className="space-y-2">
            <label className="text-sm font-bold">
              مقطع صوتي (اختياري) — اشرح المشكلة بلهجتك
            </label>
            {!audioUrl ? (
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={cn(
                  "w-full h-16 rounded-2xl flex items-center justify-center gap-3 font-bold transition-all text-lg",
                  isRecording
                    ? "bg-red-500 text-white shadow-lg animate-pulse"
                    : "bg-muted hover:bg-muted/80"
                )}
              >
                {isRecording ? (
                  <>
                    <Square className="w-5 h-5 fill-current" /> إيقاف التسجيل
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5" /> ابدأ تسجيل صوتي
                  </>
                )}
              </button>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-2xl">
                <audio controls src={audioUrl} className="flex-1 h-10" />
                <button
                  onClick={clearAudio}
                  className="w-10 h-10 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 flex items-center justify-center"
                  aria-label="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Location */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/30 text-sm">
            <MapPin className="w-5 h-5 text-primary shrink-0" />
            <div className="flex-1 text-right">
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-transparent font-bold outline-none"
                dir="rtl"
              />
              <div className="text-[10px] text-muted-foreground">
                {location
                  ? `موقع GPS: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
                  : "لم يتم تحديد الموقع الدقيق"}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full h-14 rounded-2xl text-lg font-black gap-2 shadow-lg"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            {submitting ? "جاري الإرسال…" : "إرسال الطلب"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
