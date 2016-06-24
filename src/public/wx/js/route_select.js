var selected = {
  src: false,
  dest: false,
  route: false
};

var showSrcCity = function() {
  simplePost('/api/route/src/city/list', {
    level: 1
  }, function(ret) {
    $('#city-list').empty();
    for (var idx in ret.cities) {
      var city = ret.cities[idx];
      var entry = $('<div>').addClass('entry fold-entry noicon').data('cid', city.id).click(showSrc);
      var cityName = $('<span>').addClass('entry-main').text(city.name);
      var fold = $('<span>').addClass('fold-addon');
      entry.append(cityName, fold);
      $('#city-list').append(entry);
    }
    if (ret.cities.length === 0) {
      var entry = $('<div>').addClass('entry noicon');
      var prompt = $('<span>').addClass('entry-main').text('暂无可选出发城市');
      entry.append(prompt);
      $('#city-list').append(entry);
    }
    pager.switchTo('page-cities', '选择出发城市');
  });
};

var showSrc = function() {
  var cid = $(this).data('cid');
  simplePost('/api/route/src/city/subLocationList', {
    cityId: cid
  }, function(ret) {
    $('#location-list').empty();
    for (var idx in ret.locations) {
      var location = ret.locations[idx];
      var entry = $('<div>').addClass('entry noicon').data('lid', location.id).click(selectSrc);
      var locationName = $('<span>').addClass('entry-main').text(location.name);
      entry.append(locationName);
      $('#location-list').append(entry);
    }
    if (ret.locations.length === 0) {
      var entry = $('<div>').addClass('entry noicon');
      var prompt = $('<span>').addClass('entry-main').text('暂无可选出发地');
      entry.append(prompt);
      $('#location-list').append(entry);
    }
    pager.switchTo('page-locations', '选择出发地');
  });
};

var selectSrc = function() {
  selected.src = $(this).data('lid');
  $('#src').removeClass('text-3').text($(this).text());
  $('#dest').addClass('text-3').text('点此选择');
  $('#schedule').addClass('text-3').text('请先选择终点');
  selected.dest = false;
  selected.route = false;
  history.go(-2);
};

var showDestCity = function() {
  if (!selected.src) {
    alert('请先选择起点');
    return;
  }
  simplePost('/api/route/dest/city/srcConnected', {
    locationId: selected.src,
    level: 1
  }, function(ret) {
    $('#city-list').empty();
    for (var idx in ret.cities) {
      var city = ret.cities[idx];
      var entry = $('<div>').addClass('entry fold-entry noicon').data('cid', city.id).click(showDest);
      var cityName = $('<span>').addClass('entry-main').text(city.name);
      var fold = $('<span>').addClass('fold-addon');
      entry.append(cityName, fold);
      $('#city-list').append(entry);
    }
    if (ret.cities.length === 0) {
      var entry = $('<div>').addClass('entry noicon');
      var prompt = $('<span>').addClass('entry-main').text('暂无可选目的城市');
      entry.append(prompt);
      $('#city-list').append(entry);
    }
    pager.switchTo('page-cities', '选择目的城市');
  });
};

var showDest = function() {
  var cid = $(this).data('cid');
  simplePost('/api/route/dest/location/srcConnected', {
    locationId: selected.src,
    cityId: cid
  }, function(ret) {
    $('#location-list').empty();
    for (var idx in ret.locations) {
      var location = ret.locations[idx];
      var entry = $('<div>').addClass('entry noicon').data('lid', location.id).click(selectDest);
      var locationName = $('<span>').addClass('entry-main').text(location.name);
      entry.append(locationName);
      $('#location-list').append(entry);
      entry.append(prompt);
      $('#location-list').append(entry);
    }
    if (ret.locations.length === 0) {
      var entry = $('<div>').addClass('entry noicon');
      var prompt = $('<span>').addClass('entry-main').text('暂无可选目的地');
    }
    pager.switchTo('page-locations', '选择目的地');
  });
};

var selectDest = function() {
  selected.dest = $(this).data('lid');
  $('#dest').removeClass('text-3').text($(this).text());
  $('#schedule').addClass('text-3').text('点此选择');
  selected.route = false;
  history.go(-2);
};

var showSchedule = function() {
  if (!selected.dest) {
    alert('请先选择起点和终点');
    return;
  }
  simplePost('/api/route/query/srcAndDest', {
    srcId: selected.src,
    destId: selected.dest
  }, function(ret) {
    $('#schedule-list').empty();
    for (var idx in ret.routes) {
      var route = ret.routes[idx];
      var entry = $('<div>').addClass('entry noicon').data('rid', route.id).click(selectSchedule);
      var departure = $('<span>').addClass('entry-main').text(formattedDateTime(new Date(route.startTime)));
      entry.append(departure);
      $('#schedule-list').append(entry);
    }
    if (ret.routes.length === 0) {
      var entry = $('<div>').addClass('entry noicon');
      var prompt = $('<span>').addClass('entry-main').text('暂无可选班次');
      entry.append(prompt);
      $('#schedule-list').append(entry);
    }
    pager.switchTo('page-schedule', '选择班次');
  });
}

var selectSchedule = function() {
  selected.route = $(this).data('rid');
  $('#schedule').removeClass('text-3').text($(this).text());
  history.back();
}

$(document).ready(function() {
  pager.init('page-main');
  $('#entry-src').click(showSrcCity);
  $('#entry-dest').click(showDestCity);
  $('#entry-schedule').click(showSchedule);
  $('#btn-view').click(function() {
    if (!selected.route) {
      alert('请先选择起点终点和班次');
      return;
    }
    window.location.href = '/wx/route/' + selected.route;
  })
});
