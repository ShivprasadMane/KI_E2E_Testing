import fs from 'fs';
import path from 'path';
import { getRepoRoot } from '../../../projects/keyinvest/project.config';

const DOCUMENTS_DIR = path.join(
  getRepoRoot(),
  'projects/keyinvest/data/documents/create-application',
);

const DEFAULT_SET: Record<string, string> = {
  'default-id': 'default-id.pdf',
  'default-supporting': 'default-supporting.pdf',
};

export function resolveDocumentPaths(documentSet: string): string[] {
  const setKey = documentSet.trim() || 'default-docs';
  const files =
    setKey === 'default-docs'
      ? [DEFAULT_SET['default-id'], DEFAULT_SET['default-supporting']]
      : setKey.split(',').map((f) => f.trim()).filter(Boolean);

  return files.map((file) => {
    const resolved = path.join(DOCUMENTS_DIR, file);
    if (!fs.existsSync(resolved)) {
      throw new Error(
        `Document not found: ${resolved}. Place PDFs in projects/keyinvest/data/documents/create-application/`,
      );
    }
    return resolved;
  });
}

export function primarySignedDocument(documentSet: string): string {
  return resolveDocumentPaths(documentSet)[0];
}

/** Qld Client Care Statement — required when investor residential state is Queensland. */
export function queenslandDocument(documentSet: string): string {
  const paths = resolveDocumentPaths(documentSet);
  if (paths.length >= 2) {
    return paths[1];
  }
  const fallback = path.join(DOCUMENTS_DIR, DEFAULT_SET['default-supporting']);
  if (!fs.existsSync(fallback)) {
    throw new Error(`Queensland demo document not found: ${fallback}`);
  }
  return fallback;
}
