// AcreView Property Group - site interactions
document.getElementById('year').textContent = new Date().getFullYear();

const IMG_BASE = 'assets/images/';

/* ---------- mobile nav ---------- */
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');
navToggle.addEventListener('click', () => {
  mainNav.classList.toggle('open');
});
mainNav.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => mainNav.classList.remove('open'));
});

/* ---------- header shadow on scroll ---------- */
const header = document.getElementById('siteHeader');
window.addEventListener('scroll', () => {
  header.style.boxShadow = window.scrollY > 10 ? '0 6px 20px -14px rgba(27,42,74,0.4)' : 'none';
});

/* ---------- scroll reveal ---------- */
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach(el => io.observe(el));

/* ---------- render property grid ---------- */
const grid = document.getElementById('propertyGrid');

const VID_BASE = 'assets/videos/';
const isVideo = (f) => /\.mp4$/i.test(f);
const srcOf = (f) => (isVideo(f) ? VID_BASE : IMG_BASE) + f;
const posterOf = (f) => VID_BASE + f.replace(/\.mp4$/i, '.jpg');

const cardVideoObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const v = entry.target;
    if (entry.isIntersecting) { v.play().catch(() => {}); } else { v.pause(); }
  });
}, { threshold: 0.5 });

function cardMedia(property) {
  if (property.images.length > 0) {
    const first = property.images[0];
    const pos = property.coverPos || '50% 50%';
    const hasVideo = property.images.some(isVideo);
    const countLabel = hasVideo
      ? `<span class="photo-count video-count"><svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>Video Tour</span>`
      : `<span class="photo-count">${property.images.length} Photo${property.images.length > 1 ? 's' : ''}</span>`;
    const media = isVideo(first)
      ? `<video src="${srcOf(first)}" poster="${posterOf(first)}" muted loop playsinline preload="none" aria-label="${property.name}" style="object-position:${pos}"></video>`
      : `<img src="${srcOf(first)}" alt="${property.name}" loading="lazy" style="object-position:${pos}">`;
    return media + countLabel;
  }
  return `<div class="card-placeholder"><img src="${IMG_BASE}logo_skyline.png" alt=""></div>`;
}

function renderGrid(filter) {
  grid.innerHTML = '';
  PROPERTIES.forEach((property, idx) => {
    if (filter !== 'all' && property.filter !== filter) return;
    const card = document.createElement('div');
    card.className = 'property-card reveal';
    card.innerHTML = `
      <div class="card-media">
        <span class="status-badge ${property.statusClass}">${property.statusLabel}</span>
        ${cardMedia(property)}
      </div>
      <div class="card-body">
        <h3>${property.name}</h3>
        <p class="card-location">${property.location}</p>
        <p class="card-spec">${property.spec}</p>
        <div class="card-footer">
          <span class="card-price">${property.price}</span>
          <span class="card-link">View Details &rarr;</span>
        </div>
      </div>
    `;
    card.addEventListener('click', () => openLightbox(idx));
    grid.appendChild(card);
    card.querySelectorAll('video').forEach(v => cardVideoObserver.observe(v));
    io.observe(card);
    requestAnimationFrame(() => card.classList.add('visible'));
  });
}
renderGrid('all');

/* ---------- filters ---------- */
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderGrid(btn.dataset.filter);
  });
});

/* ---------- lightbox ---------- */
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxTitle = document.getElementById('lightboxTitle');
const lightboxLocation = document.getElementById('lightboxLocation');
const lightboxSpec = document.getElementById('lightboxSpec');
const lightboxPrice = document.getElementById('lightboxPrice');
const lightboxDesc = document.getElementById('lightboxDesc');
const lightboxStatus = document.getElementById('lightboxStatus');
const lightboxThumbs = document.getElementById('lightboxThumbs');
const lightboxWhatsapp = document.getElementById('lightboxWhatsapp');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');

let currentProperty = null;
let currentImgIndex = 0;
let storyTimer = null;
const IMAGE_HOLD_MS = 3500;

const lightboxVideo = document.getElementById('lightboxVideo');
const storyBar = document.getElementById('storyBar');

function clearStoryTimer() {
  if (storyTimer) { clearTimeout(storyTimer); storyTimer = null; }
}

function buildStoryBar() {
  storyBar.innerHTML = '';
  currentProperty.images.forEach((_, i) => {
    const seg = document.createElement('button');
    seg.className = 'story-seg';
    seg.setAttribute('aria-label', 'Go to item ' + (i + 1));
    seg.innerHTML = '<i></i>';
    seg.addEventListener('click', () => setLightboxImage(i));
    storyBar.appendChild(seg);
  });
}

function updateStoryBar(index, progress) {
  const segs = storyBar.querySelectorAll('.story-seg');
  segs.forEach((seg, i) => {
    const fill = seg.firstElementChild;
    if (i < index) fill.style.width = '100%';
    else if (i > index) fill.style.width = '0%';
    else fill.style.width = (progress * 100) + '%';
  });
}

