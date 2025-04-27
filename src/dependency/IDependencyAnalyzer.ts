export interface IDependencyAnalyzer {
  analyze(
    projectRoot: string,
    exclude?: string[]
  ): {
    files: { path: string }[];
    dependencies: Record<string, string[]>;
    reverseDependencies: Record<string, string[]>;
  };
}
