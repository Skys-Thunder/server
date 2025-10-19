const f=document.getElementsByTagName("form")[0];
f.addEventListener("submit",async e=>{
    e.preventDefault();
    const al=document.getElementById("alert");
    f["form-submit"].innerText="checking...";
    f["form-submit"].disabled=true;
    f["form-submit"].style.cursor="wait";
    al.innerText="";
    const res=await(await fetch("../api/login",{
        headers:{
            "Content-Type": "application/json",
        },
        body:JSON.stringify({"username":f.username.value,"password":f.password.value}),
        method:"POST"
    })).json();

    if(res.success){
        // ログインに成功したときの処理、ポップアップを上に表示
        al.style.background="#38af00";
        al.innerText="Login succeeded!";
        const q=Object.fromEntries(new URLSearchParams(window.location.search).entries())["redirect"];
        if(q) location.href=q;
    }
    else{
        // ログインに失敗したときの処理
        al.style.background="#ff5454";
        al.innerText="Login Failed...";
    }
    f["form-submit"].innerText="login";
    f["form-submit"].disabled=false;
    f["form-submit"].style.cursor="pointer";
});