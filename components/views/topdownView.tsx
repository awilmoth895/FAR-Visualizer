import React, { useState } from "react";
import "./frontView.css";
import { useZoningContext } from "~/context/ZoningContext";
import { useConfigContext } from "~/context/ConfigContext";
import "../views/view.css";


export default function frontView() {

    const [parkingInSetback, setParkingInSetback] = useState(false);
    
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
        scale, setScale
    }  = useConfigContext();

    const buildingWidth = calculateBuildingWidth();
    const buildingDepth = calculateBuildingDepth();
    const buildingHeight = calculateBuildingHeight();
    const numUnits = calculateNumberOfUnits();
    const buildingArea = calculateBuildingArea();

    function renderParkingArea(scale: number, buildingOffsetX: number, buildingOffsetY: number, buildingDepthPx: number) {
        if (parkingPerUnit > 0) {
            const parkingArea = calculateParkingArea();
            let parkingWidth = buildingWidth;

            if (parkingArea / buildingWidth < parkingLength) {
                parkingWidth = Math.sqrt(parkingArea);
            }

            // make parking render in blocks of parking spaces

            const parkingDepth = parkingArea / parkingWidth;
            const parkingDepthPx = parkingDepth * scale;
            const parkingWidthPx = parkingWidth * scale;
            const parkingOffsetY = buildingOffsetY + buildingDepthPx;

            if (parkingInSetback) {
                return <rect x={buildingOffsetX} y={-(parkingOffsetY + parkingDepthPx)} width={parkingWidthPx} height={parkingDepthPx} fill='rgba(255, 165, 0, 0.5)' stroke='#ff9800' />;
            }
            return <rect x={buildingOffsetX} y={-(buildingOffsetY + parkingDepthPx)} width={parkingWidthPx} height={parkingDepthPx} fill='rgba(255, 165, 0, 0.5)' stroke='#ff9800' />;
        }
        return null;
    }

    function renderOpenSpaceArea(scale: number, buildingOffsetX: number, buildingOffsetY: number, buildingDepthPx: number) {
        if (openSpacePerUnit > 0) {
            const openSpaceArea = openSpacePerUnit * numUnits;
            const openSpaceWidth = buildingWidth;
            const openSpaceDepth = openSpaceArea / openSpaceWidth;

            // console.log("(Num Units: ", numUnits);
            // console.log("Open Space Area: ", openSpaceArea);
            // console.log("Open Space Depth: ", openSpaceDepth);
            // console.log("Building Depth", buildingDepth);
            // console.log("Setback Depth: ", siteDepth - setbacks.front - setbacks.back);

            const openSpaceWidthPx = openSpaceWidth * scale;
            const openSpaceDepthPx = openSpaceDepth * scale;

            return <rect className="open-space" x={buildingOffsetX} y={-(buildingOffsetY + buildingDepthPx + openSpaceDepthPx)} width={openSpaceWidthPx} height={openSpaceDepthPx} />;
        }
        return null;
    }

    const lotWidthPx = siteWidth * scale;
    const lotDepthPx = siteDepth * scale;
    const buildingDepthPx = buildingDepth * scale;
    const buildingWidthPx = buildingWidth * scale;
    const buildingOffsetX = setbacks.left * scale;
    const buildingOffsetY = setbacks.front * scale;

    const sideD = lotDepthPx + 40;
    const sideW = lotWidthPx + 40;

    return (
        <div className="topdown-view view">
            <h2>Topdown View</h2>
            <svg className="graph" width={sideW} height={sideD}>
                <defs>
                    <pattern id="grid" width={scale} height={scale} patternUnits="userSpaceOnUse">
                        <path d="M 10 0 L 0 0 0 10"/>
                    </pattern>
                    <pattern id="buildingTexture" patternUnits="userSpaceOnUse" width="95" height="100">  {/* Adjust width/height to control tiling size */}
                        <image href="../../assets/brick-wall.svg" width="100" height="100"/>  {/* Path to your SVG */}
                    </pattern>
                </defs>

                <g transform={`translate(20, ${sideD - 20})`}>
                    <rect className="building" x={buildingOffsetX} y={-(buildingDepthPx + buildingOffsetY)} width={buildingWidthPx} height={buildingDepthPx} fill="url(#buildingTexture)"/>

                    <rect x={0} y={-lotDepthPx} width={lotWidthPx} height={lotDepthPx} fill="url(#grid)" pointerEvents="none" />

                    <rect className="outer-stroke" x={0} y={-lotDepthPx} width={lotWidthPx} height={lotDepthPx}/>
                    {renderParkingArea(scale, buildingOffsetX, buildingOffsetY, buildingDepthPx)}
                    {renderOpenSpaceArea(scale, buildingOffsetX, buildingOffsetY, buildingDepthPx)}
                    {/* <line x1={-10} y1={0} x2={lotWidthPx + 10} y2={0} stroke="#333" /> */}
                </g>
            </svg>
        </div>
    );
}