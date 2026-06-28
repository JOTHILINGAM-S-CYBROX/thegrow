
import Link from 'next/link';
import styles from './page.module.css';


export default function Page() {
  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary-fixed-dim selection:text-on-primary-fixed">



      <main className="pt-24">

        <section className="px-8 pt-12 md:pt-24 pb-12 max-w-screen-2xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="md:col-span-7 flex flex-col justify-center">
              <span className="font-label text-sm tracking-[0.2em] text-outline uppercase block mb-4">Unparalleled Ambiance</span>
              <h1 className="font-headline text-[clamp(3rem,8vw,6rem)] text-primary leading-tight mb-8">Dappled Light &amp; <br /><span className="italic">Verdant Whispers.</span></h1>
              <p className="text-on-surface-variant text-lg leading-relaxed max-w-md">
                Step away from the city's pulse and into the quiet majesty of our coconut grove. A dining experience where the environment is as carefully curated as the cuisine.
              </p>
            </div>
            <div className="md:col-span-5 w-full">
              <div className="relative overflow-hidden rounded-xl w-full h-[300px] md:h-[500px]">
                <img className="w-full h-full object-cover shadow-sm" data-alt="Ambient outdoor lighting fixtures" src="/assets/ambience/10.jpg.webp" />
              </div>
            </div>
          </div>
        </section>

        <section className="px-8 py-12 max-w-screen-2xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-10">

            <div className="md:col-span-8 group relative overflow-hidden rounded-xl">
              <img className="w-full h-[400px] md:h-[700px] object-cover group-hover:scale-105 transition-transform duration-700" data-alt="Outdoor dining tables under majestic coconut palms" src="/assets/food/1L1A8974.webp" />
              <div className="absolute bottom-8 left-8 bg-surface-container-low/90 backdrop-blur-md p-6 max-w-xs rounded-lg shadow-sm">
                <h3 className="font-headline text-xl text-primary mb-2 italic text-emerald-900">The Central Lawn</h3>
                <p className="font-body text-sm text-on-surface-variant">Vast open spaces where the evening breeze meets the warmth of communal dining.</p>
              </div>
            </div>

            <div className="md:col-span-4 flex flex-col gap-6 lg:gap-10">
              <div className="h-1/2 group relative overflow-hidden rounded-xl">
                <img className="w-full h-[250px] md:h-[330px] object-cover group-hover:scale-105 transition-transform duration-700" data-alt="Close up of ambient outdoor lighting fixtures" src="/assets/ambience/10.jpg.webp" />
                <div className="absolute top-4 right-4">
                  <span className="bg-surface/90 backdrop-blur text-xs font-label tracking-widest uppercase px-3 py-1 rounded-full text-primary">Ambient Lighting</span>
                </div>
              </div>
              <div className="h-1/2 group relative overflow-hidden rounded-xl">
                <img className="w-full h-[250px] md:h-[330px] object-cover group-hover:scale-105 transition-transform duration-700" data-alt="Premium wooden outdoor seating arrangement" src="/assets/ambience/11.jpg.webp" />
                <div className="absolute bottom-4 left-4">
                  <span className="bg-surface/90 backdrop-blur text-xs font-label tracking-widest uppercase px-3 py-1 rounded-full text-primary">Intimate Nooks</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-5 group relative overflow-hidden rounded-xl">
              <img className="w-full h-[300px] md:h-[450px] object-cover group-hover:scale-105 transition-transform duration-700" data-alt="Wide shot of the restaurant during golden hour" src="/assets/food/_J8A8978-Edit.webp" />
            </div>
            <div className="md:col-span-7 group relative overflow-hidden rounded-xl">
              <img className="w-full h-[300px] md:h-[450px] object-cover group-hover:scale-105 transition-transform duration-700" data-alt="Dappled sunlight hitting a stone path in a garden" src="/assets/food/1L1A9129.webp" />
            </div>
          </div>
        </section>

        <section className="mt-24 py-24 bg-surface-container-low">
          <div className="max-w-screen-2xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="aspect-square rounded-full overflow-hidden border-[16px] border-surface shadow-2xl">
                <img className="w-full h-full object-cover" data-alt="Children playing on high quality wooden playground equipment" src="/assets/food/1L1A9180.webp" />
              </div>
              <div className="absolute -top-8 -right-8 w-48 h-48 bg-tertiary-fixed rounded-full flex items-center justify-center p-8 text-center animate-pulse duration-[4000ms]">
                <span className="font-headline italic text-on-tertiary-fixed text-lg">Safely Tucked in Nature</span>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <span className="font-label text-sm tracking-[0.2em] text-outline uppercase block mb-6">For the Little Ones</span>
              <h2 className="font-headline text-[clamp(2.5rem,6vw,4rem)] text-primary mb-8 leading-tight">The Young Grove <br /><span className="italic text-secondary">Play Garden.</span></h2>
              <p className="text-on-surface-variant text-lg leading-relaxed mb-10 max-w-lg">
                Our dedicated kids' play area is designed with natural materials and safety at the forefront, allowing parents to dine in peace while children explore a curated, safe outdoor environment.
              </p>
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-center">
                  <span className={`  text-secondary text-3xl mb-2  material-symbols-outlined ${styles.materialSymbolsOutlined}`}>child_care</span>
                  <span className="text-xs font-label uppercase tracking-widest text-outline">Supervised</span>
                </div>
                <div className="w-px h-12 bg-outline-variant"></div>
                <div className="flex flex-col items-center">
                  <span className={`  text-secondary text-3xl mb-2  material-symbols-outlined ${styles.materialSymbolsOutlined}`}>nature_people</span>
                  <span className="text-xs font-label uppercase tracking-widest text-outline">Organic Play</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-32 px-8 max-w-screen-2xl mx-auto">
          <div className="text-center mb-20">
            <span className="font-label text-sm tracking-[0.2em] text-outline uppercase block mb-4">Host with Us</span>
            <h2 className="font-headline text-[clamp(2.5rem,8vw,5rem)] text-primary italic">Signature Event Spaces</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6 h-auto md:h-[800px]">
            <div className="md:col-span-2 md:row-span-2 bg-surface-container-lowest rounded-xl p-10 flex flex-col justify-between group cursor-pointer border border-outline-variant/15 hover:border-outline-variant/40 transition-colors">
              <div>
                <h3 className="font-headline text-3xl text-primary mb-4">Enchanted Birthdays</h3>
                <p className="text-on-surface-variant leading-relaxed">From themed decor to customized menus, we make milestones magical under the stars.</p>
              </div>
              <div className="mt-8 rounded-xl overflow-hidden h-96">
                <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" data-alt="Elegant outdoor party setup with fairy lights" src="/assets/ambience/07.jpg.webp" />
              </div>
            </div>
            <div className="md:col-span-2 bg-primary text-on-primary rounded-xl p-10 flex flex-col md:flex-row gap-8 items-center justify-between group overflow-hidden">
              <div className="flex-1">
                <h3 className="font-headline text-3xl mb-4">Corporate Retreats</h3>
                <p className="text-on-primary-container text-sm leading-relaxed mb-6">Escape the boardroom. Boost morale in a setting that encourages fresh perspectives.</p>
                <button className="bg-surface-container-lowest text-primary px-6 py-2 rounded-full font-label text-xs uppercase tracking-widest">Inquire Now</button>
              </div>
              <div className="w-full md:w-1/2 h-48 md:h-full">
                <img className="w-full h-full object-cover rounded-lg opacity-80 group-hover:opacity-100 transition-opacity" data-alt="Formal corporate table setting outdoors" src="/assets/ambience/08.jpg.webp" />
              </div>
            </div>
            <div className="md:col-span-2 bg-secondary-container rounded-xl p-10 flex items-center justify-center relative group overflow-hidden">
              <img className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:scale-110 transition-transform duration-1000" data-alt="Minimalist wedding reception setup" src="/assets/food/1L1A9205-Edit.webp" />
              <div className="relative z-10 text-center">
                <h3 className="font-headline text-3xl text-on-secondary-container italic mb-2">Bespoke Weddings</h3>
                <p className="text-on-secondary-container text-sm font-label uppercase tracking-widest">Intimate &amp; Organic Celebrations</p>
              </div>
            </div>
          </div>
        </section>

      </main>

      <footer className="w-full mt-24 bg-emerald-950 dark:bg-stone-950">
        <div className="bg-emerald-900 dark:bg-stone-900">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 px-12 py-20 max-w-screen-2xl mx-auto">
            <div className="md:col-span-1">
              <span className="text-xl font-serif text-stone-50 mb-4 block">The Grove</span>
              <p className="text-stone-400 font-sans text-sm leading-relaxed">A sanctuary of fine dining amidst the rhythmic beauty of nature. Join us in Tiruppur for an unforgettable journey.</p>
            </div>
            <div className="flex flex-col gap-4">
              <span className="font-sans text-sm tracking-widest uppercase text-stone-50 font-bold">Contact</span>
              <Link className="text-stone-400 hover:text-stone-200 hover:underline decoration-stone-500 underline-offset-4 transition-all" href="#">Phone: +91 98765 43210</Link>
              <Link className="text-stone-400 hover:text-stone-200 hover:underline decoration-stone-500 underline-offset-4 transition-all" href="#">Email: hello@thegrove.com</Link>
            </div>
            <div className="flex flex-col gap-4">
              <span className="font-sans text-sm tracking-widest uppercase text-stone-50 font-bold">Address</span>
              <p className="text-stone-400">123 Palm Avenue, <br />Coconut Circle, Tiruppur, <br />Tamil Nadu 641601</p>
            </div>
            <div className="flex flex-col gap-4">
              <span className="font-sans text-sm tracking-widest uppercase text-stone-50 font-bold">Opening Hours</span>
              <p className="text-stone-400">Open Daily 11 AM - 11 PM</p>
            </div>
          </div>
        </div>
        <div className="py-8 px-12 border-t border-stone-800 max-w-screen-2xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-stone-500 text-xs tracking-widest uppercase">© 2024 The Grove, Tiruppur. All rights reserved.</p>
          <div className="flex gap-8">
            <Link className="text-stone-500 hover:text-stone-100 transition-colors text-xs uppercase tracking-widest" href="#">Privacy</Link>
            <Link className="text-stone-500 hover:text-stone-100 transition-colors text-xs uppercase tracking-widest" href="#">Terms</Link>
          </div>
        </div>
      </footer>



    </div>
  );
}
