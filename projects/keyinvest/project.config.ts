import path from 'path';

export type ProjectConfig = {
  id: string;
  displayName: string;
  matrixPath: string;
};

const rootDir = path.resolve(__dirname, '../..');

const config: ProjectConfig = {
  id: 'keyinvest',
  displayName: 'KeyInvest EIP Portal',
  matrixPath: path.join(rootDir, 'projects/keyinvest/data/matrix.xlsx'),
};

export default config;

export function getRepoRoot(): string {
  return rootDir;
}

export function resolveMatrixPath(projectId: string): string {
  if (projectId !== 'keyinvest') {
    throw new Error(`Unknown project: ${projectId}. Supported: keyinvest`);
  }
  const override = process.env.MATRIX_FILE?.trim();
  if (override) {
    return path.isAbsolute(override) ? override : path.join(rootDir, override);
  }
  return config.matrixPath;
}
