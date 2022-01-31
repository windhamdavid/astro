import { AstroConfig } from '../@types/astro.js';

export default async function (astro: { config: Readonly<AstroConfig>, assertDependency: (pkg: string, semver: string) => void, addRenderer: (mod: any | Promise<any>) => void}) {
  // EXAMPLE: Preact Integration
  // In a future system, you would add preact by simply running `astro add preact`
  // or `astro setup preact` and then astro would take care of the rest.

  // addRenderer: Add a renderer to the project. This would most likely be stored
  // in the same package as the integration itself, so more likely: import('./renderer/index.js');
  astro.addRenderer(await import(`@astrojs` + `/renderer-preact`));
  // assertDependency: Assert that this is a dependency of the project.
  astro.assertDependency('preact', '~10.5.0');

  // Example: React
  // astro.addRenderer(await import(`@astrojs` + `/renderer-react`));
  // astro.assertDependency('react', '^17.0.0');
  // astro.assertDependency('react-dom', '^17.0.0');
	return astro.config.buildOptions.site;
}
