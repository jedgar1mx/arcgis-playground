import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import esriConfig from '@arcgis/core/config';
import Basemap from "@arcgis/core/Basemap";
import VectorTileLayer from "@arcgis/core/layers/VectorTileLayer";
import Search from  "@arcgis/core/widgets/Search";
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import Locator from '@arcgis/core/tasks/Locator';
import key from '../../local/key.json';
import './Map.scss';

esriConfig.apiKey = key.key;
export default class Maps {
    constructor(container, app) {
        this.app = app;
        this.svCoords = {
            lng: -83.1,
            lat: 42.36
        }
        this.svBearing = 180;
        this.map = null;
        this.view = null;
        this.search = null;
        this.layers = [];
        this.mainLayer = null;
        this.init(this);
    }

    init(_map){
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
      
      _map.map = new Map({
        basemap: basemap, // Basemap layer service
      });
      
      _map.view = new MapView({
        map: _map.map,
        center: [-83.1, 42.36], // Longitude, latitude
        zoom: 15, // Zoom level
        container: "map", // Div element
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

      _map.search = new Search({  //Add Search widget
        view: _map.view,
        popupEnabled: false,
        allPlaceholder: "District or Senator",
        includeDefaultSources: false,
        sources: [
          {
            layer: parcelLayer,
            searchFields: ["parcel_number"],
            displayField: "parcel_number",
            exactMatch: false,
            outFields: ["address", "parcel_number"],
            name: "Parcel",
            placeholder: "example: 1301 third"
          },
          {
            name: "Detroit Geocoding Service",
            placeholder: "example: Nuuk, GRL",
            singleLineFieldName: "SingleLine",
            locator: new Locator({
              url: "https://gis.detroitmi.gov/arcgis/rest/services/DoIT/CompositeGeocoder/GeocodeServer",
              outFields: ["parcel_number"]
            })
          }
        ]
      });

      _map.view.ui.add(_map.search, "top-right");

      _map.search.on("select-result", function(event){
        console.log("The selected search result: ", event);
      });
      
      _map.layers['selectedParcel'] = new FeatureLayer({
        url: "https://gis.detroitmi.gov/arcgis/rest/services/OpenData/Parcels/FeatureServer/0",
        outFields: ["parcel_number"],
        renderer: parcelSelectedRender,
        definitionExpression: "parcel_number = ''",
        minZoom: 7000
      });
      _map.map.add(parcelLayer);
      _map.map.add(_map.layers['selectedParcel']);
      
      _map.view.popup.autoOpenEnabled = false;  // Disable the default popup behavior
      
      _map.view.on("click", function(event) { // Listen for the click event
        const opts = {
          include: parcelLayer
        }
        _map.view.hitTest(event,opts).then(function (hitTestResults){ // Search for features where the user clicked
          if(hitTestResults.results.length) {
            console.log(event);
            let lat = event.mapPoint.latitude
            let lng = event.mapPoint.longitude;
            console.log(`lat: ${lat}, lng: ${lng}`);
            console.log(hitTestResults.results[0].graphic.attributes.parcel_number);
            _map.layers['selectedParcel'].definitionExpression = `parcel_number = '${hitTestResults.results[0].graphic.attributes.parcel_number}'`;
            _map.app.coords = [lng,lat];
            _map.app.parcel = hitTestResults.results[0].graphic.attributes.parcel_number;
            _map.view.goTo({
              center: [lng, lat],
              zoom: 17,
            })
            .catch(function(error) {
              if (error.name != "AbortError") {
                 console.error(error);
              }
            });
            _map.app.checkSpecialProperties(_map.app.parcel, _map.app);
            document.getElementById('initial-loader-overlay').className = 'active';
            _map.app.panel.createPanel(_map.app.panel, 'dash');
          }else{
            _map.app.panel.dashLast = 'city';
          }
        })
      });
        // _map.map.addControl(new NavigationControl());
        // _map.map.on("load", function () {
        //     // Creating sources
        //     _map.map.addSource('markers', {
        //       type: 'geojson',
        //       data: {
        //           type: 'Feature',
        //           geometry: {
        //               type: 'Point',
        //               coordinates: [12.695600612967427, 56.04351888068181],
        //           },
        //           properties: { },
        //       },
        //     });
        //     // ============= zoning sources ===========
        //     _map.map.addSource("zoning", {
        //       type: "vector",
        //       tiles: [
        //         'https://tiles.arcgis.com/tiles/qvkbeam7Wirps6zC/arcgis/rest/services/Zoning_Vector_Tiles/VectorTileServer/tile/{z}/{y}/{x}.pbf'
        //         ],
        //       'maxzoom': 19
        //     });
        //     // ============= transportation sources ===========
        //     _map.map.addSource("peoplemover", {
        //       type: "geojson",
        //       data:
        //         "https://services2.arcgis.com/qvkbeam7Wirps6zC/arcgis/rest/services/Detroit_People_Mover_Route/FeatureServer/0/query?outFields=*&outSR=4326&where=1%3D1&f=geojson",
        //     });
        //     _map.map.addSource("mogobikes", {
        //       type: "geojson",
        //       data:
        //         "https://services2.arcgis.com/qvkbeam7Wirps6zC/arcgis/rest/services/MoGo_Bike_Share_Locations/FeatureServer/0/query?outFields=*&outSR=4326&where=1%3D1&f=geojson",
        //     });
        //     _map.map.addSource("smartroutes", {
        //       type: "geojson",
        //       data:
        //         "https://services2.arcgis.com/qvkbeam7Wirps6zC/arcgis/rest/services/SMART_Bus_Routes/FeatureServer/0/query?outFields=*&outSR=4326&where=1%3D1&f=geojson",
        //     });
        //     _map.map.addSource("qlineroute", {
        //       type: "geojson",
        //       data:
        //         "https://services2.arcgis.com/qvkbeam7Wirps6zC/arcgis/rest/services/QLine_Route/FeatureServer/0/query?outFields=*&outSR=4326&where=1%3D1&f=geojson",
        //     });
        //     _map.map.addSource("qlinestops", {
        //       type: "geojson",
        //       data:
        //         "https://services2.arcgis.com/qvkbeam7Wirps6zC/arcgis/rest/services/QLine_Stops/FeatureServer/0/query?outFields=*&outSR=4326&where=1%3D1&f=geojson",
        //     });
        //     // ============= public assets sources ===========
        //     _map.map.addSource("police-stations", {
        //       type: "geojson",
        //       data:
        //         "https://services2.arcgis.com/qvkbeam7Wirps6zC/ArcGIS/rest/services/Precinct_Buildings/FeatureServer/0/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=&returnGeometry=true&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pgeojson&token=",
        //     });
        //     _map.map.addSource("fire-stations", {
        //       type: "geojson",
        //       data:
        //         "https://services2.arcgis.com/qvkbeam7Wirps6zC/arcgis/rest/services/Firehouse_Locations/FeatureServer/0/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnGeometry=true&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pgeojson&token=",
        //     });
        //     _map.map.addSource("active-parks", {
        //       type: "geojson",
        //       data:
        //         "https://services2.arcgis.com/qvkbeam7Wirps6zC/ArcGIS/rest/services/Parks_Marijuana/FeatureServer/0/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnGeometry=true&returnCentroid=false&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pgeojson&token=",
        //     });
        //     // ============= for sale sources ===========
        //     _map.map.addSource("marijuana-legacy-structure", {
        //       type: "geojson",
        //       data:
        //         "https://services2.arcgis.com/qvkbeam7Wirps6zC/ArcGIS/rest/services/City_Owned_Land_and_Structures_Set_Aside_for_Adult_Use_Marijuana/FeatureServer/1/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnGeometry=true&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pgeojson&token=",
        //     });
        //     _map.map.addSource("marijuana-legacy-land", {
        //       type: "geojson",
        //       data:
        //         "https://services2.arcgis.com/qvkbeam7Wirps6zC/ArcGIS/rest/services/City_Owned_Land_and_Structures_Set_Aside_for_Adult_Use_Marijuana/FeatureServer/2/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnGeometry=true&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pgeojson&token=",
        //     });
        //     _map.map.addSource("public-properties", {
        //       type: "vector",
        //       tiles: [
        //         'https://tiles.arcgis.com/tiles/qvkbeam7Wirps6zC/arcgis/rest/services/development_map_layers/VectorTileServer/tile/{z}/{y}/{x}.pbf'
        //         ],
        //       'maxzoom': 19
        //     });
        //     // ============= planning and housing sources ===========
        //     _map.map.addSource("opp-zones", {
        //       type: "geojson",
        //       data:
        //         "https://opendata.arcgis.com/datasets/4e50576fb1ee4a2db4208c220747831b_0.geojson",
        //     });
        //     _map.map.addSource("snf", {
        //       type: "geojson",
        //       data:
        //         "https://opendata.arcgis.com/datasets/dafad9fc0e854d9fb03d9cb00ea5e69c_0.geojson",
        //     });
        //     _map.map.addSource("tmah", {
        //       type: "geojson",
        //       data:
        //         "https://services2.arcgis.com/qvkbeam7Wirps6zC/arcgis/rest/services/Targeted_Multifamily_Affordable_Housing/FeatureServer/0/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnGeometry=true&returnCentroid=false&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pgeojson&token=",
        //     });
        //     // ============= zoning layer ===========
        //     _map.map.addLayer({
        //       id: "r-zoning",
        //       type: "line",
        //       source: "zoning",
        //       "source-layer": "Zoning",
        //       paint: {
        //         "line-color": [
        //           'match',
        //           ['get', 'ZONING_REV'],
        //           "R1","#FCF3CF",
        //           "R2","#F9E79F",
        //           "R3","#F4D03F",
        //           "R4","#F1C40F",
        //           "R5","#D4AC0D",
        //           "R6","#B7950B", '#ccc'
        //         ],
        //         "line-width": 3
        //       },
        //       filter: ['in', 'ZONING_REV']
        //     });

        //     _map.map.addLayer({
        //       id: "b-zoning",
        //       type: "line",
        //       source: "zoning",
        //       "source-layer": "Zoning",
        //       paint: {
        //         "line-color": [
        //           'match',
        //           ['get', 'ZONING_REV'],
        //           "B1","#F1948A",
        //           "B2","#EC7063",
        //           "B3","#E74C3C",
        //           "B4","#A93226",
        //           "B5","#922B21",
        //           "B6","#7B241C", '#ccc'
        //         ],
        //         "line-width": 3
        //       },
        //       filter: ['in', 'ZONING_REV']
        //     });

        //     _map.map.addLayer({
        //       id: "m-zoning",
        //       type: "line",
        //       source: "zoning",
        //       "source-layer": "Zoning",
        //       paint: {
        //         "line-color": [
        //           'match',
        //           ['get', 'ZONING_REV'],
        //           "M1","#EBDEF0",
        //           "M2","#C39BD3",
        //           "M3","#9B59B6",
        //           "M4","#7D3C98",
        //           "M5","#4A235A",'#ccc'
        //         ],
        //         "line-width": 3
        //       },
        //       filter: ['in', 'ZONING_REV']
        //     });

        //     _map.map.addLayer({
        //       id: "s-zoning",
        //       type: "line",
        //       source: "zoning",
        //       "source-layer": "Zoning",
        //       paint: {
        //         "line-color": [
        //           'match',
        //           ['get', 'ZONING_REV'],
        //           "P1","#CCD1D1",
        //           "PC","#884EA0",
        //           "PCA","#2471A3",
        //           "PD","#3498DB",
        //           "PR","#1E8449",
        //           "SD1","#D4E6F1",
        //           "SD2","#7FB3D5",
        //           "SD3","#D7BDE2",
        //           "SD4","#45B39D",
        //           "SD5","#ff8f00",
        //           "TM","#A2D9CE",
        //           "W1","#82E0AA",'#ccc'
        //         ],
        //         "line-width": 3
        //       },
        //       filter: ['in', 'ZONING_REV']
        //     });
              
        //       // ============= transportation layers ===========
        //       _map.map.addLayer({
        //         id: "peoplemover",
        //         type: "line",
        //         source: "peoplemover",
        //         layout: { visibility: "none" },
        //         paint: { "line-color": "#2c5490", "line-width": 2 },
        //       });
        //       _map.map.addLayer({
        //         id: "smartroutes",
        //         type: "line",
        //         source: "smartroutes",
        //         layout: { visibility: "none" },
        //         paint: { "line-color": "#eb7609", "line-width": 2 },
        //       });
        //       _map.map.addLayer({
        //         id: "mogobikes",
        //         type: "circle",
        //         source: "mogobikes",
        //         layout: { visibility: "none" },
        //         paint: {
        //           "circle-radius": {
        //             base: 5,
        //             stops: [
        //               [12, 5],
        //               [22, 120],
        //             ],
        //           },
        //           "circle-color": "#ee382a",
        //         },
        //       });
        //       _map.map.addLayer({
        //         id: "qlinestops",
        //         type: "circle",
        //         source: "qlinestops",
        //         layout: { visibility: "none" },
        //         paint: {
        //           "circle-radius": {
        //             base: 5,
        //             stops: [
        //               [12, 5],
        //               [22, 120],
        //             ],
        //           },
        //           "circle-color": "#7fb6ab",
        //         },
        //       });
        //       _map.map.addLayer({
        //         id: "qlineroute",
        //         type: "line",
        //         source: "qlineroute",
        //         layout: { visibility: "none" },
        //         paint: { "line-color": "#7fb6ab", "line-width": 2 },
        //       });
        //       // ============= public assests layers ===========
        //       _map.map.addLayer({
        //         id: "fire-stations",
        //         type: "circle",
        //         source: "fire-stations",
        //         layout: { visibility: "none" },
        //         paint: {
        //           "circle-radius": {
        //             base: 5,
        //             stops: [
        //               [12, 5],
        //               [22, 120],
        //             ],
        //           },
        //           "circle-color": "#8f0408",
        //         },
        //       });
        //       _map.map.addLayer({
        //         id: "police-stations",
        //         type: "circle",
        //         source: "police-stations",
        //         layout: { visibility: "none" },
        //         paint: {
        //           "circle-radius": {
        //             base: 5,
        //             stops: [
        //               [12, 5],
        //               [22, 120],
        //             ],
        //           },
        //           "circle-color": "#00158b",
        //         },
        //       });
        //       _map.map.addLayer({
        //         id: "parks-fill",
        //         type: "fill",
        //         source: "active-parks",
        //         layout: { visibility: "none" },
        //         paint: { "fill-color": "#28f572", "fill-opacity": 0.5 },
        //       });
        //       _map.map.addLayer({
        //         id: "parks-line",
        //         type: "line",
        //         source: "active-parks",
        //         layout: { visibility: "none" },
        //         paint: { "line-color": "#28f572" },
        //       });
        //       // ============= for sale layers ===========
        //       _map.map.addLayer({
        //         id: "city-structures",
        //         type: "fill",
        //         source: "public-properties",
        //         "source-layer": "city_surplus_buildings",
        //         layout: { visibility: "none" },
        //         paint: { "fill-color": "#009980", "fill-opacity": 0.7 }
        //       });
        //       _map.map.addLayer({
        //         id: "city-land",
        //         type: "fill",
        //         source: "public-properties",
        //         "source-layer": "city_surplus_land",
        //         layout: { visibility: "none" },
        //         paint: { "fill-color": "#00f8cf", "fill-opacity": 0.7 }
        //       });
        //       _map.map.addLayer({
        //         id: "dlba-structures",
        //         type: "fill",
        //         source: "public-properties",
        //         "source-layer": "dlba_structures",
        //         layout: { visibility: "none" },
        //         paint: { "fill-color": "#009980", "fill-opacity": 0.7 }
        //       });
        //       _map.map.addLayer({
        //         id: "dlba-land",
        //         type: "fill",
        //         source: "public-properties",
        //         "source-layer": "dlba_land",
        //         layout: { visibility: "none" },
        //         paint: { "fill-color": "#00f8cf", "fill-opacity": 0.7 }
        //       });
        //       _map.map.addLayer({
        //         id: "marijuana-legacy-land",
        //         type: "circle",
        //         source: "marijuana-legacy-land",
        //         layout: { visibility: "none" },
        //         paint: {
        //           "circle-radius": {
        //             base: 5,
        //             stops: [
        //               [12, 5],
        //               [22, 120],
        //             ],
        //           },
        //           "circle-color": "#002e00",
        //         },
        //       });
        //       _map.map.addLayer({
        //         id: "marijuana-legacy-structure",
        //         type: "circle",
        //         source: "marijuana-legacy-structure",
        //         layout: { visibility: "none" },
        //         paint: {
        //           "circle-radius": {
        //             base: 5,
        //             stops: [
        //               [12, 5],
        //               [22, 120],
        //             ],
        //           },
        //           "circle-color": "#028302",
        //         },
        //       });
        //       // ============= Planning and Housing layers ===========
        //       _map.map.addLayer({
        //         id: "opp-zones-fill",
        //         type: "fill",
        //         source: "opp-zones",
        //         layout: { visibility: "none" },
        //         paint: { "fill-color": "#83027d", "fill-opacity": 0.5 },
        //       });
        //       _map.map.addLayer({
        //         id: "opp-zones-line",
        //         type: "line",
        //         source: "opp-zones",
        //         layout: { visibility: "none" },
        //         paint: { "line-color": "#83027d" },
        //       });
        //       _map.map.addLayer({
        //         id: "snf-fill",
        //         type: "fill",
        //         source: "snf",
        //         layout: { visibility: "none" },
        //         paint: { "fill-color": "#804d24", "fill-opacity": 0.5 },
        //       });
        //       _map.map.addLayer({
        //         id: "snf-line",
        //         type: "line",
        //         source: "snf",
        //         layout: { visibility: "none" },
        //         paint: { "line-color": "#804d24" },
        //       });
        //       _map.map.addLayer({
        //         id: "tmah-fill",
        //         type: "fill",
        //         source: "tmah",
        //         layout: { visibility: "none" },
        //         paint: { "fill-color": "#0060dd", "fill-opacity": 0.5 },
        //       });
        //       _map.map.addLayer({
        //         id: "tmah-line",
        //         type: "line",
        //         source: "tmah",
        //         layout: { visibility: "none" },
        //         paint: { "line-color": "#0060dd" },
        //       });
            
        //     // ========= loading video icon =======
        //     _map.map.loadImage('https://detroitmi.gov/sites/detroitmi.localhost/files/styles/default/public/2021-02/video.png', (error, image) => {
        //       if (error) throw error;
        //       _map.map.addImage('video', image);
        //     }); 

        //     _map.map.on('style.load', () => {
        //         _map.map.loadImage(videoIcon, (error, image) => {
        //           if (error) throw error;
        //           _map.map.addImage("video", image);
        //           _map.map.setFilter("parcels-highlight", ["==", "parcelno", _map.app.parcel ? _map.app.parcel : ""]);
        //           _map.svCoords && _map.map.getSource("mapillary").setData({
        //             type: "FeatureCollection",
        //             // we'll make the map data here
        //             features: [
        //               {
        //                 type: "Feature",
        //                 geometry: {
        //                   type: "Point",
        //                   coordinates: [_map.svCoords.lon, _map.svCoords.lat],
        //                 },
        //                 properties: {
        //                   bearing: _map.svBearing - 90,
        //                 },
        //               },
        //             ],
        //           });
        //         }); 
        //     });

        //     _map.map.on("click", "parcels-fill", function (e) {
        //       let possibleProperty = null;
        //       let parcel = _map.map.queryRenderedFeatures(e.point, {
        //         layers: ["parcels-fill"],
        //       });
        //       _map.app.coords = [e.lngLat.lng,e.lngLat.lat];
        //       _map.app.parcel = parcel[0].properties.parcelno;
        //       _map.map.flyTo({
        //           center: [e.lngLat.lng,e.lngLat.lat],
        //           zoom: 18,
        //           essential: true // this animation is considered essential with respect to prefers-reduced-motion
        //       });
        //       _map.map.setFilter("parcels-highlight", ["==", "parcelno", _map.app.parcel ? _map.app.parcel : ""]);
        //       _map.app.checkSpecialProperties(_map.app.parcel, _map.app);
        //       // setCoords(e.lngLat);
        //     });

        //     _map.map.on("click", function (e) {
        //       document.getElementById('initial-loader-overlay').className = 'active';
        //       let parcel = _map.map.queryRenderedFeatures(e.point, {
        //         layers: ["parcels-fill"],
        //       });
        //       if(parcel.length < 1){
        //         _map.app.panel.dashLast = 'city';
        //         _map.app.panel.createPanel(_map.app.panel, 'dash');
        //       }
        //     });
        //     document.querySelector('#initial-loader-overlay').className = '';
        // });
    }

    changeVisibility(layers, visibility, _map){
      console.log(_map.mainLayer);
      _map.mainLayer.eachLayer((_layer) => {  
        console.log(_layer);
      });
      // layers.forEach(layer => {
      //   // let tempMap = _map.map.getMapboxMap();
      //  _map.map._layers[27].options.style.layers.forEach((_layer)=>{
      //   if(_layer.id == layer){
      //     console.log(`Found ${layer}`);
      //     _layer.layout.visibility = visibility;
      //   }
      //  })
      //   // tempMap.setLayoutProperty(layer, "visibility", visibility);
      // });
      _map.map.invalidateSize();
    }
}