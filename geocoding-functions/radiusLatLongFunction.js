
async function radiusLatLongFunction(fileContent) {

    try {

        let turfDistanceOptions = { units: "meters" };
        let totalUniqueScreens = new Set();

        let myIcon = L.icon({
            iconUrl: './img/blue-yellow-pin.png',
            iconSize: [45, 45],
            iconAnchor: [22.5, 45],
            popupAnchor: [0, -45]
        });

        fileContent.forEach((point) => {

            let screensPerPoint = new Set();

            let pointTurfFrom = turf.point([point.Latitude, point.Longitude]);

            // asking for each TTD screens if the distance between with csv point is smaller than radius.

            ttdScreensLayer.eachLayer(function (layer) {
                
                // geoJSONLayer -->  TTD screens
                let pointTurfTo = turf.point([
                layer.feature.geometry.coordinates[1],
                layer.feature.geometry.coordinates[0],
                ]);

                // use Turf.js to calculate distance between the points.

                let distance = turf.distance(
                pointTurfFrom,
                pointTurfTo,
                turfDistanceOptions
                );

                // if distance smaller than radius AND not present in already added points --> add TTD screens to ClusterMarkers layer

                if (distance < point["Radius (meters)"] && !totalUniqueScreens.has(layer)) {
                //clusterMarkers.addLayer(layer);
                totalUniqueScreens.add(layer); // add TTD screens to added points
                };

                if (distance < point["Radius (meters)"]) {
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
            <div class="first-row-popup"><span class="popup-title">${point.Name != null ? point.Name : "-"}</span><div class="popup-badge popup-laglong-tag">Lat/Long</div></div><br>
            <span style="font-weight:600">Latitude</span> : ${point.Latitude.toFixed(2)}<br>
            <span style="font-weight:600">Longitude</span> : ${point.Longitude.toFixed(2)}<br>
            <span style="font-weight:600">Radius (meters)</span> : ${point["Radius (meters)"]}<br><br>
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

            let marker = L.marker([point.Latitude, point.Longitude], {
                icon: myIcon
            }).addTo(userCsvLayer);

            marker.bindPopup(popupUserContent,{closeButton: false});

            marker.on('click', function(e) {
                map.setView(e.target.getLatLng(), 12);
            });

            L.circle([point.Latitude, point.Longitude], {
                radius: point["Radius (meters)"],
                fillColor: "blue",
                fillOpacity: 0.1,
            }).addTo(userCsvLayer);

        });

        return {fileType:"radius lat/long file",status:"processing: OK",totalScreens:totalUniqueScreens.size,userLayer:fileContent.length};

    } catch (error) {

        console.error(error);
        return {fileType:"radius lat/long file",status:"processing: NOT OK",errorMessage:error.message};

    };

};
