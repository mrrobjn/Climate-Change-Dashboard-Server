import { MongoClient } from 'mongodb';

export async function connectToDatabase() {
    const url = 'mongodb://127.0.0.1:27017/';
    const client = new MongoClient(url);
    await client.connect();
    return client;
}
