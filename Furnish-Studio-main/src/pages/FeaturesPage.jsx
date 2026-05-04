import React from 'react';
import { Link } from 'react-router-dom';

const FeaturesPage = () => {
  const pageGradient = 'linear-gradient(160deg, #EEF4FF 0%, #D6E8FF 35%, #C2DAFF 65%, #B8D4FF 85%, #D6E8FF 100%)';

  const features = [
    {
      icon: (
        <svg className="h-12 w-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: '3D Visualization',
      description: 'Preview room designs in immersive 3D so you can make confident layout decisions before buying.'
    },
    {
      icon: (
        <svg className="h-12 w-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      title: 'Furniture Catalog',
      description: 'Explore curated furniture collections with refined styling, smart filters, and inspiration for every room.'
    },
    {
      icon: (
        <svg className="h-12 w-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
        </svg>
      ),
      title: 'Drag & Drop Design',
      description: 'Place and move furniture naturally with a user-friendly drag & drop interface built for creativity.'
    },
    {
      icon: (
        <svg className="h-12 w-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      title: 'Save & Share Designs',
      description: 'Keep your favorite layouts, share them with collaborators, and refine ideas with feedback from others.'
    },
    {
      icon: (
        <svg className="h-12 w-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Real-time Preview',
      description: 'Watch your design evolve instantly, with fast updates for every move and style adjustment.'
    },
    {
      icon: (
        <svg className="h-12 w-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      ),
      title: 'Mobile Friendly',
      description: 'Design on desktop, tablet, or phone with a responsive experience that adapts to any screen size.'
    }
  ];

  return (
    <div className="min-h-screen font-sans" style={{ background: pageGradient }}>
      <nav className="shadow-lg fixed w-full z-50" style={{ background: pageGradient }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <svg className="h-8 w-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="ml-2 text-xl font-bold text-gray-900">DecoView</span>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/features" className="text-indigo-600 font-medium">Features</Link>
              <Link to="/how-it-works" className="text-gray-700 hover:text-indigo-600 transition-colors duration-300">How It Works</Link>
              <Link to="/gallery" className="text-gray-700 hover:text-indigo-600 transition-colors duration-300">Gallery</Link>
              <Link to="/design" className="px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors duration-300">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="inline-flex items-center rounded-full bg-indigo-100 px-4 py-1 text-sm font-semibold text-indigo-700">Designed for modern spaces</span>
              <h1 className="mt-6 text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">Build stunning room designs with powerful tools made for creativity.</h1>
              <p className="mt-6 text-lg text-gray-600 max-w-2xl">DecoView brings 3D visualization, collaborative sharing, and smart furniture selection together in one elegant design experience.</p>
              <div className="mt-10 flex flex-col sm:flex-row sm:items-center sm:space-x-4 gap-4">
                <Link to="/design" className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-8 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors duration-300">Start Designing</Link>
                <Link to="/gallery" className="inline-flex items-center justify-center rounded-full border border-indigo-200 bg-white px-8 py-3 text-base font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors duration-300">View Gallery</Link>
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur-lg">
                <h3 className="text-xl font-semibold text-gray-900">Instant 3D feedback</h3>
                <p className="mt-3 text-gray-600">Adjust layouts with confidence and see how each choice affects lighting, space, and flow.</p>
              </div>
              <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur-lg">
                <h3 className="text-xl font-semibold text-gray-900">Collaborate with ease</h3>
                <p className="mt-3 text-gray-600">Share design ideas with clients, friends, and family for fast, visual feedback.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">Feature highlights</p>
            <h2 className="mt-4 text-3xl font-bold text-gray-900 sm:text-4xl">Everything you need to create a polished design workflow.</h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <article key={index} className="group rounded-3xl border border-white bg-white/90 p-8 shadow-lg transition hover:-translate-y-1 hover:shadow-2xl">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-7">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="rounded-[2rem] bg-indigo-600 px-8 py-14 text-center text-white shadow-2xl sm:px-12">
            <h2 className="text-3xl font-bold sm:text-4xl">Fast, intuitive, and built for beautiful interiors.</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-indigo-100">Bring your vision to life with a design platform that makes planning furniture layouts faster and more delightful.</p>
            <Link to="/design" className="mt-8 inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-base font-semibold text-indigo-700 shadow-lg hover:bg-gray-100 transition-colors duration-300">Start Your Design</Link>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid gap-10 lg:grid-cols-3">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <svg className="h-8 w-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xl font-bold">DecoView</span>
              </div>
              <p className="text-gray-400">Craft your dream space with precision and style, using intuitive tools made for modern interiors.</p>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Product</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><Link to="/features" className="hover:text-white">Features</Link></li>
                  <li><Link to="/how-it-works" className="hover:text-white">How It Works</Link></li>
                  <li><Link to="/gallery" className="hover:text-white">Gallery</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Support</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white">Help Center</a></li>
                  <li><a href="#" className="hover:text-white">Contact Us</a></li>
                  <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                </ul>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Connect</h3>
              <div className="flex items-center gap-4">
                <a href="#" className="text-gray-400 hover:text-white" aria-label="Twitter">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white" aria-label="LinkedIn">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.5 8h4v16h-4V8zm7.5 0h3.75v2.1h.05c.52-.98 1.8-2.02 3.7-2.02 4 0 4.75 2.62 4.75 6.02V24h-4V14.1c0-2.36-.04-5.4-3.3-5.4-3.3 0-3.8 2.56-3.8 5.22V24h-4V8z" />
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

export default FeaturesPage;
