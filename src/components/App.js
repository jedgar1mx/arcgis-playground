import Maps from './Map';
import Panel from './Panel';
import Geocoder from './Geocoder';
import './App.scss';

export default class App {
    constructor() {
        this.svCoords           = null;
        this.svBearing          = null;
        this.coord              = null;
        this.imageKeys          = null;
        this.currentImageKey    = null;
        this.parcel             = null;
        this.propertyData       = null;
        this.point              = null;
        this.map                = new Maps('map', this);
        this.specialProperty    = null;
        this.cityData           = null;
        this.filters            = [];
        this.zoning             = {
            r: [],
            b: [],
            m: [],
            s: []
        }; 
        this.boundary           = null;
        this.userControls       = document.createElement('form');
        this.panel              = new Panel(this);
        this.geocoder           = null;
        this.initialLoad(this);
    }

    initialLoad(_app){
        // if(_app.geocoder == null){
        //   _app.geocoder = new Geocoder('geocoder', _app);
        // }
        _app.getCityData(_app);
        document.getElementById('close-welcome').addEventListener('click', ()=>{
            document.getElementById('welcome-panel').className = '';
        });
        let dashBtn = document.createElement('button');
        let configBtn = document.createElement('button');
        let infoBtn = document.createElement('button');
        dashBtn.innerHTML = '<i class="fas fa-tachometer-alt"></i> <span>Dashboard</span>';
        dashBtn.addEventListener('click', (ev)=>{
            ev.preventDefault();
            _app.panel.createPanel(_app.panel, 'dash');
        });
        configBtn.innerHTML = '<i class="fas fa-layer-group"></i> <span>Data Layers</span>';
        configBtn.addEventListener('click', (ev)=>{
            ev.preventDefault();
            _app.panel.createPanel(_app.panel, 'filter');
        });
        infoBtn.innerHTML = '<i class="fas fa-info-circle"></i> <span>Info</span>';
        infoBtn.addEventListener('click', (ev)=>{
            ev.preventDefault();
            _app.panel.createPanel(_app.panel, 'info');
        });
        _app.userControls.appendChild(dashBtn);
        _app.userControls.appendChild(configBtn);
        _app.userControls.appendChild(infoBtn);
        if(document.getElementById('user-controls').innerHTML == ''){
          document.getElementById('user-controls').appendChild(_app.userControls);
        }
    }

    getParcelData(_app){
        fetch(`https://apis.detroitmi.gov/assessments/parcel/${_app.parcel}`)
        .then((resp) => resp.json()) // Transform the data into json
        .then(function(data) {
          _app.propertyData = data;
          _app.panel.dashLast = 'parcel';
          _app.panel.createPanel(_app.panel, 'dash');
        }).catch( err => {
          // console.log(err);
        });
    }

    getCityData(_app){
        let population = new Promise((resolve, reject) => {
            let url = `https://api.census.gov/data/2019/pep/population?get=POP&in=state:26&for=place:22000`;
            return fetch(url)
            .then((resp) => resp.json()) // Transform the data into json
            .then(function(data) {
              resolve({"id": "population", "data": data});
            }).catch( err => {
              // console.log(err);
            });
        });
        let permits = new Promise((resolve, reject) => {
            let url = `https://gis.detroitmi.gov/arcgis/rest/services/OpenData/BuildingPermits/FeatureServer/0/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&distance=&units=esriSRUnit_Foot&relationParam=&outFields=*&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=&gdbVersion=&returnDistinctValues=false&returnIdsOnly=false&returnCountOnly=true&returnExtentOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&multipatchOption=&resultOffset=&resultRecordCount=&f=pjson`;
            return fetch(url)
            .then((resp) => resp.json()) // Transform the data into json
            .then(function(data) {
              resolve({"id": "permits", "data": data});
            }).catch( err => {
              // console.log(err);
            });
        });
        let dlbaProperties = new Promise((resolve, reject) => {
            let url = `https://opengis.detroitmi.gov/opengis/rest/services/DLBA/DLBA/MapServer/10/query?where=1%3D1&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&distance=&units=esriSRUnit_Foot&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&havingClause=&returnIdsOnly=false&returnCountOnly=true&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&historicMoment=&returnDistinctValues=false&resultOffset=&resultRecordCount=&returnExtentOnly=false&datumTransformation=&parameterValues=&rangeValues=&quantizationParameters=&featureEncoding=esriDefault&f=pjson`;
            return fetch(url)
            .then((resp) => resp.json()) // Transform the data into json
            .then(function(data) {
              resolve({"id": "dlba-properties", "data": data});
            }).catch( err => {
              // console.log(err);
            });
        });
        let police = new Promise((resolve, reject) => {
            let url = `https://services2.arcgis.com/qvkbeam7Wirps6zC/ArcGIS/rest/services/Precinct_Buildings/FeatureServer/0/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=&returnGeometry=true&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=true&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pjson&token=`;
            return fetch(url)
            .then((resp) => resp.json()) // Transform the data into json
            .then(function(data) {
              resolve({"id": "police", "data": data});
            }).catch( err => {
              // console.log(err);
            });
        });
        let fire = new Promise((resolve, reject) => {
            let url = `https://services2.arcgis.com/qvkbeam7Wirps6zC/arcgis/rest/services/Firehouse_Locations/FeatureServer/0/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=&returnGeometry=true&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=true&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pjson&token=`;
            return fetch(url)
            .then((resp) => resp.json()) // Transform the data into json
            .then(function(data) {
              resolve({"id": "fire", "data": data});
            }).catch( err => {
              // console.log(err);
            });
        });
        let parks = new Promise((resolve, reject) => {
            let url = `https://services2.arcgis.com/qvkbeam7Wirps6zC/ArcGIS/rest/services/Parks_Marijuana/FeatureServer/0/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=&returnGeometry=true&returnCentroid=false&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=true&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pjson&token=`;
            return fetch(url)
            .then((resp) => resp.json()) // Transform the data into json
            .then(function(data) {
              resolve({"id": "parks", "data": data});
            }).catch( err => {
              // console.log(err);
            });
        });
        Promise.all([population,permits,dlbaProperties,police,fire,parks]).then(values => {
            _app.cityData = values;
          }).catch(reason => {
            // console.log(reason);
          });
    }

