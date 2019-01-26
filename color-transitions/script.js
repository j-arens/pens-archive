var bgs = document.querySelectorAll('.background');
var btns = document.querySelector('.buttons-container');

var hiddenPos = '-100%';
var visiblePos = '0';
var absPos = 'left';
var transform = 'rotate(360deg)';

btns.addEventListener('click', function(e) {
  var clickedColor = null;
  
  if (e.target.tagName === 'BUTTON') {
    clickedColor = e.target.childNodes[1].textContent;
  } else {
    clickedColor = e.target.firstChild.textContent;
  }
  
  for(var i = 0; i < bgs.length; i++) {
    bgs[i].style[absPos] = hiddenPos;
    // bgs[i].style.transform = '';
    
    if (bgs[i].classList[1] === clickedColor.toLowerCase()) {
      bgs[i].style[absPos] = visiblePos;
      // bgs[i].style.transform = transform;
    }
  }
  
});

for (var i = 1; i < bgs.length; i++) {
  bgs[i].style[absPos] = hiddenPos;
}
bgs[0].style[absPos] = visiblePos;
