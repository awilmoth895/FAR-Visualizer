import type { Route } from "./+types/home";
import { TestElement } from "../welcome/testElement";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Test Page" },
    { name: "Here to test", content: "Welcome to React Router!" },
  ];
}

export default function Test() {
  return <TestElement />;
}