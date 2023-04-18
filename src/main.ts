import Map from "@arcgis/core/Map";
import MapImageLayer from "@arcgis/core/layers/MapImageLayer";
import esriRequest from "@arcgis/core/request";
import MapView from "@arcgis/core/views/MapView";
import LayerList from "@arcgis/core/widgets/LayerList";
import "./style.css";

const mapImageLayerUrl =
  "https://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer";

const downloadIcon = document.createElement("span");
downloadIcon.classList.add("esri-icon", "esri-icon-duplicate");
downloadIcon.setAttribute("title", "Download Popup Template");

const loadingIcon = document.createElement("span");
loadingIcon.classList.add("esri-icon", "esri-icon-loading-indicator");

const mapImageLayer = new MapImageLayer({
  url: mapImageLayerUrl,
});

const map = new Map({
  basemap: "topo-vector",
  layers: [mapImageLayer],
});

const view = new MapView({
  container: "viewDiv",
  map: map,
  center: [-98.5795, 39.8282],
  zoom: 4,
});

const layerList = new LayerList({
  view: view,
});

view.ui.add(layerList, "top-right");

view.whenLayerView(mapImageLayer).then(async () => {
  const btn = document.createElement("div");
  btn.classList.add("esri-widget", "esri-widget--button", "esri-interactive");
  btn.appendChild(downloadIcon);

  view.ui.add(btn, "top-left");

  btn.addEventListener("click", async () => {
    btn.innerHTML = "";
    btn.appendChild(loadingIcon);

    const popupTemplate = await generatePopupTemplate(mapImageLayerUrl);

    const a = document.createElement("a");
    a.href = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(popupTemplate, null, 4)
    )}`;
    a.download = "popupTemplate.json";
    a.click();
    a.remove();

    btn.innerHTML = "";
    btn.appendChild(downloadIcon);
  });
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
    sublayers.map(async (sublayer: any) => {
      const popupTemplates = await generatePopupTemplate(url, sublayer.id);
      return {
        title: layer.name || layer.mapName,
        visible: layer.defaultVisibility,
        id: layer.id,
        subLayers: popupTemplates,
      };
    })
  );
};
