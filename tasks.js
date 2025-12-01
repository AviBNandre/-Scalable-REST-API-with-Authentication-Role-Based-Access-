
const express = require('express');
const router = express.Router();
const { Task } = require('../models');
const { auth } = require('../middleware/auth');

// list tasks for user (admin can see all)
router.get('/', auth(), async (req,res)=>{
  const where = req.user.role === 'admin' ? {} : { userId: req.user.id };
  const tasks = await Task.findAll({ where });
  res.json(tasks);
});

// create
router.post('/', auth(), async (req,res)=>{
  const { title, description } = req.body;
  if(!title) return res.status(400).json({message:'Title required'});
  const task = await Task.create({ title, description, userId: req.user.id });
  res.status(201).json(task);
});

// update
router.put('/:id', auth(), async (req,res)=>{
  const t = await Task.findByPk(req.params.id);
  if(!t) return res.status(404).json({message:'Not found'});
  if(req.user.role !== 'admin' && t.userId !== req.user.id) return res.status(403).json({message:'Forbidden'});
  t.title = req.body.title || t.title;
  t.description = req.body.description || t.description;
  t.completed = req.body.completed === undefined ? t.completed : !!req.body.completed;
  await t.save();
  res.json(t);
});

// delete
router.delete('/:id', auth(), async (req,res)=>{
  const t = await Task.findByPk(req.params.id);
  if(!t) return res.status(404).json({message:'Not found'});
  if(req.user.role !== 'admin' && t.userId !== req.user.id) return res.status(403).json({message:'Forbidden'});
  await t.destroy();
  res.json({message:'Deleted'});
});

module.exports = router;
