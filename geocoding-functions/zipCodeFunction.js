async function zipCodeFunction(fileContent) {
    try{

        let totalUniqueScreens = new Set();

        fileContent.forEach((point) => {
            ttdScreensLayer.eachLayer(function (layer) {
                if ((point["ZIP code"].toString().trim() == layer.feature.properties.Zipcode.trim()) && !totalUniqueScreens.has(layer)){
                    clusterMarkers.addLayer(layer);
                    totalUniqueScreens.add(layer);
                };
            });
        });

        return {fileType:"zip code file",status:"processing: OK",totalScreens:totalUniqueScreens.size,userLayer:fileContent.length};

    } catch (error){

        console.error(error);
        return {fileType:"zip code file",status:"processing: NOT OK",errorMessage:error.message};

    }
}