# //cdnjs.cloudflare.com/ajax/libs/jquery/2.2.2/jquery.min.js
# https://cdnjs.cloudflare.com/ajax/libs/flot/0.8.3/jquery.flot.min.js
# https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.11.1/moment.min.js
# https://codepen.io/j-arens/pen/eZPmbV

var clockComponent = {
  time: new Date(),
  hourHand: $('.hour'),
  minuteHand: $('.minute'),
  secondHand: $('.second'),
  dateEl: $('.date-section'),
  getYear: function() {
    return this.time.getFullYear();
  },
  getMonth: function() {
    var monthIndex = this.time.getMonth();
    
    var months = [
      'janurary',
      'feburary',
      'march',
      'april',
      'may',
      'june',
      'july',
      'august',
      'september',
      'october',
      'november',
      'december'
    ];
    
    return months[monthIndex];
  },
  getDayNum: function() {
    return this.time.getDate();
  },
  getWeekday: function() {
    var dayIndex = this.time.getDay();
    
    var weekdays = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday'
    ];
    
    return weekdays[dayIndex];
  },
  startClock: function() {
    var time = new Date();
    
    var h = time.getHours() > 12 ? time.getHours() - 12 : time.getHours();
    var m = time.getMinutes();
    var s = time.getSeconds();
    
    var run = setTimeout(clockComponent.startClock, 1000);
    
    clockComponent.setClock(h, m, s);
  },
  setClock: function(h, m, s) {    
    var hdeg = h * (180/12);
    var mdeg = (m/60) * 360 - 180;
    var sdeg = (s/60) * 360 - 180;
    
    this.hourHand.css('transform', 'rotate(' + hdeg + 'deg)');
    this.minuteHand.css('transform', 'rotate(' + mdeg + 'deg)');
    this.secondHand.css('transform', 'rotate(' + sdeg + 'deg)');
  },
  setDate: function() {
    
    var data = [
      '<span class="numeric-date">',
      this.getDayNum(),
      '</span>',
      '<span class="month">',
      this.getMonth(),
      '</span>',
      '<span class="day-year">',
      this.getWeekday(),
      ' | ',
      this.getYear(),
      '</span>'
    ].join(' ');

    this.dateEl.html(data);
  }
}

var weatherComponent = {
  zipCode: '49509',
  tempHi: $('.temp-hi'),
  tempLo: $('.temp-lo'),
  weatherIcon: $('.weather-icon'),
  forecast: $('.forecast'),
  location: $('.location'),
  getWeather: function() {
    var set = this;
    
    var apiKey = '8b7c3fb22524db81bc9c95aee4ad3934'
    var query = '?zip=' + this.zipCode + ',' + 'us';
    var url = 'http://api.openweathermap.org/data/2.5/weather';
    url += query + '&appid=' + apiKey;
    
    $.getJSON(url, function(data) {
      
      var result = [
        data.name,
        Math.round(data.main.temp_max * (9/5) - 459.67),
        Math.round(data.main.temp_min * (9/5) - 459.67),
        data.weather[0].description,
        data.weather[0].id
      ]
      
      set.tempHi.html(result[1] + '&deg;');
      set.tempLo.html(result[2] + '&deg;');
      set.weatherIcon.html('<i class="wi wi-owm-' + result[4] + '"></i>');
      set.forecast.html('<span>' + result[3] + '</span>');
      set.location.html('<span>' + result[0] + ', MI ' + set.zipCode + '</span>');
    });
  }
}

var deliveryComponent = {
  title: $('.component-delivery .title span'),
  list: $('.delivery-list'),
  setDay: function() {
    var day = clockComponent.getWeekday();

    this.title.text(day + ' ' + 'deliveries');
  },
  handler: function(e) {
    //click handler for delivery list on dashboard
    var tag = e.target.tagName;

    //button clicks
    if (tag != 'LI') {
      if (tag === 'UL' || tag === 'DIV') {
        return
      } else if (tag === 'BUTTON' || tag === 'I') {
        var buttonType = $(e.target).parents('button')[0].className;
        var delivery = $(e.target).parents('.delivery');

        if (buttonType === 'check' || buttonType === 'trash') {
          delivery.remove();
        }
      } else {
        console.log(e.target.parentNode);
      }
    } else {
      console.log(e.target);
    }

    //check if no deliveries
    if ($('.delivery-list ul').has('li').length === 0) {
      this.list.html('<span class="empty">No deliveries</span>');
    }
  }
};

//GRAPH COMPONENT
//used details/month
var dataOne = [
  [0, 3],
  [1, 4],
  [2, 2],
  [3, 2],
  [4, 3],
  [5, 2],
  [6, 4],
  [7, 3],
  [8, 2],
  [9, 3],
  [10, 2],
  [11, 3],
  [12, 2],
  [13, 2],
  [14, 3],
  [15, 3],
  [16, 2],
  [17, 2],
  [18, 1],
  [19, 2],
  [20, 3],
  [21, 2]
];

//car deliveries
var dataTwo = [
  [0, 3],
  [1, 2],
  [2, 6],
  [3, 4],
  [4, 7],
  [5, 4],
  [6, 9],
  [7, 3],
  [8, 2],
  [9, 5],
  [10, 5],
  [11, 6],
  [12, 3],
  [13, 8],
  [14, 5],
  [15, 4],
  [16, 8],
  [17, 5],
  [18, 3],
  [19, 6],
  [20, 2],
  [21, 5]
]

// function getDay(day) {
//   return new Date()
// }

var dataSet = [{
  label: 'Used Details',
  data: dataOne,
  color: 'red'
}, {
  label: 'Car Deliveries',
  data: dataTwo,
  color: 'green'
}];

var options = {
  series: {
    lines: {
      show: true,
      fill: true,
      fillColor: 'rgba(0,0,200, 0.3)'
    },
    points: {
      show: true
    }
  },
  xaxis: {
    tickDecimals: 0,
    font: {
      family: 'roboto',
      size: 16
    },
    color: 'black',
    tickColor: 'lightgrey',
  },
  yaxis: {
    tickDecimals: 0,
    font: {
      family: 'roboto',
      size: 16
    },
    color: 'black',
    tickColor: 'lightgrey'
  }
};

$(document).ready(function() {
  
  $('#calendar').fullCalendar({
    header: {
      left: 'prev',
      center: 'title',
      right: 'next'
    },
    height: 400,
    fixedWeekCount: false,
  });
  
  //change icons in prev and next button
  $('.fc-prev-button').html('<i class="ms-Icon ms-Icon--chevronLeft"></i>');
  $('.fc-next-button').html('<i class="ms-Icon ms-Icon--chevronRight"></i>')
  $('.fc-widget-header .fc-sun').html('S');
  
  var numTd = $('.fc-body td');

  // for (i = 0; i < numTd.length; i++) {
  //   var dayNum = numTd[i].text();
  //   numTd[i].html('<span>' + dayNum + '</span>');
  // }
});


// var plot = $.plot($('.graph'), dataSet, options);

// deliveryComponent.list.click(function(e) {
//   deliveryComponent.handler(e);
// });
// deliveryComponent.setDay();
// clockComponent.setDate();
// clockComponent.startClock();
// weatherComponent.getWeather();
