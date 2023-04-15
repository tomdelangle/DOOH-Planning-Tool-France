function getUniqueProperties(data, attribute) {

  // The getUniqueProperties function retrieves a list of unique property values for a specified attribute from a dataset.
  // The function takes two arguments: data, which is the dataset, and attribute, which is the name of the property attribute to retrieve.

  const propertyList = data.features.map(
    (feature) => feature.properties[attribute]
  );
  const filteredProperties = propertyList.filter(
    (name) => name != null && name !== ""
  );
  const uniqueProperties = new Set(filteredProperties);
  return Array.from(uniqueProperties);
};

function getExistingPills(parentElement,existingPills){

  // The purpose of this function is to retrieve any existing "pill" elements within a given parent element and add them to an array of "existingPills".
  // This function is usefull in order to know wich options of the dropdown menus are already selected. If an option if selected (is in a pill), the app does not display it in the dropdown menus.

  let pills = Array.from(parentElement.querySelectorAll('.pills'));
  pills.forEach((pill) => {
    let attribute = pill.dataset.property;
    let value = pill.childNodes[0].textContent;
    existingPills.push({ attribute, value });
  });

};

function createPill(text, attribute) {

  //The createPill function creates a pill element with text content and styling based on a specified attribute.
  // The function takes two arguments: text, which is the text content of the pill, and attribute, which is a string indicating the type of the pill.
  // A classlist is added to the pill for CSS.
  // A property is added to the pill in order to recognize it.

  const pill = document.createElement("div");
  pill.innerHTML = `<span>${text}</span><span><img src="./img/close_btn.svg" alt="" class="pills-cross"></span>`;
  pill.classList.add("pills");
  switch (attribute) {
    case "Country":
      pill.classList.add("pills-country");
      pill.dataset.property = "Country";
      break;
    case "City":
      pill.classList.add("pills-city");
      pill.dataset.property = "City";
      break;
    case "Region":
      pill.classList.add("pills-region");
      pill.dataset.property = "Region";
      break;
    case "Zipcode":
      pill.classList.add("pills-zip");
      pill.dataset.property = "Zipcode";
      break;
    case "Venue Type":
      pill.classList.add("pills-classic");
      pill.dataset.property = "Venue Type";
    break;
    case "Publisher Name":
      pill.classList.add("pills-publisher");
      pill.dataset.property = "Publisher Name";
    break;
    case "Width x Height":
      pill.classList.add("pills-classic");
      pill.dataset.property = "Width x Height";
    break;
  }
  return pill;
};

function ClearPillsOfParentElement(parentElement) {
  // delete all the pills of the parent element.
  parentElement.innerHTML = "";
};

function clearAllPillsAndInput(){

  // This function is used when user wants to clear all the filters.

  ClearPillsOfParentElement(placesPills);
  ClearPillsOfParentElement(venueTypePills);
  ClearPillsOfParentElement(partnersPills);
  ClearPillsOfParentElement(specificationsPills);
  minCPMInput.value = "";
  maxCPMInput.value = "";
  spotLengthInput.value = "";
  videoCheckbox.checked = false;
  displayCheckbox.checked = false;
  htmlCheckbox.checked = false;
  selectedAdTypeInput.textContent = 'Select ad type';
};

function createDropdownMenu(items, property, badge) {

  // The purpose of this function is to create a dropdown menu for a user interface that includes a badge next to each option and associates it with a particular property.
  // The "items" parameter is an array of strings that represents the options in the dropdown menu.
  // The "property" parameter is a string that represents the property that the dropdown menu is associated with.
  // The "badge" parameter is a string that represents a badge that will be displayed next to each option in the dropdown menu.

  const menuItems = items.map(item => `
    <li class="select-options" data-property="${property}">
      ${item}<div class="badge ${badge}-badge">${badge}</div>
    </li>
  `).sort();
  return menuItems;
};

function createPlacesDropdownMenu(City, Region, Country, Zipcode) {

  // This function creates the dropdown menu of PLACES input.
  // The resulting array represents a complete dropdown menu with options for cities, regions, countries, and zip codes.

  const menuItems = [
    ...createDropdownMenu(City, 'City', 'city'),
    ...createDropdownMenu(Region, 'Region', 'region'),
    ...createDropdownMenu(Country, 'Country', 'country'),
    ...createDropdownMenu(Zipcode, 'Zipcode', 'zip')
  ];
  return menuItems;
}

function createVenueTypeDropdownMenu(venueType) {

  // This function creates the dropdown menu of VENUE TYPE input.

  const menuItems = [
    ...createDropdownMenu(venueType, 'Venue Type', '')
  ];
  return menuItems;
}

