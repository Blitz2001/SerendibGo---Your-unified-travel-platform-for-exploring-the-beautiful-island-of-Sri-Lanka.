const express = require('express');
const router = express.Router();
const vehicleRentalController = require('../controllers/vehicleRentalController');
const { authMiddleware } = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// Vehicle rental routes
router.post('/', vehicleRentalController.createRental);
router.get('/my', vehicleRentalController.getMyRentals);
router.get('/:id', vehicleRentalController.getRental);
router.patch('/:id/status', vehicleRentalController.updateRentalStatus);
router.patch('/:id/cancel', vehicleRentalController.cancelRental);

// Utility routes
router.post('/check-availability', vehicleRentalController.checkAvailability);
router.post('/calculate-cost', vehicleRentalController.calculateCost);

module.exports = router;
