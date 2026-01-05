import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    route("FAR-Visualizer", "./routes/visualizer-hook.tsx"),
    // route("visualizer-hook", "./routes/visualizer-hook.tsx"),
    // route("visualizer-isometric", "./routes/visualizer-isometric.tsx"),
] satisfies RouteConfig;
