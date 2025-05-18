import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import AdminLayout from "@/components/layout/AdminLayout";
import UserLayout from "@/components/layout/UserLayout";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ProductList from "./pages/products/ProductList";
import ProductDetail from "./pages/products/ProductDetail";
import CombosList from "./pages/combos/CombosList";
import ComboDetail from "./pages/combos/ComboDetail";
import BlogsList from "./pages/blogs/BlogsList";
import BlogDetail from "./pages/blogs/BlogDetail";
import FavoritesList from "./pages/favorites/FavoritesList";
import Contact from "./pages/contact/Contact";
import About from "./pages/about/About";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Profile from "./pages/user/Profile";
import Cart from "./pages/user/Cart";
import Checkout from "./pages/user/Checkout";
import Orders from "./pages/user/Orders";
import ViewProfile from "./pages/user/ViewProfile";
import Messages from "./pages/user/Messages";
import StaffDashboard from "./pages/staff/StaffDashboard";
import StaffProducts from "./pages/staff/StaffProducts";
import StaffOrders from "./pages/admin/AdminOrders";
import StaffInventory from "./pages/staff/StaffInventory";
import InventoryForm from "./pages/staff/InventoryForm";
import PurchaseOrdersForm from "./pages/staff/PurchaseOrdersForm";
import ProductsForm from "./pages/staff/ProductsForm";
import ShippingForm from "./pages/staff/ShippingForm";
import OrdersForm from "./pages/staff/OrdersForm";
import InvoiceForm from "./pages/staff/InvoiceForm";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminStaff from "./pages/admin/AdminStaff";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminInvoices from "./pages/admin/AdminInvoices";

const queryClient = new QueryClient();

const App = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppShell>
          <Routes>
            <Route path="/" element={<UserLayout />}>
              <Route index element={<Index />} />
              <Route path="products" element={<ProductList />} />
              <Route path="products/:id" element={<ProductDetail />} />
              <Route path="combos" element={<CombosList />} />
              <Route path="combos/:id" element={<ComboDetail />} />
              <Route path="blogs" element={<BlogsList />} />
              <Route path="blogs/:id" element={<BlogDetail />} />
              <Route path="favorites" element={<FavoritesList />} />
              <Route path="contact" element={<Contact />} />
              <Route path="about" element={<About />} />
              <Route path="auth/login" element={<Login />} />
              <Route path="auth/register" element={<Register />} />
              <Route path="auth/forgot-password" element={<ForgotPassword />} />
              <Route path="user/profile" element={<Profile />} />
              <Route path="user/cart" element={<Cart />} />
              <Route path="user/checkout" element={<Checkout />} />
              <Route path="user/orders" element={<Orders />} />
              <Route path="user/messages" element={<Messages />} />
              <Route path="user/profile/:userId" element={<ViewProfile />} />
            </Route>

            <Route path="/staff" element={<AdminLayout role="staff" />}>
              <Route index element={<StaffDashboard />} />
              <Route path="products" element={<StaffProducts />} />
              <Route path="orders" element={<StaffOrders />} />
              <Route path="inventory" element={<StaffInventory />} />
              <Route path="inventory/form" element={<InventoryForm />} />
              <Route path="purchase-orders/form" element={<PurchaseOrdersForm />} />
              <Route path="products/form" element={<ProductsForm />} />
              <Route path="shipping/form" element={<ShippingForm />} />
              <Route path="orders/form" element={<OrdersForm />} />
              <Route path="invoice/form" element={<InvoiceForm />} />
            </Route>

            <Route path="/admin" element={<AdminLayout role="admin" />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="staff" element={<AdminStaff />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="products" element={<StaffProducts />} />
              <Route path="orders" element={<StaffOrders />} />
              <Route path="inventory" element={<StaffInventory />} />
              <Route path="invoices" element={<AdminInvoices />} />
              <Route path="inventory/form" element={<InventoryForm />} />
              <Route path="purchase-orders/form" element={<PurchaseOrdersForm />} />
              <Route path="products/form" element={<ProductsForm />} />
              <Route path="shipping/form" element={<ShippingForm />} />
              <Route path="orders/form" element={<OrdersForm />} />
              <Route path="invoice/form" element={<InvoiceForm />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
          <Sonner />
        </AppShell>
      </TooltipProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;