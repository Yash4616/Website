import { data } from "./data";
import type { Site } from "./site";

/**
 * The content object for client code. Only the lazy chunks import this (the
 * Field and the command palette), so in the Brief view it is never fetched.
 * It is the same object the server validated at build time: the schema has
 * no defaults or transforms, so the input and the parsed output are equal.
 */
export const site: Site = data;
