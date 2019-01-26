var polyWrap = document.querySelector('.polygon-wrap');
var nodecount = 0;
var nodecss = 'clip-path: polygon( ';

document.body.addEventListener('click', function(e){
  
  var mouseX = e.clientX;
  var mouseY = e.clientY;
  
  var shapeOffsetX = polyWrap.getBoundingClientRect().left;
  var shapeOffsetY = polyWrap.getBoundingClientRect().top;
  
  var shapeWidth = polyWrap.getBoundingClientRect().width;
  var shapeHeight = polyWrap.getBoundingClientRect().height;
  
  var shapeMouseX = mouseX - shapeOffsetX;
  var shapeMouseY = mouseY - shapeOffsetY;
  
  var mousePercentX = shapeMouseX / shapeWidth;
  var mousePercentY = shapeMouseY / shapeHeight;
  
  var finalMouseX = Math.round(mousePercentX * 100);
  var finalMouseY = Math.round(mousePercentY * 100);
  
  var normalisedX = parseFloat(finalMouseX).toString();
  var normalisedY = parseFloat(finalMouseY).toString();
  
  nodecount += 1;
  
  if (nodecount < 3) {
    nodecss = nodecss + normalisedX + '% ' + normalisedY + '% ,';
  }else if (nodecount === 3) {
    nodecss = nodecss + normalisedX + '% ' + normalisedY + '% );';
    console.log(nodecss);
  }
})
