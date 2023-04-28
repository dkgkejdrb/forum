import { connectDB } from "@/util/index";

export default async function handler(req, res) {
    // axios로 전송한 body 저장 변수
    const body = req.body;
    if (req.method == 'POST') {
      try {
        let db = (await connectDB).db('forum');
        let result = db.collection('mywork').insertOne(body);
        res.send({ status: 200, msg: "업로드 성공" })
      } catch (error) {
        res.send({ msg: "업로드 실패" })
      }
    }
}