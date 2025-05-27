// controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Pet = require('../models/Pet');

exports.getAllPets= async (req, res, next) => {
    try{
      const {
        owner
        // you can also accept initial location & prefs here if you want
      } = req.body;

      const userName = owner;
      const user = await User.findOne({ userName });

        // const pets = await user.pets;
        const petDocs = await Pet.find({ _id: { $in: user.pets } });

        res.json(petDocs);
    }catch(err){
        next(err);
    }
};

exports.getPet = async (req, res, next) =>{
    try{
        const pet = await Pet.findById(req.params.petId)
        if(!pet) res.status(404).json({message: "pet not found"});
        res.json(pet);
    }catch(err){
        next(err);
    }
};

// POST /api/pets/petregister
exports.petregister = async (req, res, next) => {
    try {
      const {
        Name, owner, Age, color, gender,
        vaccinationStatus, Photo, personalityStatus, weight, breed
        // you can also accept initial location & prefs here if you want
      } = req.body;
  
      const pet = new Pet({
        Name, owner, Age, color, gender,
        vaccinationStatus, Photo, personalityStatus, weight, breed
        // location & preferences will default or be set in a separate update
      });
      
      const userName = owner;
      const user = await User.findOne({ userName });

      await user.pets.push(pet._id);
      await user.save();
      await pet.save();
      res.status(201).json({ message: 'Pet registered successfully', pet });
    } catch (err) {
      next(err);
    }
  };



exports.petUpdate = async (req, res,next) => {
    try{
        const updatedpet = await Pet.findByIdAndUpdate(req.params.petId);
        if(!updatedpet) res.status(404).json({message: "Pet Not Found"});
        res.json({message: "Pet Updated"});
    }catch(err){
        next(err);
    }};

exports.deletepet = async (req, res,next) => {
    try{
        const {owner, petID} = req.body;

        await Pet.findByIdAndDelete(petID);

        const userName = owner;
        const user = await User.findOne({ userName });

        user.pets = user.pets.filter(pet => pet !== petID);
        user.save();


        // const deletedPet = await Pet.findByIdAndDelete(req.params.petId);
        // if(!deletedPet) res.status(404).json({message: "Pet Not Found"})
        res.json({message: "Pet Deleted"})
    }catch(err){
        next(err);
    }};


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
  