function createPartnersDropdownMenu(Publisher) {

  // This function creates the dropdown menu of partners input.

  const menuItems = [
    ...createDropdownMenu(Publisher, 'Publisher Name', 'publisher')
  ];
  return menuItems;
}

function createSpecificationsDropdownMenu(spec) {

  // This function creates the dropdown menu of SPECIFICATIONS input.

  const menuItems = [
    ...createDropdownMenu(spec, 'Width x Height', '')
  ];
  return menuItems;
};

function handleDropdownClick(input, dropdown, pillsContainer) {

  // handleDropdownClick function listens for a click event on every input dropdown and creates a pill element based on the user's selection.
  // If a pill already exists, the new pill is added before the CLEAR BUTTON. If there are no pills, the new pill is added as the first child of the pills container, and a "CLEAR ALL" button is added below it.
  // The function also allows users to remove individual pills by clicking on the "x" icon within each pill.

  dropdown.addEventListener("click", (event) => {

    if (event.target.tagName === "LI") {

      input.value = "";
      dropdown.style.display = "none";
      const attribute = event.target.dataset.property;
      const text = event.target.childNodes[0].textContent;
      const pill = createPill(text, attribute);
      const pillsCross = pill.querySelector(".pills-cross");

      pillsCross.addEventListener("click", () => {
        if (pillsContainer.childElementCount <= 2) {
          pillsContainer.innerHTML = "";
        } else if (pillsContainer.childElementCount > 2){
          pill.remove();
        }
      });

      input.focus();

      pillsContainer.childElementCount === 0 
      ? pillsContainer.appendChild(pill) 
      : pillsContainer.insertBefore(pill, pillsContainer.lastChild);

      if (pillsContainer.childElementCount == 1) {
        const clearButton = document.createElement("div");
        clearButton.classList.add("clear-pills");
        clearButton.textContent = "CLEAR ALL";
        pillsContainer.appendChild(clearButton);
        clearButton.addEventListener("click", function () {
          ClearPillsOfParentElement(pillsContainer);
          input.value = "";
        });
      };

    }
  });
};

function showLoader(){
  loader.style.display = 'flex';
  console.log("ok showloader")
};

function hideLoader(){
  console.log("ok hideloader")
  loader.style.display = 'none';
};

function CheckAndProcessUploadedFile(UploadElement,listener) {

  // this function is the master function when the user upload file from the button or drag & drop. According to the way the upload is done, the eventlistener is different.
  // There are 2 main steps in this function : 1) check if the file is OK / 2) process the file with geocoding function.

  // Add event listener to the upload element for the specified listener
  UploadElement.addEventListener(listener, async (event) => {

    event.preventDefault();
    clearAllLayer();
    clearAllPillsAndInput();
    showLoader();


    // Get the uploaded file from the event target depending on the upload element (via button or drag&drop).
    let file;
    if (UploadElement == userFileInput){
      file = event.target.files[0];
    } else if (UploadElement == userFileUpload){
      file = event.dataTransfer.files[0];
    };

    // Check if the uploaded file is OK and process it if it is.
    await checkIfUploadedFileisOK(file)
    .then(async () => await processFile(file)
                      .then(displayFileInformation(file.name))
                      .catch(ProcessError => ShowFileUploadError(ProcessError)))
    .catch(CheckError => ShowFileUploadError(CheckError));

    // Set forecast information (screens, CPM, contacts) and hide the loader.
    setForecastInfos();
    hideLoader();

  });
};

async function checkIfUploadedFileisOK(file){

  // This function is the first step of the file uploading process ( 1 - check if file is OK / 2 - process file with geocoding functions). File uploading process is in the following function : CheckAndProcessUploadedFile().

  // In this function :
  // For each type of file (CSV or geojson) : check if the file is OK / return a promise through a resolve() or reject() function.
  // If resolve() : get file content from response object.
  // If reject() : get response object in order to use it at a higher level (CheckAndProcessUploadedFile()).

  let fileTypeToUpload = selectedFileInput.innerText;

  return new Promise((resolve, reject) => {
    if (fileTypeToUpload.includes("CSV")){
      let checkCSVFileResponse = checkIfCSVFileIsOK(fileTypeToUpload,file)
      checkCSVFileResponse.then(result => {
        if (result.Status){
          resolve(result.fileContent);
        };
        if(result.errorMessage){
          reject(result);
        };
      });
    } else if (fileTypeToUpload.includes("Geojson")){
      let checkGeoJsonFileResponse = checkIfGeoJsonFileIsOK(fileTypeToUpload,file)
      checkGeoJsonFileResponse.then(result => {
        if (result.Status){
          resolve(result.fileContent);
        };
        if(result.errorMessage){
          reject(result);
        };
      });
    };
  });
};

