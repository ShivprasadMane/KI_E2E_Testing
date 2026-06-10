/** Funeral dashboard matrix — reuses saved B2C session (see run-matrix-funeral.js). */
process.env.MATRIX_USE_SESSION = '1';
process.env.MATRIX_PERSONA_FILTER = 'funeral';

import './universal.matrix.spec';
