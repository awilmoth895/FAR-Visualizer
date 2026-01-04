import React from "react";
import "./sideView.css";
import { useZoningContext } from "~/context/ZoningContext";
import { useConfigContext } from "~/context/ConfigContext";

// move these
const showOverflowArea = false;

export default function sideView() {
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
    const lotDepthPx = siteDepth * scale;
    const buildingDepthPx = buildingDepth * scale;
    const buildingOffsetX = setbacks.front * scale;
    const visibleFloors = Math.max(1, Math.floor(buildingHeight / floorHeight));

    const sideW = lotDepthPx + 40;
    const sideH = lotHeightPx + 40;

    return (
        <div className="side-view view">
            <h2>Side View</h2>
            <svg className="graph" width={sideW} height={sideH}>
                <defs>
                    <pattern id="grid" width={scale} height={scale} patternUnits="userSpaceOnUse">
                        <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#504f4fff" strokeWidth="0.5" />
                    </pattern>
                </defs>

                <g transform={`translate(20, ${sideH - 20})`}>
                    {Array.from({ length: visibleFloors }).map((_, i) => {
                        const fh = floorHeight * scale;
                        const y = -((i + 1) * fh);

                        const floorArea = buildingWidth * buildingDepth;
                        const potentialBuildingArea = maxSiteArea;
                        const buildingAreaSoFar = floorArea * (i);
                        const topFloorArea = potentialBuildingArea - buildingAreaSoFar;

                        if (i + 1 == visibleFloors && topFloorArea < floorArea) {
                            const topFloorDepth = topFloorArea / buildingWidth;
                            const topFloorDepthPx = topFloorDepth * scale;

                            if (topFloorArea < minUnitSize && !showOverflowArea) return null;

                            return <rect className="building" key={i} x={buildingOffsetX} y={y} width={topFloorDepthPx} height={fh} />;
                        }

                        return <rect className="building" key={i} x={buildingOffsetX} y={y} width={buildingDepthPx} height={fh} />;
                    })}

                    <rect x={0} y={-lotHeightPx} width={lotDepthPx} height={lotHeightPx} fill="url(#grid)" pointerEvents="none" />
                    <rect className="outer-stroke" x={0} y={-lotHeightPx} width={lotDepthPx} height={lotHeightPx} />
                    <line className="ground-line" x1={-10} y1={0} x2={lotDepthPx + 10} y2={0} />
                </g>
            </svg>
        </div>
    );
}