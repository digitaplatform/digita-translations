import { fileURLToPath } from "node:url";
import { buildCatalog } from "./catalog.js";

// Compiled to dist/tools/, so the repository root is two levels up.
const root = new URL("../../", import.meta.url);
const namespaces = buildCatalog(fileURLToPath(new URL("catalog", root)), fileURLToPath(new URL("dist/catalog", root)));
console.log(`catalog built into dist/catalog: ${namespaces.length === 0 ? "no namespace yet" : namespaces.join(", ")}`);
