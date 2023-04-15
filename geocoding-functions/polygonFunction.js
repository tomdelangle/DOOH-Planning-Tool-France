
async function polygonFunction(fileContent) {

    try {

        var totalUniqueScreens = new Set();
    
        fileContent.forEach((point) => {

            let screensPerPoint = new Set();
            let arrayofGPSpoints = [];
        
            // for each line of the csv (polygon), split points in arrays.
        
            for (let [key, value] of Object.entries(point)) {

                if (key.startsWith("Latitude")) {

                    let index = parseInt(key.slice(-3));
                    if (isNaN(index)) {
                        index = parseInt(key.slice(-2));
                        if (isNaN(index)) {
                            index = parseInt(key.slice(-1));
                        };
                    };
                    arrayofGPSpoints[index - 1] = arrayofGPSpoints[index - 1] || [];
                    arrayofGPSpoints[index - 1].unshift(value);

                } else if (key.startsWith("Longitude")) {

                    let index = parseInt(key.slice(-3));
                    if (isNaN(index)) {
                        index = parseInt(key.slice(-2));
                        if (isNaN(index)) {
                            index = parseInt(key.slice(-1));
                        };
                    };
                    arrayofGPSpoints[index - 1] = arrayofGPSpoints[index - 1] || [];
                    arrayofGPSpoints[index - 1].push(value);

                };

            };
        
            // delete points of each polygon that are null (from the end of the array). Important if polygones have only 3 points vs other polygons with 5 points for example.
        
            while (
            arrayofGPSpoints.length > 0 &&
            (arrayofGPSpoints[arrayofGPSpoints.length - 1][0] === null ||
                arrayofGPSpoints[arrayofGPSpoints.length - 1][1] === null)
            ) {
            arrayofGPSpoints.pop();
            };
        
            // create polygon element with leaflet
        
            let polygon = L.polygon(arrayofGPSpoints);

            let polygonGeoJSON = polygon.toGeoJSON()
        
            // asking for each TTD screen...
        
            ttdScreensLayer.eachLayer(function (layer) {
                
                let pointTurf = turf.point([
                    layer.feature.geometry.coordinates[0],
                    layer.feature.geometry.coordinates[1],
                ]);
        
                // using Turf.js to know if a TTD screen is inside the polygon
        
                let inside = turf.inside(pointTurf,polygonGeoJSON);
        
                if (inside && !totalUniqueScreens.has(layer)) {
                    totalUniqueScreens.add(layer);
                };
                if (inside) {
                    screensPerPoint.add(layer);
                };

            });

            selectedCPM = []

            screensPerPoint.forEach(layer => {

                Object.keys(layer.feature.properties).forEach(key => {
                    if (key.startsWith('FloorCPM($)') && layer.feature.properties[key] != "0") {
                      selectedCPM.push(layer.feature.properties[key]);
                    };
                });

            });

            var cpmAverage = (selectedCPM.reduce((acc, val) => acc + val, 0) / selectedCPM.length).toFixed(2)

            let popupUserContent =

            `
            <div class="first-row-popup"><span class="popup-title">${point.Name != null ? point.Name : "-"}</span><div class="popup-badge popup-polygon-tag">Polygon</div></div><br>
            <hr><br>
            <div class="forecast-popup">
            <div class="screens-section forecast-section">
                <img src="./img/screens.svg" alt="" class="screens-img-popup">
                <span class="span-img-popup">${screensPerPoint.size}</span>
            </div>
            <div class="cpm-section forecast-section">
                <img src="./img/cpm.svg" alt="" class="cpm-img-popup">
                <span class="span-img-popup">${cpmAverage == "NaN" ? "- " : cpmAverage}$</span>
            </div>
            <div class="contacts-section forecast-section">
                <img src="./img/contacts.svg" alt="" class="contacts-img-popup">
                <span class="span-img-popup">--</span>
            </div>
            </div>
            `;
        

            polygon.bindPopup(popupUserContent,{closeButton: false});
        
            polygon.addTo(userCsvLayer); // add it to the user data layer

        });
    
        totalUniqueScreens.forEach(screen => {
            clusterMarkers.addLayer(screen);
        });
  
        return {fileType:"radius polygon file",status:"processing: OK",totalScreens:totalUniqueScreens.size,userLayer:fileContent.length};
  
    } catch (error) {
  
        console.error(error);
        return {fileType:"radius adresses file",status:"processing: NOT OK",errorMessage:error.message};
  
    };

};