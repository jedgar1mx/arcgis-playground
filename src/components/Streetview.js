import * as Mapillary from "mapillary-js";
import bearing from "@turf/bearing";
import './Streetview.scss';

export default class Streetview {
    constructor(container, app) {
        this.app                = app;
        this.dateSelect         = null;
        this.loading            = true;
        this.currentCoords      = null;
        this.defaultMarker      = null;
        this.markerComponent    = null;
        this.container          = document.getElementById(container);
        this.mly                = null;
        this.mapillaryClientID  = 'bmZxVGc0ODVBVXhZVk5FTDdyeHlhZzowM2EyODU0Njc4OWY3ZGNi';
        this.markerStyle        = {
            ballColor: "white",
            ballOpacity: 0.5,
            color: "#feb70d",
            opacity: 0.55,
            interactive: false,
            radius: 2,
        };
        this.createStreetView(this);
    }

    createStreetView(_streetview){
        // creating streetview components
        let header          = document.createElement('article');
        let title           = document.createElement('div');
        let date            = document.createElement('div');
        let dateLabel       = document.createElement('label');
        let dateSelect      = document.createElement('select'); 
        let imagery         = document.createElement('section');
        let loader          = document.createElement('article');
        let mlyContainer    = document.createElement('article');
        // building header
        title.innerHTML = `<i class="fas fa-street-view"></i> Street View`;
        title.className = 'streetview-title';
        dateSelect.id = 'streetview-date';
        dateSelect.addEventListener('change', (ev)=>{
            _streetview.changingImageDate(ev, _streetview);
        });
        _streetview.dateSelect = dateSelect;
        dateLabel.innerHTML = `<i class="far fa-calendar-alt"></i> Date`;
        dateLabel.setAttribute('for', 'streetview-date');
        header.className = 'streetview-header';
        date.appendChild(dateLabel);
        date.className = 'streetview-date';
        date.appendChild(dateSelect);
        header.appendChild(title);
        header.appendChild(date);
        // building imagery section
        mlyContainer.id = 'mly';
        loader.innerHTML = `
        <article>
          <div>
            <div class="loader">
              <div class="loader__bar"></div>
              <div class="loader__bar"></div>
              <div class="loader__bar"></div>
              <div class="loader__bar"></div>
              <div class="loader__bar"></div>
              <div class="loader__ball"></div>
            </div>
            <p>LOADING</p>
          </div>
        </article>
        `;
        if(_streetview.loading){
            loader.className = 'streetview-loader active';
        }else{
            loader.className = 'streetview-loader';
        }
        imagery.className = 'streetview-imagery';
        imagery.appendChild(loader);
        imagery.appendChild(mlyContainer);
        // loading viewer to page
        _streetview.container.appendChild(header);
        _streetview.container.appendChild(imagery);
        _streetview.getImageKey(_streetview);
    }

    setCameraIcon(_streetview){
        _streetview.app.map.map.getSource('mapillary').setData({
            type: "FeatureCollection",
            // we'll make the map data here
            features: [
              {
                type: "Feature",
                geometry: {
                  type: "Point",
                  coordinates: [_streetview.app.svCoords.lng, _streetview.app.svCoords.lat],
                },
                properties: {
                  bearing: _streetview.app.svBearing - 90,
                },
              },
            ],
        });
    }

    loadImagery(_streetview){ 
        _streetview.setLoading(_streetview, false);
        _streetview.mly = new Mapillary.Viewer({
            // Replace this with your own client ID from mapillary.com
            apiClient: _streetview.mapillaryClientID,
            component: {
                cover: false,
                marker: true,
                sequence: false,
                cache: true,
                attribution: false,
            },
            container: 'mly',
        });

        _streetview.mly.on("nodechanged", (n) => {
            _streetview.app.svCoords = n.latLon;
        });
        
        _streetview.mly.on("bearingchanged", (b) => {
            _streetview.app.svBearing = b;
        });

        _streetview.defaultMarker = new Mapillary.MarkerComponent.SimpleMarker("default-id", { lat: _streetview.app.coords[1], lon: _streetview.app.coords[0] }, _streetview.markerStyle);
        _streetview.markerComponent = _streetview.mly.getComponent("marker");
        _streetview.markerComponent.add([_streetview.defaultMarker]);

        _streetview.mly.moveToKey(_streetview.app.currentImageKey.properties.key).then((node) => {
            _streetview.setBearing(_streetview, node, _streetview.mly, _streetview.app.currentImageKey.geometry.coordinates, [_streetview.app.coords[0], _streetview.app.coords[1]]);
        });
        
        // _streetview.app.map.map.getSource('mapillary').setData({
        //   type: "FeatureCollection",
        //   // we'll make the map data here
        //   features: [
        //     {
        //       type: "Feature",
        //       geometry: {
        //         type: "Point",
        //         coordinates: [_streetview.app.svCoords[0], _streetview.app.svCoords[1]],
        //       },
        //       properties: {
        //         bearing: _streetview.app.svBearing - 90,
        //       },
        //     },
        //   ],
        // });
    }

