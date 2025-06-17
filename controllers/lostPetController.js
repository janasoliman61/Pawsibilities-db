// controllers/lostPetController.js
const LostPet = require('../models/LostPet');
const Notification = require('../models/Notification');
const detectBreed = require('../utils/breedDetector');

// Haversine formula to calculate distance in km
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

exports.reportLostPet = async (req, res) => {
  try {
    const {
      type,            // 'lost' or 'found'
      photoUrl,        // image URL from Firebase
      description,
      location,
      breed: manualBreed
    } = req.body;

    const userId = req.user._id; // from auth middleware
    let breed = manualBreed || '';

    // Try auto-detecting the breed if not entered
    if (!manualBreed && photoUrl) {
      try {
        const result = await detectBreed(photoUrl);
        if (result && result.confidence >= 0.5) {
          breed = result.breed;
        }
      } catch (err) {
        console.warn("🐾 Breed detection failed:", err.message);
      }
    }

    // Save the new lost/found report
    const newReport = new LostPet({
      userId,
      type,
      photoUrl,
      description,
      location,
      breed
    });
    await newReport.save();

    // Find opposite-type candidates
    const oppositeType = type === 'lost' ? 'found' : 'lost';
    const candidates = await LostPet.find({
      type: oppositeType,
      breed,
      location: { $exists: true }
    });

    // Filter by distance (≤ 15 km)
    const matches = candidates.filter(entry => {
      if (!entry.location || !location) return false;
      const dist = getDistanceKm(
        location.lat, location.lng,
        entry.location.lat, entry.location.lng
      );
      return dist <= 15;
    });

    // Create notifications for each match
    for (const match of matches) {
      const isLostReport = type === 'lost';

      // Notify the reporting user
      await Notification.create({
        to: newReport.userId,
        from: match.userId,
        type: 'lost_found_match',
        title: isLostReport
          ? 'Your lost pet may have been found'
          : 'You found a matching lost pet!',
        body: isLostReport
          ? `A pet matching your lost report (“${newReport.description}”) was found by user ${match.userId}.`
          : `Your found pet (“${newReport.description}”) matches a lost report by user ${match.userId}.`,
        petLost: isLostReport ? newReport._id : match._id,
        petFound: isLostReport ? match._id : newReport._id
      });

      // Notify the other user
      await Notification.create({
        to: match.userId,
        from: newReport.userId,
        type: 'lost_found_match',
        title: isLostReport
          ? 'You found a matching lost pet!'
          : 'Your lost pet may have been found',
        body: isLostReport
          ? `You reported finding a pet (“${match.description}”) matching a lost report.`
          : `User ${newReport.userId} reported their pet lost (“${newReport.description}”), which matches your found report.`,
        petLost: isLostReport ? newReport._id : match._id,
        petFound: isLostReport ? match._id : newReport._id
      });
    }

    res.status(201).json({ message: 'Report submitted', matches, data: newReport });
  } catch (err) {
    console.error("❌ Error in reportLostPet:", err);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET all lost reports
exports.getLostReports = async (req, res) => {
  try {
    const lost = await LostPet.find({ type: 'lost' }).sort({ timeReported: -1 });
    res.json({ lost });
  } catch (err) {
    console.error("❌ Error in getLostReports:", err);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET all found reports
exports.getFoundReports = async (req, res) => {
  try {
    const found = await LostPet.find({ type: 'found' }).sort({ timeReported: -1 });
    res.json({ found });
  } catch (err) {
    console.error("❌ Error in getFoundReports:", err);
    res.status(500).json({ error: 'Server error' });
  }
};
