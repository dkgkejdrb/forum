import { connectDB } from "@/util/index";

export default async function handler(req, res) {
    const db = (await connectDB).db('forum')
    let result = await db.collection('mywork').find().toArray()

    res.status(200).json(result);
}