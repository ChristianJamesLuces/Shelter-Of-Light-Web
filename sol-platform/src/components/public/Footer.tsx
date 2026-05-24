export default function Footer() {
  return (
    <footer className="bg-sol-dark text-sol-cream py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-sol-yellow font-semibold mb-2">Shelter of Love (SoL)</p>
        <p className="text-sm text-gray-400 mb-4">Dedicated to finding forever homes for stray cats and dogs.</p>
        <p className="text-xs text-gray-500">
          &copy; {new Date().getFullYear()} SoL Platform. All rights reserved.
        </p>
      </div>
    </footer>
  );
}