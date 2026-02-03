/**
 * Type declarations for madge module
 */
declare module 'madge' {
    export interface MadgeConfig {
        fileExtensions?: string[];
        excludeRegExp?: RegExp[];
        tsConfig?: string;
        webpackConfig?: string;
        requireConfig?: string;
        baseDir?: string;
    }

    export interface MadgeResult {
        obj(): Record<string, unknown>;
        circular(): string[][];
        depends(file: string): string[];
        orphans(): string[];
        leaves(): string[];
        dot(): Promise<string>;
        image(path: string): Promise<void>;
    }

    function madge(path: string, config?: MadgeConfig): Promise<MadgeResult>;
    export default madge;
}
