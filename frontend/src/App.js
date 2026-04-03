import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";

// Public Pages
import HomePage from "@/pages/HomePage";
import PackagesPage from "@/pages/PackagesPage";
import ServicesPage from "@/pages/ServicesPage";
import CalculatorPage from "@/pages/CalculatorPage";
import ContactPage from "@/pages/ContactPage";
import CollaborationPage from "@/pages/CollaborationPage";
import SalesPage from "@/pages/SalesPage";
import ListingDetailPage from "@/pages/ListingDetailPage";
import VendorRegistrationPage from "@/pages/VendorRegistrationPage";
import ReferralTermsPage from "@/pages/ReferralTermsPage";

// Admin Pages
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminLeads from "@/pages/admin/AdminLeads";
import AdminPackages from "@/pages/admin/AdminPackages";
import AdminPartners from "@/pages/admin/AdminPartners";
import AdminListings from "@/pages/admin/AdminListings";
import AdminVendors from "@/pages/admin/AdminVendors";
import AdminCollaboration from "@/pages/admin/AdminCollaboration";
import AdminTerms from "@/pages/admin/AdminTerms";
import AdminMaterials from "@/pages/admin/AdminMaterials";

// Partner Pages
import PartnerLogin from "@/pages/partner/PartnerLogin";
import PartnerDashboard from "@/pages/partner/PartnerDashboard";
import PartnerLeads from "@/pages/partner/PartnerLeads";
import PartnerMaterials from "@/pages/partner/PartnerMaterials";

// Components
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdminLayout from "@/components/AdminLayout";
import PartnerLayout from "@/components/PartnerLayout";

// Context
import { AuthProvider } from "@/context/AuthContext";
import { PartnerAuthProvider } from "@/context/PartnerAuthContext";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <AuthProvider>
      <PartnerAuthProvider>
        <div className="App">
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<><Navbar /><HomePage /><Footer /></>} />
              <Route path="/packages" element={<><Navbar /><PackagesPage /><Footer /></>} />
              <Route path="/services" element={<><Navbar /><ServicesPage /><Footer /></>} />
              <Route path="/calculator" element={<><Navbar /><CalculatorPage /><Footer /></>} />
              <Route path="/contact" element={<><Navbar /><ContactPage /><Footer /></>} />
              <Route path="/collaboration" element={<><Navbar /><CollaborationPage /><Footer /></>} />
              <Route path="/sales" element={<><Navbar /><SalesPage /><Footer /></>} />
              <Route path="/sales/:id" element={<><Navbar /><ListingDetailPage /><Footer /></>} />
              <Route path="/vendor-registration" element={<><Navbar /><VendorRegistrationPage /><Footer /></>} />
              <Route path="/referral-terms" element={<><Navbar /><ReferralTermsPage /><Footer /></>} />
              
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="leads" element={<AdminLeads />} />
                <Route path="packages" element={<AdminPackages />} />
                <Route path="partners" element={<AdminPartners />} />
                <Route path="listings" element={<AdminListings />} />
                <Route path="vendors" element={<AdminVendors />} />
                <Route path="collaboration" element={<AdminCollaboration />} />
                <Route path="terms" element={<AdminTerms />} />
                <Route path="materials" element={<AdminMaterials />} />
              </Route>

              {/* Partner Routes */}
              <Route path="/partner/login" element={<PartnerLogin />} />
              <Route path="/partner" element={<PartnerLayout />}>
                <Route index element={<PartnerDashboard />} />
                <Route path="dashboard" element={<PartnerDashboard />} />
                <Route path="leads" element={<PartnerLeads />} />
                <Route path="materials" element={<PartnerMaterials />} />
              </Route>
            </Routes>
          </BrowserRouter>
          <Toaster position="top-right" richColors />
        </div>
      </PartnerAuthProvider>
    </AuthProvider>
  );
}

export default App;
