const nav = document.querySelector('.dpi-mobileNav__wrapper');
const toggle = nav.querySelector('.dpi-mobileNav__toggle');

toggle.addEventListener('click', () => nav.classList.toggle('dpi-mobileNav__active'));
