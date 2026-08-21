import {
  cpSync,
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const authorizedCommit = "9ce4361";
const originalBase = "/zellship-maintenance-os-demo/";
const authorizedBase = "/zellship-maintenance-os-demo/atm/";
const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const authorizedOverlay = join(repositoryRoot, "scripts", "authorized-atm-mobile-reset.patch");
const temporaryWorktree = mkdtempSync(join(tmpdir(), "zellship-atm-rc4-"));
const targetDirectory = join(repositoryRoot, "dist-pages", "atm");
let worktreeAdded = false;

function rewriteStaticBase(directory) {
  for (const entry of readdirSync(directory)) {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) {
      rewriteStaticBase(path);
      continue;
    }
    if (![".html", ".js", ".css", ".json"].includes(extname(path))) continue;
    const source = readFileSync(path, "utf8");
    const rebased = source.split(originalBase).join(authorizedBase);
    if (rebased !== source) writeFileSync(path, rebased);
  }
}

try {
  execFileSync("git", ["worktree", "add", "--detach", temporaryWorktree, authorizedCommit], {
    cwd: repositoryRoot,
    stdio: "inherit",
  });
  worktreeAdded = true;

  execFileSync("git", ["apply", authorizedOverlay], {
    cwd: temporaryWorktree,
    stdio: "inherit",
  });

  const sharedNodeModules = join(repositoryRoot, "node_modules");
  if (!existsSync(sharedNodeModules)) {
    throw new Error("Run npm ci before building the authorized ATM snapshot");
  }
  symlinkSync(sharedNodeModules, join(temporaryWorktree, "node_modules"), "dir");

  execFileSync("npm", ["run", "build:atm"], {
    cwd: temporaryWorktree,
    stdio: "inherit",
  });

  const sourceDirectory = join(temporaryWorktree, "dist-pages");
  if (!existsSync(join(sourceDirectory, "index.html"))) {
    throw new Error("Authorized ATM build did not produce index.html");
  }

  rmSync(targetDirectory, { recursive: true, force: true });
  cpSync(sourceDirectory, targetDirectory, { recursive: true });
  rewriteStaticBase(targetDirectory);

  const html = readFileSync(join(targetDirectory, "index.html"), "utf8");
  if (!html.includes(`${authorizedBase}assets/`)) {
    throw new Error("Authorized ATM snapshot was not rebased to its isolated route");
  }
  console.log(`Authorized ATM RC4 (${authorizedCommit}) assembled at ${authorizedBase}`);
} finally {
  if (worktreeAdded) {
    execFileSync("git", ["worktree", "remove", "--force", temporaryWorktree], {
      cwd: repositoryRoot,
      stdio: "inherit",
    });
  } else {
    rmSync(temporaryWorktree, { recursive: true, force: true });
  }
}
