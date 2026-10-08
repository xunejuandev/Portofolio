const archData = {
    ngasem: {
        title: "PADUKUHAN NGASEM / PORTAL ARCHITECTURE",
        body: `
            <p><strong>Architecture Pattern:</strong> Responsive one-page public website (HTML, CSS, vanilla JavaScript) backed by Firebase, with a separate login-protected admin page. No server of its own to maintain.</p>
            <p><strong>Content Flow:</strong> An administrator signs in with Firebase Authentication, then publishes news (title, location, description, photo) and gallery photos. Text is saved in Firestore collections, and photos are uploaded to Cloudinary.</p>
            <p><strong>Public Page:</strong> Reads Firestore and renders the news slider and the gallery. Each news item opens a detail page by its document id.</p>
            <p><strong>Key Design Decision:</strong> Firebase handles data and sign-in, so the village can update its own content without a developer. Cloudinary delivers automatically optimized images, which keeps the pages light.</p>
            <p><strong>Ownership:</strong> Designed and developed end-to-end as the sole developer, from the data model to the responsive interface.</p>
        `
    },
    labsd: {
        title: "LAB SD / BOOKING & MASTER-CLIENT ARCHITECTURE",
        body: `
            <p><strong>Architecture Pattern:</strong> Full-stack web app (Laravel 11 + Livewire 3 on MySQL) with a cybercafe-style master-client layer.</p>
            <p><strong>Booking &amp; Inventory:</strong> Students and faculty reserve individual PCs, workspace clusters, and lab equipment. Administrators track assets in the same system.</p>
            <p><strong>Master-Client Control:</strong> The admin side acts as the master. A custom client script on each lab PC receives commands over Wi-Fi socket control, so administrators can monitor and manage the machines remotely.</p>
            <p><strong>Key Constraint:</strong> The lab had no functional LAN cabling. Wi-Fi replaced the physical network, so no cabling work was needed to reactivate the lab.</p>
        `
    },
    muarajogja: {
        title: "MUARAJOGJA / DATA PIPELINE ARCHITECTURE",
        body: `
            <p><strong>Architecture Pattern:</strong> Scheduled background pipeline feeding a Laravel + Livewire web app.</p>
            <p><strong>Data Flow:</strong> Cron jobs trigger collection from external news sources. Background queue workers process and categorize the items, and the app displays them.</p>
            <p><strong>Why Background Workers:</strong> Collection and processing run outside user requests, so readers never wait for external sources.</p>
            <p><strong>Admin Dashboard:</strong> Lets administrators monitor the system and manage content.</p>
        `
    }
};

let modalTrigger = null;

function inspectModal(id) {
    const modal = document.getElementById('arch-modal');
    if (!archData[id]) return;
    document.getElementById('arch-modal-title').textContent = archData[id].title;
    document.getElementById('arch-modal-body').innerHTML = archData[id].body;
    modalTrigger = document.activeElement;
    // lock the page behind the dialog; keep the layout from shifting when the scrollbar disappears
    const gap = window.innerWidth - document.documentElement.clientWidth;
    if (gap > 0) document.body.style.paddingRight = gap + 'px';
    document.documentElement.classList.add('modal-open');
    modal.style.display = 'flex';
    modal.querySelector('.arch-close-btn').focus();
}

function closeArchModal() {
    document.getElementById('arch-modal').style.display = 'none';
    document.documentElement.classList.remove('modal-open');
    document.body.style.paddingRight = '';
    if (modalTrigger) modalTrigger.focus();
    modalTrigger = null;
}