async function checkIfCSVFileIsOK(fileTypeToUpload,file){

  // This function checks if the CSV user file is OK to process. According to the type of file the user is uploading, several controls are settled.
  // If the function finds an error, throw an objet created with the getErrorMessage() function.
  // If the function finds nothing, throw an object with status OK and the file content.

  if (file == undefined){
    return getErrorMessage("Invalid file","Please upload a file.");
  }

  let fileName = file.name;
  let fileExtension = fileName.split('.').pop().toLowerCase();
  let fileContent = await readFileAsync(file);

  const csvData = Papa.parse(fileContent, { // papa.parse library convert csv content into a json format.
    header: false,
    skipEmptyLines: true
  }).data;
  const headerCsvData = csvData[0];

  if (fileExtension != 'csv'){
    return getErrorMessage("File extension","Uploaded file is not a CSV file.")
  };

  if (csvData.length == 1){
    return getErrorMessage("Empty file","Uploaded file is empty.");
  };

  if (fileTypeToUpload == "CSV - Radius - lat/long"){

    let requiredColumns = ["Name", "Longitude", "Latitude", "Radius (meters)"];

    if (!arraysAreEqual(requiredColumns, headerCsvData)){
      return getErrorMessage("Invalid header","Invalid header for this type of file.");
    };

    if (headerCsvData.length > 4) {
      return getErrorMessage("Out of columns","Data must be in the specified columns of the CSV file.");
    };

    let latIndex = headerCsvData.indexOf("Latitude");
    let lonIndex = headerCsvData.indexOf("Longitude");
    let radiusIndex = headerCsvData.indexOf("Radius (meters)");
    let regexLatLong = /^-?\d+(\.\d+)?$/;
    let regexRadius = /^\d+$/;

    for (let i = 1; i < csvData.length; i++) {
      const row = csvData[i];
      if (regexLatLong.test(row[latIndex]) == false || regexLatLong.test(row[lonIndex]) == false) {
        return getErrorMessage("Invalid cell format", `Lat/long row ${i + 1} does not match the required format.`);
      };
      if (regexRadius.test(row[radiusIndex]) == false) {
        return getErrorMessage("Invalid cell format", `Radius row ${i + 1} does not match the required format.`);
      };
    };

  };

  if (fileTypeToUpload == "CSV - ZIP code"){

    let requiredColumns = ["Name", "ZIP code"];

    if (!arraysAreEqual(requiredColumns, headerCsvData)){
      return getErrorMessage("Invalid header","Invalid header for this type of file.");
    };

    if (headerCsvData.length > 2) {
      return getErrorMessage("Out of columns","Data must be in the specified columns of the CSV file.");
    };

    let zipcodeIndex = headerCsvData.indexOf("ZIP code");
    let regexOnlyNumbers = /^\d+$/;

    for (let i = 1; i < csvData.length; i++) {
      const row = csvData[i];
      if (regexOnlyNumbers.test(row[zipcodeIndex]) == false) {
        return getErrorMessage("Invalid cell format", `ZIP code row ${i + 1} does not match the required format.`);
      };
    };

  };

  if (fileTypeToUpload == "CSV - City"){

    let requiredColumns = ["Name", "City"];

    if (!arraysAreEqual(requiredColumns, headerCsvData)){
      return getErrorMessage("Invalid header","Invalid header for this type of file.");
    };

    if (headerCsvData.length > 2) {
      return getErrorMessage("Out of columns","Data must be in the specified columns of the CSV file.");
    };

  };

  if (fileTypeToUpload == "CSV - Radius - adresses"){

    let requiredColumns = ["Name", "Street address", "ZIP code", "City", "Country", "Radius (meters)"];

    if (!arraysAreEqual(requiredColumns, headerCsvData)){
      return getErrorMessage("Invalid header","Invalid header for this type of file.");
    };

    if (headerCsvData.length > 6) {
      return getErrorMessage("Out of columns","Data must be in the specified columns of the CSV file.");
    };

    let radiusIndex = headerCsvData.indexOf("Radius (meters)");
    let zipcodeIndex = headerCsvData.indexOf("ZIP code");
    let regexOnlyNumbers = /^\d+$/;

    for (let i = 1; i < csvData.length; i++) {
      const row = csvData[i];
      if (regexOnlyNumbers.test(row[radiusIndex]) == false) {
        return getErrorMessage("Invalid cell format", `Radius row ${i + 1} does not match the required format.`);
      };
      if (regexOnlyNumbers.test(row[zipcodeIndex]) == false) {
        return getErrorMessage("Invalid cell format", `ZIP code row ${i + 1} does not match the required format.`);
      };
    };
  };

  if (fileTypeToUpload == "CSV - Polygons"){

    while (headerCsvData[headerCsvData.length - 1] == "") {
      headerCsvData.pop();
    };

    if(["Name", "Longitude", "Latitude", "Radius (meters)"].every((element) => headerCsvData.includes(element))
    || ["Name", "Code IRIS"].every((element) => headerCsvData.includes(element))
    || ["Name", "Street address", "ZIP code", "City", "Country", "Radius (meters)"].every((element) => headerCsvData.includes(element))){
      return getErrorMessage("Invalid header","Invalid header for this type of file.");
    };

    let regexLatLong = /^-?\d+(\.\d+)?$/;

    for (let i = 1; i < csvData.length; i++) {
      let row = csvData[i];
      if (row.length > headerCsvData.length){
        return getErrorMessage("Out of columns","Data must be in the specified columns of the CSV file.");
      };
      let rowWithoutFirstElement = row.slice(1);
      while (rowWithoutFirstElement[rowWithoutFirstElement.length - 1] == "") {
        rowWithoutFirstElement.pop();
      };
      if (rowWithoutFirstElement.some((element) => element == "")){
        return getErrorMessage("Empty cell",`Empty cell row ${i + 1} has been found in your CSV file.`)
      };
      if (rowWithoutFirstElement.some((element) => regexLatLong.test(element) == false)){
        return getErrorMessage("Invalid cell format", `Lat/long cell row ${i + 1} does not match the required format.`);
      };
    };

    if (headerCsvData.length % 2 == 0){
      return getErrorMessage("Invalid header","The uploaded CSV file is invalid. The number of columns must be odd.");
    };

    for (let i = 1; i < headerCsvData.length; i++) {
      let expectedHeader = i % 2 == 0 ? `Latitude${i/2}` : `Longitude${(i+1)/2}`;
      if (expectedHeader != headerCsvData[i]) {
        return getErrorMessage("Invalid header",`Column ${i+1} should be named "${expectedHeaders[i]}`);
      };
    };
  };

  if (fileTypeToUpload == "CSV - IRIS (France only)"){

    let requiredColumns = ["Name", "Code IRIS"];

    if (!arraysAreEqual(requiredColumns, headerCsvData)){
      return getErrorMessage("Invalid header","Invalid header for this type of file.");
    };

    if (headerCsvData.length > 2) {
      return getErrorMessage("Out of columns","Data must be in the specified columns of the CSV file.");
    };

    let IRISIndex = headerCsvData.indexOf("Code IRIS");
    let regexIRISCode = /^\d{9}$/;

    for (let i = 1; i < csvData.length; i++) {
      const row = csvData[i];
      if (regexIRISCode.test(row[IRISIndex]) == false) {
        return getErrorMessage("Invalid cell format", `IRIS code row ${i + 1} does not match the required format.`);
      };
    };
  };

  if (fileTypeToUpload != "CSV - Polygons"){
    for (i = 0; i < csvData.length; i++){
      let row = csvData[i];
      let rowWithoutFirstElement = row.slice(1);
      if (rowWithoutFirstElement.some((element) => element == "")){
        return getErrorMessage("Empty cell",`Empty cell row ${i + 1} has been found in your CSV file.`)
      };
    };
  };

  return {Status:"isOK",fileName:fileName,fileContent:csvData};

};

