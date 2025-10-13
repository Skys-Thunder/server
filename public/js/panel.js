async function loadcontact(){
    const res=await (await fetch(`/api/contact?page=${(document.querySelectorAll("#contacts-list tr").length-1)/10}`,{
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
}
loadcontact();