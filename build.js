/**
 * build.js — Portfolio HTML Assembler
 * ============================================================
 * Menggabungkan semua file di nav/ menjadi satu index.html
 *
 * Cara pakai:
 *   node build.js
 *
 * Workflow:
 *   1. Edit file di nav/ (head.html, header.html, hero.html, dst)
 *   2. Jalankan: node build.js
 *   3. index.html ter-generate otomatis dan siap deploy
 * ============================================================
 */

const fs   = require('fs');
const path = require('path');

// ---- KONFIGURASI: urutan file yang digabung ----
const NAV_DIR = path.join(__dirname, 'nav');
const OUTPUT  = path.join(__dirname, 'index.html');

const PARTS = [
    'head.html',       // <!DOCTYPE>, <head>, opening <body>
    'header.html',     // Desktop Ribbon Nav + Mobile FAB
    'hero.html',       // Section #start (Hero / Cover)
    'projects.html',   // Section #projects (3 Project Cards)
    'terminal.html',   // Section #log (Engineering Philosophy)
    'arsenal.html',    // Section #status (Technical Arsenal / Sticker Bomb)
    'contact.html',    // Section #mail (Contact Form + Footer)
    'modal.html',      // Modal overlay + closing </body></html>
];

// ---- ASSEMBLER ----
console.log('\n🔧  Portfolio Builder — Starting...\n');

const chunks = PARTS.map((file) => {
    const filePath = path.join(NAV_DIR, file);

    if (!fs.existsSync(filePath)) {
        console.error(`  ❌  Missing: nav/${file}`);
        process.exit(1);
    }

    const content = fs.readFileSync(filePath, 'utf8');
    console.log(`  ✅  Read: nav/${file} (${content.length} chars)`);
    return content;
});

// Gabungkan dengan satu baris kosong antar section
const assembled = chunks.join('\n');

// Tulis ke index.html
fs.writeFileSync(OUTPUT, assembled, 'utf8');

const sizeKB = (fs.statSync(OUTPUT).size / 1024).toFixed(1);
console.log(`\n✨  Built: index.html  (${sizeKB} KB)`);
console.log('    → Deploy file ini ke hosting/Vercel.\n');
