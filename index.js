const express  = require('express');

const bodyParser = require('body-parser');

const path = require('path');

const PUBLISHABLE_KEY = "pk_test_51MKQNPJOzVX3Pu1h7TA3MHnHrS2g4jAn4mokjctjKtGQDg1FxLc8ThHfuFK1RNZP0Ok2gPyaSCHTWxwqVegjgm0D005oWMb8LK"

const SECRET_KEY ="sk_test_51MKQNPJOzVX3Pu1h93Wq51OWQgDp93GE8CilUOlHoZFh8WwfQNQH2WbWt3L9FPxfqU6nQwzNTKDC5NvO5dGlmUDY00WN1n62j9"

const stripe  = require('stripe')(SECRET_KEY)

const app = express();

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.set("view engine", "ejs")

const PORT = process.env.PORT || 8080

app.get('/', (req, res) =>{
    res.render('Home',{
        key: PUBLISHABLE_KEY
    })
})

app.get('/usage', (req, res) =>{
    res.render('Usage',{
        key: PUBLISHABLE_KEY
    })
})

app.get('/card', (req, res) =>{
    res.render('Card',{
        key: PUBLISHABLE_KEY
    })
})

app.get('/invoice', async (req, res) => {
    const invoices = await stripe.invoices.list({limit: 20});
    res.json(invoices);
  });

app.post('/payment', (req,res)=>{
    stripe.customers.create({
        email: req.body.stripeEmail,
        source: req.body.stripeToken,
        name: 'Gautam Sharma',
        address: {
            line1: '23 blah blah',
            postal_code: '1121',
            city: 'New delhi',
            state: 'Delhi',
            country: 'India'
        }

    })
    .then((customer) =>{
        return stripe.charges.create({
            amount: 7000,
            description: 'Web development',
            currency: 'USD',
            customer: customer.id
        })
    })
    .then((charge) =>{
        console.log(charge)
        res.send("Success")
    })
    .catch((err)=>{
        res.send(err)
    })
})


app.post('/create-usage-record', async (req, res) => {
    const subscriptionItemId = req.body.subscriptionItemId;
    const quantity = req.body.quantity;
    const timestamp = req.body.timestamp;
  
    try {
      const usageRecord = await stripe.subscriptionItems.createUsageRecord(
        subscriptionItemId,
        {quantity: quantity, timestamp: timestamp}
      );
      res.status(200).json({message: 'Usage record created successfully', usageRecord: usageRecord});
    } catch (err) {
      console.log(err);
      res.status(500).json({message: 'Failed to create usage record', error: err.message});
    }
});

app.post('/update-card-details', async (req, res) => {
    const expiryMonth = req.body.expiryMonth;
    const expiryYear = req.body.expiryYear;
    const cardName = req.body.cardName;
    const street = req.body.street;
    const streetLine2 = req.body.streetLine2;
    const city = req.body.city;
    const zipcode = req.body.zipcode;
    const state = req.body.state;
    const country = req.body.country;

    try {
        const card = await stripe.customers.updateSource(
            'cus_NPuxHx4Bf3vpYZ',
            'card_1Mf5AZJOzVX3Pu1hgPeAHIPl',
            {exp_month: expiryMonth, exp_year: expiryYear, name: cardName, address_line1: street, address_line2: streetLine2, address_city: city, address_zip: zipcode, address_state: state, address_country: country }
          );
      res.status(200).json({message: 'Card Updated', card: card});
    } catch (err) {
      console.log(err);
      res.status(500).json({message: 'Failed to create usage record', error: err.message});
    }
});


app.get('/usageRecordSummaries', async (req, res) => {
    const usageRecordSummaries = await stripe.subscriptionItems.listUsageRecordSummaries(
        'si_NPv0x0aCD54JVo',
        {limit: 10}
      );
      res.json(usageRecordSummaries);
});



app.listen(PORT,  () =>{
    console.log(`listening on ${PORT}`);
})