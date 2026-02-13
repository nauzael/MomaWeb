const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
    const commit_format = '%H|%an|%ar|%ad|%s';
    let gitLog = 'N/A';
    try {
        gitLog = execSync(`git log -1 --format="${commit_format}"`).toString().trim();
    } catch (e) { }

    const parts = gitLog.split('|');

    const now = new Date();
    const build_time = now.toLocaleString('es-CO', {
        timeZone: 'America/Bogota',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    const info = {
        hash: parts[0] || 'Desconocido',
        author: parts[1] || 'Usuario Local',
        date_relative: parts[2] || 'Recién generado',
        date_full: parts[3] || build_time,
        subject: parts[4] || 'Cambios sin commit local',
        build_time: build_time,
        timestamp: now.getTime()
    };

    const dir = path.join(__dirname, '../public/api/admin');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const targetPath = path.join(dir, 'git_info.json');
    fs.writeFileSync(targetPath, JSON.stringify(info, null, 2));
    console.log(`✅ Info de Build generada: ${build_time}`);
} catch (error) {
    console.warn('⚠️ Warning al generar info:', error.message);
}
