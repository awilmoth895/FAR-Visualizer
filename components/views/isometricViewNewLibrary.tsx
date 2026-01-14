import React, { useState } from "react";
// import "./isometricView.css";
import { useZoningContext } from "~/context/ZoningContext";
import { useConfigContext } from "~/context/ConfigContext";
// import { build } from "vite";
import { IsometricContainer, Isometric, IsometricGrid, IsometricCube } from "isometric-react";

const showOverflowArea = false;


export default function isometricView() {
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
    } = useConfigContext();

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

    const lotDepthPx = siteDepth * scale;
    const buildingDepthPx = buildingDepth * scale;
    const buildingOffsetFront = setbacks.front * scale;
    const buildingOffsetBack = setbacks.back * scale;

    const sideD = lotDepthPx + 40;
    const sideW = lotWidthPx + 40;
    const sideH = lotHeightPx + 40;


    const gridMatrix = new DOMMatrixReadOnly()
        .translate(20, lotDepthPx + 40)
        .translate(buildingHeight * scale, buildingHeight * scale)


    const isoMatrix = new DOMMatrixReadOnly()
        .rotate(30)
        .skewX(-30)
        .scale(1, 0.8602)
        .translate(250, -250)

    

    return (
        <div className="iso">
            {/* <svg className="graph" width={frontW + sideD} height={frontH * 2 + sideH} transform={isoMatrix}>
                <defs>
                    <pattern id="grid" width={scale} height={scale} patternUnits="userSpaceOnUse">
                        <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#504f4fff" strokeWidth="0.5" />
                    </pattern>
                </defs>
                <g transform={gridMatrix}>
                    <rect x={0} y={-lotDepthPx} width={lotWidthPx} height={lotDepthPx} fill="url(#grid)" pointerEvents="none" />
                    <rect className="outer-stroke" x={0} y={-lotDepthPx} width={lotWidthPx} height={lotDepthPx} />

                </g>
            </svg> */}
            <IsometricContainer>
                <Isometric>
                    <IsometricGrid
                        size={.5}
                        sizeMultiplier={{
                            width: siteWidth,
                            height: siteDepth
                        }}
                        color="black"
                        lineweight={4}
                    />
                    <IsometricCube
                        width={buildingWidth}
                        height={buildingHeight}
                        depth={buildingDepth}
                        color="White"
                        border={{
                            size: "2px",
                            style: "solid",
                            color: "#000000",
                        }}
                    >
                        {[...Array(6)].map((_, sideIndex) => (
                            <div key={sideIndex}>Side: {sideIndex}</div>
                        ))}
                    </IsometricCube>
                </Isometric>
            </IsometricContainer>
        </div>
    )



    // const isoMatrix = new DOMMatrixReadOnly()
    //     .rotate(30)
    //     .skewX(-30)
    //     .scale(1, 0.8602)
    //     .translate(250, -250)


    // const topMatrix = new DOMMatrixReadOnly()
    //     .translate(20, 450)
    //     // .translate(buildingHeight*scale, buildingHeight*scale)
    //     .translate(0, -setbacks.front*scale)

    // const frontMatrix = new DOMMatrixReadOnly()
    //     .translate(20, 450)
    //     .skewX(45)
    //     .translate(0, buildingHeight * scale)

    // const sideMatrix = new DOMMatrix()
    //     .translate(20, 450)
    //     .translate(buildingWidthPx, -setbacks.left*scale)
    //     .skewY(45)

    // const gridMatrix = new DOMMatrixReadOnly()
    //     .translate(20, lotDepthPx+40)
    //     .translate(buildingHeight*scale, buildingHeight*scale)


    // function renderParkingArea(scale: number, buildingOffsetX: number, buildingOffsetY: number, buildingDepthPx: number) {
    //     if (parkingPerUnit > 0) {
    //         const parkingArea = calculateParkingArea();
    //         let parkingWidth = buildingWidth;

    //         if (parkingArea / buildingWidth < parkingLength) {
    //             parkingWidth = Math.sqrt(parkingArea);
    //         }

    //         // make parking render in blocks of parking spaces

    //         const parkingDepth = parkingArea / parkingWidth;
    //         const parkingDepthPx = parkingDepth * scale;
    //         const parkingWidthPx = parkingWidth * scale;
    //         const parkingOffsetY = buildingOffsetY + buildingDepthPx;

    //         if (parkingInSetback) {
    //             return <rect x={buildingOffsetX} y={-(parkingOffsetY + parkingDepthPx)} width={parkingWidthPx} height={parkingDepthPx} fill='rgba(255, 165, 0, 0.5)' stroke='#ff9800' />;
    //         }
    //         return <rect x={buildingOffsetX} y={-(buildingOffsetY + parkingDepthPx)} width={parkingWidthPx} height={parkingDepthPx} fill='rgba(255, 165, 0, 0.5)' stroke='#ff9800' />;
    //     }
    //     return null;
    // }

    // function renderOpenSpaceArea(scale: number, buildingOffsetX: number, buildingOffsetY: number, buildingDepthPx: number) {
    //     if (openSpacePerUnit > 0) {
    //         const openSpaceArea = openSpacePerUnit * numUnits;
    //         const openSpaceWidth = buildingWidth;
    //         const openSpaceDepth = openSpaceArea / openSpaceWidth;

    //         // console.log("(Num Units: ", numUnits);
    //         // console.log("Open Space Area: ", openSpaceArea);
    //         // console.log("Open Space Depth: ", openSpaceDepth);
    //         // console.log("Building Depth", buildingDepth);
    //         // console.log("Setback Depth: ", siteDepth - setbacks.front - setbacks.back);

    //         const openSpaceWidthPx = openSpaceWidth * scale;
    //         const openSpaceDepthPx = openSpaceDepth * scale;

    //         return <rect className="open-space" x={buildingOffsetX} y={-(buildingOffsetY + buildingDepthPx + openSpaceDepthPx)} width={openSpaceWidthPx} height={openSpaceDepthPx} />;
    //     }
    //     return null;
    // }

    // return (
    //     <div className="isometric-view view">
    //         <h2>Front View</h2>
    //         {/* <svg className="graph" width={frontW + sideD} height={frontH + sideH} transform={isoMatrix}> */}
    //         <svg className="graph" width={frontW + sideD} height={frontH * 2 + sideH}>
    //             <defs>
    //                 <pattern id="grid" width={scale} height={scale} patternUnits="userSpaceOnUse">
    //                     <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#504f4fff" strokeWidth="0.5" />
    //                 </pattern>
    //             </defs>
    //             <g transform={isoMatrix}>
    //             {/* 
    //             <polygon joint-selector="body" id="v-4"
    //                 stroke-width="2" stroke="#333333" fill="#ff0000"
    //                 fill-opacity="0.7" points="0,0 60,0 60,20 40,20 40,60 0,60"
    //                 transform={topMatrix}>
    //             </polygon> */}
    //             <g transform={gridMatrix}>
    //                 <rect x={0} y={-lotDepthPx} width={lotWidthPx} height={lotDepthPx} fill="url(#grid)" pointerEvents="none" />
    //                 <rect className="outer-stroke" x={0} y={-lotDepthPx} width={lotWidthPx} height={lotDepthPx} />

    //             </g>

    //             <g transform={frontMatrix}>
    //                 {Array.from({ length: visibleFloors }).map((_, i) => {
    //                     const fh = floorHeight * scale;
    //                     const y = -((i + 1) * fh);
    //                     return <rect className="building front" key={i} x={buildingOffsetX} y={y} width={buildingWidthPx} height={fh} />;
    //                 })}

    //                 {/* <rect x={0} y={-lotHeightPx} width={lotWidthPx} height={lotHeightPx} fill="url(#grid)" pointerEvents="none" /> */}
    //                 {/* <rect className="outer-stroke" x={0} y={-lotHeightPx} width={lotWidthPx} height={lotHeightPx} /> */}
    //                 {/* <line className="ground-line"x1={-10} y1={0} x2={lotWidthPx + 10} y2={0} />          */}
    //             </g>


    //             <g transform={sideMatrix.toString()}>
    //                 {Array.from({ length: visibleFloors }).map((_, i) => {
    //                     const fh = floorHeight * scale;
    //                     const y = -((i) * fh);

    //                     const floorArea = buildingWidth * buildingDepth;
    //                     const potentialBuildingArea = maxSiteArea;
    //                     const buildingAreaSoFar = floorArea * (i);
    //                     // const topFloorArea = potentialBuildingArea - buildingAreaSoFar;

    //                     // if (i + 1 == visibleFloors && topFloorArea < floorArea) {
    //                     //     const topFloorDepth = topFloorArea / buildingWidth;
    //                     //     const topFloorDepthPx = topFloorDepth * scale;

    //                     //     if (topFloorArea < minUnitSize && !showOverflowArea) return null;

    //                     //     // return <rect className="building side" key={i} x={buildingOffsetX} y={y} width={topFloorDepthPx} height={fh} />;
    //                     //     return <rect className="building side" key={i} x={buildingOffsetX} y={y} width={fh} height={topFloorDepthPx} />;
    //                     // }

    //                     // return <rect className="building side" key={i} x={buildingOffsetX} y={y} width={buildingDepthPx} height={fh} />;
    //                     return <rect className="building side" key={i} x={buildingOffsetX - y} y={-buildingDepthPx} width={fh} height={buildingDepthPx} />;
    //                 })}

    //                 {/* <rect x={0} y={-lotHeightPx} width={lotDepthPx} height={lotHeightPx} fill="url(#grid)" pointerEvents="none" /> */}
    //                 {/* <rect className="outer-stroke" x={0} y={-lotHeightPx} width={lotDepthPx} height={lotHeightPx} /> */}
    //                 {/* <line className="ground-line" x1={-10} y1={0} x2={lotDepthPx + 10} y2={0} /> */}
    //             </g>

    //             <g transform={topMatrix}>
    //                 <rect className="building top" x={buildingOffsetX} y={-(buildingDepthPx + buildingOffsetFront - buildingOffsetBack)} width={buildingWidthPx} height={buildingDepthPx} />

    //                 {/* <rect x={0} y={-lotDepthPx} width={lotWidthPx} height={lotDepthPx} fill="url(#grid)" pointerEvents="none" /> */}

    //                 {/* {renderParkingArea(scale, buildingOffsetX, buildingOffsetY, buildingDepthPx)} */}
    //                 {/* {renderOpenSpaceArea(scale, buildingOffsetX, buildingOffsetY, buildingDepthPx)} */}
    //                 {/* <line x1={-10} y1={0} x2={lotWidthPx + 10} y2={0} stroke="#333" /> */}
    //             </g>
    //             </g>
    //         </svg>
    //     </div>
    // );
}