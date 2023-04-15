// HTML references :

let accordionItems = document.querySelectorAll(".accordion-item");
let selectFileInput = document.querySelectorAll(".file-type-input");
let chevronFileInput = document.querySelectorAll(".file-input-chevron-img");
let fileInputDropdown = document.querySelectorAll(".file-input-options");
let fileInputOptions = document.querySelectorAll(".file-select-options");
let selectedFileInput = document.querySelector(".file-input-selected");
let chevronFileSVGPath = document.querySelector(".file-chevron-svg-path");
let placesInput = document.getElementById("places-input");
let placesDropdown = document.getElementById("places-input-options");
let placesPills = document.getElementById("places-pills");
let venueTypeInput = document.getElementById("venue-type-input");
let venueTypeDropdown = document.getElementById("venue-type-input-options");
let venueTypePills = document.getElementById("venue-type-pills");
let partnersInput = document.getElementById("partners-input");
let partnersDropdown = document.getElementById("partners-input-options");
let partnersPills = document.getElementById("partners-pills");
let specificationsInput = document.getElementById("specifications-input");
let specificationsDropdown = document.getElementById("specifications-input-options");
let specificationsPills = document.getElementById("specifications-pills");
let selectAdTypeInput = document.querySelectorAll(".ad-type-input");
let chevronAdTypeInput = document.querySelectorAll(".ad-type-input-chevron-img");
let optionsAdTypeInput = document.querySelectorAll(".ad-type-input-options");
let selectedAdTypeInput = document.querySelector(".ad-type-input-selected");
let chevronAdTypeSVGPath = document.querySelector(".ad-type-chevron-svg-path");
let downloadTemplateContainer = document.querySelector(".download-template-container");
let downloadTemplateLink = document.querySelector(".download-link");
let downloadTemplateLogo = document.querySelector(".download-logo");
let userFileInput = document.getElementById('file-input');
let userFileUpload = document.querySelector('.file-upload-area');
let uploadedFileName = document.querySelector('.uploaded-file-name');
let uploadedFileSection = document.querySelector('.file-upload-success-container');
let deleteFileBtn = document.querySelector('.delete-file');
let errorContainer = document.querySelector('.file-upload-error-container');
let errorMessage = document.querySelector('.error-message');
let clickOrDragSpan = document.querySelector('.click-or-drag');
let loader = document.querySelector('.upload-loader-container');
let spotLengthInput = document.getElementById("length-input");
let minCPMInput = document.getElementById('min-cpm-input');
let maxCPMInput = document.getElementById('max-cpm-input');
let videoCheckbox = document.querySelector('.video-checkbox');
let displayCheckbox = document.querySelector('.static-checkbox');
let htmlCheckbox = document.querySelector('.html-checkbox');
let exportData = document.querySelector('.forecast-export-button');
let selectedScreenNumber = document.querySelector('.screens-number');
let selectedCPMNumber = document.querySelector('.cpm-number');
let clearFilterButton = document.querySelector('.clear-filters-button');
let adTypeCheckboxes = document.querySelectorAll('.checkbox');

////////////////////////////////

// Initialize leaflet elements : leafletMap / mapLayer / TTD screens / user layer...

let leafletMap = L.map("map", { zoomControl: false }).setView(
  // init map
  [46.687697408786136, -1.5568386275056127],
  6
);

let mapLayer = L.tileLayer(
  // More examples here : https://leaflet-extras.github.io/leaflet-providers/preview/
  "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png",
  { maxZoom: 19 }
);

const ttdScreensGeojson = {
  type: 'FeatureCollection',
  features: []
};

ttdFramesRaw.features.forEach(feature => {
  // loop on TTD frames raw data file wich is not deduplicated / see if each feature is already in ttdScreensGeojson (deduplicated TTD frames geojson) regarding their "Unique Key" property.
  const existingFeature = ttdScreensGeojson.features.find(newFeature => newFeature.properties['Unique Key'] == feature.properties['Unique Key']);
  
  // If the feature is not already added, push to ttdScreensGeojson 
  if (!existingFeature) {
    ttdScreensGeojson.features.push(feature);
  }
});