async function checkIfGeoJsonFileIsOK(fileTypeToUpload,file){

  // Same as checkIfCSVFileIsOK() but with geojson user file.

  let fileName = file.name;
  let fileExtension = fileName.split('.').pop().toLowerCase();
  let fileContent = await readFileAsync(file);

  if (fileExtension != 'geojson'){
    return getErrorMessage("File extension","Uploaded file is not a geojson file.")
  };

  const geojsonData = JSON.parse(fileContent);

  if (geojsonData.type != "FeatureCollection"){
    return getErrorMessage("Invalid file format","The file must have a FeatureCollection type.")
  };

  if (fileTypeToUpload == "Geojson - Polygons"){
    geojsonData.features.forEach(polygon =>{
      if (polygon.geometry.type != "Polygon"){
        return getErrorMessage("Invalid file format","Please provide Polygon geometries.")
      };
    });
  };
  
  if (fileTypeToUpload == "Geojson - MultiPolygons") {
    geojsonData.features.forEach(polygon =>{
      if (polygon.geometry.type != "MultiPolygon") {
        return getErrorMessage("Invalid file format","Please provide MultiPolygon geometries.")
      };
    });
  };

  return {Status:"isOK",fileName:fileName,fileContent:geojsonData};

};

function getErrorMessage(errorType,message){
  // This function is used in order to check the user file before processing it. If the file is not well formated, display an error.
  return {Error:errorType,errorMessage:message}
};

