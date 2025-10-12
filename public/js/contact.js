const f=document.getElementsByTagName("form")[0];
f["form-submit"].addEventListener("click",async()=>{
    const al=document.getElementById("alert");
    f["form-submit"].innerText="Submitting...";
    f["form-submit"].disabled=true;
    f["form-submit"].style.cursor="wait";
    al.innerText="";
    const res=await(await fetch("../api/contact",{
        headers:{
            "Content-Type": "application/json",
        },
        body:JSON.stringify({"email":f.email.value,"message":f.message.value}),
        method:"POST"
    })).json();
    if(res.success){
        al.style.background="#38af00";
        al.innerText="Submitted!";
    }
    else{
        al.style.background="#ff5454";
        al.innerText="Submission Failed...";
    }
    f["form-submit"].innerText="Submit";
    f["form-submit"].disabled=false;
    f["form-submit"].style.cursor="pointer";
})