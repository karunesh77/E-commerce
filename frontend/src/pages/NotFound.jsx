import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-24 text-center">
      <h1 className="text-6xl font-bold text-gray-900">404</h1>
      <p className="mt-4 text-gray-600">Page not found</p>
      <Link to="/" className="mt-6 rounded-full bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700">
        Back to Home
      </Link>
    </div>
  );
}