// Need to convert all FloorCPM($) properties in order to calculate CPM with setForecastInfos() function

// Loop through each deduplicated TTD frames
ttdScreensGeojson.features.forEach(feature => {
  // Loop through each property of the frames
  for (const [key, value] of Object.entries(feature.properties)) {
    // Check if the property name starts with "FloorCPM($)"
    if (key.startsWith('FloorCPM($)')) {
      // Convert the property value to a number
      feature.properties[key] = parseFloat(value.replace(',', '.'));
    }
  }
});

const userGeojsonLayer = L.geoJSON();
const userCsvLayer = L.layerGroup();
const ttdScreensLayer = L.geoJSON(ttdScreensGeojson, {
  onEachFeature: (feature, layer) => {

    // designing the popup style of each ttd screens.

    const popupContent =
    `
    <div class="first-row-popup"><span class="popup-title">${feature.properties["Publisher Name"]}</span><div class="popup-badge popup-frame-tag">Frame</div></div><br>
    <span style="font-weight:600">Floor CPM ($)</span> : ${getFloorCpm(feature,getSSP(feature))}<br>
    <span style="font-weight:600">Venue type</span> : ${feature.properties["Venue Type"]}<br>
    <span style="font-weight:600">SSP</span> : ${getSSP(feature).join(", ")}<br>
    `;

    function getSSP(feature) {
      let sspArray = [];
      if (feature.properties["Broadsign"] == "1") {
        sspArray.push("Broadsign");
      }
      if (feature.properties["Hivestack"] == "1") {
        sspArray.push("Hivestack");
      }
      if (feature.properties["VIOOH"] == "1") {
        sspArray.push("VIOOH");
      }
      return sspArray;
    }

    function getFloorCpm(feature,arrayOfSSP){
      let floorCpmBySSP = [];
      arrayOfSSP.forEach(SSP => {
        floorCpmBySSP.push(feature.properties[`FloorCPM($) - ${SSP}`] + ` (${SSP})`)
      })
      return floorCpmBySSP.join(", ");
    }

    layer.bindPopup(popupContent,{closeButton: false});

  },

  pointToLayer: (feature, latlng) => {
    return L.circleMarker(latlng, {
      radius: 8,
      fillColor: "#F98321",
      color: "##F98321",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8,
    });
  }
  
});

const clusterMarkers = L.markerClusterGroup({

  // create cluster object (with MarkerCluster.js) for TTD screens in order to optimize rendering

  iconCreateFunction: function (cluster) { // clustering this way : large = 100+ frames / medium = less thant 100 / small = less than 10.
    var childCount = cluster.getChildCount();
    var c = " marker-cluster-";
    if (childCount < 10) {
      c += "small";
    } else if (childCount < 100) {
      c += "medium";
    } else {
      c += "large";
    }

    return new L.DivIcon({
      html: '<div><span style="color:white">' + childCount + "</span></div>",
      className: "marker-cluster" + c,
      iconSize: new L.Point(40, 40),
    });
  },
  spiderLegPolylineOptions: { weight: 1.5, color: '#002F87', opacity: 0.5 }
});

leafletMap.addLayer(userCsvLayer);
leafletMap.addLayer(userGeojsonLayer);
leafletMap.addLayer(mapLayer);
clusterMarkers.addLayer(ttdScreensLayer);
leafletMap.addLayer(clusterMarkers);

setForecastInfos(); // forecast infos.

// Listens for changes in the PLACES input field : it filters the unique properties of the TTD screens geojson data, based on the user input.
// It then generates a dropdown menu based on the filtered data and displays it on the screen (the dropdown menu doesn't show existing pills value).

