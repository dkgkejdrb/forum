import dynamic from 'next/dynamic'
import { Button, Input, Select, Upload } from 'antd'
import { useSelector } from 'react-redux'
import { useEffect, useState } from 'react';
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';
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

    return (
        <div style={{ width: "100%", display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={() => { authHandler() }} type="primary" style={{ width: 100 }}>로그아웃</Button>
        </div>
    );
}

const Edit = (result) => {
    const router = useRouter();
    const _session = result.result[0].session;

    useEffect(() => {
        // /dashboard 첫 진입시 관리자 로그인 유무 체크
        // 만약 로그인되어있지 않으면 로그인 페이지로 이동
        if(_session === "false") {
            window.alert("세션이 만료되어 홈으로 이동합니다.")
            router.push("/home")
        }
    }, [])

    const { id } = router.query;

    const [categoryState, setCategoryState] = useState("");
    const [titleState, setTitleState] = useState("");
    const htmlText = useSelector(state => {
        return state
    });

    const [thumbnailState, setThumbnailState] = useState("");
    const [thumbnailTitleState, setThumbnailTitleState] = useState("");
    const [thumbnailList, setThumbnailList] = useState([
      {
        uid: "-1",
        name: "image.png",
        status: "done",
        url: "",
      },
    ]);

    const [defaultFileView, setDefaultFileView] = useState(true);
    const onChange = (info) => {
        const body = new FormData();
        body.append('file', info.file.originFileObj);
        
        // 만약, thumbnailTitle 과 선택한 파일이 같다면, 초기 파일이름 유지
        if(thumbnailTitleState === info.file.originFileObj.name) {
          console.log(`${thumbnailTitleState} / ${info.file.originFileObj.name}`)
          setDefaultFileView(false);
        }

        // 썸네일 수정되게 바꿔야 함
        setThumbnailTitleState(info.file.originFileObj.name);

        const options = {
            headers: { 
                'content-type': 'multipart/form-data' 
            },
        }

        // image 업로드용 api
        axios.post("/api/post/imageAzure", body, options)
        .then((res)=> {
            const url = res.data.url;
            setThumbnailState(url);
        })
        .catch((err) => {
            console.log(err)
        })

      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === 'done') {
        console.log(`${info.file.name} file uploaded successfully`);
      } else if (info.file.status === 'error') {
        console.error(`${info.file.name} file upload failed.`);
      }
    }

    // 첫 로드시, id로 조회환 데이터를 state에 저장하기
    useEffect(() => {
        // DB의 고유 id를
        axios.post("/api/post/getEditData", {
            "id": id,
        }, {
            "Content-Type": "application/json"
        }).then(res => {
            let data = res.data[0];
            setTitleState(data.title);
            setCategoryState(data.category);
            setThumbnailTitleState(data.thumbnailTitle);
            setThumbnailState(data.thumbnail);
            setThumbnailList({
                uid: "-1",
                name: data.thumbnailTitle,
                status: "done",
                url: data.thumbnail,
                });
                console.log(data);
            // 응답결과가 200이면, 대시보드로 이동
        }).catch(err => {
            window.alert("Something Wrong!")
        })
    }, [])

    const data = {
        "id": id,
        "category": categoryState,
        "title": titleState,
        "htmlText": htmlText?.test,
        "date": dayjs(Date.now()).format("YYYY/MM/DD"),
        "thumbnail": thumbnailState,
        "thumbnailTitle": thumbnailTitleState
    }

    const selectCategoryHandler = (value) => {
        setCategoryState(value);
    };

    const inputTitleHandler = (e) => {
        setTitleState(e.target.value)
    };

    const uploadHandler = (e) => {
        if (titleState === "") {
            window.alert("제목을 입력해주세요.");
            return;
        } else if (htmlText.test === "") {
            window.alert("본문을 입력해주세요.");
            return;
        }

        window.alert("수정되었습니다.");
        axios.post("/api/post/edit", data, { "Content-Type": "application/json" })
            .then(res => {
                console.log(data);
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
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <UpperMenu router={router} />
        <div
          className="UploadButton"
          style={{ width: 800, display: "flex", alignItems: "center" }}
        >
          <div
            style={{
              fontWeight: 700,
              fontSize: 19,
              textDecoration: "underline",
            }}
          >
            수정하기
          </div>
          <Button
            style={{ marginLeft: 630 }}
            onClick={uploadHandler}
            shape="round"
            type="primary"
            icon={<UploadOutlined />}
          >
            수정
          </Button>
        </div>
        <div className="SelectCategory" style={{ width: 800, marginTop: 30 }}>
          <Select
            defaultValue="디자인"
            value={categoryState}
            style={{ marginBottom: 16, width: 120 }}
            onChange={selectCategoryHandler}
            bordered={false}
            options={[
              { value: "일러스트", label: "일러스트" },
              { value: "사진", label: "사진" },
              { value: "회화", label: "회화" },
              { value: "디자인", label: "디자인" },
              { value: "캘리그라피", label: "캘리그라피" },
              { value: "애니메이션", label: "애니메이션" },
              { value: "기타", label: "기타" },
            ]}
          />
        </div>
        <div className="InputTitle" style={{ marginBottom: 20 }}>
          <Input
            placeholder="제목을 입력해주세요."
            value={titleState}
            onChange={(e) => inputTitleHandler(e)}
            bordered={false}
            style={{
              width: 800,
              height: 40,
              fontSize: 19,
              borderBottom: "1px solid #dfdfdf",
            }}
          />
        </div>
        <div style={{ width: 800, display: "flex", marginBottom: 32 }}>
          <div style={{ width: 200, position: "relative" }}>
            {thumbnailList.url !== "" ? (
              <Upload
                maxCount={1}
                onChange={onChange}
                listType="picture"
                // defaultFileList={thumbnailList}
                defaultFileList={[
                  {
                    uid: "-1",
                    name: thumbnailTitleState,
                    status: "done",
                    url: thumbnailState,
                  },
                ]}
              >
                <Button icon={<PlusOutlined />} style={{ height: 40 }}>
                  썸네일
                </Button>
                {defaultFileView ? (
                  <div
                    style={{
                      top: 48,
                      position: "absolute",
                      width: 200,
                      height: 66,
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        marginLeft: 60,
                        width: 140,
                        height: 66,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "flex",
                        alignItems: "center"
                      }}
                    >
                      {thumbnailTitleState}
                    </div>
                  </div>
                ) : (
                  <></>
                )}
              </Upload>
            ) : (
              <></>
            )}
          </div>
        </div>
        {typeof window !== "undefined" && <DynamicComponent />}
      </div>
    );
}

export default Edit;