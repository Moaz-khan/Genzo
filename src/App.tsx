import { CartProvider } from './context/CartContext';
import { NavProvider, useNav } from './context/NavContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import AccountPage from './pages/AccountPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';

function AppInner() {
  const { page } = useNav();

  const pageMap: Record<string, React.ReactNode> = {
    home: <HomePage />,
    shop: <ShopPage />,
    product: <ProductDetailPage />,
    cart: <CartPage />,
    checkout: <CheckoutPage />,
    success: <OrderSuccessPage />,
    account: <AccountPage />,
    about: <AboutPage />,
    contact: <ContactPage />,
    login: <LoginPage />,
  };

  return (
    <div className="min-h-screen flex flex-col bg-ivory">
      {page !== 'login' && <Navbar />}
      <div className="flex-1">
        {pageMap[page] ?? <HomePage />}
      </div>
      {page !== 'checkout' && page !== 'success' && page !== 'login' && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavProvider>
        <CartProvider>
          <AppInner />
        </CartProvider>
      </NavProvider>
    </AuthProvider>
  );
}