placesInput.addEventListener("input", (event) => {

  const userInput = event.target.value.trim().toLowerCase();
  let existingPlacesPills = [];

  if (placesPills.childElementCount > 1){
    getExistingPills(placesPills,existingPlacesPills);
  };

  function filterUniqueProperties(property){
    return getUniqueProperties(ttdScreensGeojson, property)
      .filter((value) =>
        value.toString().toLowerCase().includes(userInput) &&
        !existingPlacesPills.some(pill => pill.attribute == property && pill.value.toLowerCase() == value.toString().toLowerCase())
      );
  };

  const countryNames = filterUniqueProperties("Country");
  const regionNames = filterUniqueProperties("Region");
  const zipNames = filterUniqueProperties("Zipcode");
  const cityNames = filterUniqueProperties("City");
  let DropDownMenuItems = createPlacesDropdownMenu(cityNames,regionNames,countryNames,zipNames).join("");
  placesDropdown.innerHTML = DropDownMenuItems;
  placesDropdown.style.display = DropDownMenuItems != "" && placesInput.value != "" ? "block" : "none";

});

// Listens for changes in the VENUE TYPE input field. Same behavior as PLACES input listener.

venueTypeInput.addEventListener("input", (event) => {

  const userInput = event.target.value.trim().toLowerCase();
  let existingVenueTypePills = [];

  if (venueTypePills.childElementCount > 1){
    getExistingPills(venueTypePills,existingVenueTypePills);
  };

  const venueTypesNames = getUniqueProperties(ttdScreensGeojson, "Venue Type")
  .filter((venueType) =>
  venueType.toLowerCase().includes(userInput) &&
    !existingVenueTypePills.some(pill => pill.attribute == 'Venue Type' && pill.value.toLowerCase() == venueType.toLowerCase())
  );

  let DropDownMenuItems = createVenueTypeDropdownMenu(venueTypesNames).join("");
  venueTypeDropdown.innerHTML = DropDownMenuItems;
  venueTypeDropdown.style.display = DropDownMenuItems != "" && venueTypeInput.value != "" ? "block" : "none";

});

// Listens for changes in the PARTNERS input field. Same behavior as other input listener.

partnersInput.addEventListener("input", (event) => {

  const userInput = event.target.value.trim().toLowerCase();
  let existingPartnersPills = [];

  if (partnersPills.childElementCount > 1){
    getExistingPills(partnersPills,existingPartnersPills);
  };

  function filterUniqueProperties(property){
    return getUniqueProperties(ttdScreensGeojson, property)
      .filter((value) =>
        value.toString().toLowerCase().includes(userInput) &&
        !existingPartnersPills.some(pill => pill.attribute == property && pill.value.toLowerCase() == value.toString().toLowerCase())
      );
  };

  const publisherNames = filterUniqueProperties("Publisher Name");
  let DropDownMenuItems = createPartnersDropdownMenu(publisherNames).join("");
  partnersDropdown.innerHTML = DropDownMenuItems;
  partnersDropdown.style.display = DropDownMenuItems != "" && partnersInput.value != "" ? "block" : "none";

});

// Listens for changes in the SPECIFICATIONS input field. Same behavior as other input listener.

specificationsInput.addEventListener("input", (event) => {

  const userInput = event.target.value.trim().toLowerCase();
  let existingSpecificationsPills = [];

  if (specificationsPills.childElementCount > 1){
    getExistingPills(specificationsPills,existingSpecificationsPills);
  };

  const specNumbers = getUniqueProperties(ttdScreensGeojson, "Width x Height")
    .filter((spec) =>
      spec.toLowerCase().includes(userInput) &&
      !existingSpecificationsPills.some(pill => pill.attribute === 'Width x Height' && pill.value.toLowerCase() === spec.toLowerCase())
    );

  let DropDownMenuItems = createSpecificationsDropdownMenu(specNumbers).join("");
  specificationsDropdown.innerHTML = DropDownMenuItems;
  specificationsDropdown.style.display = DropDownMenuItems != "" && specificationsInput.value != "" ? "block" : "none";

});

// Adding handleDropdownClick function on every input field with dropdown menus.

