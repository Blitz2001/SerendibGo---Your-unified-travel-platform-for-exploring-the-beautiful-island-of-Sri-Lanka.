const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const { authMiddleware } = require('../middleware/auth');

// Public routes
router.get('/', vehicleController.getVehicles);
router.get('/stats', vehicleController.getVehicleStats);
router.get('/:id', vehicleController.getVehicle);

// Protected routes (require authentication)
router.use(authMiddleware);

// Owner-specific routes (require authentication)
router.get('/owner/:ownerId', vehicleController.getVehiclesByOwner);

router.post('/', vehicleController.createVehicle);
router.put('/:id', vehicleController.updateVehicle);
router.delete('/:id', vehicleController.deleteVehicle);
router.patch('/:id/availability', vehicleController.updateAvailability);

module.exports = router;
