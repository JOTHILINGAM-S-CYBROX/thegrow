import styles from './page.module.css';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container min-h-screen">


      <header className="relative min-h-[100dvh] w-full overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img src="/assets/ambience/07.jpg.webp" alt="The Grove Banner" className="w-full h-full object-cover brightness-75 scale-105" />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-transparent to-primary/40"></div>
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <span className="block font-label text-on-primary text-xs tracking-[0.4em] uppercase mb-6">Tiruppur's Hidden Sanctuary</span>
          <h1 className="font-headline text-[clamp(2rem,4vw,4rem)] md:text-[clamp(2rem,4vw,4rem)] text-on-primary mb-8 leading-tight">Where Nature<br /><span className="italic font-normal">Meets the Plate</span></h1>
          <div className="flex justify-center gap-6">
            <button className="bg-surface text-primary px-8 py-4 rounded-full font-label text-sm tracking-widest uppercase hover:bg-surface-container-low transition-colors">Explore The Farm</button>
          </div>
        </div>
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-on-primary/60 flex flex-col items-center">
          <span className="font-label text-[10px] tracking-widest uppercase mb-2">Scroll to discover</span>
          <span className={`material-symbols-outlined animate-bounce ${styles.materialSymbolsOutlined}`}>expand_more</span>
        </div>
      </header>

      <section className="py-16 md:py-24 lg:py-40 px-4 md:px-8 bg-surface">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-5 order-2 md:order-1">
            <span className="font-label text-secondary text-xs tracking-[0.3em] uppercase mb-6 block">Our Ethos</span>
            <h2 className="font-headline text-[clamp(2rem,4vw,4rem)] md:text-[clamp(2rem,4vw,4rem)] text-primary mb-8 leading-tight">A Dining Sanctuary</h2>
            <p className="text-on-surface-variant text-lg leading-relaxed mb-8 max-w-md">
              Nestled within a centuries-old coconut farm, The Grove offers more than a meal—it's a sensory journey through Tiruppur's vibrant agrarian landscape. We believe in the luxury of silence, the warmth of the sun, and the honesty of earth-to-table cuisine.
            </p>
            <Link className="inline-block text-tertiary font-label text-sm tracking-widest uppercase border-b border-tertiary-fixed pb-1 hover:border-tertiary transition-all" href="#">Learn about our heritage</Link>
          </div>
          <div className="md:col-span-7 order-1 md:order-2 relative">
            <div className={`aspect-[4/5] md:aspect-video rounded-xl overflow-hidden ${styles.editorialShadow}`}>
              <img className="w-full h-full object-cover" alt="Sunlight filtering" src="/assets/ambience/02.jpg.webp" />
            </div>
            <div className={`absolute -bottom-6 -left-6 md:left-12 bg-secondary-container/80 backdrop-blur-md p-6 max-w-xs ${styles.editorialShadow}`}>
              <h4 className="font-headline italic text-on-secondary-container text-xl mb-2">Rooted in Earth</h4>
              <p className="text-on-secondary-container/80 text-sm">Every ingredient in our kitchen is sourced from within a 20-mile radius, honoring the seasons.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-surface-container-low px-4 md:px-0">
        <div className="max-w-screen-2xl mx-auto px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="w-full md:max-w-xl">
              <span className="font-label text-secondary text-xs tracking-[0.3em] uppercase mb-4 block">Seasonal Highlights</span>
              <h2 className="font-headline text-[clamp(2rem,4vw,4rem)] md:text-[clamp(2rem,4vw,4rem)] text-primary">Chef's Table</h2>
            </div>
            <p className="text-on-surface-variant font-body italic">Curated flavors that define the South.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
            <div className="group cursor-pointer">
              <div className="aspect-square mb-8 overflow-hidden rounded-lg">
                <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Kerala Chicken" src="/assets/food/keralachicken.webp" />
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-headline text-[clamp(1.2rem,2vw,2rem)] text-primary mb-2">Kerala Chicken</h3>
                  <p className="text-on-surface-variant max-w-sm">Slow-roasted with hand-ground spices, caramelized shallots, and fresh coconut slivers from our grove.</p>
                </div>
                <span className="font-label text-primary font-semibold tracking-widest uppercase text-sm">₹850</span>
              </div>
            </div>
            <div className="group cursor-pointer md:mt-24">
              <div className="aspect-square mb-8 overflow-hidden rounded-lg">
                <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Butter Garlic Prawns" src="/assets/food/prawns.webp" />
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-headline text-[clamp(1.2rem,2vw,2rem)] text-primary mb-2">Butter Garlic Prawns</h3>
                  <p className="text-on-surface-variant max-w-sm">Jumbo river prawns tossed in cultured farm butter, infused with roasted garlic and wild peppercorns.</p>
                </div>
                <span className="font-label text-primary font-semibold tracking-widest uppercase text-sm">₹1,150</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-surface px-4 md:px-0">
        <div className="max-w-screen-2xl mx-auto px-8">
          <div className="text-center mb-20">
            <span className="font-label text-secondary text-xs tracking-[0.3em] uppercase mb-4 block">Visual Journey</span>
            <h2 className="font-headline text-[clamp(2rem,4vw,4rem)] md:text-[clamp(2rem,4vw,4rem)] text-primary">Our Atmosphere</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:h-[800px] auto-rows-[300px] md:auto-rows-auto">
            <div className="md:col-span-8 relative rounded-xl overflow-hidden group">
              <img className="w-full h-full object-cover" alt="The Al Fresco Deck" src="/assets/ambience/08.jpg.webp" />
              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-on-primary font-label tracking-widest uppercase">The Al Fresco Deck</span>
              </div>
            </div>
            <div className="md:col-span-4 relative rounded-xl overflow-hidden group">
              <img className="w-full h-full object-cover" alt="The Glass House" src="/assets/food/_J8A8978-Edit.webp" />
              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-on-primary font-label tracking-widest uppercase">The Glass House</span>
              </div>
            </div>
            <div className="md:col-span-4 relative rounded-xl overflow-hidden group">
              <img className="w-full h-full object-cover" alt="Chef's Precision" src="/assets/ambience/05.jpg.webp" />
              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-on-primary font-label tracking-widest uppercase">Chef's Precision</span>
              </div>
            </div>
            <div className="md:col-span-8 relative rounded-xl overflow-hidden group">
              <img className="w-full h-full object-cover" alt="Seasonal Harvest" src="/assets/food/1L1A9172.webp" />
              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-on-primary font-label tracking-widest uppercase">Seasonal Harvest</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-24 bg-surface px-4 md:px-0">
        <div className="max-w-screen-2xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 text-center md:text-left items-stretch bg-surface-container-low rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.05)] border border-outline-variant/10">
            <div className="order-2 md:order-1 p-10 md:p-16 lg:p-24 flex flex-col justify-center items-center md:items-start">
              <span className="font-label text-secondary text-xs tracking-[0.3em] uppercase mb-6 block">Our Philosophy</span>
              <h2 className="font-headline text-[clamp(2rem,4vw,4rem)] md:text-[clamp(2rem,4vw,4rem)] text-primary mb-8 leading-tight">
                We let the food <span className="italic font-normal">do the talking.</span>
              </h2>
              <p className="text-on-surface-variant text-lg leading-relaxed mb-10 max-w-md">
                We believe that the highest compliment a chef can receive isn't written online—it's what is left on the table. The empty plate is the only review that matters to us.
              </p>
              <Link href="/reservations" className="bg-primary text-on-primary px-8 py-4 rounded-full font-label text-xs tracking-widest uppercase hover:bg-emerald-800 transition-colors inline-block duration-300">
                Book Your Table
              </Link>
            </div>
            <div className="order-1 md:order-2 w-full flex bg-[#161a1d]">
              <img src="/only-review.webp" alt="Four empty plates representing a finished meal" className="w-full h-auto object-contain" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-surface-container-high overflow-hidden px-4 md:px-0">
        <div className="max-w-screen-2xl mx-auto px-8 relative">
          <span className="absolute top-0 right-0 font-headline text-[200px] text-primary/5 select-none leading-none pointer-events-none">"</span>
          <div className="w-full md:max-w-3xl">
            <span className="font-label text-secondary text-xs tracking-[0.3em] uppercase mb-12 block">Guest Stories</span>
            <div className="space-y-16">
              <div className="border-l-2 border-primary-fixed pl-8">
                <p className="font-headline text-[clamp(1.2rem,2vw,2rem)] text-primary mb-6 italic">"A rare find where the luxury doesn't come from excess, but from the incredible quality of ingredients and the peace of the farm. The Kerala Chicken is life-changing."</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <img alt="Portrait of a satisfied female guest" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBXr2G38GbXB138H5-2I98AyT6jB1fLCBV05QOZUodSQdB63bypAKIDP5W3fYAbRE4TQgRHvSSk6-F2NYkysc4kLeHQ7eXpBczuvV4Afws-aztm1Oqf32GoW29WW8VZOLSvWNgGgPLec06iIPVi3twz1AS-n3Khy13uWfbuif8sOEizlAJXz1S1Yo4fiijSH8aFbOCjAcItsaBj03TYI5zz9XcUlqEjrlPOKx8eTP_0beaoUH9UGIcvkIWe1iCvzkWetBBbvGXGMJ-U" />
                  </div>
                  <div>
                    <h5 className="font-label text-sm font-bold text-primary">Ananya Iyer</h5>
                    <span className="text-on-surface-variant text-xs">Food Critic, Bangalore</span>
                  </div>
                </div>
              </div>
              <div className="border-l-2 border-primary-fixed pl-8 md:ml-24">
                <p className="font-headline text-[clamp(1.2rem,2vw,2rem)] text-primary mb-6 italic">"The Grove is magic at twilight. Dining under the palms with the smell of wood-fire and spices in the air is an experience we will never forget."</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <img alt="Portrait of a happy male guest" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBg972gRu_FCGJZx6m71NL02zjbd4VZlBK8iYINklNJXWxUpRYUOxwpiyP9CnoH0uDybZRRAFK89eLqG_YfaL-ln3N8omnSLHVqRhkA-cTkMCMq9upm2gtZ43_QxGvRbMzCnJil8bcHEfiL4E2oxeSH7JYZ-KJPjxsfsl16pwMEN7hzUIaZp4GKiVI3p9TrOvJ7b9x9FfBgqnFn8fs97Ze0SsvboD6dPLSzi08inK8DqzJKZ67JOKe8IRPd-O-Qh2fD-mBP5PQtBSP_" />
                  </div>
                  <div>
                    <h5 className="font-label text-sm font-bold text-primary">Marcus Thorne</h5>
                    <span className="text-on-surface-variant text-xs">Travel Photographer</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="w-full bg-emerald-950">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 px-8 md:px-12 py-16 md:py-20 max-w-screen-2xl mx-auto">
          <div className="md:col-span-1">
            <span className="text-xl font-headline text-stone-50 mb-4 block">The Grove</span>
            <p className="text-stone-400 text-sm leading-relaxed font-body">Cultivating culinary memories in the heart of Tiruppur's finest coconut groves.</p>
          </div>
          <div>
            <span className="font-label text-stone-100 text-sm tracking-widest uppercase mb-6 block">Contact</span>
            <ul className="space-y-4">
              <li><Link className="text-stone-400 hover:text-stone-200 transition-colors text-sm font-body" href="#">reservations@thegrove.com</Link></li>
              <li><Link className="text-stone-400 hover:text-stone-200 transition-colors text-sm font-body" href="#">+91 98765 43210</Link></li>
            </ul>
          </div>
          <div>
            <span className="font-label text-stone-100 text-sm tracking-widest uppercase mb-6 block">Address</span>
            <p className="text-stone-400 text-sm font-body leading-relaxed">
              Grove Estate, Pollachi Main Rd,<br />
              Tiruppur, Tamil Nadu 641604
            </p>
          </div>
          <div>
            <span className="font-label text-stone-100 text-sm tracking-widest uppercase mb-6 block">Opening Hours</span>
            <ul className="space-y-2 text-stone-400 text-sm font-body">
              <li>Lunch: 12:00 PM - 3:30 PM</li>
              <li>Dinner: 7:00 PM - 11:00 PM</li>
              <li className="pt-4 text-stone-300 italic">Open Daily</li>
            </ul>
          </div>
        </div>
        <div className="px-4 md:px-12 py-8 border-t border-white/5 max-w-screen-2xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-stone-400 text-xs font-label tracking-widest uppercase">© 2024 The Grove, Tiruppur. All rights reserved.</span>
          <div className="flex gap-8">
            <Link className="text-stone-400 hover:text-stone-200 transition-colors font-label text-xs tracking-widest uppercase" href="#">Instagram</Link>
            <Link className="text-stone-400 hover:text-stone-200 transition-colors font-label text-xs tracking-widest uppercase" href="#">Facebook</Link>
          </div>
        </div>
      </footer>


    </div>
  );
}