handleDropdownClick(placesInput, placesDropdown, placesPills);
handleDropdownClick(venueTypeInput, venueTypeDropdown, venueTypePills);
handleDropdownClick(partnersInput, partnersDropdown, partnersPills);
handleDropdownClick(specificationsInput, specificationsDropdown, specificationsPills);

// Listens for click on file type input in order to put some CSS.

selectFileInput[0].addEventListener("click", function () {
  selectFileInput[0].classList.toggle("select-clicked");
  chevronFileInput[0].classList.toggle("file-input-chevron-img-rotate");
  fileInputDropdown[0].classList.toggle("file-input-options-open");
  chevronFileSVGPath.classList.toggle("svg-path-blue");
});

fileInputOptions.forEach((option) => {
  option.addEventListener("click", () => {
    if (option.classList.contains("option-active")) return;
    const selectedOption = option.textContent;
    clickOrDragSpan.innerText = `Click or drag your '${selectedOption}' file`
    selectedFileInput.value = selectedOption;
    downloadTemplateContainer.style.display = selectedOption.startsWith("Geojson") ? "none" : "block";
    deleteSelectedFile()
  });
});

// DownloadTemplateFile function downloads a template file based on the selected file type input.
// If the selected file type starts with the characters "CSV", it creates a link to the corresponding file and initiates a download for that file.

function downloadTemplateFile() {
  const selectedOption = selectedFileInput.innerText;
  const downloadLinks = {
    "CSV - Radius - lat/long": "radius_lat_long_template.csv",
    "CSV - ZIP code": "zip_template.csv",
    "CSV - City": "city_template.csv",
    "CSV - Radius - adresses": "radius_adresses_template.csv",
    "CSV - Polygons": "polygons_lat_long_template.csv",
    "CSV - IRIS (France only)": "iris_template.csv"
  };
  if (selectedOption.startsWith("CSV")) {
    let url = `./templates/${downloadLinks[selectedOption]}`;
    let fileName = downloadLinks[selectedOption];
    let link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
  };
};

// Adding downloadTemplateFile function on download template link and logo.

downloadTemplateLink.addEventListener("click", downloadTemplateFile);
downloadTemplateLogo.addEventListener("click", downloadTemplateFile);

// Adding some CSS when clicking on Ad Type Input

selectAdTypeInput[0].addEventListener("click", function () {
  selectAdTypeInput[0].classList.toggle("select-clicked");
  chevronAdTypeInput[0].classList.toggle("ad-type-input-chevron-img-rotate");
  optionsAdTypeInput[0].classList.toggle("ad-type-input-options-open");
  chevronAdTypeSVGPath.classList.toggle("svg-path-blue");
});

// For each dropdown menu, if click is on an option : close it. (remove all the CSS associated to opened dropdown).

fileInputOptions.forEach((option) => {
  option.addEventListener("click", function () {
    selectedFileInput.innerText = option.innerText;
    selectFileInput[0].classList.remove("select-clicked");
    chevronFileInput[0].classList.remove("file-input-chevron-img-rotate");
    fileInputDropdown[0].classList.remove("file-input-options-open");
    chevronFileSVGPath.classList.remove("svg-path-blue");
    fileInputOptions.forEach((option) => {
      option.classList.remove("option-active");
    });
    option.classList.add("option-active");
  });
});

// For each dropdown menu, if click is outside of it : close them (remove all the CSS associated to opened dropdown).

window.addEventListener("click", (event) => {
  if (
    !fileInputDropdown[0].contains(event.target) &&
    !selectFileInput[0].contains(event.target)
  ) {
    selectFileInput[0].classList.remove("select-clicked");
    chevronFileInput[0].classList.remove("file-input-chevron-img-rotate");
    fileInputDropdown[0].classList.remove("file-input-options-open");
    chevronFileSVGPath.classList.remove("svg-path-blue");
  };
  if (
    !optionsAdTypeInput[0].contains(event.target) &&
    !selectAdTypeInput[0].contains(event.target)
  ) {
    selectAdTypeInput[0].classList.remove("select-clicked");
    chevronAdTypeInput[0].classList.remove("ad-type-input-chevron-img-rotate");
    optionsAdTypeInput[0].classList.remove("ad-type-input-options-open");
    chevronAdTypeSVGPath.classList.remove("svg-path-blue");
  };
  if (!placesDropdown.contains(event.target)) {
    placesDropdown.style.display = "none";
  };
  if (!venueTypeDropdown.contains(event.target)) {
    venueTypeDropdown.style.display = "none";
  };
  if (!partnersDropdown.contains(event.target)) {
    partnersDropdown.style.display = "none";
  };
  if (!specificationsDropdown.contains(event.target)) {
    specificationsDropdown.style.display = "none";
  };
});

