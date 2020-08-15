const ADVANCE_INTERVAL_MS = 500;

var map;
var x = 40.68444;
var y = -73.93857;
var gpxFile = null;
var points = [];
var pointer = 0;
var interval = null;

function GetMap() {
  map = new Microsoft.Maps.Map(document.getElementById('map'), {
    zoom: 18,
    heading: 90,
    pitch: 0,
    streetsideOptions: {
      overviewMapMode: Microsoft.Maps.OverviewMapMode.expanded,
      showCurrentAddress: false
    },
    mapTypeId: Microsoft.Maps.MapTypeId.streetside,
    center: new Microsoft.Maps.Location(x, y)
  });

  return map;
 }

function advance() {
  point = points[pointer];

  // set camera in direction of next point
  heading = bearing(point, points[pointer + 1])

  $('#status').text(`${point.mile.toFixed(2)} mi; point ${pointer} of ${points.length}`);
  // $('#pointer').val(pointer);

  changePanorama(point.lat, point.lon, heading);

  pointer += 1;
}

function autoAdvance() {
  interval = setInterval(advance, ADVANCE_INTERVAL_MS);
}

function stopAutoAdvance() {
  clearInterval(interval);
}

function changePanorama(x, y, heading) {
  map.setView({ center: new Microsoft.Maps.Location(x, y), heading: heading, pitch: 0 });
}

const bearing = (pointA, pointB) => {
  return Math.atan2(pointB.lon - pointA.lon, pointB.lat - pointA.lat) * 180 / Math.PI;
}

const getPoints = (gpxFile) => {
  const gpx = gpxFile.children[0];
  const trk = gpx.children[1];
  const trkseg = trk.children[1];
  const segments = [].slice.call(trkseg.children);

  const points = segments.map((s) => {
    return {
      'lat': parseFloat(s.attributes["lat"].value),
      'lon': parseFloat(s.attributes["lon"].value)
    }
  })

  return points;
}

function fileHandler() {
  const fileSelector = document.getElementById('gpx');

  fileSelector.addEventListener('change', (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function() {
      const loadedFile = reader.result;
      const domparser = new DOMParser();
      gpxFile = domparser.parseFromString(loadedFile, "application/xml");

      points = getPoints(gpxFile);
      points = addMileMarkers(points);

      addRouteLine(points, map);
    };

    reader.readAsText(file);
  });
}

function addRouteLine(points, map) {
  const coords = points.map((p) => new Microsoft.Maps.Location(p.lat, p.lon));
  var line = new Microsoft.Maps.Polyline(coords, {
    strokeColor: 'red',
    strokeThickness: 3
  });

  map.entities.push(line);
}

function pointerHandler(){
  $('#pointer').change((e) => {
    pointer = parseInt(e.target.value)
  })
}

function addMileMarkers(points) {
  var lastMile = 0;
  var lastPoint = points[0];

  return points.map((p) => {
    const diff = distance(lastPoint, p);
    p.mile = lastMile + diff;
    lastMile = p.mile;
    lastPoint = p;
    return p;
  });
}

/**
 * Calculates the haversine distance between point A, and B.
 * @param {number[]} latlngA [lat, lng] point A
 * @param {number[]} latlngB [lat, lng] point B
 * @param {boolean} isMiles If we are using miles, else km.
 * https://stackoverflow.com/a/48805273
 */
const distance = (pointA, pointB) => {
  let lat1 = pointA.lat;
  let lat2 = pointB.lat;
  let lon1 = pointA.lon;
  let lon2 = pointB.lon;
  const isMiles = true;

  const toRadian = angle => (Math.PI / 180) * angle;
  const distance = (a, b) => (Math.PI / 180) * (a - b);
  const RADIUS_OF_EARTH_IN_KM = 6371;

  const dLat = distance(lat2, lat1);
  const dLon = distance(lon2, lon1);

  lat1 = toRadian(lat1);
  lat2 = toRadian(lat2);

  // Haversine Formula
  const a =
    Math.pow(Math.sin(dLat / 2), 2) +
    Math.pow(Math.sin(dLon / 2), 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.asin(Math.sqrt(a));

  let finalDistance = RADIUS_OF_EARTH_IN_KM * c;

  if (isMiles) {
    finalDistance /= 1.60934;
  }

  return finalDistance;
};

function main() {
  fileHandler();
  pointerHandler();
}

main();