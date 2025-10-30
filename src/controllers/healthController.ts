/**
 * healthController
 * Auto-generated from OpenAPI specification
 */

import { Request, Response, NextFunction } from 'express';
import { operations, components } from '../types/schema';
import type { ApiRequest, ApiResponse } from '../types/api-helpers';

/**
 * Health check endpoint
 * 
 * @route GET /health
 */
export const getHealth = async (
  req: ApiRequest<'getHealth'>,
  res: ApiResponse<'getHealth'>,
  next: NextFunction
): Promise<void> => {
  try {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

