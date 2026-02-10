import { Facebook, Instagram } from 'lucide-react';
import Image from 'next/image';

export default function Footer() {
    return (
        <footer className="bg-stone-950 border-t border-stone-800 text-stone-400 pt-20 pb-10 font-sans">
            <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-12 mb-16">
                <div className="space-y-6">
                    <div className="relative h-12 w-48">
                        <Image
                            src="/images/logo.png"
                            alt="Moma Excursiones Logo"
                            fill
                            className="object-contain object-left brightness-0 invert"
                            priority
                        />
                    </div>
                    <p className="text-sm leading-relaxed text-stone-300">
                        Excursiones Montes de María es una iniciativa que busca mostrar el majestuoso aporte visual y cultural de nuestra región a través del turismo sostenible.
                    </p>
                    <div className="flex space-x-4">
                        <a href="https://www.instagram.com/momaexcursiones/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-stone-900 border border-stone-800 rounded-full flex items-center justify-center hover:bg-moma-green hover:border-moma-green hover:text-white transition-all duration-300 hover:-translate-y-1" aria-label="Síguenos en Instagram">
                            <Instagram className="w-5 h-5" />
                        </a>
                        <a href="https://www.facebook.com/momaexcursiones" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-stone-900 border border-stone-800 rounded-full flex items-center justify-center hover:bg-moma-green hover:border-moma-green hover:text-white transition-all duration-300 hover:-translate-y-1" aria-label="Síguenos en Facebook">
                            <Facebook className="w-5 h-5" />
                        </a>
                    </div>
                </div>

                <div>
                    <h3 className="text-white font-heading font-bold mb-6 text-lg">Navegación</h3>
                    <ul className="space-y-4 text-sm">
                        <li><a href="#" className="hover:text-moma-green transition-colors hover:pl-1 duration-300 block">Inicio</a></li>
                        <li><a href="#" className="hover:text-moma-green transition-colors hover:pl-1 duration-300 block">Excursiones</a></li>
                        <li><a href="#" className="hover:text-moma-green transition-colors hover:pl-1 duration-300 block">Quienes somos</a></li>
                        <li><a href="#" className="hover:text-moma-green transition-colors hover:pl-1 duration-300 block">Contacto</a></li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-white font-heading font-bold mb-6 text-lg">Información</h3>
                    <ul className="space-y-4 text-sm">
                        <li><a href="#" className="hover:text-moma-green transition-colors hover:pl-1 duration-300 block">Política de privacidad</a></li>
                        <li><a href="#" className="hover:text-moma-green transition-colors hover:pl-1 duration-300 block">Términos de servicio</a></li>
                        <li><a href="#" className="hover:text-moma-green transition-colors hover:pl-1 duration-300 block">Sostenibilidad</a></li>
                    </ul>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 pt-8 border-t border-stone-800/50 flex flex-col md:flex-row justify-between items-center text-xs text-stone-500">
                <p>&copy; {new Date().getFullYear()} Excursiones Montes de María. Todos los derechos reservados.</p>
                <div className="flex items-center space-x-2 mt-4 md:mt-0 bg-stone-900/50 px-3 py-1 rounded-full border border-stone-800">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="font-medium text-stone-300">Experiencia Certificada</span>
                </div>
            </div>
        </footer>
    )
}
