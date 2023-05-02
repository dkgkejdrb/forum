import { connectDB } from "@/util/index"
import { Input, Button } from "antd";
import { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

export async function getServerSideProps() {
  let client = await connectDB;
  let db = client.db('forum');
  let result = await db.collection('account').find().toArray();
  return {
    props: {
      result: JSON.parse(JSON.stringify(result))
    }
  }
}

export default function Home(result) {
  // 라우터
  const router = useRouter();
  const [id, setId] = useState(null);
  const [pw, setPw] = useState(null);

  // 관리자 로그인 체크
  const authHandler = () => {
    // 로그인 API로 id와 pw를 json으로 전송
    axios.post("/api/post/logIn", {
        "id": id,
        "pw": pw
    }, {
      "Content-Type": "application/json"
    }).then(res => {
      let status = res.data.status;
      // 응답결과가 200이면, 대시보드로 이동
      if (status === 200) {
        router.push("/dashboard");
      } 
      // 응답결과가 401이면, 서버의 msg값을 경고로 출력
      else {
        window.alert(res.data.msg);
      }
    }).catch(err => {
      console.log(err)
    })
  }

  return (
    <>
    {
      // dashboard url 사용하기
      <main style={{ width: "100%", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{ width: 390, height: 450, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <span style={{ width: 390, height: 40, fontSize: 24, fontWeight: 600, textAlign: "center"}}>관리자 로그인</span>
          <Input onChange={(e)=>{setId(e.target.value)}} placeholder="아이디를 입력하세요." style={{ marginTop: 16, width: 390, height: 55 }} />
          <Input.Password onChange={(e)=>{setPw(e.target.value)}} placeholder="비밀번호를 입력하세요." style={{ marginTop: 8, width: 390, height: 55 }} />
          <Button onClick={()=>{authHandler()}} type="primary" style={{ marginTop: 16, width: 390, height: 55 }}>로그인</Button>
        </div>
      </main>
    }
    </>
  )
}