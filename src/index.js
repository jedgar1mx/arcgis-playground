import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import esriConfig from '@arcgis/core/config';
import Basemap from "@arcgis/core/Basemap";
import VectorTileLayer from "@arcgis/core/layers/VectorTileLayer";
import TileLayer from  "@arcgis/core/layers/TileLayer";
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';

esriConfig.apiKey = "AAPKc92e0268cb7d41cab948f1c2eb4e2c72WiY9z-m7D_E2R5ODmzU7BNVmqXQTkNTJyEq0ovAmnU380kZIMEgOz-zKSIbwM1Mn";

const parcelRender = {
  type: "simple",
  symbol: {
    type: "simple-fill",
    color: [0, 68, 69,0],
    outline: {
      width: 1,
      color: [0, 68, 69,1]
    }
  }
}

const parcelDataRender = {
  type: "simple",
  symbol: {
    type: "simple-fill",
    color: [0, 68, 69,0],
    outline: {
      width: 1,
      color: [0, 68, 69,0]
    }
  }
}

const parcelSelectedRender = {
  type: "simple",
  symbol: {
    type: "simple-fill",
    color: [0, 68, 69,0.8],
    outline: {
      width: 1,
      color: [0, 68, 69,1]
    }
  }
}
const vectorTileLayer = new VectorTileLayer({
  url: "https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer"
});

const parcelTileLayer = new VectorTileLayer({
  url: "https://tiles.arcgis.com/tiles/qvkbeam7Wirps6zC/arcgis/rest/services/parcels/VectorTileServer",
  minZoom: 7000,
  renderer: parcelRender
});

const basemap = new Basemap({
  baseLayers: [
    vectorTileLayer,
    parcelTileLayer
  ]
});

const map = new Map({
  basemap: basemap, // Basemap layer service
});

const view = new MapView({
  map: map,
  center: [-83.1, 42.36], // Longitude, latitude
  zoom: 15, // Zoom level
  container: "viewDiv", // Div element
  highlightOptions: {
    color: "#004445"
  }
});

const popupParcel = {
  title: "Parcel",
  content: "<strong>ID:{parcel_number}</strong>"
}

const parcelLayer = new FeatureLayer({
  url: "https://gis.detroitmi.gov/arcgis/rest/services/OpenData/Parcels/FeatureServer/0",
  outFields: ["parcel_number"],
  renderer: parcelDataRender,
  // popupTemplate: popupParcel,
  // definitionExpression: "parcel_number = '10001000-3'",
  minZoom: 7000
});

const selectedParcel = new FeatureLayer({
  url: "https://gis.detroitmi.gov/arcgis/rest/services/OpenData/Parcels/FeatureServer/0",
  outFields: ["parcel_number"],
  renderer: parcelSelectedRender,
  definitionExpression: "parcel_number = ''",
  minZoom: 7000
});
map.add(parcelLayer);
map.add(selectedParcel);

view.popup.autoOpenEnabled = false;  // Disable the default popup behavior

view.on("click", function(event) { // Listen for the click event
  const opts = {
    include: parcelLayer
  }
  view.hitTest(event,opts).then(function (hitTestResults){ // Search for features where the user clicked
    if(hitTestResults.results.length) {
      console.log(event);
      let lat = event.mapPoint.latitude
      let lng = event.mapPoint.longitude;
      console.log(`lat: ${lat}, lng: ${lng}`);
      console.log(hitTestResults.results[0].graphic.attributes.parcel_number);
      selectedParcel.definitionExpression = `parcel_number = '${hitTestResults.results[0].graphic.attributes.parcel_number}'`;
      document.getElementById('panel').innerHTML = `
        <h1>Results</h1>
        <p><strong>Parcel:</strong> ${hitTestResults.results[0].graphic.attributes.parcel_number}</p>
      `;
    }
  })
});
