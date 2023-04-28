// 리액트퀼에디터REF 커스텀 > https://www.npmjs.com/package/react-quilljs?activeTab
// 리액트이미지리사이즈 사용 > https://www.npmjs.com/package/quill-image-resize-module-react


// 중요: 컴포넌트의 클래스네임(ql-insertHeart)과 핸들러의 key이름(inserHeart)와 일치해야함
import React, { useEffect, useState } from 'react';
import ImageResize from 'quill-image-resize-module-react';
// 중요 1: Quill moudle에 외부 모듈을 등록하기 위해 Quill 임포트
import Quill from 'quill';

import { useQuill } from 'react-quilljs';
import 'quill/dist/quill.snow.css';
import { useDispatch } from "react-redux";
import { testAction } from "@/lib/store/modules/test";
import axios from 'axios';
import { useRouter } from "next/router";

// 엑셀 파일 업로드 아이콘
const ExcelUploadIcon = () => ( <span className='excelUpload'>📃</span> )
// 이미지 파일 업로드 아이콘
const ImageUploadIcon = () => ( <span className='imageUpload'>🖼️</span> )

// 이미지 ctrl c / ctrl v
// quillRef 끌어올리기
let _quillRef = null;
window.addEventListener("paste", function(e){
    let item = Array.from(e.clipboardData.items).find(x => /^image\//.test(x.type));
    // 클립보드에 복사된 파일이 image가 아니면, 리턴
    if (!item) {
        return;
    }

    let blob = item.getAsFile();

    let img = new Image();

    img.onload = function(){
        if(_quillRef) {
            // _quillRef.current.firstChild > 에디터창 타겟으로 출력
            _quillRef.current.firstChild.appendChild(this);
        }
    };

    img.src = URL.createObjectURL(blob);
});


const formats = [
    'bold', 'italic', 'underline', 'strike',
    'align', 'list', 'indent',
    'size', 'header',
    'link', 'image', 'video',
    'color', 'background',
    'clean', 'script',
    'blockquote', 'code-block'
];

const placeholder = '본문을 작성해주세요.';

// 중요 2: Quill moudle에 imageResize 디렉터리 등록
Quill.register("modules/imageResize", ImageResize);

const Editor = () => {
    // 리덕스
    const dispatch = useDispatch();

    const modules = {
        toolbar: {
            container: '#toolbar1',
            // handlers: {
            //     insertHeart: insertHeart
            // }
        },
        // 중요 3: 모듈에 기능 포함
        imageResize: {
            modules: [ 'Resize', 'DisplaySize' ]
        }
    }

    const [excelUploadClicked, setExcelUploadClicked] = useState(false);
    const [imageUploadClicked, setImageUploadClicked] = useState(false);
    const uploadHandler = (e) => {
        const className = e.target.className;
        if (className === "excelUpload") {
            setExcelUploadClicked(!excelUploadClicked);
        } else if (className === "imageUpload") {
            setImageUploadClicked(!imageUploadClicked);
        }

    }


    const { quill, quillRef } = useQuill({ modules, formats, placeholder });

    // 엑셀 파일 > 화면에 표시할 카드
    const [ excelUploadCard, setExcelUploadCard ] = useState(null);
    // 엑셀파일인지 유효성 검사
    useEffect(() => {
        if (quill) {
            const input = document.createElement('input');
            input.setAttribute('type', 'file');
            input.setAttribute('accept', '.xlsx');
            input.click();

            input.onchange = () => {
                const file = input.files[0];
                let extention = file.name.slice(file.name.indexOf(".") + 1).toLowerCase();
                if(extention !== "xlsx") {
                  alert(`[ ${file.name} ] 은 지원하지 않는 파일형식입니다.`);
                  return;
                }
                setExcelUploadCard(file);
                // axios 사용해야함
            };
        }
    }, [excelUploadClicked]);

    // 이미지 파일 > 화면에 표시할 카드
    const [ imageUploadCard, setImageUploadCard ] = useState(null);
    // 이미지파일인지 유효성 검사
    useEffect(() => {
        if (quill) {
            const input = document.createElement('input');
            input.setAttribute('type', 'file');
            input.setAttribute('accept', 'image/*');
            input.click();

            input.onchange = () => {
                const file = input.files[0];
                let extention = file.name.slice(file.name.indexOf(".") + 1).toLowerCase();
                if(extention !== "png") {
                  alert(`[ ${file.name} ] 은 지원하지 않는 파일형식입니다.`);
                  return;
                }
                // else if(extention !== "jpg") {
                //     alert(`[ ${file.name} ] 은 지원하지 않는 파일형식입니다.`);
                //     return;
                // }
                setImageUploadCard(file);
                // axios 사용해야함
            };
        }
    }, [imageUploadClicked]);

    // Insert Image(selected by user) to quill
    const insertToEditor = (url) => {
        const range = quill.getSelection();
        quill.insertEmbed(range.index, 'image', url);
    };

    // Upload Image to Image Server such as AWS S3, Cloudinary, Cloud Storage, etc..
    const saveToServer = async (file) => {
        const body = new FormData();
        body.append('file', file);
        const config = {
            headers: { 'content-type': 'multipart/form-data' },
          };

        const response = await axios.post('/api/imgupload', body, config);
        // ★중요: next.js 에서는 public 경로를 제외하고 적어주면 정상적으로 이미지가 출력됨
        const url = "/uploads/" + response?.data[0].filename
        insertToEditor(url)
    };

    // Open Dialog to select Image File
    const selectLocalImage = () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = () => {
        const file = input.files[0];
        saveToServer(file);
        };
    };

    const router = useRouter();
    const { id } = router.query;
    const [isIDChnaged, setIsIDChanged] = useState(id);
    const [fromDBhtmlText, setFromDBhtmlText] = useState("")

    useEffect(() => {
        console.log("이게 많이뜨면 안됨")
        if (quill) {
            _quillRef = quillRef;

        // Add custom handler for Image Upload
        quill.getModule('toolbar').addHandler('image', selectLocalImage);

        // 글자가 바뀌었을 때, 콜이되는 이벤트 리스너
        quill.on('text-change', (delta, oldDelta, source) => {
            // console.log(quill.getText()); // get text only
            // console.log(quill.getContents()); // get delta contents
            // console.log(quill.root.innerHTML); // get innerHTML using quill
            // console.log(quillRef.current.firstChild.innerHTML); // get innerHTML using quillRef
            dispatch(testAction(quillRef.current.firstChild.innerHTML));
        });

        // 에디터에 fromDBhtmlText 올리기
        quill.clipboard.dangerouslyPasteHTML(`${fromDBhtmlText}`)
        }
    }, [quill, id]);

    useEffect(()=> {
        setIsIDChanged(id);
        console.log("이게 많이뜨면 안됨")

        // DB의 고유 id를
        axios.post("/api/post/getEditData", {
                "id": id,
            }, {
            "Content-Type": "application/json"
            }).then(res => {
                let data = res.data[0];
                setFromDBhtmlText(data.htmlText);
           })
    }, [])


    return (
        <div className='DKEditorRef' style={{ width: 800 }}>
            {
                console.log(fromDBhtmlText)
            }
            <div id="toolbar1">
                <select className="ql-size">
                    <option value="small" />
                    <option defaultValue />
                    <option value="large" />
                    <option value="huge" />
                </select>
                <select className="ql-header">
                    <option value="1" />
                    <option value="2" />
                    <option value="3" />
                    <option value="4" />
                    <option value="5" />
                    <option value="6" />
                </select>
                <select className='ql-color'></select>
                <select className='ql-background'></select>
                <button className="ql-bold" />
                <button className="ql-italic" />
                <button className="ql-underline" />
                <button className="ql-strike" />
                <button className='ql-image'></button>
                <select className="ql-align"></select>
                <button className="ql-list" value="bullet"/>
                <button className="ql-list" value="ordered"/>
                <button className="ql-indent" value="-1"></button>
                <button className="ql-indent" value="+1"></button>
                <button className="ql-blockquote"/>
                <button className='ql-link'></button>
                <button className='ql-clean'></button>
                <button className="ql-script" value="sub" />
                <button className="ql-script" value="super" />
            </div>
            <div ref={quillRef}></div>
            {/* <div ref={counterRef}></div> */}
            {/* 아래 html 태그 텍스트 코드를 html로 변경 */}
            {/* <div dangerouslySetInnerHTML={{ __html: data }} ></div> */}
            {
                excelUploadCard &&
                    <div
                        style={{ width: "100%", display: "flex", justifyContent: "space-between", backgroundColor: "grey" }}>
                        <span>{excelUploadCard.name}</span>
                        <div style={{ width: "20px", cursor: "pointer", color: "red", textAlign: "center"}}
                            onClick={()=> { setExcelUploadCard(null) }}
                        >x</div>
                    </div>
            }
            {
                imageUploadCard &&
                    <div
                        style={{ width: "100%", display: "flex", justifyContent: "space-between", backgroundColor: "grey" }}>
                        <span>{imageUploadCard.name}</span>
                        <div style={{ width: "20px", cursor: "pointer", color: "red", textAlign: "center"}}
                            onClick={()=> { setImageUploadCard(null) }}
                        >x</div>
                    </div>
            }
        </div>
    );
}

export default Editor;