// Click event added to both the title and chevron for each accordion item.
// When a user clicks on the title or chevron, the active class is toggled on the element.
// This allows the user to expand or collapse the accordion item by clicking on either the title or chevron.

accordionItems.forEach(function (item) {
  let title = item.querySelector(".title-element-accordion");
  let chevron = item.querySelector(".chevron-accordion");

  title.addEventListener("click", function () {
    item.classList.toggle("active");
  });

  chevron.addEventListener("click", function () {
    item.classList.toggle("active");
  });

});

deleteFileBtn.addEventListener('click', () => {
  
  deleteSelectedFile(); // delete current file name
  clearAllLayer(); // clear all leaflet layers
  clusterMarkers.addLayer(ttdScreensLayer); // add all TTD frames on map
  setInitialView(); // set zoom on France
  setForecastInfos(); // update screens, CPM & contacts on forecast container

});

adTypeCheckboxes.forEach((checkbox) => {
  checkbox.addEventListener('change', updateSelectedText);
  // The updateSelectedText function updates the text of the selectedAdTypeInput element based on how many checkboxes of a certain type are checked.
});

CheckAndProcessUploadedFile(userFileInput,"change"); // userFileInput => file uploaded via "CHOOSE FILE" button.
CheckAndProcessUploadedFile(userFileUpload,"drop"); // userFileUpload => file uploaded via drag & drop.

userFileUpload.addEventListener("dragover", function(event) {
  event.preventDefault();
  this.value = null; // reset the <input> element before each drag & drop upload : new file is not accepted if the <input> is not empty.
});


// The next few lines implement the applyFilter() function on every filter (not file upload), with observer or eventlistener.

let filterObserver = new MutationObserver(() => {

  applyFilter();

});

filterObserver.observe(placesPills, { childList: true });
filterObserver.observe(venueTypePills, { childList: true });
filterObserver.observe(partnersPills, { childList: true });
filterObserver.observe(specificationsPills, { childList: true });

let inputFields = [minCPMInput, maxCPMInput, spotLengthInput];
let checkboxes = [videoCheckbox, displayCheckbox, htmlCheckbox];

inputFields.forEach(input => {
  input.addEventListener("change", () => {
    applyFilter();
  });
});

checkboxes.forEach(checkbox => {
  checkbox.addEventListener("change", () => {
    applyFilter();
  });
});

clearFilterButton.addEventListener("click", () => { 

  // Clicking on the clear filters button reinitilize all the filters and layers. It displays all the ttd screens on the map and refresh forecast infos.

  clearAllPillsAndInput()
  clearAllLayer()
  deleteSelectedFile();
  setInitialView();
  clusterMarkers.addLayer(ttdScreensLayer);
  setForecastInfos();

})

// This click eventlistener export the ttd screens display on the map.

exportData.addEventListener("click", function () {

  let displayedFramesUniqueKeys = [];

  clusterMarkers.eachLayer(layer => {
    displayedFramesUniqueKeys.push(layer.feature.properties["Unique Key"]);
  });

  let objectToCsv = [];

  ttdFramesRaw.features.forEach(feature => {
    if (displayedFramesUniqueKeys.includes(feature.properties["Unique Key"])) {
      objectToCsv.push(feature);
    }
  });

  const workbook = createWorkbook(objectToCsv);
  downloadWorkbook(workbook, "screens_data.xlsx");
});
