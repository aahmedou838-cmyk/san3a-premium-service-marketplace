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
  Smartphone
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { toast } from "sonner";
export function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const users = useQuery(api.users.listAllUsers) ?? [];
  const pendingKYC = useQuery(api.users.listPendingKYC) ?? [];
  const auditLogs = useQuery(api.requests.getAuditLogs, { limit: 20 }) ?? [];
  const verifyWorker = useMutation(api.users.verifyWorker);
  const rejectWorker = useMutation(api.users.rejectWorker);
  const toggleFreeze = useMutation(api.users.toggleUserFreeze);
  const disputes = auditLogs.filter(log => log.action === "DISPUTE_REPORTED");
  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handleApprove = async (userId: any) => {
    try {
      await verifyWorker({ userId });
      toast.success("تم توثيق الفني بنجاح");
    } catch (err) {
      toast.error("فشل التوثيق");
    }
  };
  const handleReject = async (userId: any) => {
    const reason = window.prompt("سبب الرفض:");
    if (!reason) return;
    try {
      await rejectWorker({ userId, reason });
      toast.success("تم رفض الطلب وإرسال السبب");
    } catch (err) {
      toast.error("فشل العملية");
    }
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="py-8 md:py-10 space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-right">
          <div>
            <h2 className="text-3xl font-black">إدارة صنعة (San3a)</h2>
            <p className="text-muted-foreground">مركز التحكم والتحقق من الهوية المهنية.</p>
          </div>
          <Button variant="destructive" className="rounded-xl flex items-center gap-2 shadow-lg">
            <ShieldAlert className="w-4 h-4" /> وضع الطوارئ (Kill Switch)
          </Button>
        </header>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminStatCard title="إجمالي المستخدمين" value={users.length.toString()} icon={Users} color="text-primary" />
          <AdminStatCard title="طلبات توثيق معلقة" value={pendingKYC.length.toString()} icon={CheckCircle} color="text-emerald-500" />
          <AdminStatCard title="الحسابات المجمدة" value={users.filter(u => u.isFrozen).length.toString()} icon={Lock} color="text-destructive" />
          <AdminStatCard title="النزاعات المفتوحة" value={disputes.length.toString()} icon={AlertTriangle} color="text-amber-500" />
        </div>
        <Tabs defaultValue="kyc" className="space-y-6">
          <TabsList className="bg-muted p-1 rounded-xl">
            <TabsTrigger value="kyc" className="rounded-lg px-8">مصادقة الهوية ({pendingKYC.length})</TabsTrigger>
            <TabsTrigger value="users" className="rounded-lg px-8">إدارة المستخدمين</TabsTrigger>
            <TabsTrigger value="disputes" className="rounded-lg px-8">النزاعات</TabsTrigger>
          </TabsList>
          <TabsContent value="kyc">
            <Card className="rounded-3xl border-none shadow-soft overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="text-right">الفني</TableHead>
                    <TableHead className="text-right">الهاتف</TableHead>
                    <TableHead className="text-right">صورة الهوية</TableHead>
                    <TableHead className="text-left">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingKYC.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">لا توجد طلبات توثيق حالياً</TableCell>
                    </TableRow>
                  ) : (
                    pendingKYC.map((u) => (
                      <TableRow key={u._id}>
                        <TableCell className="text-right font-bold">{u.name}</TableCell>
                        <TableCell className="text-right"><div className="flex items-center gap-2"><Smartphone className="w-3 h-3"/> {u.phone}</div></TableCell>
                        <TableCell className="text-right">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="gap-2 rounded-lg">
                                <Eye className="w-4 h-4" /> عرض الهوية
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl bg-black border-none p-0 overflow-hidden">
                              <img src={u.fileUrl || ""} alt="ID Document" className="w-full h-auto" />
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                        <TableCell className="text-left flex gap-2">
                          <Button size="sm" onClick={() => handleApprove(u._id)} className="bg-emerald-600 hover:bg-emerald-700 rounded-lg gap-2">
                            <CheckCircle className="w-4 h-4" /> قبول
                          </Button>
                          <Button size="sm" onClick={() => handleReject(u._id)} variant="destructive" className="rounded-lg gap-2">
                            <XCircle className="w-4 h-4" /> رفض
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
          <TabsContent value="users">
            <Card className="rounded-3xl border-none shadow-soft overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b px-8 bg-card">
                <CardTitle className="text-xl">البحث في المستخدمين</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="بحث بالاسم أو الهاتف..." className="pr-10 rounded-xl" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="text-right">المستخدم</TableHead>
                      <TableHead className="text-right">الدور</TableHead>
                      <TableHead className="text-right">التوثيق</TableHead>
                      <TableHead className="text-left">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell className="text-right py-4">
                          <div className="font-bold">{user.name || "مستخدم جديد"}</div>
                          <div className="text-xs text-muted-foreground">{user.phone || user.email}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline">{user.role === 'worker' ? 'فني' : user.role === 'admin' ? 'مدير' : 'عميل'}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {user.kycStatus === 'verified' ? <Badge className="bg-emerald-100 text-emerald-700">موثق</Badge> : <Badge variant="secondary">{user.kycStatus}</Badge>}
                        </TableCell>
                        <TableCell className="text-left">
                          <Button variant="ghost" size="sm" className={cn("rounded-lg", user.isFrozen ? "text-emerald-600" : "text-destructive")} onClick={() => toggleFreeze({ userId: user._id })}>
                            {user.isFrozen ? "فك التجميد" : "تجميد الحساب"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="disputes">
            <Card className="rounded-3xl border-none shadow-soft p-20 text-center text-muted-foreground">
              <AlertTriangle className="w-16 h-16 mx-auto opacity-20 mb-4" />
              <p>سيتم تفعيل نظام التحكيم الكامل قريباً.</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
function AdminStatCard({ title, value, icon: Icon, color }: any) {
  return (
    <Card className="rounded-2xl border-none shadow-soft">
      <CardContent className="p-6 space-y-2 text-right">
        <div className={cn("w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center", color)}><Icon className="w-5 h-5" /></div>
        <div><p className="text-xs text-muted-foreground font-medium">{title}</p><p className="text-2xl font-black">{value}</p></div>
      </CardContent>
    </Card>
  );
}