import dynamic from 'next/dynamic'
import { Button, Input, Select } from 'antd'
import { useSelector } from 'react-redux'
import { useState } from 'react';
import { UploadOutlined } from '@ant-design/icons';
import { connectDB } from "@/util/index"
import axios from 'axios';
import { useRouter } from "next/router";
import dayjs from "dayjs";


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

// 동적으로 서버사이드 렌더링
// dashboard > write > Editor 컴포넌트
const DynamicComponent = dynamic(() => import('./Editor'), {
    ssr: false,
})

// 상단 메뉴
const UpperMenu = (props) => {
    // 로그아웃 체크
    const authHandler = () => {
        // 로그아웃 API 호출
        axios.get("/api/post/logOut")
        .then(res => {
            let status = res.data.status;
            // 응답결과가 200이면, 홈으로 이동
            if (status === 200) {
            props.router.push("/home");
            } 
            else {
            window.alert(res.data.msg);
            }
        }).catch(err => {
            console.log(err)
        })
    }
        
    return( 
        <div style={{ width: "100%", display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={()=>{authHandler()}} type="primary" style={{ width: 100 }}>로그아웃</Button>
        </div>
    );
}

const Write = () => {
    const router = useRouter();

    const [categoryState, setCategoryState] = useState("디자인");
    const [titleState, setTitleState] = useState("");
    const htmlText = useSelector( state => {
        return state
    });

    const data = {
        "category": categoryState,
        "title": titleState,
        "htmlText": htmlText?.test,
        "date": dayjs(Date.now()).format("YYYY/MM/DD")
    }

    const selectCategoryHandler = (value) => {
        setCategoryState(value);
      };

    const inputTitleHandler = (e) => {
        setTitleState(e.target.value)
    };

    const uploadHandler = (e) => {
        if(titleState === "") {
            window.alert("제목을 입력해주세요.");
            return;
        } else if(htmlText.test === "") {
            window.alert("본문을 입력해주세요.");
            return;
        } 

        axios.post("/api/post/image", data, {"Content-Type": "application/json"})
        .then(res => {
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

    };

    return (
        <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <UpperMenu router={router} />
            <div className='UploadButton' style={{ width: 800, display: "flex", alignItems: "center" }}>
                <div style={{ fontWeight: 700, fontSize: 19, textDecoration: "underline" }}>새로 작성하기</div>
                <Button style={{ marginLeft: 580 }}  onClick={uploadHandler} shape="round" type="primary" icon={<UploadOutlined />}>업로드</Button>
            </div>
            <div className='SelectCategory' style={{ width: 800, marginTop: 20 }}>
                <Select defaultValue="디자인" style={{ marginBottom: 16, width: 120 }} onChange={selectCategoryHandler} bordered={false}
                    options={[{value: '일러스트',label: '일러스트'},{value: '사진',label: '사진'},{value: '회화',label: '회화',},{value: '디자인',label: '디자인'},
                    {value: '캘리그라피',label: '캘리그라피'},{value: '애니메이션',label: '애니메이션'},{value: '기타',label: '기타'}]}/>
            </div>
            <div className='InputTitle' style={{ marginBottom: 32 }}>
                <Input placeholder='제목을 입력해주세요.' onChange={(e) => inputTitleHandler(e)} bordered={false} style={{ width: 800, height: 40, fontSize: 19, borderBottom: '1px solid #dfdfdf' }} />
            </div>
            <DynamicComponent />
        </div>
    );
}

export default Write;