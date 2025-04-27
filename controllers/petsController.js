// controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Pet = require('../models/Pet');

exports.getAllPets= async (req, res, next) => {
    try{
        const pets = await Pet.findById();
        res.json(pets);
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
exports.petregister = async (req, res, next)=>{
    try{
      const {petId, Name,OwnerID,Age,color,gender,vaccinationStatus,Photo,personalityStatus,adopted,weight} = await req.body;
      const pet = new Pet({petId, Name,OwnerID,Age,color,gender,vaccinationStatus,Photo,personalityStatus,adopted,weight});
      await pet.save();
      res.status(201).json({ message: 'Pet registered successfully' });
    }catch (err){
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
    }
  };

  exports.deletepet = async (req, res,next) => {
    try{
        const deletedPet = await Pet.findByIdAndDelete(req.params.petId);
        if(!deletedPet) res.status(404).json({message: "Pet Not Found"})
        res.json({message: "Pet Deleted"})
    }catch(err){
        next(err);
    }
  };