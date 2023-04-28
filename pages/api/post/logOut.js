import { connectDB } from "@/util/index";

export default async function handler(req, res) {
    
    if (req.method == 'GET') {
        // forum > account 콜렉션에서 id가 "admin"인 도큐먼트를 찾아, session을 "false"로 변경
        let db = (await connectDB).db('forum')
        db.collection('account').updateOne(
        {
            id: "admin"
        },
        {
            "$set":
            {
                session: "false"
            }
        })

        res.send({ status: 200, msg: "로그아웃 성공" })
    }
}