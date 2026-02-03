import { rename, unlink, mkdir } from 'fs/promises';
import { dirname } from 'path';
import type { Suggestion, Result } from '../types.js';
import { ok, err } from '../types.js';

/**
 * Apply a fix for a suggestion
 */
export async function applyFix(suggestion: Suggestion): Promise<Result<string>> {
    try {
        switch (suggestion.suggestedAction.type) {
            case 'delete':
                return await deleteFile(suggestion);
            case 'rename':
                return await renameFile(suggestion);
            case 'move':
                return await moveFile(suggestion);
            default:
                return err(new Error(`Cannot auto-fix ${suggestion.suggestedAction.type} suggestions`));
        }
    } catch (error) {
        return err(error instanceof Error ? error : new Error(String(error)));
    }
}

async function deleteFile(suggestion: Suggestion): Promise<Result<string>> {
    try {
        await unlink(suggestion.filePath);
        return ok(`Deleted ${suggestion.filePath}`);
    } catch (error) {
        return err(error instanceof Error ? error : new Error(String(error)));
    }
}

async function renameFile(suggestion: Suggestion): Promise<Result<string>> {
    const { from, to } = suggestion.suggestedAction;

    if (!from || !to) {
        return err(new Error('Missing from/to paths for rename'));
    }

    try {
        await rename(from, to);
        return ok(`Renamed ${from} to ${to}`);
    } catch (error) {
        return err(error instanceof Error ? error : new Error(String(error)));
    }
}

async function moveFile(suggestion: Suggestion): Promise<Result<string>> {
    const { from, to } = suggestion.suggestedAction;

    if (!from || !to) {
        return err(new Error('Missing from/to paths for move'));
    }

    try {
        // Ensure destination directory exists
        const destDir = dirname(to);
        await mkdir(destDir, { recursive: true });

        await rename(from, to);
        return ok(`Moved ${from} to ${to}`);
    } catch (error) {
        return err(error instanceof Error ? error : new Error(String(error)));
    }
}
