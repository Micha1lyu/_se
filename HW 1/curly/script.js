// ===========================
// CURLY — Website JavaScript
// ===========================

// ---- Navbar scroll effect ----
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

// ---- Typewriter animation ----
const command = 'python curly.py https://httpbin.org/get';
const typedCmd = document.getElementById('typed-cmd');
const cursor = document.getElementById('t-cursor');
const output = document.getElementById('terminal-output');

let charIndex = 0;

function typeNext() {
  if (charIndex < command.length) {
    typedCmd.textContent += command[charIndex++];
    setTimeout(typeNext, 45 + Math.random() * 35);
  } else {
    // Done typing — hide cursor, show output
    setTimeout(() => {
      cursor.style.display = 'none';
      output.style.display = 'block';
      output.style.opacity = '0';
      output.style.transition = 'opacity 0.5s ease';
      requestAnimationFrame(() => {
        output.style.opacity = '1';
      });
    }, 400);
  }
}

// Start typing after page loads
window.addEventListener('load', () => {
  setTimeout(typeNext, 800);
});

// ---- Copy buttons ----
document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const targetId = btn.dataset.target;
    const pre = document.getElementById(targetId);
    if (!pre) return;

    const text = pre.innerText || pre.textContent;
    navigator.clipboard.writeText(text).then(() => {
      btn.textContent = 'Copied!';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.textContent = 'Copy';
        btn.classList.remove('copied');
      }, 2000);
    }).catch(() => {
      // Fallback for older browsers
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      btn.textContent = 'Copied!';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.textContent = 'Copy';
        btn.classList.remove('copied');
      }, 2000);
    });
  });
});

// ---- Scroll reveal ----
const revealEls = document.querySelectorAll(
  '.feature-card, .example-card, .step, .section-header, .flags-table'
);

revealEls.forEach(el => el.classList.add('reveal'));

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger siblings
      const siblings = [...entry.target.parentElement.querySelectorAll('.reveal')];
      const idx = siblings.indexOf(entry.target);
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, idx * 80);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

revealEls.forEach(el => observer.observe(el));

// ---- Smooth anchor scroll ----
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ---- Feature card glow on hover ----
document.querySelectorAll('.feature-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty('--mx', `${x}%`);
    card.style.setProperty('--my', `${y}%`);
  });
});
