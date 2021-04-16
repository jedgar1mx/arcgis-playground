import Filters from './Filters';
import Streetview from './Streetview';
import './Panel.scss';
import '../../node_modules/mapillary-js/dist/mapillary.min.css';
export default class Panel {
    constructor(app) {
        this.app = app;
        this.calculator = null;
        this.filters = null;
        this.data = null;
        this.panels = [];
        this.dashLast = 'city';
        this.streetview = null;
        this.formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        });
    }

    closePanel(ev,_panel){
        let tempClass = ev.target.parentNode.parentNode.className;
        tempClass = tempClass.split(' ');
        ev.target.parentNode.parentNode.className = tempClass[0];
        // _panel.app.map.map.flyTo({
        //     center: [-83.1,42.36],
        //     zoom: 12,
        //     essential: true // this animation is considered essential with respect to prefers-reduced-motion
        // });
        try {
            while (ev.target.parentNode.firstChild) {
                ev.target.parentNode.removeChild(ev.target.parentNode.firstChild);
            }
        } catch (error) {
            // console.log(error);
        }
        _panel.panels.pop();
    }

    buildPropertyInfo(_panel){
        let date = null;
        if(_panel.app.propertyData.saledate != null){
            date = new Date(_panel.app.propertyData.saledate);
        }
        let markup = `
        <h2>${_panel.app.propertyData.propaddr}</h2>
        <section id="streetview"></section>
        ${_panel.checkSpecialCase(_panel)}
        <section class="group">
        <span class="header">KEY DATA<sup>*</sup></span>
        <p><strong>Owner:</strong> ${_panel.app.propertyData.taxpayer1}</p>
        <p><strong>Owner's Address:</strong> ${_panel.app.propertyData.taxpaddr}</p>
        <p><strong>Zoning:</strong> ${_panel.app.propertyData.zoning}</p>
        <p><strong>Council District:</strong> ${_panel.app.propertyData.council}</p>
        </section>
        <section class="group">
        <span class="header">ADDITIONAL DATA</span>
        ${date != null ? `<p><strong>Last Sale Date:</strong> ${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}</p><p><strong>Last Sale Price:</strong> ${_panel.formatter.format(_panel.app.propertyData.saleprice)}</p>` : ``}
        <p><strong>Parcel Number:</strong> ${_panel.app.propertyData.parcelno}</p>
        <p><strong>Taxable Status:</strong> ${_panel.app.propertyData.taxstatus}</p>
        <p><strong>Total Acreage:</strong> ${_panel.app.propertyData.totalacreage}</p>
        <p><strong>Principal Residence Exemption:</strong> ${_panel.app.propertyData.pre}</p>
        <p><strong>Frontage:</strong> ${_panel.app.propertyData.frontage}</p>
        <p><strong>Depth:</strong> ${_panel.app.propertyData.depth}</p>
        <p><strong>Ward:</strong> ${_panel.app.propertyData.ward}</p>
        </section>
        <small><sup>*</sup>City Owned Property data is sourced from the City of Detroit’s Office of the Assessor. If you find any discrepancies please visit the Coleman A. Young Municipal Center at 2 Woodward Avenue - Suite 804 Detroit, Michigan 48226 or call (313) 224-3035</small>
        `;
        return markup;
    }

    createErrorMsg(_panel){
        let tempPanel = document.querySelector('.panel .panel-box');
        let closeBtn = document.createElement('button');
        closeBtn.innerText = 'x';
        closeBtn.className = 'close-section-btn';
        closeBtn.addEventListener("click", function(e){
            e.preventDefault();
            _panel.closePanel(e);
        });
        tempPanel.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="100" height="70" viewBox="0 0 100 68">
        <g id="large">
            <path fill="none" stroke="#F44" d="M55.8 38.5l6.2-1.2c0-1.8-.1-3.5-.4-5.3l-6.3-.2c-.5-2-1.2-4-2.1-6l4.8-4c-.9-1.6-1.9-3-3-4.4l-5.6 3c-1.3-1.6-3-3-4.7-4.1l2-6A30 30 0 0 0 42 8l-3.3 5.4c-2-.7-4.2-1-6.2-1.2L31.3 6c-1.8 0-3.5.1-5.3.4l-.2 6.3c-2 .5-4 1.2-6 2.1l-4-4.8c-1.6.9-3 1.9-4.4 3l3 5.6c-1.6 1.3-3 3-4.1 4.7l-6-2A32.5 32.5 0 0 0 2 26l5.4 3.3c-.7 2-1 4.2-1.2 6.2L0 36.7c0 1.8.1 3.5.4 5.3l6.3.2c.5 2 1.2 4 2.1 6l-4.8 4c.9 1.6 1.9 3 3 4.4l5.6-3c1.4 1.6 3 3 4.7 4.1l-2 6A30.5 30.5 0 0 0 20 66l3.4-5.4c2 .7 4 1 6.1 1.2l1.2 6.2c1.8 0 3.5-.1 5.3-.4l.2-6.3c2-.5 4-1.2 6-2.1l4 4.8c1.6-.9 3-1.9 4.4-3l-3-5.6c1.6-1.3 3-3 4.1-4.7l6 2A32 32 0 0 0 60 48l-5.4-3.3c.7-2 1-4.2 1.2-6.2zm-13.5 4a12.5 12.5 0 1 1-22.6-11 12.5 12.5 0 0 1 22.6 11z"/>
            <animateTransform attributeName="transform" begin="0s" dur="3s" from="0 31 37" repeatCount="indefinite" to="360 31 37" type="rotate"/>
        </g>
        <g id="small">
            <path fill="none" stroke="#F44" d="M93 19.3l6-3c-.4-1.6-1-3.2-1.7-4.8L90.8 13c-.9-1.4-2-2.7-3.4-3.8l2.1-6.3A21.8 21.8 0 0 0 85 .7l-3.6 5.5c-1.7-.4-3.4-.5-5.1-.3l-3-5.9c-1.6.4-3.2 1-4.7 1.7L70 8c-1.5 1-2.8 2-3.9 3.5L60 9.4a20.6 20.6 0 0 0-2.2 4.6l5.5 3.6a15 15 0 0 0-.3 5.1l-5.9 3c.4 1.6 1 3.2 1.7 4.7L65 29c1 1.5 2.1 2.8 3.5 3.9l-2.1 6.3a21 21 0 0 0 4.5 2.2l3.6-5.6c1.7.4 3.5.5 5.2.3l2.9 5.9c1.6-.4 3.2-1 4.8-1.7L86 34c1.4-1 2.7-2.1 3.8-3.5l6.3 2.1a21.5 21.5 0 0 0 2.2-4.5l-5.6-3.6c.4-1.7.5-3.5.3-5.1zM84.5 24a7 7 0 1 1-12.8-6.2 7 7 0 0 1 12.8 6.2z"/>
            <animateTransform attributeName="transform" begin="0s" dur="2s" from="0 78 21" repeatCount="indefinite" to="-360 78 21" type="rotate"/>
        </g>
        </svg>
        <h3>No Information found.</h3>
        `;
        tempPanel.prepend(closeBtn);
        document.querySelector('#app .panel').className = "panel active";
    }

    buildCityData(_panel){
        let markup = `
        <h2>City of Detroit</h2>
        <img alt="Photo of Detroit" src="https://detroitmi.gov/sites/detroitmi.localhost/files/styles/de2e/public/2018-11/detroit1.jpg">
        <section class="group">
        <span class="header">DEMOGRAPHICS</span>
        <p><strong>Population:</strong> ${_panel.app.cityData[0].data[1][0].replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</p>
        </section>
        <section class="group">
        <span class="header">REAL ESTATE</span>
        <p><strong>DLBA Properties:</strong> ${_panel.app.cityData[2].data.count.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</p>
        <p><strong>Open BSEED Permits:</strong> ${_panel.app.cityData[1].data.count.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</p>
        </section>
        <section class="group">
        <span class="header">INFRASTRUCTURE</span>
        <p><strong>Police Stations:</strong> ${_panel.app.cityData[3].data.count}</p>
        <p><strong>Fire Stations:</strong> ${_panel.app.cityData[4].data.count}</p>
        <p><strong>Active Parks:</strong> ${_panel.app.cityData[5].data.count}</p>
        </section>
        `;
        return markup;
    }

    buildInfo(_panel){
        let markup = `
        <h2>Map Information</h2>
        <section class="group">
        <span class="header">DATA</span>
        <p>Opportunity Map data is sourced from the following: Detroit Open Data Portal, Detroit Land Bank Authority (DLBA), City of Detroit Assessors Office, Housing and Revitalization Department, Planning and Development Department, Buildings and Safety Engineering and Environment Department and Department of Transportation. In a few instances, DLBA data may be more up-to-date than the City of Detroit Assessors Office. For questions, please visit the <a href="https://detroitmi.gov/departments/office-chief-financial-officer/ocfo-divisions/office-assessor" target="_blank">City of Detroit Assessors Office.</a></p>
        </section>
        <section class="group">
        <span class="header">GLOSSARY</span>
        <p><strong>PUBLIC ASSETS</strong></p>
        <p>Detroit Land Bank Authority (DLBA) and the City of Detroit (P&DD) owned properties identified as available for sale. However, please verify with the Detroit Building Authority and/or the DLBA for the most accurate information.</p>
        <p><strong>PUBLIC LAND</strong></p>
        <p>Detroit Land Bank Authority (DLBA) and the City of Detroit (P&DD) owned vacant parcels identified as available for sale. However, please verify with the Detroit Building Authority and/or the DLBA for the most accurate information.</p>
        <p><strong>PUBLIC STRUCTURES</strong></p>
        <p>Detroit Land Bank Authority (DLBA) and the City of Detroit (P&DD) owned buildings identified as available for sale. However, please verify with the Detroit Building Authority and/or the DLBA for the most accurate information.</p>
        <p><strong>MARIJUANA LEGACY LAND</strong></p>
        <p>The City of Detroit (P&DD) owned vacant parcels identified and specifically set aside as available for sale to certified Detroit Legacy Applicants for specific uses in the cannabis industry. Please refer to <a href="https://detroitmeansbusiness.org/homegrown/" target="_blank">Detroit Means Business</a> for more information.</p>
        <p><strong>MARIJUANA LEGACY STRUCTURES</strong></p>
        <p>The City of Detroit (P&DD) owned buildings identified and specifically set aside as available for sale to certified Detroit Legacy Applicants for specific uses in the cannabis industry. Please refer to <a href="https://detroitmeansbusiness.org/homegrown/" target="_blank">Detroit Means Business</a> for more information.</p>
        <p><strong>PUBLIC SERVICE ASSETS</strong></p>
        <ul>
            <li>Fire Stations</li>
            <li>Police Stations</li>
            <li>Active Parks</li>
        </ul>
        <p><strong>PLANNING & HOUSING</strong></p>
        <p>There are several planning areas for different purposes city wide, explainations are below:</p>
        <ul>
        <li>Targeted Multifamily Housing Areas – identify areas of the city with stronger housing markets and active commercial corridors. Developers of both market-rate and affordable housing, are encouraged to focus in these areas. To understand more, please check out the Housing & Revitalization Department <a href="https://detroitmi.gov/departments/housing-and-revitalization-department/developers-and-contractors" target="_blank">Developers Page.</a></li>
        <li>Strategic Neighborhood Fund Investment Areas are areas that can access certain funding sources drawn from philanthropic contributions and public subsidies designed to improve Detroit neighborhoods.</li>
        <li>Opportunity Zones are areas that can access certain federally funded incentives and economic tools to spur development.</li>
        </ul>
        <p><strong>ZONING</strong></p>
        <p><strong>Residential Zoning</strong></p>
        <ul>
        <li>R1 Single-Family Residential District</li>
        <li>R2 Two-Family Residential District</li>
        <li>R3 Low Density Residential District</li>
        <li>R4 Thoroughfare Residential District</li>
        <li>R5 Medium Density Residential District</li>
        <li>R6 High Density Residential District</li>
        </ul>
        <p><strong>Business / Commercial Zoning</strong></p>
        <ul>
        <li>B1 Restricted Business District</li>
        <li>B2 Local Business and Residential District</li>
        <li>B3 Shopping District</li>
        <li>B4 General Business District</li>
        <li>B5 Major Business District</li>
        <li>B6 General Services District</li>
        </ul>
        <p><strong>Industrial District Zoning</strong></p>
        <ul>
        <li>M1 Limited Industrial District</li>
        <li>M2 Restricted Industrial District</li>
        <li>M3 General Industrial District</li>
        <li>M4 Intensive Industrial District</li>
        <li>M5 Special Industrial District</li>
        </ul>
        <p><strong>Special Districts</strong></p>
        <ul>
        <li>PD Planned Development District</li>
        <li>P1 Open Parking District</li>
        <li>PC Public Center District</li>
        <li>PCA Public Center Adjacent District (Restricted Central business District)</li>
        <li>TM Transitional-Industrial District</li>
        <li>PR Parks and Recreation District</li>
        <li>W1 Waterfront-Industrial District</li>
        <li>SD1 Special Development District, Small-Scale, Mixed-Use</li>
        <li>SD2 Special Development District, Mixed-Use</li>
        <li>SD3 Special Development District, Technology and Research</li>
        <li>SD4 Special Development District, Riverfront mixed use</li>
        <li>SD5 Special Development District, Casinos</li>
        <li>TM</li>
        <li>W5</li>
        </ul>
        <p><strong>PUBLIC TRANSPORTATION</strong></p>
        <ul>
        <li>DDOT Buses - Detroit Department of Transportation Bus Routes</li>
        <li>SMART Buses - Suburban Mobility Authority for Regional Transportation (SMART) is Southeast Michigan's only regional bus system</li>
        <li>QLine - 3.3 mile streetcar that rides along the Woodward Corridor</li>     
        <lip>People Mover - Elevated Train that routed throughout Downtown Detroit</li>
        <li>MoGo Bike Sharing - Bike rentals across the greater downtown</li>
        </ul>
        </section>
        `;
        return markup;
    }

    buildFilters(_panel){
        let markup = `
        <h2>Map Data Layers</h2>
        <article id="filter-box">
        </article>
        `;
        return markup;
    }

    buildCalculator(_panel){
        let markup = `
        <section class="calculator">
          <h2>Income Calculator</h2>
          <article id="calc-box"></article>
        </section>
        `;
        return markup;
    }

    checkSpecialCase(_panel){
        let markup = null;
        switch (_panel.app.specialProperty) {
            case 'city-land':
                markup = `<div class="buy-btn"><a href="https://detroitmi.gov/properties" target="_blank">Inquire to buy this land</a></div>`;
                break;

            case 'dlba-land':
                markup = `<div class="buy-btn"><a href="https://buildingdetroit.org/development-projects/" target="_blank">Inquire to buy this land</a></div>`;
                break;

            case 'city-structures':
                markup = `<div class="buy-btn"><a href="https://detroitmi.gov/properties" target="_blank">Inquire to buy this Property</a></div>`;
                break;

            case 'dlba-structures':
                markup = `<div class="buy-btn"><a href="https://buildingdetroit.org/development-projects/" target="_blank">Inquire to buy this Property</a></div>`;
                break;
        
            default:
                markup = '';
                break;
        }
        return markup;
    }

    createImagery(_panel){
        _panel.streetview = new Streetview('streetview', _panel.app);
    }

    createPanel(_panel, panelType){
        let tempPanel = document.querySelector('.panel .panel-box');
        let closeBtn = document.createElement('button');
        closeBtn.innerText = 'x';
        closeBtn.className = 'close-section-btn';
        closeBtn.addEventListener("click", function(e){
            e.preventDefault();
            _panel.closePanel(e, _panel);
        });
        if(!_panel.panels.includes(panelType)){
            _panel.panels.push(panelType);
        }
        switch (_panel.panels[(_panel.panels.length - 1)]) {
            case 'dash':
                if(_panel.dashLast == 'city'){
                    tempPanel.innerHTML = `${_panel.buildCityData(_panel)}`;
                }else{
                    tempPanel.innerHTML = `${_panel.buildPropertyInfo(_panel)}`;
                    _panel.createImagery(_panel);
                }
                break;

            case 'filter':
                tempPanel.innerHTML = `${_panel.buildFilters(_panel)}`;
                _panel.filters = new Filters('filter-box', _panel.app);
                break;

            case 'info':
                tempPanel.innerHTML = `${_panel.buildInfo(_panel)}`;
                break;
        
            default:
                break;
        }
        tempPanel.prepend(closeBtn);
        document.querySelector('#app .panel').className = "panel active";
        document.querySelector('#initial-loader-overlay').className = '';
    }
}