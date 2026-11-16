// Lets `node --test` run the site's TypeScript directly, with no test
// framework installed: it resolves the "@/" alias from tsconfig.json and
// imports written without a file extension. Node strips the types itself.
import { registerHooks } from "node:module";
import { pathToFileURL } from "node:url";

const root = pathToFileURL(`${process.cwd()}/`).href;

registerHooks({
  resolve(specifier, context, nextResolve) {
    const mapped = specifier.startsWith("@/") ? root + specifier.slice(2) : specifier;
    const local = mapped.startsWith(".") || mapped.startsWith("file:");
    if (!local) return nextResolve(mapped, context);
    try {
      return nextResolve(mapped, context);
    } catch (error) {
      if (/\.[a-z]+$/.test(mapped)) throw error;
      return nextResolve(`${mapped}.ts`, context);
    }
  },
});
