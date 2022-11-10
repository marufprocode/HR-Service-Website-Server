const express = require("express");
const cors = require("cors");
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

//MiddleWare
app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@clusterforassignment.st86zeo.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
      await client.connect();
      console.log("Database connected");
    } catch (error) {
      console.log(error.name, error.message);
    }
  }
  
run();

const serviceCollection = client.db("hr-service").collection("services"); 
const reviewCollection = client.db("hr-service").collection("reviews"); 

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
      console.log(title);
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

app.get('/user-review/:id', async (req, res)=> {
  try{
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
app.delete('/user-review/:id', async (req, res)=> {
  try{
      const id = req.params.id;
      const result = await reviewCollection.deleteOne({_id:ObjectId(id)});
      console.log(result);
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



app.get('/', (req, res) => {
    res.send('Hello From MongoDB')
});

app.listen(port, ()=>{
    console.log(`Listening to port ${port}`);
})
