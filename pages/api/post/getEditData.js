import { connectDB } from "@/util/index";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
    if (req.method == 'POST') {
        const db = (await connectDB).db('forum')
        let result = await db.collection('mywork').find(
        {
            _id: new ObjectId(req.body.id)
        }
        ).toArray()

        res.status(200).json(result);
    }
}