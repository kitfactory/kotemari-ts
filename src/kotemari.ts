import path from "path";

export interface KotemariOptions {
  projectRoot: string;
  configPath?: string;
  useCache?: boolean;
  logLevel?: "silent" | "error" | "warn" | "info" | "debug";
}

export class Kotemari {
  projectRoot: string;
  configPath?: string;
  useCache: boolean;
  logLevel: "silent" | "error" | "warn" | "info" | "debug";

  constructor(options: KotemariOptions) {
    this.projectRoot = options.projectRoot;
    this.configPath = options.configPath;
    this.useCache = options.useCache ?? true;
    this.logLevel = options.logLevel ?? "warn";
  }
}
