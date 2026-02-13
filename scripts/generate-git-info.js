const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
    const commit_format = '%H|%an|%ar|%ad|%s';
    const gitLog = execSync(`git log -1 --format="${commit_format}"`).toString().trim();
    const parts = gitLog.split('|');

    const info = {
        hash: parts[0] || 'N/A',
        author: parts[1] || 'N/A',
        date_relative: parts[2] || 'N/A',
        date_full: parts[3] || 'N/A',
        subject: parts[4] || 'N/A',
        generated_at: new Date().toISOString()
    };

    const dir = path.join(__dirname, '../public/api/admin');
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    const targetPath = path.join(dir, 'git_info.json');
    fs.writeFileSync(targetPath, JSON.stringify(info, null, 2));
    console.log('✅ Git info generated successfully in public/api/admin/git_info.json');
} catch (error) {
    console.warn('⚠️ Could not generate git info (maybe not a git repo or git not in path):', error.message);
    // Create a dummy file so the API doesn't fail
    const dummy = {
        hash: 'Desconocido',
        author: 'System',
        date_relative: 'Desconocido',
        date_full: new Date().toISOString(),
        subject: 'Información de Git no disponible en el build',
        generated_at: new Date().toISOString()
    };
    const targetPath = path.join(__dirname, '../public/api/admin/git_info.json');
    fs.writeFileSync(targetPath, JSON.stringify(dummy, null, 2));
}
