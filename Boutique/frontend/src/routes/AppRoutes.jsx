import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import PublicLayout from '../components/layout/PublicLayout.jsx';
import AdminLayout from '../components/admin/AdminLayout.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import RoleRoute from './RoleRoute.jsx';

// Públicas
import Home from '../pages/public/Home.jsx';
import Shop from '../pages/public/Shop.jsx';
import ProductDetail from '../pages/public/ProductDetail.jsx';
import Cart from '../pages/public/Cart.jsx';
import Checkout from '../pages/public/Checkout.jsx';
import Login from '../pages/public/Login.jsx';
import Register from '../pages/public/Register.jsx';
import Profile from '../pages/public/Profile.jsx';
import Favorites from '../pages/public/Favorites.jsx';
import MyOrders from '../pages/public/MyOrders.jsx';
import OrderDetail from '../pages/public/OrderDetail.jsx';
import PaymentResult from '../pages/public/PaymentResult.jsx';

// Admin
import AdminDashboard from '../pages/admin/AdminDashboard.jsx';
import ProductsAdmin from '../pages/admin/ProductsAdmin.jsx';
import ProductForm from '../pages/admin/ProductForm.jsx';
import OrdersAdmin from '../pages/admin/OrdersAdmin.jsx';
import OrderDetailAdmin from '../pages/admin/OrderDetailAdmin.jsx';
import UsersAdmin from '../pages/admin/UsersAdmin.jsx';
import EmployeesAdmin from '../pages/admin/EmployeesAdmin.jsx';
import CategoriesAdmin from '../pages/admin/CategoriesAdmin.jsx';
import BrandsAdmin from '../pages/admin/BrandsAdmin.jsx';
import InventoryAdmin from '../pages/admin/InventoryAdmin.jsx';
import CouponsAdmin from '../pages/admin/CouponsAdmin.jsx';
import BannersAdmin from '../pages/admin/BannersAdmin.jsx';
import ReportsAdmin from '../pages/admin/ReportsAdmin.jsx';
import StoreSettings from '../pages/admin/StoreSettings.jsx';

const STAFF = ['ADMIN', 'EMPLOYEE'];
const ADMIN = ['ADMIN'];

export default function AppRoutes() {
  return (
    <Routes>
      {/* ---------- PÚBLICO ---------- */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/tienda" element={<Shop />} />
        <Route path="/producto/:idOrSlug" element={<ProductDetail />} />
        <Route path="/carrito" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/pago/resultado" element={<PaymentResult />} />

        {/* requieren sesión */}
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/perfil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/favoritos" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
        <Route path="/mis-pedidos" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
        <Route path="/mis-pedidos/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
      </Route>

      {/* ---------- ADMIN / EMPLEADO ---------- */}
      <Route path="/admin" element={<RoleRoute roles={STAFF}><AdminLayout /></RoleRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="productos" element={<ProductsAdmin />} />
        <Route path="productos/nuevo" element={<RoleRoute roles={ADMIN}><ProductForm /></RoleRoute>} />
        <Route path="productos/:id" element={<RoleRoute roles={ADMIN}><ProductForm /></RoleRoute>} />
        <Route path="categorias" element={<RoleRoute roles={ADMIN}><CategoriesAdmin /></RoleRoute>} />
        <Route path="marcas" element={<RoleRoute roles={ADMIN}><BrandsAdmin /></RoleRoute>} />
        <Route path="inventario" element={<InventoryAdmin />} />
        <Route path="pedidos" element={<OrdersAdmin />} />
        <Route path="pedidos/:id" element={<OrderDetailAdmin />} />
        <Route path="clientes" element={<UsersAdmin />} />
        <Route path="empleados" element={<RoleRoute roles={ADMIN}><EmployeesAdmin /></RoleRoute>} />
        <Route path="cupones" element={<RoleRoute roles={ADMIN}><CouponsAdmin /></RoleRoute>} />
        <Route path="banners" element={<RoleRoute roles={ADMIN}><BannersAdmin /></RoleRoute>} />
        <Route path="reportes" element={<ReportsAdmin />} />
        <Route path="configuracion" element={<RoleRoute roles={ADMIN}><StoreSettings /></RoleRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
