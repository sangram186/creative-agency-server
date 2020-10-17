const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const fs = require('fs-extra');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();

const uri = `mongodb+srv://${process.env.DB_Name}:${process.env.DB_PASS}@cluster0.4dwcy.mongodb.net/${process.env.DB_Name}?retryWrites=true&w=majority`;

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('orders'));
app.use(fileUpload())


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const ordersCollection = client.db("creative-agency").collection("orders");

  app.post('/customerOrder', (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const order = req.body.order;
    const details = req.body.details;
    const price = req.body.price;
    const file = req.files.file;
    const role = req.body.role;
    const filePath = `${__dirname}/orders/${file.name}`;
    file.mv(filePath, err => {
      if (err) {
        console.log(err);
        res.status(500).send({ msg: 'Failed to upload' });
      }
      const newImg = fs.readFileSync(filePath);
      const encImg = newImg.toString('base64');

      const image = {
        contentType: req.files.file.mimeType,
        size: req.files.file.size,
        img: Buffer(encImg, 'base64')
      };

      ordersCollection.insertOne({ name, email, order, details, price, image, role })
        .then(result => {
          fs.remove(filePath, error => {
            if (error) {
              console.log(error);
              res.status(500).send({ msg: 'Failed to upload' });
            }
            res.send(result.insertedCount > 0);
          })
        })
    })
  });

  app.post('/orderData', (req, res) => {
    const userData = req.body;
    ordersCollection.find({ email: userData.email })
      .toArray((err, documents) => {
        res.send(documents);
      })
  })

  app.get('/allOrders', (req, res) => {
    ordersCollection.find({})
      .toArray((error, orders) => {
        console.log(orders, error);
        res.send(orders);
      })
  })

});

client.connect(err => {
  const services = client.db("creative-agency").collection("services");
  app.post('/services', (req, res) => {
    const file = req.files.file;
    const title = req.body.title;
    const description = req.body.description;
    const filePath = `${__dirname}/orders/${file.name}`;
    file.mv(filePath, err => {
      if (err) {
        console.log(err);
        res.status(500).send({ msg: 'Failed to upload' });
      }
      const newImg = fs.readFileSync(filePath);
      const encImg = newImg.toString('base64');

      const serviceImg = {
        contentType: req.files.file.mimeType,
        size: req.files.file.size,
        img: Buffer(encImg, 'base64')
      };

      // return res.send({name: file.name, path: `/${file.name}`});
      services.insertOne({ title, description, serviceImg })
        .then(result => {
          fs.remove(filePath, error => {
            if (error) {
              console.log(error);
              res.status(500).send({ msg: 'Failed to upload' });
            }
            res.send(result.insertedCount > 0);
          })
        })
    })
  })

  app.get('/allServices', (req, res) => {
    services.find({})
      .toArray((error, orders) => {
        res.send(orders);
      })
  })
});

client.connect(err => {
  const allAdmins = client.db("creative-agency").collection("admins");
  app.post('/admins', (req, res) => {
    const adminEmail = req.body;

    allAdmins.insertOne(adminEmail)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })

  
  app.get('/allAdmins', (req, res) => {
    allAdmins.find({})
      .toArray((error, admins) => {
        res.send(admins);
      })
  })
})

client.connect(err => {
  const allReviews = client.db("creative-agency").collection("reviews");
  app.post('/reviews', (req, res) => {
    const review = req.body;

    allReviews.insertOne(review)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })


  app.get('/allReviews', (req, res) => {
    allReviews.find({})
      .toArray((error, getReview) => {
        res.send(getReview);
      })
  })
})




app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(process.env.PORT || 5000)