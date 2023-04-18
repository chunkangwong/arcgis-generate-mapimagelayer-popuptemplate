# ArcGIS Generate Popup Template for MapImageLayer

This sample demonstrates how to recursively query a layer and its nested sublayers to generate a popup template config for a MapImageLayer.

# Instructions

1. Changed the following line to your own ArcGIS MapServer URL:

```js
const mapImageLayerUrl =
  "https://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer";
```

2. Run the sample:

```bash
npm install
npm run dev
```

3. Open the browser and navigate to http://localhost:5173/

4. Click the "Download Popup Template" button at the top left corner to download the popup template config.