(function setupModal() {
    const modal = document.getElementById('arch-modal');
    modal.addEventListener('click', (e) => { if (e.target === modal) closeArchModal(); });
    document.addEventListener('keydown', (e) => {
        if (modal.style.display !== 'flex') return;
        if (e.key === 'Escape') { closeArchModal(); return; }
        if (e.key !== 'Tab') return;
        // keep focus inside the dialog
        const items = [...modal.querySelectorAll('button')];
        const first = items[0], last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
})();

// Reader stamps: one per section, earned when the section is the one in view.
// They live in memory only, so a page refresh starts over.
const STAMP_IDS = ['hero', 'projects', 'arsenal'];
const stamps = [];
try { localStorage.removeItem('zine-stamps'); } catch (e) { /* drop the value older versions saved */ }

function renderStamps(newId) {
    document.querySelectorAll('[data-stamp]').forEach((el) => {
        el.classList.toggle('collected', stamps.includes(el.dataset.stamp));
        if (newId && el.dataset.stamp === newId) {
            el.classList.remove('just');
            void el.offsetWidth; // restart the animation
            el.classList.add('just');
        }
    });
    const n = stamps.length;
    document.querySelectorAll('[data-stamp-count]').forEach((el) => { el.textContent = n + '/3' + (el.dataset.suffix || ''); });
    const done = n === STAMP_IDS.length;
    const status = document.querySelector('[data-stamp-status]');
    if (status) {
        status.textContent = done ? 'READING PROGRESS: COMPLETE, THANKS FOR READING ✓' : 'READING PROGRESS: ' + n + '/3';
        status.classList.toggle('complete', done);
    }
    const pill = document.querySelector('[data-reward-pill]');
    if (pill) pill.textContent = done ? '✓ THANKS FOR READING' : '// RESUME';
    document.getElementById('reward-matrix')?.classList.toggle('unlocked', done);
}

function collectStamp(id) {
    if (!STAMP_IDS.includes(id) || stamps.includes(id)) return;
    stamps.push(id);
    renderStamps(id);
}

// Scrollspy: highlight the nav link of the section in view
const navLinks = [...document.querySelectorAll('.main-nav a[href^="#"]:not(.nav-cv)')];
const fabLinks = [...document.querySelectorAll('.fab-menu a[href^="#"]:not(.nav-cv)')];
const spySections = navLinks.map((a) => document.querySelector(a.getAttribute('href')));
let spyCurrent = null;
function updateSpy() {
    const line = document.querySelector('.site-header').offsetHeight + window.innerHeight * 0.25;
    let idx = 0;
    spySections.forEach((s, i) => { if (s && s.getBoundingClientRect().top <= line) idx = i; });
    if (idx === spyCurrent) return;
    spyCurrent = idx;
    if (spySections[idx]) collectStamp(spySections[idx].id);
    [navLinks, fabLinks].forEach((links) => links.forEach((a, i) => {
        a.classList.toggle('active', i === idx);
        if (i === idx) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
    }));
}

// Mobile floating menu
const fab = document.getElementById('mobile-fab');
const fabToggle = document.getElementById('fab-toggle');
const fabMenu = document.getElementById('fab-menu');
function setFab(open) {
    fabMenu.hidden = !open;
    fabToggle.setAttribute('aria-expanded', open);
    fabToggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
}
fabToggle.addEventListener('click', () => setFab(fabMenu.hidden));
fabMenu.addEventListener('click', (e) => { if (e.target.closest('a')) setFab(false); });
document.addEventListener('click', (e) => { if (!fab.contains(e.target)) setFab(false); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setFab(false); });
renderStamps();
window.addEventListener('scroll', updateSpy, { passive: true });
window.addEventListener('resize', updateSpy);
updateSpy();

// Contact form: posts to the /api/contact serverless function (api/contact.js), which emails the owner.
(function setupForm() {
    const form = document.getElementById('transmission-form');
    const btn = document.getElementById('transmit-btn');
    const toast = document.getElementById('form-toast');
    const say = (ok, msg) => {
        toast.textContent = msg;
        toast.classList.remove('hidden');
        toast.classList.toggle('error', !ok);
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const label = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<span>⏳</span> TRANSMITTING...';
        let serverMsg = '';
        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(Object.fromEntries(new FormData(form))),
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok || !json.success) { serverMsg = json.message || ''; throw new Error('rejected'); }
            form.reset();
            say(true, '✓ TRANSMISSION SENT SUCCESSFULLY! Yakobus will get back to you soon.');
        } catch (err) {
            say(false, '✗ TRANSMISSION FAILED. ' + (serverMsg || 'Check your connection') + ' You can also email me directly.');
        } finally {
            btn.disabled = false;
            btn.innerHTML = label;
        }
    });
})();

