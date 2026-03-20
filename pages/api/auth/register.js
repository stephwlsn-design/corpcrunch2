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
        const { firstName, lastName, email, companyName, location, password } = req.body;

        if (!firstName || !lastName || !email || !companyName || !location || !password) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        if (email.toLowerCase().endsWith('@gmail.com')) {
            return res.status(400).json({ success: false, message: 'Registration with @gmail.com is not allowed. Please use your company email.' });
        }

        if (password.length < 8) {
            return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email is already in use' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user (lastLoginAt set on first login via /auth/login)
        const user = await User.create({
            firstName,
            lastName,
            email: email.toLowerCase(),
            companyName,
            location,
            password: hashedPassword,
            lastLoginAt: new Date(),
            loginCount: 1,
        });

        // Create token
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            data: { id: user._id, email: user.email }
        });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}
