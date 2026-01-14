
import React, { use, useState } from "react";
import "./sidebar.css";
import presetsJson from '../config/defaults.json';
import { useZoningContext } from "../app/context/ZoningContext";
import { useConfigContext } from "../app/context/ConfigContext";

export default function sidebar() {
    const {
        far, setFar,
        siteWidth, setSiteWidth,
        siteDepth, setSiteDepth,
        setbacks, setSetbacks,
        // floorHeight, setFloorHeight,
        maxHeight, setMaxHeight,
        averageUnitSize, setAverageUnitSize,
        minUnitSize, setMinUnitSize,
        parkingPerUnit, setParkingPerUnit,
        // parkingLength, parkingWidth, parkingLaneWidth,
        openSpacePerUnit, setOpenSpacePerUnit,
        maxUnits, setMaxUnits,
        maxCoverage, setMaxCoverage,

        // siteBaseArea, maxSiteArea,
        calculateBuildingWidth, calculateBuildingDepth, calculateBuildingHeight,
        calculateBuildingArea, calculateNumberOfUnits,
        // calculateParkingArea, calculateResidentialArea,

        setEverything
    } = useZoningContext();

    const {
        scale, setScale,
        views, setViews
    }  = useConfigContext();


    // local UI-only flags
    // const [showOverflowArea, setShowOverflowArea] = useState(SHOW_OVERFLOW_AREA);
    // const [parkingInSetback, setParkingInSetback] = useState(false);
    const [preset, setPreset] = useState("Custom");
    // const [backingAlly, setBackingAlly] = useState(false);

    const [unitCalcType, setUnitCalcType] = useState("Average Unit Size");

    // handlers (use hook setters)
    const handleFarChange = (e: React.ChangeEvent<HTMLInputElement>) => setFar(Number(e.target.value));
    const handleSiteWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => setSiteWidth(Number(e.target.value));
    const handleSiteDepthChange = (e: React.ChangeEvent<HTMLInputElement>) => setSiteDepth(Number(e.target.value));
    const handleMaxHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => setMaxHeight(Number(e.target.value));
    const handleAverageUnitSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => setAverageUnitSize(Number(e.target.value));
    // const handleMinUnitSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => setMinUnitSize(Number(e.target.value));
    // const handleShowOverflowAreaChange = (e: React.ChangeEvent<HTMLInputElement>) => setShowOverflowArea(e.target.checked);
    const handleParkingPerUnitsChange = (e: React.ChangeEvent<HTMLInputElement>) => setParkingPerUnit(Number(e.target.value));
    const handleOpenSpacePerUnitChange = (e: React.ChangeEvent<HTMLInputElement>) => setOpenSpacePerUnit(Number(e.target.value));
    const handleMaxUnitChange = (e: React.ChangeEvent<HTMLInputElement>) => setMaxUnits(Number(e.target.value));
    const handleMaxCoverageChange = (e: React.ChangeEvent<HTMLInputElement>) => setMaxCoverage(Number(e.target.value));

    const handleSetbackChange = (side: keyof typeof setbacks) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = Number(e.target.value);
        console.log("Setback Change: ", side, val);
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

    const handleViewChecked = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.checked;
        const name = e.target.name;
        setViews(values => ({...values, [name]: value}));
    }

    // compute derived building sizes on render
    // const buildingWidth = calculateBuildingWidth();
    // const buildingDepth = calculateBuildingDepth();
    // const buildingHeight = calculateBuildingHeight();
    // const numUnits = calculateNumberOfUnits();
    const buildingArea = calculateBuildingArea();

    function setPresets(key: string) {
        // console.log("Set Preset: ", key);
        // console.log("preset.zoning: ", presetsJson.zoning);
        setPreset(presetsJson.zoning[key].title);
        setEverything(presetsJson.zoning[key]);
        if (presetsJson.zoning[key].maxUnits != -1) {
            setUnitCalcType("Max Unit");
        } else {
            setUnitCalcType("Average Unit Size");
        }
        // handlePresetChange(presets.zoning[key].title);

    }

    function presets() {
        const presetNames = Object.keys(presetsJson.zoning);


        return (
            <div className="sidebar-section" id="presets-container">
                <h2 className="sidebar-title">Presets</h2>
                <div className="description-box">{preset}</div>
                <div className="content-box">
                    {Array.from(presetNames).map((name, i) => {
                        return (
                            <div key={i} className="preset-item">
                                <button className='preset-button' onClick={() => setPresets(name)}>{presetsJson.zoning[name].title}</button>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    function unitCalc() {

        if (unitCalcType == "Average Unit Size" || maxUnits == -1) {
            return (
                <label>
                    Average Unit Size:
                    <input type="number" min={minUnitSize} max={3000} step={50} value={averageUnitSize} onChange={handleAverageUnitSizeChange} />
                    sqft
                </label>
            );
        }

        return (
            <label>
                Max Units:
                <input type="number" min={0} max={50} step={1} value={maxUnits} onChange={handleMaxUnitChange} />
            </label>
        );
    }


    function unitCalcMethod() {

        return (
            <div>
                Unit Calculation Method:
                <div>
                    <label>
                        Average Unit Size
                        <input defaultChecked type='radio' name="unitCalc" value="Average Unit Size" onChange={handleUnitCalcTypeChange} />
                    </label>
                    <label>
                        Max Units
                        <input  type='radio' name="unitCalc" value="Max Unit" onChange={handleUnitCalcTypeChange} />
                    </label>
                    <br></br>
                    {unitCalc()}
                </div>
            </div>
        );
    }

    function variablePanel() {
        return (
            <div className="sidebar-section" id="variable-container">
                <h2 className="sidebar-title">Parameters</h2>
                <div className='description-box'>
                    <span>Adjust the parameters to see how they affect the building layout.</span>
                </div>
                {/* {presetView()} */}
                <div className='content-box variable-panel'>
                    <label>
                        FAR:
                        <input type="number" min={0.1} max={15} step={0.1} value={far} onChange={handleFarChange} />
                    </label>
                    <div>
                        Lot Size
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
                            <label>Width: <input type="number" min={10} max={400} value={siteWidth} onChange={handleSiteWidthChange} style={{ width: 60 }} /> ft </label>
                            <label>Depth: <input type="number" min={10} max={400} value={siteDepth} onChange={handleSiteDepthChange} style={{ width: 60 }} /> ft </label>
                        </div>
                    </div>
                    <div>
                        Setbacks
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
                            <label>Back: <input type="number" min={0} max={50} step={.5} value={setbacks.back} onChange={handleSetbackChange('back')} style={{ width: 40 }} /> ft </label>
                            <label>Right: <input type="number" min={0} max={50} step={.5} value={setbacks.right} onChange={handleSetbackChange('right')} style={{ width: 40 }} /> ft </label>
                            <label>Front: <input type="number" min={0} max={50} step={.5} value={setbacks.front} onChange={handleSetbackChange('front')} style={{ width: 40 }} /> ft </label>
                            <label>Left: <input type="number" min={0} max={50} step={.5} value={setbacks.left} onChange={handleSetbackChange('left')} style={{ width: 40 }} /> ft </label>
                        </div>
                    </div>
                    <label>
                        Max Height:
                        <input type="number" min={15} max={100} step={5} value={maxHeight} onChange={handleMaxHeightChange} />
                        ft
                    </label>
                    {unitCalcMethod()}

                    {/* <label>
                        Minimum Unit Size:
                        <input type="number" min={150} max={averageUnitSize} step={50} value={minUnitSize} onChange={handleMinUnitSizeChange} />
                    </label> */}
                    <label>
                        Open Space per Unit:
                        <input type="number" min={0} max={averageUnitSize} step={10} value={openSpacePerUnit} onChange={handleOpenSpacePerUnitChange} />
                    </label>
                    <label>
                        Parking Spaces per Unit:
                        <input type="number" min={0} max={5} step={0.1} value={parkingPerUnit} onChange={handleParkingPerUnitsChange} />
                    </label>
                    {/* <label>
                        Backing Ally
                        <input type="checkbox" value={backingAlly} onChange={handleBackingAllyChange} />
                    </label> */}
                    <label>
                        Max Coverage
                        <input type="number" min={0.0} max={1.0} step={.05} value={maxCoverage} onChange={handleMaxCoverageChange}></input>
                    </label>
                </div>
            </div>
        );
    }


    function config() {
        return (
            <div className="sidebar-section" id="config">
                <h2 className="sidebar-title">Settings</h2>
                <div className='content-box variable-panel'>
                    <label>
                        Scale: 
                        <input type="number" min={1} max={50} step={1} value={scale} onChange={(e) => setScale(parseFloat(e.target.value))} />    
                    </label>
                    <label>
                        Views
                        <div className="variable-panel">
                            <label>
                                <input name="topDown" type="checkbox" checked={views.topDown} onChange={handleViewChecked}></input>
                                Top Down
                            </label>
                            <label>
                                <input name="front" type="checkbox" checked={views.front} onChange={handleViewChecked}></input>
                                Front
                            </label>
                            <label>
                                <input name="side" type="checkbox" checked={views.side} onChange={handleViewChecked}></input>
                                Side
                            </label>
                            <label>
                                <input name="iso" type="checkbox" checked={views.iso} onChange={handleViewChecked}></input>
                                Isometric
                            </label>
                        </div>
                    </label>
                </div>
            </div>
        );
    }


    return (
        <div id="sidebar">
            {presets()}
            {variablePanel()}
            {config()}
        </div>
    );
}
