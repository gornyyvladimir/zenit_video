'use strict';

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
  .createHotspot(
    lastNameElement,
    { yaw: -0.6086027813351276, pitch: 0.1413926915131576 },
    { perspective: { radius: 1500 } },
  );

  var numberHotspot = scene
  .hotspotContainer()
  .createHotspot(
    numberElement,
    {yaw: -0.6108182376195028, pitch: 0.271448338865941},
    { perspective: { radius: 1500 } },
  );

// Display scene.
scene.switchTo();

// Start playback on click.
// Playback cannot start automatically because most browsers require the play()
// method on the video element to be called in the context of a user action.
// Whether playback has started.
var started = false;
// tryStart();

document.body.addEventListener('click', tryStart);
document.body.addEventListener('click', function(e) {
  var view = viewer.view();
  console.log(view.screenToCoordinates({ x: e.clientX, y: e.clientY }));
});
document.body.addEventListener('touchstart', tryStart);

// Try to start playback.
function tryStart() {
  if (started) {
    return;
  }
  console.log(started);
  started = true;
  document.querySelector('#hint').style.display = 'none';

  var video = document.createElement('video');
  video.src = './video.mp4';
  video.crossOrigin = 'anonymous';
  video.muted = true;

  video.autoplay = true;
  video.loop = false;

  // Prevent the video from going full screen on iOS.
  video.playsInline = true;
  video.webkitPlaysInline = true;

  var promise = video.play();

  if (promise !== undefined) {
    promise.then(_ => {
      // Autoplay started!
      console.log("started")
    }).catch(error => {
      console.log("Sorry", error);
      // Autoplay was prevented.
      // Show a "Play" button so that user can start playback.
    });
  }

  // video.play();

  waitForReadyState(video, video.HAVE_METADATA, 100, function() {
    waitForReadyState(video, video.HAVE_ENOUGH_DATA, 100, function() {
      asset.setVideo(video);
    });
  });
}

// Wait for an element to reach the given readyState by polling.
// The HTML5 video element exposes a `readystatechange` event that could be
// listened for instead, but it seems to be unreliable on some browsers.
function waitForReadyState(element, readyState, interval, done) {
  console.log("Here")
  var timer = setInterval(function() {
    if (element.readyState >= readyState) {
      clearInterval(timer);
      done(null, true);
    }
  }, interval);
}

var radius = 1500;

document.addEventListener('keypress', function(event) {
  if(event.key === '+')
  {
    console.log("+")
    console.log(radius)
    radius++;
    hotspot2.setPerspective({ radius: radius });
  }
  if(event.key === '-') {
    console.log("-")
    console.log(radius)
    radius--;
    hotspot2.setPerspective({ radius: radius });
  }
});

// $('.hotspot').fitText(0.6);
