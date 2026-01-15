import { Facebook, Instagram } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-[#1A202C] border-t border-stone-800 text-stone-400 pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-12 mb-16">
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <div className="w-8 h-8 bg-moma-green rounded-lg"></div>
                        MOMA
                    </h2>
                    <p className="text-sm leading-relaxed">
                        Excursiones Montes de María es una iniciativa que busca mostrar el majestuoso aporte visual y cultural de nuestra región a través del turismo sostenible.
                    </p>
                    <div className="flex space-x-4">
                        <a href="#" className="w-10 h-10 bg-stone-800 rounded-full flex items-center justify-center hover:bg-moma-green hover:text-white transition-all" aria-label="Síguenos en Instagram">
                            <Instagram className="w-5 h-5" />
                        </a>
                        <a href="#" className="w-10 h-10 bg-stone-800 rounded-full flex items-center justify-center hover:bg-moma-green hover:text-white transition-all" aria-label="Síguenos en Facebook">
                            <Facebook className="w-5 h-5" />
                        </a>
                    </div>
                </div>

                <div>
                    <h3 className="text-white font-bold mb-6">Navegación</h3>
                    <ul className="space-y-4 text-sm">
                        <li><a href="#" className="hover:text-moma-green transition-colors">Inicio</a></li>
                        <li><a href="#" className="hover:text-moma-green transition-colors">Excursiones</a></li>
                        <li><a href="#" className="hover:text-moma-green transition-colors">Quienes somos</a></li>
                        <li><a href="#" className="hover:text-moma-green transition-colors">Contacto</a></li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-white font-bold mb-6">Información</h3>
                    <ul className="space-y-4 text-sm">
                        <li><a href="#" className="hover:text-moma-green transition-colors">Política de privacidad</a></li>
                        <li><a href="#" className="hover:text-moma-green transition-colors">Términos de servicio</a></li>
                        <li><a href="#" className="hover:text-moma-green transition-colors">Sostenibilidad</a></li>
                    </ul>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 pt-8 border-t border-stone-800 flex flex-col md:flex-row justify-between items-center text-xs">
                <p>&copy; {new Date().getFullYear()} Excursiones Montes de María. Todos los derechos reservados.</p>
                <div className="flex items-center space-x-2 mt-4 md:mt-0">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span>Experiencia Certificada</span>
                </div>
            </div>
        </footer>
    )
}
