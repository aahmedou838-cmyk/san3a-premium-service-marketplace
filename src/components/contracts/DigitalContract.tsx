import React from "react";
import { Check, ShieldCheck, FileText, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
interface DigitalContractProps {
  serviceType: string;
  workerName: string;
  clientName: string;
  estimatedPrice?: number;
  requestId: string;
  onAccept: () => void;
  onCancel: () => void;
}
export function DigitalContract({
  serviceType,
  workerName,
  clientName,
  estimatedPrice,
  onAccept,
  onCancel
}: DigitalContractProps) {
  const [accepted, setAccepted] = React.useState(false);
  return (
    <Card className="max-w-xl mx-auto rounded-[2rem] border-2 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
      <CardHeader className="bg-primary text-primary-foreground p-8 text-right space-y-2">
        <div className="flex items-center justify-between">
          <ShieldCheck className="w-8 h-8 opacity-50" />
          <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">عقد رقمي موثق</Badge>
        </div>
        <CardTitle className="text-2xl font-black">اتفاقية تقديم خدمة منزلية</CardTitle>
        <CardDescription className="text-primary-foreground/80">هذا العقد ملزم قانوناً بمجرد الموافقة الرقمية</CardDescription>
      </CardHeader>
      <CardContent className="p-8 space-y-6 text-right">
        <div className="grid grid-cols-2 gap-4 bg-muted/50 p-4 rounded-2xl border border-dashed border-primary/20">
          <div>
            <p className="text-xs text-muted-foreground">مقدم الخدمة</p>
            <p className="font-bold">{workerName}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">طالب الخدمة</p>
            <p className="font-bold">{clientName}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">نوع الخدمة</p>
            <p className="font-bold">{serviceType}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">التكلفة التقديرية</p>
            <p className="font-bold text-primary">{estimatedPrice ? `${estimatedPrice} ر.س` : "يحدد لاحقاً"}</p>
          </div>
        </div>
        <div className="space-y-4">
          <h4 className="font-bold flex items-center gap-2">
            <FileText className="w-4 h-4" /> شروط الخدمة:
          </h4>
          <ul className="text-sm space-y-2 text-muted-foreground pr-4 list-disc">
            <li>يلتزم مقدم الخدمة بإتمام العمل بجودة واحترافية عالية.</li>
            <li>يضمن مقدم الخدمة القطع المستخدمة لمدة 30 يوماً من تاريخ التنفيذ.</li>
            <li>في حال عدم رضا العميل، يتم رفع شكوى خلال 24 ساعة من انتهاء العمل.</li>
            <li>المنصة ليست طرفاً في العقد ولكنها تضمن توثيق المعاملات وتسهيل المدفوعات.</li>
          </ul>
        </div>
        <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 leading-relaxed">
            بضغطك على موافقة، أنت تقر بصحة البيانات وتفوض المنصة بخصم القيمة المتفق عليها عند الانتهاء.
          </p>
        </div>
        <div className="flex items-center space-x-reverse space-x-2">
          <Checkbox id="terms" checked={accepted} onCheckedChange={(val) => setAccepted(val === true)} />
          <Label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            أوافق على كافة الشروط والأحكام المذكورة أعلاه كخلفية قانونية للخدمة.
          </Label>
        </div>
      </CardContent>
      <CardFooter className="p-8 pt-0 flex gap-4">
        <Button onClick={onAccept} disabled={!accepted} className="flex-1 rounded-xl h-12 text-lg shadow-lg">
          موافقة وتوقيع <Check className="mr-2 w-5 h-5" />
        </Button>
        <Button onClick={onCancel} variant="ghost" className="rounded-xl h-12">إلغاء الطلب</Button>
      </CardFooter>
    </Card>
  );
}
import { Badge } from "@/components/ui/badge";