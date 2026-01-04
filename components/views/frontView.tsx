import React from "react";
import "./frontView.css";
import { useZoningContext } from "~/ZoningContext";

// move these
const ELEVATION_SCALE = 10; // pixels per foot

 
export default function frontView() {
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

    const elevationScale = ELEVATION_SCALE;
    const lotHeightPx = maxHeight * elevationScale;
    const lotWidthPx = siteWidth * elevationScale;
    const buildingWidthPx = buildingWidth * elevationScale;
    const buildingOffsetX = setbacks.left * elevationScale;
    const visibleFloors = Math.max(1, Math.floor(buildingHeight / floorHeight));

    const frontW = lotWidthPx + 40;
    const frontH = lotHeightPx + 40;

    return (
        <div className="front-view view">
            <h2>Front View</h2>
            <svg className="graph" width={frontW} height={frontH}>
                <defs>
                    <pattern id="grid" width={elevationScale} height={elevationScale} patternUnits="userSpaceOnUse">
                        <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#504f4fff" strokeWidth="0.5" />
                    </pattern>
                </defs>
                <g transform={`translate(20, ${frontH - 20})`}>
                    {Array.from({ length: visibleFloors }).map((_, i) => {
                        const fh = floorHeight * elevationScale;
                        const y = -((i + 1) * fh);
                        return <rect key={i} x={buildingOffsetX} y={y} width={buildingWidthPx} height={fh} fill={i % 2 === 0 ? '#90caf9' : '#64b5f6'} stroke="#1e88e5" />;
                    })}

                    <rect x={0} y={-lotHeightPx} width={lotWidthPx} height={lotHeightPx} fill="url(#grid)" pointerEvents="none" />
                    <rect x={0} y={-lotHeightPx} width={lotWidthPx} height={lotHeightPx} fill="rgba(0,0,0,0)" stroke="#999" strokeDasharray="6 4" />
                    <line x1={-10} y1={0} x2={lotWidthPx + 10} y2={0} stroke="#333" />
                </g>
            </svg>
        </div>
    );
}