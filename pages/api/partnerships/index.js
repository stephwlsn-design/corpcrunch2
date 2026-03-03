import connectDB from '@/lib/mongoose';
import Partnership from '@/models/Partnership';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        await connectDB();

        const {
            firstName,
            lastName,
            email,
            location,
            partnershipType,
            companyName,
            jobTitle,
            phoneNumber,
            message,
        } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !email || !location || !partnershipType || !companyName || !jobTitle || !phoneNumber) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const newPartnership = new Partnership({
            firstName,
            lastName,
            email,
            location,
            partnershipType,
            companyName,
            jobTitle,
            phoneNumber,
            message,
        });

        await newPartnership.save();

        res.status(201).json({ message: 'Partnership request submitted successfully' });
    } catch (error) {
        console.error('Error submitting partnership request:', error);
        res.status(500).json({ message: 'Error submitting partnership request', error: error.message });
    }
}
