document.addEventListener('DOMContentLoaded', function() {
  var fields = document.querySelectorAll('fieldset');
  var nav = document.querySelector('nav');
  var buttons = document.querySelectorAll('button');
  var regex = /[-+]?[0-9]+/g;
  var submit = document.querySelector('input[type="submit"]');

  (function initLayout() {
    for (i = 0; i < fields.length; i++) {
      var pos = (i * 100) + '%';
      fields[i].style.transform = 'translateX(' + pos + ')';
    }
    buttons[0].style.display = 'none';
  })();

  nav.addEventListener('click', function(e) {
    var tag = e.target.tagName;
    var btnType;

    if (tag === 'NAV') {
      return;
    } else if (tag === 'BUTTON') {
      btnType = e.target.id;
    } else {
      btnType = e.target.parentNode.id;
    }

    if (btnType === 'prev') {
      for (i = 0; i < fields.length; i++) {
        var curPos = parseInt(fields[i].style.transform.match(regex));
        var newPos = (curPos + 100) + '%';
        fields[i].style.transform = 'translateX(' + newPos + ')';
      }
    } else if (btnType === 'next') {
      for (i = 0; i < fields.length; i++) {
        var curPos = parseInt(fields[i].style.transform.match(regex));
        var newPos = (curPos - 100) + '%';
        fields[i].style.transform = 'translateX(' + newPos + ')';
      }
    }

    if (parseInt(fields[0].style.transform.match(regex)) === 0) {
      buttons[0].style.display = 'none';
    } else {
      buttons[0].style.display = 'inline-block';
    }

    if (parseInt(fields[5].style.transform.match(regex)) === 0) {
      buttons[1].style.display = 'none';
      submit.style.visibility = 'visible';
    } else {
      buttons[1].style.display = 'inline-block';
      submit.style.visibility = 'hidden';
    }

  });

});
