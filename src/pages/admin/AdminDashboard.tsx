import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import {
  Users,
  Activity,
  AlertTriangle,
  ShieldAlert,
  Search,
  Lock,
  CheckCircle,
  XCircle,
  Eye,
  Smartphone,
  MapPin,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
export function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const users = useQuery(api.users.listAllUsers) ?? [];
  const pendingKYC = useQuery(api.users.listPendingKYC) ?? [];
  const auditLogs = useQuery(api.requests.getAuditLogs, { limit: 50 }) ?? [];
  const verifyWorker = useMutation(api.users.verifyWorker);
  const rejectWorker = useMutation(api.users.rejectWorker);
  const toggleFreeze = useMutation(api.users.toggleUserFreeze);
  const emergencyLogs = auditLogs.filter(log => log.action === "EMERGENCY_SOS");
  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handleApprove = async (userId: any) => {
    try {
      await verifyWorker({ userId });
      toast.success("تم توثيق الفني");
    } catch (err) {
      toast.error("فشل التوثيق");
    }
  };
  const handleReject = async (userId: any) => {
    const reason = window.prompt("سبب الرفض:");
    if (!reason) return;
    try {
      await rejectWorker({ userId, reason });
      toast.success("تم رفض الطلب");
    } catch (err) {
      toast.error("فشل العملية");
    }
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="py-8 md:py-10 space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-right">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-gradient-primary tracking-tight">إدارة صنعة</h2>
            <p className="text-muted-foreground font-medium">نظام المراقبة والتحكم المركزي - موريتانيا</p>
          </div>
          <Button variant="destructive" className="rounded-2xl px-8 py-6 text-lg font-black shadow-2xl animate-pulse flex items-center gap-3">
            <ShieldAlert className="w-6 h-6" /> تجميد شامل (Kill Switch)
          </Button>
        </header>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminStatCard title="إجمالي المستخدمين" value={users.length.toString()} icon={Users} color="text-primary" />
          <AdminStatCard title="توثيق معلق" value={pendingKYC.length.toString()} icon={CheckCircle} color="text-emerald-600" />
          <AdminStatCard title="حسابات مجمدة" value={users.filter(u => u.isFrozen).length.toString()} icon={Lock} color="text-destructive" />
          <AdminStatCard title="حالات طوارئ" value={emergencyLogs.length.toString()} icon={AlertTriangle} color="text-red-600" />
        </div>
        <Tabs defaultValue="kyc" className="space-y-6">
          <TabsList className="bg-muted/50 p-1 rounded-2xl h-14 w-full justify-start overflow-x-auto">
            <TabsTrigger value="kyc" className="rounded-xl px-10 font-bold data-[state=active]:shadow-lg">المصادقة ({pendingKYC.length})</TabsTrigger>
            <TabsTrigger value="users" className="rounded-xl px-10 font-bold">المستخدمين</TabsTrigger>
            <TabsTrigger value="emergency" className="rounded-xl px-10 font-bold text-red-600">الطوارئ ({emergencyLogs.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="kyc">
            <Card className="rounded-[2.5rem] shadow-soft overflow-hidden border-none">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="text-right">الفني</TableHead>
                    <TableHead className="text-right">الهاتف</TableHead>
                    <TableHead className="text-right">مستند الهوية</TableHead>
                    <TableHead className="text-left">الإجراء</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingKYC.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-20 text-muted-foreground font-bold text-lg">لا توجد طلبات حالية</TableCell></TableRow>
                  ) : (
                    pendingKYC.map((u) => (
                      <TableRow key={u._id} className="hover:bg-muted/10">
                        <TableCell className="text-right font-black text-lg py-6">{u.name}</TableCell>
                        <TableCell className="text-right font-medium">{u.phone}</TableCell>
                        <TableCell className="text-right">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="secondary" size="sm" className="rounded-xl gap-2 h-10 px-4">
                                <Eye className="w-4 h-4" /> عرض الصورة
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl bg-black border-none p-0 overflow-hidden rounded-[2rem]">
                              <img src={u.fileUrl || ""} alt="ID Document" className="w-full h-auto max-h-[80vh] object-contain" />
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                        <TableCell className="text-left flex gap-2 h-full py-6">
                          <Button size="sm" onClick={() => handleApprove(u._id)} className="bg-emerald-600 hover:bg-emerald-700 rounded-xl px-6 font-bold shadow-md">قبول</Button>
                          <Button size="sm" onClick={() => handleReject(u._id)} variant="destructive" className="rounded-xl px-6 font-bold">رفض</Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
          <TabsContent value="users">
            <Card className="rounded-[2.5rem] shadow-soft border-none overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b px-8 py-6">
                <CardTitle className="text-xl font-black">قاعدة بيانات المستخدمين</CardTitle>
                <div className="relative w-80">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input placeholder="بحث بالاسم أو رقم الهاتف..." className="pr-10 rounded-2xl h-12 bg-secondary/50 border-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
              </CardHeader>
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="text-right">الاسم والهاتف</TableHead>
                    <TableHead className="text-right">الدور</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-left">التحكم</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell className="text-right py-6">
                        <div className="font-black text-lg">{user.name || "مستخدم جديد"}</div>
                        <div className="text-sm text-muted-foreground">{user.phone}</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className="rounded-full px-4">{user.role === 'worker' ? 'فني' : user.role === 'admin' ? 'مدير' : 'عميل'}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2">
                           {user.kycStatus === 'verified' && <Badge className="bg-emerald-100 text-emerald-700 rounded-full">موثق</Badge>}
                           {user.isFrozen && <Badge variant="destructive" className="rounded-full">مجمد</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="text-left">
                        <Button variant="ghost" className={cn("rounded-xl font-bold h-10", user.isFrozen ? "text-emerald-600" : "text-destructive")} onClick={() => toggleFreeze({ userId: user._id })}>
                          {user.isFrozen ? "فك التجميد" : "تجميد الحساب"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
          <TabsContent value="emergency">
             <Card className="rounded-[2.5rem] shadow-soft border-none overflow-hidden">
               <Table>
                 <TableHeader className="bg-red-50">
                   <TableRow>
                     <TableHead className="text-right text-red-600 font-black">المستخدم</TableHead>
                     <TableHead className="text-right text-red-600 font-black">الموقع</TableHead>
                     <TableHead className="text-right text-red-600 font-black">الوقت</TableHead>
                     <TableHead className="text-left text-red-600 font-black">الإجراء</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {emergencyLogs.length === 0 ? (
                     <TableRow><TableCell colSpan={4} className="text-center py-20 text-muted-foreground font-bold">لا توجد بلاغات استغاثة</TableCell></TableRow>
                   ) : (
                     emergencyLogs.map(log => (
                       <TableRow key={log._id} className="bg-red-50/20 animate-pulse">
                         <TableCell className="text-right font-black">
                            {users.find(u => u._id === log.userId)?.name || "مستخدم غير معروف"}
                            <div className="text-xs text-muted-foreground">{users.find(u => u._id === log.userId)?.phone}</div>
                         </TableCell>
                         <TableCell className="text-right">
                            <Button variant="link" className="p-0 h-auto text-red-600 font-bold gap-1">
                               <MapPin className="w-4 h-4" /> عرض على الخريطة
                            </Button>
                         </TableCell>
                         <TableCell className="text-right font-medium">{new Date(log.timestamp).toLocaleTimeString('ar-MR')}</TableCell>
                         <TableCell className="text-left">
                            <Button size="sm" className="rounded-xl bg-red-600 shadow-lg">اتصال فوري</Button>
                         </TableCell>
                       </TableRow>
                     ))
                   )}
                 </TableBody>
               </Table>
             </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
function AdminStatCard({ title, value, icon: Icon, color }: any) {
  return (
    <Card className="rounded-[2rem] border-none shadow-soft hover:shadow-xl transition-shadow bg-card">
      <CardContent className="p-8 space-y-4 text-right">
        <div className={cn("w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center shadow-inner", color)}><Icon className="w-6 h-6" /></div>
        <div><p className="text-sm text-muted-foreground font-black">{title}</p><p className="text-4xl font-black">{value}</p></div>
      </CardContent>
    </Card>
  );
}