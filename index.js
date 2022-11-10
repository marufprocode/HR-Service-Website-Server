const express = require("express");
const cors = require("cors");
const jwt = require('jsonwebtoken');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

//MiddleWare
app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@clusterforassignment.st86zeo.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// connect mongoDataBase 
async function run() {
    try {
      await client.connect();
      console.log("Database connected");
    } catch (error) {
      console.log(error.name, error.message);
    }
  }
  
run();

// create list of collection 
const serviceCollection = client.db("hr-service").collection("services"); 
const reviewCollection = client.db("hr-service").collection("reviews"); 

// verify JWT middleware 
function verifyJwt (req, res, next) {
  const userJwtToken = req.headers.authorization;

// if the user do not have any token simply return the users with a error status.
  if (!userJwtToken){
    return res.status(401).send({
      success: false,
      message: 'Unauthorized access' 
    })
  }
// users token, let's verify
  const token = userJwtToken.split(' ')[1];  // we received token with Bearer, so split and get only token
// for varification JWT gives us a built in function like-
	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded){
    if(err) {
      return res.status(401).send({
        success: false,
        message: 'Forbidden access' 
      })
    }
    req.decoded = decoded;
    next();
  })
}

// Get Services For Home Page 
app.get('/services', async (req, res) => {
  try{
    const limit = parseInt(req.query.limit);
    const cursor = serviceCollection.find({});
    if(limit){
      const services = await cursor.limit(limit).toArray();
      res.send(services);
    }
    else{
      const services = await cursor.toArray();
      res.send(services);
    }
  }
  catch (error){
    console.log(error.name, error.message);
    res.send({
      success: false,
      error: error.message,
    });
  }
})

app.get('/services/:id', async (req, res) => {
  try{
    const id = req.params.id;
    const service = await serviceCollection.findOne({_id: ObjectId(id)});
    res.send(service);
  }
  catch (error){
    console.log(error.name, error.message);
    res.send({
      success: false,
      error: error.message,
    });
  }
})

app.post('/user-review', async (req, res) => {
  try{
    const userReview = req.body;
    const result = await reviewCollection.insertOne(userReview);
    if (result.insertedId){
      res.send({
        success: true,
        message: 'Successfully addeded User Review'
      })
    }
  }
  catch (error){
    console.log(error.name, error.message);
    res.send({
      success: false,
      error: error.message,
    });
  }
})
app.post('/add-service', async (req, res) => {
  try{
    const service = req.body;
    const result = await serviceCollection.insertOne(service);
    if (result.insertedId){
      res.send({
        success: true,
        message: 'Successfully addeded User Review'
      })
    }
  }
  catch (error){
    console.log(error.name, error.message);
    res.send({
      success: false,
      error: error.message,
    });
  }
})

app.get('/reviewsByTitle/:id', async (req, res)=> {
  try{
      const title = req.params.id;
      const cursor = reviewCollection.find({reviewItem:title});
      const result = await cursor.toArray();
      res.send(result);
  }
  catch (error){
    console.log(error.name, error.message);
    res.send({
      success: false,
      error: error.message,
    });
  }

})

app.get('/user-review/:id', verifyJwt, async (req, res)=> {
  try{
      const decoded = req.decoded;
      if(decoded.id !== req.params.id){
        res.status(403).send({
          success: false,
          message: 'Unauthorized access'
        })
      }
      const id = req.params.id;
      const cursor = reviewCollection.find({userId:id});
      const result = await cursor.toArray();
      if(result.length){
        res.send(result);
      }
  }
  catch (error){
    console.log(error.name, error.message);
    res.send({
      success: false,
      error: error.message,
    });
  }

})
app.delete('/user-review/:id', verifyJwt, async (req, res)=> {
  try{
      const id = req.params.id;
      const decoded = req.decoded;
      if(decoded.email !== req.query.email){
        res.status(403).send({
          success: false,
          message: 'Unauthorized access'
        })
      }
      const result = await reviewCollection.deleteOne({_id:ObjectId(id)});
      if(result.deletedCount){
        res.send({
          success: true,
          message: `Successfully Deleted the review with id ${id}`
        });
      }
  }
  catch (error){
    console.log(error.name, error.message);
    res.send({
      success: false,
      error: error.message,
    });
  }

})

app.patch('/update-review/:id', verifyJwt, async (req, res) => {
  const id = req.params.id;
  try{
    const decoded = req.decoded;
    console.log(req.body.email, decoded.email);
    if(decoded.email !== req.body.email){
      res.status(403).send({
        success: false,
        message: 'Unauthorized access'
      })
    }
    const result = await reviewCollection.updateOne({_id: ObjectId(id)}, {$set: req.body});
    if(result.matchedCount){
      res.send({
        success: true,
        message: "successfully Updated review"
      })
    }
  }
  catch (error){
    console.log(error.name, error.message);
    res.send({
      success: false,
      error: error.message,
    });
  }
})

app.post('/jwt', async (req, res) => {
  try{
    const user = req.body; 
    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '15d'})
    res.send({token});
  }
  catch (error) {
    console.log(error.message);
    res.send({
      success: false,
      error: error.message,
      })
  }
})

app.get('/', (req, res) => {
    res.send('Hello From MongoDB')
});

app.listen(port, ()=>{
    console.log(`Listening to port ${port}`);
})
