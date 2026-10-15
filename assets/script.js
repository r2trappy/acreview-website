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

function cardMedia(property) {
  if (property.images.length > 0) {
    return `<img src="${IMG_BASE}${property.images[0]}" alt="${property.name}" loading="lazy">
      <span class="photo-count">${property.images.length} Photo${property.images.length > 1 ? 's' : ''}</span>`;
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

function setLightboxImage(index) {
  const property = currentProperty;
  if (!property.images.length) {
    lightboxImg.src = IMG_BASE + 'logo_skyline.png';
    lightboxImg.style.objectFit = 'contain';
    lightboxImg.style.padding = '60px';
    lightboxImg.style.background = '#1B2A4A';
    return;
  }
  currentImgIndex = (index + property.images.length) % property.images.length;
  lightboxImg.style.objectFit = 'cover';
  lightboxImg.style.padding = '0';
  lightboxImg.style.background = 'transparent';
  lightboxImg.src = IMG_BASE + property.images[currentImgIndex];
  lightboxThumbs.querySelectorAll('img').forEach((t, i) => {
    t.classList.toggle('active', i === currentImgIndex);
  });
}

function openLightbox(idx) {
  currentProperty = PROPERTIES[idx];
  lightboxStatus.textContent = currentProperty.statusLabel;
  lightboxStatus.className = 'status-badge ' + currentProperty.statusClass;
  lightboxTitle.textContent = currentProperty.name;
  lightboxLocation.textContent = currentProperty.location;
  lightboxSpec.textContent = currentProperty.spec;
  lightboxPrice.textContent = currentProperty.price;
  lightboxDesc.textContent = currentProperty.desc;
  lightboxWhatsapp.href = `https://wa.me/233557385559?text=${encodeURIComponent("Hi AcreView, I would like more details on " + currentProperty.name + " in " + currentProperty.location + ".")}`;

  lightboxThumbs.innerHTML = '';
  currentProperty.images.forEach((img, i) => {
    const t = document.createElement('img');
    t.src = IMG_BASE + img;
    t.addEventListener('click', () => setLightboxImage(i));
    lightboxThumbs.appendChild(t);
  });

  setLightboxImage(0);
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
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
