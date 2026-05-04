import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const GalleryPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Designs' },
    { id: 'living', name: 'Living Rooms' },
    { id: 'bedroom', name: 'Bedrooms' },
    { id: 'dining', name: 'Dining Rooms' },
    { id: 'office', name: 'Home Offices' }
  ];

  const designs = [
    {
      id: 1,
      title: "Modern Living Room",
      category: "living",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      description: "Minimalist design with clean lines and neutral colors",
      likes: 124,
      author: "Sarah Chen"
    },
    {
      id: 2,
      title: "Cozy Bedroom Retreat",
      category: "bedroom",
      image: "https://images.unsplash.com/photo-1615874959474-d609969a20ed?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      description: "Warm and inviting bedroom with natural textures",
      likes: 89,
      author: "Mike Johnson"
    },
    {
      id: 3,
      title: "Elegant Dining Space",
      category: "dining",
      image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      description: "Classic dining room with contemporary furniture",
      likes: 156,
      author: "Emma Davis"
    },
    {
      id: 4,
      title: "Productive Home Office",
      category: "office",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      description: "Functional workspace designed for maximum productivity",
      likes: 92,
      author: "Alex Rodriguez"
    },
    {
      id: 5,
      title: "Scandinavian Living",
      category: "living",
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      description: "Light and airy living room with Scandinavian influences",
      likes: 203,
      author: "Lisa Wang"
    },
    {
      id: 6,
      title: "Master Bedroom Suite",
      category: "bedroom",
      image: "https://images.unsplash.com/photo-1615874959474-d609969a20ed?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      description: "Luxurious master bedroom with premium finishes",
      likes: 178,
      author: "David Kim"
    },
    {
      id: 7,
      title: "Family Dining Area",
      category: "dining",
      image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      description: "Spacious dining area perfect for family gatherings",
      likes: 134,
      author: "Rachel Green"
    },
    {
      id: 8,
      title: "Creative Studio Space",
      category: "office",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      description: "Inspiring workspace for creative professionals",
      likes: 167,
      author: "Tom Anderson"
    }
  ];

  const filteredDesigns = selectedCategory === 'all'
    ? designs
    : designs.filter(design => design.category === selectedCategory);

  return (
    <div className="min-h-screen bg-neutral-50 font-sans" style={{ background: "linear-gradient(160deg, #EEF4FF 0%, #D6E8FF 35%, #C2DAFF 65%, #B8D4FF 85%, #D6E8FF 100%)" }}>
      {/* Navigation */}
      <nav className="bg-white shadow-lg fixed w-full z-50 " style={{ background: "linear-gradient(160deg, #EEF4FF 0%, #D6E8FF 35%, #C2DAFF 65%, #B8D4FF 85%, #D6E8FF 100%)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <svg
                className="h-8 w-8 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="ml-2 text-xl font-bold text-gray-900">
                DecoView
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/features"
                className="text-gray-700 hover:text-indigo-600 transition-colors duration-300"
              >
                Features
              </Link>
              <Link
                to="/how-it-works"
                className="text-gray-700 hover:text-indigo-600 transition-colors duration-300"
              >
                How It Works
              </Link>
              <Link
                to="/gallery"
                className="text-indigo-600 font-medium"
              >
                Gallery
              </Link>
              <Link
                to="/design"
                className="px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors duration-300"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-6">
            Design <span className="text-indigo-600">Inspiration</span> Gallery
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Explore stunning room designs created by our community of designers.
            Get inspired and see what's possible with DecoView's powerful tools.
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-2 rounded-full transition-colors duration-300 ${
                selectedCategory === category.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-indigo-50 border border-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredDesigns.map((design) => (
            <div key={design.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="aspect-square overflow-hidden">
                <img
                  src={design.image}
                  alt={design.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {design.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  {design.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {design.author}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="h-4 w-4 mr-1 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    {design.likes}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Design Section */}
      <div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Featured Design of the Month
            </h2>
            <p className="text-gray-700 max-w-2xl mx-auto">
              This month's featured design showcases innovative use of space and modern aesthetics.
            </p>
          </div>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Featured Design"
                className="rounded-xl shadow-2xl"
              />
            </div>
            <div className="text-gray-900">
              <h3 className="text-2xl font-bold mb-4">Urban Loft Living</h3>
              <p className="text-gray-700 mb-6 leading-relaxed">
                This stunning urban loft combines industrial elements with modern comfort.
                The open layout maximizes space while maintaining a cozy atmosphere perfect for
                entertaining and daily living.
              </p>
              <div className="flex items-center mb-6">
                <div className="flex -space-x-2">
                  <img className="h-8 w-8 rounded-full border-2 border-indigo-100" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&q=80" alt="Designer" />
                  <img className="h-8 w-8 rounded-full border-2 border-indigo-100" src="https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&q=80" alt="Designer" />
                  <img className="h-8 w-8 rounded-full border-2 border-indigo-100" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&q=80" alt="Designer" />
                </div>
                <span className="ml-3 text-gray-700">Designed by Maria Gonzalez</span>
              </div>
              <Link
                to="/design"
                className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors duration-300"
              >
                Create Similar Design
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Create Your Masterpiece?
          </h2>
          <p className="text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join our community of designers and start creating beautiful spaces that inspire.
          </p>
          <Link
            to="/design"
            className="inline-block px-8 py-3 bg-white text-indigo-600 rounded-full hover:bg-gray-50 transition-colors duration-300 font-medium"
          >
            Start Designing Today
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <svg
                  className="h-8 w-8 text-indigo-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="ml-2 text-xl font-bold">
                  DecoView
                </span>
              </div>
              <p className="text-gray-400">
                Craft your dream space with precision and style.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/features" className="hover:text-white">Features</Link></li>
                <li><Link to="/how-it-works" className="hover:text-white">How It Works</Link></li>
                <li><Link to="/gallery" className="hover:text-white">Gallery</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Connect</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 DecoView. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default GalleryPage;