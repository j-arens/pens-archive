// https://cdnjs.cloudflare.com/ajax/libs/animejs/2.0.0/anime.min.js

anime({
  targets: '.loader',
  scale: [{ value: 0 }, { value: 1, elasticity: 700 }],
  begin() {
    document.querySelector('.loader').classList.add('loader__is--visible');
  }
})

const stars = document.querySelectorAll('.loader__flare-star');
const lines = document.querySelectorAll('.loader__flare-line');
const circles = document.querySelectorAll('.loader__flare-circle');

stars.forEach((star, i) => {
  anime({
    targets: star,
    opacity: 1,
    rotate() {
      if (i % 2) {
        return '1turn';
      }
      
      return '-1turn';
    },
    easing: 'linear',
    duration() {
      return anime.random((i + 1) * 1000, 2000);
    },
    delay() {
      return anime.random((i + 1) * 100, 500);
    },
    loop: true
  });
});

lines.forEach((line, i) => {
  anime({
    targets: line,
    opacity: 1,
    duration() {
      return anime.random((i + 1) * 1000, 2000);
    },
    delay() {
      return anime.random((i + 1) * 100, 500);
    },
    loop: true
  })
})

circles.forEach((circle, i) => {
  anime({
    targets: circle,
    opacity: 1,
    scale: [{ value: 0 }, { value: 1, elasticity: 700 }],
    duration() {
      return anime.random((i + 1) * 1000, 2000);
    },
    delay() {
      return anime.random((i + 1) * 100, 500);
    },
    loop: true
  })
})

anime({
  targets: '.loader__flare-plus',
  opacity: 1,
  rotateX: '1turn',
  duration: 1400,
  delay: 600,
  loop: true
})

anime({
  targets: '.loader__inner-border',
  rotate: '-1turn',
  easing: 'linear',
  duration: 3000,
  loop: true
})

// anime({
//   targets: '.loader__inner-checkmark',
//   d: 'M213.7 186.9L191.6 209.1C191 209.6 190.3 209.9 189.6 209.9 188.9 209.9 188.2 209.6 187.7 209.1L174.9 196.3C173.9 195.3 173.9 193.5 174.9 192.4 176 191.3 177.8 191.3 178.9 192.4L189.6 203.2 209.8 183C210.9 181.9 212.6 181.9 213.7 183 214.8 184.1 214.8 185.8 213.7 186.9L213.7 186.9 213.7 186.9Z',
//   duration: 2000,
//   easing: 'easeInOutExpo'
// })

anime({
  targets: '.loader__inner-checkmark',
  rotateX: '1turn',
  duration: 2000,
  easing: 'linear',
  loop: true
})
