const LostPet = require('../models/LostPet');

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

    // Note: Automatic breed detection has been removed
    // Users must provide breed manually

    // Save to DB
    const newReport = new LostPet({
      userId,
      type,
      photoUrl,
      description,
      location,
      breed
    });

    await newReport.save();

    // Match against opposite type
    const oppositeType = type === 'lost' ? 'found' : 'lost';

    const candidates = await LostPet.find({
      type: oppositeType,
      breed,
      location: { $exists: true }
    });

    const matches = candidates.filter(entry => {
      if (!entry.location || !location) return false;
      const dist = getDistanceKm(
        location.lat, location.lng,
        entry.location.lat, entry.location.lng
      );
      return dist <= 15; // match within 15 km
    });

    // Send alerts (mock)     tzbetet el notification
    matches.forEach(match => {
      console.log(`🔔 MATCH FOUND: Notify user ${newReport.userId} about ${match.type} pet`);
      // Here: email or push notification logic
    });

    res.status(201).json({ message: 'Report submitted', matches, data: newReport });

  } catch (err) {
    console.error("❌ Error in reportLostPet:", err);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET all lost
exports.getLostReports = async (req, res) => {
  const lost = await LostPet.find({ type: 'lost' }).sort({ timeReported: -1 });
  res.json({ lost });
};

// GET all found
exports.getFoundReports = async (req, res) => {
  const found = await LostPet.find({ type: 'found' }).sort({ timeReported: -1 });
  res.json({ found });
};