async function geojsonPolygonFunction(fileContent){

    try {
  
        var polygon = JSON.parse(fileContent);

        var totalUniqueScreens = new Set();
  
        userGeojsonLayer.addData(polygon);
  
        userGeojsonLayer.eachLayer(polygon => {

            let screensPerPolygon = new Set();

            let polygonID = polygon._leaflet_id
  
            var turfPolygon = turf.polygon(polygon.feature.geometry.coordinates)
  
            ttdScreensLayer.eachLayer(function (layer) {
  
                var pointTurf = turf.point([
                    layer.feature.geometry.coordinates[0],
                    layer.feature.geometry.coordinates[1],
                ]);
  
                var inside = turf.inside(pointTurf, turfPolygon);
      
                if (inside && !totalUniqueScreens.has(layer)) {
                    clusterMarkers.addLayer(layer);
                    totalUniqueScreens.add(layer);
                };

                if (inside) {
                    screensPerPolygon.add(layer);
                };

            });

            selectedCPM = []

            screensPerPolygon.forEach(layer => {
    
                Object.keys(layer.feature.properties).forEach(key => {
                    if (key.startsWith('FloorCPM($)') && layer.feature.properties[key] != "0") {
                      selectedCPM.push(layer.feature.properties[key]);
                    };
                });
    
            });
    
            var cpmAverage = (selectedCPM.reduce((acc, val) => acc + val, 0) / selectedCPM.length).toFixed(2)

            let popupUserContent =
    
            `
            <div class="first-row-popup"><span class="popup-title">Layer ${userGeojsonLayer.getLayers().findIndex(layer => layer._leaflet_id == polygonID) + 1}</span><div class="popup-badge popup-polygon-tag">Polygon</div></div><br>
            <div class="forecast-popup">
            <div class="screens-section forecast-section">
                <img src="./img/screens.svg" alt="" class="screens-img-popup">
                <span class="span-img-popup">${screensPerPolygon.size}</span>
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

        });
  
      return {fileType:"geojson polygon file",status:"processing: OK",totalScreens:totalUniqueScreens.size,userLayer:userGeojsonLayer.getLayers().length};
  
    } catch (error) {
  
      console.error(error);
      return {fileType:"geojson polygon file",status:"processing: NOT OK",errorMessage:error.message};
  
    };
  
};