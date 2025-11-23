import React, { useState } from "react";
import "./../app.css";


// default building dimensions
const SITE_WIDTH = 40; // feet
const SITE_DEPTH = 75; // feet
const MAX_HEIGHT = 35; // feet
const FLOOR_HEIGHT = 10; // feet per floor
const MAX_FAR = 1.0; // maximum Floor Area Ratio

const SETBACKS = { front: 12, right: 5, back: 15, left: 5 }; // 


export default function Visualizer() {
    const [far, setFar] = useState(MAX_FAR);
    const [maxHeight, setMaxHeight] = useState(MAX_HEIGHT);
    const [siteWidth, setSiteWidth] = useState(SITE_WIDTH);
    const [siteDepth, setSiteDepth] = useState(SITE_DEPTH);
    const [siteArea, setSiteArea] = useState(siteWidth * siteDepth);
    const [setbacks, setSetbacks] = useState(SETBACKS);
    const [buildingDepth, setBuildingDepth] = useState(calculateBuildingDepth(setbacks, siteWidth, siteDepth, far));
    const [buildingWidth, setBuildingWidth] = useState(calculateBuildingWidth(setbacks, siteWidth, siteDepth, far));

    const [buildingHeight, setBuildingHeight] = useState(calculateBuildingHeight(far, siteArea, buildingWidth * buildingDepth, maxHeight));


    const handleBuildingWChange = (e: React.ChangeEvent<HTMLInputElement>) => setBuildingWidth(Number(calculateBuildingWidth(setbacks, siteWidth, siteDepth, far)));
    const handleBuildingDChange = (e: React.ChangeEvent<HTMLInputElement>) => setBuildingDepth(Number(calculateBuildingDepth(setbacks, siteWidth, siteDepth, far)));
    const handleBuildingHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => setBuildingHeight(Number(calculateBuildingHeight(far, siteArea, buildingWidth * buildingDepth, maxHeight)));

    const handleFarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFar(() => {
            const next = Number(e.target.value);
            const newDepth = calculateBuildingDepth(setbacks, siteWidth, siteDepth, next);

            setBuildingDepth(newDepth);

            const newH = calculateBuildingHeight(next, siteArea, buildingWidth * buildingDepth, maxHeight);
            setBuildingHeight(newH);
            return next;
        });
    };

    const handleSetbackChange = (side: keyof typeof setbacks) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = Number(e.target.value);
        // update setbacks and compute derived sizes from the new setbacks (avoid stale closure values)
        setSetbacks(prev => {
            const next = { ...prev, [side]: val };
            const newW = calculateBuildingWidth(next, siteWidth, siteDepth, far);
            const newD = calculateBuildingDepth(next, siteWidth, siteDepth, far);
            setBuildingWidth(newW);
            setBuildingDepth(newD);
            const newH = calculateBuildingHeight(far, siteArea, newW * newD, maxHeight);
            setBuildingHeight(newH);
            return next;
        });
    };

    const handleMaxHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMaxHeight(() => {
            const next = Number(e.target.value)
            const newH = calculateBuildingHeight(far, siteArea, buildingWidth * buildingDepth, next);
            setBuildingHeight(newH);
            return next;
        });
    };

    const handleSiteWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSiteWidth(() => {
            const next = Number(e.target.value);
            const newW = calculateBuildingWidth(setbacks, next, siteDepth, far);
            setBuildingWidth(newW);
            const newDepth = calculateBuildingDepth(setbacks, next, siteDepth, far);
            setBuildingDepth(newDepth);
            const newArea = next * siteDepth;
            setSiteArea(newArea);
            const newH = calculateBuildingHeight(far, newArea, newW * buildingDepth, maxHeight);
            setBuildingHeight(newH);
            return next;
        });
    }

    
    const handleSiteDepthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSiteDepth(() => {
            const next = Number(e.target.value);
            const newD = calculateBuildingDepth(setbacks, siteWidth, next, far);
            setBuildingDepth(newD);
            const newArea = siteWidth * next;
            setSiteArea(newArea);
            const newH = calculateBuildingHeight(far, newArea, buildingWidth * newD, maxHeight);
            setBuildingHeight(newH);
            return next;
        });
    }

    function calculateBuildingWidth(setbacks: { left: number; front: number, right: number; back: number }, siteWidth: number, siteDepth: number, far: number): number {
        return Math.max(0, siteWidth - setbacks.left - setbacks.right);
    }

    function calculateBuildingDepth(setbacks: { left: number; front: number, right: number, back: number }, siteWidth: number, siteDepth: number, far: number): number {
        const siteArea = siteWidth * siteDepth;
        const maxSiteArea = siteArea * far;
        let newDepth = Math.max(0, siteDepth - setbacks.front - setbacks.back);
        const buildingWidth = Math.max(0, siteWidth - setbacks.left - setbacks.right);
        
        // console.log("\nDepth: ", newDepth);
        // console.log("Setbacks:", setbacks);
        // console.log("sideDepth: ", siteDepth);
        // console.log("buildingArea", newDepth * buildingWidth);
        // console.log("maxSiteArea", maxSiteArea);
        if (buildingWidth * newDepth > maxSiteArea) {
            while (buildingWidth * newDepth > maxSiteArea && newDepth > 0) {
                newDepth -= 1;
            }
            console.log("adjusted building depth to:", newDepth);
        }

        return newDepth;
    }

    function calculateBuildingHeight(far: number, siteArea: number, baseBuildingArea: number, maxHeight: number): number {
        const maxSiteArea = siteArea * far;
        console.log('\nCalculating building height with far:', far, 'siteArea:', siteArea, 'baseBuildingArea:', baseBuildingArea, 'maxHeight:', maxHeight);
        console.log('maxSiteArea:', maxSiteArea);
        let buildingHeight = 0;
        let area = 0;
        for (area = baseBuildingArea; area <= maxSiteArea; area += baseBuildingArea) {
            // console.log('area:', area, 'buildingHeight:', buildingHeight);
            buildingHeight += FLOOR_HEIGHT;
            console.log('area:', area, 'buildingHeight:', buildingHeight);
            
        }
        console.log('Final area:', area, 'buildingHeight:', buildingHeight);

        if (maxSiteArea - (area - baseBuildingArea) > 0) {
            buildingHeight += FLOOR_HEIGHT;
        }
        console.log('Final Height:', buildingHeight, 'Real height: ', Math.floor(maxHeight/FLOOR_HEIGHT) * FLOOR_HEIGHT);


        return Math.min(buildingHeight, Math.floor(maxHeight/FLOOR_HEIGHT) * FLOOR_HEIGHT);
    }

    function variablePanel() {
        return (
            <div className="variable-panel">
                <h2>Zoning Visualizer</h2>
                <p>Adjust the parameters to see how they affect the building layout.</p>
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
                        <label>Back: <input type="number" min={0} max={50} step={.5} value={setbacks.back} onChange={handleSetbackChange('back')} style={{ width: 60 }} /> ft </label>
                        <label>Right: <input type="number" min={0} max={50} step={.5} value={setbacks.right} onChange={handleSetbackChange('right')} style={{ width: 60 }} /> ft </label>
                        <label>Front: <input type="number" min={0} max={50} step={.5} value={setbacks.front} onChange={handleSetbackChange('front')} style={{ width: 60 }} /> ft </label>
                        <label>Left: <input type="number" min={0} max={50} step={.5} value={setbacks.left} onChange={handleSetbackChange('left')} style={{ width: 60 }} /> ft </label>
                    </div>
                </div>
                <label>
                    Max Height:
                    <input type="number" min={15} max={100} step={5} value={maxHeight} onChange={handleMaxHeightChange} />
                    ft
                </label>
            </div>
        );
    }

    function topdownView() {
        const elevationScale = 10;//6; // pixels per unit of height
        // const lotHeightPx = maxHeight * elevationScale;
        const lotWidthPx = siteWidth * elevationScale;
        const lotDepthPx = siteDepth * elevationScale;
        const buildingDepthPx = buildingDepth * elevationScale;
        const buildingWidthPx = buildingWidth * elevationScale;
        const buildingOffsetX = setbacks.left * elevationScale;
        const buildingOffsetY = setbacks.front * elevationScale;
        // const visibleFloors = Math.max(1, Math.floor(buildingHeight / FLOOR_HEIGHT));

        const sideD = lotDepthPx + 40;
        const sideW = lotWidthPx + 40;
        // const sideH = lotHeightPx + 40;

        // console.log("buildingHeight:", buildingHeight);


        return (
            <div className="topdown-view view">
                <h2>Topdown View</h2>
                <svg className="graph" width={sideW} height={sideD}>
                    <defs>
                        <pattern id="grid" width={elevationScale} height={elevationScale} patternUnits="userSpaceOnUse">
                            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#504f4fff" strokeWidth="0.5"/>
                        </pattern>
                       
                    </defs>

                    <g transform={`translate(20, ${sideD - 20})`}>
                        {/* building footprint first */}
                        <rect x={buildingOffsetX} y={-(buildingDepthPx + buildingOffsetY)} width={buildingWidthPx} height={buildingDepthPx} fill='#90caf9' opacity=".75" stroke="#1e88e5" />

                        {/* draw grid on top of building footprint */}
                        <rect x={0} y={-lotDepthPx} width={lotWidthPx} height={lotDepthPx} fill="url(#grid)" pointerEvents="none" />

                        {/* lot outline stroke on top for clarity */}
                        <rect x={0} y={-lotDepthPx} width={lotWidthPx} height={lotDepthPx} fill="rgba(0,0,0,0)" stroke="#999" strokeDasharray="6 4" />

                        
                        {/* ground line on top of grid */}
                        <line x1={-10} y1={0} x2={lotWidthPx + 10} y2={0} stroke="#333" />
                    </g>
                </svg>
            </div>
        );
    }

    function sideView() {
        const elevationScale = 10;//6; // pixels per unit of height
        const lotHeightPx = maxHeight * elevationScale;
        // const lotWidthPx = siteWidth * elevationScale;
        const lotDepthPx = siteDepth * elevationScale;
        const buildingDepthPx = buildingDepth * elevationScale;
        const buildingOffsetX = setbacks.front * elevationScale;
        const visibleFloors = buildingHeight / FLOOR_HEIGHT; // Math.max(1, Math.floor(buildingHeight / FLOOR_HEIGHT));

        const sideW = lotDepthPx + 40;
        const sideH = lotHeightPx + 40;

        return (
            <div className="side-view view">
                <h2>Side View</h2>
                <svg className="graph" width={sideW} height={sideH}>
                    <defs>
                        <pattern id="grid" width={elevationScale} height={elevationScale} patternUnits="userSpaceOnUse">
                            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#504f4fff" strokeWidth="0.5"/>
                        </pattern>  
                    </defs>
                    
                    <g transform={`translate(20, ${sideH - 20})`}>
                        
                        {Array.from({ length: visibleFloors }).map((_, i) => {
                            const fh = FLOOR_HEIGHT * elevationScale;
                            const y = -((i + 1) * fh);

                            const floorArea = buildingWidth * buildingDepth;
                            const potentialBuildingArea = far * siteArea;
                            const buildingAreaSoFar = floorArea * (i);
                            const topFloorArea = potentialBuildingArea - buildingAreaSoFar;
                            
                            if (i + 1 == visibleFloors && topFloorArea < floorArea) {

                                const topFloorDepth = topFloorArea / buildingWidth;
                                const topFloorDepthPx = topFloorDepth * elevationScale;

                                return <rect key={i} x={buildingOffsetX} y={y} width={topFloorDepthPx} height={fh} fill={i % 2 === 0 ? '#90caf9' : '#64b5f6'} stroke="#1e88e5" />;
 
                            }

                            return <rect key={i} x={buildingOffsetX} y={y} width={buildingDepthPx} height={fh} fill={i % 2 === 0 ? '#90caf9' : '#64b5f6'} stroke="#1e88e5" />;
                        })}
                        <rect x={0} y={-lotHeightPx} width={lotDepthPx} height={lotHeightPx} fill="url(#grid)" pointerEvents="none" />

                        <rect x={0} y={-lotHeightPx} width={lotDepthPx} height={lotHeightPx} fill="rgba(0,0,0,0)" stroke="#999" strokeDasharray="6 4" />


                        <line x1={-10} y1={0} x2={lotDepthPx + 10} y2={0} stroke="#333" />
                    </g>
                </svg>
            </div>
        );
    }

    function frontView() {
        const elevationScale = 10;//6; // pixels per unit of height
        const lotHeightPx = maxHeight * elevationScale;
        const lotWidthPx = siteWidth * elevationScale;
        // console.log("buildingWidth:", buildingWidth);
        const buildingWidthPx = buildingWidth * elevationScale;
        // const buildingOffsetX = (lotWidthPx - buildingWidthPx) / 2;
        const buildingOffsetX = setbacks.left * elevationScale;
        const visibleFloors = Math.max(1, Math.floor(buildingHeight / FLOOR_HEIGHT));

        const frontW = lotWidthPx + 40;
        const frontH = lotHeightPx + 40;

        // console.log("buildingHeight:", buildingHeight);


        return (
            <div className="front-view view">
                <h2>Front View</h2>
                <svg className="graph" width={frontW} height={frontH}>
                    <defs>
                        <pattern id="grid" width={elevationScale} height={elevationScale} patternUnits="userSpaceOnUse">
                            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#504f4fff" strokeWidth="0.5"/>
                        </pattern>  
                    </defs>
                    <g transform={`translate(20, ${frontH - 20})`}>
                        
                        {Array.from({ length: visibleFloors }).map((_, i) => {
                            const fh = FLOOR_HEIGHT * elevationScale;
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


    return (
        <div className="main-container">  
            {variablePanel()}
            <div className="visualization-panel">
                {topdownView()}
                {frontView()}
                {sideView()}
            </div>
        </div>
    );
}