import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import {
  Users,
  Activity,
  AlertTriangle,
  ShieldAlert,
  Search,
  MoreHorizontal,
  UserX,
  RefreshCcw,
  CheckCircle2,
  Lock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
export function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const users = useQuery(api.users.listAllUsers) ?? [];
  const auditLogs = useQuery(api.requests.getAuditLogs, { limit: 10 }) ?? [];
  const toggleFreeze = useMutation(api.users.toggleUserFreeze);
  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black">مركز التحكم الإداري</h2>
            <p className="text-muted-foreground">إدارة المنصة، مراقبة الطلبات، وحماية النظام.</p>
          </div>
          <div className="flex gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="rounded-xl flex items-center gap-2 shadow-lg">
                  <ShieldAlert className="w-4 h-4" /> وضع الطوارئ
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent dir="rtl">
                <AlertDialogHeader>
                  <AlertDialogTitle>تفعيل وضع الطوارئ؟</AlertDialogTitle>
                  <AlertDialogDescription>
                    هذا الإجراء سيقوم بتعليق كافة العمليات المالية والطلبات الجارية فوراً. هل أنت متأكد؟
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-row-reverse gap-2">
                  <AlertDialogAction className="bg-destructive">نعم، تفعيل</AlertDialogAction>
                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminStatCard title="إجمالي المستخدمين" value={users.length.toString()} sub="نشطون حالياً" icon={Users} color="text-primary" />
          <AdminStatCard title="سجلات النظام" value={auditLogs.length.toString()} sub="عمليات مسجلة" icon={Activity} color="text-emerald-500" />
          <AdminStatCard title="تجميد الحسابات" value={users.filter(u => u.isFrozen).length.toString()} sub="حسابات محظورة" icon={Lock} color="text-destructive" />
          <AdminStatCard title="طلبات التوثيق" value={users.filter(u => u.kycStatus === 'pending').length.toString()} sub="تنتظر المراجعة" icon={CheckCircle2} color="text-amber-500" />
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 rounded-3xl border-none shadow-soft overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b px-8 bg-card">
              <CardTitle className="text-xl">إدارة الحسابات</CardTitle>
              <div className="relative w-64">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="بحث عن مستخدم..." className="pr-10 rounded-xl" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="text-right">المستخدم</TableHead>
                    <TableHead className="text-right">الدور</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-left">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user._id} className="hover:bg-accent/5">
                      <TableCell className="text-right py-4">
                        <div className="font-bold">{user.name || "مستخدم جديد"}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline">{user.role === 'worker' ? 'فني' : user.role === 'admin' ? 'مدير' : 'عميل'}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {user.isFrozen ? (
                          <Badge variant="destructive">مجمد</Badge>
                        ) : (
                          <Badge className="bg-emerald-100 text-emerald-700">{user.kycStatus === 'verified' ? 'موثق' : 'نشط'}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-left">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn("rounded-lg", user.isFrozen ? "text-emerald-600" : "text-destructive")}
                          onClick={() => toggleFreeze({ userId: user._id })}
                        >
                          {user.isFrozen ? "فك التجميد" : "تجميد الحساب"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-none shadow-soft flex flex-col h-full">
            <CardHeader>
              <CardTitle className="text-lg">سجل العمليات الأخير</CardTitle>
              <CardDescription>آخر 10 إجراءات تمت على المنصة</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-1">
              {auditLogs.map((log) => (
                <div key={log._id} className="flex gap-4 pb-4 border-b last:border-0">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                    <RefreshCcw className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{log.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(log.timestamp, "d MMMM HH:mm", { locale: ar })}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
function AdminStatCard({ title, value, sub, icon: Icon, color }: any) {
  return (
    <Card className="rounded-2xl border-none shadow-soft">
      <CardContent className="p-6 space-y-2">
        <div className={cn("w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center", color)}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium">{title}</p>
          <p className="text-2xl font-black">{value}</p>
          <p className="text-[10px] text-muted-foreground mt-1">{sub}</p>
        </div>
      </CardContent>
    </Card>
  );
}