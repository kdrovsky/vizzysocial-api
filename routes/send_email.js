import express from 'express';
import dotenv from 'dotenv';
import NodeMailer from 'nodemailer'

dotenv.config({ path: '.env' });
const router = express.Router();

const transporter = NodeMailer.createTransport({
    host: process.env.SMPT_HOST,
    port: process.env.SMPT_PORT,
    debug: true,
    auth: {
        user: process.env.SMPT_LOGIN,
        pass: process.env.SMPT_KEY,
    },
});

const send_email = (to, subject, content) => {
    transporter.sendMail(
        { from: "SproutySocial Support support@sproutysocial.com", to, subject, html: content, sender: { name: "SproutySocial", email: "support@sproutysocial.com" }, },
        (error, info) => {
            if (error) {
                console.log(error);
                return { success: false, message: error }
            } else {
                console.log("email sent to: " + info.accepted[0]);
                return { success: true, message: info.response }
            }
        }
    )
}

router.post('/', async (req, res) => {
    send_email(req.body.email, req.body.subject, req.body.htmlContent)
    res.send({ success: true, message: 'Email sent successfully' })
})

export default router