function readFileAsync(file) {

  // This function is useful for asynchronously reading the contents of the user file and returning them as a Promise that can be used to handle the result of the file read operation.
  // The Promise allowed me to take the file content out of the onload method.
  // This function is used in order to check the user file before processing it.

  return new Promise((resolve) => {
    let fileReader = new FileReader();
    fileReader.readAsText(file);
    fileReader.onload = () => {
      resolve(fileReader.result);
    };
  });
};

function arraysAreEqual(arr1, arr2) {

  // Simple function to know if two arrays have exactly the same elements.

  if (arr1.length != arr2.length) {
    return false;
  };
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] != arr2[i]) {
      return false;
    };
  };
  return true;
};

async function processFile(file){

  // This function is the second step of the file uploading process ( 1 - check if file is OK / 2 - process file with geocoding functions). File uploading process is in the following function : CheckAndProcessUploadedFile().

  // In this function :
  // For each type of file (CSV or geojson) : process the file with geocoding functions (according to the file type) / return a promise through a resolve() or reject() function.
  // In both resolve() or reject() cases : get the object from the processfile functions. the object different whenever it is a resolv() or a reject().

  let fileTypeToUpload = selectedFileInput.innerText;
  let fileContent = await readFileAsync(file);

  return new Promise((resolve, reject) => {
    if (fileTypeToUpload.includes("CSV")){

      let ProcessCSVFile = processCSVFile(fileTypeToUpload,fileContent)
      ProcessCSVFile.then(result => {
        if (result.status == "processing: OK"){
          resolve(result);
        };
        if(result.status == "processing: NOT OK"){
          reject(result);
        };
      });
    } else if (fileTypeToUpload.includes("Geojson")){
      let ProcessGeojsonFile = processGeojsonFile(fileTypeToUpload,fileContent)
      ProcessGeojsonFile.then(result => {
        if (result.status == "processing: OK"){
          resolve(result);
        };
        if(result.status == "processing: NOT OK"){
          reject(result);
        };
      });
    };
  });
};

async function processCSVFile(fileTypeToUpload,fileContent){

  // This function processes CSV file (if file type is CSV). According to the file type, it runs the appropriated function asynchronously and return its reponse to a higher level (processFile());
  // All the geocoding functions have a try and catch.
  // If "try" is OK, returns an object with several information.
  // If not, "catch" returns an objet with the error message.

  let fileContentObject = Papa.parse(fileContent, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  }).data;

  if (fileTypeToUpload == "CSV - Radius - lat/long"){

    let radiusLatLongFunctionResponse = await radiusLatLongFunction(fileContentObject);
    return radiusLatLongFunctionResponse;

  };

  if (fileTypeToUpload == "CSV - ZIP code"){

    let zipCodeFunctionResponse = await zipCodeFunction(fileContentObject);
    return zipCodeFunctionResponse;

  };

  if (fileTypeToUpload == "CSV - City"){

    let cityFunctionResponse = await cityFunction(fileContentObject);
    return cityFunctionResponse;

  };

  if (fileTypeToUpload == "CSV - Radius - adresses"){

    let radiusAdressesFunctionResponse = await radiusAdressesFunction(fileContentObject);
    return radiusAdressesFunctionResponse;

  };

  if (fileTypeToUpload == "CSV - Polygons"){

    let polygonsFunctionResponse = await polygonFunction(fileContentObject);
    return polygonsFunctionResponse;

  };

  if (fileTypeToUpload == "CSV - IRIS (France only)"){

    let irisFunctionResponse = await irisCodesFunction(fileContentObject);
    return irisFunctionResponse;
    
  };

};

async function processGeojsonFile(fileTypeToUpload,fileContent){

  // Same as processCSVFile but for geojson files.
  // According to the file type, it runs the appropriated function asynchronously and return its reponse to a higher level (processFile());

  if (fileTypeToUpload == "Geojson - Polygons"){

    let geojsonPolygonFunctionResponse = await geojsonPolygonFunction(fileContent);
    return geojsonPolygonFunctionResponse;

  };

  if (fileTypeToUpload == "Geojson - MultiPolygons"){

    let geojsonMultiPolygonFunctionResponse = await geojsonMultiPolygonFunction(fileContent);
    return geojsonMultiPolygonFunctionResponse;

  };

};

