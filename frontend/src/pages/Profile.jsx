import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

export default function Profile() {
  const { user } = useSelector((state) => state.auth);

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-xl font-bold text-gray-900">My Profile</h1>

      <div className="mt-6 rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-xl font-semibold text-indigo-700">
            {user.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-1 gap-4 border-t border-gray-100 pt-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-gray-500">Role</dt>
            <dd className="mt-0.5 text-sm font-medium capitalize text-gray-900">{user.role}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-4 flex gap-3">
        <Link to="/orders" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          My Orders
        </Link>
        <Link to="/wishlist" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          My Wishlist
        </Link>
      </div>
    </div>
  );
}
