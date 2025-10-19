async function loadcontact(){
    q.innerText="読み込み中...";
    q.disabled=true;
    q.style.cursor="wait";
    const res=await (await fetch(`/api/contact?page=${Math.ceil((document.querySelectorAll("#contacts-list tr").length-1)/10)}`,{
        headers:{
            "Content-Type": "application/json",
        },
        method:"GET"
    })).json();
    const {data,next}=res;
    const tb=document.querySelector("#contacts-list tbody");
    for(const n of data){
        const tr=tb.insertRow();
        [new Date(n.date).toLocaleString(),n.ip,n.email,n.message].forEach(t=>{
            const td=tr.insertCell();
            td.textContent=t??"";
        })
    }
    if(next){
        q.innerText="もっと読み込む";
        q.disabled=false;
        q.style.cursor="pointer";
    }
    else q.remove();
}
const q=document.querySelector("#loadmore");
q.addEventListener("click",()=>{
    loadcontact();
});
loadcontact();

// const ws=new WebSocket("ws://localhost:8080");