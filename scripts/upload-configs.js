const FtpDeploy = require("ftp-deploy");
const ftpDeploy = new FtpDeploy();

const config = {
    user: "deploy@momaexcursiones.co",
    password: "Cr_Y2h2dY+rzp9C$",
    host: "ftp.momaexcursiones.co",
    port: 21,
    localRoot: __dirname + "/../public",
    remoteRoot: "/public_html/",
    include: [".htaccess", "uploads/.htaccess", "api/.htaccess"],
    deleteRemote: false,
    forcePasv: true,
    sftp: false,
};

console.log("🚀 Subiendo archivos de configuración críticos...");

ftpDeploy
    .deploy(config)
    .then((res) => console.log("✅ Configuración actualizada con éxito!"))
    .catch((err) => console.log("❌ Error:", err));
