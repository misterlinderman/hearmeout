import { Router, Request, Response } from 'express';
import { checkJwt, getUserId } from '../middleware/auth';
import { asyncHandler, ApiError } from '../middleware/errorHandler';
import { Contribution, Idea, User } from '../models';

const router = Router();

// Get contributions made by current user
router.get('/my-contributions', checkJwt, asyncHandler(async (req: Request, res: Response) => {
  const auth0Id = getUserId(req);
  const user = await User.findOne({ auth0Id });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const contributions = await Contribution.find({ contributor: user._id })
    .sort({ createdAt: -1 })
    .populate('idea', 'title status')
    .populate('contributor', 'name picture');

  res.json({
    success: true,
    data: contributions,
  });
}));

// Get contributions received (for user's ideas)
router.get('/received', checkJwt, asyncHandler(async (req: Request, res: Response) => {
  const auth0Id = getUserId(req);
  const user = await User.findOne({ auth0Id });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Get all ideas by this user
  const userIdeas = await Idea.find({ creator: user._id }).select('_id');
  const ideaIds = userIdeas.map(i => i._id);

  const contributions = await Contribution.find({ idea: { $in: ideaIds } })
    .sort({ createdAt: -1 })
    .populate('idea', 'title status')
    .populate('contributor', 'name picture expertise');

  res.json({
    success: true,
    data: contributions,
  });
}));

// Get contributions for a specific idea
router.get('/idea/:ideaId', asyncHandler(async (req: Request, res: Response) => {
  const contributions = await Contribution.find({ 
    idea: req.params.ideaId,
    status: { $in: ['accepted', 'completed'] }
  })
    .sort({ createdAt: -1 })
    .populate('contributor', 'name picture');

  res.json({
    success: true,
    data: contributions,
  });
}));

// Create contribution offer
router.post('/', checkJwt, asyncHandler(async (req: Request, res: Response) => {
  const auth0Id = getUserId(req);
  const user = await User.findOne({ auth0Id });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const { ideaId, type, description, amount, currency, message, terms } = req.body;

  const idea = await Idea.findById(ideaId);

  if (!idea) {
    throw new ApiError(404, 'Idea not found');
  }

  // Can't contribute to own idea
  if (idea.creator.toString() === user._id.toString()) {
    throw new ApiError(400, 'Cannot contribute to your own idea');
  }

  // Check for existing pending contribution
  const existingContribution = await Contribution.findOne({
    idea: ideaId,
    contributor: user._id,
    status: 'pending',
  });

  if (existingContribution) {
    throw new ApiError(400, 'You already have a pending contribution for this idea');
  }

  const contribution = await Contribution.create({
    idea: ideaId,
    contributor: user._id,
    type,
    description,
    amount,
    currency: currency || '$',
    message,
    terms,
    status: 'pending',
  });

  // Update idea contribution count
  await Idea.findByIdAndUpdate(ideaId, { $inc: { contributionCount: 1 } });

  const populatedContribution = await Contribution.findById(contribution._id)
    .populate('idea', 'title')
    .populate('contributor', 'name picture');

  res.status(201).json({
    success: true,
    data: populatedContribution,
  });
}));

// Update contribution status (accept/reject)
router.put('/:id/status', checkJwt, asyncHandler(async (req: Request, res: Response) => {
  const auth0Id = getUserId(req);
  const user = await User.findOne({ auth0Id });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const { status, responseMessage } = req.body;

  if (!['accepted', 'rejected'].includes(status)) {
    throw new ApiError(400, 'Invalid status. Must be "accepted" or "rejected"');
  }

  const contribution = await Contribution.findById(req.params.id)
    .populate('idea');

  if (!contribution) {
    throw new ApiError(404, 'Contribution not found');
  }

  // Verify the user owns the idea
  const idea = await Idea.findById(contribution.idea);
  if (!idea || idea.creator.toString() !== user._id.toString()) {
    throw new ApiError(403, 'Not authorized to update this contribution');
  }

  contribution.status = status;
  if (responseMessage) {
    contribution.responseMessage = responseMessage;
  }
  await contribution.save();

  // Update contributor's count if accepted
  if (status === 'accepted') {
    await User.findByIdAndUpdate(contribution.contributor, { 
      $inc: { contributionsCount: 1 } 
    });
  }

  res.json({
    success: true,
    data: contribution,
  });
}));

// Cancel contribution (by contributor)
router.put('/:id/cancel', checkJwt, asyncHandler(async (req: Request, res: Response) => {
  const auth0Id = getUserId(req);
  const user = await User.findOne({ auth0Id });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const contribution = await Contribution.findById(req.params.id);

  if (!contribution) {
    throw new ApiError(404, 'Contribution not found');
  }

  if (contribution.contributor.toString() !== user._id.toString()) {
    throw new ApiError(403, 'Not authorized to cancel this contribution');
  }

  if (contribution.status !== 'pending') {
    throw new ApiError(400, 'Can only cancel pending contributions');
  }

  contribution.status = 'cancelled';
  await contribution.save();

  // Update idea contribution count
  await Idea.findByIdAndUpdate(contribution.idea, { $inc: { contributionCount: -1 } });

  res.json({
    success: true,
    data: contribution,
  });
}));

export default router;
