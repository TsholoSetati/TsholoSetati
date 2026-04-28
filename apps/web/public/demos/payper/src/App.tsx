import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Navigation } from "@/components/Navigation";
import { useUser } from "@/hooks/use-data";

// Pages
import Onboarding from "@/pages/Onboarding";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import PricePal from "@/pages/PricePal";
import Score from "@/pages/Score";
import Coach from "@/pages/Coach";
import AddPayment from "@/pages/AddPayment";
import Negotiate from "@/pages/Negotiate";
import NotFound from "@/pages/not-found";

// Protected Route Wrapper (Bypassed for prototype)
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  return <Component />;
}

function Router() {
  return (
    <>
      <Switch>
        <Route path="/" component={Onboarding} />
        <Route path="/onboarding" component={Onboarding} />
        <Route path="/auth" component={Auth} />
        
        {/* Protected Routes (Implicitly accessible) */}
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/pricepal" component={PricePal} />
        <Route path="/score" component={Score} />
        <Route path="/coach" component={Coach} />
        <Route path="/add*" component={AddPayment} />
        <Route path="/negotiate*" component={Negotiate} />

        <Route component={NotFound} />
      </Switch>
      <Navigation />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Router />
    </QueryClientProvider>
  );
}

export default App;
