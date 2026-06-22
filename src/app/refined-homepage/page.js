
import Link from 'next/link';
import styles from './page.module.css';


export default function Page() {
  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary-container selection:text-on-primary">


      <nav className={`fixed top-0 w-full z-50   border-b border-primary/5 ${styles.glassNav}`}>
        <div className="flex justify-between items-center px-8 md:px-12 py-5 max-w-[1920px] mx-auto">
          <Link href="/" className="flex items-center justify-center">
            <img src="/assets/logo/g-logo.webp" alt="The Grove Logo" className="h-10 w-auto object-contain" />
          </Link>
          <div className="hidden lg:flex items-center space-x-10">
            <Link className="text-primary font-headline italic text-base border-b border-gold-accent pb-1" href="/">Home</Link>
            <Link className="text-on-surface-variant hover:text-primary transition-colors font-headline italic text-base" href="/interactive-menu">Menu</Link>
            <Link className="text-on-surface-variant hover:text-primary transition-colors font-headline italic text-base" href="/experience-gallery">Experience</Link>
            <Link className="text-on-surface-variant hover:text-primary transition-colors font-headline italic text-base" href="/memberships">Memberships</Link>
            <Link className="text-on-surface-variant hover:text-primary transition-colors font-headline italic text-base" href="/venue-booking">Book the Venue</Link>
          </div>
          <Link href="/reservations" className="bg-primary text-on-primary px-7 py-2.5 rounded-full font-label text-[10px] kerning-loose uppercase hover:bg-primary-container transition-all active:scale-95">
            Book a Table
          </Link>
        </div>
      </nav>

      <header className="relative min-h-[100dvh] w-full overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img src="/assets/ambience/07.jpg.webp" alt="The Grove Banner" className="w-full h-full object-cover brightness-75 scale-100" />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/30 via-transparent to-primary/60"></div>
        </div>
        <div className="relative z-10 text-center px-4 max-w-5xl">
          <span className="block font-label text-on-primary text-[10px] kerning-loose uppercase mb-8 opacity-90">Tiruppur's Hidden Sanctuary</span>
          <h1 className="font-headline text-[clamp(2rem,4vw,4rem)] md:text-[clamp(2rem,4vw,4rem)] text-on-primary mb-10 leading-[1.1] font-light">Where Nature<br /><span className="italic font-normal">Meets the Plate</span></h1>
          <div className="flex justify-center">
            <button className="group flex items-center gap-4 text-on-primary font-label text-[10px] kerning-loose uppercase">
              <span className="h-px w-12 bg-gold-accent transition-all group-hover:w-20"></span>
              Explore The Farm
            </button>
          </div>
        </div>
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-on-primary/70 flex flex-col items-center">
          <span className="font-label text-[9px] kerning-loose uppercase mb-3">Scroll</span>
          <span className={`  animate-bounce text-sm  material-symbols-outlined ${styles.materialSymbolsOutlined}`}>keyboard_double_arrow_down</span>
        </div>
      </header>

      <section className="py-16 md:py-24 lg:py-48 px-4 md:px-20 bg-surface">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
          <div className="lg:col-span-5 order-2 lg:order-1">
            <span className="font-label text-gold-accent text-[10px] kerning-loose uppercase mb-8 block font-medium">OUR ETHOS</span>
            <h2 className="font-headline text-[clamp(2rem,4vw,4rem)] md:text-[clamp(2rem,4vw,4rem)] text-primary mb-10 leading-tight font-light">A Dining <span className="italic">Sanctuary</span></h2>
            <div className="w-20 h-px bg-gold-accent mb-10"></div>
            <p className="text-on-surface-variant text-lg leading-relaxed mb-10 font-light italic">
              Nestled within a centuries-old coconut farm, The Grove offers more than a meal—it's a sensory journey through Tiruppur's vibrant agrarian landscape.
            </p>
            <p className="text-on-surface-variant text-base leading-relaxed mb-12 font-light">
              We believe in the luxury of silence, the warmth of the sun, and the honesty of earth-to-table cuisine. Each season dictates our palette, ensuring that what arrives at your table is the purest expression of the land.
            </p>
            <Link className="inline-flex items-center gap-4 text-primary font-label text-[10px] kerning-loose uppercase group" href="#">
              Learn about our heritage
              <span className={`  text-sm group-hover:translate-x-1 transition-transform  material-symbols-outlined ${styles.materialSymbolsOutlined}`}>arrow_forward</span>
            </Link>
          </div>
          <div className="lg:col-span-7 order-1 lg:order-2 relative">
            <div className={`aspect-[4/5] md:aspect-[16/10] overflow-hidden   ${styles.editorialShadow}`}>
              <img className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-1000" data-alt="Sunlight filtering through coconut trees onto a rustic outdoor dining table" src="/assets/ambience/02.jpg.webp" />
            </div>

            <div className={`absolute -bottom-10 -left-6 md:left-12 bg-primary p-10 max-w-xs   border-t-4 border-gold-accent ${styles.editorialShadow}`}>
              <h4 className="font-headline italic text-on-primary text-2xl mb-4 font-light">Rooted in Earth</h4>
              <p className="text-on-primary/60 text-xs font-light leading-relaxed uppercase kerning-loose">Every ingredient is sourced from within a 20-mile radius, honoring the seasons.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-32 bg-surface-container px-4 md:px-0">
        <div className="max-w-[1600px] mx-auto px-8 md:px-20">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
            <div className="w-full md:max-w-xl">
              <span className="font-label text-gold-accent text-[10px] kerning-loose uppercase mb-6 block font-medium">SEASONAL HIGHLIGHTS</span>
              <h2 className="font-headline text-[clamp(2rem,4vw,4rem)] md:text-[clamp(2rem,4vw,4rem)] text-primary font-light">Chef's <span className="italic">Table</span></h2>
            </div>
            <p className="text-on-surface-variant font-headline italic text-xl max-w-xs text-right">Curated flavors that define the South.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-24 gap-y-32">

            <div className="group">
              <div className="aspect-[4/5] mb-12 overflow-hidden bg-primary/5">
                <img className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110" data-alt="Exquisitely plated Kerala Chicken" src="/assets/food/keralachicken.webp" />
              </div>
              <div className="flex justify-between items-baseline border-b border-primary/10 pb-6">
                <div>
                  <h3 className="font-headline text-[clamp(1.2rem,2vw,2rem)] text-primary mb-3 font-light">Kerala Chicken</h3>
                  <p className="text-on-surface-variant text-base font-light italic max-w-sm">Slow-roasted with hand-ground spices and caramelized shallots.</p>
                </div>
                <span className="font-label text-gold-accent font-medium kerning-loose text-sm">₹850</span>
              </div>
            </div>

            <div className="group md:mt-32">
              <div className="aspect-[4/5] mb-12 overflow-hidden bg-primary/5">
                <img className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110" data-alt="Succulent Butter Garlic Prawns" src="/assets/food/prawns.webp" />
              </div>
              <div className="flex justify-between items-baseline border-b border-primary/10 pb-6">
                <div>
                  <h3 className="font-headline text-[clamp(1.2rem,2vw,2rem)] text-primary mb-3 font-light">Butter Garlic Prawns</h3>
                  <p className="text-on-surface-variant text-base font-light italic max-w-sm">Jumbo river prawns tossed in cultured farm butter.</p>
                </div>
                <span className="font-label text-gold-accent font-medium kerning-loose text-sm">₹1,150</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-32 bg-surface px-4 md:px-0">
        <div className="max-w-[1600px] mx-auto px-8 md:px-20">
          <div className="text-center mb-24">
            <span className="font-label text-gold-accent text-[10px] kerning-loose uppercase mb-6 block font-medium">VISUAL JOURNEY</span>
            <h2 className="font-headline text-[clamp(2rem,4vw,4rem)] md:text-[clamp(2rem,4vw,4rem)] text-primary font-light">Our <span className="italic">Atmosphere</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:h-[900px] auto-rows-[300px] md:auto-rows-auto">
            <div className="md:col-span-8 relative overflow-hidden group">
              <img className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700" data-alt="Vast outdoor dining area" src="/assets/ambience/08.jpg.webp" />
              <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-on-primary font-label text-[10px] kerning-loose uppercase border border-on-primary/30 px-6 py-3">The Al Fresco Deck</span>
              </div>
            </div>
            <div className="md:col-span-4 relative overflow-hidden group">
              <img className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700" data-alt="Intimate candle-lit table" src="/assets/food/_J8A8978-Edit.webp" />
              <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-on-primary font-label text-[10px] kerning-loose uppercase border border-on-primary/30 px-6 py-3">The Glass House</span>
              </div>
            </div>
            <div className="md:col-span-4 relative overflow-hidden group">
              <img className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700" data-alt="Artistic close-up of chef" src="/assets/ambience/05.jpg.webp" />
              <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-on-primary font-label text-[10px] kerning-loose uppercase border border-on-primary/30 px-6 py-3">Chef's Precision</span>
              </div>
            </div>
            <div className="md:col-span-8 relative overflow-hidden group">
              <img className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700" data-alt="Variety of farm-to-table dishes" src="/assets/food/1L1A9172.webp" />
              <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-on-primary font-label text-[10px] kerning-loose uppercase border border-on-primary/30 px-6 py-3">Seasonal Harvest</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-32 bg-primary text-on-primary overflow-hidden relative px-4 md:px-0">
        <div className="absolute top-0 right-10 opacity-5 font-headline text-[300px] leading-none pointer-events-none italic">"</div>
        <div className="max-w-[1600px] mx-auto px-8 md:px-20 relative">
          <span className="font-label text-gold-accent text-[10px] kerning-loose uppercase mb-16 block font-medium">GUEST STORIES</span>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
            <div className="space-y-12">
              <p className="font-headline text-[clamp(2rem,4vw,4rem)] leading-relaxed italic font-light">
                "A rare find where the luxury doesn't come from excess, but from the incredible quality of ingredients and the peace of the farm."
              </p>
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-full overflow-hidden border border-gold-accent/30 p-1">
                  <img className="w-full h-full object-cover rounded-full" data-alt="Portrait of Ananya Iyer" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBXr2G38GbXB138H5-2I98AyT6jB1fLCBV05QOZUodSQdB63bypAKIDP5W3fYAbRE4TQgRHvSSk6-F2NYkysc4kLeHQ7eXpBczuvV4Afws-aztm1Oqf32GoW29WW8VZOLSvWNgGgPLec06iIPVi3twz1AS-n3Khy13uWfbuif8sOEizlAJXz1S1Yo4fiijSH8aFbOCjAcItsaBj03TYI5zz9XcUlqEjrlPOKx8eTP_0beaoUH9UGIcvkIWe1iCvzkWetBBbvGXGMJ-U" />
                </div>
                <div>
                  <h5 className="font-label text-xs font-bold kerning-loose uppercase">Ananya Iyer</h5>
                  <span className="text-gold-accent text-[10px] uppercase kerning-loose">Food Critic, Bangalore</span>
                </div>
              </div>
            </div>
            <div className="space-y-12 lg:mt-32">
              <p className="font-headline text-[clamp(2rem,4vw,4rem)] leading-relaxed italic font-light">
                "The Grove is magic at twilight. Dining under the palms with the smell of wood-fire and spices is an experience we will never forget."
              </p>
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-full overflow-hidden border border-gold-accent/30 p-1">
                  <img className="w-full h-full object-cover rounded-full" data-alt="Portrait of Marcus Thorne" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBg972gRu_FCGJZx6m71NL02zjbd4VZlBK8iYINklNJXWxUpRYUOxwpiyP9CnoH0uDybZRRAFK89eLqG_YfaL-ln3N8omnSLHVqRhkA-cTkMCMq9upm2gtZ43_QxGvRbMzCnJil8bcHEfiL4E2oxeSH7JYZ-KJPjxsfsl16pwMEN7hzUIaZp4GKiVI3p9TrOvJ7b9x9FfBgqnFn8fs97Ze0SsvboD6dPLSzi08inK8DqzJKZ67JOKe8IRPd-O-Qh2fD-mBP5PQtBSP_" />
                </div>
                <div>
                  <h5 className="font-label text-xs font-bold kerning-loose uppercase">Marcus Thorne</h5>
                  <span className="text-gold-accent text-[10px] uppercase kerning-loose">Travel Photographer</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="w-full bg-primary pt-32 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-16 px-4 md:px-20 max-w-[1600px] mx-auto border-b border-on-primary/10 pb-12 md:pb-20">
          <div className="md:col-span-1">
            <span className="text-3xl font-headline font-bold text-on-primary mb-8 block tracking-tighter">THE GROVE</span>
            <p className="text-on-primary/50 text-sm leading-relaxed font-light italic">Cultivating culinary memories in the heart of Tiruppur's finest coconut groves.</p>
          </div>
          <div>
            <span className="font-label text-gold-accent text-[10px] kerning-loose uppercase mb-8 block font-medium">CONTACT</span>
            <ul className="space-y-4">
              <li><Link className="text-on-primary/70 hover:text-gold-accent transition-colors text-sm font-light" href="#">reservations@thegrove.com</Link></li>
              <li><Link className="text-on-primary/70 hover:text-gold-accent transition-colors text-sm font-light" href="#">+91 98765 43210</Link></li>
            </ul>
          </div>
          <div>
            <span className="font-label text-gold-accent text-[10px] kerning-loose uppercase mb-8 block font-medium">LOCATION</span>
            <p className="text-on-primary/70 text-sm font-light leading-relaxed italic">
              Grove Estate, Pollachi Main Rd,<br />
              Tiruppur, Tamil Nadu 641604
            </p>
          </div>
          <div>
            <span className="font-label text-gold-accent text-[10px] kerning-loose uppercase mb-8 block font-medium">DINING HOURS</span>
            <ul className="space-y-2 text-on-primary/70 text-sm font-light">
              <li className="flex justify-between"><span>Lunch:</span> <span>12:00 PM - 3:30 PM</span></li>
              <li className="flex justify-between"><span>Dinner:</span> <span>7:00 PM - 11:00 PM</span></li>
              <li className="pt-4 text-gold-accent italic">Open Daily</li>
            </ul>
          </div>
        </div>
        <div className="px-4 md:px-8 md:px-20 py-12 max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <span className="text-on-primary/30 text-[10px] font-label kerning-loose uppercase">© 2024 THE GROVE, TIRUPPUR. ALL RIGHTS RESERVED.</span>
          <div className="flex gap-12">
            <Link className="text-on-primary/30 hover:text-gold-accent transition-colors font-label text-[10px] kerning-loose uppercase" href="#">Instagram</Link>
            <Link className="text-on-primary/30 hover:text-gold-accent transition-colors font-label text-[10px] kerning-loose uppercase" href="#">Facebook</Link>
          </div>
        </div>
      </footer>



    </div>
  );
}
