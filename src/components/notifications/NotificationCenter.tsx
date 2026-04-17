import React from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  Trash2,
  MoreVertical
} from "lucide-react";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils";
export function NotificationCenter() {
  const notifications = useQuery(api.notifications.listNotifications, { limit: 10 }) ?? [];
  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const handleNotificationClick = async (id: any) => {
    await markAsRead({ notificationId: id });
  };
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="p-2 rounded-full hover:bg-accent relative transition-all active:scale-95">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center rounded-full border-2 border-background animate-pulse font-bold">
              {unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 sm:w-96 p-0 rounded-3xl border-none shadow-glass mt-2 overflow-hidden" align="end" dir="rtl">
        <div className="p-4 border-b bg-muted/50 flex items-center justify-between">
          <h3 className="font-black text-lg">التنبيهات</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={() => markAllAsRead()} className="text-primary text-xs font-bold">
              تعيين الكل كمقروء
            </Button>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
              <Bell className="w-10 h-10 opacity-20" />
              <p className="text-sm font-bold">لا توجد تنبيهات جديدة</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((n) => (
                <div 
                  key={n._id} 
                  onClick={() => handleNotificationClick(n._id)}
                  className={cn(
                    "p-4 flex gap-4 cursor-pointer transition-colors hover:bg-accent/50",
                    !n.isRead && "bg-primary/5 border-r-4 border-primary"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                    n.type === 'success' ? "bg-emerald-100 text-emerald-600" :
                    n.type === 'warning' ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"
                  )}>
                    {n.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> :
                     n.type === 'warning' ? <AlertCircle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 space-y-1 text-right">
                    <p className={cn("text-sm leading-tight", !n.isRead ? "font-black" : "font-bold")}>{n.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground/60">{formatDistanceToNow(n.timestamp, { addSuffix: true, locale: ar })}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <div className="p-3 border-t bg-muted/30">
          <Button variant="ghost" className="w-full text-xs font-bold rounded-xl h-10">مشاهدة السجل الكامل</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}