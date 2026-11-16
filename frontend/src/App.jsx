import { CartProvider } from "./cart/CartContext.jsx";
import CartDrawer from "./components/cart/CartDrawer.jsx";
import ChatWindow from "./components/chat/ChatWindow.jsx";
import Header from "./components/layout/Header.jsx";

export default function App() {
  return (
    <CartProvider>
      <div className="flex h-dvh flex-col">
        <Header />
        <main className="mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col sm:p-4">
          <ChatWindow />
        </main>
      </div>
      <CartDrawer />
    </CartProvider>
  );
}
