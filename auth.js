
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

// register
router.post('/register', async (req,res)=>{
  try{
    const { name, email, password, role } = req.body;
    if(!email || !password || !name) return res.status(400).json({message:'Missing fields'});
    const existing = await User.findOne({ where: { email } });
    if(existing) return res.status(400).json({message:'Email already used'});
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash: hash, role: role || 'user' });
    res.status(201).json({ id: user.id, email: user.email, role: user.role });
  }catch(err){ console.error(err); res.status(500).json({message:'Server error'}); }
});

// login
router.post('/login', async (req,res)=>{
  try{
    const { email, password } = req.body;
    if(!email || !password) return res.status(400).json({message:'Missing'});
    const user = await User.findOne({ where: { email } });
    if(!user) return res.status(401).json({message:'Invalid credentials'});
    const ok = await bcrypt.compare(password, user.passwordHash);
    if(!ok) return res.status(401).json({message:'Invalid credentials'});
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  }catch(err){ console.error(err); res.status(500).json({message:'Server error'}); }
});

module.exports = router;
