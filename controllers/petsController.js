// controllers/petsController.js
const Pet = require('../models/Pet');
const detectBreed = require('../utils/breedDetector'); // import your module


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
      petId,
      Name,
      OwnerID,
      Age,
      gender,
      vaccinationStatus,
      Photo,
      personalityStatus,
      weight,
      breed: manualBreed, // manually provided breed (optional)
    } = req.body;

    let breed = manualBreed || '';

    // Auto-detect breed if not manually provided and photo exists
    if (!manualBreed && Photo) {
      try {
        const result = await detectBreed(Photo);
        if (result && result.confidence >= 0.5) {
          breed = result.breed;
        }
      } catch (error) {
        console.warn('🐾 Breed detection failed, manual input allowed.');
      }
    }

    const pet = new Pet({
      petId,
      Name,
      OwnerID,
      Age,
      gender,
      vaccinationStatus,
      Photo,
      personalityStatus,
      weight,
      breed,
      location: req.body.location  // store either detected or manually provided
    });

    await pet.save();
    res.status(201).json({ message: 'Pet registered successfully', pet });
  } catch (err) {
    console.error('❌ Error registering pet:', err);
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

// PUT /api/pets/:petId/status – only pet owner can update status
exports.updatePetStatus = async (req, res) => {
  try {
    const { petId } = req.params;
    const { status } = req.body;

    if (!['adoption', 'mating', 'none'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const pet = await Pet.findById(petId);
    if (!pet) return res.status(404).json({ message: 'Pet not found' });

    // 🔐 Require ownership check (req.user._id is from auth middleware)
    if (pet.OwnerID.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You are not the owner of this pet' });
    }

    pet.status = status;
    await pet.save();

    res.json({ message: 'Pet status updated', pet });

  } catch (err) {
    console.error("❌ Error updating status:", err);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/pets/status/:status – public route to list pets for adoption/mating
exports.getPetsByStatus = async (req, res) => {
  const { status } = req.params;

  if (!['adoption', 'mating'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status filter' });
  }

  try {
    const pets = await Pet.find({ status });
    res.json({ pets });
  } catch (err) {
    console.error("❌ Failed to get pets by status:", err);
    res.status(500).json({ error: 'Server error' });
  }
};