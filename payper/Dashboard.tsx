import { useUser, usePayments, useScoreHistory } from "@/hooks/use-data";
import { useLocation } from "wouter";
import { Plus, Bell, TrendingUp, Calendar } from "lucide-react";
import { ScoreGauge } from "@/components/ScoreGauge";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Button } from "@/components/Button";

export default function Dashboard() {
  const { data: user } = useUser();
  const { data: payments } = usePayments();
  const [, setLocation] = useLocation();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="px-6 pt-12 pb-6 flex justify-between items-center bg-white border-b border-border sticky top-0 z-10">
        <div>
          <p className="text-muted-foreground text-sm font-medium">Good Morning,</p>
          <h1 className="text-2xl font-display font-bold text-foreground">{user.displayName || user.username}</h1>
        </div>
        <button className="relative p-2 rounded-full hover:bg-muted transition-colors">
          <Bell className="w-6 h-6 text-foreground" />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-white" />
        </button>
      </header>

      <main className="px-6 py-6 space-y-8">
        {/* Score Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 shadow-sm border border-border/50 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <TrendingUp className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display font-bold text-lg">Credit Score</h3>
              <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">+12 pts</span>
            </div>
            <ScoreGauge score={user.creditScore || 580} />
            <div className="mt-4 flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-xs h-10 border-border"
                onClick={() => setLocation("/score")}
              >
                View History
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <div 
            onClick={() => setLocation("/add/rent")}
            className="bg-primary text-primary-foreground p-5 rounded-2xl shadow-lg shadow-primary/20 flex flex-col justify-between h-32 cursor-pointer hover:scale-[1.02] transition-transform"
          >
            <div className="bg-white/20 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-lg leading-tight">Add Rent</span>
          </div>
          <div 
            onClick={() => setLocation("/add/stokvel")}
            className="bg-white text-foreground p-5 rounded-2xl border border-border shadow-sm flex flex-col justify-between h-32 cursor-pointer hover:scale-[1.02] transition-transform"
          >
            <div className="bg-secondary w-10 h-10 rounded-full flex items-center justify-center">
              <Plus className="w-6 h-6 text-primary" />
            </div>
            <span className="font-bold text-lg leading-tight">Add Stokvel</span>
          </div>
          <div 
            onClick={() => setLocation("/add/remittance")}
            className="bg-white text-foreground p-5 rounded-2xl border border-border shadow-sm flex flex-col justify-between h-32 cursor-pointer hover:scale-[1.02] transition-transform"
          >
            <div className="bg-purple-100 w-10 h-10 rounded-full flex items-center justify-center">
              <Plus className="w-6 h-6 text-purple-600" />
            </div>
            <span className="font-bold text-lg leading-tight">Remittance</span>
          </div>
          <div 
            onClick={() => setLocation("/add/electricity")}
            className="bg-white text-foreground p-5 rounded-2xl border border-border shadow-sm flex flex-col justify-between h-32 cursor-pointer hover:scale-[1.02] transition-transform"
          >
            <div className="bg-yellow-100 w-10 h-10 rounded-full flex items-center justify-center">
              <Plus className="w-6 h-6 text-yellow-600" />
            </div>
            <span className="font-bold text-lg leading-tight">Electricity</span>
          </div>
        </div>

        {/* Recent Payments */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-display font-bold text-xl">Upcoming</h3>
            <span className="text-primary text-sm font-medium">See all</span>
          </div>
          
          <div className="space-y-3">
            {payments?.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-border">
                <p className="text-muted-foreground">No payments scheduled</p>
                <Button variant="ghost" className="mt-2 text-primary" onClick={() => setLocation("/add")}>
                  Add your first payment
                </Button>
              </div>
            ) : (
              payments?.map((payment) => (
                <div key={payment.id} className="bg-white p-4 rounded-2xl border border-border flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-foreground">{payment.name}</h4>
                    <p className="text-xs text-muted-foreground">Due {payment.nextDueDate ? format(new Date(payment.nextDueDate), 'MMM d') : 'N/A'}</p>
                  </div>
                  <span className="font-bold text-lg">R{Number(payment.amount).toFixed(0)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
