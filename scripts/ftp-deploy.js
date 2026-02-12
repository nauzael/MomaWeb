const FtpDeploy = require("ftp-deploy");
const ftpDeploy = new FtpDeploy();

const config = {
    user: "deploy@momaexcursiones.co",
    password: "Cr_Y2h2dY+rzp9C$",
    host: "ftp.momaexcursiones.co",
    port: 21,
    localRoot: __dirname + "/../out",
    remoteRoot: "/public_html/", // Ajusta esta ruta según donde esté tu app en cPanel
    include: ["*", "**/*", ".*", "**/.*"],
    exclude: [],
    deleteRemote: false,
    forcePasv: true,
    sftp: false,
};

console.log("🚀 Iniciando carga de archivos por FTP...");

ftpDeploy
    .deploy(config)
    .then((res) => console.log("✅ ¡Despliegue completado con éxito!"))
    .catch((err) => console.log("❌ Error en el despliegue:", err));
