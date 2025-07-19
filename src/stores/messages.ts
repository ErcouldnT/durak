import { writable } from "svelte/store";

export const messages = writable<string[]>(["Welcome to Durak!"]);
