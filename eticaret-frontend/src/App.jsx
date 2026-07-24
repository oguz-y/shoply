import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import CartDrawer from "./components/CartDrawer";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import ProductList from "./pages/ProductList";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import AuthPage from "./pages/AuthPage";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import AdminRoute from "./components/AdminRoute";
import Admin from "./pages/Admin";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailed from "./pages/PaymentFailed";
import {FavoriteProvider} from "./context/FavoriteContext";
import Favorites from "./pages/Favorites";
 
function Layout() {
  const location = useLocation();
  const hideChrome = location.pathname === "/giris" || location.pathname === "/kayit";
 
  return (
    <>
      {!hideChrome && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/urunler" element={<ProductList />} />
        <Route path="/urun/:id" element={<ProductDetail />} />
        <Route path="/sepet" element={<Cart />} />
        <Route path="/giris" element={<AuthPage initialMode="login" />} />
        <Route path="/kayit" element={<AuthPage initialMode="register" />} />
        <Route path="/siparislerim" element={<Orders />} />
        <Route path="/profilim" element={<Profile />} />
        <Route path="/siparis-basarili" element={<PaymentSuccess/>} />
        <Route path="/odeme-basarisiz" element={<PaymentFailed/>} />
        <Route path="/favorilerim" element={<Favorites/>} />
        
        <Route 
          path="/admin"
          element={
            <AdminRoute>
              <Admin/>
            </AdminRoute>
          }
        />

      </Routes>
      <CartDrawer/>
      {!hideChrome && <Footer />}
    </>
  );
}
 
function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <FavoriteProvider>
          <BrowserRouter>
            <Layout />
          </BrowserRouter>
        </FavoriteProvider>
      </CartProvider>
    </AuthProvider>
  );
}
 
export default App;
