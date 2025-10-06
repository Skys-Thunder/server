const f=document.getElementsByTagName("form")[0];
f["form-submit"].addEventListener("click",async()=>{
    f["form-submit"].innerText="checking...";
    f["form-submit"].disabled=true;
    f["form-submit"].style.cursor="wait";
    const res=await(await fetch("../api/login",{
        headers:{
            "Content-Type": "application/json",
        },
        body:JSON.stringify({"username":f.username.value,"password":f.password.value}),
        method:"POST"
    })).json();
    if(res.success){
        // ログインに成功したときの処理、ポップアップを上に表示
    }
    else{
        // ログインに失敗したときの処理
    }
    f["form-submit"].innerText="login";
    f["form-submit"].disabled=false;
    f["form-submit"].style.cursor="pointer";
})