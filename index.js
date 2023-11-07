const express = require('express');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');

const app = express()
const port = process.env.PORT || 8070;

// middlewares
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:8050", "https://reservia-server-pvafwbgug-rhmunna143.vercel.app", "reservia-server.vercel.app"],
    credentials: true
}))
app.use(express.json())


// MongoDB driver

// uri
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.52hv04l.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// DB Functions

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");

        // CRUD HERE
        const database = client.db("ReserviaDB")
        const foodsCollection = database.collection("foods")
        const usersCollection = database.collection("users")
        const orderedCollection = database.collection("ordered")


        // default route
        app.get("/", (req, res) => {
            res.send("reservia server is running...")
        })

        // post a food item

        app.post("/add", async (req, res) => {
            const uid = req.query.uid;
            const data = req.body;

            const result = await foodsCollection.insertOne(data)

            res.status(200).send(result)
        })

        // post order

        app.post("/order", async (req, res) => {
            const uid = req?.query?.uid;
            const data = req?.body;

            const result = await orderedCollection.insertOne(data)

            res.send(result)
        })

        // delete an order

        app.delete("/api/ordered/delete", async (req, res) => {
            const id = req?.query?.id;

            const query = { _id: new ObjectId(id) };

            const result = await orderedCollection.deleteOne(query)

            res.status(200).send(result)
        })

        // get all orders

        app.get("/api/my-ordered/foods", async (req, res) => {
            const uid = req?.query?.uid;

            const query = { buyerId: uid };

            const result = await orderedCollection.find(query).toArray()

            res.status(200).send(result)
        })

        // get foods

        app.get("/foods", async (req, res) => {

            const result = await foodsCollection.find().toArray()

            res.status(200).send(result)
        })

        // update count and quantity of a food

        app.patch("/food", async (req, res) => {
            const id = req?.query?.id;
            const data = req?.body;

            const query = { _id: new ObjectId(id) };

            const updateData = {
                $set: {
                    count: data?.count,
                    quantity: data?.quantity
                }
            }

            const result = await foodsCollection.updateOne(query, updateData)

            res.status(200).send(result)
        })

        // update food

        app.patch("/api/food/update", async (req, res) => {
            try {
                const id = req?.query?.id;
                const data = req?.body;

                const query = { _id: new ObjectId(id) }

                const updateData = {
                    $set: {
                        name: data.name,
                        image: data.image,
                        category: data.category,
                        quantity: data.quantity,
                        price: data.price,
                        description: data.description,
                        origin: data.origin
                    }
                }

                const result = await foodsCollection.updateOne(query, updateData)

                res.status(200).send(result)
            } catch (err) {
                res.status(403).send({ message: "forbidden", err })
            }
        })

        // get food

        app.get("/foods/:id", async (req, res) => {
            const id = req?.params?.id;

            // Check if the id is a valid ObjectId
            if (!ObjectId.isValid(id)) {
                return res.status(400).send("Invalid id format");
            }

            const query = { _id: new ObjectId(id) };
            const result = await foodsCollection.findOne(query);

            res.status(200).send(result);
        });

        // get my added foods

        app.get("/api/my-added/foods", async (req, res) => {
            const uid = req?.query?.uid;
            const query = { uid: uid };

            const result = await foodsCollection.find(query).toArray()

            res.status(200).send(result)
        })

        // get top foods

        app.get("/top-foods", async (req, res) => {

            const result = await foodsCollection
                .find({ count: { $gte: 0 } })
                .sort({ count: -1 })
                .limit(6)
                .toArray();

            res.status(200).send(result)
        })

        // post user

        app.post("/user", async (req, res) => {
            try {
                const user = req.body;
                const result = await usersCollection.insertOne(user);
                res.status(200).send(result);
            } catch (error) {

                res.status(500).send("Internal Server Error");
            }
        });

        // update user when login here


    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
})