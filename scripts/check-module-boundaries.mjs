import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SOURCE_EXTENSIONS = new Set([".js", ".jsx", ".mjs", ".ts", ".tsx"]);
const SOURCE_ROOTS = ["apps", "packages", "services"];
const IMPORT_PATTERN =
  /(?:import\s+(?:[^"']+?\s+from\s+)?|export\s+[^"']+?\s+from\s+|import\s*\(|require\s*\()(["'])([^"']+)\1/g;

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(target);
    return SOURCE_EXTENSIONS.has(path.extname(entry.name)) ? [target] : [];
  });
}

function moduleRoot(root, file) {
  const relative = path.relative(root, file).split(path.sep);
  return relative.length >= 2 ? path.join(root, relative[0], relative[1]) : null;
}

function packageNames(root) {
  return SOURCE_ROOTS.flatMap((directory) => {
    const parent = path.join(root, directory);
    if (!fs.existsSync(parent)) return [];
    return fs
      .readdirSync(parent, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => path.join(parent, entry.name, "package.json"));
  })
    .filter((file) => fs.existsSync(file))
    .map((file) => {
      try {
        return { name: JSON.parse(fs.readFileSync(file, "utf8")).name, root: path.dirname(file) };
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function resolveImport(file, specifier) {
  if (!specifier.startsWith(".")) return null;
  const base = path.resolve(path.dirname(file), specifier);
  const candidates = [
    base,
    ...[".js", ".jsx", ".mjs", ".ts", ".tsx"].map((ext) => `${base}${ext}`),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  return null;
}

export function analyzeBoundary(root) {
  const files = SOURCE_ROOTS.flatMap((directory) => walk(path.join(root, directory)));
  const packages = packageNames(root);
  const graph = new Map(files.map((file) => [file, []]));
  const violations = [];

  for (const file of files) {
    const source = fs.readFileSync(file, "utf8");
    for (const match of source.matchAll(IMPORT_PATTERN)) {
      const specifier = match[2];
      const target = resolveImport(file, specifier);
      const fromModule = moduleRoot(root, file);
      const importedPackage = packages.find(
        ({ name }) => name && (specifier === name || specifier.startsWith(`${name}/`)),
      );
      if (importedPackage && specifier !== importedPackage.name) {
        violations.push({ file, target: importedPackage.root, specifier });
      }
      if (!target) continue;
      graph.get(file).push(target);
      const toModule = moduleRoot(root, target);
      if (fromModule && toModule && fromModule !== toModule) {
        violations.push({ file, target, specifier });
      }
    }
  }

  const cycles = [];
  const visiting = new Set();
  const visited = new Set();
  const stack = [];
  function visit(file) {
    if (visiting.has(file)) {
      cycles.push([...stack.slice(stack.indexOf(file)), file]);
      return;
    }
    if (visited.has(file)) return;
    visiting.add(file);
    stack.push(file);
    for (const target of graph.get(file) ?? []) visit(target);
    stack.pop();
    visiting.delete(file);
    visited.add(file);
  }
  for (const file of files) visit(file);
  return { violations, cycles };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = analyzeBoundary(process.cwd());
  if (result.violations.length || result.cycles.length) {
    for (const violation of result.violations) {
      console.error(`Boundary violation: ${violation.file} imports ${violation.specifier}`);
    }
    for (const cycle of result.cycles) console.error(`Circular dependency: ${cycle.join(" -> ")}`);
    process.exitCode = 1;
  } else {
    console.log(`Module boundary validation passed for ${SOURCE_ROOTS.join(", ")}.`);
  }
}
