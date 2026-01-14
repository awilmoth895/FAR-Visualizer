import React, { useState, type HtmlHTMLAttributes, useCallback } from 'react';

import './../app.css';
import useZoningCalculator from '../../utils/useZoningCalculator';
import presets from '../../config/defaults.json';
import Header from '../../components/header';
import Sidebar from '../../components/sidebar';
import InfoPanel from '../../components/infoPanel';
import SideView from '../../components/views/sideView';
import FrontView from '../../components/views/frontView';
import TopdownView from '../../components/views/topdownView';
import IsometricView from '../../components/views/isometricView';
import { useZoningContext } from '../context/ZoningContext';
import { useConfigContext } from '../context/ConfigContext';

// site defaults (kept here for initial hook values)
const SITE_WIDTH = 40; // feet
const SITE_DEPTH = 75; // feet
const MAX_HEIGHT = 35; // feet
const FLOOR_HEIGHT = 10; // feet per floor (used only for initial value)
const MAX_FAR = 2.0; // maximum Floor Area Ratio

const SETBACKS = { front: 12.5, right: 3, back: 10, left: 3 };

const AVERAGE_UNIT_SIZE = 800; // sqft
const MIN_UNIT_SIZE = 500; // sqft
const SHOW_OVERFLOW_AREA = true;

const PARKING_PER_UNITS = 0; // parking spaces per unit
const PARKING_LENGTH = 18; // feet
const PARKING_WIDTH = 8.6; // feet
const LANE_WIDTH = 12; // feet

const OPEN_SPACE_UNIT = 75; // sf per unit

const ELEVATION_SCALE = 10;

// 1st ave and Broadway
// const SITE_WIDTH = 80; // feet
// const SITE_DEPTH = 118; // feet
// const MAX_HEIGHT = 35; // feet
// const FLOOR_HEIGHT = 10; // feet per floor
// const MAX_FAR = 4.0; // maximum Floor Area Ratio

// const SETBACKS = { front: 0, right: 0, back: 0, left: 0 }; // 

// const AVERAGE_UNIT_SIZE = 600; // sqft
// const MIN_UNIT_SIZE = 200; // sqft
// const SHOW_OVERFLOW_AREA = true;

// const PARKING_PER_UNITS = 1.0; // parking spaces per unit
// const PARKING_LENGTH = 18; // feet
// const PARKING_WIDTH = 8.6; // feet
// // const PARKING_AREA_PER_SPACE = PARKING_LENGTH * PARKING_WIDTH; // sqft per parking space
// const LANE_WIDTH = 12; // feet
// // const PARKING_LANE_AREA_PER_SPACE = LANE_WIDTH * PARKING_WIDTH; // feet

// const OPEN_SPACE_UNIT = 100; // sf per unit

// const ELEVATION_SCALE = 10;

