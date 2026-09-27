import { fileURLToPath } from "node:url";
import { SUPPORTED_LANGUAGES } from "../src/languages.js";
import { checkCatalog } from "./catalog.js";

// Compiled to dist/tools/, so the catalog is two levels up.
const report = checkCatalog(fileURLToPath(new URL("../../catalog", import.meta.url)));
for (const problem of report.problems) console.error(problem);
console.log(
  `catalog: ${report.namespaces.length} namespace(s), ${report.keys} key(s), each checked in ` +
    `${SUPPORTED_LANGUAGES.length} languages (${SUPPORTED_LANGUAGES.join(", ")}): ${report.problems.length} problem(s)`,
);
process.exit(report.problems.length === 0 ? 0 : 1);
