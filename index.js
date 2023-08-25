import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors'
import dotenv from 'dotenv';

import chargebeeRoutes from './routes/chargebee.js';
import slack_notificationRoutes from './routes/slack_notification.js';
import send_emailRoutes from './routes/send_email.js';

dotenv.config({ path: '.env' });

const PORT = process.env.PORT || 8000

const app = express()

app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())
app.use(express.json());


app.use('/api/chargebee', chargebeeRoutes);
app.use('/api/slack_notification', slack_notificationRoutes);
app.use('/api/send_email', send_emailRoutes);

app.get('/', (req, res) => res.send('Hello World!'))

// app.listen(8000, () => console.log('Example app listening on port 8000!'))
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
