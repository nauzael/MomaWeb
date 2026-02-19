
import React from 'react';

export default function PrivacyPolicy() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-12 space-y-8 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200">
            <h1 className="text-4xl font-black text-moma-green mb-8">Política de Privacidad</h1>

            <section>
                <p className="mb-4">
                    En <strong>Moma Excursiones</strong>, accesible desde https://www.momaexcursiones.co, una de nuestras principales prioridades es la privacidad de nuestros visitantes. Este documento de Política de Privacidad contiene tipos de información que son recopilados y registrados por Moma Excursiones y cómo los usamos.
                </p>
                <p className="mb-4">
                    Si tienes preguntas adicionales o requieres más información sobre nuestra Política de Privacidad, no dudes en contactarnos.
                </p>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-4">Información que recopilamos</h2>
                <p className="mb-4">
                    Recopilamos información personal que tú nos proporcionas voluntariamente cuando te registras en el sitio web, expresas interés en obtener información sobre nosotros o nuestros productos y servicios, cuando participas en actividades en el sitio web o cuando nos contactas.
                </p>
                <p className="mb-4">
                    La información personal que recopilamos puede incluir lo siguiente: Nombre, Dirección de correo electrónico, Número de teléfono, y otros datos similares.
                </p>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-4">Cómo usamos tu información</h2>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Proveer, operar y mantener nuestro sitio web.</li>
                    <li>Mejorar, personalizar y expandir nuestro sitio web.</li>
                    <li>Entender y analizar cómo usas nuestro sitio web.</li>
                    <li>Desarrollar nuevos productos, servicios, características y funcionalidades.</li>
                    <li>Comunicarnos contigo, ya sea directamente o a través de uno de nuestros socios, incluyendo para servicio al cliente, para proporcionarte actualizaciones y otra información relacionada con el sitio web, y para fines de marketing y promoción.</li>
                    <li>Enviarte correos electrónicos.</li>
                    <li>Encontrar y prevenir fraudes.</li>
                </ul>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-4">Datos de Log</h2>
                <p className="mb-4">
                    Moma Excursiones sigue un procedimiento estándar de uso de archivos de registro. Estos archivos registran a los visitantes cuando visitan sitios web. La información recopilada por archivos de registro incluye direcciones de protocolo de internet (IP), tipo de navegador, Proveedor de Servicios de Internet (ISP), fecha y hora, páginas de referencia/salida y posiblemente el número de clics.
                </p>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-4">Cookies y Web Beacons</h2>
                <p className="mb-4">
                    Como cualquier otro sitio web, Moma Excursiones utiliza 'cookies'. Estas cookies se utilizan para almacenar información, incluidas las preferencias de los visitantes y las páginas del sitio web a las que el visitante accedió o visitó. La información se utiliza para optimizar la experiencia de los usuarios personalizando el contenido de nuestra página web según el tipo de navegador de los visitantes y/u otra información.
                </p>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-4">Datos de Facebook</h2>
                <p className="mb-4">
                    Nuestra aplicación utiliza la API de Facebook para permitir la publicación automática de contenido en tus páginas de Facebook e Instagram vinculadas. Solo solicitamos los permisos estrictamente necesarios para realizar estas acciones (`pages_manage_posts`, `pages_read_engagement`, `instagram_basic`, `instagram_content_publish`).
                </p>
                <p className="mb-4">
                    No almacenamos tus datos de inicio de sesión de Facebook. Solo guardamos tokens de acceso seguros para facilitar la conexión con la API, los cuales puedes revocar en cualquier momento desde la configuración de tu cuenta de Facebook.
                </p>
                <p className="mb-4">
                    Si deseas eliminar tus datos de nuestra plataforma, puedes contactarnos a través de los medios dispuestos en nuestra web o utilizar la herramienta de eliminación de datos de Facebook.
                </p>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-4">Contáctanos</h2>
                <p>
                    Si tienes alguna pregunta sobre esta Política de Privacidad, puedes contactarnos:
                </p>
                <ul className="list-disc ml-6 mt-2">
                    <li>Por correo electrónico: contacto@momaexcursiones.co</li>
                    <li>Visitando esta página en nuestro sitio web: https://www.momaexcursiones.co/contacto</li>
                </ul>
            </section>
        </div>
    );
}
