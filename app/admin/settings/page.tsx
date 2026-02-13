'use client';
import { useState, useEffect } from 'react';
import { Save, ToggleLeft, ToggleRight, Shield, Clock, Activity, GitBranch, RefreshCw, Server } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
    const [stripeEnabled, setStripeEnabled] = useState(true);
    const [wompiEnabled, setWompiEnabled] = useState(true);
    const [systemInfo, setSystemInfo] = useState<any>(null);
    const [isLoadingStatus, setIsLoadingStatus] = useState(false);

    const fetchStatus = async () => {
        setIsLoadingStatus(true);
        try {
            const res = await fetch('/api/admin/system_info.php');
            const data = await res.json();
            if (data.success) {
                setSystemInfo(data);
            }
        } catch (e) {
            console.error('Failed to fetch system info', e);
        } finally {
            setIsLoadingStatus(false);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

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

                {/* Database Governance */}
                <div className="space-y-4 border-t border-stone-100 dark:border-stone-800 pt-8">
                    <h2 className="text-lg font-bold text-stone-900 dark:text-white">Gobernanza de Base de Datos</h2>

                    {/* Diagnostic Tool */}
                    <div className="bg-stone-50 dark:bg-stone-800/50 p-4 rounded-xl space-y-3">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-sm text-stone-700 dark:text-stone-300">Diagnóstico de Conexión y Permisos</h3>
                            <button
                                onClick={async () => {
                                    try {
                                        const res = await fetch('/api/debug_db_permissions.php');
                                        const data = await res.json();
                                        alert(JSON.stringify(data, null, 2));
                                    } catch (e) { alert('Error check: ' + e); }
                                }}
                                className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg text-xs font-bold transition-colors"
                            >
                                Ejecutar Diagnóstico
                            </button>
                        </div>
                    </div>

                    {/* SQL Runner */}
                    <div className="bg-stone-50 dark:bg-stone-800/50 p-4 rounded-xl space-y-3">
                        <h3 className="font-bold text-sm text-stone-700 dark:text-stone-300">Consola SQL (Control Total)</h3>
                        <p className="text-xs text-stone-500">Ejecuta comandos SQL directamente. Úsalo con extrema precaución.</p>
                        <textarea
                            id="sql-input"
                            placeholder="SELECT * FROM experiences..."
                            className="w-full h-24 p-2 text-sm font-mono bg-white border border-stone-200 rounded-lg focus:ring-2 focus:ring-moma-green outline-none"
                        ></textarea>
                        <div className="flex justify-end">
                            <button
                                onClick={async () => {
                                    const sql = (document.getElementById('sql-input') as HTMLTextAreaElement).value;
                                    if (!sql) return;
                                    if (!confirm('¿Ejecutar este SQL?')) return;
                                    try {
                                        const res = await fetch('/api/admin/raw_sql.php', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ sql })
                                        });
                                        const data = await res.json();
                                        console.log('SQL Result:', data);
                                        alert(JSON.stringify(data, null, 2));
                                    } catch (e) { alert('Error Exec: ' + e); }
                                }}
                                className="px-4 py-2 bg-stone-800 text-white hover:bg-stone-900 rounded-lg text-xs font-bold"
                            >
                                Ejecutar Query
                            </button>
                        </div>
                    </div>
                </div>

                {/* Update Monitor */}
                <div className="space-y-6 border-t border-stone-100 dark:border-stone-800 pt-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-stone-900 dark:text-white flex items-center gap-2">
                            <Activity className="w-5 h-5 text-moma-green" />
                            Monitor de Actualización
                        </h2>
                        <button
                            onClick={fetchStatus}
                            disabled={isLoadingStatus}
                            className="p-2 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-full transition-all text-stone-400 hover:text-moma-green disabled:opacity-50"
                        >
                            <RefreshCw className={`w-5 h-5 ${isLoadingStatus ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Git Last Commit Card */}
                        <div className="bg-[#f8fbfa] dark:bg-stone-800/40 p-5 rounded-2xl border border-moma-green/10 space-y-4">
                            <div className="flex items-center gap-3 text-stone-500 text-xs font-bold uppercase tracking-widest">
                                <GitBranch className="w-4 h-4 text-moma-green" />
                                Último Cambio (Git)
                            </div>

                            {systemInfo?.git ? (
                                <div className="space-y-3">
                                    <p className="text-sm font-bold text-stone-800 dark:text-stone-200 leading-tight">
                                        {systemInfo.git.subject}
                                    </p>
                                    <div className="flex flex-wrap gap-3">
                                        <div className="flex items-center gap-1.5 text-xs text-stone-500 bg-white dark:bg-stone-900 px-2 py-1 rounded-lg border border-stone-100 dark:border-stone-800">
                                            <Clock className="w-3 h-3" />
                                            {systemInfo.git.date_relative}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-stone-400 font-mono">
                                            {systemInfo.git.hash.substring(0, 7)}
                                        </div>
                                    </div>
                                    <div className="text-[10px] text-stone-400 mt-2">
                                        Autor: <span className="text-stone-600 dark:text-stone-300 font-medium">{systemInfo.git.author}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="animate-pulse space-y-3">
                                    <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-3/4"></div>
                                    <div className="h-3 bg-stone-100 dark:bg-stone-800 rounded w-1/2"></div>
                                </div>
                            )}
                        </div>

                        {/* Deployment Status Card */}
                        <div className="bg-[#fcfdfd] dark:bg-stone-800/40 p-5 rounded-2xl border border-stone-100 dark:border-stone-800 space-y-4">
                            <div className="flex items-center gap-3 text-stone-500 text-xs font-bold uppercase tracking-widest">
                                <Server className="w-4 h-4 text-stone-400" />
                                Estado del Servidor
                            </div>

                            {systemInfo?.server ? (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-stone-500">Versión PHP</span>
                                        <span className="text-xs font-bold text-stone-700 dark:text-stone-300">{systemInfo.server.php_version}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-stone-500">Última Aplicación</span>
                                        <span className="text-xs font-bold text-moma-green">{systemInfo.server.last_updated.split(' ')[1]}</span>
                                    </div>
                                    <div className="pt-2">
                                        <div className="flex items-center gap-2 text-[10px] text-green-600 font-black uppercase">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                            Sitio Activo y Sincronizado
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="animate-pulse space-y-3">
                                    <div className="h-8 bg-stone-100 dark:bg-stone-800 rounded"></div>
                                    <div className="h-8 bg-stone-100 dark:bg-stone-800 rounded"></div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="space-y-4 border-t border-stone-100 dark:border-stone-800 pt-8">
                    <h2 className="text-lg font-bold text-red-600 dark:text-red-400">Zona de Peligro</h2>
                    <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-2xl p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h3 className="font-bold text-red-900 dark:text-red-200">Resetear Base de Datos</h3>
                                <p className="text-sm text-red-700/70 dark:text-red-400/70">Esta acción eliminará todas las experiencias, fotos de galería y reservas. No se puede deshacer.</p>
                            </div>
                            <button
                                onClick={async () => {
                                    if (confirm('¿ESTÁS ABSOLUTAMENTE SEGURO? Esta acción borrará TODO y dejará el sitio en 0 para producción.')) {
                                        try {
                                            const res = await fetch('/api/master_cleanup.php');
                                            const data = await res.json();
                                            if (data.success) {
                                                console.log('Reset Details:', data.details);
                                                alert('Reseteo completado con éxito.\n' + JSON.stringify(data.details, null, 2));
                                                window.location.reload();
                                            } else {
                                                console.error('Reset Error:', data);
                                                alert('Error: ' + (data.error || 'Unknown error'));
                                            }
                                        } catch (e) {
                                            alert('Error de conexión con el servidor.');
                                        }
                                    }
                                }}
                                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-600/20 active:scale-95 whitespace-nowrap"
                            >
                                Resetear Todo
                            </button>
                        </div>
                    </div>
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
