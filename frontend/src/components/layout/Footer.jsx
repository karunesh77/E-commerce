export default function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 text-center text-sm text-gray-500 sm:px-6 lg:px-8">
        <p>© {new Date().getFullYear()} VybeShop. All rights reserved.</p>
      </div>
    </footer>
  );
}
