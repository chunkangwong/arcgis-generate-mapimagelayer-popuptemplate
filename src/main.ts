import Map from "@arcgis/core/Map";
import MapImageLayer from "@arcgis/core/layers/MapImageLayer";
import esriRequest from "@arcgis/core/request";
import MapView from "@arcgis/core/views/MapView";
import LayerList from "@arcgis/core/widgets/LayerList";
import "./style.css";
import config from "./sample/config.json";

const mapImageLayerUrl =
  "https://geriapp.esrisa.com/swa/rest/services/NEWater_Network/MapServer";

const mapImageLayer = new MapImageLayer({
  url: mapImageLayerUrl,
  sublayers: config.subLayers,
});

const map = new Map({
  basemap: "topo-vector",
  layers: [mapImageLayer],
});

const view = new MapView({
  container: "viewDiv",
  map: map,
  center: [103.78, 1.34],
  zoom: 12,
});

const layerList = new LayerList({
  view: view,
});

view.ui.add(layerList, "top-right");

view.whenLayerView(mapImageLayer).then(async () => {
  console.log("loading...");
  const popupTemplate = await generatePopupTemplate(mapImageLayerUrl);
  console.log(popupTemplate);
});

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
  return Promise.all(
    sublayers.map((sublayer: any) => generatePopupTemplate(url, sublayer.id))
  ).then((popupTemplates) => {
    return {
      title: layer.name || layer.mapName,
      visible: layer.defaultVisibility,
      id: layer.id,
      subLayers: popupTemplates,
    };
  });
};
