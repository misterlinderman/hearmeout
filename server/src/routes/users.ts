import { Router, Request, Response } from 'express';
import { checkJwt, getUserId } from '../middleware/auth';
import { asyncHandler, ApiError } from '../middleware/errorHandler';
import { User } from '../models';

const router = Router();

// Get current user profile
router.get('/me', checkJwt, asyncHandler(async (req: Request, res: Response) => {
  const auth0Id = getUserId(req);
  
  if (!auth0Id) {
    throw new ApiError(401, 'Unauthorized');
  }

  let user = await User.findOne({ auth0Id });

  // Create user if doesn't exist (first login)
  if (!user) {
    const payload = req.auth?.payload;
    user = await User.create({
      auth0Id,
      email: payload?.['https://hearmeout.app/email'] || payload?.email || 'unknown@example.com',
      name: payload?.['https://hearmeout.app/name'] || payload?.name || 'Anonymous',
      picture: payload?.picture,
    });
  }

  res.json({
    success: true,
    data: user,
  });
}));

// Update current user profile
router.put('/me', checkJwt, asyncHandler(async (req: Request, res: Response) => {
  const auth0Id = getUserId(req);
  
  if (!auth0Id) {
    throw new ApiError(401, 'Unauthorized');
  }

  const allowedUpdates = ['name', 'bio', 'location', 'website', 'expertise'];
  const updates: Record<string, any> = {};

  for (const key of allowedUpdates) {
    if (req.body[key] !== undefined) {
      updates[key] = req.body[key];
    }
  }

  const user = await User.findOneAndUpdate(
    { auth0Id },
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.json({
    success: true,
    data: user,
  });
}));

// Get user by ID
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id).select('-auth0Id');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.json({
    success: true,
    data: user,
  });
}));

// Get user stats
router.get('/:id/stats', asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.json({
    success: true,
    data: {
      totalIdeas: user.ideasCount,
      activeIdeas: user.ideasCount, // TODO: Calculate from Ideas collection
      totalContributions: user.contributionsCount,
      fundingRaised: 0, // TODO: Calculate from Contributions
      reputation: user.reputation,
    },
  });
}));

// Delete current user account
router.delete('/me', checkJwt, asyncHandler(async (req: Request, res: Response) => {
  const auth0Id = getUserId(req);
  
  if (!auth0Id) {
    throw new ApiError(401, 'Unauthorized');
  }

  await User.findOneAndDelete({ auth0Id });

  res.json({
    success: true,
    message: 'Account deleted successfully',
  });
}));

export default router;
