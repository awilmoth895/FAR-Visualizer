import React, { useState } from "react";
import "./frontView.css";
import { useZoningContext } from "~/ZoningContext";

// move these
const ELEVATION_SCALE = 10; // pixels per unit

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

    const buildingWidth = calculateBuildingWidth();
    const buildingDepth = calculateBuildingDepth();
    const buildingHeight = calculateBuildingHeight();
    const numUnits = calculateNumberOfUnits();
    const buildingArea = calculateBuildingArea();

    function renderParkingArea(elevationScale: number, buildingOffsetX: number, buildingOffsetY: number, buildingDepthPx: number) {
        if (parkingPerUnit > 0) {
            const parkingArea = calculateParkingArea();
            let parkingWidth = buildingWidth;

            if (parkingArea / buildingWidth < parkingLength) {
                parkingWidth = Math.sqrt(parkingArea);
            }

            // make parking render in blocks of parking spaces

            const parkingDepth = parkingArea / parkingWidth;
            const parkingDepthPx = parkingDepth * elevationScale;
            const parkingWidthPx = parkingWidth * elevationScale;
            const parkingOffsetY = buildingOffsetY + buildingDepthPx;

            if (parkingInSetback) {
                return <rect x={buildingOffsetX} y={-(parkingOffsetY + parkingDepthPx)} width={parkingWidthPx} height={parkingDepthPx} fill='rgba(255, 165, 0, 0.5)' stroke='#ff9800' />;
            }
            return <rect x={buildingOffsetX} y={-(buildingOffsetY + parkingDepthPx)} width={parkingWidthPx} height={parkingDepthPx} fill='rgba(255, 165, 0, 0.5)' stroke='#ff9800' />;
        }
        return null;
    }

    function renderOpenSpaceArea(elevationScale: number, buildingOffsetX: number, buildingOffsetY: number, buildingDepthPx: number) {
        if (openSpacePerUnit > 0) {
            const openSpaceArea = openSpacePerUnit * numUnits;
            const openSpaceWidth = buildingWidth;
            const openSpaceDepth = openSpaceArea / openSpaceWidth;

            // console.log("(Num Units: ", numUnits);
            // console.log("Open Space Area: ", openSpaceArea);
            // console.log("Open Space Depth: ", openSpaceDepth);
            // console.log("Building Depth", buildingDepth);
            // console.log("Setback Depth: ", siteDepth - setbacks.front - setbacks.back);

            const openSpaceWidthPx = openSpaceWidth * elevationScale;
            const openSpaceDepthPx = openSpaceDepth * elevationScale;

            return <rect x={buildingOffsetX} y={-(buildingOffsetY + buildingDepthPx + openSpaceDepthPx)} width={openSpaceWidthPx} height={openSpaceDepthPx} fill='rgba(12, 199, 84, 0.5)' stroke='rgba(7, 167, 68, 0.5)' />;
        }
        return null;
    }

    const elevationScale = ELEVATION_SCALE; // pixels per unit
    const lotWidthPx = siteWidth * elevationScale;
    const lotDepthPx = siteDepth * elevationScale;
    const buildingDepthPx = buildingDepth * elevationScale;
    const buildingWidthPx = buildingWidth * elevationScale;
    const buildingOffsetX = setbacks.left * elevationScale;
    const buildingOffsetY = setbacks.front * elevationScale;

    const sideD = lotDepthPx + 40;
    const sideW = lotWidthPx + 40;

    return (
        <div className="topdown-view view">
            <h2>Topdown View</h2>
            <svg className="graph" width={sideW} height={sideD}>
                <defs>
                    <pattern id="grid" width={elevationScale} height={elevationScale} patternUnits="userSpaceOnUse">
                        <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#504f4fff" strokeWidth="0.5" />
                    </pattern>
                </defs>

                <g transform={`translate(20, ${sideD - 20})`}>
                    <rect x={buildingOffsetX} y={-(buildingDepthPx + buildingOffsetY)} width={buildingWidthPx} height={buildingDepthPx} fill='#90caf9' opacity=".75" stroke="#1e88e5" />

                    <rect x={0} y={-lotDepthPx} width={lotWidthPx} height={lotDepthPx} fill="url(#grid)" pointerEvents="none" />

                    <rect x={0} y={-lotDepthPx} width={lotWidthPx} height={lotDepthPx} fill="rgba(0,0,0,0)" stroke="#999" strokeDasharray="6 4" />
                    {renderParkingArea(elevationScale, buildingOffsetX, buildingOffsetY, buildingDepthPx)}
                    {renderOpenSpaceArea(elevationScale, buildingOffsetX, buildingOffsetY, buildingDepthPx)}
                    <line x1={-10} y1={0} x2={lotWidthPx + 10} y2={0} stroke="#333" />
                </g>
            </svg>
        </div>
    );
}