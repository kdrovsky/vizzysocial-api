import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config({ path: '.env' });
const router = express.Router();

router.post('/', async (req, res) => {
    const webhookUrl = req.body.webhookUrl
    const text = req.body.message
    axios.post(webhookUrl, { text }).then((slackResponse) => {
        console.log({ status: slackResponse.status, statusText: slackResponse.status, data: slackResponse.data });
        res.send({ msg: 'sent!' })
    }).catch((e) => {
        console.log('slack notification error');
        res.send({ msg: 'error', e })
    })
})

export default router