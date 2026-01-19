import { useState } from "react";
import configJson from "../config/config.json";

type ConfigContextType = typeof configJson;
// export type Views = [string];


export function useConfig(init: ConfigContextType) {
    const [scale, setScale] = useState(init.scale || 10);
    const [views, setViews] = useState(init.views || {
        "topDown": false,
        "side": false,
        "front": false,
        "iso": false
    });
    const [menuOpen, setMenuOpen] = useState(false);
    const [infoOpen, setInfoOpen] = useState(false);

    return {
        scale, setScale,
        views, setViews,
        menuOpen, setMenuOpen,
        infoOpen, setInfoOpen
    } as const
}