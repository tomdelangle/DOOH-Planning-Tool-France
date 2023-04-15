
async function irisCodesFunction(fileContent) {

    try {
  
        let irisCodes = fileContent.map((obj) => obj["Code IRIS"]);
        let perChunk = 100 // items per chunk  
        let splittedIrisCodes = irisCodes.reduce((resultArray, item, index) => { 
        let chunkIndex = Math.floor(index/perChunk)
        if(!resultArray[chunkIndex]) {resultArray[chunkIndex] = []};
            resultArray[chunkIndex].push(item.toString())
            return resultArray;
        }, []);

        function IrisSwapElements(arr, i, j) {
            [arr[i], arr[j]] = [arr[j], arr[i]];
          };
  
        var totalUniqueScreens = new Set();
  
        let promises = splittedIrisCodes.map(async irisCodesChunk => {
  
            let irisCodesChunkString = irisCodesChunk.map(code => `'${code}'`).join(',');
  
            const response = await fetch(
                `https://wxs.ign.fr/cartovecto/geoportail/wfs?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&TYPENAME=STATISTICALUNITS.IRIS:contours_iris&COUNT=100000&OUTPUTFORMAT=application/json&CQL_FILTER=code_iris IN (${irisCodesChunkString})`
            );

            return await response.json();
  
        });
  
        let results = await Promise.all(promises);
  
        for (i = 0; i < results.length; i++) {
  
            let geojsonOfgeosjon = results[i].features;
  
            for (j = 0; j < geojsonOfgeosjon.length; j++){

                let screensPerPoint = new Set();
  
                let irisPolygon = geojsonOfgeosjon[j];
  
                irisPolygon.geometry.coordinates[0][0].map(point => {IrisSwapElements(point, 0, 1)})

                let polygon = L.polygon(irisPolygon.geometry.coordinates[0][0]);
  
                let polygonGeojson = polygon.toGeoJSON();
  
                ttdScreensLayer.eachLayer(function (layer) {
        
                    let pointTurf = turf.point([
                        layer.feature.geometry.coordinates[0],
                        layer.feature.geometry.coordinates[1],
                    ]);
      
                    // using Turf.js to know if a TTD screen is inside the polygon
      
                    let inside = turf.booleanPointInPolygon(pointTurf, polygonGeojson);
      
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
                <div class="first-row-popup"><span class="popup-title">Code IRIS ${irisPolygon.properties.code_iris}</span><div class="popup-badge popup-iris-tag">IRIS</div></div><br>
                <span style="font-weight:600">Name</span> : ${irisPolygon.properties.nom_iris}<br><br>
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

                polygon.addTo(userCsvLayer); // add it to the user csv layer
            };
        };
  
        totalUniqueScreens.forEach(screen => {
            clusterMarkers.addLayer(screen);
        });
  
        return {fileType:"iris file",status:"processing: OK",totalScreens:totalUniqueScreens.size,userLayer:irisCodes.length};
  
    } catch (error) {
  
      console.error(error); // Enregistre l'erreur dans la console
      return {fileType:"iris file",status:"processing: NOT OK",errorMessage:error.message};
  
    };

};