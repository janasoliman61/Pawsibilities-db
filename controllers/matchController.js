// controllers/matchController.js
const Match = require('../models/match');

exports.likePet = async (req, res, next) => {
  try {
    const { petId, targetId } = req.params;
    // check if they already liked each other
    const existing = await Match.findOne({
      $or: [
        { petA: petId, petB: targetId },
        { petA: targetId, petB: petId }
      ]
    });
    if (existing) {
      return res.status(400).json({ message: 'Already matched!' });
    }
    // if target had liked you first, create match
    // (you’d need to track likes in Pet or User model for this)
    // otherwise, record your like somewhere (e.g. in Pet.liked[])

    // For brevity: let’s assume both sides call this endpoint on mutual like:
    const match = await Match.create({ petA: petId, petB: targetId });
    res.json({ message: 'Matched!', match });
  } catch (err) {
    next(err);
  }
};
