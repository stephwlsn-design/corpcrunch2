import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    await dbConnect();

    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        // Find user
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Verify if user is active
        if (!user.isActive) {
            return res.status(403).json({ success: false, message: 'Account is deactivated' });
        }

        // Create token
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '7d' }
        );

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                companyName: user.companyName,
                location: user.location,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}
