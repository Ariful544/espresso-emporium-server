const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const port = process.env.PORT || 3000;

// middleware
app.use(express.json());
app.use(cors());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.vedvc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const coffeeCollection = client.db('coffee-emporiumDB').collection('coffees');
    const userCollection = client.db('coffee-emporiumDB').collection('users');

    app.get('/',async(req, res) => {
        const cursor = coffeeCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    });
    app.delete('/coffee/:id', async(req, res) => {
        const id = req.params.id;
        const filter = {_id: new ObjectId(id)};
        const result = await coffeeCollection.deleteOne(filter);
        res.send(result);
    });
    app.get('/update/:id', async(req, res) => {
         const id = req.params.id;
         const filter = {_id: new ObjectId(id)};
         const result = await coffeeCollection.findOne(filter);
         res.send(result);
    });
    app.get('/view-details/:id', async(req, res) => {
        const id = req.params.id;
        const filter = {_id: new ObjectId(id)};
        const result = await coffeeCollection.findOne(filter);
        res.send(result);
   });

    app.put("/update/:id", async(req, res) => {
        const id = req.params.id;
        const updateBody = req.body;
        const filter = {_id: new ObjectId(id)};
        const options = {upsert: true};
        const updateDoc = {
            $set: {
                name:updateBody.name,
                chef:updateBody.chef,
                supplier:updateBody.supplier,
                taste:updateBody.taste,
                category:updateBody.category,
                details:updateBody.details,
                 price:updateBody.price,
                photo:updateBody.photo,
            }
        }
        const result = await coffeeCollection.updateOne(filter, updateDoc, options);
        res.send(result);
    });
    app.post("/add-coffee", async (req, res) => {
        const coffeeAddBody = req.body;
        const result = await coffeeCollection.insertOne(coffeeAddBody); 
        res.send(result);
    });
    // user api 
    app.post('/add-user', async (req, res) => {
        const userBody = req.body;
        const result = await userCollection.insertOne(userBody); 
        res.send(result);
    });
    app.get("/users", async (req, res) => {
        const cursor =  userCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })
    app.delete("/users/:id", async (req, res) => {
        const id = req.params.id;
        const filter = {_id: new ObjectId(id)};
        const result = await userCollection.deleteOne(filter);
        res.send(result);
    });
    app.patch('/users/signin', async (req, res) => {
        const email = req.body.email;
        const filter = {email};
        const updateDoc = {
            $set: {
                lastSignInTime: req.body?.lastSignInTime,
            }
        }
        const result = await userCollection.updateOne(filter,updateDoc);
        res.send(result);

    });
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port,()=>{
    console.log(`listening on ${port}`)
});
