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

## Notes

Following is the main recursive function to generate the popup template config:

```ts
const generatePopupTemplate = async (url: string, id?: number) => {
  const response = await esriRequest(`${url}/${id ?? ""}?f=json`);
  const layer = response.data;
  const sublayers = layer.layers || layer.subLayers;
  if (!sublayers || sublayers.length === 0) {
    return {
      title: layer.name,
      id: layer.id,
      visible: layer.defaultVisibility,
      popupTemplate: {
        title: `{${layer.displayField}}`,
        content: [
          {
            type: "fields",
            fieldInfos:
              layer.fields?.map((field: any) => {
                return {
                  fieldName: field.name,
                  label: field.alias,
                };
              }) || [],
          },
        ],
      },
    };
  }
  return {
    title: layer.name || layer.mapName,
    visible: layer.defaultVisibility,
    id: layer.id,
    subLayers: await Promise.all(
      sublayers.map(
        async (sublayer: any) => await generatePopupTemplate(url, sublayer.id)
      )
    ),
  };
};
```
