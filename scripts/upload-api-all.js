const FtpDeploy = require("ftp-deploy");
const ftpDeploy = new FtpDeploy();

const config = {
    user: "deploy@momaexcursiones.co",
    password: "Cr_Y2h2dY+rzp9C$",
    host: "ftp.momaexcursiones.co",
    port: 21,
    localRoot: __dirname + "/../public/api",
    remoteRoot: "/public_html/api/",
    include: ["*", "**/*"], // Include everything in public/api/ including subdirs
    deleteRemote: false,
    forcePasv: true,
    sftp: false,
};

ftpDeploy
    .deploy(config)
    .then((res) => console.log("All API files uploaded"))
    .catch((err) => console.log("Error:", err));
