import { useZoningContext } from "~/context/ZoningContext";
import "./infoPanel.css";


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
            {/* <h2>Information</h2> */}
            <div className="info-section">
                <h2 className="info-title">
                    Building Dimensions
                </h2>
                <div className="content-box">
                    <div>Width: {buildingWidth} ft</div>
                    <div>Depth: {Math.round((buildingDepth * 10) / 10)} ft</div>
                    <div>Height: {buildingHeight} ft</div>
                    <div>Total Building Area: {calculateBuildingArea()}</div>
                </div>
            </div>
            <div className="info-section">
                <h2 className="info-title"> 
                    Residential
                </h2>
                <div className="content-box">
                    <div>Area: {calculateResidentialArea()} </div>
                    <div>Number of Units: {calculateNumberOfUnits()}</div>
                    <div>Average Unit Size: {calculateResidentialArea() / calculateNumberOfUnits()}</div>
                </div>
            </div>
            <div className="info-section">
                <h2 className="info-title">
                    Parking
                </h2>
                <div className='content-box'>
                    <div>Area: {calculateParkingArea()}</div>
                    <div>Spaces: {Math.round(calculateNumberOfUnits() * parkingPerUnit)}</div>
                </div>
            </div>
            <div className="info-section">
                <h2 className="info-title">
                    Open Space
                </h2>
                <div className="content-box">
                    <div>Width: {openSpacePerUnit > 0 ? buildingWidth : 0} </div>
                    <div>Depth: {Math.round((((openSpacePerUnit * calculateNumberOfUnits()) / buildingWidth) * 10) / 10)}</div>
                    <div>Area: {openSpacePerUnit * calculateNumberOfUnits()}</div>
                </div>
            </div>
            <div className="info-section">
                <h2 className="info-title">
                    Site Dimensions
                </h2>
                <div id="site-info" className='content-box'>
                    <div>Width: {siteWidth}</div>
                    <div>Depth: {siteDepth}</div>
                    <div>Area: {siteBaseArea}</div>
                    <div>Max Sqft: {maxSiteArea}</div>
                </div>
            </div>
        </div>
    );
}