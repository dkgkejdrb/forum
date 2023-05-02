import { connectDB } from "@/util/index";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
    
    if (req.method == 'POST') {
        // forum > mywork 콜렉션에서 body에서 보내온 id값을 찾아 찾아, 데이터삭제
        let db = (await connectDB).db('forum')
        db.collection('mywork')
        .deleteOne(
            {
                _id: new ObjectId(req.body)
            }
        )

        res.send({ status: 200, msg: "로그아웃 성공" })
    }
}