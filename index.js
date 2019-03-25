'use strict';

var coordsArray = [
  {
    id: 0,
    text: {
      yaw: -0.5877760286507387,
      pitch: 0.08333776124826864,
    },
    number: {
      yaw: -0.5918354586416724,
      pitch: 0.2112339346558647,
    },
  },
  {
    id: 1,
    text: { yaw: -0.6086027813351276, pitch: 0.1413926915131576 },
    number: { yaw: -0.6108182376195028, pitch: 0.271448338865941 },
  },
  {
    id: 2,
    text: {
      yaw: -0.5787760286507387,
      pitch: 0.08333776124826864,
    },
    number: {
      yaw: -0.5868354586416724,
      pitch: 0.2112339346558647,
    },
  },
  {
    id: 3,
    text: {
      yaw: -0.5427760286507387,
      pitch: 0.08333776124826864,
    },
    number: {
      yaw: -0.5448354586416724,
      pitch: 0.23523393465586473,
    },
    radius: 1290,
  },
  {
    id: 4,
    text: {
      yaw: -0.5867760286507387,
      pitch: 0.13633776124826869,
    },
    number: {
      yaw: -0.5908354586416724,
      pitch: 0.26323393465586475,
    },
  },
  {
    id: 5,
    text: {
      yaw: -0.6197760286507388,
      pitch: 0.07533776124826863,
    },
    number: {
      yaw: -0.6258354586416724,
      pitch: 0.2052339346558647,
    },
  },
];

var VIDEO_FORMATS = [
  {
    ext: 'mp4',
    type: 'video/mp4',
  },
  {
    ext: 'webm',
    type: 'video/webm',
  },
  {
    ext: 'ogg',
    type: 'video/ogv',
  },
];

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

var currentVideo = getRandomInt(6);
var currentCoords = coordsArray.find(function(element) {
  return element.id === currentVideo;
});

// Create viewer.
// Video requires WebGL support.
var viewerOpts = { stageType: 'webgl' };
var viewer = new Marzipano.Viewer(document.getElementById('pano'), viewerOpts);

// Create asset and source.
var asset = new VideoAsset();
var source = new Marzipano.SingleAssetSource(asset);

// Create geometry.
// This is a trivial equirectangular geometry with a single level.
// The level size need not match the actual video dimensions because it is
// only used to determine the most appropriate level to render, and no such
// choice has to be made in this case.
var geometry = new Marzipano.EquirectGeometry([{ width: 1 }]);

// Create view.
// We display the video at a fixed vertical fov.
var limiter = Marzipano.RectilinearView.limit.vfov((90 * Math.PI) / 180, (90 * Math.PI) / 180);
var view = new Marzipano.RectilinearView({ fov: Math.PI / 2 }, limiter);

// Create scene.
var scene = viewer.createScene({
  source: source,
  geometry: geometry,
  view: view,
});

// Get the stage.
var stage = viewer.stage();

// Get parameters from url
var urlParams = new URLSearchParams(window.location.search);
var lastName = urlParams.get('lastName');
var number = urlParams.get('number');

// Add hotspot.
var lastNameElement = document.createElement('h2');
lastNameElement.innerHTML = lastName || 'Болельщик';
lastNameElement.className = 'text-hotspot';

var numberElement = document.createElement('h2');
numberElement.innerHTML = number || '99';
numberElement.className = 'text-hotspot number';

var lastNameHotspot = scene
  .hotspotContainer()
  .createHotspot(lastNameElement, currentCoords.text, { perspective: { radius: currentCoords.radius || 1500 } });

var numberHotspot = scene
  .hotspotContainer()
  .createHotspot(numberElement, currentCoords.number, { perspective: { radius: currentCoords.radius || 1500 } });

// Display scene.
scene.switchTo();

// Start playback on click.
// Playback cannot start automatically because most browsers require the play()
// method on the video element to be called in the context of a user action.
// Whether playback has started.

// Add video element
var video = document.createElement('video');
VIDEO_FORMATS.forEach((function(item){
  var source = document.createElement('source');
  source.src = `video_${currentVideo}.${item.ext}`;
  source.type = item.type;
  video.appendChild(source);
}));
video.crossOrigin = 'anonymous';
video.loop = false;

// Prevent the video from going full screen on iOS.
video.playsInline = true;
video.webkitPlaysInline = true;

var loader = document.querySelector('#loader');

waitForReadyState(video, video.HAVE_METADATA, 100, function() {
  waitForReadyState(video, video.HAVE_ENOUGH_DATA, 100, function() {
    asset.setVideo(video);
    loader.style.display = 'none';
  });
});

// Start playback.
var started = false;
function startVideo() {
  if (started) return;
  video.play();
  started = true;
}

// Wait for an element to reach the given readyState by polling.
// The HTML5 video element exposes a `readystatechange` event that could be
// listened for instead, but it seems to be unreliable on some browsers.
function waitForReadyState(element, readyState, interval, done) {
  var timer = setInterval(function() {
    if (element.readyState >= readyState) {
      clearInterval(timer);
      done(null, true);
    }
  }, interval);
}

// document.addEventListener('keypress', function(event) {
//   if (event.key === '+') {
//     console.log('+');
//     console.log(radius);
//     radius++;
//     hotspot2.setPerspective({ radius: radius });
//   }
//   if (event.key === '-') {
//     console.log('-');
//     console.log(radius);
//     radius--;
//     hotspot2.setPerspective({ radius: radius });
//   }
// });

var dragHotspot = lastNameHotspot;

lastNameElement.addEventListener('click', function() {
  dragHotspot = lastNameHotspot;
});

numberElement.addEventListener('click', function() {
  dragHotspot = numberHotspot;
});

var radius = 1500;

document.addEventListener('keypress', function(event) {
  var type = dragHotspot === lastNameHotspot ? 'text' : 'number';
  if (event.key === 'd') {
    currentCoords[type].yaw = currentCoords[type].yaw + 0.001;
    dragHotspot.setPosition(currentCoords[type]);
  }
  if (event.key === 'a') {
    currentCoords[type].yaw = currentCoords[type].yaw - 0.001;
    dragHotspot.setPosition(currentCoords[type]);
  }
  if (event.key === 's') {
    currentCoords[type].pitch = currentCoords[type].pitch + 0.001;
    dragHotspot.setPosition(currentCoords[type]);
  }
  if (event.key === 'w') {
    currentCoords[type].pitch = currentCoords[type].pitch - 0.001;
    dragHotspot.setPosition(currentCoords[type]);
  }
  if (event.key === '+') {
    radius += 30;
    currentCoords.radius = radius;
    dragHotspot.setPerspective({ radius: radius });
  }
  if (event.key === '-') {
    radius -= 30;
    currentCoords.radius = radius;
    dragHotspot.setPerspective({ radius: radius });
  }
  console.log(currentCoords);
});

document.body.addEventListener('click', function(e) {
  var view = viewer.view();
  console.log(view.screenToCoordinates({ x: e.clientX, y: e.clientY }));
});

var button = document.querySelector('.start-button');
button.addEventListener('click', function() {
  button.style.display = 'none';
  startVideo();
});
