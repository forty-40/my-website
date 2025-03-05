Frontend:

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Appointment Booking</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; margin: 50px; }
        .container { max-width: 400px; margin: auto; padding: 20px; border: 1px solid #ccc; border-radius: 10px; }
        input, button { width: 100%; padding: 10px; margin-top: 10px; }
        .appointments { margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <h2>Book an Appointment</h2>
        <input type="text" id="name" placeholder="Your Name" required>
        <input type="date" id="date" required>
        <input type="time" id="time" required>
        <button onclick="bookAppointment()">Book Now</button>
        <h3>Appointments</h3>
        <ul id="appointmentList" class="appointments"></ul>
    </div>
    
    <script>
        async function bookAppointment() {
            const name = document.getElementById('name').value;
            const date = document.getElementById('date').value;
            const time = document.getElementById('time').value;
            
            if (name && date && time) {
                const appointment = { name, date, time };
                
                try {
                    const response = await fetch('http://localhost:5000/book', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(appointment)
                    });
                    
                    const result = await response.json();
                    alert(result.message);
                    
                    const listItem = document.createElement('li');
                    listItem.textContent = `${name} - ${date} at ${time}`;
                    document.getElementById('appointmentList').appendChild(listItem);
                    
                    document.getElementById('name').value = '';
                    document.getElementById('date').value = '';
                    document.getElementById('time').value = '';
                } catch (error) {
                    alert('Error booking appointment. Try again.');
                }
            } else {
                alert('Please fill all fields.');
            }
        }
    </script>
</body>
</html>

Backend (Node.js + Express):

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect('mongodb://localhost:27017/appointments', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const appointmentSchema = new mongoose.Schema({
    name: String,
    date: String,
    time: String
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

app.post('/book', async (req, res) => {
    const { name, date, time } = req.body;
    const newAppointment = new Appointment({ name, date, time });
    await newAppointment.save();
    
    // Send Email Confirmation
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'your-email@gmail.com',
            pass: 'your-email-password'
        }
    });

    const mailOptions = {
        from: 'your-email@gmail.com',
        to: 'recipient-email@gmail.com',
        subject: 'Appointment Confirmation',
        text: `Hello ${name}, your appointment is booked on ${date} at ${time}.`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            res.json({ message: 'Appointment booked, but email failed.' });
        } else {
            res.json({ message: 'Appointment booked successfully!' });
        }
    });
});

app.listen(5000, () => console.log('Server running on port 5000'));
