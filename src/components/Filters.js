'use strict';
import './Filters.scss';
export default class Filters {
  constructor(container, app) {
    this.form = null;
    this.expansion = {
        forSale         : false,
        transportation  : false,
        publicAssests   : false,
        planningHousing : false,
        zoning          : false,
        zoningB         : false,
        zoningM         : false,
        zoningS         : false
    }; 
    this.app = app;
    this.container = document.getElementById(container);
    this.buidlForm(document.getElementById(container), this);
  }

  checkLock(_filterPanel){
    if(_filterPanel.lock == true){
        return true;
    }else{
        return false;
    }
  }

  changeLock(_filterPanel){
    if(_filterPanel.lock == true){
        _filterPanel.lock = false;
    }else{
        _filterPanel.lock = true;
    }
  }
  
  removeForm(container){
    container.removeChild(container.childNodes[1]);
  }

  updateFilters(ev,_filterPanel){
    let visibility = 'none';
    if(ev.target.checked){
      visibility = 'visible';
      if(!_filterPanel.app.filters.includes(ev.target.id)){
        _filterPanel.app.filters.push(ev.target.id);
      }
    }else{
      if(_filterPanel.app.filters.includes(ev.target.id)){
        let filtered = _filterPanel.app.filters.filter(function(value, index, arr){ 
          return value != ev.target.id;
        });
        _filterPanel.app.filters = filtered;
      }
    }
    if(ev.target.name.includes('zoning-data')){
      let tempFilter = _filterPanel.buildNewZoningFilter(ev, _filterPanel, visibility);
      _filterPanel.app.map.map.setFilter(`${ev.target.name.charAt(0)}-zoning`, tempFilter);
    }else{
      let layers = ev.target.value.split(',');
      _filterPanel.app.map.changeVisibility(layers, visibility, _filterPanel.app.map);
    }
    if(ev.target.className == 'parent-filter'){
      _filterPanel.changeSubsets(ev, _filterPanel);
    }
  }

  buildNewZoningFilter(ev, _filterPanel, visibility){
    let zones = ev.target.value.split(',');
    let tempFilter = ['in', 'ZONING_REV'];
    if(visibility == 'visible'){
      if(_filterPanel.app.zoning[ev.target.name.charAt(0)].length > 0){
        _filterPanel.app.zoning[ev.target.name.charAt(0)].shift();
        _filterPanel.app.zoning[ev.target.name.charAt(0)].shift();
      }
      zones.forEach((zone) => {
        if(!_filterPanel.app.zoning[ev.target.name.charAt(0)].includes(zone)){
          _filterPanel.app.zoning[ev.target.name.charAt(0)].push(zone);
        }
      });
      _filterPanel.app.zoning[ev.target.name.charAt(0)].forEach((zone)=>{
        tempFilter.push(zone);
      });
    }else{
      let cleanList = _filterPanel.app.zoning[ev.target.name.charAt(0)];
      zones.forEach((zone)=>{
        if(cleanList.includes(zone)){
          let filtered = cleanList.filter(function(value, index, arr){ 
            return value != zone;
          });
          cleanList = filtered;
        }
      });
      tempFilter = cleanList;
    }
    _filterPanel.app.zoning[ev.target.name.charAt(0)] = tempFilter;
    return tempFilter;
  }

  changeSubsets(ev, _filterPanel){
    let filterSet = ev.target.value.split(',');
    if(ev.target.checked){
      filterSet.forEach(filter => {
        if(!_filterPanel.app.filters.includes(filter)){
          _filterPanel.app.filters.push(filter);
        }
      });
    }else{
      let original = _filterPanel.app.filters;
      let newList = _filterPanel.app.filters;
      filterSet.forEach(filter => {
        if(original.includes(filter)){
          newList = newList.filter(function(value, index, arr){ 
            return value != filter;
          });
        }
      });
      _filterPanel.app.filters = newList;
    }
    _filterPanel.removeForm(_filterPanel.container);
    _filterPanel.buidlForm(_filterPanel.container, _filterPanel);
  }

