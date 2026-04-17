import React from "react";
import { motion } from "framer-motion";
import { 
  Zap, 
  Droplets, 
  Wrench, 
  Hammer, 
  Car, 
  Paintbrush, 
  Navigation, 
  AlertCircle,
  Clock
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
const services = [
  { id: 1, name: "كهربائي", icon: Zap, color: "text-yellow-500", bg: "bg-yellow-50" },
  { id: 2, name: "سباك", icon: Droplets, color: "text-blue-500", bg: "bg-blue-50" },
  { id: 3, name: "نجار", icon: Hammer, color: "text-orange-500", bg: "bg-orange-50" },
  { id: 4, name: "ميكانيكي", icon: Car, color: "text-red-500", bg: "bg-red-50" },
  { id: 5, name: "فني تكييف", icon: Wrench, color: "text-emerald-500", bg: "bg-emerald-50" },
  { id: 6, name: "صباغ", icon: Paintbrush, color: "text-purple-500", bg: "bg-purple-50" },
];
export function ClientDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-12 space-y-12">
        {/* Header Section */}
        <section className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">ما هي الخدمة التي تحتاجها؟</h2>
          <p className="text-muted-foreground">اختر نوع الخدمة وسنقوم بربطك بأقرب فني متخصص.</p>
        </section>
        {/* Services Grid */}
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {services.map((service, idx) => (
            <motion.button
              key={service.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="group"
            >
              <Card className="border-none shadow-soft hover:shadow-xl transition-all h-full bg-card rounded-3xl overflow-hidden">
                <CardContent className="p-6 flex flex-col items-center gap-4">
                  <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", service.bg)}>
                    <service.icon className={cn("w-8 h-8", service.color)} />
                  </div>
                  <span className="font-bold text-lg">{service.name}</span>
                </CardContent>
              </Card>
            </motion.button>
          ))}
        </section>
        {/* Live Tracking / Active Job Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Navigation className="w-5 h-5 text-primary" />
              الطلبات النشطة
            </h3>
          </div>
          <Card className="rounded-[2rem] border-primary/20 bg-primary/5 overflow-hidden border shadow-lg relative">
            <CardContent className="p-0 flex flex-col lg:flex-row">
              <div className="flex-1 p-6 md:p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold">ع</div>
                    <div>
                      <h4 className="font-bold text-lg">أحمد المحمدي (فني كهرباء)</h4>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> يصل خلال 12 دقيقة
                      </p>
                    </div>
                  </div>
                  <Button variant="destructive" size="icon" className="rounded-full h-12 w-12 shadow-lg animate-pulse">
                    <AlertCircle className="w-6 h-6" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span>حالة الطلب: جاري التحرك</span>
                    <span className="text-primary">85%</span>
                  </div>
                  <div className="h-2 bg-primary/20 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: "85%" }} 
                      className="h-full bg-primary"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1 rounded-xl">اتصال بالفني</Button>
                  <Button variant="outline" className="flex-1 rounded-xl">مراسلة</Button>
                </div>
              </div>
              {/* Mock Map View */}
              <div className="w-full lg:w-1/3 bg-slate-200 dark:bg-slate-800 min-h-[200px] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                   <div className="w-full h-full" style={{backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
                </div>
                <div className="z-10 flex flex-col items-center">
                   <div className="w-4 h-4 bg-primary rounded-full animate-ping mb-2" />
                   <div className="w-8 h-8 bg-primary rounded-full border-4 border-white dark:border-slate-900 shadow-xl" />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
import { cn } from "@/lib/utils";