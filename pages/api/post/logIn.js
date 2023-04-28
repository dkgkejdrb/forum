import { connectDB } from "@/util/index";

export default async function handler(req, res) {
    // axios로 전송한 body 저장 변수
    const body = req.body;
    if (req.method == 'POST') {
        // 요청한 id와 pw가 관리자 계정인지 체크
        if(body.id === "admin" && body.pw === "123456") {
            // mongoDB 데이터베이스(forum) 연결
            let db = (await connectDB).db('forum');

            // forum > account 콜렉션에서 id가 "admin"인 도큐먼트를 찾아, session을 "true"로 변경
            db.collection('account').updateOne(
            {
                id: "admin"
            },
            {
                "$set":
                {
                    session: "true"
                }
            })
            // id와 pw가 일치한 경우의 성공 메시지
            res.send({ status: 200, msg: "로그인 성공" })
        } else {
            // id와 pw가 일치하지 않은 경우의 성공
            res.send({ status: 401, msg: "아이디, 비밀번호를 확인해주세요." })
        }
    }
}