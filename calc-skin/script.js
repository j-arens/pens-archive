alc = document.getElementById('buttons');
var screen = document.getElementById('screen');

calc.addEventListener('click', function(e){
  //get value of clicked button
  equation = (e.target.textContent);
  e.stopPropagation();
  
  //strip spaces from nodetext
  var strip = function(str) {
    return str.replace(/\s/g, '');
  }
  
  //append to screen
  var text = document.createTextNode(strip(equation));
  screen.appendChild(text);
});


