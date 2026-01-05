import { jsx, jsxs } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@react-router/node";
import { ServerRouter, UNSAFE_withComponentProps, Outlet, UNSAFE_withErrorBoundaryProps, isRouteErrorResponse, Meta, Links, ScrollRestoration, Scripts } from "react-router";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { useState, useMemo, useCallback, createContext, useContext } from "react";
const streamTimeout = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, routerContext, loadContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    let userAgent = request.headers.get("user-agent");
    let readyOption = userAgent && isbot(userAgent) || routerContext.isSpaMode ? "onAllReady" : "onShellReady";
    let timeoutId = setTimeout(
      () => abort(),
      streamTimeout + 1e3
    );
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(ServerRouter, { context: routerContext, url: request.url }),
      {
        [readyOption]() {
          shellRendered = true;
          const body = new PassThrough({
            final(callback) {
              clearTimeout(timeoutId);
              timeoutId = void 0;
              callback();
            }
          });
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          pipe(body);
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest,
  streamTimeout
}, Symbol.toStringTag, { value: "Module" }));
function ensureNumber(v, name = "value") {
  const n = Number(v);
  if (!Number.isFinite(n)) throw new TypeError(`${name} must be a finite number: ${v}`);
  return n;
}
function useZoningCalculator(init2 = {}) {
  const [far, setFar] = useState(() => ensureNumber(init2.far ?? 1, "far"));
  const [siteWidth, setSiteWidth] = useState(() => ensureNumber(init2.siteWidth ?? 40, "siteWidth"));
  const [siteDepth, setSiteDepth] = useState(() => ensureNumber(init2.siteDepth ?? 75, "siteDepth"));
  const defaultSetbacks = { front: 12.5, right: 5, back: 10, left: 5 };
  const [setbacks, setSetbacksState] = useState(() => {
    const s = { ...defaultSetbacks, ...init2.setbacks ?? {} };
    for (const k of ["front", "right", "back", "left"]) s[k] = ensureNumber(s[k], `setbacks.${k}`);
    return s;
  });
  const [floorHeight, setFloorHeight] = useState(() => ensureNumber(init2.floorHeight ?? 10, "floorHeight"));
  const [maxHeight, setMaxHeight] = useState(() => ensureNumber(init2.maxHeight ?? 35, "maxHeight"));
  const [averageUnitSize, setAverageUnitSize] = useState(() => ensureNumber(init2.averageUnitSize ?? 1e3, "averageUnitSize"));
  const [minUnitSize, setMinUnitSize] = useState(() => ensureNumber(init2.minUnitSize ?? 500, "minUnitSize"));
  const [maxUnits, setMaxUnits] = useState(() => ensureNumber(init2.maxUnitSize ?? -1, "Max Units"));
  const [parkingPerUnit, setParkingPerUnit] = useState(() => ensureNumber(init2.parkingPerUnit ?? 0, "parkingPerUnit"));
  const [parkingLength, setParkingLength] = useState(() => ensureNumber(init2.parkingLength ?? 18, "parkingLength"));
  const [parkingWidth, setParkingWidth] = useState(() => ensureNumber(init2.parkingWidth ?? 8.6, "parkingWidth"));
  const [parkingLaneWidth, setParkingLaneWidth] = useState(() => ensureNumber(init2.parkingLaneWidth ?? 12, "parkingLaneWidth"));
  const [openSpacePerUnit, setOpenSpacePerUnit] = useState(() => ensureNumber(init2.openSpacePerUnit ?? 0, "openSpacePerUnit"));
  const [maxCoverage, setMaxCoverage] = useState(() => ensureNumber(init2.maxCoverage ?? 1, "maxCoverage"));
  const siteBaseArea = useMemo(() => siteWidth * siteDepth, [siteWidth, siteDepth]);
  const maxSiteArea = useMemo(() => siteBaseArea * far, [siteBaseArea, far]);
  const calculateBuildingWidth = useCallback(() => {
    return Math.max(0, siteWidth - setbacks.left - setbacks.right);
  }, [siteWidth, setbacks]);
  const calculateUnitSpaceNeededMax = useCallback((width, depth) => {
    const area = width * depth;
    const parkingSpotArea = parkingLength * parkingWidth;
    let unitAreaPlus = averageUnitSize + parkingSpotArea * parkingPerUnit;
    if (area / unitAreaPlus * parkingPerUnit > 2) {
      const parkingLaneArea = parkingLaneWidth * parkingWidth;
      unitAreaPlus += parkingLaneArea * parkingPerUnit;
    }
    return Math.round(unitAreaPlus);
  }, [averageUnitSize, openSpacePerUnit, parkingLength, parkingWidth, parkingPerUnit, parkingLaneWidth]);
  const calculateUnitSpaceNeededMin = useCallback((width, depth) => {
    const area = width * depth;
    const parkingSpotArea = parkingLength * parkingWidth;
    let unitAreaPlus = minUnitSize + parkingSpotArea * parkingPerUnit;
    if (area / unitAreaPlus * parkingPerUnit > 2) {
      const parkingLaneArea = parkingLaneWidth * parkingWidth;
      unitAreaPlus += parkingLaneArea * parkingPerUnit;
    }
    return Math.round(unitAreaPlus);
  }, [averageUnitSize, openSpacePerUnit, parkingLength, parkingWidth, parkingPerUnit, parkingLaneWidth]);
  const calculateBuildingDepth = useCallback(() => {
    const width = calculateBuildingWidth();
    const rawDepth = Math.max(0, siteDepth - setbacks.front - setbacks.back);
    if (width <= 0 || rawDepth <= 0) return 0;
    if (maxUnits > -1) {
      return rawDepth;
    }
    let depth = rawDepth;
    let prev = -1;
    let maxAreaNeeded = calculateUnitSpaceNeededMax(width, depth);
    const openSpaceDepthPer = openSpacePerUnit / width;
    const minAreaNeeded = calculateUnitSpaceNeededMin(width, depth);
    for (let i = 0; i < maxSiteArea / minAreaNeeded; i++) {
      const baseArea = Math.max(0, width * depth);
      if (baseArea <= 0) return 0;
      let buildingHeight = 0;
      let area = 0;
      for (area = baseArea; area <= maxSiteArea; area += baseArea) {
        buildingHeight += floorHeight;
      }
      if (maxSiteArea - (area - baseArea) > 0) {
        buildingHeight += floorHeight;
      }
      buildingHeight = Math.min(buildingHeight, Math.floor(maxHeight / floorHeight) * floorHeight);
      const minAreaNeeded2 = calculateUnitSpaceNeededMin(width, depth);
      if (baseArea * (buildingHeight / floorHeight) < i * maxAreaNeeded - minAreaNeeded2) {
        depth = prev;
        break;
      }
      prev = depth;
      depth = rawDepth - openSpaceDepthPer * i;
      if (depth <= 0) return 0;
    }
    if (depth * width > maxSiteArea * maxCoverage) {
      depth = maxSiteArea * maxCoverage;
    }
    return Math.round(depth * 100) / 100;
  }, [siteDepth, setbacks, calculateBuildingWidth, maxSiteArea, averageUnitSize, openSpacePerUnit, parkingPerUnit, parkingLength, parkingWidth, maxCoverage]);
  const calculateBuildingHeight = useCallback(() => {
    const baseBuildingArea = calculateBuildingWidth() * calculateBuildingDepth();
    let buildingHeight = 0;
    let area = 0;
    for (area = baseBuildingArea; area <= maxSiteArea; area += baseBuildingArea) {
      buildingHeight += floorHeight;
    }
    if (maxSiteArea - (area - baseBuildingArea) > 0) {
      buildingHeight += floorHeight;
    }
    return Math.min(buildingHeight, Math.floor(maxHeight / floorHeight) * floorHeight);
  }, [calculateBuildingWidth, calculateBuildingDepth, maxSiteArea, floorHeight, maxHeight]);
  const calculateBuildingArea = useCallback(() => {
    const floorArea = calculateBuildingWidth() * calculateBuildingDepth();
    const visibleFloors = calculateBuildingHeight() / floorHeight;
    const buildingAreaSoFar = floorArea * (visibleFloors - 1);
    const topFloorArea = maxSiteArea - buildingAreaSoFar;
    let finalArea = buildingAreaSoFar;
    if (topFloorArea < floorArea) {
      finalArea += topFloorArea;
    } else {
      finalArea += floorArea;
    }
    return finalArea;
  }, [calculateBuildingWidth, calculateBuildingDepth, calculateBuildingHeight(), maxSiteArea, floorHeight]);
  const calculateNumberOfUnits = useCallback(() => {
    if (maxUnits > -1) {
      return maxUnits;
    }
    const area = calculateBuildingArea();
    const depth = calculateBuildingDepth();
    const width = calculateBuildingWidth();
    const parkingSpotArea = parkingLength * parkingWidth;
    let unitAreaPlus = averageUnitSize + parkingSpotArea * parkingPerUnit + openSpacePerUnit;
    if (area / unitAreaPlus * parkingPerUnit > 2) {
      const parkingLaneArea = parkingLaneWidth * parkingWidth;
      unitAreaPlus += parkingLaneArea * parkingPerUnit;
    }
    let units = Math.max(0, Math.round(area / unitAreaPlus));
    if (units == 0) {
      return 0;
    }
    if (openSpacePerUnit != 0) {
      while (units * openSpacePerUnit / width + depth > siteDepth - setbacks.front - setbacks.back) {
        units--;
        if (units < 0) {
          break;
        }
      }
    }
    return units;
  }, [calculateBuildingArea, averageUnitSize, parkingLength, parkingWidth, parkingPerUnit, parkingLaneWidth, openSpacePerUnit]);
  const calculateParkingArea = useCallback(() => {
    const parkingSpotArea = parkingLength * parkingWidth;
    const numUnits = calculateNumberOfUnits();
    let fullParkingArea = numUnits * parkingPerUnit * parkingSpotArea;
    let parkingLaneArea = 0;
    if (Math.round(numUnits * parkingPerUnit) > 2) {
      parkingLaneArea = parkingLaneWidth * parkingWidth;
      fullParkingArea += numUnits * parkingLaneArea * parkingPerUnit;
    }
    return Math.round(Math.round(fullParkingArea / (parkingSpotArea + parkingLaneArea)) * (parkingSpotArea + parkingLaneArea));
  }, [calculateNumberOfUnits, parkingLength, parkingWidth, parkingPerUnit, parkingLaneWidth]);
  const calculateResidentialArea = useCallback(() => {
    return Math.max(0, Math.round(calculateBuildingArea() - calculateParkingArea()));
  }, [calculateBuildingArea, calculateParkingArea]);
  const setSetbacks = useCallback((obj) => {
    if (obj == null || typeof obj !== "object") throw new TypeError("setbacks must be an object");
    const s = { front: 0, right: 0, back: 0, left: 0, ...obj };
    for (const k of ["front", "right", "back", "left"]) {
      s[k] = ensureNumber(s[k], `setbacks.${k}`);
    }
    setSetbacksState(s);
  }, []);
  const setEverything = useCallback((init22 = {}) => {
    setFar(ensureNumber(init22.far ?? far));
    setSiteWidth(ensureNumber(init22.siteWidth ?? siteWidth));
    setSiteDepth(ensureNumber(init22.siteDepth ?? siteDepth));
    setSetbacks(init22.setbacks ?? setbacks);
    setFloorHeight(ensureNumber(init22.floorHeight ?? floorHeight));
    setMaxHeight(ensureNumber(init22.maxHeight ?? maxHeight));
    setAverageUnitSize(ensureNumber(init22.averageUnitSize ?? averageUnitSize));
    setMinUnitSize(ensureNumber(init22.minUnitSize ?? minUnitSize));
    setParkingPerUnit(ensureNumber(init22.parkingPerUnit ?? parkingPerUnit));
    setParkingLength(ensureNumber(init22.parkingLength ?? parkingLength));
    setParkingWidth(ensureNumber(init22.parkingWidth ?? parkingWidth));
    setParkingLaneWidth(ensureNumber(init22.parkingLaneWidth ?? parkingLaneWidth));
    setOpenSpacePerUnit(ensureNumber(init22.openSpacePerUnit ?? openSpacePerUnit));
    setMaxUnits(ensureNumber(init22.maxUnits ?? maxUnits));
    setMaxCoverage(ensureNumber(init22.maxCoverage ?? maxCoverage));
  }, []);
  return {
    // raw state values
    far,
    setFar,
    siteWidth,
    setSiteWidth,
    siteDepth,
    setSiteDepth,
    setbacks,
    setSetbacks,
    floorHeight,
    setFloorHeight,
    maxHeight,
    setMaxHeight,
    averageUnitSize,
    setAverageUnitSize,
    minUnitSize,
    setMinUnitSize,
    parkingPerUnit,
    setParkingPerUnit,
    parkingLength,
    setParkingLength,
    parkingWidth,
    setParkingWidth,
    parkingLaneWidth,
    setParkingLaneWidth,
    openSpacePerUnit,
    setOpenSpacePerUnit,
    maxUnits,
    setMaxUnits,
    maxCoverage,
    setMaxCoverage,
    // derived
    siteBaseArea,
    maxSiteArea,
    calculateBuildingWidth,
    calculateBuildingDepth,
    calculateBuildingHeight,
    calculateBuildingArea,
    calculateNumberOfUnits,
    calculateParkingArea,
    calculateResidentialArea,
    // functions
    setEverything
  };
}
const ZoningContext = createContext(void 0);
const ZoningProvider = ({ children, init: init2 }) => {
  const zoningData = useZoningCalculator(init2);
  return /* @__PURE__ */ jsx(ZoningContext.Provider, { value: zoningData, children });
};
const useZoningContext = () => {
  const context = useContext(ZoningContext);
  if (!context) {
    throw new Error("useZoningContext must be used within a ZoningProvider");
  }
  return context;
};
const scale = 10;
const configJson = {
  scale
};
function useConfig(init2) {
  const [scale2, setScale] = useState(init2.scale || 10);
  return {
    scale: scale2,
    setScale
  };
}
const ConfigContext = createContext(void 0);
const ConfigProvider = ({ children, init: init2 }) => {
  const config = useConfig(init2);
  return /* @__PURE__ */ jsx(ConfigContext.Provider, { value: config, children });
};
const useConfigContext = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error("useConfigContext must be used within a ConfigProvider");
  }
  return context;
};
const init = { "siteWidth": 50, "siteDepth": 75, "maxHeight": 35, "floorHeight": 10, "maxFar": 2, "setbacks": { "front": 12.5, "right": 3, "back": 10, "left": 3 }, "averageUnitSize": 800, "minUnitSize": 500, "showOverflowArea": true, "parkingPerUnit": 0, "parkingLength": 18, "parkingWidth": 8.6, "laneWidth": 12, "openSpacePerUnit": 75, "elevationScale": 10 };
const zoning = { "missingMiddle1": { "title": "Missing Middle Far 1 - Inner Lot", "maxHeight": 35, "far": 1, "setbacks": { "front": 12.5, "right": 3, "back": 15, "left": 3 }, "parkingPerUnit": 0, "parkingLength": 18, "parkingWidth": 8.6, "ParkingLaneWidth": 12, "openSpacePerUnit": 125 }, "missingMiddle1-corner": { "title": "Missing Middle Far 1 - Corner Lot", "maxHeight": 35, "far": 1, "setbacks": { "front": 12.5, "right": 3, "back": 15, "left": 12.5 }, "parkingPerUnit": 0, "parkingLength": 18, "parkingWidth": 8.6, "ParkingLaneWidth": 12, "openSpacePerUnit": 125 }, "missingMiddle2": { "title": "Missing Middle Far 2 - Inner Lot", "maxHeight": 35, "floorHeight": 10, "far": 2, "setbacks": { "front": 12.5, "right": 3, "back": 10, "left": 3 }, "parkingPerUnit": 0, "parkingLength": 18, "parkingWidth": 8.6, "ParkingLaneWidth": 12, "openSpacePerUnit": 75 }, "missingMiddle2-corner": { "title": "Missing Middle Far 2 - Corner Lot", "maxHeight": 35, "floorHeight": 10, "far": 2, "setbacks": { "front": 12.5, "right": 3, "back": 10, "left": 12.5 }, "parkingPerUnit": 0, "parkingLength": 18, "parkingWidth": 8.6, "ParkingLaneWidth": 12, "openSpacePerUnit": 75 }, "r1": { "title": "R-1 Single Family Housing", "maxHeight": 35, "floorHeight": 10, "far": 2, "setbacks": { "front": 20, "right": 5, "back": 15, "left": 5 }, "parkingPerUnit": 2, "parkingLength": 20, "parkingWidth": 10, "ParkingLaneWidth": 0, "openSpacePerUnit": 0, "allowedUses": ["residential"], "maxUnits": 1, "minLotWidth": 52, "miniLotDepth": 100, "maxLotWidth": -1, "maxLotDepth": 160, "maxCoverage": 0.4 } };
const presetsJson = {
  init,
  zoning
};
const links = () => [{
  rel: "preconnect",
  href: "https://fonts.googleapis.com"
}, {
  rel: "preconnect",
  href: "https://fonts.gstatic.com",
  crossOrigin: "anonymous"
}, {
  rel: "stylesheet",
  href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
}];
function Layout({
  children
}) {
  return /* @__PURE__ */ jsxs("html", {
    lang: "en",
    children: [/* @__PURE__ */ jsxs("head", {
      children: [/* @__PURE__ */ jsx("script", {
        type: "text/javascript",
        src: "http://livejs.com/live.js"
      }), /* @__PURE__ */ jsx("meta", {
        charSet: "utf-8"
      }), /* @__PURE__ */ jsx("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      }), /* @__PURE__ */ jsx(Meta, {}), /* @__PURE__ */ jsx(Links, {})]
    }), /* @__PURE__ */ jsxs("body", {
      children: [children, /* @__PURE__ */ jsx(ScrollRestoration, {}), /* @__PURE__ */ jsx(Scripts, {})]
    })]
  });
}
const root = UNSAFE_withComponentProps(function App() {
  return /* @__PURE__ */ jsx(ConfigProvider, {
    init: configJson,
    children: /* @__PURE__ */ jsx(ZoningProvider, {
      init: presetsJson.init,
      children: /* @__PURE__ */ jsx(Outlet, {})
    })
  });
});
const ErrorBoundary = UNSAFE_withErrorBoundaryProps(function ErrorBoundary2({
  error
}) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack;
  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details = error.status === 404 ? "The requested page could not be found." : error.statusText || details;
  }
  return /* @__PURE__ */ jsxs("main", {
    className: "pt-16 p-4 container mx-auto",
    children: [/* @__PURE__ */ jsx("h1", {
      children: message
    }), /* @__PURE__ */ jsx("p", {
      children: details
    }), stack]
  });
});
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ErrorBoundary,
  Layout,
  default: root,
  links
}, Symbol.toStringTag, { value: "Module" }));
function Header() {
  return /* @__PURE__ */ jsxs("div", { id: "header-container", children: [
    /* @__PURE__ */ jsxs("div", { id: "header-title-container", children: [
      /* @__PURE__ */ jsx("div", { id: "header-icon", children: /* @__PURE__ */ jsx("img", { src: "../assets/city.svg", alt: "" }) }),
      /* @__PURE__ */ jsx("h1", { id: "header-title", children: "Zoning Visualizer" })
    ] }),
    /* @__PURE__ */ jsx("div", { id: "header-links", children: /* @__PURE__ */ jsxs("a", { id: "github-link", href: "https://github.com/awilmoth895/FAR-Visualizer/tree/master", target: "_blank", rel: "noopener noreferrer", children: [
      /* @__PURE__ */ jsx("img", { id: "github-icon", src: "../assets/github-mark-white.svg", alt: "" }),
      "Source Code"
    ] }) })
  ] });
}
function sidebar() {
  const {
    far,
    setFar,
    siteWidth,
    setSiteWidth,
    siteDepth,
    setSiteDepth,
    setbacks,
    setSetbacks,
    // floorHeight, setFloorHeight,
    maxHeight,
    setMaxHeight,
    averageUnitSize,
    setAverageUnitSize,
    minUnitSize,
    setMinUnitSize,
    parkingPerUnit,
    setParkingPerUnit,
    // parkingLength, parkingWidth, parkingLaneWidth,
    openSpacePerUnit,
    setOpenSpacePerUnit,
    maxUnits,
    setMaxUnits,
    maxCoverage,
    setMaxCoverage,
    // siteBaseArea, maxSiteArea,
    calculateBuildingWidth,
    calculateBuildingDepth,
    calculateBuildingHeight,
    calculateBuildingArea,
    calculateNumberOfUnits,
    // calculateParkingArea, calculateResidentialArea,
    setEverything
  } = useZoningContext();
  const {
    scale: scale2,
    setScale
  } = useConfigContext();
  const [preset, setPreset] = useState("Custom");
  const [unitCalcType, setUnitCalcType] = useState("Average Unit Size");
  const handleFarChange = (e) => setFar(Number(e.target.value));
  const handleSiteWidthChange = (e) => setSiteWidth(Number(e.target.value));
  const handleSiteDepthChange = (e) => setSiteDepth(Number(e.target.value));
  const handleMaxHeightChange = (e) => setMaxHeight(Number(e.target.value));
  const handleAverageUnitSizeChange = (e) => setAverageUnitSize(Number(e.target.value));
  const handleParkingPerUnitsChange = (e) => setParkingPerUnit(Number(e.target.value));
  const handleOpenSpacePerUnitChange = (e) => setOpenSpacePerUnit(Number(e.target.value));
  const handleMaxUnitChange = (e) => setMaxUnits(Number(e.target.value));
  const handleMaxCoverageChange = (e) => setMaxCoverage(Number(e.target.value));
  const handleSetbackChange = (side) => (e) => {
    const val = Number(e.target.value);
    console.log("Setback Change: ", side, val);
    setSetbacks({ ...setbacks ?? {}, [side]: val });
  };
  const handleUnitCalcTypeChange = (e) => {
    setUnitCalcType(e.target.value);
    if (e.target.value == "Average Unit Size") {
      setAverageUnitSize(averageUnitSize * maxUnits);
      setMaxUnits(-1);
    }
    var tempMaxUnits = maxUnits;
    if (maxUnits == -1) {
      tempMaxUnits = 1;
      setMaxUnits(1);
    }
    setAverageUnitSize(buildingArea / tempMaxUnits);
  };
  const buildingArea = calculateBuildingArea();
  function setPresets(key) {
    setPreset(presetsJson.zoning[key].title);
    setEverything(presetsJson.zoning[key]);
    if (presetsJson.zoning[key].maxUnits != -1) {
      setUnitCalcType("Max Unit");
    } else {
      setUnitCalcType("Average Unit Size");
    }
  }
  function presets() {
    const presetNames = Object.keys(presetsJson.zoning);
    return /* @__PURE__ */ jsxs("div", { className: "sidebar-section", id: "presets-container", children: [
      /* @__PURE__ */ jsx("h2", { className: "sidebar-title", children: "Presets" }),
      /* @__PURE__ */ jsx("div", { className: "description-box", children: preset }),
      /* @__PURE__ */ jsx("div", { className: "content-box", children: Array.from(presetNames).map((name, i) => {
        return /* @__PURE__ */ jsx("div", { className: "preset-item", children: /* @__PURE__ */ jsx("button", { className: "preset-button", onClick: () => setPresets(name), children: presetsJson.zoning[name].title }) }, i);
      }) })
    ] });
  }
  function unitCalc() {
    if (unitCalcType == "Average Unit Size" || maxUnits == -1) {
      return /* @__PURE__ */ jsxs("label", { children: [
        "Average Unit Size:",
        /* @__PURE__ */ jsx("input", { type: "number", min: minUnitSize, max: 3e3, step: 50, value: averageUnitSize, onChange: handleAverageUnitSizeChange }),
        "sqft"
      ] });
    }
    return /* @__PURE__ */ jsxs("label", { children: [
      "Max Units:",
      /* @__PURE__ */ jsx("input", { type: "number", min: 0, max: 50, step: 1, value: maxUnits, onChange: handleMaxUnitChange })
    ] });
  }
  function unitCalcMethod() {
    return /* @__PURE__ */ jsxs("div", { children: [
      "Unit Calculation Method:",
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("label", { children: [
          "Average Unit Size",
          /* @__PURE__ */ jsx("input", { defaultChecked: true, type: "radio", name: "unitCalc", value: "Average Unit Size", onChange: handleUnitCalcTypeChange })
        ] }),
        /* @__PURE__ */ jsxs("label", { children: [
          "Max Units",
          /* @__PURE__ */ jsx("input", { type: "radio", name: "unitCalc", value: "Max Unit", onChange: handleUnitCalcTypeChange })
        ] }),
        /* @__PURE__ */ jsx("br", {}),
        unitCalc()
      ] })
    ] });
  }
  function variablePanel() {
    return /* @__PURE__ */ jsxs("div", { className: "sidebar-section", id: "variable-container", children: [
      /* @__PURE__ */ jsx("h2", { className: "sidebar-title", children: "Parameters" }),
      /* @__PURE__ */ jsx("div", { className: "description-box", children: /* @__PURE__ */ jsx("span", { children: "Adjust the parameters to see how they affect the building layout." }) }),
      /* @__PURE__ */ jsxs("div", { className: "content-box variable-panel", children: [
        /* @__PURE__ */ jsxs("label", { children: [
          "FAR:",
          /* @__PURE__ */ jsx("input", { type: "number", min: 0.1, max: 15, step: 0.1, value: far, onChange: handleFarChange })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          "Lot Size",
          /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }, children: [
            /* @__PURE__ */ jsxs("label", { children: [
              "Width: ",
              /* @__PURE__ */ jsx("input", { type: "number", min: 10, max: 400, value: siteWidth, onChange: handleSiteWidthChange, style: { width: 60 } }),
              " ft "
            ] }),
            /* @__PURE__ */ jsxs("label", { children: [
              "Depth: ",
              /* @__PURE__ */ jsx("input", { type: "number", min: 10, max: 400, value: siteDepth, onChange: handleSiteDepthChange, style: { width: 60 } }),
              " ft "
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          "Setbacks",
          /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }, children: [
            /* @__PURE__ */ jsxs("label", { children: [
              "Back: ",
              /* @__PURE__ */ jsx("input", { type: "number", min: 0, max: 50, step: 0.5, value: setbacks.back, onChange: handleSetbackChange("back"), style: { width: 40 } }),
              " ft "
            ] }),
            /* @__PURE__ */ jsxs("label", { children: [
              "Right: ",
              /* @__PURE__ */ jsx("input", { type: "number", min: 0, max: 50, step: 0.5, value: setbacks.right, onChange: handleSetbackChange("right"), style: { width: 40 } }),
              " ft "
            ] }),
            /* @__PURE__ */ jsxs("label", { children: [
              "Front: ",
              /* @__PURE__ */ jsx("input", { type: "number", min: 0, max: 50, step: 0.5, value: setbacks.front, onChange: handleSetbackChange("front"), style: { width: 40 } }),
              " ft "
            ] }),
            /* @__PURE__ */ jsxs("label", { children: [
              "Left: ",
              /* @__PURE__ */ jsx("input", { type: "number", min: 0, max: 50, step: 0.5, value: setbacks.left, onChange: handleSetbackChange("left"), style: { width: 40 } }),
              " ft "
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("label", { children: [
          "Max Height:",
          /* @__PURE__ */ jsx("input", { type: "number", min: 15, max: 100, step: 5, value: maxHeight, onChange: handleMaxHeightChange }),
          "ft"
        ] }),
        unitCalcMethod(),
        /* @__PURE__ */ jsxs("label", { children: [
          "Open Space per Unit:",
          /* @__PURE__ */ jsx("input", { type: "number", min: 0, max: averageUnitSize, step: 10, value: openSpacePerUnit, onChange: handleOpenSpacePerUnitChange })
        ] }),
        /* @__PURE__ */ jsxs("label", { children: [
          "Parking Spaces per Unit:",
          /* @__PURE__ */ jsx("input", { type: "number", min: 0, max: 5, step: 0.1, value: parkingPerUnit, onChange: handleParkingPerUnitsChange })
        ] }),
        /* @__PURE__ */ jsxs("label", { children: [
          "Max Coverage",
          /* @__PURE__ */ jsx("input", { type: "number", min: 0, max: 1, step: 0.05, value: maxCoverage, onChange: handleMaxCoverageChange })
        ] })
      ] })
    ] });
  }
  function config() {
    return /* @__PURE__ */ jsxs("div", { className: "sidebar-section", id: "config", children: [
      /* @__PURE__ */ jsx("h2", { className: "sidebar-title", children: "Settings" }),
      /* @__PURE__ */ jsx("div", { className: "content-box", children: /* @__PURE__ */ jsxs("label", { children: [
        "Scale:",
        /* @__PURE__ */ jsx("input", { type: "number", min: 1, max: 50, step: 1, value: scale2, onChange: (e) => setScale(parseFloat(e.target.value)) })
      ] }) })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { id: "sidebar", children: [
    presets(),
    variablePanel(),
    config()
  ] });
}
function infoPanel() {
  const {
    far,
    setFar,
    siteWidth,
    setSiteWidth,
    siteDepth,
    setSiteDepth,
    setbacks,
    setSetbacks,
    floorHeight,
    setFloorHeight,
    maxHeight,
    setMaxHeight,
    averageUnitSize,
    setAverageUnitSize,
    minUnitSize,
    setMinUnitSize,
    parkingPerUnit,
    setParkingPerUnit,
    parkingLength,
    parkingWidth,
    parkingLaneWidth,
    openSpacePerUnit,
    setOpenSpacePerUnit,
    maxUnits,
    setMaxUnits,
    maxCoverage,
    setMaxCoverage,
    siteBaseArea,
    maxSiteArea,
    calculateBuildingWidth,
    calculateBuildingDepth,
    calculateBuildingHeight,
    calculateBuildingArea,
    calculateNumberOfUnits,
    calculateParkingArea,
    calculateResidentialArea,
    setEverything
  } = useZoningContext();
  const buildingWidth = calculateBuildingWidth();
  const buildingDepth = calculateBuildingDepth();
  const buildingHeight = calculateBuildingHeight();
  return /* @__PURE__ */ jsxs("div", { id: "info-panel", children: [
    /* @__PURE__ */ jsxs("div", { className: "content-box", children: [
      /* @__PURE__ */ jsx("h2", { children: "Building Dimensions" }),
      /* @__PURE__ */ jsxs("div", { children: [
        "Width: ",
        buildingWidth,
        " ft"
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        "Depth: ",
        Math.round(buildingDepth * 10 / 10),
        " ft"
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        "Height: ",
        buildingHeight,
        " ft"
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        "Total Building Area: ",
        calculateBuildingArea()
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "content-box", children: [
      /* @__PURE__ */ jsx("h2", { children: " Residential" }),
      /* @__PURE__ */ jsxs("div", { children: [
        "Area: ",
        calculateResidentialArea(),
        " "
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        "Number of Units: ",
        calculateNumberOfUnits()
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        "Average Unit Size: ",
        calculateResidentialArea() / calculateNumberOfUnits()
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "content-box", children: [
      /* @__PURE__ */ jsx("h2", { children: "Parking" }),
      /* @__PURE__ */ jsxs("div", { children: [
        "Area: ",
        calculateParkingArea()
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        "Spaces: ",
        Math.round(calculateNumberOfUnits() * parkingPerUnit)
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "content-box", children: [
      /* @__PURE__ */ jsx("h2", { children: "Open Space" }),
      /* @__PURE__ */ jsxs("div", { children: [
        "Width: ",
        openSpacePerUnit > 0 ? buildingWidth : 0,
        " "
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        "Depth: ",
        Math.round(openSpacePerUnit * calculateNumberOfUnits() / buildingWidth * 10 / 10)
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        "Area: ",
        openSpacePerUnit * calculateNumberOfUnits()
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { id: "site-info", className: "content-box", children: [
      /* @__PURE__ */ jsx("h2", { children: "Site Dimensions" }),
      /* @__PURE__ */ jsxs("div", { children: [
        "Width: ",
        siteWidth
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        "Depth: ",
        siteDepth
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        "Area: ",
        siteBaseArea
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        "Max Sqft: ",
        maxSiteArea
      ] })
    ] })
  ] });
}
function sideView() {
  const {
    far,
    setFar,
    siteWidth,
    setSiteWidth,
    siteDepth,
    setSiteDepth,
    setbacks,
    setSetbacks,
    floorHeight,
    setFloorHeight,
    maxHeight,
    setMaxHeight,
    averageUnitSize,
    setAverageUnitSize,
    minUnitSize,
    setMinUnitSize,
    parkingPerUnit,
    setParkingPerUnit,
    parkingLength,
    parkingWidth,
    parkingLaneWidth,
    openSpacePerUnit,
    setOpenSpacePerUnit,
    maxUnits,
    setMaxUnits,
    maxCoverage,
    setMaxCoverage,
    siteBaseArea,
    maxSiteArea,
    calculateBuildingWidth,
    calculateBuildingDepth,
    calculateBuildingHeight,
    calculateBuildingArea,
    calculateNumberOfUnits,
    calculateParkingArea,
    calculateResidentialArea,
    setEverything
  } = useZoningContext();
  const {
    scale: scale2,
    setScale
  } = useConfigContext();
  const buildingWidth = calculateBuildingWidth();
  const buildingDepth = calculateBuildingDepth();
  const buildingHeight = calculateBuildingHeight();
  calculateNumberOfUnits();
  calculateBuildingArea();
  const lotHeightPx = maxHeight * scale2;
  const lotDepthPx = siteDepth * scale2;
  const buildingDepthPx = buildingDepth * scale2;
  const buildingOffsetX = setbacks.front * scale2;
  const visibleFloors = Math.max(1, Math.floor(buildingHeight / floorHeight));
  const sideW = lotDepthPx + 40;
  const sideH = lotHeightPx + 40;
  return /* @__PURE__ */ jsxs("div", { className: "side-view view", children: [
    /* @__PURE__ */ jsx("h2", { children: "Side View" }),
    /* @__PURE__ */ jsxs("svg", { className: "graph", width: sideW, height: sideH, children: [
      /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("pattern", { id: "grid", width: scale2, height: scale2, patternUnits: "userSpaceOnUse", children: /* @__PURE__ */ jsx("path", { d: "M 10 0 L 0 0 0 10", fill: "none", stroke: "#504f4fff", strokeWidth: "0.5" }) }) }),
      /* @__PURE__ */ jsxs("g", { transform: `translate(20, ${sideH - 20})`, children: [
        Array.from({ length: visibleFloors }).map((_, i) => {
          const fh = floorHeight * scale2;
          const y = -((i + 1) * fh);
          const floorArea = buildingWidth * buildingDepth;
          const potentialBuildingArea = maxSiteArea;
          const buildingAreaSoFar = floorArea * i;
          const topFloorArea = potentialBuildingArea - buildingAreaSoFar;
          if (i + 1 == visibleFloors && topFloorArea < floorArea) {
            const topFloorDepth = topFloorArea / buildingWidth;
            const topFloorDepthPx = topFloorDepth * scale2;
            if (topFloorArea < minUnitSize && true) return null;
            return /* @__PURE__ */ jsx("rect", { className: "building", x: buildingOffsetX, y, width: topFloorDepthPx, height: fh }, i);
          }
          return /* @__PURE__ */ jsx("rect", { className: "building", x: buildingOffsetX, y, width: buildingDepthPx, height: fh }, i);
        }),
        /* @__PURE__ */ jsx("rect", { x: 0, y: -lotHeightPx, width: lotDepthPx, height: lotHeightPx, fill: "url(#grid)", pointerEvents: "none" }),
        /* @__PURE__ */ jsx("rect", { className: "outer-stroke", x: 0, y: -lotHeightPx, width: lotDepthPx, height: lotHeightPx }),
        /* @__PURE__ */ jsx("line", { className: "ground-line", x1: -10, y1: 0, x2: lotDepthPx + 10, y2: 0 })
      ] })
    ] })
  ] });
}
function frontView$1() {
  const {
    far,
    setFar,
    siteWidth,
    setSiteWidth,
    siteDepth,
    setSiteDepth,
    setbacks,
    setSetbacks,
    floorHeight,
    setFloorHeight,
    maxHeight,
    setMaxHeight,
    averageUnitSize,
    setAverageUnitSize,
    minUnitSize,
    setMinUnitSize,
    parkingPerUnit,
    setParkingPerUnit,
    parkingLength,
    parkingWidth,
    parkingLaneWidth,
    openSpacePerUnit,
    setOpenSpacePerUnit,
    maxUnits,
    setMaxUnits,
    maxCoverage,
    setMaxCoverage,
    siteBaseArea,
    maxSiteArea,
    calculateBuildingWidth,
    calculateBuildingDepth,
    calculateBuildingHeight,
    calculateBuildingArea,
    calculateNumberOfUnits,
    calculateParkingArea,
    calculateResidentialArea,
    setEverything
  } = useZoningContext();
  const {
    scale: scale2,
    setScale
  } = useConfigContext();
  const buildingWidth = calculateBuildingWidth();
  calculateBuildingDepth();
  const buildingHeight = calculateBuildingHeight();
  calculateNumberOfUnits();
  calculateBuildingArea();
  const lotHeightPx = maxHeight * scale2;
  const lotWidthPx = siteWidth * scale2;
  const buildingWidthPx = buildingWidth * scale2;
  const buildingOffsetX = setbacks.left * scale2;
  const visibleFloors = Math.max(1, Math.floor(buildingHeight / floorHeight));
  const frontW = lotWidthPx + 40;
  const frontH = lotHeightPx + 40;
  return /* @__PURE__ */ jsxs("div", { className: "front-view view", children: [
    /* @__PURE__ */ jsx("h2", { children: "Front View" }),
    /* @__PURE__ */ jsxs("svg", { className: "graph", width: frontW, height: frontH, children: [
      /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("pattern", { id: "grid", width: scale2, height: scale2, patternUnits: "userSpaceOnUse", children: /* @__PURE__ */ jsx("path", { d: "M 10 0 L 0 0 0 10", fill: "none", stroke: "#504f4fff", strokeWidth: "0.5" }) }) }),
      /* @__PURE__ */ jsxs("g", { transform: `translate(20, ${frontH - 20})`, children: [
        Array.from({ length: visibleFloors }).map((_, i) => {
          const fh = floorHeight * scale2;
          const y = -((i + 1) * fh);
          return /* @__PURE__ */ jsx("rect", { className: "building", x: buildingOffsetX, y, width: buildingWidthPx, height: fh }, i);
        }),
        /* @__PURE__ */ jsx("rect", { x: 0, y: -lotHeightPx, width: lotWidthPx, height: lotHeightPx, fill: "url(#grid)", pointerEvents: "none" }),
        /* @__PURE__ */ jsx("rect", { className: "outer-stroke", x: 0, y: -lotHeightPx, width: lotWidthPx, height: lotHeightPx }),
        /* @__PURE__ */ jsx("line", { className: "ground-line", x1: -10, y1: 0, x2: lotWidthPx + 10, y2: 0 })
      ] })
    ] })
  ] });
}
function frontView() {
  const [parkingInSetback, setParkingInSetback] = useState(false);
  const {
    far,
    setFar,
    siteWidth,
    setSiteWidth,
    siteDepth,
    setSiteDepth,
    setbacks,
    setSetbacks,
    floorHeight,
    setFloorHeight,
    maxHeight,
    setMaxHeight,
    averageUnitSize,
    setAverageUnitSize,
    minUnitSize,
    setMinUnitSize,
    parkingPerUnit,
    setParkingPerUnit,
    parkingLength,
    parkingWidth,
    parkingLaneWidth,
    openSpacePerUnit,
    setOpenSpacePerUnit,
    maxUnits,
    setMaxUnits,
    maxCoverage,
    setMaxCoverage,
    siteBaseArea,
    maxSiteArea,
    calculateBuildingWidth,
    calculateBuildingDepth,
    calculateBuildingHeight,
    calculateBuildingArea,
    calculateNumberOfUnits,
    calculateParkingArea,
    calculateResidentialArea,
    setEverything
  } = useZoningContext();
  const {
    scale: scale2,
    setScale
  } = useConfigContext();
  const buildingWidth = calculateBuildingWidth();
  const buildingDepth = calculateBuildingDepth();
  calculateBuildingHeight();
  const numUnits = calculateNumberOfUnits();
  calculateBuildingArea();
  function renderParkingArea(scale22, buildingOffsetX2, buildingOffsetY2, buildingDepthPx2) {
    if (parkingPerUnit > 0) {
      const parkingArea = calculateParkingArea();
      let parkingWidth2 = buildingWidth;
      if (parkingArea / buildingWidth < parkingLength) {
        parkingWidth2 = Math.sqrt(parkingArea);
      }
      const parkingDepth = parkingArea / parkingWidth2;
      const parkingDepthPx = parkingDepth * scale22;
      const parkingWidthPx = parkingWidth2 * scale22;
      const parkingOffsetY = buildingOffsetY2 + buildingDepthPx2;
      if (parkingInSetback) {
        return /* @__PURE__ */ jsx("rect", { x: buildingOffsetX2, y: -(parkingOffsetY + parkingDepthPx), width: parkingWidthPx, height: parkingDepthPx, fill: "rgba(255, 165, 0, 0.5)", stroke: "#ff9800" });
      }
      return /* @__PURE__ */ jsx("rect", { x: buildingOffsetX2, y: -(buildingOffsetY2 + parkingDepthPx), width: parkingWidthPx, height: parkingDepthPx, fill: "rgba(255, 165, 0, 0.5)", stroke: "#ff9800" });
    }
    return null;
  }
  function renderOpenSpaceArea(scale22, buildingOffsetX2, buildingOffsetY2, buildingDepthPx2) {
    if (openSpacePerUnit > 0) {
      const openSpaceArea = openSpacePerUnit * numUnits;
      const openSpaceWidth = buildingWidth;
      const openSpaceDepth = openSpaceArea / openSpaceWidth;
      const openSpaceWidthPx = openSpaceWidth * scale22;
      const openSpaceDepthPx = openSpaceDepth * scale22;
      return /* @__PURE__ */ jsx("rect", { className: "open-space", x: buildingOffsetX2, y: -(buildingOffsetY2 + buildingDepthPx2 + openSpaceDepthPx), width: openSpaceWidthPx, height: openSpaceDepthPx });
    }
    return null;
  }
  const lotWidthPx = siteWidth * scale2;
  const lotDepthPx = siteDepth * scale2;
  const buildingDepthPx = buildingDepth * scale2;
  const buildingWidthPx = buildingWidth * scale2;
  const buildingOffsetX = setbacks.left * scale2;
  const buildingOffsetY = setbacks.front * scale2;
  const sideD = lotDepthPx + 40;
  const sideW = lotWidthPx + 40;
  return /* @__PURE__ */ jsxs("div", { className: "topdown-view view", children: [
    /* @__PURE__ */ jsx("h2", { children: "Topdown View" }),
    /* @__PURE__ */ jsxs("svg", { className: "graph", width: sideW, height: sideD, children: [
      /* @__PURE__ */ jsxs("defs", { children: [
        /* @__PURE__ */ jsx("pattern", { id: "grid", width: scale2, height: scale2, patternUnits: "userSpaceOnUse", children: /* @__PURE__ */ jsx("path", { d: "M 10 0 L 0 0 0 10" }) }),
        /* @__PURE__ */ jsxs("pattern", { id: "buildingTexture", patternUnits: "userSpaceOnUse", width: "95", height: "100", children: [
          "  ",
          /* @__PURE__ */ jsx("image", { href: "../../assets/brick-wall.svg", width: "100", height: "100" }),
          "  "
        ] })
      ] }),
      /* @__PURE__ */ jsxs("g", { transform: `translate(20, ${sideD - 20})`, children: [
        /* @__PURE__ */ jsx("rect", { className: "building", x: buildingOffsetX, y: -(buildingDepthPx + buildingOffsetY), width: buildingWidthPx, height: buildingDepthPx, fill: "url(#buildingTexture)" }),
        /* @__PURE__ */ jsx("rect", { x: 0, y: -lotDepthPx, width: lotWidthPx, height: lotDepthPx, fill: "url(#grid)", pointerEvents: "none" }),
        /* @__PURE__ */ jsx("rect", { className: "outer-stroke", x: 0, y: -lotDepthPx, width: lotWidthPx, height: lotDepthPx }),
        renderParkingArea(scale2, buildingOffsetX, buildingOffsetY, buildingDepthPx),
        renderOpenSpaceArea(scale2, buildingOffsetX, buildingOffsetY, buildingDepthPx)
      ] })
    ] })
  ] });
}
const SHOW_OVERFLOW_AREA = true;
const visualizerHook = UNSAFE_withComponentProps(function VisualizerHook() {
  const {
    far,
    setFar,
    siteWidth,
    setSiteWidth,
    siteDepth,
    setSiteDepth,
    setbacks,
    setSetbacks,
    floorHeight,
    setFloorHeight,
    maxHeight,
    setMaxHeight,
    averageUnitSize,
    setAverageUnitSize,
    minUnitSize,
    setMinUnitSize,
    parkingPerUnit,
    setParkingPerUnit,
    parkingLength,
    parkingWidth,
    parkingLaneWidth,
    openSpacePerUnit,
    setOpenSpacePerUnit,
    maxUnits,
    setMaxUnits,
    maxCoverage,
    setMaxCoverage,
    siteBaseArea,
    maxSiteArea,
    calculateBuildingWidth,
    calculateBuildingDepth,
    calculateBuildingHeight,
    calculateBuildingArea,
    calculateNumberOfUnits,
    calculateParkingArea,
    calculateResidentialArea,
    setEverything
  } = useZoningContext();
  const [showOverflowArea, setShowOverflowArea] = useState(SHOW_OVERFLOW_AREA);
  const [parkingInSetback, setParkingInSetback] = useState(false);
  const [preset, setPreset] = useState("Custom");
  const [backingAlly, setBackingAlly] = useState(false);
  const [unitCalcType, setUnitCalcType] = useState("Average Unit Size");
  calculateBuildingWidth();
  calculateBuildingDepth();
  calculateBuildingHeight();
  calculateNumberOfUnits();
  calculateBuildingArea();
  return /* @__PURE__ */ jsxs("div", {
    id: "container",
    children: [Header(), /* @__PURE__ */ jsxs("div", {
      className: "main-container",
      children: [/* @__PURE__ */ jsx("div", {
        id: "sidebar-container",
        children: sidebar()
      }), /* @__PURE__ */ jsxs("div", {
        id: "visualization-info-container",
        children: [/* @__PURE__ */ jsx("div", {
          className: "info-panel-container",
          children: infoPanel()
        }), /* @__PURE__ */ jsxs("div", {
          id: "visualization-container",
          children: [frontView(), frontView$1(), sideView()]
        })]
      })]
    })]
  });
});
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: visualizerHook
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-5NZ9AFj8.js", "imports": ["/assets/chunk-B7RQU5TL-DkG0e22m.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": true, "module": "/assets/root-DX83Ff4d.js", "imports": ["/assets/chunk-B7RQU5TL-DkG0e22m.js", "/assets/defaults-BsxgF3tv.js"], "css": ["/assets/defaults-C3rAs04A.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/visualizer-hook": { "id": "routes/visualizer-hook", "parentId": "root", "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/visualizer-hook-rnRpIliI.js", "imports": ["/assets/chunk-B7RQU5TL-DkG0e22m.js", "/assets/defaults-BsxgF3tv.js"], "css": ["/assets/visualizer-hook-B8zYHvIE.css", "/assets/defaults-C3rAs04A.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 } }, "url": "/assets/manifest-4cea622b.js", "version": "4cea622b", "sri": void 0 };
const assetsBuildDirectory = "build/client";
const basename = "/";
const future = { "v8_middleware": false, "unstable_optimizeDeps": false, "unstable_splitRouteModules": false, "unstable_subResourceIntegrity": false, "unstable_viteEnvironmentApi": false };
const ssr = true;
const isSpaMode = false;
const prerender = [];
const routeDiscovery = { "mode": "lazy", "manifestPath": "/__manifest" };
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/visualizer-hook": {
    id: "routes/visualizer-hook",
    parentId: "root",
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route1
  }
};
export {
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  prerender,
  publicPath,
  routeDiscovery,
  routes,
  ssr
};
