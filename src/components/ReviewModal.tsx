import React, { useState } from "react";
import { Star, CheckCircle, Award } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Id } from "@convex/_generated/dataModel";
import { toast } from "sonner";
interface ReviewModalProps {
  requestId: Id<"service_requests">;
  isOpen: boolean;
  onClose: () => void;
}
export function ReviewModal({ requestId, isOpen, onClose }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const submitReview = useMutation(api.requests.submitReview);
  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("يرجى اختيار التقييم بالنجوم");
      return;
    }
    setSubmitting(true);
    try {
      await submitReview({ requestId, rating, comment });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 3000);
    } catch (err) {
      toast.error("فشل في إرسال التقييم، حاول مجدداً.");
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={(val) => {
      // Prevent accidental dismissal if not finished, but allow if successful
      if (success) onClose();
    }}>
      <DialogContent className="max-w-lg rounded-[3rem] p-10 border-none shadow-glass" dir="rtl">
        <AnimatePresence mode="wait">
          {!success ? (
            <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
              <DialogHeader className="text-center space-y-6">
                <div className="w-24 h-24 bg-amber-50 rounded-[2rem] flex items-center justify-center mx-auto border-4 border-white shadow-xl relative overflow-hidden">
                  <Star className="w-12 h-12 text-amber-500 fill-current" />
                  <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 to-transparent" />
                </div>
                <div className="space-y-2">
                  <DialogTitle className="text-3xl font-black text-center tracking-tight">تقييم الخدمة</DialogTitle>
                  <DialogDescription className="text-center text-lg font-medium text-muted-foreground leading-relaxed">
                    كيف كانت تجربتك؟ تقييمك يساهم في تحسين جودة "صنعة" في موريتانيا.
                  </DialogDescription>
                </div>
              </DialogHeader>
              <div className="flex justify-center gap-4 py-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    whileHover={{ scale: 1.3, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={cn(
                        "w-14 h-14 transition-all duration-300 drop-shadow-sm",
                        star <= rating ? "text-amber-500 fill-current scale-110" : "text-muted-foreground/20"
                      )}
                    />
                  </motion.button>
                ))}
              </div>
              <div className="space-y-4">
                <label className="text-lg font-black block text-right">أضف ملاحظاتك (اختياري):</label>
                <Textarea
                  placeholder="اكتب رأيك بصدق هنا..."
                  className="rounded-[2rem] resize-none text-right bg-muted/30 border-none h-32 text-lg p-6 focus:ring-2 focus:ring-primary transition-all"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  disabled={submitting}
                />
              </div>
              <DialogFooter className="flex-row gap-4 mt-8">
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || rating === 0}
                  className="flex-1 rounded-[1.5rem] h-16 text-xl font-black shadow-2xl bg-primary hover:bg-primary/90 transition-all"
                >
                  {submitting ? "جاري الإرسال..." : "تأكيد التقييم"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={onClose}
                  disabled={submitting}
                  className="rounded-[1.5rem] h-16 text-lg font-bold hover:bg-muted/50"
                >
                  تخطي الآن
                </Button>
              </DialogFooter>
            </motion.div>
          ) : (
            <motion.div key="success" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-16 space-y-8">
              <div className="w-28 h-28 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-2xl animate-bounce">
                <CheckCircle className="w-16 h-16" />
              </div>
              <div className="space-y-4">
                <h3 className="text-4xl font-black text-emerald-800">شكراً جزيلاً!</h3>
                <p className="text-xl text-muted-foreground font-medium leading-relaxed max-w-xs mx-auto">
                  تم تسجيل تقييمك بنجاح وتحديث درجة ثقة الفني. مساهمتك تهمنا.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 text-primary font-black text-lg bg-primary/5 py-4 px-8 rounded-2xl">
                 <Award className="w-6 h-6" /> صنعة تضمن الجودة
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}