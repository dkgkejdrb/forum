import { AppstoreOutlined, FormOutlined } from '@ant-design/icons';
import { connectDB } from "@/util/index"
import { Button, Menu, Table, Modal } from "antd";
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

    // 모달창 보여지는 상태값(true, false)
    const [open, setOpen] = useState(false);

    // 삭제할 열의 id값
    const [_id, set_Id] = useState("");

    const showModal = (e) => {
      set_Id(e.target.id);
      setOpen(true);
    };
    // ok 클릭 시, id값을 찾아 삭제
    const handleOk = (e) => {
        const data = {
            "id": _id
        }
        axios.post("/api/post/delete", data, {"Content-Type": "application/json"})
        .then(res => {
            let status = res.data.status;
            // 응답결과가 200이면, 대시보드로 이동
            if (status === 200) {
                // 화면 새로고침
                router.reload();
            } 
            // 응답결과가 401이면, 서버의 msg값을 경고로 출력
            else {
              window.alert("알 수 없는오류");
            }
        }).catch(err => {
            console.log(err)
        })
        setOpen(false);
    };
    const handleCancel = (e) => {
      setOpen(false);
    };

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
        {
            title: "편집",
            key: "action",
            render: (_, record) => (
                <div>
                    <Button danger onClick={() => {router.push("/dashboard/edit/" + record.key)} }>수정</Button>
                    <Button id={record.key} type='primary' danger 
                        onClick={
                            (e) => {
                                showModal(e);
                            } 
                        } style={{ marginLeft: 15 }}>
                        <div id={record.key}>삭제</div>
                    </Button>
                </div>
            )
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
                    id: index,
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
            <Table 
                columns={columns} dataSource={workList}  style={{ width: 800, marginTop: 16 }} />
            </div>
            <Modal
                open={open}
                title="경고"
                content="선택한 작품을 삭제하시겠습니까?"
                okText= "예"
                okType= "danger"
                cancelText= "아니오"
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <div>선택한 작품을 삭제하시겠습니까?</div>
            </Modal>
        </div>
    );
}

const Content = () => {
    const [current, setCurrent] = useState('myWork');
    
    const onClickMenu = (e) => {
        setCurrent(e.key);
    };

    const items = [
        {
            label: '작품 올리기',
            key: 'myWork',
            icon: <FormOutlined />,
          },
        {
          label: '통계',
          key: 'statics',
          icon: <AppstoreOutlined />,
        },
    ]

    return(
        <div style={{ display: "flex", marginTop: 8 }}>
            <Menu onClick={onClickMenu} selectedKeys={[current]} items={items} style={{ width: 245, height: "100vh" }} />
            {
                current === 'statics' 
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
