import bcrypt from 'bcryptjs';
import { MongoClient, ServerApiVersion } from 'mongodb';
import validator from 'validator';
import jwt from 'jsonwebtoken';

function db_connect() {
	const client = new MongoClient(process.env.MONGODB_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		serverApi: ServerApiVersion.latest
	});
	return client.connect();
}
 

export async function POST(request) {
    const db = db_connect();
    const usersCollection = db.collection('users');

    const { firstName, lastName, email, age, contactNumber, password } = request.body;

    if (!firstName || !lastName || !email || !age || !contactNumber || !password) {
        return new Response(JSON.stringify({ message: 'Please fill in all fields' }), { status: 400 });
    }

    if (!validator.isEmail(email)) {
        return new Response(JSON.stringify({ message: 'Invalid email' }), { status: 400 });
    }

    try {
        let user = await usersCollection.findOne({ email });
        if (user) {
            return new Response(JSON.stringify({ message: 'User already exists' }), { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user = {
            firstName,
            lastName,
            email,
            age,
            contactNumber,
            password: hashedPassword,
        };

        await usersCollection.insertOne(user);

        const payload = { user: { id: user._id } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

        return new Response(JSON.stringify({
            message: 'Registration successful',
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                email: user.email,
            },
        }), { status: 201 });

    } catch (err) {
        console.error('Error in registration:', err.message);
        return new Response(JSON.stringify({ message: 'Server error during registration' }), { status: 500 });
    }
}
