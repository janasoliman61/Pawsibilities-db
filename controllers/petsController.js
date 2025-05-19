// controllers/petsController.js
const Pet = require('../models/Pet');

// GET /api/pets
exports.getAllPets = async (req, res, next) => {
  try {
    const pets = await Pet.find();      // ← was findById()
    res.json(pets);
  } catch (err) {
    next(err);
  }
};

// GET /api/pets/:petId
exports.getPet = async (req, res, next) => {
  try {
    const pet = await Pet.findById(req.params.petId);
    if (!pet) return res.status(404).json({ message: 'Pet not found' });
    res.json(pet);
  } catch (err) {
    next(err);
  }
};

// POST /api/pets/petregister
exports.petregister = async (req, res, next) => {
  try {
    const {
      petId, Name, OwnerID, Age, color, gender,
      vaccinationStatus, Photo, personalityStatus,
      adopted, weight,
      // you can also accept initial location & prefs here if you want
    } = req.body;

    const pet = new Pet({
      petId, Name, OwnerID, Age, color, gender,
      vaccinationStatus, Photo, personalityStatus,
      adopted, weight,
      // location & preferences will default or be set in a separate update
    });

    await pet.save();
    res.status(201).json({ message: 'Pet registered successfully', pet });
  } catch (err) {
    next(err);
  }
};

// PUT /api/pets/:petId
exports.petUpdate = async (req, res, next) => {
  try {
    const updatedPet = await Pet.findByIdAndUpdate(
      req.params.petId,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedPet) return res.status(404).json({ message: 'Pet not found' });
    res.json({ message: 'Pet updated', pet: updatedPet });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/pets/:petId
exports.deletepet = async (req, res, next) => {
  try {
    const deletedPet = await Pet.findByIdAndDelete(req.params.petId);
    if (!deletedPet) return res.status(404).json({ message: 'Pet not found' });
    res.json({ message: 'Pet deleted' });
  } catch (err) {
    next(err);
  }
};

// ── NEW: GET /api/pets/:petId/matches ───────────────────────────────────
exports.getMatches = async (req, res, next) => {
  try {
    const pet = await Pet.findById(req.params.petId);
    if (!pet) return res.status(404).json({ message: 'Pet not found' });

    const { coordinates } = pet.location;
    const {
      maxDistanceKm,
      preferredBreeds,
      preferredAgeRange,
      preferredSize,
      preferredGender
    } = pet.preferences;

    // build our query
    const query = {
      _id: { $ne: pet._id },
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates },
          $maxDistance: (maxDistanceKm || 50) * 1000
        }
      },
      Age: {
        $gte: preferredAgeRange.min,
        $lte: preferredAgeRange.max
      }
    };

    if (preferredBreeds.length) query.breed = { $in: preferredBreeds };
    if (preferredSize)    query.size   = preferredSize;
    if (preferredGender)  query.gender = preferredGender;

    const matches = await Pet.find(query).limit(20);
    res.json({ matches });
  } catch (err) {
    next(err);
  }
};
