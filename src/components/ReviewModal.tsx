import React, { useState } from "react";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
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
  const submitReview = useMutation(api.requests.submitReview);
  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("يرجى اختيار تقييم قبل الإرسال");
      return;
    }
    setSubmitting(true);
    try {
      await submitReview({ requestId, rating, comment });
      toast.success("شكراً لتقييمك! يساعدنا ذلك على تحسين الخدمة.");
      onClose();
    } catch (err) {
      toast.error("فشل في إرسال التقييم");
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-md rounded-3xl" dir="rtl">
        <DialogHeader className="text-right space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
             <Star className="w-8 h-8 text-primary fill-current" />
          </div>
          <DialogTitle className="text-2xl font-black text-center">كيف كانت تجربتك؟</DialogTitle>
          <DialogDescription className="text-center text-base">
            تقييمك يساعدنا على ضمان جودة الفنيين الموثقين في صنعة.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center gap-2 py-6">
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
                  "w-10 h-10 transition-colors",
                  star <= rating ? "text-amber-500 fill-current" : "text-muted border-none"
                )} 
              />
            </motion.button>
          ))}
        </div>
        <div className="space-y-4">
          <p className="text-sm font-bold text-right">أضف ملاحظاتك (اختياري):</p>
          <Textarea 
            placeholder="أخبرنا المزيد عن جودة العمل..."
            className="rounded-2xl resize-none text-right"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>
        <DialogFooter className="mt-6 flex-row gap-3">
          <Button 
            onClick={handleSubmit} 
            disabled={submitting}
            className="flex-1 rounded-xl h-12 text-lg"
          >
            إرسال التقييم
          </Button>
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="rounded-xl h-12"
          >
            تخطي
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
import { cn } from "@/lib/utils";