    checkSpecialProperties(parcel, _app){
      let cityStructure = new Promise((resolve, reject) => {
          let url = `https://services2.arcgis.com/qvkbeam7Wirps6zC/ArcGIS/rest/services/DevelopmentMap/FeatureServer/0/query?where=parcel_id+%3D+%27${parcel}%27&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnGeometry=true&returnCentroid=false&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pjson&token=`;
          return fetch(url)
          .then((resp) => resp.json()) // Transform the data into json
          .then(function(data) {
            resolve({"id": "city-structures", "data": data});
          }).catch( err => {
            // console.log(err);
          });
      });
      let cityLand = new Promise((resolve, reject) => {
          let url = `https://services2.arcgis.com/qvkbeam7Wirps6zC/ArcGIS/rest/services/DevelopmentMap/FeatureServer/1/query?where=parcel_id+%3D+%27${parcel}%27&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnGeometry=true&returnCentroid=false&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pjson&token=`;
          return fetch(url)
          .then((resp) => resp.json()) // Transform the data into json
          .then(function(data) {
            resolve({"id": "city-land", "data": data});
          }).catch( err => {
            // console.log(err);
          });
      });
      let dlbaStructure = new Promise((resolve, reject) => {
          let url = `https://services2.arcgis.com/qvkbeam7Wirps6zC/ArcGIS/rest/services/DevelopmentMap/FeatureServer/2/query?where=parcel_id+%3D+%27${parcel}%27&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnGeometry=true&returnCentroid=false&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pjson&token=`;
          return fetch(url)
          .then((resp) => resp.json()) // Transform the data into json
          .then(function(data) {
            resolve({"id": "city-structures", "data": data});
          }).catch( err => {
            // console.log(err);
          });
      });
      let dlbaLand = new Promise((resolve, reject) => {
          let url = `https://services2.arcgis.com/qvkbeam7Wirps6zC/ArcGIS/rest/services/DevelopmentMap/FeatureServer/3/query?where=parcel_id+%3D+%27${parcel}%27&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnGeometry=true&returnCentroid=false&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pjson&token=`;
          return fetch(url)
          .then((resp) => resp.json()) // Transform the data into json
          .then(function(data) {
            resolve({"id": "city-land", "data": data});
          }).catch( err => {
            // console.log(err);
          });
      });
      Promise.all([cityStructure,cityLand,dlbaStructure,dlbaLand]).then(values => {
          if(values[0].data.features.length){
              _app.specialProperty = "city-structures";
          }else{
              if(values[1].data.features.length){
                  _app.specialProperty = "city-land";
              }else{
                  if(values[2].data.features.length){
                      _app.specialProperty = "dlba-structures";
                  }else{
                      if(values[3].data.features.length){
                          _app.specialProperty = "dlba-land";
                      }else{
                          _app.specialProperty = null;
                      }   
                  }
              }
          }
          _app.getParcelData(_app);
      }).catch(reason => {
      // console.log(reason);
      });
    }

    checkParcelValid(parcel){
        return /\d/.test(parcel);
    }
}