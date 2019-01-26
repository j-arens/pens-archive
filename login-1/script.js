ubmitButton = document.getElementById('submit');
var background = document.getElementById('background');
var form = document.getElementById('form');

function changeBg() {
  form.className = 'fadeOutUp'
  background.style.background = 'linear-gradient(180deg, antiquewhite, cornflowerblue)';
}
