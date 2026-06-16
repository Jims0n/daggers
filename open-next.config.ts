import { defineCloudflareConfig } from "@opennextjs/cloudflare";
// import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";

export default {
	...defineCloudflareConfig({
		// For best results consider enabling R2 caching
		// See https://opennext.js.org/cloudflare/caching for more details
		// incrementalCache: r2IncrementalCache
	}),
	// Disable the "workerd" esbuild condition so Prisma resolves to index.js
	// (library.js runtime) instead of wasm.js (WASM compiler runtime).
	// With a driver adapter, library.js uses the no-WASM client.js path.
	// The wasm.js path calls new WebAssembly.Module() which CF Workers blocks.
	cloudflare: {
		useWorkerdCondition: false,
	},
};
