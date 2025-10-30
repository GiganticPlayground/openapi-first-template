/**
 * userController
 * Auto-generated from OpenAPI specification
 */

import { NextFunction } from 'express';

import type { ApiRequest, ApiResponse } from '../types/api-helpers';
import { operations, components } from '../types/schema';

/**
 * Get all users
 * Returns a list of all registered users
 * @route GET /users
 */
export const getUsers = async (
  req: ApiRequest<'getUsers'>,
  res: ApiResponse<'getUsers'>,
  next: NextFunction,
): Promise<void> => {
  try {
    // Example: Properly typed query parameters from OpenAPI schema
    // limit and page are now typed as: number | undefined
    const { limit = 10, page = 1 } = req.query || {};

    // TODO: Implement actual business logic (e.g., fetch from database)
    // This is a mock response matching the OpenAPI response schema
    const mockResponse: operations['getUsers']['responses'][200]['content']['application/json'] = {
      data: [],
      total: 0,
      page,
      limit,
    };

    res.status(200).json(mockResponse);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new user
 * Creates a new user in the system
 * @route POST /users
 */
export const createUser = async (
  req: ApiRequest<'createUser'>,
  res: ApiResponse<'createUser', 201>,
  next: NextFunction,
): Promise<void> => {
  try {
    // TODO: Implement business logic
    // req.body is typed as UserCreate (name, email, age?, address?, phone?)
    const { name, email, age, address, phone } = req.body;

    // Mock response matching the User schema
    const mockUser: components['schemas']['User'] = {
      id: Math.floor(Math.random() * 10000).toFixed(0),
      name,
      email,
      ...(age !== undefined && { age }),
      ...(address !== undefined && { address }),
      ...(phone !== undefined && { phone }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    res.status(201).json(mockUser);
  } catch (error) {
    next(error);
  }
};

/**
 * Get a user by ID
 * Returns a specific user based on their ID
 * @route GET /users/{id}
 */
export const getUserById = async (
  req: ApiRequest<'getUserById'>,
  res: ApiResponse<'getUserById'>,
  next: NextFunction,
): Promise<void> => {
  try {
    // TODO: Implement business logic
    // req.params is typed as { id: string }
    const { id } = req.params;

    // Mock response matching the User schema
    const mockUser: components['schemas']['User'] = {
      id,
      name: 'John Doe',
      email: 'john.doe@example.com',
      age: 30,
      address: '123 Main Street, Downtown',
      phone: '+1 555 123 4567',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    res.status(200).json(mockUser);
  } catch (error) {
    next(error);
  }
};

/**
 * Update a complete user
 * Updates all data of an existing user
 * @route PUT /users/{id}
 */
export const updateUser = async (
  req: ApiRequest<'updateUser'>,
  res: ApiResponse<'updateUser'>,
  next: NextFunction,
): Promise<void> => {
  try {
    // TODO: Implement business logic
    // req.params is typed as { id: string }
    // req.body is typed as UserUpdate (name, email, age?, address?, phone?)
    const { id } = req.params;
    const { name, email, age, address, phone } = req.body;

    // Mock response matching the User schema
    const mockUser: components['schemas']['User'] = {
      id,
      name,
      email,
      ...(age !== undefined && { age }),
      ...(address !== undefined && { address }),
      ...(phone !== undefined && { phone }),
      createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      updatedAt: new Date().toISOString(),
    };

    res.status(200).json(mockUser);
  } catch (error) {
    next(error);
  }
};

/**
 * Partially update a user
 * Updates only the specified fields of a user
 * @route PATCH /users/{id}
 */
export const partialUpdateUser = async (
  req: ApiRequest<'partialUpdateUser'>,
  res: ApiResponse<'partialUpdateUser'>,
  next: NextFunction,
): Promise<void> => {
  try {
    // TODO: Implement business logic
    // req.params is typed as { id: string }
    // req.body is typed as UserPartial (all fields optional)
    const { id } = req.params;
    const updates = req.body;

    // Mock response - in real implementation, would merge with existing user
    const mockUser: components['schemas']['User'] = {
      id,
      name: updates.name ?? 'John Doe',
      email: updates.email ?? 'john.doe@example.com',
      ...(updates.age !== undefined && { age: updates.age }),
      ...(updates.address !== undefined && { address: updates.address }),
      ...(updates.phone !== undefined && { phone: updates.phone }),
      createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      updatedAt: new Date().toISOString(),
    };

    res.status(200).json(mockUser);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a user
 * Deletes a user from the system
 * @route DELETE /users/{id}
 */
export const deleteUser = async (
  req: ApiRequest<'deleteUser'>,
  res: ApiResponse<'deleteUser', 204>,
  next: NextFunction,
): Promise<void> => {
  try {
    // TODO: Implement business logic
    // req.params is typed as { id: string }
    // const { id } = req.params;

    // Perform delete operation (mock)
    // In real implementation: await userRepository.delete(id);

    // 204 No Content - no response body
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
