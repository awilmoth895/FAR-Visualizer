import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("test", "./routes/test.tsx"),
    // route("density", "./routes/density-visualizer.tsx")
    route("blueprint", "./routes/blueprint-visualizer.tsx"),
    route("visualizer", "./routes/visualizer.tsx")
] satisfies RouteConfig;
