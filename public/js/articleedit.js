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

const updbtn=document.getElementById("update");