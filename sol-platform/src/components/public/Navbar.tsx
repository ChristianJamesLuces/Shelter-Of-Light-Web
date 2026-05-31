import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-sol-dark text-sol-cream sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* LOGO AND BRAND NAME */}
          <div className="flex-shrink-0 font-bold text-xl tracking-wider">
            <Link href="/" className="flex items-center gap-3 hover:text-sol-yellow transition-colors group">
              {/* This looks for your logo in the public folder */}
              <img 
                src="/sol-logo.jpg"   
                alt="Shelter of Light Logo" 
                className="h-10 w-10 object-cover rounded-full border-2 border-transparent group-hover:border-sol-yellow transition-colors" 
              />
              <div>
                SoL <span className="text-sm font-normal text-gray-300">| Shelter of Light</span>
              </div>
            </Link>
          </div>

          <div className="hidden md:flex space-x-8">
            <Link href="/adopt" className="hover:text-sol-yellow transition-colors">Find a Companion</Link>
            <Link href="/about" className="hover:text-sol-yellow transition-colors">About Us</Link>
          </div>
          <div>
            <Link 
              href="/donate" 
              className="bg-sol-yellow text-sol-dark px-4 py-2 rounded-md font-semibold hover:bg-yellow-400 transition-colors"
            >
              Donate
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}