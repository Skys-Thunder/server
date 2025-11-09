const editor=document.getElementById("editor");
const preview=document.getElementById("preview");
marked.use(markedHighlight.markedHighlight({
    langPrefix:"hljs language-",
    highlight(code,lang){
        return hljs.highlight(code,{language:hljs.getLanguage(lang)?lang:"plaintext"}).value;
    }
}));
marked.use(markedKatex({
    throwOnError:false
}))
editor.addEventListener("input",()=>{
    preview.innerHTML=DOMPurify.sanitize(marked.parse(editor.value));
});
preview.innerHTML=DOMPurify.sanitize(marked.parse(editor.value));

const [pubbtn,updbtn,title,data]=["publish","update","title","editor"].map(n=>document.getElementById(n));
pubbtn.addEventListener("click",()=>{
    pubbtn.classList.toggle("pub");
    pubbtn.classList.toggle("unpub");
});
updbtn.addEventListener("click",async()=>{
    const id=location.pathname.split("/").filter(x=>x!="")[1];
    const al=document.getElementById("alert");
    updbtn.innerText="更新中...";
    updbtn.disabled=true;
    updbtn.style.cursor="wait";
    pubbtn.disabled=true;
    pubbtn.style.cursor="wait";
    al.innerText="";

    const res=await (await fetch(`/api/article/${id}/update`,{
        headers:{
            "Content-Type":"application/json",
        },
        body:JSON.stringify({"title":title.value,"public":pubbtn.className=="pub","data":data.value}),
        method:"POST"
    })).json();
    if(res.success){
        al.style.background="#38af00";
        al.innerText="更新されました！";
    }
    else{
        al.style.background="#ff5454";
        al.innerText="更新に失敗しました...";
    }
    updbtn.innerText="更新";
    updbtn.disabled=false;
    updbtn.style.cursor="pointer";
    pubbtn.disabled=false;
    pubbtn.style.cursor="pointer";
});

window.addEventListener("beforeunload",(e)=>{
    e.preventDefault();
});