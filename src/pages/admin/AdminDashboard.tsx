import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import {
  Users,
  Activity,
  AlertTriangle,
  ShieldAlert,
  Search,
  Lock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
export function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const users = useQuery(api.users.listAllUsers) ?? [];
  const auditLogs = useQuery(api.requests.getAuditLogs, { limit: 10 }) ?? [];
  const toggleFreeze = useMutation(api.users.toggleUserFreeze);
  const disputes = auditLogs.filter(log => log.action === "DISPUTE_REPORTED");
  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="py-8 md:py-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-right">
          <div>
            <h2 className="text-3xl font-black">إدارة منصة صنعة</h2>
            <p className="text-muted-foreground">مراقبة العمليات في السوق الموريتاني.</p>
          </div>
          <Button variant="destructive" className="rounded-xl flex items-center gap-2 shadow-lg">
            <ShieldAlert className="w-4 h-4" /> وضع الطوارئ
          </Button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminStatCard title="إجمالي المستخدمين" value={users.length.toString()} icon={Users} color="text-primary" />
          <AdminStatCard title="العمليات المسجلة" value={auditLogs.length.toString()} icon={Activity} color="text-emerald-500" />
          <AdminStatCard title="الحسابات المجمدة" value={users.filter(u => u.isFrozen).length.toString()} icon={Lock} color="text-destructive" />
          <AdminStatCard title="النزاعات المفتوحة" value={disputes.length.toString()} icon={AlertTriangle} color="text-amber-500" />
        </div>
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="bg-muted p-1 rounded-xl w-full md:w-auto">
            <TabsTrigger value="users" className="rounded-lg px-8">المستخدمين</TabsTrigger>
            <TabsTrigger value="disputes" className="rounded-lg px-8">النزاعات</TabsTrigger>
          </TabsList>
          <TabsContent value="users">
            <Card className="rounded-3xl border-none shadow-soft overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b px-8 bg-card">
                <CardTitle className="text-xl">إدارة الحسابات</CardTitle>
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
                      <TableHead className="text-right">الحالة</TableHead>
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
                          {user.isFrozen ? <Badge variant="destructive">مجمد</Badge> : <Badge className="bg-emerald-100 text-emerald-700">نشط</Badge>}
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
            <Card className="rounded-3xl border-none shadow-soft overflow-hidden">
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="text-right">التاريخ</TableHead>
                      <TableHead className="text-right">القيمة</TableHead>
                      <TableHead className="text-right">السبب</TableHead>
                      <TableHead className="text-left">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {disputes.map((dispute) => (
                      <TableRow key={dispute._id}>
                        <TableCell className="text-right">{format(dispute.timestamp, "d MMMM", { locale: ar })}</TableCell>
                        <TableCell className="text-right font-black">250 MRU</TableCell>
                        <TableCell className="text-right text-sm">{dispute.metadata?.reason || "مشكلة في الخدمة"}</TableCell>
                        <TableCell className="text-left">
                          <Button size="sm" className="bg-emerald-600 text-white rounded-lg">إعادة المبلغ</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
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