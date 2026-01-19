import { Router, Request, Response } from 'express';
import { checkJwt, getUserId, requireRole } from '../middleware/auth';
import { asyncHandler, ApiError } from '../middleware/errorHandler';
import { Idea, User, Contribution } from '../models';

const router = Router();

// For development - list all ideas regardless of status
router.get('/ideas/all', asyncHandler(async (req: Request, res: Response) => {
  const ideas = await Idea.find({})
    .sort({ createdAt: -1 })
    .populate('creator', 'name email picture');

  res.json({
    success: true,
    data: ideas,
    count: ideas.length,
  });
}));

// List pending ideas for moderation
router.get('/ideas/pending', asyncHandler(async (req: Request, res: Response) => {
  const ideas = await Idea.find({ status: 'pending-review' })
    .sort({ createdAt: -1 })
    .populate('creator', 'name email picture');

  res.json({
    success: true,
    data: ideas,
    count: ideas.length,
  });
}));

// Approve an idea
router.put('/ideas/:id/approve', asyncHandler(async (req: Request, res: Response) => {
  const idea = await Idea.findByIdAndUpdate(
    req.params.id,
    { status: 'active' },
    { new: true }
  ).populate('creator', 'name email picture');

  if (!idea) {
    throw new ApiError(404, 'Idea not found');
  }

  res.json({
    success: true,
    data: idea,
    message: 'Idea approved successfully',
  });
}));

// Reject an idea
router.put('/ideas/:id/reject', asyncHandler(async (req: Request, res: Response) => {
  const { reason } = req.body;
  
  const idea = await Idea.findByIdAndUpdate(
    req.params.id,
    { 
      status: 'rejected',
      rejectionReason: reason || 'Did not meet submission guidelines'
    },
    { new: true }
  ).populate('creator', 'name email picture');

  if (!idea) {
    throw new ApiError(404, 'Idea not found');
  }

  res.json({
    success: true,
    data: idea,
    message: 'Idea rejected',
  });
}));

// List all users (for debugging)
router.get('/users', asyncHandler(async (req: Request, res: Response) => {
  const users = await User.find({}).select('-auth0Id').sort({ createdAt: -1 });

  res.json({
    success: true,
    data: users,
    count: users.length,
  });
}));

// Platform stats
router.get('/stats', asyncHandler(async (req: Request, res: Response) => {
  const [totalIdeas, totalUsers, pendingIdeas, activeIdeas] = await Promise.all([
    Idea.countDocuments(),
    User.countDocuments(),
    Idea.countDocuments({ status: 'pending-review' }),
    Idea.countDocuments({ status: 'active' }),
  ]);

  res.json({
    success: true,
    data: {
      totalIdeas,
      totalUsers,
      pendingIdeas,
      activeIdeas,
    },
  });
}));

export default router;
