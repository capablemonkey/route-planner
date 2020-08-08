var map;
var x = 40.68444;
var y = -73.93857;
var gpxFile = null;
var points = [];
var pointer = 0;

function GetMap() {
  map = new Microsoft.Maps.Map(document.getElementById('myMap'), {
    zoom: 18,
    heading: 90,
    pitch: 0,
    streetsideOptions: {
      overviewMapMode: Microsoft.Maps.OverviewMapMode.hidden,
      showCurrentAddress: false
    },
    mapTypeId: Microsoft.Maps.MapTypeId.streetside,
    center: new Microsoft.Maps.Location(x, y)
  });

  return map;
 }

function advance() {
  point = points[pointer];
  pointer += 1;

  $('#status').text(`point ${pointer} of ${points.length}`);

  heading = 90;
  changePanorama(point.lat, point.lon, heading);
}

function changePanorama(x, y, heading) {
  map.setView({ center: new Microsoft.Maps.Location(x, y), heading: heading, pitch: 0 });
}

const getPoints = (gpxFile) => {
  const gpx = gpxFile.children[0];
  const trk = gpx.children[1];
  const trkseg = trk.children[1];
  const segments = [].slice.call(trkseg.children);

  const points = segments.map((s) => {
    return {
      'lat': s.attributes["lat"].value,
      'lon': s.attributes["lon"].value
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
    };

    reader.readAsText(file);
  });
}

function main() {
  fileHandler();


}

main();