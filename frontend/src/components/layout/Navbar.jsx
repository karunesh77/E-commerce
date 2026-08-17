import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { ShoppingCart, Heart, User, LogOut, Search } from "lucide-react";
import { useState } from "react";
import { logoutUser } from "../../store/slices/authSlice";
import { resetCart } from "../../store/slices/cartSlice";

export default function Navbar() {
  const { user } = useSelector((state) => state.auth);
  const { summary } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(query ? `/products?q=${encodeURIComponent(query)}` : "/products");
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    dispatch(resetCart());
    setMenuOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="shrink-0 text-xl font-bold text-gray-900">
          Vybe<span className="text-indigo-600">Shop</span>
        </Link>

        <form onSubmit={handleSearch} className="hidden flex-1 items-center sm:flex">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="Search products..."
              className="w-full rounded-full border border-gray-300 py-2 pl-9 pr-4 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </form>

        <nav className="ml-auto flex items-center gap-4">
          <Link to="/products" className="hidden text-sm font-medium text-gray-700 hover:text-indigo-600 sm:block">
            Products
          </Link>

          <Link to="/wishlist" className="relative text-gray-700 hover:text-indigo-600" aria-label="Wishlist">
            <Heart className="h-5 w-5" />
          </Link>

          <Link to="/cart" className="relative text-gray-700 hover:text-indigo-600" aria-label="Cart">
            <ShoppingCart className="h-5 w-5" />
            {summary.totalItems > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-semibold text-white">
                {summary.totalItems}
              </span>
            )}
          </Link>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-indigo-600"
              >
                <User className="h-5 w-5" />
                <span className="hidden sm:block">{user.name?.split(" ")[0]}</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-md border border-gray-200 bg-white py-1 shadow-lg">
                  <Link to="/profile" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    My Profile
                  </Link>
                  <Link to="/orders" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    My Orders
                  </Link>
                  {user.role === "admin" && (
                    <Link to="/admin" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50"
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-full bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
