import { Router } from 'express';
import { memoryService } from '../../services/memoryService.js';
import { authenticate } from '../../middleware/authMiddleware.js';
import { requireCouple } from '../../middleware/coupleMiddleware.js';
import { uploadMemoryImage } from '../../utils/fileUpload.js';

export const memoryRouter = Router();

memoryRouter.use(authenticate, requireCouple);

// Get memories list
memoryRouter.get('/', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit || '50', 10);
    const offset = parseInt(req.query.offset || '0', 10);
    const memories = await memoryService.getMemories(req.coupleId, { limit, offset });
    res.json({
      success: true,
      data: memories
    });
  } catch (err) {
    next(err);
  }
});

// Create memory (handles both multipart form data with image and JSON)
memoryRouter.post('/', uploadMemoryImage.single('image'), async (req, res, next) => {
  try {
    const { title, description, memoryDate, location } = req.body;
    let imageUrl = req.body.imageUrl || null;

    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const memory = await memoryService.createMemory(req.coupleId, req.user.id, {
      title,
      description,
      memoryDate,
      location,
      imageUrl
    });

    res.status(201).json({
      success: true,
      message: 'Memory saved',
      data: memory
    });
  } catch (err) {
    next(err);
  }
});

// Get single memory by ID
memoryRouter.get('/:id', async (req, res, next) => {
  try {
    const memory = await memoryService.getMemoryById(req.coupleId, req.params.id);
    res.json({
      success: true,
      data: memory
    });
  } catch (err) {
    next(err);
  }
});

// Update memory
memoryRouter.patch('/:id', uploadMemoryImage.single('image'), async (req, res, next) => {
  try {
    const { title, description, memoryDate, location } = req.body;
    let imageUrl = req.body.imageUrl;

    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const updated = await memoryService.updateMemory(req.coupleId, req.params.id, req.user.id, {
      title,
      description,
      memoryDate,
      location,
      imageUrl
    });

    res.json({
      success: true,
      message: 'Memory updated',
      data: updated
    });
  } catch (err) {
    next(err);
  }
});

// Delete memory
memoryRouter.delete('/:id', async (req, res, next) => {
  try {
    await memoryService.deleteMemory(req.coupleId, req.params.id, req.user.id);
    res.json({
      success: true,
      message: 'Memory removed'
    });
  } catch (err) {
    next(err);
  }
});