// Copy the contact email for visitors whose browser has no mail app (mailto does nothing for them)
(function setupCopyEmail() {
    const btn = document.getElementById('copy-email');
    if (!btn) return;
    btn.addEventListener('click', async () => {
        const email = btn.dataset.email;
        try {
            await navigator.clipboard.writeText(email);
        } catch (e) {
            const t = document.createElement('textarea'); // older browsers / blocked clipboard API
            t.value = email; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0';
            document.body.appendChild(t); t.select();
            try { document.execCommand('copy'); } catch (err) { /* user can still select the visible text */ }
            t.remove();
        }
        btn.textContent = 'COPIED ✓'; btn.classList.add('done');
        setTimeout(() => { btn.textContent = 'COPY'; btn.classList.remove('done'); }, 2000);
    });
})();

// Alpine component for the Technical Arsenal board
function arsenal() {
    let timer = null;
    let saved = false;
    try { saved = localStorage.getItem('arsenal-paused') === '1'; } catch (e) { /* storage blocked: stay running */ }
    return {
        filter: 'all',
        info: null,
        paused: saved,
        select(el) {
            clearTimeout(timer);
            this.info = { name: el.dataset.name, desc: el.dataset.desc };
            this.$nextTick(() => placePopup(el));
        },
        // short delay so moving between stickers does not flicker
        leave() {
            clearTimeout(timer);
            timer = setTimeout(() => { this.info = null; }, 150);
        },
        // touch / keyboard activation
        toggle(el) {
            if (this.info && this.info.name === el.dataset.name) this.info = null;
            else this.select(el);
        },
        togglePaused() {
            this.paused = !this.paused;
            try { localStorage.setItem('arsenal-paused', this.paused ? '1' : '0'); } catch (e) { /* ignore */ }
        }
    };
}

// Keep the sticker popup inside the viewport: shift sideways, flip below if there is no room above
function placePopup(sticker) {
    const pop = sticker.querySelector('.sticker-pop');
    if (!pop) return;
    pop.style.setProperty('--shift', '0px');
    pop.classList.remove('below');
    let r = pop.getBoundingClientRect();
    if (r.top < document.querySelector('.site-header').offsetHeight + 8) {
        pop.classList.add('below');
        r = pop.getBoundingClientRect();
    }
    const margin = 8;
    let shift = 0;
    if (r.left < margin) shift = margin - r.left;
    else if (r.right > window.innerWidth - margin) shift = window.innerWidth - margin - r.right;
    pop.style.setProperty('--shift', shift + 'px');
}

// SCAN_ME card: QR code for this page (built the first time it opens) plus the vCard download
(function setupQr() {
    const toggle = document.getElementById('scan-toggle');
    const card = document.getElementById('scan-card');
    const box = document.getElementById('qr-code');
    const urlText = document.getElementById('qr-url');
    let built = false;

    function build() {
        if (built) return;
        if (typeof qrcode === 'undefined') { box.textContent = 'QR code unavailable offline.'; return; }
        const href = location.href.split('#')[0].split('?')[0].replace(/index\.html$/, '');
        const qr = qrcode(0, 'M');
        qr.addData(href);
        qr.make();
        box.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 4, scalable: true });
        const local = ['localhost', '127.0.0.1', ''].includes(location.hostname);
        urlText.textContent = local ? href + ' (local address: it only works on this computer)' : href;
        built = true;
    }

    function setOpen(open) {
        card.hidden = !open;
        toggle.setAttribute('aria-expanded', open);
        if (open) build();
    }

    toggle.addEventListener('click', () => setOpen(card.hidden));
    document.addEventListener('click', (e) => { if (!card.hidden && !card.contains(e.target) && !toggle.contains(e.target)) setOpen(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !card.hidden) { setOpen(false); toggle.focus(); } });
})();