  buidlForm(container, _filterPanel){
    _filterPanel.form = document.createElement('form');

    // ========= Create public assets sections =========
    let forSale = document.createElement('article');
    let forSaleAllInput = document.createElement('input');
    let forSaleAllLabel = document.createElement('label');
    let forSaleAllExpandBtn = document.createElement('button');
    let forSaleSubsets = document.createElement('article');
    let publicLandInput = document.createElement('input');
    let publicLandLegend = document.createElement('span');
    let publicLandLabel = document.createElement('label');
    let publicLandBox = document.createElement('div');
    let publicStructureInput = document.createElement('input');
    let publicStructureLegend = document.createElement('span');
    let publicStructureLabel = document.createElement('label');
    let publicStructureBox = document.createElement('div');
    let marijuanaLegacyLandInput = document.createElement('input');
    let marijuanaLegacyLandLegend = document.createElement('span');
    let marijuanaLegacyLandLabel = document.createElement('label');
    let marijuanaLegacyLandBox = document.createElement('div');
    let marijuanaLegacyStructureInput = document.createElement('input');
    let marijuanaLegacyStructureLegend = document.createElement('span');
    let marijuanaLegacyStructureLabel = document.createElement('label');
    let marijuanaLegacyStructureBox = document.createElement('div');
    forSale.className ='parent-filter-container';
    forSaleAllInput.type = 'checkbox';
    forSaleAllInput.value = 'city-land,dlba-land,city-structures,dlba-structures,marijuana-legacy-structure,marijuana-legacy-land'
    forSaleAllInput.id = 'forSale-all';
    forSaleAllInput.name = 'forSale-data'; 
    if(_filterPanel.app.filters.includes('forSale-all')){
      forSaleAllInput.checked = true;
    }else{
      forSaleAllInput.checked = false;
    }
    forSaleAllInput.className = 'parent-filter';
    forSaleAllLabel.innerText = 'Public Properties for Sale';
    forSaleAllLabel.setAttribute('for', 'forSale-all');
    forSaleAllExpandBtn.type = 'expand';
    forSaleAllInput.addEventListener('change', (ev)=>{
      _filterPanel.updateFilters(ev, _filterPanel);
    });
    if(_filterPanel.expansion.forSale){
        forSaleAllExpandBtn.innerHTML = '<i class="fas fa-minus"></i>';
    }else{
        forSaleAllExpandBtn.innerHTML = '<i class="fas fa-plus"></i>';
    }
    forSaleAllExpandBtn.addEventListener('click', (ev)=>{
        (_filterPanel.expansion.forSale) ? _filterPanel.expansion.forSale = false : _filterPanel.expansion.forSale = true;
        _filterPanel.removeForm(_filterPanel.container);
        _filterPanel.buidlForm(_filterPanel.container, _filterPanel);
    });
    if(_filterPanel.expansion.forSale){
      forSaleSubsets.className = 'filter-subset active';
    }else{
      forSaleSubsets.className = 'filter-subset';
    }

    // City and DLBA land
    publicLandInput.type = 'checkbox';
    publicLandInput.name = 'forSale-data';
    publicLandInput.id = 'public-land';
    publicLandInput.value = 'city-land,dlba-land';
    if(_filterPanel.app.filters.includes('city-land')){
      publicLandInput.checked = true;
    }else{
      publicLandInput.checked = false;
    }
    publicLandInput.addEventListener('change', (ev)=>{
      _filterPanel.updateFilters(ev, _filterPanel);
    });
    publicLandLabel.innerText = 'Public Land';
    publicLandLabel.setAttribute('for', 'public-land');
    publicLandLegend.className = 'circle public-land';
    publicLandLabel.appendChild(publicLandLegend);
    publicLandBox.appendChild(publicLandInput);
    publicLandBox.appendChild(publicLandLabel);
    forSaleSubsets.appendChild(publicLandBox);

    // City and DLBA Structure
    publicStructureInput.type = 'checkbox';
    publicStructureInput.name = 'forSale-data';
    publicStructureInput.id = 'public-structure';
    publicStructureInput.value = 'city-structures,dlba-structures';
    if(_filterPanel.app.filters.includes('city-structures')){
      publicStructureInput.checked = true;
    }else{
      publicStructureInput.checked = false;
    }
    publicStructureInput.addEventListener('change', (ev)=>{
      _filterPanel.updateFilters(ev, _filterPanel);
    });
    publicStructureLabel.innerText = 'Public Structure';
    publicStructureLabel.setAttribute('for', 'public-structure');
    publicStructureLegend.className = 'circle public-structure';
    publicStructureLabel.appendChild(publicStructureLegend);
    publicStructureBox.appendChild(publicStructureInput);
    publicStructureBox.appendChild(publicStructureLabel);
    forSaleSubsets.appendChild(publicStructureBox);

    // marijuana legacy land
    marijuanaLegacyLandInput.type = 'checkbox';
    marijuanaLegacyLandInput.name = 'forSale-data';
    marijuanaLegacyLandInput.id = 'marijuana-legacy-land';
    marijuanaLegacyLandInput.value = 'marijuana-legacy-land';
    if(_filterPanel.app.filters.includes('marijuana-legacy-land')){
      marijuanaLegacyLandInput.checked = true;
    }else{
      marijuanaLegacyLandInput.checked = false;
    }
    marijuanaLegacyLandInput.addEventListener('change', (ev)=>{
      _filterPanel.updateFilters(ev, _filterPanel);
    });
    marijuanaLegacyLandLabel.innerText = 'Marijuana Legacy Land';
    marijuanaLegacyLandLabel.setAttribute('for', 'marijuana-legacy-land');
    marijuanaLegacyLandLegend.className = 'circle marijuana-land';
    marijuanaLegacyLandLabel.appendChild(marijuanaLegacyLandLegend);
    marijuanaLegacyLandBox.appendChild(marijuanaLegacyLandInput);
    marijuanaLegacyLandBox.appendChild(marijuanaLegacyLandLabel);
    forSaleSubsets.appendChild(marijuanaLegacyLandBox);

    // marijuana legacy structure
    marijuanaLegacyStructureInput.type = 'checkbox';
    marijuanaLegacyStructureInput.name = 'forSale-data';
    marijuanaLegacyStructureInput.id = 'marijuana-legacy-structure';
    marijuanaLegacyStructureInput.value = 'marijuana-legacy-structure';
    if(_filterPanel.app.filters.includes('marijuana-legacy-structure')){
      marijuanaLegacyStructureInput.checked = true;
    }else{
      marijuanaLegacyStructureInput.checked = false;
    }
    marijuanaLegacyStructureInput.addEventListener('change', (ev)=>{
      _filterPanel.updateFilters(ev, _filterPanel);
    });
    marijuanaLegacyStructureLabel.innerText = 'Marijuana Legacy Structures';
    marijuanaLegacyStructureLabel.setAttribute('for', 'marijuana-legacy-structure');
    marijuanaLegacyStructureLegend.className = 'circle marijuana-structure';
    marijuanaLegacyStructureLabel.appendChild(marijuanaLegacyStructureLegend);
    marijuanaLegacyStructureBox.appendChild(marijuanaLegacyStructureInput);
    marijuanaLegacyStructureBox.appendChild(marijuanaLegacyStructureLabel);
    forSaleSubsets.appendChild(marijuanaLegacyStructureBox);

    forSale.appendChild(forSaleAllInput);
    forSale.appendChild(forSaleAllLabel);
    forSale.appendChild(forSaleAllExpandBtn);
    _filterPanel.form.appendChild(forSale);
    _filterPanel.form.appendChild(forSaleSubsets);

    // ========= Create public assets sections =========
    let publicAssests = document.createElement('article');
    let publicAssestsAllInput = document.createElement('input');
    let publicAssestsAllLabel = document.createElement('label');
    let publicAssestsAllExpandBtn = document.createElement('button');
    let publicAssestsSubsets = document.createElement('article');
    let fireInput = document.createElement('input');
    let fireLegend = document.createElement('span');
    let fireLabel = document.createElement('label');
    let fireBox = document.createElement('div');
    let policeInput = document.createElement('input');
    let policeLegend = document.createElement('span');
    let policeLabel = document.createElement('label');
    let policeBox = document.createElement('div');
    let parksInput = document.createElement('input');
    let parksLegend = document.createElement('span');
    let parksLabel = document.createElement('label');
    let parksBox = document.createElement('div');
    publicAssests.className ='parent-filter-container';
    publicAssestsAllInput.type = 'checkbox';
    publicAssestsAllInput.value = 'fire-stations,police-stations,parks-fill,parks-line'
    publicAssestsAllInput.id = 'publicAssests-all';
    publicAssestsAllInput.name = 'publicAssests-data'; 
    if(_filterPanel.app.filters.includes('publicAssests-all')){
      publicAssestsAllInput.checked = true;
    }else{
      publicAssestsAllInput.checked = false;
    }
    publicAssestsAllInput.className = 'parent-filter';
    publicAssestsAllLabel.innerText = 'Public Assets';
    publicAssestsAllLabel.setAttribute('for', 'publicAssests-all');
    publicAssestsAllExpandBtn.type = 'expand';
    publicAssestsAllInput.addEventListener('change', (ev)=>{
      _filterPanel.updateFilters(ev, _filterPanel);
    });
    if(_filterPanel.expansion.publicAssests){
        publicAssestsAllExpandBtn.innerHTML = '<i class="fas fa-minus"></i>';
    }else{
        publicAssestsAllExpandBtn.innerHTML = '<i class="fas fa-plus"></i>';
    }
    publicAssestsAllExpandBtn.addEventListener('click', (ev)=>{
        (_filterPanel.expansion.publicAssests) ? _filterPanel.expansion.publicAssests = false : _filterPanel.expansion.publicAssests = true;
        _filterPanel.removeForm(_filterPanel.container);
        _filterPanel.buidlForm(_filterPanel.container, _filterPanel);
    });
    if(_filterPanel.expansion.publicAssests){
      publicAssestsSubsets.className = 'filter-subset active';
    }else{
      publicAssestsSubsets.className = 'filter-subset';
    }

    // fire stations
    fireInput.type = 'checkbox';
    fireInput.name = 'publicAssests-data';
    fireInput.id = 'fire-stations';
    fireInput.value = 'fire-stations';
    if(_filterPanel.app.filters.includes('fire-stations')){
      fireInput.checked = true;
    }else{
      fireInput.checked = false;
    }
    fireInput.addEventListener('change', (ev)=>{
      _filterPanel.updateFilters(ev, _filterPanel);
    });
    fireLabel.innerText = 'Fire Stations';
    fireLabel.setAttribute('for', 'fire-stations');
    fireLegend.className = 'circle fire';
    fireLabel.appendChild(fireLegend);
    fireBox.appendChild(fireInput);
    fireBox.appendChild(fireLabel);
    publicAssestsSubsets.appendChild(fireBox);

    // police stations
    policeInput.type = 'checkbox';
    policeInput.name = 'publicAssests-data';
    policeInput.id = 'police-stations';
    policeInput.value = 'police-stations';
    if(_filterPanel.app.filters.includes('police-stations')){
      policeInput.checked = true;
    }else{
      policeInput.checked = false;
    }
    policeInput.addEventListener('change', (ev)=>{
      _filterPanel.updateFilters(ev, _filterPanel);
    });
    policeLabel.innerText = 'Police Stations';
    policeLabel.setAttribute('for', 'police-stations');
    policeLegend.className = 'circle police';
    policeLabel.appendChild(policeLegend);
    policeBox.appendChild(policeInput);
    policeBox.appendChild(policeLabel);
    publicAssestsSubsets.appendChild(policeBox);

    // active parks
    parksInput.type = 'checkbox';
    parksInput.name = 'publicAssests-data';
    parksInput.id = 'active-parks';
    parksInput.value = 'parks-fill,parks-line';
    if(_filterPanel.app.filters.includes('parks-fill')){
      parksInput.checked = true;
    }else{
      parksInput.checked = false;
    }
    parksInput.addEventListener('change', (ev)=>{
      _filterPanel.updateFilters(ev, _filterPanel);
    });
    parksLabel.innerText = 'Active Parks';
    parksLabel.setAttribute('for', 'active-parks');
    parksLegend.className = 'square parks';
    parksLabel.appendChild(parksLegend);
    parksBox.appendChild(parksInput);
    parksBox.appendChild(parksLabel);
    publicAssestsSubsets.appendChild(parksBox);

    publicAssests.appendChild(publicAssestsAllInput);
    publicAssests.appendChild(publicAssestsAllLabel);
    publicAssests.appendChild(publicAssestsAllExpandBtn);
    _filterPanel.form.appendChild(publicAssests);
    _filterPanel.form.appendChild(publicAssestsSubsets);

    // ========= Create planning and housing sections =========
    let planningHousing = document.createElement('article');
    let planningHousingAllInput = document.createElement('input');
    let planningHousingAllLabel = document.createElement('label');
    let planningHousingAllExpandBtn = document.createElement('button');
    let planningHousingSubsets = document.createElement('article');
    let oppZonesInput = document.createElement('input');
    let oppZonesLegend = document.createElement('span');
    let oppZonesLabel = document.createElement('label');
    let oppZonesBox = document.createElement('div');
    let snfInput = document.createElement('input');
    let snfLegend = document.createElement('span');
    let snfLabel = document.createElement('label');
    let snfBox = document.createElement('div');
    let tmahInput = document.createElement('input');
    let tmahLegend = document.createElement('span');
    let tmahLabel = document.createElement('label');
    let tmahBox = document.createElement('div');
    planningHousing.className ='parent-filter-container';
    planningHousingAllInput.type = 'checkbox';
    planningHousingAllInput.value = 'opp-zones-fill,opp-zones-line,snf-fill,snf-line,tmah-fill,tmah-line'
    planningHousingAllInput.id = 'planningHousing-all';
    planningHousingAllInput.name = 'planningHousing-data'; 
    if(_filterPanel.app.filters.includes('planningHousing-all')){
      planningHousingAllInput.checked = true;
    }else{
      planningHousingAllInput.checked = false;
    }
    planningHousingAllInput.className = 'parent-filter';
    planningHousingAllLabel.innerText = 'Planning and Housing';
    planningHousingAllLabel.setAttribute('for', 'planningHousing-all');
    planningHousingAllExpandBtn.type = 'expand';
    planningHousingAllInput.addEventListener('change', (ev)=>{
      _filterPanel.updateFilters(ev, _filterPanel);
    });
    if(_filterPanel.expansion.planningHousing){
        planningHousingAllExpandBtn.innerHTML = '<i class="fas fa-minus"></i>';
    }else{
        planningHousingAllExpandBtn.innerHTML = '<i class="fas fa-plus"></i>';
    }
    planningHousingAllExpandBtn.addEventListener('click', (ev)=>{
        (_filterPanel.expansion.planningHousing) ? _filterPanel.expansion.planningHousing = false : _filterPanel.expansion.planningHousing = true;
        _filterPanel.removeForm(_filterPanel.container);
        _filterPanel.buidlForm(_filterPanel.container, _filterPanel);
    });
    if(_filterPanel.expansion.planningHousing){
      planningHousingSubsets.className = 'filter-subset active';
    }else{
      planningHousingSubsets.className = 'filter-subset';
    }

    // Opportunity zones
    oppZonesInput.type = 'checkbox';
    oppZonesInput.name = 'trans-data';
    oppZonesInput.id = 'opp-zones';
    oppZonesInput.value = 'opp-zones-fill,opp-zones-line';
    if(_filterPanel.app.filters.includes('opp-zones-fill')){
      oppZonesInput.checked = true;
    }else{
      oppZonesInput.checked = false;
    }
    oppZonesInput.addEventListener('change', (ev)=>{
      _filterPanel.updateFilters(ev, _filterPanel);
    });
    oppZonesLabel.innerText = 'Opportunity Zones';
    oppZonesLabel.setAttribute('for', 'opp-zones');
    oppZonesLegend.className = 'square opp-zones';
    oppZonesLabel.appendChild(oppZonesLegend);
    oppZonesBox.appendChild(oppZonesInput);
    oppZonesBox.appendChild(oppZonesLabel);
    planningHousingSubsets.appendChild(oppZonesBox);

    // Strategic Neighborhoods
    snfInput.type = 'checkbox';
    snfInput.name = 'trans-data';
    snfInput.id = 'snf';
    snfInput.value = 'snf-fill,snf-line';
    if(_filterPanel.app.filters.includes('snf-fill')){
      snfInput.checked = true;
    }else{
      snfInput.checked = false;
    }
    snfInput.addEventListener('change', (ev)=>{
      _filterPanel.updateFilters(ev, _filterPanel);
    });
    snfLabel.innerText = 'Strategic Neighborhood Fund';
    snfLabel.setAttribute('for', 'snf');
    snfLegend.className = 'square snf';
    snfLabel.appendChild(snfLegend);
    snfBox.appendChild(snfInput);
    snfBox.appendChild(snfLabel);
    planningHousingSubsets.appendChild(snfBox);

    // Targeted Multifamily Housing Areas
    tmahInput.type = 'checkbox';
    tmahInput.name = 'trans-data';
    tmahInput.id = 'tmah';
    tmahInput.value = 'tmah-fill,tmah-line';
    if(_filterPanel.app.filters.includes('tmah-fill')){
      tmahInput.checked = true;
    }else{
      tmahInput.checked = false;
    }
    tmahInput.addEventListener('change', (ev)=>{
      _filterPanel.updateFilters(ev, _filterPanel);
    });
    tmahLabel.innerText = 'Targeted Multifamily Housing Areas';
    tmahLabel.setAttribute('for', 'tmah');
    tmahLegend.className = 'square tmah';
    tmahLabel.appendChild(tmahLegend);
    tmahBox.appendChild(tmahInput);
    tmahBox.appendChild(tmahLabel);
    planningHousingSubsets.appendChild(tmahBox);

    planningHousing.appendChild(planningHousingAllInput);
    planningHousing.appendChild(planningHousingAllLabel);
    planningHousing.appendChild(planningHousingAllExpandBtn);
    _filterPanel.form.appendChild(planningHousing);
    _filterPanel.form.appendChild(planningHousingSubsets);

    // ======= Create transportation section elemets ============
    let transportation = document.createElement('article');
    let transportationAllInput = document.createElement('input');
    let transportationAllLabel = document.createElement('label');
    let transportationAllExpandBtn = document.createElement('button');
    let transportationSubsets = document.createElement('article');
    let qLineInput = document.createElement('input');
    let qLineLegend = document.createElement('span');
    let qLineLabel = document.createElement('label');
    let qLineBox = document.createElement('div');
    let smartBusInput = document.createElement('input');
    let smartBusLegend = document.createElement('span');
    let smartBusLabel = document.createElement('label');
    let smartBusBox = document.createElement('div');
    let pMoverInput = document.createElement('input');
    let pMoverLegend = document.createElement('span');
    let pMoverLabel = document.createElement('label');
    let pMoverBox = document.createElement('div');
    let MoGoInput = document.createElement('input');
    let MoGoLegend = document.createElement('span');
    let MoGoLabel = document.createElement('label');
    let MoGoBox = document.createElement('div');
    transportation.className ='parent-filter-container';
    transportationAllInput.type = 'checkbox';
    transportationAllInput.value = 'smartroutes,qlineroute,qlinestops,peoplemover,mogobikes'
    transportationAllInput.id = 'transportation-all';
    transportationAllInput.name = 'trans-data';
    if(_filterPanel.app.filters.includes('transportation-all')){
      transportationAllInput.checked = true;
    }else{
      transportationAllInput.checked = false;
    }
    transportationAllInput.className = 'parent-filter';
    transportationAllLabel.innerText = 'Transportation';
    transportationAllLabel.setAttribute('for', 'transportation-all');
    transportationAllExpandBtn.type = 'expand';
    transportationAllInput.addEventListener('change', (ev)=>{
      _filterPanel.updateFilters(ev, _filterPanel);
    });
    if(_filterPanel.expansion.transportation){
        transportationAllExpandBtn.innerHTML = '<i class="fas fa-minus"></i>';
    }else{
        transportationAllExpandBtn.innerHTML = '<i class="fas fa-plus"></i>';
    }
    transportationAllExpandBtn.addEventListener('click', (ev)=>{
        (_filterPanel.expansion.transportation) ? _filterPanel.expansion.transportation = false : _filterPanel.expansion.transportation = true;
        _filterPanel.removeForm(_filterPanel.container);
        _filterPanel.buidlForm(_filterPanel.container, _filterPanel);
    });
    if(_filterPanel.expansion.transportation){
      transportationSubsets.className = 'filter-subset active';
    }else{
      transportationSubsets.className = 'filter-subset';
    }
    // QLine
    qLineInput.type = 'checkbox';
    qLineInput.name = 'trans-data';
    qLineInput.id = 'qlineroute';
    qLineInput.value = 'qlineroute,qlinestops';
    if(_filterPanel.app.filters.includes('qlineroute')){
      qLineInput.checked = true;
    }else{
      qLineInput.checked = false;
    }
    qLineInput.addEventListener('change', (ev)=>{
      _filterPanel.updateFilters(ev, _filterPanel);
    });
    qLineLabel.innerText = 'Q-Line';
    qLineLabel.setAttribute('for', 'qlineroute');
    qLineLegend.className = 'line qline';
    qLineLabel.appendChild(qLineLegend);
    qLineBox.appendChild(qLineInput);
    qLineBox.appendChild(qLineLabel);
    transportationSubsets.appendChild(qLineBox);
    // Smart buses
    smartBusInput.type = 'checkbox';
    smartBusInput.name = 'trans-data';
    smartBusInput.id = 'smartroutes';
    smartBusInput.value = 'smartroutes';
    if(_filterPanel.app.filters.includes('smartroutes')){
      smartBusInput.checked = true;
    }else{
      smartBusInput.checked = false;
    }
    smartBusInput.addEventListener('change', (ev)=>{
      _filterPanel.updateFilters(ev, _filterPanel);
    });
    smartBusLabel.innerText = 'Smart Buses';
    smartBusLabel.setAttribute('for', 'smartroutes');
    smartBusLegend.className = 'line smart-bus';
    smartBusLabel.appendChild(smartBusLegend);
    smartBusBox.appendChild(smartBusInput);
    smartBusBox.appendChild(smartBusLabel);
    transportationSubsets.appendChild(smartBusBox);
    // People mover
    pMoverInput.type = 'checkbox';
    pMoverInput.name = 'trans-data';
    pMoverInput.id = 'peoplemover';
    pMoverInput.value = 'peoplemover';
    if(_filterPanel.app.filters.includes('peoplemover')){
      pMoverInput.checked = true;
    }else{
      pMoverInput.checked = false;
    }
    pMoverInput.addEventListener('change', (ev)=>{
      _filterPanel.updateFilters(ev, _filterPanel);
    });
    pMoverLabel.innerText = 'People Mover';
    pMoverLabel.setAttribute('for', 'peoplemover');
    pMoverLegend.className = 'line p-mover';
    pMoverLabel.appendChild(pMoverLegend);
    pMoverBox.appendChild(pMoverInput);
    pMoverBox.appendChild(pMoverLabel);
    transportationSubsets.appendChild(pMoverBox);
     // MoGo
     MoGoInput.type = 'checkbox';
     MoGoInput.name = 'trans-data';
     MoGoInput.id = 'mogobikes';
     MoGoInput.value = 'mogobikes';
     if(_filterPanel.app.filters.includes('mogobikes')){
       MoGoInput.checked = true;
     }else{
       MoGoInput.checked = false;
     }
     MoGoInput.addEventListener('change', (ev)=>{
       _filterPanel.updateFilters(ev, _filterPanel);
     });
     MoGoLabel.innerText = 'MoGo Bike Station';
     MoGoLabel.setAttribute('for', 'mogobikes');
     MoGoLegend.className = 'circle mogo';
     MoGoLabel.appendChild(MoGoLegend);
     MoGoBox.appendChild(MoGoInput);
     MoGoBox.appendChild(MoGoLabel);
     transportationSubsets.appendChild(MoGoBox);
   
    transportation.appendChild(transportationAllInput);
    transportation.appendChild(transportationAllLabel);
    transportation.appendChild(transportationAllExpandBtn);
    _filterPanel.form.appendChild(transportation);
    _filterPanel.form.appendChild(transportationSubsets);

    // ========= Create residential zoning sections =========
    let zoning = document.createElement('article');
    let zoningAllInput = document.createElement('input');
    let zoningAllLabel = document.createElement('label');
    let zoningAllExpandBtn = document.createElement('button');
    let zoningSubsets = document.createElement('article');
    let r1Input = document.createElement('input');
    let r1Legend = document.createElement('span');
    let r1Label = document.createElement('label');
    let r1Box = document.createElement('div');
    let r2Input = document.createElement('input');
    let r2Legend = document.createElement('span');
    let r2Label = document.createElement('label');
    let r2Box = document.createElement('div');
    let r3Input = document.createElement('input');
    let r3Legend = document.createElement('span');
    let r3Label = document.createElement('label');
    let r3Box = document.createElement('div');
    let r4Input = document.createElement('input');
    let r4Legend = document.createElement('span');
    let r4Label = document.createElement('label');
    let r4Box = document.createElement('div');
    let r5Input = document.createElement('input');
    let r5Legend = document.createElement('span');
    let r5Label = document.createElement('label');
    let r5Box = document.createElement('div');
    let r6Input = document.createElement('input');
    let r6Legend = document.createElement('span');
    let r6Label = document.createElement('label');
    let r6Box = document.createElement('div');
    zoning.className ='parent-filter-container';
    zoningAllInput.type = 'checkbox';
    zoningAllInput.value = 'R1,R2,R3,R4,R5,R6'
    zoningAllInput.id = 'r-zoning-all';
    zoningAllInput.name = 'r-zoning-data'; 
    if(_filterPanel.app.filters.includes('r-zoning-all')){
      zoningAllInput.checked = true;
    }else{
      zoningAllInput.checked = false;
    }
    zoningAllInput.className = 'parent-filter';
    zoningAllLabel.innerText = 'Residential Zoning';
    zoningAllLabel.setAttribute('for', 'r-zoning-all');
    zoningAllExpandBtn.type = 'expand';
    zoningAllInput.addEventListener('change', (ev)=>{
      _filterPanel.updateFilters(ev, _filterPanel);
    });
    if(_filterPanel.expansion.zoning){
        zoningAllExpandBtn.innerHTML = '<i class="fas fa-minus"></i>';
    }else{
        zoningAllExpandBtn.innerHTML = '<i class="fas fa-plus"></i>';
    }
    zoningAllExpandBtn.addEventListener('click', (ev)=>{
        (_filterPanel.expansion.zoning) ? _filterPanel.expansion.zoning = false : _filterPanel.expansion.zoning = true;
        _filterPanel.removeForm(_filterPanel.container);
        _filterPanel.buidlForm(_filterPanel.container, _filterPanel);
    });
    if(_filterPanel.expansion.zoning){
      zoningSubsets.className = 'filter-subset active';
    }else{
      zoningSubsets.className = 'filter-subset';
    }

    // R1 zoning
    r1Input.type = 'checkbox';
    r1Input.name = 'r-zoning-data';
    r1Input.id = 'R1';
    r1Input.value = 'R1';
    if(_filterPanel.app.filters.includes('R1')){
      r1Input.checked = true;
    }else{
      r1Input.checked = false;
    }
    r1Input.addEventListener('change', (ev)=>{
      _filterPanel.updateFilters(ev, _filterPanel);
    });
    r1Label.innerText = 'R1 - Zoning';
    r1Label.setAttribute('for', 'R1');
    r1Legend.className = 'line R1';
    r1Label.appendChild(r1Legend);
    r1Box.appendChild(r1Input);
    r1Box.appendChild(r1Label);
    zoningSubsets.appendChild(r1Box);

    // R2 zoning
    r2Input.type = 'checkbox';
    r2Input.name = 'r-zoning-data';
    r2Input.id = 'R2';
    r2Input.value = 'R2';
    if(_filterPanel.app.filters.includes('R2')){
      r2Input.checked = true;
    }else{
      r2Input.checked = false;
    }
    r2Input.addEventListener('change', (ev)=>{
      _filterPanel.updateFilters(ev, _filterPanel);
    });
    r2Label.innerText = 'R2 - Zoning';
    r2Label.setAttribute('for', 'R2');
    r2Legend.className = 'line R2';
    r2Label.appendChild(r2Legend);
    r2Box.appendChild(r2Input);
    r2Box.appendChild(r2Label);
    zoningSubsets.appendChild(r2Box);

    // R3 zoning
    r3Input.type = 'checkbox';
    r3Input.name = 'r-zoning-data';
    r3Input.id = 'R3';
    r3Input.value = 'R3';
    if(_filterPanel.app.filters.includes('R3')){
      r3Input.checked = true;
    }else{
      r3Input.checked = false;
    }
    r3Input.addEventListener('change', (ev)=>{
      _filterPanel.updateFilters(ev, _filterPanel);
    });
    r3Label.innerText = 'R3 - Zoning';
    r3Label.setAttribute('for', 'R3');
    r3Legend.className = 'line R3';
    r3Label.appendChild(r3Legend);
    r3Box.appendChild(r3Input);
    r3Box.appendChild(r3Label);
    zoningSubsets.appendChild(r3Box);

    // R4 zoning
    r4Input.type = 'checkbox';
    r4Input.name = 'r-zoning-data';
    r4Input.id = 'R4';
    r4Input.value = 'R4';
    if(_filterPanel.app.filters.includes('R4')){
      r4Input.checked = true;
    }else{
      r4Input.checked = false;
    }
    r4Input.addEventListener('change', (ev)=>{
      _filterPanel.updateFilters(ev, _filterPanel);
    });
    r4Label.innerText = 'R4 - Zoning';
    r4Label.setAttribute('for', 'R4');
    r4Legend.className = 'line R4';
    r4Label.appendChild(r4Legend);
    r4Box.appendChild(r4Input);
    r4Box.appendChild(r4Label);
    zoningSubsets.appendChild(r4Box);

    // R5 zoning
    r5Input.type = 'checkbox';
    r5Input.name = 'r-zoning-data';
    r5Input.id = 'R5';
    r5Input.value = 'R5';
    if(_filterPanel.app.filters.includes('R5')){
      r5Input.checked = true;
    }else{
      r5Input.checked = false;
    }
    r5Input.addEventListener('change', (ev)=>{
      _filterPanel.updateFilters(ev, _filterPanel);
    });
    r5Label.innerText = 'R5 - Zoning';
    r5Label.setAttribute('for', 'R5');
    r5Legend.className = 'line R5';
    r5Label.appendChild(r5Legend);
    r5Box.appendChild(r5Input);
    r5Box.appendChild(r5Label);
    zoningSubsets.appendChild(r5Box);

    // R6 zoning
    r6Input.type = 'checkbox';
    r6Input.name = 'r-zoning-data';
    r6Input.id = 'R6';
    r6Input.value = 'R6';
    if(_filterPanel.app.filters.includes('R6')){
      r6Input.checked = true;
    }else{
      r6Input.checked = false;
    }
    r6Input.addEventListener('change', (ev)=>{
      _filterPanel.updateFilters(ev, _filterPanel);
    });
    r6Label.innerText = 'R6 - Zoning';
    r6Label.setAttribute('for', 'R6');
    r6Legend.className = 'line R6';
    r6Label.appendChild(r6Legend);
    r6Box.appendChild(r6Input);
    r6Box.appendChild(r6Label);
    zoningSubsets.appendChild(r6Box);

    zoning.appendChild(zoningAllInput);
    zoning.appendChild(zoningAllLabel);
    zoning.appendChild(zoningAllExpandBtn);
    _filterPanel.form.appendChild(zoning);
    _filterPanel.form.appendChild(zoningSubsets);

    // ========= Create business zoning sections =========
    let zoningB = document.createElement('article');
    let zoningBAllInput = document.createElement('input');
    let zoningBAllLabel = document.createElement('label');
    let zoningBAllExpandBtn = document.createElement('button');
    let zoningBSubsets = document.createElement('article');
    let b1Input = document.createElement('input');
    let b1Legend = document.createElement('span');
    let b1Label = document.createElement('label');
    let b1Box = document.createElement('div');
    let b2Input = document.createElement('input');
    let b2Legend = document.createElement('span');
    let b2Label = document.createElement('label');
    let b2Box = document.createElement('div');
    let b3Input = document.createElement('input');
    let b3Legend = document.createElement('span');
    let b3Label = document.createElement('label');
    let b3Box = document.createElement('div');
    let b4Input = document.createElement('input');
    let b4Legend = document.createElement('span');
    let b4Label = document.createElement('label');
    let b4Box = document.createElement('div');
    let b5Input = document.createElement('input');
    let b5Legend = document.createElement('span');
    let b5Label = document.createElement('label');
    let b5Box = document.createElement('div');
    let b6Input = document.createElement('input');
    let b6Legend = document.createElement('span');
    let b6Label = document.createElement('label');
    let b6Box = document.createElement('div');
    zoningB.className ='parent-filter-container';
    zoningBAllInput.type = 'checkbox';
    zoningBAllInput.value = 'B1,B2,B3,B4,B5,B6'
    zoningBAllInput.id = 'b-zoning-all';
    zoningBAllInput.name = 'b-zoning-data'; 
    if(_filterPanel.app.filters.includes('b-zoning-all')){
      zoningBAllInput.checked = true;
    }else{
      zoningBAllInput.checked = false;
    }
    zoningBAllInput.className = 'parent-filter';
    zoningBAllLabel.innerText = 'Business Zoning';
    zoningBAllLabel.setAttribute('for', 'b-zoning-all');
    zoningBAllExpandBtn.type = 'expand';
    zoningBAllInput.addEventListener('change', (ev)=>{
      _filterPanel.updateFilters(ev, _filterPanel);
    });
    if(_filterPanel.expansion.zoningB){
        zoningBAllExpandBtn.innerHTML = '<i class="fas fa-minus"></i>';
    }else{
        zoningBAllExpandBtn.innerHTML = '<i class="fas fa-plus"></i>';
    }
    zoningBAllExpandBtn.addEventListener('click', (ev)=>{
        (_filterPanel.expansion.zoningB) ? _filterPanel.expansion.zoningB = false : _filterPanel.expansion.zoningB = true;
        _filterPanel.removeForm(_filterPanel.container);
        _filterPanel.buidlForm(_filterPanel.container, _filterPanel);
    });
    if(_filterPanel.expansion.zoningB){
      zoningBSubsets.className = 'filter-subset active';
    }else{
      zoningBSubsets.className = 'filter-subset';
    }

    // B1 zoning
    b1Input.type = 'checkbox';
    b1Input.name = 'b-zoning-data';
    b1Input.id = 'B1';
    b1Input.value = 'B1';
    if(_filterPanel.app.filters.includes('B1')){
      b1Input.checked = true;
    }else{
      b1Input.checked = false;
    }
    b1Input.addEventListener('change', (ev)=>{
      _filterPanel.updateFilters(ev, _filterPanel);
    });
    b1Label.innerText = 'B1 - Zoning';
    b1Label.setAttribute('for', 'B1');
    b1Legend.className = 'line B1';
    b1Label.appendChild(b1Legend);
    b1Box.appendChild(b1Input);
    b1Box.appendChild(b1Label);
    zoningBSubsets.appendChild(b1Box);

    // B2 zoning
    b2Input.type = 'checkbox';
    b2Input.name = 'b-zoning-data';
    b2Input.id = 'B2';
    b2Input.value = 'B2';
    if(_filterPanel.app.filters.includes('B2')){
      b2Input.checked = true;
    }else{
      b2Input.checked = false;
    }
    b2Input.addEventListener('change', (ev)=>{
      _filterPanel.updateFilters(ev, _filterPanel);
    });
    b2Label.innerText = 'B2 - Zoning';
    b2Label.setAttribute('for', 'B2');
    b2Legend.className = 'line B2';
    b2Label.appendChild(b2Legend);
    b2Box.appendChild(b2Input);
    b2Box.appendChild(b2Label);
    zoningBSubsets.appendChild(b2Box);

    // B3 zoning
    b3Input.type = 'checkbox';
    b3Input.name = 'b-zoning-data';
    b3Input.id = 'B3';
    b3Input.value = 'B3';
    if(_filterPanel.app.filters.includes('B3')){
      b3Input.checked = true;
    }else{
      b3Input.checked = false;
    }
    b3Input.addEventListener('change', (ev)=>{
      _filterPanel.updateFilters(ev, _filterPanel);
    });
    b3Label.innerText = 'B3 - Zoning';
    b3Label.setAttribute('for', 'B3');
    b3Legend.className = 'line B3';
    b3Label.appendChild(b3Legend);
    b3Box.appendChild(b3Input);
    b3Box.appendChild(b3Label);
    zoningBSubsets.appendChild(b3Box);

    // B4 zoning
    b4Input.type = 'checkbox';
    b4Input.name = 'b-zoning-data';
    b4Input.id = 'B4';
    b4Input.value = 'B4';
    if(_filterPanel.app.filters.includes('B4')){
      b4Input.checked = true;
    }else{
      b4Input.checked = false;
    }
    b4Input.addEventListener('change', (ev)=>{
      _filterPanel.updateFilters(ev, _filterPanel);
    });
    b4Label.innerText = 'B4 - Zoning';
    b4Label.setAttribute('for', 'B4');
    b4Legend.className = 'line B4';
    b4Label.appendChild(b4Legend);
    b4Box.appendChild(b4Input);
    b4Box.appendChild(b4Label);
    zoningBSubsets.appendChild(b4Box);

    // B5 zoning
    b5Input.type = 'checkbox';
    b5Input.name = 'b-zoning-data';
    b5Input.id = 'B5';
    b5Input.value = 'B5';
    if(_filterPanel.app.filters.includes('B5')){
      b5Input.checked = true;
    }else{
      b5Input.checked = false;
    }
    b5Input.addEventListener('change', (ev)=>{
      _filterPanel.updateFilters(ev, _filterPanel);
    });
    b5Label.innerText = 'B5 - Zoning';
    b5Label.setAttribute('for', 'B5');
    b5Legend.className = 'line B5';
    b5Label.appendChild(b5Legend);
    b5Box.appendChild(b5Input);
    b5Box.appendChild(b5Label);
    zoningBSubsets.appendChild(b5Box);

    // B6 zoning
    b6Input.type = 'checkbox';
    b6Input.name = 'b-zoning-data';
    b6Input.id = 'B6';
    b6Input.value = 'B6';
    if(_filterPanel.app.filters.includes('B6')){
      b6Input.checked = true;
    }else{
      b6Input.checked = false;
    }
    b6Input.addEventListener('change', (ev)=>{
      _filterPanel.updateFilters(ev, _filterPanel);
    });
    b6Label.innerText = 'B6 - Zoning';
    b6Label.setAttribute('for', 'B6');
    b6Legend.className = 'line B6';
    b6Label.appendChild(b6Legend);
    b6Box.appendChild(b6Input);
    b6Box.appendChild(b6Label);
    zoningBSubsets.appendChild(b6Box);

    zoningB.appendChild(zoningBAllInput);
    zoningB.appendChild(zoningBAllLabel);
    zoningB.appendChild(zoningBAllExpandBtn);
    _filterPanel.form.appendChild(zoningB);
    _filterPanel.form.appendChild(zoningBSubsets);

    // ========= Create industrial zoning sections =========
    let zoningM = document.createElement('article');
    let zoningMAllInput = document.createElement('input');
    let zoningMAllLabel = document.createElement('label');
    let zoningMAllExpandBtn = document.createElement('button');
    let zoningMSubsets = document.createElement('article');
    let m1Input = document.createElement('input');
    let m1Legend = document.createElement('span');
    let m1Label = document.createElement('label');
    let m1Box = document.createElement('div');
    let m2Input = document.createElement('input');
    let m2Legend = document.createElement('span');
    let m2Label = document.createElement('label');
    let m2Box = document.createElement('div');
    let m3Input = document.createElement('input');
    let m3Legend = document.createElement('span');
    let m3Label = document.createElement('label');
    let m3Box = document.createElement('div');
    let m4Input = document.createElement('input');
    let m4Legend = document.createElement('span');
    let m4Label = document.createElement('label');
    let m4Box = document.createElement('div');
    let m5Input = document.createElement('input');
    let m5Legend = document.createElement('span');
    let m5Label = document.createElement('label');
    let m5Box = document.createElement('div');
    zoningM.className ='parent-filter-container';
    zoningMAllInput.type = 'checkbox';
    zoningMAllInput.value = 'M1,M2,M3,M4,M5'
    zoningMAllInput.id = 'm-zoning-all';
    zoningMAllInput.name = 'm-zoning-data'; 
    if(_filterPanel.app.filters.includes('m-zoning-all')){
      zoningMAllInput.checked = true;
    }else{
      zoningMAllInput.checked = false;
    }
    zoningMAllInput.className = 'parent-filter';
    zoningMAllLabel.innerText = 'Industrial Zoning';
    zoningMAllLabel.setAttribute('for', 'm-zoning-all');
    zoningMAllExpandBtn.type = 'expand';
    zoningMAllInput.addEventListener('change', (ev)=>{
      _filterPanel.updateFilters(ev, _filterPanel);
    });
    if(_filterPanel.expansion.zoningM){
        zoningMAllExpandBtn.innerHTML = '<i class="fas fa-minus"></i>';
    }else{
        zoningMAllExpandBtn.innerHTML = '<i class="fas fa-plus"></i>';
    }
    zoningMAllExpandBtn.addEventListener('click', (ev)=>{
        (_filterPanel.expansion.zoningM) ? _filterPanel.expansion.zoningM = false : _filterPanel.expansion.zoningM = true;
        _filterPanel.removeForm(_filterPanel.container);
        _filterPanel.buidlForm(_filterPanel.container, _filterPanel);
    });
    if(_filterPanel.expansion.zoningM){
      zoningMSubsets.className = 'filter-subset active';
    }else{
      zoningMSubsets.className = 'filter-subset';
    }

    // M1 zoning
    m1Input.type = 'checkbox';
    m1Input.name = 'm-zoning-data';
    m1Input.id = 'M1';
    m1Input.value = 'M1';
    if(_filterPanel.app.filters.includes('M1')){
      m1Input.checked = true;
    }else{
      m1Input.checked = false;
    }
    m1Input.addEventListener('change', (ev)=>{
      _filterPanel.updateFilters(ev, _filterPanel);
    });
    m1Label.innerText = 'M1 - Zoning';
    m1Label.setAttribute('for', 'M1');
    m1Legend.className = 'line M1';
    m1Label.appendChild(m1Legend);
    m1Box.appendChild(m1Input);
    m1Box.appendChild(m1Label);
    zoningMSubsets.appendChild(m1Box);

    // M2 zoning
    m2Input.type = 'checkbox';
    m2Input.name = 'm-zoning-data';
    m2Input.id = 'M2';
    m2Input.value = 'M2';
    if(_filterPanel.app.filters.includes('M2')){
      m2Input.checked = true;
    }else{
      m2Input.checked = false;
    }
    m2Input.addEventListener('change', (ev)=>{
      _filterPanel.updateFilters(ev, _filterPanel);
    });
    m2Label.innerText = 'M2 - Zoning';
    m2Label.setAttribute('for', 'M2');
    m2Legend.className = 'line M2';
    m2Label.appendChild(m2Legend);
    m2Box.appendChild(m2Input);
    m2Box.appendChild(m2Label);
    zoningMSubsets.appendChild(m2Box);

    // M3 zoning
    m3Input.type = 'checkbox';
    m3Input.name = 'm-zoning-data';
    m3Input.id = 'M3';
    m3Input.value = 'M3';
    if(_filterPanel.app.filters.includes('M3')){
      m3Input.checked = true;
    }else{
      m3Input.checked = false;
    }
    m3Input.addEventListener('change', (ev)=>{
      _filterPanel.updateFilters(ev, _filterPanel);
    });
    m3Label.innerText = 'M3 - Zoning';
    m3Label.setAttribute('for', 'M3');
    m3Legend.className = 'line M3';
    m3Label.appendChild(m3Legend);
    m3Box.appendChild(m3Input);
    m3Box.appendChild(m3Label);
    zoningMSubsets.appendChild(m3Box);

    // M4 zoning
    m4Input.type = 'checkbox';
    m4Input.name = 'm-zoning-data';
    m4Input.id = 'M4';
    m4Input.value = 'M4';
    if(_filterPanel.app.filters.includes('M4')){
      m4Input.checked = true;
    }else{
      m4Input.checked = false;
    }
    m4Input.addEventListener('change', (ev)=>{
      _filterPanel.updateFilters(ev, _filterPanel);
    });
    m4Label.innerText = 'M4 - Zoning';
    m4Label.setAttribute('for', 'M4');
    m4Legend.className = 'line M4';
    m4Label.appendChild(m4Legend);
    m4Box.appendChild(m4Input);
    m4Box.appendChild(m4Label);
    zoningMSubsets.appendChild(m4Box);

    // M5 zoning
    m5Input.type = 'checkbox';
    m5Input.name = 'm-zoning-data';
    m5Input.id = 'M5';
    m5Input.value = 'M5';
    if(_filterPanel.app.filters.includes('M5')){
      m5Input.checked = true;
    }else{
      m5Input.checked = false;
    }
    m5Input.addEventListener('change', (ev)=>{
      _filterPanel.updateFilters(ev, _filterPanel);
    });
    m5Label.innerText = 'M5 - Zoning';
    m5Label.setAttribute('for', 'M5');
    m5Legend.className = 'line M5';
    m5Label.appendChild(m5Legend);
    m5Box.appendChild(m5Input);
    m5Box.appendChild(m5Label);
    zoningMSubsets.appendChild(m5Box);

    zoningM.appendChild(zoningMAllInput);
    zoningM.appendChild(zoningMAllLabel);
    zoningM.appendChild(zoningMAllExpandBtn);
    _filterPanel.form.appendChild(zoningM);
    _filterPanel.form.appendChild(zoningMSubsets);

    // ========= Create special zoning sections =========
    let zoningS = document.createElement('article');
    let zoningSAllInput = document.createElement('input');
    let zoningSAllLabel = document.createElement('label');
    let zoningSAllExpandBtn = document.createElement('button');
    let zoningSSubsets = document.createElement('article');
    let p1Input = document.createElement('input');
    let p1Legend = document.createElement('span');
    let p1Label = document.createElement('label');
    let p1Box = document.createElement('div');
    let pcInput = document.createElement('input');
    let pcLegend = document.createElement('span');
    let pcLabel = document.createElement('label');
    let pcBox = document.createElement('div');
    let pcaInput = document.createElement('input');
    let pcaLegend = document.createElement('span');
    let pcaLabel = document.createElement('label');
    let pcaBox = document.createElement('div');
    let pdInput = document.createElement('input');
    let pdLegend = document.createElement('span');
    let pdLabel = document.createElement('label');
    let pdBox = document.createElement('div');
    let prInput = document.createElement('input');
    let prLegend = document.createElement('span');
    let prLabel = document.createElement('label');
    let prBox = document.createElement('div');
    let sd1Input = document.createElement('input');
    let sd1Legend = document.createElement('span');
    let sd1Label = document.createElement('label');
    let sd1Box = document.createElement('div');
    let sd2Input = document.createElement('input');
    let sd2Legend = document.createElement('span');
    let sd2Label = document.createElement('label');
    let sd2Box = document.createElement('div');
    let sd3Input = document.createElement('input');
    let sd3Legend = document.createElement('span');
    let sd3Label = document.createElement('label');
    let sd3Box = document.createElement('div');
    let sd4Input = document.createElement('input');
    let sd4Legend = document.createElement('span');
    let sd4Label = document.createElement('label');
    let sd4Box = document.createElement('div');
    let sd5Input = document.createElement('input');
    let sd5Legend = document.createElement('span');
    let sd5Label = document.createElement('label');
    let sd5Box = document.createElement('div');
    let tmInput = document.createElement('input');
    let tmLegend = document.createElement('span');
    let tmLabel = document.createElement('label');
    let tmBox = document.createElement('div');
    let w5Input = document.createElement('input');
    let w5Legend = document.createElement('span');
    let w5Label = document.createElement('label');
    let w5Box = document.createElement('div');
    zoningS.className ='parent-filter-container';
    zoningSAllInput.type = 'checkbox';
    zoningSAllInput.value = 'P1,PC,PCA,PD,PR,SD1,SD2,SD3,SD4,SD5,TM,W5'
    zoningSAllInput.id = 's-zoning-all';
    zoningSAllInput.name = 's-zoning-data'; 
    if(_filterPanel.app.filters.includes('s-zoning-all')){
      zoningSAllInput.checked = true;
    }else{
      zoningSAllInput.checked = false;
    }
    zoningSAllInput.className = 'parent-filter';
    zoningSAllLabel.innerText = 'Special Zoning';
    zoningSAllLabel.setAttribute('for', 's-zoning-all');
    zoningSAllExpandBtn.type = 'expand';
    zoningSAllInput.addEventListener('change', (ev)=>{
      _filterPanel.updateFilters(ev, _filterPanel);
    });
    if(_filterPanel.expansion.zoningS){
        zoningSAllExpandBtn.innerHTML = '<i class="fas fa-minus"></i>';
    }else{
        zoningSAllExpandBtn.innerHTML = '<i class="fas fa-plus"></i>';
    }
    zoningSAllExpandBtn.addEventListener('click', (ev)=>{
        (_filterPanel.expansion.zoningS) ? _filterPanel.expansion.zoningS = false : _filterPanel.expansion.zoningS = true;
        _filterPanel.removeForm(_filterPanel.container);
        _filterPanel.buidlForm(_filterPanel.container, _filterPanel);
    });
    if(_filterPanel.expansion.zoningS){
      zoningSSubsets.className = 'filter-subset active';
    }else{
      zoningSSubsets.className = 'filter-subset';
    }

    // P1 zoning
    p1Input.type = 'checkbox';
    p1Input.name = 's-zoning-data';
    p1Input.id = 'P1';
    p1Input.value = 'P1';
    if(_filterPanel.app.filters.includes('P1')){
      p1Input.checked = true;
    }else{
      p1Input.checked = false;
    }
    p1Input.addEventListener('change', (ev)=>{
      _filterPanel.updateFilters(ev, _filterPanel);
    });
    p1Label.innerText = 'P1 - Zoning';
    p1Label.setAttribute('for', 'P1');
    p1Legend.className = 'line P1';
    p1Label.appendChild(p1Legend);
    p1Box.appendChild(p1Input);
    p1Box.appendChild(p1Label);
    zoningSSubsets.appendChild(p1Box);

    // PC zoning
    pcInput.type = 'checkbox';
    pcInput.name = 's-zoning-data';
    pcInput.id = 'PC';
    pcInput.value = 'PC';
    if(_filterPanel.app.filters.includes('PC')){
      pcInput.checked = true;
    }else{
      pcInput.checked = false;
    }
    pcInput.addEventListener('change', (ev)=>{
      _filterPanel.updateFilters(ev, _filterPanel);
    });
    pcLabel.innerText = 'PC - Zoning';
    pcLabel.setAttribute('for', 'PC');
    pcLegend.className = 'line PC';
    pcLabel.appendChild(pcLegend);
    pcBox.appendChild(pcInput);
    pcBox.appendChild(pcLabel);
    zoningSSubsets.appendChild(pcBox);

    // PCA zoning
    pcaInput.type = 'checkbox';
    pcaInput.name = 's-zoning-data';
    pcaInput.id = 'PCA';
    pcaInput.value = 'PCA';
    if(_filterPanel.app.filters.includes('PCA')){
      pcaInput.checked = true;
    }else{
      pcaInput.checked = false;
    }
    pcaInput.addEventListener('change', (ev)=>{
      _filterPanel.updateFilters(ev, _filterPanel);
    });
    pcaLabel.innerText = 'PCA - Zoning';
    pcaLabel.setAttribute('for', 'PCA');
    pcaLegend.className = 'line PCA';
    pcaLabel.appendChild(pcaLegend);
    pcaBox.appendChild(pcaInput);
    pcaBox.appendChild(pcaLabel);
    zoningSSubsets.appendChild(pcaBox);

    // PD zoning
    pdInput.type = 'checkbox';
    pdInput.name = 's-zoning-data';
    pdInput.id = 'PD';
    pdInput.value = 'PD';
    if(_filterPanel.app.filters.includes('PD')){
      pdInput.checked = true;
    }else{
      pdInput.checked = false;
    }
    pdInput.addEventListener('change', (ev)=>{
      _filterPanel.updateFilters(ev, _filterPanel);
    });
    pdLabel.innerText = 'PD - Zoning';
    pdLabel.setAttribute('for', 'PD');
    pdLegend.className = 'line PD';
    pdLabel.appendChild(pdLegend);
    pdBox.appendChild(pdInput);
    pdBox.appendChild(pdLabel);
    zoningSSubsets.appendChild(pdBox);

    // PR zoning
    prInput.type = 'checkbox';
    prInput.name = 's-zoning-data';
    prInput.id = 'PR';
    prInput.value = 'PR';
    if(_filterPanel.app.filters.includes('PR')){
      prInput.checked = true;
    }else{
      prInput.checked = false;
    }
    prInput.addEventListener('change', (ev)=>{
      _filterPanel.updateFilters(ev, _filterPanel);
    });
    prLabel.innerText = 'PR - Zoning';
    prLabel.setAttribute('for', 'PR');
    prLegend.className = 'line PR';
    prLabel.appendChild(prLegend);
    prBox.appendChild(prInput);
    prBox.appendChild(prLabel);
    zoningSSubsets.appendChild(prBox);

    // SD1 zoning
    sd1Input.type = 'checkbox';
    sd1Input.name = 's-zoning-data';
    sd1Input.id = 'SD1';
    sd1Input.value = 'SD1';
    if(_filterPanel.app.filters.includes('SD1')){
      sd1Input.checked = true;
    }else{
      sd1Input.checked = false;
    }
    sd1Input.addEventListener('change', (ev)=>{
      _filterPanel.updateFilters(ev, _filterPanel);
    });
    sd1Label.innerText = 'SD1 - Zoning';
    sd1Label.setAttribute('for', 'SD1');
    sd1Legend.className = 'line SD1';
    sd1Label.appendChild(sd1Legend);
    sd1Box.appendChild(sd1Input);
    sd1Box.appendChild(sd1Label);
    zoningSSubsets.appendChild(sd1Box);

    // SD2 zoning
    sd2Input.type = 'checkbox';
    sd2Input.name = 's-zoning-data';
    sd2Input.id = 'SD2';
    sd2Input.value = 'SD2';
    if(_filterPanel.app.filters.includes('SD2')){
      sd2Input.checked = true;
    }else{
      sd2Input.checked = false;
    }
    sd2Input.addEventListener('change', (ev)=>{
      _filterPanel.updateFilters(ev, _filterPanel);
    });
    sd2Label.innerText = 'SD2 - Zoning';
    sd2Label.setAttribute('for', 'SD2');
    sd2Legend.className = 'line SD2';
    sd2Label.appendChild(sd2Legend);
    sd2Box.appendChild(sd2Input);
    sd2Box.appendChild(sd2Label);
    zoningSSubsets.appendChild(sd2Box);

    // SD3 zoning
    sd3Input.type = 'checkbox';
    sd3Input.name = 's-zoning-data';
    sd3Input.id = 'SD3';
    sd3Input.value = 'SD3';
    if(_filterPanel.app.filters.includes('SD3')){
      sd3Input.checked = true;
    }else{
      sd3Input.checked = false;
    }
    sd3Input.addEventListener('change', (ev)=>{
      _filterPanel.updateFilters(ev, _filterPanel);
    });
    sd3Label.innerText = 'SD3 - Zoning';
    sd3Label.setAttribute('for', 'SD3');
    sd3Legend.className = 'line SD3';
    sd3Label.appendChild(sd3Legend);
    sd3Box.appendChild(sd3Input);
    sd3Box.appendChild(sd3Label);
    zoningSSubsets.appendChild(sd3Box);

    // SD4 zoning
    sd4Input.type = 'checkbox';
    sd4Input.name = 's-zoning-data';
    sd4Input.id = 'SD4';
    sd4Input.value = 'SD4';
    if(_filterPanel.app.filters.includes('SD4')){
      sd4Input.checked = true;
    }else{
      sd4Input.checked = false;
    }
    sd4Input.addEventListener('change', (ev)=>{
      _filterPanel.updateFilters(ev, _filterPanel);
    });
    sd4Label.innerText = 'SD4 - Zoning';
    sd4Label.setAttribute('for', 'SD4');
    sd4Legend.className = 'line SD4';
    sd4Label.appendChild(sd4Legend);
    sd4Box.appendChild(sd4Input);
    sd4Box.appendChild(sd4Label);
    zoningSSubsets.appendChild(sd4Box);

    // SD5 zoning
    sd5Input.type = 'checkbox';
    sd5Input.name = 's-zoning-data';
    sd5Input.id = 'SD5';
    sd5Input.value = 'SD5';
    if(_filterPanel.app.filters.includes('SD5')){
      sd5Input.checked = true;
    }else{
      sd5Input.checked = false;
    }
    sd5Input.addEventListener('change', (ev)=>{
      _filterPanel.updateFilters(ev, _filterPanel);
    });
    sd5Label.innerText = 'SD5 - Zoning';
    sd5Label.setAttribute('for', 'SD5');
    sd5Legend.className = 'line SD5';
    sd5Label.appendChild(sd5Legend);
    sd5Box.appendChild(sd5Input);
    sd5Box.appendChild(sd5Label);
    zoningSSubsets.appendChild(sd5Box);

    // TM zoning
    tmInput.type = 'checkbox';
    tmInput.name = 's-zoning-data';
    tmInput.id = 'TM';
    tmInput.value = 'TM';
    if(_filterPanel.app.filters.includes('TM')){
      tmInput.checked = true;
    }else{
      tmInput.checked = false;
    }
    tmInput.addEventListener('change', (ev)=>{
      _filterPanel.updateFilters(ev, _filterPanel);
    });
    tmLabel.innerText = 'TM - Zoning';
    tmLabel.setAttribute('for', 'TM');
    tmLegend.className = 'line TM';
    tmLabel.appendChild(tmLegend);
    tmBox.appendChild(tmInput);
    tmBox.appendChild(tmLabel);
    zoningSSubsets.appendChild(tmBox);

    // W5 zoning
    w5Input.type = 'checkbox';
    w5Input.name = 's-zoning-data';
    w5Input.id = 'W5';
    w5Input.value = 'W5';
    if(_filterPanel.app.filters.includes('W5')){
      w5Input.checked = true;
    }else{
      w5Input.checked = false;
    }
    w5Input.addEventListener('change', (ev)=>{
      _filterPanel.updateFilters(ev, _filterPanel);
    });
    w5Label.innerText = 'W5 - Zoning';
    w5Label.setAttribute('for', 'W5');
    w5Legend.className = 'line W5';
    w5Label.appendChild(w5Legend);
    w5Box.appendChild(w5Input);
    w5Box.appendChild(w5Label);
    zoningSSubsets.appendChild(w5Box);

    zoningS.appendChild(zoningSAllInput);
    zoningS.appendChild(zoningSAllLabel);
    zoningS.appendChild(zoningSAllExpandBtn);
    _filterPanel.form.appendChild(zoningS);
    _filterPanel.form.appendChild(zoningSSubsets);

    // Handle submits
    _filterPanel.form.addEventListener('submit', (ev) => {
        ev.preventDefault();
        console.log(ev);
    });
    container.appendChild(_filterPanel.form);
  }
}
