
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tasks', taskRoutes);

// simple health
app.get('/', (req,res)=> res.json({ok:true, msg:'API Running'}));

const PORT = process.env.PORT || 4000;
sequelize.sync({ alter: true }).then(()=> {
  app.listen(PORT, ()=> console.log('Server started on', PORT));
}).catch(err=> {
  console.error('DB sync error', err);
});
