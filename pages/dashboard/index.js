import { AppstoreOutlined, FormOutlined } from '@ant-design/icons';
import { connectDB } from "@/util/index"
import { Button, Menu, Table } from "antd";
import { useEffect, useState } from "react";
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


const MyWork = () => {
    const router = useRouter();

    // 테이블을 클릭했을 때, 테이블의 key값(DB의 _id)을 저장할 상태값
    const [_id, set_Id] = useState("");

    const goToRouter = () => {
        router.push("/dashboard/write")
    }

    useEffect(() => {
        myWorkList();
    }, [])

    const columns = [
        {
            title: "제목",
            key: "title",
            dataIndex: "title",
            // render: (text) => <a href={'/dashboard/edit/' + _id}>{text}</a>
        },
        {
            title: "카테고리",
            key: "category",
            dataIndex: "category"
        },
        {
            title: "수정일자",
            key: "date",
            dataIndex: "date",
        },
    ]

    const [workList, setWorkList] = useState([]);

    const myWorkList = () => {
        // 나의 작품 리스트 가져오기
        axios.get("/api/post/workList")
        .then(res => {
            let tmpArray = [];
            res.data.reverse().map((myWork, index) => {
                tmpArray.push({
                    key: myWork._id,
                    title: myWork.title,
                    category: myWork.category,
                    date: myWork.date
                })
            })
            setWorkList([...tmpArray])
        }).catch(err => {
            console.log(err)
        })
    }

    return (
        <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: 800 }}>
            <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ fontWeight: 700 }}>작품 목록</div>
                <Button style={{ marginLeft: 640 }} onClick={goToRouter} >작성하기</Button>
            </div>
            <Table onRow={(record) => {
                return {
                    onDoubleClick: () => { router.push("/dashboard/edit/" + record.key) }
                }
            }}  
                columns={columns} dataSource={workList}  style={{ width: 800, marginTop: 16 }} />
            </div>
        </div>
    );
}

const Content = () => {
    const [current, setCurrent] = useState('home');
    
    const onClickMenu = (e) => {
        setCurrent(e.key);
    };

    const items = [
        {
          label: '홈',
          key: 'home',
          icon: <AppstoreOutlined />,
        },
        {
          label: '작품 올리기',
          key: 'myWork',
          icon: <FormOutlined />,
        },
    ]

    return(
        <div style={{ display: "flex", marginTop: 8 }}>
            <Menu onClick={onClickMenu} selectedKeys={[current]} items={items} style={{ width: 245, height: "100vh" }} />
            {
                current === 'home' 
                ? <div style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", fontSize: 30 }}>업로드한 작품 수, 조회 수 등을 기록할 예정</div>
                : current === 'myWork' 
                ? <MyWork />
                : <></>
            }
            
        </div>
    );
}


export default function Dashboard(result) {
    const router = useRouter();

    const _session = result.result[0].session;

    useEffect(() => {
        // /dashboard 첫 진입시 관리자 로그인 유무 체크
        // 만약 로그인되어있지 않으면 로그인 페이지로 이동
        if(_session === "false") {
            window.alert("세션이 만료되어 관리자페이지로 이동합니다.")
            router.push("/home")
        }
    }, [])

    return (
        <>            
            <main>
                <UpperMenu router={router} />
                <Content />
                
            </main>
        </>
    );
}
