# DOOH Planning tool (France)

This tool was designed to geocode GPS points, postal addresses, IRIS codes, or polygons all over France. It enables targeting using files (CSV or GeoJSON), as well as providing simple filters based on the inherent properties of each DOOH panel in the inventory.




## Documentation

Geocoding is mainly done through the following libraries:

- https://leafletjs.com // Leaflet is the leading open-source JavaScript library for mobile-friendly interactive maps. Weighing just about 42 KB of JS, it has all the mapping features most developers ever need.

-  https://github.com/Leaflet/Leaflet.markercluster // Provides animated Marker Clustering functionality for Leaflet.

-  https://turfjs.org // Advanced geospatial analysis for browsers and Node.js.

The frames inventory is based on data from the following SSPs: Broadsign, Hivestack, and VIOOH. It is a GeoJSON file containing all the DOOH frames available for targeting via The Trade Desk in France. A major improvement could be a direct connection with our partners' APIs.




## Features

- Lat Long targeting
- Adresses targeting
- IRIS code targeting (France only)
- Polygon targeting
- MultiPolygon targeting

-->CSV or GEOSJON files only
