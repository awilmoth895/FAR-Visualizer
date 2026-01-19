import { useZoningContext } from "~/context/ZoningContext";
import "./infoPanel.css";
import Section from "./parts/section";
 

export default function infoPanel() {
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
        calculateBuildingArea, calculateNumberOfUnits, 
        calculateParkingArea, calculateResidentialArea,

        setEverything
    } = useZoningContext();

    const buildingWidth = calculateBuildingWidth();
    const buildingDepth = calculateBuildingDepth();
    const buildingHeight = calculateBuildingHeight();
    // const numUnits = calculateNumberOfUnits();
    // const buildingArea = calculateBuildingArea();

    return (
        <div id="info-panel">
            <Section title="Building" >
                <div>Width: {buildingWidth} ft</div>
                <div>Depth: {Math.round((buildingDepth * 10) / 10)} ft</div>
                <div>Height: {buildingHeight} ft</div>
                <div>Total Area: {calculateBuildingArea()}</div>
            </Section>
            <Section title="Residential">
                <div>Area: {calculateResidentialArea()} </div>
                <div>Number of Units: {calculateNumberOfUnits()}</div>
                <div>Average Unit Size: {Math.round((calculateResidentialArea() / calculateNumberOfUnits()) * 10 / 10)}</div>
            </Section>
            <Section title="Parking">
                <div>Area: {calculateParkingArea()}</div>
                <div>Spaces: {Math.round(calculateNumberOfUnits() * parkingPerUnit)}</div>
            </Section>
            <Section title="Open Space">
                <div>Width: {openSpacePerUnit > 0 ? buildingWidth : 0} </div>
                <div>Depth: {Math.round((((openSpacePerUnit * calculateNumberOfUnits()) / buildingWidth) * 10) / 10)}</div>
                <div>Area: {openSpacePerUnit * calculateNumberOfUnits()}</div>
            </Section>
           <Section title="Site" >
                <div>Width: {siteWidth}</div>
                <div>Depth: {siteDepth}</div>
                <div>Area: {siteBaseArea}</div>
                <div>Max Sqft: {maxSiteArea}</div>
           </Section>
        </div>
    );
}