import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { 
  Wallet, 
  ArrowUpRight, 
  TrendingUp, 
  CreditCard, 
  History,
  Building2,
  Smartphone,
  CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip } from "recharts";
export function WalletPage() {
  const earnings = useQuery(api.requests.getWorkerEarnings) ?? { total: 0, weekly: 0, chartData: [] };
  const requestPayout = useMutation(api.users.requestPayout);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [method, setMethod] = useState<"Bankily" | "Masrivi" | "Bank">("Bankily");
  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("يرجى إدخال مبلغ صحيح");
      return;
    }
    if (amount > earnings.total) {
      toast.error("المبلغ يتجاوز رصيدك الحالي");
      return;
    }
    try {
      await requestPayout({ amount, method });
      toast.success("تم إرسال طلب السحب بنجاح!");
      setIsWithdrawOpen(false);
      setWithdrawAmount("");
    } catch (err) {
      toast.error("فشل في إرسال طلب السحب");
    }
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="py-8 md:py-12 space-y-8">
        <header className="text-right">
          <h1 className="text-3xl font-black">المحفظة المالية</h1>
          <p className="text-muted-foreground">إدارة أرباحك وعمليات السحب في موريتانيا.</p>
        </header>
        <div className="grid lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 rounded-[2.5rem] shadow-soft border-none bg-primary text-primary-foreground relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mt-32 blur-3xl" />
            <CardContent className="p-10 flex flex-col justify-between h-full relative z-10">
              <div className="flex items-center justify-between">
                <Wallet className="w-10 h-10 opacity-50" />
                <Badge className="bg-white/20 text-white hover:bg-white/30 rounded-full">الرصيد المتاح</Badge>
              </div>
              <div className="mt-8 space-y-2">
                <p className="text-5xl font-black">{earnings.total} <span className="text-2xl font-normal opacity-70">MRU</span></p>
                <p className="text-sm opacity-60">سيتم تحديث الرصيد تلقائياً عند إتمام كل عملية.</p>
              </div>
              <div className="mt-10">
                <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-white text-primary hover:bg-white/90 rounded-2xl h-14 text-xl font-bold shadow-xl">
                      سحب الرصيد الآن <ArrowUpRight className="mr-2 w-6 h-6" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-3xl max-w-md" dir="rtl">
                    <DialogHeader className="text-right">
                      <DialogTitle className="text-2xl font-black">طلب سحب جديد</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 py-4 text-right">
                      <div className="space-y-2">
                        <Label>طريقة السحب</Label>
                        <Select value={method} onValueChange={(v: any) => setMethod(v)}>
                          <SelectTrigger className="rounded-xl h-12 bg-secondary border-none">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-none shadow-xl">
                            <SelectItem value="Bankily">بانكيلي (Bankily)</SelectItem>
                            <SelectItem value="Masrivi">مصرفي (Masrivi)</SelectItem>
                            <SelectItem value="Bank">تحويل بنكي</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>المبلغ (MRU)</Label>
                        <Input 
                          type="number" 
                          placeholder="0.00" 
                          value={withdrawAmount}
                          onChange={e => setWithdrawAmount(e.target.value)}
                          className="rounded-xl h-12 bg-secondary border-none text-left font-bold"
                        />
                      </div>
                      <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-xs text-amber-800 leading-relaxed">
                        تتم معالجة طلبات السحب خلال 24 ساعة عمل. الحد الأدنى للسحب هو 50 MRU.
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleWithdraw} className="w-full h-12 rounded-xl text-lg font-bold">تأكيد السحب</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-[2.5rem] shadow-soft border-none p-8 flex flex-col justify-between">
            <div className="space-y-4 text-right">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">أرباح الأسبوع</h3>
              <p className="text-4xl font-black text-emerald-600">{earnings.weekly} MRU</p>
              <p className="text-sm text-muted-foreground">زيادة بنسبة 12% عن الأسبوع الماضي.</p>
            </div>
            <div className="h-32 mt-6">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={earnings.chartData}>
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                 </BarChart>
               </ResponsiveContainer>
            </div>
          </Card>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="md:col-span-2 rounded-[2.5rem] shadow-soft border-none overflow-hidden">
             <CardHeader className="px-8 py-6 border-b flex flex-row items-center justify-between">
               <CardTitle className="text-xl flex items-center gap-2">
                 <History className="w-5 h-5 text-primary" /> سجل المعاملات
               </CardTitle>
               <Button variant="ghost" className="text-primary font-bold">عرض الكل</Button>
             </CardHeader>
             <CardContent className="p-0">
                <div className="divide-y">
                   {/* Mock transaction entries */}
                   <TransactionItem title="إصلاح سباكة - تفرغ زينة" date="أمس، 10:30 م" amount={+250} type="income" />
                   <TransactionItem title="سحب رصيد - بانكيلي" date="23 مايو، 2:15 م" amount={-500} type="withdrawal" />
                   <TransactionItem title="أعمال كهرباء - كصر" date="22 مايو، 11:00 ص" amount={+150} type="income" />
                </div>
             </CardContent>
          </Card>
          <div className="space-y-6">
            <Card className="rounded-3xl shadow-soft border-none p-6 space-y-4">
              <h4 className="font-bold text-right">وسائل الدفع المفعلة</h4>
              <div className="space-y-3">
                 <PaymentMethod icon={Smartphone} name="Bankily" status="verified" />
                 <PaymentMethod icon={Building2} name="Société Générale" status="verified" />
              </div>
              <Button variant="outline" className="w-full rounded-xl border-dashed">إضافة وسيلة دفع</Button>
            </Card>
            <Card className="rounded-3xl shadow-soft border-none p-6 bg-accent/5">
               <div className="flex gap-4 items-start text-right">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0"><CheckCircle2 className="w-5 h-5" /></div>
                  <div className="space-y-1">
                     <p className="text-sm font-bold">صنعة تضمن حقوقك</p>
                     <p className="text-xs text-muted-foreground">يتم حفظ الأموال في محفظة صنعة حتى يتم تأكيد استلام الخدمة من قبل العميل.</p>
                  </div>
               </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
function TransactionItem({ title, date, amount, type }: any) {
  return (
    <div className="flex items-center justify-between p-6">
      <div className="text-right">
        <p className="font-bold">{title}</p>
        <p className="text-xs text-muted-foreground">{date}</p>
      </div>
      <p className={cn(
        "text-lg font-black",
        type === 'income' ? "text-emerald-600" : "text-destructive"
      )}>
        {type === 'income' ? '+' : '-'}{Math.abs(amount)} MRU
      </p>
    </div>
  );
}
function PaymentMethod({ icon: Icon, name, status }: any) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-secondary">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-primary shadow-sm"><Icon className="w-4 h-4" /></div>
        <p className="font-medium text-sm">{name}</p>
      </div>
      <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-none text-[10px]">موثق</Badge>
    </div>
  );
}