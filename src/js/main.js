const MANIFEST_URL = "manifest.json";
function bytesToMB(n){return(n/1024/1024).toFixed(1)+" MB";}
function fmtDate(iso){try{return new Date(iso).toLocaleDateString("vi-VN",{year:"numeric",month:"short",day:"2-digit"})}catch{return"—"}}
function withTimeout(p,ms=8000){return Promise.race([p,new Promise((_,r)=>setTimeout(()=>r(new Error("timeout")),ms))])}
async function fetchJSON(url,opt){const r=await withTimeout(fetch(url,opt),opt?.timeout||8000);if(!r.ok)throw new Error("http");return r.json()}

async function fromManifest(){
  const m=await fetchJSON(MANIFEST_URL,{cache:"no-store"});
  return {
    url:m?.apk?.url||null,
    name:m?.apk?.name||null,
    size:m?.apk?.size_bytes||null,
    sha256:m?.apk?.sha256||null,
    version:m?.version||null,
    notes:m?.notes||"",
    published_at:m?.published_at||null
  };
}

function setDisabled(a,d){if(!a)return;d?(a.setAttribute("aria-disabled","true"),a.setAttribute("tabindex","-1")):(a.removeAttribute("aria-disabled"),a.removeAttribute("tabindex"))}
function setText(sel,val){const el=document.querySelector(sel);if(el)el.textContent=val??"—"}

function renderSig(data){ setText("#sha256",data.sha256); }

async function loadLatest(){
  const btn=document.getElementById("btn-apk");
  const v=document.querySelector("[data-version]");
  const sizeEl=document.querySelector("[data-size]");
  const dateEl=document.querySelector("[data-date]");
  const change=document.getElementById("changelog");

  try{
    const data=await fromManifest();

    v.textContent=data.version||"—";
    sizeEl.textContent=data.size?bytesToMB(data.size):"—";
    dateEl.textContent=data.published_at?fmtDate(data.published_at):"—";

    if(data.url){
      const fname=data.name||`PlayPing-${data.version||"latest"}.apk`;
      btn.href=data.url;
      btn.setAttribute("download",fname);
      setDisabled(btn,false);
      btn.textContent="Tải xuống (.apk)";
    }else{
      btn.textContent="Chưa có tệp APK";
      setDisabled(btn,true);
    }

    change.textContent=(data.notes||"").split("\n").slice(0,12).join("\n")||"—";
    renderSig(data);
  }catch(e){
    if(btn){btn.textContent="Không tải được thông tin phát hành";setDisabled(btn,true);}
    if(change){change.textContent="Không thể kết nối tới nguồn phát hành. Vui lòng thử lại sau.";}
  }
}
document.addEventListener("DOMContentLoaded",loadLatest);
