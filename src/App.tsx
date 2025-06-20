import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import LoginPage from "@/components/auth/LoginPage";
import NotFound from "./pages/NotFound";
import UserProfile from "./components/pages/userprofile";
import VendorProfile from "./components/pages/vendorprofile";
import ProductdetailsPage from "./components/pages/productdetailspage";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/index" element={<Index />} />
          <Route path="/userprofile/:userId" element={<UserProfile />} />
          <Route path="/vendorprofile/:vendorId" element={<VendorProfile />} />
          <Route
            path="/productdetails/:productId"
            element={<ProductdetailsPage />}
          />
          {/* ADD ALL CUSTOM ROUTES BELOW THIS LINE */}
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
