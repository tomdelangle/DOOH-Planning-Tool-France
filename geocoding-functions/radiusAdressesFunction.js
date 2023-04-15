async function radiusAdressesFunction(fileContent){

    try {

        let markersToDisplay = [];
        let totalUniqueScreens = new Set();

        let myIcon = L.icon({
            iconUrl: './img/blue-yellow-pin.png',
            iconSize: [45, 45],
            iconAnchor: [22.5, 45],
            popupAnchor: [0, -45]
        });

        for (let address of fileContent) {

            let screensPerPoint = new Set();

            let apiUrl = `https://api-adresse.data.gouv.fr/search/?q=${address["Street address"]}+${address["ZIP code"]}+${address["City"]}+${address["Country"]}&limit=1` // french government API endpoint converting adresses to lat/long
            await new Promise(resolve => setTimeout(resolve, 50)); // adding a 0,05 sec delay -> ajust it if necessary
            let response = await fetch(apiUrl);
            let data = await response.json();
            let addressGPSLatLong = data.features[0].geometry.coordinates
            let pointTurfFrom = turf.point([addressGPSLatLong[1], addressGPSLatLong[0]]);

            ttdScreensLayer.eachLayer(function (layer) {
                
                let pointTurfTo = turf.point([layer.feature.geometry.coordinates[1], layer.feature.geometry.coordinates[0]]);
                let distance = turf.distance(pointTurfFrom, pointTurfTo, { units: "meters" });
                if (distance < address["Radius (meters)"] && !totalUniqueScreens.has(layer)) {
                    totalUniqueScreens.add(layer);
                };
                if (distance < address["Radius (meters)"]) {
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
            <div class="first-row-popup"><span class="popup-title">${address["Name"] != null ? address["Name"] : "-"}</span><div class="popup-badge popup-adress-tag">Adress</div></div><br>
            <span style="font-weight:600">Adresse</span> : ${address["Street address"]}, ${address["ZIP code"]}, ${address["City"]}<br>
            <span style="font-weight:600">Radius (meters)</span> : ${address["Radius (meters)"]}m<br><br>
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

            let marker = L.marker([addressGPSLatLong[1], addressGPSLatLong[0]], {
                icon: myIcon
            });

            marker.bindPopup(popupUserContent,{closeButton: false});

            marker.on('click', function(e) {
                map.setView(e.target.getLatLng(), 12);
            });
            
            let circle = L.circle([addressGPSLatLong[1], addressGPSLatLong[0]], {
                radius: address["Radius (meters)"],
                fillColor: "blue",
                fillOpacity: 0.1,
            });

            markersToDisplay.push(marker, circle);

        };

        userCsvLayer.addLayer(L.layerGroup(markersToDisplay));

        totalUniqueScreens.forEach(screen => {
        clusterMarkers.addLayer(screen);
        })

        return {fileType:"radius adresses file",status:"processing: OK",totalScreens:totalUniqueScreens.size,userLayer:markersToDisplay.length/2};

    } catch(error) {

        console.log(error);
        return {fileType:"radius adresses file",status:"processing: NOT OK",errorMessage:error.message};

    };

};