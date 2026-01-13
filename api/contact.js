const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

// --- 1. Database Schema & Model ---
const contactSchema = new mongoose.Schema({
    name: String,
    email: String,
    subject: String,
    message: String,
    date: { type: Date, default: Date.now }
});

// Model create karo (Prevent overwrite during hot reload)
const Contact = mongoose.models.Contact || mongoose.model('Contact', contactSchema);

// --- 2. Database Connection Logic (Ye MISSING tha) ---
let isConnected = false;

async function connectToDatabase() {
    if (isConnected) {
        return;
    }

    if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI environment variable is missing');
    }

    try {
        await mongoose.connect('mongodb+srv://darshil:darshil0153@cluster0.0qk1t32.mongodb.net/');
        isConnected = true;
        console.log("🔥 MongoDB Connected");
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error);
        throw new Error('Database connection failed');
    }
}

// --- 3. Main Handler Function ---
module.exports = async (req, res) => {
    // Sirf POST request allow karo
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        // Step A: Database Connect Karo
        await connectToDatabase();
        
        const { name, email, subject, message } = req.body;

        // Validation
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Step B: MongoDB mein Data Save Karo
        const newContact = new Contact({ name, email, subject, message });
        await newContact.save();

        // --- 🎨 BAAP LEVEL EMAIL UI TEMPLATE ---
        const emailTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { margin: 0; padding: 0; background-color: #050505; font-family: 'Arial', sans-serif; }
                .container { width: 100%; max-width: 600px; margin: 0 auto; background-color: #111111; border: 1px solid #333; border-radius: 8px; overflow: hidden; }
                .header { background-color: #9F361F; padding: 20px; text-align: center; }
                .header h1 { color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 2px; text-transform: uppercase; }
                .content { padding: 30px; color: #e0e0e0; }
                .field { margin-bottom: 20px; border-bottom: 1px solid #222; padding-bottom: 10px; }
                .label { color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 5px; }
                .value { color: #fff; font-size: 16px; font-weight: bold; }
                .message-box { background-color: #0a0a0a; border-left: 4px solid #9F361F; padding: 15px; margin-top: 20px; border-radius: 4px; }
                .footer { background-color: #080808; padding: 15px; text-align: center; color: #555; font-size: 12px; border-top: 1px solid #222; }
                .btn { display: inline-block; padding: 12px 24px; background-color: #9F361F; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold; margin-top: 20px; }
                .highlight { color: #9F361F; }
            </style>
        </head>
        <body>
            <div style="background-color: #050505; padding: 40px 0;">
                <div class="container">
                    <div class="header">
                        <h1>🚀 New Signal Received</h1>
                    </div>
                    
                    <div class="content">
                        <p style="font-size: 18px; margin-bottom: 30px;">
                            System Alert: You have received a new inquiry from your <span class="highlight">3D Portfolio</span>.
                        </p>

                        <div class="field">
                            <span class="label">From (Name)</span>
                            <div class="value">${name}</div>
                        </div>

                        <div class="field">
                            <span class="label">Contact Frequency (Email)</span>
                            <div class="value">
                                <a href="mailto:${email}" style="color: #ffffff; text-decoration: none;">${email}</a>
                            </div>
                        </div>

                        <div class="field">
                            <span class="label">Mission Objective (Subject)</span>
                            <div class="value">${subject}</div>
                        </div>

                        <div class="message-box">
                            <span class="label">TRANSMISSION DATA:</span>
                            <p style="margin-top: 5px; line-height: 1.6;">${message.replace(/\n/g, '<br>')}</p>
                        </div>

                        <div style="text-align: center;">
                            <a href="mailto:${email}" class="btn">REPLY TO SENDER</a>
                        </div>
                    </div>

                    <div class="footer">
                        <p>SECURE TRANSMISSION // PORTFOLIO V1 SYSTEM</p>
                        <p>Darshil Goyani | Full Stack Developer</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        `;

        // Step C: Email Bhejo Logic (Nodemailer)
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'darshilgoyani05@gmail.com',
                pass: 'dmurtyseiciwatfv'
            }
        });

        const mailOptions = {
            from: 'darshilgoyani05@gmail.com',
            to: 'darshilgoyani05@gmail.com',
            replyTo: email,
            subject: `🚀 Portfolio Alert: ${subject}`,
            html: emailTemplate
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({ success: true, message: 'Email sent successfully!' });

    } catch (error) {
        console.error('SERVER ERROR:', error);
        return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};