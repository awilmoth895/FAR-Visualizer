import { useState } from "react";
import configJson from "../config/config.json";

type ConfigContextType = typeof configJson;

export function useConfig(init: ConfigContextType) {
    const [scale, setScale] = useState(init.scale || 10);

    return {
        scale, setScale
    } as const
}