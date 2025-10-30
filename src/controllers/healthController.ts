/**
 * healthController
 * Auto-generated from OpenAPI specification
 */

import { NextFunction } from 'express';

import type { ApiRequest, ApiResponse } from '../types/api-helpers';

/**
 * Health check endpoint
 *
 * @route GET /health
 */
export const getHealth = async (
  req: ApiRequest<'getHealth'>,
  res: ApiResponse<'getHealth'>,
  next: NextFunction,
): Promise<void> => {
  try {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};
