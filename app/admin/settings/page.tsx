'use client';
import { useState } from 'react';
import { Save, ToggleLeft, ToggleRight, Shield } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
    const [stripeEnabled, setStripeEnabled] = useState(true);
    const [wompiEnabled, setWompiEnabled] = useState(true);

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Configuración</h1>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/admin/settings/roles" className="bg-white dark:bg-stone-900 p-6 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800 flex items-center gap-4 hover:border-moma-green transition-colors group">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                        <Shield className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-stone-900 dark:text-white">Roles y Permisos</h3>
                        <p className="text-xs text-stone-500">Gestionar acceso de usuarios</p>
                    </div>
                </Link>
            </div>

            <div className="bg-white dark:bg-stone-900 rounded-xl shadow-sm border border-stone-100 dark:border-stone-800 p-8 space-y-8">
                <h2 className="text-lg font-bold text-stone-900 dark:text-white border-b border-stone-100 pb-4">Pasarela de Pagos</h2>

                {/* Stripe Config */}
                <div className="space-y-4 border-b border-stone-100 dark:border-stone-800 pb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-stone-900 dark:text-white">Stripe (Pagos Internacionales)</h3>
                            <p className="text-sm text-stone-500">Habilitar cobros en USD para clientes extranjeros.</p>
                        </div>
                        <button onClick={() => setStripeEnabled(!stripeEnabled)} className={`transition-colors ${stripeEnabled ? 'text-moma-green' : 'text-stone-300'}`}>
                            {stripeEnabled ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10" />}
                        </button>
                    </div>
                    {stripeEnabled && (
                        <div className="space-y-3 animate-fade-in">
                            <div>
                                <label className="block text-xs font-bold uppercase text-stone-400 mb-1">Stripe Secret Key</label>
                                <input type="password" value="sk_test_..." readOnly className="w-full bg-stone-50 border border-stone-200 rounded px-3 py-2 text-sm text-stone-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-stone-400 mb-1">Webhook Secret</label>
                                <input type="password" value="whsec_..." readOnly className="w-full bg-stone-50 border border-stone-200 rounded px-3 py-2 text-sm text-stone-500" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Wompi Config */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-stone-900 dark:text-white">Wompi (Pagos Colombia)</h3>
                            <p className="text-sm text-stone-500">Habilitar cobros en COP con PSE, Bancolombia, Nequi.</p>
                        </div>
                        <button onClick={() => setWompiEnabled(!wompiEnabled)} className={`transition-colors ${wompiEnabled ? 'text-moma-green' : 'text-stone-300'}`}>
                            {wompiEnabled ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10" />}
                        </button>
                    </div>
                    {wompiEnabled && (
                        <div className="space-y-3 animate-fade-in">
                            <div>
                                <label className="block text-xs font-bold uppercase text-stone-400 mb-1">Public Key</label>
                                <input type="text" value="pub_test_..." readOnly className="w-full bg-stone-50 border border-stone-200 rounded px-3 py-2 text-sm text-stone-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-stone-400 mb-1">Integrity Secret</label>
                                <input type="password" value="prod_integrity_..." readOnly className="w-full bg-stone-50 border border-stone-200 rounded px-3 py-2 text-sm text-stone-500" />
                            </div>
                        </div>
                    )}
                </div>

                <div className="pt-4">
                    <button className="w-full bg-moma-earth text-white font-bold py-3 rounded-xl hover:bg-opacity-90 transition-all flex items-center justify-center">
                        <Save className="w-5 h-5 mr-2" /> Guardar Cambios
                    </button>
                </div>

            </div>
        </div>
    );
}
