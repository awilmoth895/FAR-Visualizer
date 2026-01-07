import React from "react";
import "./frontView.css";
import { useZoningContext } from "~/context/ZoningContext";
import { useConfigContext } from "~/context/ConfigContext";


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

    const {
        scale, setScale
    }  = useConfigContext();

    const buildingWidth = calculateBuildingWidth();
    const buildingDepth = calculateBuildingDepth();
    const buildingHeight = calculateBuildingHeight();
    const numUnits = calculateNumberOfUnits();
    const buildingArea = calculateBuildingArea();

    const lotHeightPx = maxHeight * scale;
    const lotWidthPx = siteWidth * scale;
    const buildingWidthPx = buildingWidth * scale;
    const buildingOffsetX = setbacks.left * scale;
    const visibleFloors = Math.max(1, Math.floor(buildingHeight / floorHeight));

    const frontW = lotWidthPx + 40;
    const frontH = lotHeightPx + 40;

    return (
        <div className="front-view view">
            <h2>Front View</h2>
            <svg className="graph" width={frontW} height={frontH}>
                <defs>
                    <pattern id="grid" width={scale} height={scale} patternUnits="userSpaceOnUse">
                        <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#504f4fff" strokeWidth="0.5" />
                    </pattern>
                </defs>
                <g transform={`translate(20, ${frontH - 20})`}>
                    {Array.from({ length: visibleFloors }).map((_, i) => {
                        const fh = floorHeight * scale;
                        const y = -((i + 1) * fh);
                        return <rect className="building" key={i} x={buildingOffsetX} y={y} width={buildingWidthPx} height={fh} />;
                    })}

                    <rect x={0} y={-lotHeightPx} width={lotWidthPx} height={lotHeightPx} fill="url(#grid)" pointerEvents="none" />
                    <rect className="outer-stroke" x={0} y={-lotHeightPx} width={lotWidthPx} height={lotHeightPx} />
                    <line className="ground-line"x1={-10} y1={0} x2={lotWidthPx + 10} y2={0} />         
                </g>
            </svg>
        </div>
    );
}