function updateSelectedText() {
  // Select all checkboxes of Ad type input and filter checked checkboxes
  const checkedCheckboxes = Array.from(adTypeCheckboxes).filter((checkbox) => checkbox.checked);
  // If no checkboxes are checked, display "Select ad type"
  if (checkedCheckboxes.length === 0) {
    selectedAdTypeInput.textContent = 'Select ad type';
  // If only one checkbox is checked, display "1 item selected"
  } else if (checkedCheckboxes.length === 1) {
    selectedAdTypeInput.textContent = `1 item selected`;
    // Otherwise, display "n items selected"
  } else {
    selectedAdTypeInput.textContent = `${checkedCheckboxes.length} items selected`;
  }
}

function createPlacesObject(){

  // the createPlacesObject is used for the applyfilter() function.
  // It provides an object with all the selected pills from PlacesInput.
  // It classifies pills content thanks to their data-property.

  const placesObject = {
    City: [],
    Country: [],
    Zipcode: [],
    Region: [],
  };

  for (let i = 0; i < placesPills.children.length - 1; i++) {
    const div = placesPills.children[i];
    const group = div.getAttribute('data-property');
    if (group in placesObject) {
      placesObject[group].push(div.innerText);
    } 
  };

  return placesObject;

};

function createVenuetypeObject(){

  // Same as createPlacesObject() for Venue type input

  const venueTypeObject = {
    "Venue Type": []
  };

  for (let i = 0; i < venueTypePills.children.length - 1; i++) {
    const div = venueTypePills.children[i];
    venueTypeObject["Venue Type"].push(div.innerText);
  };

  return venueTypeObject;

};

function createPartnersObject(){

  // Same as createPlacesObject() for Partners input

  const partnersObject = {
    "Publisher Name": [],
  };

  for (let i = 0; i < partnersPills.children.length - 1; i++) {
    const div = partnersPills.children[i];
    const group = div.getAttribute('data-property');
    if (group in partnersObject) {
      partnersObject[group].push(div.innerText);
    } 
  };

  return partnersObject;

};

function createAdTypeObject(){

  // Same as createPlacesObject() for Ad type input

  const adTypeObject = {
    Video: "0",
    Static: "0",
    HTML5: "0",
  };

  (videoCheckbox.checked == true) && (adTypeObject["Video"] = 1);
  (displayCheckbox.checked == true) && (adTypeObject["Static"] = 1);
  (htmlCheckbox.checked == true) && (adTypeObject["HTML5"] = 1);

  return adTypeObject;

};

function createSpecificationsObject(){

  // Same as createPlacesObject() for Specifications input

  const specificationsObject = {
    "Width x Height": []
  };

  for (let i = 0; i < specificationsPills.children.length - 1; i++) {
    const div = specificationsPills.children[i];
    specificationsObject["Width x Height"].push(div.innerText);
  };

  return specificationsObject;

};

