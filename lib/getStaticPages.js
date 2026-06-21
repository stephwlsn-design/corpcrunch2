import fs from 'fs';
import path from 'path';

export function getStaticPages() {
    const pagesDir = path.join(process.cwd(), 'pages');

    function walkDir(dir) {
        let results = [];
        const list = fs.readdirSync(dir);

        list.forEach(file => {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);

            if (stat && stat.isDirectory()) {
                results = results.concat(walkDir(fullPath));
            } else {
                results.push(fullPath);
            }
        });

        return results;
    }

    const allFiles = walkDir(pagesDir);

    const excludedBasenames = new Set([
        '404.js',
        '500.js',
        'sitemap.xml.js',
        'robots.txt.js',
    ]);

    const excludedRelativePaths = new Set([
        'intelligent/CylinderSpacer.js',
        'intelligent/RingsSpacer.js',
    ]);

    const validPages = allFiles.filter(file => {
        const relativePath = path.relative(pagesDir, file);
        return (
            !relativePath.startsWith('_') &&
            !relativePath.includes('[') &&
            !relativePath.startsWith('api/') &&
            !relativePath.startsWith('admin/') &&
            /\.(js|jsx|ts|tsx)$/.test(file) &&
            !excludedBasenames.has(path.basename(file)) &&
            !excludedRelativePaths.has(relativePath.replace(/\\/g, '/'))
        );
    });

    return validPages.map(file => {
        const relativePath = path.relative(pagesDir, file);
        const routePath = relativePath
            .replace(/\.(js|jsx|ts|tsx)$/, '')
            .replace(/\\/g, '/') // Windows path fix
            .replace(/\/index$/, '');

        if (!routePath || routePath === 'index') {
            return '/';
        }

        return `/${routePath}`;
    });
}