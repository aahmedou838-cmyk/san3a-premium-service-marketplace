import React from "react";
import { 
  Users, 
  Activity, 
  AlertTriangle, 
  ShieldAlert,
  Search,
  MoreHorizontal,
  UserX
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
export function AdminDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black">مركز التحكم الإداري</h2>
            <p className="text-muted-foreground">إدارة المنصة، مراقبة الطلبات، وحماية النظام.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="destructive" className="rounded-xl flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> وضع الطوارئ
            </Button>
          </div>
        </div>
        {/* Global Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminStatCard title="إجمالي المستخدمين" value="2,543" sub="↑ 12% من الشهر الماضي" icon={Users} color="text-primary" />
          <AdminStatCard title="نشاط اليوم" value="142" sub="طلبات جارية الآن" icon={Activity} color="text-emerald-500" />
          <AdminStatCard title="نزاعات مفتوحة" value="5" sub="تتطلب تدخل فوري" icon={AlertTriangle} color="text-destructive" />
          <AdminStatCard title="رصيد المنصة" value="45.2K" sub="ر.س - العمولات المحصلة" icon={ShieldAlert} color="text-amber-500" />
        </div>
        {/* User Management Table */}
        <Card className="rounded-3xl border-none shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between border-b px-8">
            <CardTitle className="text-xl">إدارة الحسابات</CardTitle>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="بحث عن مستخدم..." className="pl-10 rounded-xl" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="text-right">المستخدم</TableHead>
                  <TableHead className="text-right">الدور</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">تاريخ التسجيل</TableHead>
                  <TableHead className="text-left">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <UserRow name="محمد خالد" email="m.khaled@example.com" role="worker" status="verified" date="2024/05/12" />
                <UserRow name="سارة السعيد" email="sara.s@example.com" role="client" status="active" date="2024/05/15" />
                <UserRow name="يوسف أحمد" email="yousef.a@example.com" role="worker" status="pending" date="2024/05/18" />
                <UserRow name="خالد عمر" email="k.omar@example.com" role="worker" status="frozen" date="2023/12/01" />
              </TableBody>
            </Table>
          </CardContent>
        </Card>
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
function UserRow({ name, email, role, status, date }: any) {
  const getStatusBadge = (s: string) => {
    switch (s) {
      case "verified": return <Badge className="bg-emerald-100 text-emerald-700">موثق</Badge>;
      case "frozen": return <Badge variant="destructive">مجمد</Badge>;
      case "pending": return <Badge className="bg-amber-100 text-amber-700">قيد المراجعة</Badge>;
      default: return <Badge variant="secondary">نشط</Badge>;
    }
  };
  return (
    <TableRow className="hover:bg-accent/5 transition-colors">
      <TableCell className="text-right px-8 py-4">
        <div className="font-bold">{name}</div>
        <div className="text-xs text-muted-foreground">{email}</div>
      </TableCell>
      <TableCell className="text-right">
        {role === "worker" ? "فني" : "عميل"}
      </TableCell>
      <TableCell className="text-right">
        {getStatusBadge(status)}
      </TableCell>
      <TableCell className="text-right text-muted-foreground text-sm">
        {date}
      </TableCell>
      <TableCell className="text-left px-8">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
            <UserX className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
import { cn } from "@/lib/utils";