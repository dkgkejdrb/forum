import { connectDB } from "@/util/index";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
    
    if (req.method == 'POST') {
        // forum > account 콜렉션에서 id가 "admin"인 도큐먼트를 찾아, session을 "false"로 변경
        let db = (await connectDB).db('forum')
        console.log(req.body);
        db.collection('mywork').updateOne(
        {
            _id: new ObjectId(req.body.id)
        },
        {
            "$set":
            {
                category: req.body.category,
                title: req.body.title,
                htmlText: req.body.htmlText,
                date: req.body.date,
                thumbnail: req.body.thumbnail,
                thumbnailTitle: req.body.thumbnailTitle,
            }
        })

        res.send({ status: 200, msg: "로그아웃 성공" })
    }
}