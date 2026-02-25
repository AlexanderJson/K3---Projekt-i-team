import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { minify } from 'terser';
import postcss from 'postcss';
import cssnano from 'cssnano';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, 'dist');

// Utility for recursive directory copying
function copyDirSync(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    let entries = fs.readdirSync(src, { withFileTypes: true });

    for (let entry of entries) {
        let srcPath = path.join(src, entry.name);
        let destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDirSync(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

// 1. Rensa mappen dist/ om den finns, annars skapa den
if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

async function build() {
    console.log('Building for production...');

    // 2. Minifiera vår JS från src/ till dist/main.min.js med Terser
    // Vi minifierar 'app.js' till 'dist/main.min.js'
    console.log('Minifying JS to main.min.js...');
    const appJsCode = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
    const appJsMinified = await minify(appJsCode, { module: true, compress: true, mangle: true });
    fs.writeFileSync(path.join(distDir, 'main.min.js'), appJsMinified.code);

    // Vi minifierar även hela 'js/'-mappen eftersom ES-modulerna i main.min.js laddar från './js/...'
    async function minifyJsDir(srcDir, destDir) {
        if (!fs.existsSync(srcDir)) return;
        fs.mkdirSync(destDir, { recursive: true });
        const entries = fs.readdirSync(srcDir, { withFileTypes: true });
        for (let entry of entries) {
            const srcPath = path.join(srcDir, entry.name);
            const destPath = path.join(destDir, entry.name);
            if (entry.isDirectory()) {
                await minifyJsDir(srcPath, destPath);
            } else if (entry.name.endsWith('.js')) {
                const code = fs.readFileSync(srcPath, 'utf8');
                const min = await minify(code, { module: true, compress: true, mangle: true });
                fs.writeFileSync(destPath, min.code);
            } else {
                fs.copyFileSync(srcPath, destPath);
            }
        }
    }
    await minifyJsDir(path.join(__dirname, 'js'), path.join(distDir, 'js'));

    // Minifiera service-worker
    if (fs.existsSync(path.join(__dirname, 'service-worker.js'))) {
        const swCode = fs.readFileSync(path.join(__dirname, 'service-worker.js'), 'utf8');
        const swMinified = await minify(swCode, { compress: true, mangle: true });
        fs.writeFileSync(path.join(distDir, 'service-worker.js'), swMinified.code);
    }

    // 3. Minifiera CSS
    console.log('Minifying CSS to style.min.css...');
    // Hämta alla relevanta CSS-filer som normalt importeras för att bygga style.min.css
    const cssFiles = [
        'css/variables.css',
        'css/main.css',
        'css/dashboard.css',
        'css/tasks.css',
        'css/contacts.css'
    ];
    let combinedCss = '';
    for (const file of cssFiles) {
        if (fs.existsSync(path.join(__dirname, file))) {
            combinedCss += fs.readFileSync(path.join(__dirname, file), 'utf8') + '\n';
        }
    }
    const cssResult = await postcss([cssnano]).process(combinedCss, { from: undefined });
    fs.writeFileSync(path.join(distDir, 'style.min.css'), cssResult.css);

    // 4. Kopiera index.html till dist/ och uppdatera länkarna
    console.log('Processing and copying index.html...');
    let indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

    // Byt ut stylesheet link markup mot enbart den nya style.min.css
    indexHtml = indexHtml.replace(/<link rel="stylesheet".*?>[\s\n]*/g, '');
    indexHtml = indexHtml.replace(/<noscript>[\s\S]*?<\/noscript>[\s\n]*/g, '');
    indexHtml = indexHtml.replace(/<\/head>/, '  <link rel="stylesheet" href="style.min.css" />\n</head>');

    // Ändra referensen till app.js till main.min.js
    indexHtml = indexHtml.replace(/"app\.js"/g, '"main.min.js"');

    // 5. Kopiera vendor
    console.log('Copying src/vendor to dist/vendor...');
    if (fs.existsSync(path.join(__dirname, 'src', 'vendor'))) {
        copyDirSync(path.join(__dirname, 'src', 'vendor'), path.join(distDir, 'vendor'));
    }


    fs.writeFileSync(path.join(distDir, 'index.html'), indexHtml);

    // Kopiera övrigt som kan krävas (ikoner, manifest)
    if (fs.existsSync(path.join(__dirname, 'manifest.webmanifest'))) {
        fs.copyFileSync(path.join(__dirname, 'manifest.webmanifest'), path.join(distDir, 'manifest.webmanifest'));
    }
    if (fs.existsSync(path.join(__dirname, 'icons'))) {
        copyDirSync(path.join(__dirname, 'icons'), path.join(distDir, 'icons'));
    }

    console.log('Build completed successfully!');
}

build().catch(err => {
    console.error('Build failed:', err);
    process.exit(1);
});
