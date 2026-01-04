import { useCallback, useMemo, useState } from 'react';

export type Setbacks = { front: number; right: number; back: number; left: number };

export type zoningData = Partial<Record<string, any>> & { setbacks?: Partial<Setbacks> };

function ensureNumber(v: any, name = 'value'): number {
    const n = Number(v);
    if (!Number.isFinite(n)) throw new TypeError(`${name} must be a finite number: ${v}`);
    return n;
}

export function useZoningCalculator(init: zoningData = {}) {
    const [far, setFar] = useState<number>(() => ensureNumber(init.far ?? 1.0, 'far'));
    const [siteWidth, setSiteWidth] = useState<number>(() => ensureNumber(init.siteWidth ?? 40, 'siteWidth'));
    const [siteDepth, setSiteDepth] = useState<number>(() => ensureNumber(init.siteDepth ?? 75, 'siteDepth'));

    const defaultSetbacks: Setbacks = { front: 12.5, right: 5, back: 10, left: 5 };
    const [setbacks, setSetbacksState] = useState<Setbacks>(() => {
        const s = { ...defaultSetbacks, ...(init.setbacks ?? {}) } as any;
        for (const k of ['front','right','back','left'] as const) s[k] = ensureNumber(s[k], `setbacks.${k}`);
        return s as Setbacks;
    });

    const [floorHeight, setFloorHeight] = useState<number>(() => ensureNumber(init.floorHeight ?? 10, 'floorHeight'));
    const [maxHeight, setMaxHeight] = useState<number>(() => ensureNumber(init.maxHeight ?? 35, 'maxHeight'));

    const [averageUnitSize, setAverageUnitSize] = useState<number>(() => ensureNumber(init.averageUnitSize ?? 1000, 'averageUnitSize'));
    const [minUnitSize, setMinUnitSize] = useState<number>(() => ensureNumber(init.minUnitSize ?? 500, 'minUnitSize'));
    const [maxUnits, setMaxUnits] = useState<number>(() => ensureNumber(init.maxUnitSize ?? -1, 'Max Units'));

    const [parkingPerUnit, setParkingPerUnit] = useState<number>(() => ensureNumber(init.parkingPerUnit ?? 0, 'parkingPerUnit'));
    const [parkingLength, setParkingLength] = useState<number>(() => ensureNumber(init.parkingLength ?? 18, 'parkingLength'));
    const [parkingWidth, setParkingWidth] = useState<number>(() => ensureNumber(init.parkingWidth ?? 8.6, 'parkingWidth'));
    const [parkingLaneWidth, setParkingLaneWidth] = useState<number>(() => ensureNumber(init.parkingLaneWidth ?? 12, 'parkingLaneWidth'));

    const [openSpacePerUnit, setOpenSpacePerUnit] = useState<number>(() => ensureNumber(init.openSpacePerUnit ?? 0, 'openSpacePerUnit'));

    const [maxCoverage, setMaxCoverage] = useState<number>(() => ensureNumber(init.maxCoverage ?? 1, 'maxCoverage'));
 
    // derived values
    const siteBaseArea = useMemo(() => siteWidth * siteDepth, [siteWidth, siteDepth]);
    const maxSiteArea = useMemo(() => siteBaseArea * far, [siteBaseArea, far]);

    const calculateBuildingWidth = useCallback(() => {
        return Math.max(0, siteWidth - setbacks.left - setbacks.right)
    }, [siteWidth, setbacks]);

    const calculateUnitSpaceNeededMax = useCallback((width: number, depth: number) => {
        const area = width * depth;
        const parkingSpotArea = parkingLength * parkingWidth;
        let unitAreaPlus = averageUnitSize + (parkingSpotArea * parkingPerUnit);

        if ((area / unitAreaPlus) * parkingPerUnit > 2) {
            const parkingLaneArea = parkingLaneWidth * parkingWidth;
            unitAreaPlus += parkingLaneArea * parkingPerUnit;
        }
     
        return Math.round(unitAreaPlus);
    }, [averageUnitSize, openSpacePerUnit, parkingLength, parkingWidth, parkingPerUnit, parkingLaneWidth]);

    const calculateUnitSpaceNeededMin = useCallback((width: number, depth: number) => {
        const area = width * depth;
        const parkingSpotArea = parkingLength * parkingWidth;
        let unitAreaPlus = minUnitSize + (parkingSpotArea * parkingPerUnit);

        if ((area / unitAreaPlus) * parkingPerUnit > 2) {
            const parkingLaneArea = parkingLaneWidth * parkingWidth;
            unitAreaPlus += parkingLaneArea * parkingPerUnit;
        }
     
        return Math.round(unitAreaPlus);
    }, [averageUnitSize, openSpacePerUnit, parkingLength, parkingWidth, parkingPerUnit, parkingLaneWidth]);


    const calculateBuildingDepth = useCallback(() => {
       const width = calculateBuildingWidth();
        const rawDepth = Math.max(0, siteDepth - setbacks.front - setbacks.back);
        if (width <= 0 || rawDepth <= 0) return 0;

        // open space and maxUnits does not work together
        if (maxUnits > -1) {
            return rawDepth;
        }

        // start with the raw depth and iterate to account for open-space-per-unit eating into depth across floors
        let depth = rawDepth;
        let prev = -1;
        
        let maxAreaNeeded = calculateUnitSpaceNeededMax(width, depth);

        const openSpaceDepthPer = openSpacePerUnit / width;
        const minAreaNeeded = calculateUnitSpaceNeededMin(width, depth);

        // let finalDepth = 0;
            
        for (let i = 0; i < (maxSiteArea/minAreaNeeded); i++) {
            const baseArea = Math.max(0, width * depth);
            if (baseArea <= 0) return 0;

            // // how many full floors could the site FAR support with this footprint
            // const floors = Math.max(1, Math.floor(maxSiteArea / baseArea));
            // const buildingArea = baseArea * floors;
            // areaNeeded = calculateUnitSpaceNeeded(width, depth);
            let buildingHeight = 0;
            let area = 0;

            for (area = baseArea; area <= maxSiteArea; area += baseArea) {
                buildingHeight += floorHeight;
            }

            if (maxSiteArea - (area - baseArea) > 0) {
                buildingHeight += floorHeight;
            }

            buildingHeight =  Math.min(buildingHeight, Math.floor(maxHeight/floorHeight) * floorHeight);
            // console.log("Height: ", buildingHeight);

            // const units = (baseArea * (buildingHeight/floorHeight))/(areaNeeded);
            const minAreaNeeded = calculateUnitSpaceNeededMin(width, depth);

            // // compute units using average unit size, but ensure any leftover area that can form at least a minUnitSize is counted as another unit
            /// const perUnitAreaNoOpen = Math.max(1, averageUnitSize);
            // let units = Math.floor(buildingArea / perUnitAreaNoOpen);
            // const leftover = buildingArea - (units * perUnitAreaNoOpen);
            // if (leftover >= Math.max(0, minUnitSize)) units += 1;

            // // include parking footprint per unit (approximate), and include lane area if parking demand is high
            // const parkingSpotArea = parkingLength * parkingWidth;
            // let perUnitParking = parkingPerUnit * parkingSpotArea;
            // if (parkingPerUnit * units > 2) {
            //     perUnitParking += parkingLaneWidth * parkingWidth * parkingPerUnit / Math.max(1, units);
            // }

            // total open space required and convert to depth along width
            // const requiredOpenSpace = units * openSpacePerUnit;
            // const openSpaceDepth = requiredOpenSpace / Math.max(1, width);

            // // new effective building depth (so that buildingDepth + openSpaceDepth == rawDepth)
            // const nextDepth = Math.max(0, rawDepth - openSpaceDepth);

            // console.log("Depth: ", depth);
            // potential building area with open space less than area needed for that many units
            // console.log("\nDepth: ", depth, "i: ", i);
            // console.log("Potential building area: ", (baseArea * (buildingHeight/floorHeight)), "AreaNeeded: ", (i * (maxAreaNeeded)));
            if ((baseArea * (buildingHeight/floorHeight)) < (i * maxAreaNeeded) - minAreaNeeded) {
                // console.log("Previous: ", prev);
                // return prev;
                depth = prev;
                break;
            }

//             if (Math.round(((depth * width) * (buildingHeight/floorHeight))/(areaNeeded)) == Math.round(units)) {
//                 console.log("1 depth before: ", depth);
//                 depth = rawDepth - (openSpaceDepthPer * units);
//                 console.log("depth after: ", depth);

//                 return depth;
//             }

//             console.log("Calc: ", Math.round(((depth * width) * (buildingHeight/floorHeight))/(areaNeeded)), "NoCalc: ", Math.round(units));

//             if (Math.round(((depth * width) * (buildingHeight/floorHeight))/(areaNeeded)) > Math.round(units)) {                
//                 console.log(" 2 depth before: ", depth);
//                 depth = rawDepth - (openSpaceDepthPer * (i - 1));
//                 console.log("depth after: ", depth);
//                 console.log("prev: ", prev);
// // 
//                 return prev;
//             }

            // if (Math.abs(nextDepth - prev) < 1e-3) return Math.round(nextDepth * 100) / 100;
            // console.log("3 depth before: ", depth);
            // depth = rawDepth - (openSpaceDepthPer * i);
            // console.log("depth after: ", depth);
            prev = depth;
            depth = rawDepth - (openSpaceDepthPer * i);
            // depth = nextDepth;
            if (depth <= 0) return 0;
        }

        if ((depth * width) > maxSiteArea * maxCoverage) {
            depth = maxSiteArea * maxCoverage;
        }

        
        return Math.round(depth * 100) / 100;
    }, [siteDepth, setbacks, calculateBuildingWidth, maxSiteArea, averageUnitSize, openSpacePerUnit, parkingPerUnit, parkingLength, parkingWidth, maxCoverage]);

    // const calculateBuildingDepth = useCallback(() => {
    //    const width = calculateBuildingWidth();
    //     const rawDepth = Math.max(0, siteDepth - setbacks.front - setbacks.back);
    //     if (width <= 0 || rawDepth <= 0) return 0;

    //     // start with the raw depth and iterate to account for open-space-per-unit eating into depth across floors
    //     let depth = rawDepth;
    //     let prev = -1;
    //     for (let i = 0; i < 40; i++) {
    //         const baseArea = Math.max(0, width * depth);
    //         if (baseArea <= 0) return 0;

    //         // how many full floors could the site FAR support with this footprint
    //         const floors = Math.max(1, Math.floor(maxSiteArea / baseArea));
    //         const buildingArea = baseArea * floors;

    //         // compute units using average unit size, but ensure any leftover area that can form at least a minUnitSize is counted as another unit
    //         const perUnitAreaNoOpen = Math.max(1, averageUnitSize);
    //         let units = Math.floor(buildingArea / perUnitAreaNoOpen);
    //         const leftover = buildingArea - (units * perUnitAreaNoOpen);
    //         if (leftover >= Math.max(0, minUnitSize)) units += 1;

    //         // include parking footprint per unit (approximate), and include lane area if parking demand is high
    //         const parkingSpotArea = parkingLength * parkingWidth;
    //         let perUnitParking = parkingPerUnit * parkingSpotArea;
    //         if (parkingPerUnit * units > 2) {
    //             perUnitParking += parkingLaneWidth * parkingWidth * parkingPerUnit / Math.max(1, units);
    //         }

    //         // total open space required and convert to depth along width
    //         const requiredOpenSpace = units * openSpacePerUnit;
    //         const openSpaceDepth = requiredOpenSpace / Math.max(1, width);

    //         // new effective building depth (so that buildingDepth + openSpaceDepth == rawDepth)
    //         const nextDepth = Math.max(0, rawDepth - openSpaceDepth);

    //         if (Math.abs(nextDepth - prev) < 1e-3) return Math.round(nextDepth * 100) / 100;
    //         prev = nextDepth;
    //         depth = nextDepth;
    //         if (depth <= 0) return 0;
    //     }

    //     return Math.round(depth * 100) / 100;
    // }, [siteDepth, setbacks, calculateBuildingWidth, maxSiteArea, averageUnitSize, openSpacePerUnit, parkingPerUnit, parkingLength, parkingWidth]);

    // const calculateBuildingDepth = useCallback(() => {
    //     const width = calculateBuildingWidth();
    //     let depth = Math.max(0, siteDepth - setbacks.front - setbacks.back);

    //     if (width <= 0) return 0;
        
    //     if (width * depth > maxSiteArea) {
    //         depth = Math.floor(maxSiteArea / width);
    //     }
        
    //     const unitAreaNeeded = calculateUnitSpaceNeeded(width, depth);

    //     const maxUnits = maxSiteArea / unitAreaNeeded;

    //     const openSpaceDepthPerUnit = openSpacePerUnit/width;
    //     let baseBuildingArea = width * (depth - openSpaceDepthPerUnit);


    //     let numUnits = 0;
    //     let buildingHeight = 0;
    //     let area = 0;
    //     let tempDepth = depth;


    //     while (area < maxSiteArea && buildingHeight < maxHeight) {
    //         numUnits++;
    //         area += unitAreaNeeded;
    //         tempDepth -=
    //     }

    //     // const tempDepth = depth - openSpaceDepthPerUnit;

    //     while (tempDepth * width) {

    //     }



    //     console.log("Num Units: ", numUnitsSimple);
    //     const openSpaceArea = numUnitsSimple * openSpacePerUnit;
    //     const openSpaceDepth = openSpaceArea / width;
    //     console.log("Open Space: ", openSpaceArea, " = ", width, " * ", openSpaceDepth);

    //     console.log("Depth: ", depth);

    //     return Math.max(0, (depth - openSpaceDepth));
    // }, [siteDepth, setbacks, calculateBuildingWidth, maxSiteArea, openSpacePerUnit]);

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

        return Math.min(buildingHeight, Math.floor(maxHeight/floorHeight) * floorHeight);
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

        // if (finalArea > (maxSiteArea*far) * maxCovearge) {
        //     finalArea = (maxSiteArea*far) * maxCovearge;
        // }
        
        return finalArea;
    }, [calculateBuildingWidth, calculateBuildingDepth, calculateBuildingHeight(), maxSiteArea, floorHeight]);

    const calculateNumberOfUnits = useCallback(() => {

        if (maxUnits > -1) {
            return maxUnits;
        }
        const area = calculateBuildingArea();
        const depth = calculateBuildingDepth()
        const width = calculateBuildingWidth();
        const parkingSpotArea = parkingLength * parkingWidth;
        let unitAreaPlus = averageUnitSize + (parkingSpotArea * parkingPerUnit) + openSpacePerUnit;

        if ((area / unitAreaPlus) * parkingPerUnit > 2) {
            const parkingLaneArea = parkingLaneWidth * parkingWidth;
            unitAreaPlus += parkingLaneArea * parkingPerUnit;
        }
        
        let units = Math.max(0, Math.round(area / unitAreaPlus));
        if (units == 0) { return 0 }

        // console.log("Depth Calcluated: ", ((units * openSpacePerUnit)/width) + (area/width), "Depth Max: ",  siteDepth - setbacks.front - setbacks.back);
        if (openSpacePerUnit != 0) {
            while (((units * openSpacePerUnit)/width) + (depth) > siteDepth - setbacks.front - setbacks.back) {
            // console.log("Units: ", units);
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

        return Math.round(Math.round(fullParkingArea/(parkingSpotArea + parkingLaneArea)) * (parkingSpotArea + parkingLaneArea));
    }, [calculateNumberOfUnits, parkingLength, parkingWidth, parkingPerUnit, parkingLaneWidth]);

    const calculateResidentialArea = useCallback(() => {
        return Math.max(0, Math.round(calculateBuildingArea() - calculateParkingArea()));
    }, [calculateBuildingArea, calculateParkingArea]);

    // setters with small helpers
    const setSetbacks = useCallback((obj: Partial<Setbacks>) => {
        if (obj == null || typeof obj !== 'object') throw new TypeError('setbacks must be an object');
        const s = { front: 0, right: 0, back: 0, left: 0, ...obj } as Setbacks;
        for (const k of ['front','right','back','left'] as const) {
            (s as any)[k] = ensureNumber((s as any)[k], `setbacks.${k}`);
        }
        setSetbacksState(s);
    }, []);

    const setEverything = useCallback((init: InitOpts = {}) => {
        setFar(ensureNumber(init.far ?? far));
        setSiteWidth(ensureNumber(init.siteWidth ?? siteWidth));
        setSiteDepth(ensureNumber(init.siteDepth ?? siteDepth));

        setSetbacks(init.setbacks ?? setbacks);
        
        setFloorHeight(ensureNumber(init.floorHeight ?? floorHeight));
        setMaxHeight(ensureNumber(init.maxHeight ?? maxHeight));

        setAverageUnitSize( ensureNumber(init.averageUnitSize ?? averageUnitSize));
        setMinUnitSize(ensureNumber(init.minUnitSize ?? minUnitSize));

        setParkingPerUnit(ensureNumber(init.parkingPerUnit ?? parkingPerUnit));
        setParkingLength(ensureNumber(init.parkingLength ?? parkingLength));
        setParkingWidth(ensureNumber(init.parkingWidth ?? parkingWidth));
        setParkingLaneWidth(ensureNumber(init.parkingLaneWidth ?? parkingLaneWidth));

        setOpenSpacePerUnit(ensureNumber(init.openSpacePerUnit ?? openSpacePerUnit));

        setMaxUnits(ensureNumber(init.maxUnits ?? maxUnits));
        setMaxCoverage(ensureNumber(init.maxCoverage ?? maxCoverage));
    }, []);

    // return state and operations
    return {
        // raw state values
        far, setFar,
        siteWidth, setSiteWidth,
        siteDepth, setSiteDepth,
        setbacks, setSetbacks,
        floorHeight, setFloorHeight,
        maxHeight, setMaxHeight,
        averageUnitSize, setAverageUnitSize,
        minUnitSize, setMinUnitSize,
        parkingPerUnit, setParkingPerUnit,
        parkingLength, setParkingLength,
        parkingWidth, setParkingWidth,
        parkingLaneWidth, setParkingLaneWidth,
        openSpacePerUnit, setOpenSpacePerUnit,
        maxUnits, setMaxUnits,
        maxCoverage, setMaxCoverage,

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
    } as const;
}

export default useZoningCalculator;