export default function VisualizerHook() {
    // const zoning = useZoningCalculator({
    //     far: MAX_FAR,
    //     siteWidth: SITE_WIDTH,
    //     siteDepth: SITE_DEPTH,
    //     setbacks: SETBACKS,
    //     floorHeight: FLOOR_HEIGHT,
    //     maxHeight: MAX_HEIGHT,
    //     averageUnitSize: AVERAGE_UNIT_SIZE,
    //     minUnitSize: MIN_UNIT_SIZE,
    //     parkingPerUnit: PARKING_PER_UNITS,
    //     parkingLength: PARKING_LENGTH,
    //     parkingWidth: PARKING_WIDTH,
    //     parkingLaneWidth: LANE_WIDTH,
    //     openSpacePerUnit: OPEN_SPACE_UNIT,
    // });

    const {
        far, setFar,
        siteWidth, setSiteWidth,
        siteDepth, setSiteDepth,
        setbacks, setSetbacks,
        floorHeight, setFloorHeight,
        maxHeight, setMaxHeight,
        averageUnitSize, setAverageUnitSize,
        minUnitSize, setMinUnitSize,
        parkingPerUnit, setParkingPerUnit,
        parkingLength, parkingWidth, parkingLaneWidth,
        openSpacePerUnit, setOpenSpacePerUnit,
        maxUnits, setMaxUnits,
        maxCoverage, setMaxCoverage,

        siteBaseArea, maxSiteArea,
        calculateBuildingWidth, calculateBuildingDepth, calculateBuildingHeight,
        calculateBuildingArea, calculateNumberOfUnits, calculateParkingArea, calculateResidentialArea,

        setEverything
    } = useZoningContext();

    const {
        scale, setScale,
        views, setViews
    } = useConfigContext();

    // local UI-only flags
    const [showOverflowArea, setShowOverflowArea] = useState(SHOW_OVERFLOW_AREA);
    const [parkingInSetback, setParkingInSetback] = useState(false);
    const [preset, setPreset] = useState("Custom");
    const [backingAlly, setBackingAlly] = useState(false);

    const [unitCalcType, setUnitCalcType] = useState("Average Unit Size");

    //     const handlePresetChange = (e: string) => { 
    //         useCallback(() => {
    //             console.log("Value: ", e);
    //             if (e) {
    //                 return e;
    //             }   

    //             return "custom";
    //         },[far, siteWidth, siteDepth, setbacks, floorHeight, maxHeight, averageUnitSize, minUnitSize,
    //             parkingPerUnit, parkingLength, parkingWidth, parkingLaneWidth, openSpacePerUnit,
    //             siteBaseArea, maxSiteArea,
    //             calculateBuildingWidth, calculateBuildingDepth, calculateBuildingHeight,
    //             calculateBuildingArea, calculateNumberOfUnits, calculateParkingArea, calculateResidentialArea,
    // ])
    //     };
    // const handleBackingAllyChange = (e: React.ChangeEvent<HTMLInputElement>) => setBackingAlly(e.target.value);

    // handlers (use hook setters)
    const handleFarChange = (e: React.ChangeEvent<HTMLInputElement>) => setFar(Number(e.target.value));
    const handleSiteWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => setSiteWidth(Number(e.target.value));
    const handleSiteDepthChange = (e: React.ChangeEvent<HTMLInputElement>) => setSiteDepth(Number(e.target.value));
    const handleMaxHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => setMaxHeight(Number(e.target.value));
    const handleAverageUnitSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => setAverageUnitSize(Number(e.target.value));
    const handleMinUnitSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => setMinUnitSize(Number(e.target.value));
    const handleShowOverflowAreaChange = (e: React.ChangeEvent<HTMLInputElement>) => setShowOverflowArea(e.target.checked);
    const handleParkingPerUnitsChange = (e: React.ChangeEvent<HTMLInputElement>) => setParkingPerUnit(Number(e.target.value));
    const handleOpenSpacePerUnitChange = (e: React.ChangeEvent<HTMLInputElement>) => setOpenSpacePerUnit(Number(e.target.value));
    const handleMaxUnitChange = (e: React.ChangeEvent<HTMLInputElement>) => setMaxUnits(Number(e.target.value));
    const handleMaxCoverageChange = (e: React.ChangeEvent<HTMLInputElement>) => setMaxCoverage(Number(e.target.value));

    const handleSetbackChange = (side: keyof typeof setbacks) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = Number(e);
        setSetbacks({ ...(setbacks ?? {}), [side]: val });
    };

    const handleUnitCalcTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUnitCalcType(e.target.value);
        if (e.target.value == "Average Unit Size") {
            setAverageUnitSize(averageUnitSize * maxUnits);

            setMaxUnits(-1);
            // setAverageUnitSize("")
        }
        // setMaxUnits(buildingArea);
        var tempMaxUnits = maxUnits;
        if (maxUnits == -1) {
            tempMaxUnits = 1;
            setMaxUnits(1)
        }
        setAverageUnitSize(buildingArea / tempMaxUnits);
    }

    // compute derived building sizes on render
    const buildingWidth = calculateBuildingWidth();
    const buildingDepth = calculateBuildingDepth();
    const buildingHeight = calculateBuildingHeight();
    const numUnits = calculateNumberOfUnits();
    const buildingArea = calculateBuildingArea();

    // function unitCalc() {

    //     if (unitCalcType == "Average Unit Size") {
    //         return (
    //             <label>
    //                 Average Unit Size:
    //                 <input type="number" min={minUnitSize} max={3000} step={50} value={averageUnitSize} onChange={handleAverageUnitSizeChange} />
    //                 sqft
    //             </label>
    //         );
    //     }

    //     return (
    //         <label>
    //             Max Units:
    //             <input type="number" min={0} max={50} step={1} value={maxUnits} onChange={handleMaxUnitChange} />
    //             sqft
    //         </label>
    //     );


    // }

    // // function variablePanel() {
    //     return (
    //         <div className="variable-panel">
    //             <p>Adjust the parameters to see how they affect the building layout.</p>
    //             {presetView()}
    //             <div className='content-box'>
    //                 <label>
    //                     FAR:
    //                     <input type="number" min={0.1} max={15} step={0.1} value={far} onChange={handleFarChange} />
    //                 </label>
    //                 <div>
    //                     Lot Size
    //                     <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
    //                         <label>Width: <input type="number" min={10} max={400} value={siteWidth} onChange={handleSiteWidthChange} style={{ width: 60 }} /> ft </label>
    //                         <label>Depth: <input type="number" min={10} max={400} value={siteDepth} onChange={handleSiteDepthChange} style={{ width: 60 }} /> ft </label>
    //                     </div>
    //                 </div>
    //                 <div>
    //                     Setbacks
    //                     <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
    //                         <label>Back: <input type="number" min={0} max={50} step={.5} value={setbacks.back} onChange={handleSetbackChange('back')} style={{ width: 60 }} /> ft </label>
    //                         <label>Right: <input type="number" min={0} max={50} step={.5} value={setbacks.right} onChange={handleSetbackChange('right')} style={{ width: 60 }} /> ft </label>
    //                         <label>Front: <input type="number" min={0} max={50} step={.5} value={setbacks.front} onChange={handleSetbackChange('front')} style={{ width: 60 }} /> ft </label>
    //                         <label>Left: <input type="number" min={0} max={50} step={.5} value={setbacks.left} onChange={handleSetbackChange('left')} style={{ width: 60 }} /> ft </label>
    //                     </div>
    //                 </div>
    //                 <label>
    //                     Max Height:
    //                     <input type="number" min={15} max={100} step={5} value={maxHeight} onChange={handleMaxHeightChange} />
    //                     ft
    //                 </label>
    //                 <div>
    //                     <label>
    //                         Average Unit Size
    //                         <input type='radio' name="unitCalc" value="Average Unit Size" onChange={handleUnitCalcTypeChange} />
    //                     </label>
    //                     <label>
    //                         Max Units
    //                         <input type='radio' name="unitCalc" value="Max Unit" onChange={handleUnitCalcTypeChange} />
    //                     </label>
    //                     <br></br>
    //                     {unitCalc()}
    //                 </div>

    //                 {/* <label>
    //                     Minimum Unit Size:
    //                     <input type="number" min={150} max={averageUnitSize} step={50} value={minUnitSize} onChange={handleMinUnitSizeChange} />
    //                 </label> */}
    //                 <label>
    //                     Open Space per Unit:
    //                     <input type="number" min={0} max={averageUnitSize} step={10} value={openSpacePerUnit} onChange={handleOpenSpacePerUnitChange} />
    //                 </label>
    //                 <label>
    //                     Parking Spaces per Unit:
    //                     <input type="number" min={0} max={5} step={0.1} value={parkingPerUnit} onChange={handleParkingPerUnitsChange} />
    //                 </label>
    //                 {/* <label>
    //                     Backing Ally
    //                     <input type="checkbox" value={backingAlly} onChange={handleBackingAllyChange} />
    //                 </label> */}
    //                 <label>
    //                     Max Coverage
    //                     <input type="number" min={0.0} max={1.0} step={.05} value={maxCoverage} onChange={handleMaxCoverageChange}></input>
    //                 </label>
    //             </div>
    //         </div>
    //     );
    // }

    // function infoPanel() {
    //     return (
    //         <div id="info-panel">
    //             <h2>Information</h2>
    //             <div className="content-box">
    //                 <h2>Building Dimensions</h2>
    //                 <div>Width: {buildingWidth} ft</div>
    //                 <div>Depth: {Math.round((buildingDepth * 10) / 10)} ft</div>
    //                 <div>Height: {buildingHeight} ft</div>
    //                 <div>Total Building Area: {calculateBuildingArea()}</div>
    //             </div>
    //             <div className="content-box">
    //                 <h2> Residential</h2>
    //                 <div>Area: {calculateResidentialArea()} </div>
    //                 <div>Number of Units: {calculateNumberOfUnits()}</div>
    //                 <div>Average Unit Size: {calculateResidentialArea() / calculateNumberOfUnits()}</div>
    //             </div>
    //             <div className='content-box'>
    //                 <h2>Parking</h2>
    //                 <div>Area: {calculateParkingArea()}</div>
    //                 <div>Spaces: {Math.round(calculateNumberOfUnits() * parkingPerUnit)}</div>
    //             </div>
    //             <div className="content-box">
    //                 <h2>Open Space</h2>
    //                 <div>Width: {openSpacePerUnit > 0 ? buildingWidth : 0} </div>
    //                 <div>Depth: {Math.round((((openSpacePerUnit * calculateNumberOfUnits()) / buildingWidth) * 10) / 10)}</div>
    //                 <div>Area: {openSpacePerUnit * calculateNumberOfUnits()}</div>
    //             </div>
    //             <div id="site-info" className='content-box'>
    //                 <h2>Site Dimensions</h2>
    //                 <div>Width: {siteWidth}</div>
    //                 <div>Depth: {siteDepth}</div>
    //                 <div>Area: {siteBaseArea}</div>
    //                 <div>Max Sqft: {maxSiteArea}</div>
    //             </div>
    //         </div>
    //     );
    // }

    // function renderParkingArea(elevationScale: number, buildingOffsetX: number, buildingOffsetY: number, buildingDepthPx: number) {
    //     if (parkingPerUnit > 0) {
    //         const parkingArea = calculateParkingArea();
    //         let parkingWidth = buildingWidth;

    //         if (parkingArea / buildingWidth < parkingLength) {
    //             parkingWidth = Math.sqrt(parkingArea);
    //         }

    //         // make parking render in blocks of parking spaces

    //         const parkingDepth = parkingArea / parkingWidth;
    //         const parkingDepthPx = parkingDepth * elevationScale;
    //         const parkingWidthPx = parkingWidth * elevationScale;
    //         const parkingOffsetY = buildingOffsetY + buildingDepthPx;

    //         if (parkingInSetback) {
    //             return <rect x={buildingOffsetX} y={-(parkingOffsetY + parkingDepthPx)} width={parkingWidthPx} height={parkingDepthPx} fill='rgba(255, 165, 0, 0.5)' stroke='#ff9800' />;
    //         }
    //         return <rect x={buildingOffsetX} y={-(buildingOffsetY + parkingDepthPx)} width={parkingWidthPx} height={parkingDepthPx} fill='rgba(255, 165, 0, 0.5)' stroke='#ff9800' />;
    //     }
    //     return null;
    // }

    // function renderOpenSpaceArea(elevationScale: number, buildingOffsetX: number, buildingOffsetY: number, buildingDepthPx: number) {
    //     if (openSpacePerUnit > 0) {
    //         const openSpaceArea = openSpacePerUnit * numUnits;
    //         const openSpaceWidth = buildingWidth;
    //         const openSpaceDepth = openSpaceArea / openSpaceWidth;

    //         // console.log("(Num Units: ", numUnits);
    //         // console.log("Open Space Area: ", openSpaceArea);
    //         // console.log("Open Space Depth: ", openSpaceDepth);
    //         // console.log("Building Depth", buildingDepth);
    //         // console.log("Setback Depth: ", siteDepth - setbacks.front - setbacks.back);

    //         const openSpaceWidthPx = openSpaceWidth * elevationScale;
    //         const openSpaceDepthPx = openSpaceDepth * elevationScale;

    //         return <rect x={buildingOffsetX} y={-(buildingOffsetY + buildingDepthPx + openSpaceDepthPx)} width={openSpaceWidthPx} height={openSpaceDepthPx} fill='rgba(12, 199, 84, 0.5)' stroke='rgba(7, 167, 68, 0.5)' />;
    //     }
    //     return null;
    // }

    // function topdownView() {
    //     const elevationScale = ELEVATION_SCALE; // pixels per unit
    //     const lotWidthPx = siteWidth * elevationScale;
    //     const lotDepthPx = siteDepth * elevationScale;
    //     const buildingDepthPx = buildingDepth * elevationScale;
    //     const buildingWidthPx = buildingWidth * elevationScale;
    //     const buildingOffsetX = setbacks.left * elevationScale;
    //     const buildingOffsetY = setbacks.front * elevationScale;

    //     const sideD = lotDepthPx + 40;
    //     const sideW = lotWidthPx + 40;

    //     return (
    //         <div className="topdown-view view">
    //             <h2>Topdown View</h2>
    //             <svg className="graph" width={sideW} height={sideD}>
    //                 <defs>
    //                     <pattern id="grid" width={elevationScale} height={elevationScale} patternUnits="userSpaceOnUse">
    //                         <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#504f4fff" strokeWidth="0.5" />
    //                     </pattern>
    //                 </defs>

    //                 <g transform={`translate(20, ${sideD - 20})`}>
    //                     <rect x={buildingOffsetX} y={-(buildingDepthPx + buildingOffsetY)} width={buildingWidthPx} height={buildingDepthPx} fill='#90caf9' opacity=".75" stroke="#1e88e5" />

    //                     <rect x={0} y={-lotDepthPx} width={lotWidthPx} height={lotDepthPx} fill="url(#grid)" pointerEvents="none" />

    //                     <rect x={0} y={-lotDepthPx} width={lotWidthPx} height={lotDepthPx} fill="rgba(0,0,0,0)" stroke="#999" strokeDasharray="6 4" />
    //                     {renderParkingArea(elevationScale, buildingOffsetX, buildingOffsetY, buildingDepthPx)}
    //                     {renderOpenSpaceArea(elevationScale, buildingOffsetX, buildingOffsetY, buildingDepthPx)}
    //                     <line x1={-10} y1={0} x2={lotWidthPx + 10} y2={0} stroke="#333" />
    //                 </g>
    //             </svg>
    //         </div>
    //     );
    // }

    // function sideView() {
    //     const elevationScale = ELEVATION_SCALE;
    //     const lotHeightPx = maxHeight * elevationScale;
    //     const lotDepthPx = siteDepth * elevationScale;
    //     const buildingDepthPx = buildingDepth * elevationScale;
    //     const buildingOffsetX = setbacks.front * elevationScale;
    //     const visibleFloors = Math.max(1, Math.floor(buildingHeight / floorHeight));

    //     const sideW = lotDepthPx + 40;
    //     const sideH = lotHeightPx + 40;

    //     return (
    //         <div className="side-view view">
    //             <h2>Side View</h2>
    //             <svg className="graph" width={sideW} height={sideH}>
    //                 <defs>
    //                     <pattern id="grid" width={elevationScale} height={elevationScale} patternUnits="userSpaceOnUse">
    //                         <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#504f4fff" strokeWidth="0.5" />
    //                     </pattern>
    //                 </defs>

    //                 <g transform={`translate(20, ${sideH - 20})`}>
    //                     {Array.from({ length: visibleFloors }).map((_, i) => {
    //                         const fh = floorHeight * elevationScale;
    //                         const y = -((i + 1) * fh);

    //                         const floorArea = buildingWidth * buildingDepth;
    //                         const potentialBuildingArea = maxSiteArea;
    //                         const buildingAreaSoFar = floorArea * (i);
    //                         const topFloorArea = potentialBuildingArea - buildingAreaSoFar;

    //                         if (i + 1 == visibleFloors && topFloorArea < floorArea) {
    //                             const topFloorDepth = topFloorArea / buildingWidth;
    //                             const topFloorDepthPx = topFloorDepth * elevationScale;

    //                             if (topFloorArea < minUnitSize && !showOverflowArea) return null;

    //                             return <rect key={i} x={buildingOffsetX} y={y} width={topFloorDepthPx} height={fh} fill={i % 2 === 0 ? '#90caf9' : '#64b5f6'} stroke="#1e88e5" />;
    //                         }

    //                         return <rect key={i} x={buildingOffsetX} y={y} width={buildingDepthPx} height={fh} fill={i % 2 === 0 ? '#90caf9' : '#64b5f6'} stroke="#1e88e5" />;
    //                     })}

    //                     <rect x={0} y={-lotHeightPx} width={lotDepthPx} height={lotHeightPx} fill="url(#grid)" pointerEvents="none" />
    //                     <rect x={0} y={-lotHeightPx} width={lotDepthPx} height={lotHeightPx} fill="rgba(0,0,0,0)" stroke="#999" strokeDasharray="6 4" />
    //                     <line x1={-10} y1={0} x2={lotDepthPx + 10} y2={0} stroke="#333" />
    //                 </g>
    //             </svg>
    //         </div>
    //     );
    // }

    // function setPresets(key: string) {
    //     console.log("Set Preset: ", key);
    //     console.log("preset.zoning: ", presets.zoning);
    //     setPreset(presets.zoning[key].title);
    //     setEverything(presets.zoning[key]);
    //     // handlePresetChange(presets.zoning[key].title);

    // }

    // function presetView() {
    //     return (
    //         <div id='defaults'>
    //             <h2>Preset: {preset} </h2>
    //             <button className='presetButton' onClick={() => setPresets("missingMiddle1")}>Missing Middle Far 1 - Inner Lot</button>
    //             <button className='presetButton' onClick={() => setPresets("missingMiddle1-corner")}>Missing Middle Far 1 - Corner Lot</button>
    //             <button className='presetButton' onClick={() => setPresets("missingMiddle2")}>Missing Middle Far 2 - Inner Lot</button>
    //             <button className='presetButton' onClick={() => setPresets("missingMiddle2-corner")}>Missing Middle Far 2 - Corner Lot</button>
    //             <button className='presetButton' onClick={() => setPresets("r1")}>R-1 Single Family Zoning</button>
    //         </div>
    //     )
    // }

    // function frontView() {
    //     const elevationScale = ELEVATION_SCALE;
    //     const lotHeightPx = maxHeight * elevationScale;
    //     const lotWidthPx = siteWidth * elevationScale;
    //     const buildingWidthPx = buildingWidth * elevationScale;
    //     const buildingOffsetX = setbacks.left * elevationScale;
    //     const visibleFloors = Math.max(1, Math.floor(buildingHeight / floorHeight));

    //     const frontW = lotWidthPx + 40;
    //     const frontH = lotHeightPx + 40;

    //     return (
    //         <div className="front-view view">
    //             <h2>Front View</h2>
    //             <svg className="graph" width={frontW} height={frontH}>
    //                 <defs>
    //                     <pattern id="grid" width={elevationScale} height={elevationScale} patternUnits="userSpaceOnUse">
    //                         <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#504f4fff" strokeWidth="0.5" />
    //                     </pattern>
    //                 </defs>
    //                 <g transform={`translate(20, ${frontH - 20})`}>
    //                     {Array.from({ length: visibleFloors }).map((_, i) => {
    //                         const fh = floorHeight * elevationScale;
    //                         const y = -((i + 1) * fh);
    //                         return <rect key={i} x={buildingOffsetX} y={y} width={buildingWidthPx} height={fh} fill={i % 2 === 0 ? '#90caf9' : '#64b5f6'} stroke="#1e88e5" />;
    //                     })}

    //                     <rect x={0} y={-lotHeightPx} width={lotWidthPx} height={lotHeightPx} fill="url(#grid)" pointerEvents="none" />
    //                     <rect x={0} y={-lotHeightPx} width={lotWidthPx} height={lotHeightPx} fill="rgba(0,0,0,0)" stroke="#999" strokeDasharray="6 4" />
    //                     <line x1={-10} y1={0} x2={lotWidthPx + 10} y2={0} stroke="#333" />
    //                 </g>
    //             </svg>
    //         </div>
    //     );
    // }

    return (
        <div id='container'>
            <Header />
            <div className="main-container">
                <div id="sidebar-container">
                    <Sidebar />
                </div>
                <div id="visualization-info-container">
                    <div className='info-panel-container'>
                        <InfoPanel />
                    </div>
                    <div id="visualization-container">
                        {views.iso && <IsometricView />}
                        {views.topDown && <TopdownView />}
                        {views.front && <FrontView />}
                        {views.side && <SideView />}
                    </div>

                </div>
            </div>
        </div>
    );
}
