import {MongoClient, ObjectId} from 'mongodb';
import 'dotenv/config';

let cachedClient = null;
let cachedDb = null;

export async function connectToDatabase() {
	if (cachedClient && cachedDb) {
		return { client: cachedClient, db: cachedDb };
	}

	const uri = process.env.DB_URI;
	if (!uri) {
		throw new Error('Please define the DB_URI environment variable');
	}

	try {
		const client = await MongoClient.connect(uri, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			maxPoolSize: 10,
		});

		const db = client.db(process.env.DB_NAME || 'alethiosphere');

		cachedClient = client;
		cachedDb = db;

		client.on('error', (error) => {
			console.error('MongoDB connection error:', error);
			cachedClient = null;
			cachedDb = null;
		});

		return { client, db };
	} catch (error) {
		console.error('Failed to connect to the database:', error);
		throw error;
	}
}

export async function getCollection(collectionName) {
	const { db } = await connectToDatabase();
	return db.collection(collectionName);
}

export async function findDocuments(collectionName, query = {}, options = {}) {
	const collection = await getCollection(collectionName);

	const {
		limit = 0,
		skip = 0,
		sort = {},
		projection = {},
	} = options;

	return collection
		.find(query)
		.sort(sort)
		.skip(skip)
		.limit(limit)
		.project(projection)
		.toArray();
}

export async function findDocumentById(collectionName, id) {
	const collection = await getCollection(collectionName);
	return collection.findOne({ _id: new ObjectId(id) });
}

export async function insertDocument(collectionName, document) {
	const collection = await getCollection(collectionName);
	const result = await collection.insertOne(document);
	return { ...document, _id: result.insertedId };
}

export async function updateDocument(collectionName, id, update) {
	const collection = await getCollection(collectionName);
	const result = await collection.findOneAndUpdate(
		{ _id: new ObjectId(id) },
		update,
		{ returnDocument: 'after' }
	);
	return result.value;
}

export async function deleteDocument(collectionName, id) {
	const collection = await getCollection(collectionName);
	const result = await collection.deleteOne({ _id: new ObjectId(id) });
	return result.deletedCount > 0;
}

export async function aggregate(collectionName, pipeline) {
	const collection = await getCollection(collectionName);
	return collection.aggregate(pipeline).toArray();
}

export async function countDocuments(collectionName, query = {}) {
	const collection = await getCollection(collectionName);
	return collection.countDocuments(query);
}