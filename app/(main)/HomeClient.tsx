'use client';

import { useEffect, useState } from 'react';
import ExperienceCarousel from '@/components/experiences/ExperienceCarousel';
import Link from 'next/link';
import { Phone, Mail, MapPin, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllExperiencesPersisted, type Experience } from '@/lib/experience-service';

interface HomeClientProps {
  initialExperiences: Experience[];
}

export default function HomeClient({ initialExperiences }: HomeClientProps) {
  const [experiences, setExperiences] = useState<Experience[]>(initialExperiences || []);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let cancelled = false;
    const id = window.setTimeout(() => {
      if (cancelled) return;
      getAllExperiencesPersisted().then((data) => {
        if (!cancelled) setExperiences(data);
      });
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, []);

  useEffect(() => {
    if (experiences.length <= 1) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentSlide((prev) => (prev + 1) % experiences.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [experiences.length]);

  const nextSlide = () => {
    if (experiences.length === 0) return;
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % experiences.length);
  };
  const prevSlide = () => {
    if (experiences.length === 0) return;
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + experiences.length) % experiences.length);
  };

  const hasExperiences = experiences.length > 0;
  const currentExperience = hasExperiences ? experiences[currentSlide] : null;

  return (
    <div className="flex flex-col min-h-screen">
      <section className="relative h-screen flex items-center overflow-hidden bg-stone-900">
        <div className="absolute inset-0 z-0">
          <AnimatePresence>
            <motion.div
              key={currentSlide}
              initial={{ x: direction > 0 ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: direction > 0 ? '-100%' : '100%' }}
              transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
              className="absolute inset-0"
            >
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${currentExperience?.image || '/images/hero-bg.jpg'})` }}
              ></div>
              <div className="absolute inset-0 bg-black/40"></div>
              <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/20 to-transparent"></div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="relative z-10 px-4 max-w-7xl mx-auto w-full pt-20">
          <div className="max-w-3xl">
            <motion.div
              key={`content-${currentSlide}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="text-5xl md:text-7xl font-sans font-bold text-white mb-4 leading-tight">
                {currentExperience
                  ? currentExperience.title
                  : <>La magia de la <br /><span className="text-moma-green italic font-serif">naturaleza</span> te <br />espera</>}
              </h1>
              <p className="flex items-center gap-2 text-sm font-medium text-moma-green mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 6-9 13-9 13s-9-7-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {currentExperience?.location_name || 'Colombia'}
              </p>
              <p className="text-lg md:text-xl text-stone-200 mb-10 font-light max-w-lg leading-relaxed line-clamp-3">
                {currentExperience
                  ? currentExperience.description
                  : 'Explora experiencias únicas en la naturaleza colombiana, seleccionadas y gestionadas desde nuestro panel de tours.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <Link
                  href={currentExperience ? `/experiencias/${currentExperience.slug}` : "#experiencias"}
                  className="bg-moma-green text-white px-8 py-4 rounded-full text-base font-bold hover:bg-white hover:text-moma-green transition-all shadow-lg shadow-moma-green/20 flex items-center justify-center min-w-[200px]"
                >
                  Ver Experiencia <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <div className="flex gap-2">
                  <button onClick={prevSlide} className="p-3 rounded-full border border-white/20 text-white hover:bg-white hover:text-black transition-all" aria-label="Anterior">
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button onClick={nextSlide} className="p-3 rounded-full border border-white/20 text-white hover:bg-white hover:text-black transition-all" aria-label="Siguiente">
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {experiences.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`w-12 h-1 rounded-full transition-all ${i === currentSlide ? 'bg-moma-green' : 'bg-white/30'}`}
            />
          ))}
        </div>
      </section>

      <section id="experiencias" className="pt-12 pb-4 px-4 bg-stone-50 dark:bg-stone-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-moma-green italic font-serif text-lg mb-2 block">Lugares para ir</span>
            <h2 className="text-4xl font-bold text-stone-900 dark:text-white">Un destino perfecto</h2>
            <p className="text-stone-500 mt-4 max-w-2xl mx-auto">¡Descubre el mundo a tu manera! Te invitamos a embarcarte en una emocionante aventura a través de nuestras rutas turísticas.</p>
          </div>

          <ExperienceCarousel experiences={experiences} />
        </div>
      </section>

      <section id="nosotros" className="py-24 bg-white dark:bg-stone-900">
        <div className="max-w-7xl mx-auto px-4 text-center mb-16">
          <span className="text-moma-green italic font-serif text-lg mb-2 block">Una elección brillante</span>
          <h2 className="text-4xl font-bold text-stone-900 dark:text-white">¿Por qué elegirnos?</h2>
        </div>

        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-8">
          {[
            { title: 'Autenticidad y Cultura', icon: '🌿' },
            { title: 'Conservación', icon: '🌱' },
            { title: 'Experiencias Únicas', icon: '🌵' },
            { title: 'Apoyo Local', icon: '👥' }
          ].map((item, i) => (
            <div key={i} className="text-center group p-6 rounded-2xl hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors">
              <div className="w-20 h-20 bg-white shadow-lg rounded-full flex items-center justify-center mx-auto mb-6 text-3xl group-hover:scale-110 transition-transform text-moma-green">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-stone-900 dark:text-white">{item.title}</h3>
              <p className="text-stone-500 text-sm leading-relaxed">
                Compromiso con el turismo sostenible y el desarrollo de comunidades locales.
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 bg-stone-900 relative overflow-hidden">
        {/* Background with color but dark overlay for contrast */}
        <div className="absolute inset-0 bg-[url('/images/montes-m-frame.webp')] bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-stone-900/80 backdrop-blur-[1px]"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div className="bg-moma-green/10 p-8 rounded-3xl border border-moma-green/20 backdrop-blur-sm">
            <div className="h-48 flex items-center justify-center border border-white/20 rounded-xl mb-4">
              <span className="text-white/50 text-xs tracking-widest uppercase">Visual Mountain Safe Rock Work</span>
            </div>
          </div>
          <div className="text-white">
            <span className="text-moma-green uppercase tracking-widest text-xs font-bold mb-3 block font-sans">Ideas que transforman</span>
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6 leading-tight">
              Únete a nuestra aventura y deja huellas positivas en la naturaleza
            </h2>
            <div className="w-20 h-1 bg-moma-green rounded-full"></div>
          </div>
        </div>
      </section>

      <section id="contacto" className="py-24 bg-stone-50 dark:bg-stone-950">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-moma-green italic font-serif text-lg mb-2 block">Ponte en contacto</span>
            <h2 className="text-4xl font-bold text-stone-900 dark:text-white">Envíanos un mensaje</h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl shadow-sm flex items-center">
                <div className="w-12 h-12 bg-moma-green/10 rounded-full flex items-center justify-center text-moma-green mr-4">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-stone-400 uppercase font-bold">Whatsapp</p>
                  <p className="font-medium text-stone-900 dark:text-white">+57 301 6566932</p>
                </div>
              </div>
              <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl shadow-sm flex items-center">
                <div className="w-12 h-12 bg-moma-green/10 rounded-full flex items-center justify-center text-moma-green mr-4">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-stone-400 uppercase font-bold">Email</p>
                  <p className="font-medium text-stone-900 dark:text-white">momaexcursiones@gmail.com</p>
                </div>
              </div>
              <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl shadow-sm flex items-center">
                <div className="w-12 h-12 bg-moma-green/10 rounded-full flex items-center justify-center text-moma-green mr-4">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-stone-400 uppercase font-bold">Ubicación</p>
                  <p className="font-medium text-stone-900 dark:text-white">Sucre, Colombia</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 bg-white dark:bg-stone-900 p-8 rounded-3xl shadow-sm">
              <form className="grid md:grid-cols-2 gap-6">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2">Nombre</label>
                  <input type="text" className="w-full bg-stone-50 dark:bg-stone-800 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-moma-green transition-all" placeholder="Tu nombre" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2">Email</label>
                  <input type="email" className="w-full bg-stone-50 dark:bg-stone-800 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-moma-green transition-all" placeholder="tucorreo@email.com" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2">Mensaje</label>
                  <textarea rows={4} className="w-full bg-stone-50 dark:bg-stone-800 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-moma-green transition-all" placeholder="Cuéntanos tus planes..."></textarea>
                </div>
                <div className="col-span-2">
                  <button className="bg-moma-green text-white px-8 py-4 rounded-full font-bold hover:bg-opacity-90 transition-all w-full md:w-auto">
                    Enviar Mensaje
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

