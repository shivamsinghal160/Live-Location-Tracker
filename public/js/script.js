const socket = io();

if (navigator.geolocation) {
  let userName;

  if (localStorage.getItem("userName")) {
    userName = localStorage.getItem("userName");
  } else {
    userName = prompt("Enter your name");
    localStorage.setItem("userName", userName);
  }

  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      console.log(`latitude: ${latitude}, longitude: ${longitude}`);
      socket.emit("send-location", { latitude, longitude, userName });
    },
    (error) => {
      console.log(error);
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    }
  );
} else {
  alert("Geolocation is not supported by this browser.");
}

const map = L.map("map").setView([0, 0], 16);

const tiles = L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    attribution: "&copy; Shivam's MapViewer",
  }
).addTo(map);

const markers = {};

socket.on("receive-location", (coords) => {
  const { id, latitude, longitude, userName } = coords;
  console.log(`client location -> ${id}`, coords);
  map.setView([latitude, longitude]);
  if (markers[id]) {
    markers[id].setLatLng([latitude, longitude]);
  } else {
    markers[id] = L.marker([latitude, longitude])
      .bindTooltip(userName ?? "Anonymous", {
        permanent: true,
        direction: "top",
      })
      .addTo(map);
    console.log(`client connected -> ${id}`, markers);
  }
});

socket.on("user-disconnect", (id) => {
  // remove marker
  map.removeLayer(markers[id]);
  delete markers[id];
  console.log(`client disconnected -> ${id}`, markers);
});

map.on("click", function (e) {
  console.log(e);
  // const clickedLat = e.latlng.lat;
  // const clickedLng = e.latlng.lng;

  // // Create a Turf.js point for the clicked location
  // const clickedPoint = turf.point([clickedLng, clickedLat]);

  // // Create a buffer (5 kilometers radius)
  // const buffer = turf.buffer(clickedPoint, 500, { units: "meters" });

  // // Create a Leaflet polygon from the buffer
  // const bufferLayer = L.geoJSON(buffer).addTo(map);

  // // Optionally, you can also remove the previous buffer before drawing a new one
  // if (window.previousBufferLayer) {
  //   map.removeLayer(window.previousBufferLayer);
  // }

  // // Store the new buffer layer to remove it later if needed
  // window.previousBufferLayer = bufferLayer;
});