function applyFilter(){

  // This function is played when a user apply filter that is not a file upload :
  // places, venue type, partners, prices, ad type, screen width & height, spot length.

  // The function is applied as an observer on placesPills / venueTypePills / partnersPills / specificationsPills.
  // The function is applied as an eventlistener on minCPMInput / maxCPMInput / videoCheckbox / displayCheckbox / htmlCheckbox / spotLengthInput (event is a "change").
    
  clearAllLayer()
  deleteSelectedFile()

  // get all existing pills :

  let placesObject = createPlacesObject();
  let venueTypeObject = createVenuetypeObject();
  let partnersObject = createPartnersObject();
  let adTypeObject = createAdTypeObject();
  let specificationsObject = createSpecificationsObject();

  // If no filters applied => reset the view.

  if (placesObject["City"].length == 0
  && placesObject["Country"].length == 0
  && placesObject["Zipcode"].length == 0
  && placesObject["Region"].length == 0
  && venueTypeObject["Venue Type"].length == 0
  && partnersObject["Publisher Name"].length == 0
  && minCPMInput.value == ""
  && maxCPMInput.value == ""
  && selectedAdTypeInput.innerText == "Select ad type" // means that no ad type checkboxes are checked.
  && specificationsObject["Width x Height"].length == 0
  && spotLengthInput.value == ""){
    clusterMarkers.addLayer(ttdScreensLayer);
    setInitialView();
    setForecastInfos()
    return;
  };

  let totalUniqueScreens = [];

  // Core part of this function : I loop on each ttd screen.
  // The loop checks the properties of each screen against filters that are applied by the user.
  // If all criteria are met, the screen is added to totalUniqueScreens, wich are the screens to display.

  // Thus, all the filters work with "AND" between them.
  // A screen has meet all the filter to be displayed

  ttdScreensLayer.eachLayer(function (layer) {

    let isPointOK = true;

    if (placesObject["City"].length != 0 || placesObject["Country"].length != 0 || placesObject["Zipcode"].length != 0 || placesObject["Region"].length != 0){
      
      if (placesObject["City"].every(element => element.toLowerCase() != layer.feature.properties[`City`].toLowerCase())
      && placesObject["Country"].every(element => element.toLowerCase() != layer.feature.properties[`Country`].toLowerCase())
      && placesObject["Zipcode"].every(element => element != layer.feature.properties[`Zipcode`])
      && placesObject["Region"].every(element => element.toLowerCase() != layer.feature.properties[`Region`].toLowerCase())) {
        isPointOK = false;
        return;
      };
    };

    if (venueTypeObject["Venue Type"].length != 0){

      if (venueTypeObject["Venue Type"].every(element => element.toLowerCase() != layer.feature.properties["Venue Type"].toLowerCase())){
        isPointOK = false;
        return;
      };

    };

    if (partnersObject["Publisher Name"].length != 0){

      if (partnersObject["Publisher Name"].every(element => element.toLowerCase() != layer.feature.properties[`Publisher Name`].toLowerCase())){
        isPointOK = false;
        return;
      };
    };

    selectedCPM = []

    Object.keys(layer.feature.properties).forEach(key => {
      if (key.startsWith('FloorCPM($)') && layer.feature.properties[key] != "0") {
        selectedCPM.push(layer.feature.properties[key]);
      }
    });

    if (minCPMInput.value != "" || maxCPMInput.value != ""){
      if (minCPMInput.value != "" && maxCPMInput.value == ""){
        if (selectedCPM.every(cpm => cpm < parseFloat(minCPMInput.value))){
          isPointOK = false;
          return;
        };
      } else if (minCPMInput.value == "" && maxCPMInput.value != ""){
        if (selectedCPM.every(cpm => cpm > parseFloat(maxCPMInput.value))){
          isPointOK = false;
          return;
        };
      } else {

        if (!(selectedCPM.every(cpm => cpm >= parseFloat(minCPMInput.value))
        &&  selectedCPM.every(cpm => cpm <= parseFloat(maxCPMInput.value)))){
          isPointOK = false;
          return;
        };
      };
    };

    if (videoCheckbox.checked == true
    || displayCheckbox.checked == true
    || htmlCheckbox.checked == true){

      if (!(adTypeObject["HTML5"] == "1" && layer.feature.properties[`Allowed Ad Types: HTML`] == "1"
      || adTypeObject["Static"] == "1" && layer.feature.properties[`Allowed Ad Types: Static`] == "1"
      || adTypeObject["Video"] == "1" && layer.feature.properties[`Allowed Ad Types: Video`] == "1")){
        isPointOK = false;
        return;
      };
    };

    if (specificationsObject["Width x Height"].length != 0){

      if (specificationsObject["Width x Height"].every(element => element.toLowerCase() != layer.feature.properties["Width x Height"].toLowerCase())){
        isPointOK = false;
        return;
      };

    };

    if (spotLengthInput.value != ""){

      if (!(parseFloat(spotLengthInput.value) >= layer.feature.properties["Min Ad Duration"]
      && parseFloat(spotLengthInput.value) <= layer.feature.properties["Max Ad Duration"])){
        isPointOK = false;
        return;
      };

    };

    (isPointOK == true) && (totalUniqueScreens.push(layer));

  });

  totalUniqueScreens.forEach(point => {
    clusterMarkers.addLayer(point);
  });

  setForecastInfos()

};

function displayFileInformation(fileName){

  uploadedFileName.textContent = fileName;
  uploadedFileSection.style.display = 'block';
  errorContainer.style.display = "none";

};

function setForecastInfos(){

  // This function sets up the CPM and screens in the forecasting area (top right of the window).

  selectedCPM = []

  clusterMarkers.eachLayer(layer => {
    Object.keys(layer.feature.properties).forEach(key => {
      if (key.startsWith('FloorCPM($)') && layer.feature.properties[key] != 0) {
        selectedCPM.push(layer.feature.properties[key]);
      }
    });
  });

  selectedScreenNumber.innerText = `${parseInt(clusterMarkers.getLayers().length).toLocaleString()} screens`;

  let cpmAverage = selectedCPM.reduce((acc, val) => acc + val, 0) / selectedCPM.length;

  selectedCPMNumber.innerText  = `${cpmAverage.toFixed(2)}$ CPM`;

};