    removeImagery(_streetview){
        let container = document.getElementById('mly');
        container.removeChild(container.childNodes[1]);
        container.removeChild(container.childNodes[0]);
        _streetview.setLoading(_streetview, true);
    }

    getImageKey(_streetview){
        fetch(`https://a.mapillary.com/v3/images?client_id=${_streetview.mapillaryClientID}&closeto=${_streetview.app.coords[0]},${_streetview.app.coords[1]}&radius=80&usernames=codgis&start_time=2018-07-01`)
        .then((resp) => resp.json()) // Transform the data into json
        .then(function(data) {
            let sequences = [];
            data.features.forEach((ik) => {
                if (sequences.map((s) => s.properties.captured_at.slice(0, 10)).indexOf(ik.properties.captured_at.slice(0, 10)) === -1) {
                    sequences.push(ik);
                }
            });
            let sorted = sequences.sort((a, b) => _streetview.buildDate(a.properties.captured_at) - _streetview.buildDate(b.properties.captured_at));
            _streetview.app.imageKeys = sorted;
            _streetview.app.currentImageKey = sorted[sorted.length - 1];
            _streetview.app.svCoords = _streetview.app.currentImageKey.geometry.coordinates;
            // _streetview.setCameraIcon(_streetview);
            _streetview.loadDateOptions(_streetview);
            _streetview.loadImagery(_streetview);
        }).catch( err => {
          // console.log(err);
        });
    }

    loadDateOptions(_streetview){
        _streetview.app.imageKeys.forEach((key, id)=>{
            let tempDate = new Date(key.properties.captured_at);
            let tempOption = document.createElement('option');
            if(_streetview.app.currentImageKey.properties.captured_at == key.properties.captured_at){
                tempOption.selected = true;
            }
            tempOption.label = `${tempDate.toLocaleString('default', { month: 'short' })} ${tempDate.getDate()}, ${tempDate.getFullYear()}`;
            tempOption.value = key.properties.captured_at;
            _streetview.dateSelect.appendChild(tempOption);
        });
    }

    buildDate(date){
        return new Date(date);
    }

    setLoading(_streetview, status){
        if(status){
            document.querySelector('.streetview-loader').className = 'streetview-loader active';
            _streetview.loading = true;
        }else{
            document.querySelector('.streetview-loader.active').className = 'streetview-loader';
            _streetview.loading = false;
        }
    }

    changingImageDate(ev, _streetview){
        _streetview.app.currentImageKey = _streetview.app.imageKeys.filter((s) => s.properties.captured_at === ev.target.value)[0];
        _streetview.removeImagery(_streetview);
        _streetview.app.svCoords = _streetview.app.currentImageKey.geometry.coordinates;
        // _streetview.setCameraIcon(_streetview);
        _streetview.loadImagery(_streetview);
    }

    wrap(value, min, max) {
        let interval = max - min;
      
        while (value > max || value < min) {
          if (value > max) {
            value = value - interval;
          } else if (value < min) {
            value = value + interval;
          }
        }
      
        return value;
    }

    bearingToBasic(_streetview, desiredBearing, nodeBearing) {
        // 1. Take difference of desired bearing and node bearing in degrees.
        // 2. Scale to basic coordinates.
        // 3. Add 0.5 because node bearing corresponds to the center
        //    of the image. See
        //    https://mapillary.github.io/mapillary-js/classes/viewer.html
        //    for explanation of the basic coordinate system of an image.
        var basic = (desiredBearing - nodeBearing) / 360 + 0.5;
      
        // Wrap to a valid basic coordinate (on the [0, 1] interval).
        // Needed when difference between desired bearing and node
        // bearing is more than 180 degrees.
        return _streetview.wrap(basic, 0, 1);
    }

    setBearing(_streetview, node, mly, start, end) {
        if (!node.fullPano) {
          // We are only interested in setting the bearing for full 360 panoramas.
          return;
        }
        let nodeBearing = node.computedCA; // Computed node compass angle (equivalent
        // to bearing) is used by mjs when placing
        // the node in 3D space.
      
        // compute this with @turf/bearing
        let desiredBearing = bearing(start, end); // Your desired bearing.
        let basicX = _streetview.bearingToBasic(_streetview, desiredBearing, nodeBearing);
        let basicY = 0.45; // tilt slightly up
      
        let center = [basicX, basicY];
      
        mly.setCenter(center);
    }
}