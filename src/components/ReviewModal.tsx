import React, { useState } from "react";
import { Star, CheckCircle } from "lucide-react";
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
      toast.error("يرجى اختيار عدد النجوم");
      return;
    }
    setSubmitting(true);
    try {
      await submitReview({ requestId, rating, comment });
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (err) {
      toast.error("فشل في إرسال التقييم");
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && !submitting && onClose()}>
      <DialogContent className="max-w-md rounded-[2.5rem] p-8" dir="rtl">
        <AnimatePresence mode="wait">
          {!success ? (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <DialogHeader className="text-right space-y-4">
                <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto border border-amber-100">
                  <Star className="w-8 h-8 text-amber-500 fill-current" />
                </div>
                <DialogTitle className="text-2xl font-black text-center">تقييم الخدمة</DialogTitle>
                <DialogDescription className="text-center text-base">
                  كيف كانت تجربتك مع الفني؟ تقييمك يساعدنا في الحفاظ على جودة صنعة في موريتانيا.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-center gap-3 py-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={cn(
                        "w-12 h-12 transition-all duration-300",
                        star <= rating ? "text-amber-500 fill-current drop-shadow-md" : "text-muted border-none opacity-30"
                      )}
                    />
                  </motion.button>
                ))}
              </div>
              <div className="space-y-3">
                <p className="text-sm font-bold text-right">أضف ملاحظاتك (اختياري):</p>
                <Textarea
                  placeholder="اكتب تجربتك هنا بصدق..."
                  className="rounded-2xl resize-none text-right bg-muted/50 border-none h-24"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>
              <DialogFooter className="flex-row gap-3 mt-4">
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || rating === 0}
                  className="flex-1 rounded-xl h-12 text-lg font-bold shadow-lg"
                >
                  إرسال التقييم
                </Button>
                <Button
                  variant="ghost"
                  onClick={onClose}
                  disabled={submitting}
                  className="rounded-xl h-12"
                >
                  تخطي
                </Button>
              </DialogFooter>
            </motion.div>
          ) : (
            <motion.div key="success" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-12 space-y-6">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-emerald-700">شكراً لك!</h3>
                <p className="text-muted-foreground">تم تسجيل تقييمك بنجاح. يومك سعيد.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}