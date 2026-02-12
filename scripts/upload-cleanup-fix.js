const FtpDeploy = require("ftp-deploy");
const ftpDeploy = new FtpDeploy();

const config = {
    user: "deploy@momaexcursiones.co",
    password: "Cr_Y2h2dY+rzp9C$",
    host: "ftp.momaexcursiones.co",
    port: 21,
    localRoot: __dirname + "/../public/api/gallery",
    remoteRoot: "/public_html/api/gallery/",
    include: ["clear_everything.php"],
    deleteRemote: false,
    forcePasv: true,
    sftp: false,
};

ftpDeploy
    .deploy(config)
    .then((res) => console.log("Uploaded clear_everything.php to gallery/"))
    .catch((err) => console.log("Error:", err));