function setInitialView(){

  // Set the view center on Nantes. Since there is the filter container, I shifted the view to the right.

  leafletMap.setView(
    [46.687697408786136, -1.5568386275056127],
    6
  );
};

function deleteSelectedFile() {

  // The deleteSelectedFile function clears the uploaded file information (validation or error alert).
  // It is used when a user wants to delete an uploaded file and start over / or when the user wants to filter with another way than file upload (places, venue type...)

  userFileInput.value = '';
  uploadedFileSection.style.display = 'none';
  uploadedFileName.textContent = '';
  errorContainer.style.display = "none";
};

function clearAllLayer(){

  // Clear all leafletlayers

  userGeojsonLayer.clearLayers();
  userCsvLayer.clearLayers();
  clusterMarkers.clearLayers();
};

function ShowFileUploadError(message){

  errorContainer.style.display = "flex";
  uploadedFileSection.style.display = 'none';
  errorMessage.innerText = message.errorMessage;
  clusterMarkers.addLayer(ttdScreensLayer);

};

function createWorkbook(data) {

  // This function returns an excell sheet created thanks to the XLSX.js library.
  // It creates a first sheet with all displayed frames. Frames are NOT DEDUPLICATED.
  // It also creates a contacts sheet for each SSP based on sspContact.js.

  let workbook = XLSX.utils.book_new();

  let sspList = Object.keys(sspContacts); // get keys from sspContact.js

  let layersCsvData = [];

  data.forEach(frame => { // it is possible to add more columns. These are related to the properties you will find in the ttdFrames geojson.

    let layerAttributeObject = {}; 
    layerAttributeObject["Unique Key"] = frame.properties["Unique Key"];
    layerAttributeObject["Latitude"] = frame.geometry.coordinates[1];
    layerAttributeObject["Longitude"] = frame.geometry.coordinates[0];
    layerAttributeObject["SSP"] = frame.properties["Associated SSP"];
    layerAttributeObject["Publisher Name"] = frame.properties["Publisher Name"];
    layerAttributeObject["Screen ID"] = frame.properties["Screen ID"];
    layerAttributeObject["Screen Name"] = frame.properties["Screen Name"];
    layerAttributeObject["Width x Height"] = frame.properties["Width x Height"];
    layerAttributeObject["Country"] = frame.properties["Country"];
    layerAttributeObject["Region"] = frame.properties["Region"];
    layerAttributeObject["City"] = frame.properties["City"];
    layerAttributeObject["Zipcode"] = frame.properties["Zipcode"];
    layerAttributeObject["Venue Type"] = frame.properties["Venue Type"];
    layerAttributeObject["Width x Height"] = frame.properties["Width x Height"];
    layerAttributeObject["Min Ad Duration"] = frame.properties["Min Ad Duration"];
    layerAttributeObject["Max Ad Duration"] = frame.properties["Max Ad Duration"];
    layerAttributeObject["Allowed Ad Types: HTML"] = frame.properties["Allowed Ad Types: HTML"];
    layerAttributeObject["Allowed Ad Types: Static"] = frame.properties["Allowed Ad Types: Static"];
    layerAttributeObject["Allowed Ad Types: Video"] = frame.properties["Allowed Ad Types: Video"];
    layerAttributeObject[`FloorCPM($)`] = frame.properties[`FloorCPM($) - ${frame.properties["Associated SSP"]}`];

    layersCsvData.push(layerAttributeObject);

  });

  let worksheet = XLSX.utils.json_to_sheet(layersCsvData);
  XLSX.utils.book_append_sheet(workbook, worksheet,"FRAMES_RAW_DATA");

  let contactsData = [];

  sspList.forEach((ssp) => {
    sspContacts[ssp].forEach(object => {

      let contact = object.contact;
      let email = object.email;
      contactsData.push({ SSP: ssp, Contact: contact, Email: email});

    })
  });

  let contactsWorksheet = XLSX.utils.json_to_sheet(contactsData);
  XLSX.utils.book_append_sheet(workbook, contactsWorksheet, "SSP Contacts");

  return workbook;

}

function downloadWorkbook(workbook, filename) {

  // This function will download the workbook created by the "createWorkbookFromSeparatedLayers" function.

  const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "binary" });
  function s2ab(s) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) {
      view[i] = s.charCodeAt(i) & 0xff;
    }
    return buf;
  };

  const blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}