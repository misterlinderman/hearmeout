import { Router, Request, Response } from 'express';
import { checkJwt, optionalAuth, getUserId } from '../middleware/auth';
import { asyncHandler, ApiError } from '../middleware/errorHandler';
import { Idea, User } from '../models';

const router = Router();

// Get all ideas (public, with filtering)
router.get('/', optionalAuth, asyncHandler(async (req: Request, res: Response) => {
  const {
    category,
    stage,
    status = 'active',
    resourceType,
    search,
    sortBy = 'newest',
    page = '1',
    limit = '12',
  } = req.query;

  const query: Record<string, any> = { isPublic: true, status };

  if (category) query.category = category;
  if (stage) query.stage = stage;
  if (resourceType) {
    query['resources.type'] = resourceType;
    query['resources.fulfilled'] = false;
  }

  // Text search
  if (search) {
    query.$text = { $search: search as string };
  }

  // Sorting
  let sort: Record<string, 1 | -1> = {};
  switch (sortBy) {
    case 'popular':
      sort = { likeCount: -1 };
      break;
    case 'trending':
      sort = { viewCount: -1, createdAt: -1 };
      break;
    case 'funded':
      sort = { contributionCount: -1 };
      break;
    default:
      sort = { createdAt: -1 };
  }

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const skip = (pageNum - 1) * limitNum;

  const [ideas, total] = await Promise.all([
    Idea.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate('creator', 'name picture expertise reputation'),
    Idea.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: ideas,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  });
}));

// Get user's own ideas
router.get('/my-ideas', checkJwt, asyncHandler(async (req: Request, res: Response) => {
  const auth0Id = getUserId(req);
  const user = await User.findOne({ auth0Id });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const ideas = await Idea.find({ creator: user._id })
    .sort({ createdAt: -1 })
    .populate('creator', 'name picture');

  res.json({
    success: true,
    data: ideas,
  });
}));

// Get trending ideas
router.get('/trending', asyncHandler(async (req: Request, res: Response) => {
  const ideas = await Idea.find({ isPublic: true, status: 'active' })
    .sort({ viewCount: -1, likeCount: -1 })
    .limit(6)
    .populate('creator', 'name picture');

  res.json({
    success: true,
    data: ideas,
  });
}));

// Get featured ideas
router.get('/featured', asyncHandler(async (req: Request, res: Response) => {
  const ideas = await Idea.find({ isPublic: true, status: 'active' })
    .sort({ likeCount: -1 })
    .limit(3)
    .populate('creator', 'name picture');

  res.json({
    success: true,
    data: ideas,
  });
}));

// Get single idea
router.get('/:id', optionalAuth, asyncHandler(async (req: Request, res: Response) => {
  const idea = await Idea.findById(req.params.id)
    .populate('creator', 'name picture bio expertise reputation');

  if (!idea) {
    throw new ApiError(404, 'Idea not found');
  }

  // Check if user can view this idea
  const auth0Id = getUserId(req);
  const user = auth0Id ? await User.findOne({ auth0Id }) : null;
  
  if (!idea.isPublic && (!user || idea.creator.toString() !== user._id.toString())) {
    throw new ApiError(403, 'This idea is private');
  }

  // Increment view count
  await Idea.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });

  res.json({
    success: true,
    data: idea,
  });
}));

// Create new idea
router.post('/', checkJwt, asyncHandler(async (req: Request, res: Response) => {
  const auth0Id = getUserId(req);
  const user = await User.findOne({ auth0Id });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const { title, tagline, description, category, stage, resources, tags, isPublic } = req.body;

  const idea = await Idea.create({
    title,
    tagline,
    description,
    category,
    stage,
    resources: resources?.map((r: any) => ({ ...r, fulfilled: false })) || [],
    tags: tags || [],
    isPublic: isPublic !== false,
    creator: user._id,
    status: 'pending-review',
  });

  // Update user's idea count
  await User.findByIdAndUpdate(user._id, { $inc: { ideasCount: 1 } });

  const populatedIdea = await Idea.findById(idea._id)
    .populate('creator', 'name picture');

  res.status(201).json({
    success: true,
    data: populatedIdea,
  });
}));

// Update idea
router.put('/:id', checkJwt, asyncHandler(async (req: Request, res: Response) => {
  const auth0Id = getUserId(req);
  const user = await User.findOne({ auth0Id });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const idea = await Idea.findById(req.params.id);

  if (!idea) {
    throw new ApiError(404, 'Idea not found');
  }

  if (idea.creator.toString() !== user._id.toString()) {
    throw new ApiError(403, 'Not authorized to update this idea');
  }

  const allowedUpdates = ['title', 'tagline', 'description', 'category', 'stage', 'resources', 'tags', 'isPublic', 'coverImage'];
  const updates: Record<string, any> = {};

  for (const key of allowedUpdates) {
    if (req.body[key] !== undefined) {
      updates[key] = req.body[key];
    }
  }

  const updatedIdea = await Idea.findByIdAndUpdate(
    req.params.id,
    { $set: updates },
    { new: true, runValidators: true }
  ).populate('creator', 'name picture');

  res.json({
    success: true,
    data: updatedIdea,
  });
}));

// Delete idea
router.delete('/:id', checkJwt, asyncHandler(async (req: Request, res: Response) => {
  const auth0Id = getUserId(req);
  const user = await User.findOne({ auth0Id });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const idea = await Idea.findById(req.params.id);

  if (!idea) {
    throw new ApiError(404, 'Idea not found');
  }

  if (idea.creator.toString() !== user._id.toString()) {
    throw new ApiError(403, 'Not authorized to delete this idea');
  }

  await Idea.findByIdAndDelete(req.params.id);

  // Update user's idea count
  await User.findByIdAndUpdate(user._id, { $inc: { ideasCount: -1 } });

  res.json({
    success: true,
    message: 'Idea deleted successfully',
  });
}));

// Like/unlike idea
router.post('/:id/like', checkJwt, asyncHandler(async (req: Request, res: Response) => {
  const auth0Id = getUserId(req);
  
  if (!auth0Id) {
    throw new ApiError(401, 'Unauthorized');
  }

  const idea = await Idea.findById(req.params.id);

  if (!idea) {
    throw new ApiError(404, 'Idea not found');
  }

  const alreadyLiked = idea.likedBy.includes(auth0Id);

  if (alreadyLiked) {
    await Idea.findByIdAndUpdate(req.params.id, {
      $pull: { likedBy: auth0Id },
      $inc: { likeCount: -1 },
    });
  } else {
    await Idea.findByIdAndUpdate(req.params.id, {
      $push: { likedBy: auth0Id },
      $inc: { likeCount: 1 },
    });
  }

  res.json({
    success: true,
    data: { liked: !alreadyLiked },
  });
}));

export default router;
