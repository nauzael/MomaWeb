
import React from 'react';
import Link from 'next/link';

export default function DataDeletion() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-12 space-y-8 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200">
            <h1 className="text-4xl font-black text-moma-green mb-8">Instrucciones de Eliminación de Datos</h1>

            <section>
                <p className="mb-4 text-lg">
                    De acuerdo con las políticas de la Plataforma de Facebook, tienes derecho a solicitar la eliminación de los datos que <strong>Moma Excursiones</strong> haya recopilado a través de la integración con Facebook.
                </p>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-4">¿Qué definimos como tus datos?</h2>
                <p className="mb-4">
                    Nuestra aplicación solo utiliza tu cuenta de Facebook para obtener permisos de publicación en tus Páginas y cuentas de Instagram conectadas. Almacenamos un identificador de usuario y tokens de acceso necesarios para realizar estas publicaciones.
                </p>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-4">Cómo eliminar tus datos</h2>
                <p className="mb-4">
                    Si deseas revocar el acceso y eliminar tus datos de nuestra plataforma, puedes seguir estos pasos:
                </p>

                <div className="bg-stone-50 dark:bg-stone-800 p-6 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-4">
                    <h3 className="font-bold text-lg">Opción 1: Eliminación Automática vía Facebook</h3>
                    <ol className="list-decimal list-inside space-y-2 ml-2">
                        <li>Ingresa a tu cuenta de Facebook y ve a <strong>Configuración y privacidad</strong> &gt; <strong>Configuración</strong>.</li>
                        <li>Busca la sección <strong>Apps y sitios web</strong>.</li>
                        <li>Busca la aplicación <strong>Moma Excursiones</strong>.</li>
                        <li>Haz clic en <strong>Eliminar</strong>.</li>
                    </ol>
                    <p className="text-sm text-stone-500 mt-2">
                        Esto revocarála conexión y Facebook nos notificará para eliminar tus datos asociados automáticamente.
                    </p>
                </div>

                <div className="bg-stone-50 dark:bg-stone-800 p-6 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-4 mt-6">
                    <h3 className="font-bold text-lg">Opción 2: Solicitud Manual</h3>
                    <p>
                        También puedes enviarnos una solicitud directa para eliminar cualquier registro tuyo de nuestra base de datos:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                        <li><strong>Email:</strong> contacto@momaexcursiones.co</li>
                        <li><strong>Asunto:</strong> Solicitud de Baja de Datos de Usuario</li>
                    </ul>
                </div>
            </section>

            <div className="pt-8 border-t border-stone-200 dark:border-stone-700">
                <Link href="/" className="text-moma-green font-bold hover:underline">
                    Volver al inicio
                </Link>
            </div>
        </div>
    );
}
