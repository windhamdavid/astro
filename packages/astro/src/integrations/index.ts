import pkgUp from 'pkg-up';
import { fileURLToPath } from 'url';
import { readFile } from 'fs/promises';
import { AstroConfig } from '../@types/astro.js';
import { createRequire } from 'module';
import { resolveDependency } from '../core/util.js';
const resolvePackage = createRequire(import.meta.url).resolve;

async function getUserPackageManifest(config: AstroConfig) {
	const pkgPath = await pkgUp({ cwd: fileURLToPath(config.projectRoot) });
	if (!pkgPath) {
		return;
	}
	return JSON.parse(await readFile(pkgPath, 'utf8'));
}

type IntegrationObject = [string, string, any];

let allDependenciesCached: any[];
export async function loadIntegrations(config: AstroConfig): Promise<IntegrationObject[]> {
	const pkg = await getUserPackageManifest(config);
	const allDependencies = new Set([...Object.keys(pkg.dependencies), ...Object.keys(pkg.devDependencies)]);
  allDependenciesCached = [...Object.entries(pkg.dependencies), ...Object.entries(pkg.devDependencies)];
	const filteredIntegrations = ['/Users/fks/Code/astro/packages/astro/dist/integrations/integration-react.js']; //[...allDependencies].filter(name => name.includes('astro'));
	console.log(filteredIntegrations);
	return await Promise.all(
		filteredIntegrations.map(async (name) => {
			const resolved = resolvePackage(name);
			// const resolved = resolveDependency(name, config);
			console.log(resolved);
			const imported = await import(resolved);
			return [name, resolved, imported];
		})
	);
}

export async function applyIntegrations(config: AstroConfig, integrations: IntegrationObject[]) {
	for (const integration of integrations) {
		console.log(
			await integration[2].default({
				config,
				addRenderer: (obj: string) => config.renderers.push(obj),
        assertDependency: (pkg: string, semver: string) => {
          const found = allDependenciesCached.find((([name]) => name === pkg));
          if (!found) {
            throw new Error(`NOT FOUND: ${pkg}`);
          } 
          if (found[1] !== semver) {
            throw new Error(`NOT MATCH SEMVER ${pkg} ${found[1]} !== ${semver}`);
          }
        }
			})
		);
	}
}