function setLightboxImage(index) {
  const property = currentProperty;
  clearStoryTimer();
  lightboxVideo.pause();
  if (!property.images.length) {
    lightboxVideo.style.display = 'none';
    lightboxImg.style.display = '';
    lightboxImg.src = IMG_BASE + 'logo_skyline.png';
    lightboxImg.style.objectFit = 'contain';
    lightboxImg.style.padding = '60px';
    lightboxImg.style.background = '#1B2A4A';
    storyBar.innerHTML = '';
    return;
  }
  currentImgIndex = (index + property.images.length) % property.images.length;
  const item = property.images[currentImgIndex];
  lightboxImg.style.objectFit = 'cover';
  lightboxImg.style.padding = '0';
  lightboxImg.style.background = 'transparent';
  updateStoryBar(currentImgIndex, 0);

  if (isVideo(item)) {
    lightboxImg.style.display = 'none';
    lightboxVideo.style.display = 'block';
    lightboxVideo.poster = posterOf(item);
    lightboxVideo.src = srcOf(item);
    lightboxVideo.currentTime = 0;
    lightboxVideo.play().catch(() => {});
  } else {
    lightboxVideo.style.display = 'none';
    lightboxImg.style.display = '';
    lightboxImg.src = srcOf(item);
    if (property.images.length > 1) {
      const start = Date.now();
      const tick = () => {
        const p = Math.min((Date.now() - start) / IMAGE_HOLD_MS, 1);
        updateStoryBar(currentImgIndex, p);
        if (p >= 1) { setLightboxImage(currentImgIndex + 1); } else { storyTimer = setTimeout(tick, 60); }
      };
      storyTimer = setTimeout(tick, 60);
    }
  }
  lightboxThumbs.querySelectorAll('img').forEach((t, i) => {
    t.classList.toggle('active', i === currentImgIndex);
  });
}

lightboxVideo.addEventListener('timeupdate', () => {
  if (lightboxVideo.duration) updateStoryBar(currentImgIndex, lightboxVideo.currentTime / lightboxVideo.duration);
});
lightboxVideo.addEventListener('ended', () => {
  if (currentProperty && currentProperty.images.length > 1) setLightboxImage(currentImgIndex + 1);
  else { lightboxVideo.currentTime = 0; lightboxVideo.play().catch(() => {}); }
});
lightboxVideo.addEventListener('click', () => {
  if (lightboxVideo.paused) lightboxVideo.play().catch(() => {}); else lightboxVideo.pause();
});

function openLightbox(idx) {
  currentProperty = PROPERTIES[idx];
  lightboxStatus.textContent = currentProperty.statusLabel;
  lightboxStatus.className = 'status-badge ' + currentProperty.statusClass;
  lightboxTitle.textContent = currentProperty.name;
  lightboxLocation.textContent = currentProperty.location;
  lightboxSpec.textContent = currentProperty.spec;
  lightboxPrice.textContent = currentProperty.price;
  lightboxDesc.textContent = currentProperty.desc;
  const isStay = currentProperty.deal === 'stay';
  lightboxWhatsapp.textContent = isStay ? 'Check Availability' : 'Ask About This Property';
  const waText = isStay
    ? "Hi AcreView, I would like to check availability for " + currentProperty.name + " as a monthly stay."
    : "Hi AcreView, I would like more details on " + currentProperty.name + " in " + currentProperty.location + ".";
  lightboxWhatsapp.href = `https://wa.me/233557385559?text=${encodeURIComponent(waText)}`;

  lightboxThumbs.innerHTML = '';
  currentProperty.images.forEach((item, i) => {
    const t = document.createElement('img');
    t.src = isVideo(item) ? posterOf(item) : srcOf(item);
    t.alt = '';
    t.addEventListener('click', () => setLightboxImage(i));
    lightboxThumbs.appendChild(t);
  });

  buildStoryBar();
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
  setLightboxImage(0);
}

function closeLightbox() {
  clearStoryTimer();
  lightboxVideo.pause();
  lightboxVideo.removeAttribute('src');
  lightboxVideo.load();
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
lightboxPrev.addEventListener('click', () => setLightboxImage(currentImgIndex - 1));
lightboxNext.addEventListener('click', () => setLightboxImage(currentImgIndex + 1));
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') setLightboxImage(currentImgIndex - 1);
  if (e.key === 'ArrowRight') setLightboxImage(currentImgIndex + 1);
});

/* ---------- contact form ---------- */
const contactForm = document.getElementById('contactForm');
contactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = contactForm.name.value;
  const contact = contactForm.contact.value;
  const message = contactForm.message.value;
  const body = `Name: ${name}%0AContact: ${contact}%0A%0A${encodeURIComponent(message)}`;
  window.location.href = `mailto:acreview.gh@gmail.com?subject=${encodeURIComponent('Enquiry from AcreView website')}&body=${body}`;
});
