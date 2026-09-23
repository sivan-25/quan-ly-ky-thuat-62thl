# ESTA FULL SOURCE SNAPSHOT

Snapshot date: 2026-09-24
Repository: sivan-25/quan-ly-ky-thuat-62thl
Branch: main

This file is generated as a handover snapshot. The live source files remain authoritative.


---

## FILE: index.html

SHA: 184f041874a5d5c03461169b4c723ae109411dd7

```html
<!doctype html><html lang="vi"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet"><title>ESTA | Property Management</title><link rel="stylesheet" href="style.css?v=20260924-0125">
<link rel="stylesheet" href="contractor.css?v=20260924-0140"><style id="esta-work-v11">
#app #workPage .workEntryCard{
  display:block!important;
  position:relative!important;
  width:100%!important;
  height:auto!important;
  min-height:0!important;
  max-height:none!important;
  margin:0 0 14px!important;
  padding:0!important;
  overflow:visible!important;
  border:1px solid #dfe7ec!important;
  border-radius:16px!important;
  background:#fff!important;
  box-shadow:0 8px 28px rgba(20,55,80,.055)!important;
}
#app #workPage .workEntryHeader{
  min-height:78px!important;
  display:flex!important;
  align-items:center!important;
  justify-content:space-between!important;
  gap:16px!important;
  padding:16px 18px!important;
  border-bottom:1px solid #edf1f4!important;
  background:linear-gradient(180deg,#fff 0%,#fbfdfe 100%)!important;
  border-radius:16px 16px 0 0!important;
}
#app #workPage .workEntryHeader>div:first-child>span{
  display:block!important;
  margin:0 0 4px!important;
  color:#9a7660!important;
  font-size:7px!important;
  font-weight:800!important;
  letter-spacing:1.5px!important;
}
#app #workPage .workEntryHeader h2{
  margin:0!important;
  color:#173b56!important;
  font-size:18px!important;
  line-height:1.2!important;
  font-weight:760!important;
}
#app #workPage .workEntryHeader p{
  margin:4px 0 0!important;
  color:#8295a2!important;
  font-size:9px!important;
  line-height:1.4!important;
}
#app #workPage .workEntryHeaderIcon{
  width:38px!important;height:38px!important;
  display:grid!important;place-items:center!important;flex:0 0 38px!important;
  border:1px solid #d7e5eb!important;border-radius:11px!important;
  background:#f2f8fa!important;color:#24738d!important;
}
#app #workPage .workEntryHeaderIcon svg{
  width:18px!important;height:18px!important;
  fill:none!important;stroke:currentColor!important;stroke-width:1.8!important;
  stroke-linecap:round!important;stroke-linejoin:round!important;
}

#app #workPage #taskForm.workEntryForm{
  display:grid!important;
  visibility:visible!important;
  opacity:1!important;
  position:relative!important;
  width:100%!important;
  height:auto!important;
  min-height:0!important;
  max-height:none!important;
  transform:none!important;
  grid-template-columns:130px minmax(260px,1.7fr) 130px 150px minmax(230px,1.25fr)!important;
  gap:12px!important;
  align-items:end!important;
  padding:16px 18px 18px!important;
  margin:0!important;
  overflow:visible!important;
}
#app #workPage #taskForm .workField{
  display:block!important;
  visibility:visible!important;
  opacity:1!important;
  position:relative!important;
  min-width:0!important;
  margin:0!important;
  padding:0!important;
  transform:none!important;
}
#app #workPage #taskForm .workField>span{
  display:block!important;
  margin:0 0 6px!important;
  color:#607889!important;
  font-size:8px!important;
  line-height:1.2!important;
  font-weight:720!important;
}
#app #workPage #taskForm .requiredField>span:after{
  content:" *"!important;color:#c86468!important;font-weight:800!important;
}
#app #workPage #taskForm input:not([type="hidden"]),
#app #workPage #taskForm select,
#app #workPage #taskForm .peopleSelectBtn{
  display:flex!important;
  width:100%!important;
  min-width:0!important;
  height:42px!important;
  min-height:42px!important;
  max-height:42px!important;
  margin:0!important;
  padding:0 10px!important;
  border:1px solid #d9e3e9!important;
  border-radius:9px!important;
  background:#f9fbfc!important;
  color:#25485f!important;
  font-size:10px!important;
  line-height:42px!important;
  outline:none!important;
  box-shadow:none!important;
}
#app #workPage #taskForm input:not([type="hidden"]):focus,
#app #workPage #taskForm select:focus{
  border-color:#55adc1!important;background:#fff!important;
  box-shadow:0 0 0 3px rgba(64,161,184,.08)!important;
}
#app #workPage #taskForm .workContent input{
  font-weight:650!important;color:#1e4058!important;
}
#app #workPage #taskForm .workPerformer .peopleSelectBtn{
  align-items:center!important;justify-content:space-between!important;line-height:normal!important;
  background:#f5faf7!important;border-color:#d6e6dc!important;
}
#app #workPage #taskForm .peopleSelect{position:relative!important;display:block!important;width:100%!important}
#app #workPage #taskForm .peopleSelectMenu{z-index:120!important}
#app #workPage #taskForm .workNote{grid-column:1/4!important}
#app #workPage #taskForm .workImage{grid-column:4/6!important}
#app #workPage #taskForm .imageNativeActions{
  display:flex!important;align-items:center!important;gap:7px!important;flex-wrap:nowrap!important;
}
#app #workPage #taskForm .nativeImageInput{display:none!important}
#app #workPage #taskForm .imageActionBtn{
  height:42px!important;
  display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:7px!important;
  padding:0 12px!important;
  border:1px solid #dbe5ea!important;border-radius:9px!important;
  background:#f8fafb!important;color:#46687b!important;
  font-size:8.5px!important;font-weight:700!important;box-shadow:none!important;
}
#app #workPage #taskForm .imageActionBtn svg{
  width:16px!important;height:16px!important;fill:none!important;stroke:currentColor!important;
  stroke-width:1.7!important;stroke-linecap:round!important;stroke-linejoin:round!important;
}
#app #workPage #taskForm .cameraBtn{
  border-color:#d0e8ee!important;background:#eef8fb!important;color:#237a92!important;
}
#app #workPage #taskForm .workFormActions{
  grid-column:1/-1!important;
  display:flex!important;justify-content:flex-end!important;align-items:center!important;gap:8px!important;
  padding-top:2px!important;
}
#app #workPage #taskForm .workSave{
  height:42px!important;min-width:145px!important;
  display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:7px!important;
  border:0!important;border-radius:9px!important;
  background:linear-gradient(135deg,#153f5c,#17627b)!important;color:#fff!important;
  font-size:9px!important;font-weight:780!important;
  box-shadow:0 8px 17px rgba(19,76,105,.13)!important;
}
#app #workPage #taskForm .workSave svg{
  width:15px!important;height:15px!important;fill:none!important;stroke:currentColor!important;
  stroke-width:1.8!important;stroke-linecap:round!important;stroke-linejoin:round!important;
}
#app #workPage #taskForm .workCancel{
  height:42px!important;min-width:82px!important;
  border:1px solid #dfe6ea!important;border-radius:9px!important;
  background:#fff!important;color:#6b8190!important;font-size:8.5px!important;font-weight:700!important;
}
#app #workPage #taskForm .workCancel.hide{display:none!important}
#app #workPage .workImageInfo{
  display:block!important;margin:-8px 18px 8px!important;
  color:#728795!important;font-size:8px!important;
}
#app #workPage .workPendingImages{
  display:flex!important;margin:0 18px 16px!important;
}

@media(max-width:1300px){
  #app #workPage #taskForm.workEntryForm{
    grid-template-columns:repeat(6,minmax(0,1fr))!important;
  }
  #app #workPage #taskForm .workDate{grid-column:span 2!important}
  #app #workPage #taskForm .workType{grid-column:span 2!important}
  #app #workPage #taskForm .workStatus{grid-column:span 2!important}
  #app #workPage #taskForm .workContent{grid-column:span 3!important}
  #app #workPage #taskForm .workPerformer{grid-column:span 3!important}
  #app #workPage #taskForm .workNote{grid-column:span 3!important}
  #app #workPage #taskForm .workImage{grid-column:span 3!important}
}
@media(max-width:760px){
  #app #workPage #taskForm.workEntryForm{
    grid-template-columns:1fr 1fr!important;
    gap:10px!important;padding:13px!important;
  }
  #app #workPage #taskForm .workDate,
  #app #workPage #taskForm .workType{grid-column:span 1!important}
  #app #workPage #taskForm .workStatus,
  #app #workPage #taskForm .workContent,
  #app #workPage #taskForm .workPerformer,
  #app #workPage #taskForm .workNote,
  #app #workPage #taskForm .workImage,
  #app #workPage #taskForm .workFormActions{grid-column:1/-1!important}
  #app #workPage #taskForm input:not([type="hidden"]),
  #app #workPage #taskForm select,
  #app #workPage #taskForm .peopleSelectBtn,
  #app #workPage #taskForm .imageActionBtn{height:46px!important;min-height:46px!important;max-height:46px!important}
  #app #workPage #taskForm .imageNativeActions{display:grid!important;grid-template-columns:1fr 1fr!important}
  #app #workPage #taskForm .workFormActions{display:grid!important;grid-template-columns:1fr!important}
  #app #workPage #taskForm .workSave,
  #app #workPage #taskForm .workCancel{width:100%!important;height:46px!important}
}

/* V11.1 — compact one-line desktop work form */
#app #workPage #taskForm .peopleOption{
  grid-template-columns:minmax(0,1fr) 22px!important;
}
#app #workPage #taskForm .selectedPersonChip{
  height:27px!important;
  max-width:118px!important;
  padding:0 8px!important;
}
#app #workPage #taskForm .selectedPersonChip b{
  max-width:100px!important;
  overflow:hidden!important;
  text-overflow:ellipsis!important;
  white-space:nowrap!important;
  font-size:7.5px!important;
}
#app #workPage .performerChips.pro>span{
  padding:0 8px!important;
}
#app #workPage .performerChips.pro>span b{
  max-width:95px!important;
}

@media(min-width:1020px){
  /* Always one row on normal desktop/laptop, even when browser/Windows scaling is 125–150%. */
  #app #workPage .workEntryHeader{
    min-height:62px!important;
    padding:11px 14px!important;
  }
  #app #workPage .workEntryHeader>div:first-child>span{
    margin-bottom:2px!important;
    font-size:6.2px!important;
  }
  #app #workPage .workEntryHeader h2{
    font-size:15px!important;
  }
  #app #workPage .workEntryHeader p{
    margin-top:2px!important;
    font-size:7.5px!important;
  }
  #app #workPage .workEntryHeaderIcon{
    width:32px!important;height:32px!important;flex-basis:32px!important;border-radius:9px!important;
  }

  #app #workPage #taskForm.workEntryForm{
    display:grid!important;
    grid-template-columns:
      82px
      minmax(140px,1.5fr)
      76px
      88px
      minmax(125px,1fr)
      92px
      118px
      58px!important;
    grid-auto-flow:column!important;
    grid-template-rows:auto!important;
    gap:6px!important;
    align-items:end!important;
    padding:11px 14px 13px!important;
    overflow:visible!important;
  }

  #app #workPage #taskForm .workDate,
  #app #workPage #taskForm .workContent,
  #app #workPage #taskForm .workType,
  #app #workPage #taskForm .workStatus,
  #app #workPage #taskForm .workPerformer,
  #app #workPage #taskForm .workNote,
  #app #workPage #taskForm .workImage,
  #app #workPage #taskForm .workFormActions{
    grid-column:auto!important;
    grid-row:1!important;
    min-width:0!important;
    width:auto!important;
    align-self:end!important;
  }

  #app #workPage #taskForm .workField>span{
    margin:0 0 4px!important;
    font-size:7px!important;
    line-height:1!important;
    white-space:nowrap!important;
  }

  #app #workPage #taskForm input:not([type="hidden"]),
  #app #workPage #taskForm select,
  #app #workPage #taskForm .peopleSelectBtn{
    height:36px!important;
    min-height:36px!important;
    max-height:36px!important;
    padding:0 7px!important;
    border-radius:8px!important;
    font-size:8.2px!important;
    line-height:36px!important;
  }

  #app #workPage #taskForm .workContent input{
    font-size:8.5px!important;
  }

  #app #workPage #taskForm .peopleSelectBtn{
    line-height:normal!important;
    overflow:hidden!important;
  }
  #app #workPage #taskForm .peopleButtonSummary{
    min-width:0!important;
    display:flex!important;
    flex-wrap:nowrap!important;
    gap:3px!important;
    overflow:hidden!important;
  }
  #app #workPage #taskForm .selectedPersonChip{
    max-width:68px!important;
    height:23px!important;
    padding:0 5px!important;
    border-radius:999px!important;
  }
  #app #workPage #taskForm .selectedPersonChip b{
    max-width:58px!important;
    font-size:6.7px!important;
  }
  #app #workPage #taskForm .selectedMore{
    height:22px!important;
    padding:0 5px!important;
    font-size:6px!important;
  }

  #app #workPage #taskForm .imageNativeActions{
    display:grid!important;
    grid-template-columns:1fr 1fr!important;
    gap:3px!important;
  }
  #app #workPage #taskForm .imageActionBtn{
    width:100%!important;
    min-width:0!important;
    height:36px!important;
    min-height:36px!important;
    max-height:36px!important;
    padding:0 3px!important;
    gap:2px!important;
    border-radius:8px!important;
    font-size:6.5px!important;
    white-space:nowrap!important;
  }
  #app #workPage #taskForm .imageActionBtn svg{
    width:11px!important;height:11px!important;flex:0 0 11px!important;
  }

  #app #workPage #taskForm .workFormActions{
    display:flex!important;
    align-items:end!important;
    justify-content:stretch!important;
    gap:3px!important;
    padding:0!important;
  }
  #app #workPage #taskForm .workSave{
    width:100%!important;
    min-width:0!important;
    height:36px!important;
    padding:0 4px!important;
    border-radius:8px!important;
    font-size:7.4px!important;
    gap:0!important;
  }
  #app #workPage #taskForm .workSave svg{display:none!important}
  #app #workPage #taskForm .workCancel{
    width:26px!important;
    min-width:26px!important;
    height:36px!important;
    padding:0!important;
    border-radius:8px!important;
    font-size:0!important;
  }
  #app #workPage #taskForm .workCancel:before{
    content:"×";
    font-size:13px;
    line-height:1;
  }

  #app #workPage .workImageInfo{
    margin:0 14px 5px!important;
    font-size:7px!important;
  }
  #app #workPage .workPendingImages{
    margin:0 14px 11px!important;
  }
}

/* V11.4 — readability tuning */
#app #workPage .workEntryHeader h2{
  font-size:17px!important;
}
#app #workPage .workEntryHeader p{
  font-size:9px!important;
}
#app #workPage #taskForm .workField>span{
  font-size:9.5px!important;
  font-weight:760!important;
  color:#536f82!important;
}
#app #workPage #taskForm input:not([type="hidden"]),
#app #workPage #taskForm select,
#app #workPage #taskForm .peopleSelectBtn{
  font-size:11.5px!important;
  font-weight:560!important;
  color:#24465e!important;
}
#app #workPage #taskForm .workContent input{
  font-size:12px!important;
  font-weight:680!important;
}
#app #workPage #taskForm .peopleButtonSummary>em{
  font-size:11px!important;
}
#app #workPage #taskForm .selectedPersonChip b{
  font-size:9.5px!important;
}
#app #workPage #taskForm .imageActionBtn{
  font-size:9px!important;
  font-weight:760!important;
}
#app #workPage #taskForm .workSave{
  font-size:9.5px!important;
}
#app #workPage .premiumTableCard th{
  height:40px!important;
  padding:0 10px!important;
  font-size:10.5px!important;
  line-height:1.2!important;
  letter-spacing:.2px!important;
}
#app #workPage .premiumTableCard td{
  padding:9px 10px!important;
  font-size:13px!important;
  line-height:1.4!important;
}
#app #workPage .taskContentCell>b{
  font-size:13.5px!important;
  line-height:1.35!important;
  font-weight:720!important;
}
#app #workPage .dateCell{
  font-size:12.5px!important;
}
#app #workPage .noteCell{
  font-size:12px!important;
}
#app #workPage .badge,
#app #workPage .typeBadge{
  font-size:10.5px!important;
  padding:5px 9px!important;
}
#app #workPage .performerChips.pro>span{
  min-height:28px!important;
  padding:0 9px!important;
}
#app #workPage .performerChips.pro>span b{
  max-width:120px!important;
  font-size:10px!important;
}
#app #workPage .performerChips.pro>em{
  font-size:9px!important;
}
#app #workPage .rowActionMenu summary{
  font-size:13px!important;
}
@media(min-width:1020px){
  #app #workPage #taskForm .workField>span{
    font-size:9px!important;
  }
  #app #workPage #taskForm input:not([type="hidden"]),
  #app #workPage #taskForm select,
  #app #workPage #taskForm .peopleSelectBtn{
    height:38px!important;
    min-height:38px!important;
    max-height:38px!important;
    line-height:38px!important;
    font-size:11px!important;
  }
  #app #workPage #taskForm .workContent input{
    font-size:11.5px!important;
  }
  #app #workPage #taskForm .imageActionBtn{
    height:38px!important;
    min-height:38px!important;
    max-height:38px!important;
    font-size:8.5px!important;
  }
  #app #workPage #taskForm .workSave,
  #app #workPage #taskForm .workCancel{
    height:38px!important;
  }
  #app #workPage #taskForm .workSave{
    font-size:9px!important;
  }
}

/* V11.5 — cân lại độ rộng cột và tăng chữ nhãn */
@media(min-width:1020px){
  #app #workPage #taskForm.workEntryForm{
    grid-template-columns:
      92px
      minmax(180px,320px)
      118px
      130px
      minmax(180px,1fr)
      minmax(130px,.72fr)
      150px
      70px!important;
    gap:7px!important;
  }

  #app #workPage #taskForm .workField>span{
    font-size:10.2px!important;
    font-weight:760!important;
    line-height:1.1!important;
    margin-bottom:5px!important;
  }

  #app #workPage #taskForm select{
    padding-left:9px!important;
    padding-right:26px!important;
    font-size:11px!important;
  }

  #app #workPage #taskForm .workContent input{
    width:100%!important;
    font-size:11.5px!important;
  }

  #app #workPage #taskForm .workType,
  #app #workPage #taskForm .workStatus{
    min-width:0!important;
  }
}
</style></head><body>
<div id="toast"></div><section id="login" class="loginRebuild loginV8">
  <div class="lv8Left">
    <div class="lv8LeftInner">
      <div class="lv8Brand">
        <div class="lv8Mark" aria-hidden="true"><i></i><i></i><i></i></div>
        <div><strong>ESTA</strong><small>BUILDING OPERATION MANAGEMENT SYSTEM</small></div>
      </div>
      <div class="lv8BrandLine">VẬN HÀNH HIỆU QUẢ · TÒA NHÀ BỀN VỮNG</div>

      <div class="lv8FormBlock">
        <span class="lv8Welcome">Chào mừng trở lại!</span>
        <h1>Đăng nhập hệ thống</h1>
        <p>Đăng nhập để truy cập hệ thống quản lý kỹ thuật.</p>

        <form id="loginForm" class="lv8Form">
          <label><span>Tên đăng nhập</span><div class="lv8Input"><b>♙</b><input id="user" required autocomplete="username" placeholder="Nhập tên đăng nhập"></div></label>
          <label><span>Mật khẩu</span><div class="lv8Input"><b>▣</b><input id="pass" type="password" required autocomplete="current-password" placeholder="Nhập mật khẩu"><button id="togglePassword" type="button" aria-label="Hiện mật khẩu">◉</button></div></label>
          <div class="lv8Options"><label><input type="checkbox" id="rememberLogin"><span>Ghi nhớ đăng nhập</span></label><button type="button" id="forgotPasswordBtn">Quên mật khẩu?</button></div>
          <button id="loginBtn" class="lv8LoginBtn" type="submit">Đăng nhập <b>→</b></button>
          <div id="loginError" class="loginError" aria-live="polite"></div>
          <div class="lv8Divider"><span>HOẶC</span></div>
          <button id="openAdminSetup" class="lv8AdminBtn" type="button">⚙ &nbsp; Truy cập chế độ quản trị</button>
        </form>
      </div>

      <div class="lv8LeftBottom">
        <div><b>ESTA</b><span>GIẢI PHÁP QUẢN LÝ KỸ THUẬT TOÀN DIỆN</span></div>
        <small>v2.0</small>
      </div>
    </div>
  </div>

  <div class="lv8Hero">
    <div class="lv8HeroShade"></div>
    <div class="lv8Top"><span>SMART BUILDING<br>BETTER TOMORROW</span><nav><b>HVAC</b><b>ĐIỆN</b><b>PCCC</b><b>CẤP THOÁT NƯỚC</b><b>BẢO TRÌ</b></nav></div>

    <div class="lv8HeroCopy">
      <span class="lv8Kicker">NỀN TẢNG QUẢN LÝ TÒA NHÀ THÔNG MINH</span>
      <h2>HỆ THỐNG QUẢN LÝ<br><em>VẬN HÀNH KỸ THUẬT</em></h2>
      <p>Quản lý công việc, thiết bị, năng lượng và báo cáo cho tòa nhà văn phòng trên một nền tảng duy nhất.</p>

      <div class="lv8Cards">
        <article><i>▣</i><div><b>CÔNG VIỆC</b><span>Theo dõi, phân công<br>và xử lý nhanh chóng</span></div></article>
        <article><i>▥</i><div><b>NĂNG LƯỢNG</b><span>Giám sát & tối ưu<br>hiệu suất sử dụng</span></div></article>
        <article><i>⚒</i><div><b>THIẾT BỊ</b><span>Quản lý bảo trì<br>tài sản kỹ thuật</span></div></article>
        <article><i>▤</i><div><b>BÁO CÁO</b><span>Dữ liệu trực quan<br>hỗ trợ ra quyết định</span></div></article>
      </div>
    </div>

    <div class="lv8Systems">
      <span>◉<b>HVAC</b></span><span>ϟ<b>ĐIỆN</b></span><span>◇<b>PCCC</b></span><span>◔<b>CẤP THOÁT NƯỚC</b></span><span>⚙<b>BẢO TRÌ</b></span>
    </div>
    <div class="lv8HeroSlogan">VẬN HÀNH AN TOÀN &nbsp; · &nbsp; TIẾT KIỆM NĂNG LƯỢNG &nbsp; · &nbsp; NÂNG CAO GIÁ TRỊ</div>
  </div>
</section>
<div id="app" class="hide">
<aside class="estaSidebar">
  <div class="brand estaSidebarBrand">
    <div class="estaPetalLogo" aria-hidden="true">
      <span></span><span></span><span></span><span></span><span></span><span></span>
    </div>
    <div><b>ESTA</b><small>PROPERTY MANAGEMENT</small></div>
  </div>

  <nav class="estaNav">
    <button id="navHome" class="active">
      <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
      <span>Tổng quan</span>
    </button>
    <button id="navAdmin" class="hide">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h16M6 20V9l6-4 6 4v11M9 13h2v2H9zM13 13h2v2h-2z"/></svg>
      <span>Dự án</span>
    </button>
    <button id="navWork">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5h6M9 3h6v4H9z"/><rect x="5" y="5" width="14" height="16" rx="2"/><path d="M8.5 11l1.5 1.5 3-3M8.5 16l1.5 1.5 3-3M14.5 11H17M14.5 16H17"/></svg>
      <span>Công việc</span>
    </button>
    <button id="navEnergy">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2 5.5 13H11l-1 9 8.5-12H13z"/></svg>
      <span>Năng lượng</span>
    </button>
    <button id="navInventory">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16v13H4zM7 4h10v3M8 11h3M13 11h3M8 15h8"/></svg>
      <span>Dụng cụ - Vật tư</span>
    </button>
    <button id="navMaintenance">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14.7 6.3 3-3 3 3-3 3M13.5 7.5 4 17v3h3l9.5-9.5M9 5H5v4M19 15v4h-4"/></svg>
      <span>Bảo trì thiết bị</span>
    </button>
    <button id="navContractor">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h16M6 20V8h12v12M9 8V5h6v3M9 12h2M13 12h2M9 16h6"/></svg>
      <span>Nhà thầu</span>
    </button>
  </nav>

  <div class="sideBackup">
    <button id="backupBtn" type="button">
      <svg viewBox="0 0 24 24"><path d="M12 3v12M8 11l4 4 4-4M5 21h14"/></svg><span>Sao lưu</span>
    </button>
    <button id="restoreBtn" type="button">
      <svg viewBox="0 0 24 24"><path d="M12 21V9M8 13l4-4 4 4M5 3h14"/></svg><span>Khôi phục</span>
    </button>
    <input id="restoreFile" type="file" accept="application/json,.json" hidden>
  </div>

  <div class="sideBottom">
    <div class="sideUserCard"><div id="sideAvatar" class="sideAvatar">E</div><span id="sideUser"></span></div>
    <button id="logout" class="sideLogout" title="Đăng xuất">
      <svg viewBox="0 0 24 24"><path d="M10 5H5v14h5M14 8l4 4-4 4M8 12h10"/></svg>
    </button>
  </div>
</aside>

<main>
<header class="estaTopbar">
  <button id="menu" class="mobileMenuBtn">☰</button>
  <div id="topHomeTitle" class="topModuleTitle">
    <div class="topModuleIcon homeIcon"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg></div>
    <div><h1>Tổng quan vận hành</h1><p class="buildingNameText">Dự án</p></div>
  </div>
  <div id="topAdminTitle" class="topModuleTitle hide">
    <div class="topModuleIcon"><svg viewBox="0 0 24 24"><path d="M4 20h16M6 20V9l6-4 6 4v11M9 13h2v2H9zM13 13h2v2h-2z"/></svg></div>
    <div><h1>Quản trị dự án</h1><p>Tổng hợp các dự án ESTA</p></div>
  </div>
  <div id="topWorkTitle" class="topModuleTitle hide">
    <div class="topModuleIcon"><svg viewBox="0 0 24 24"><path d="M9 5h6M9 3h6v4H9z"/><rect x="5" y="5" width="14" height="16" rx="2"/><path d="M8.5 11l1.5 1.5 3-3M14.5 11H17"/></svg></div>
    <div><h1>Công việc kỹ thuật</h1><p>Quản lý công việc hằng ngày</p></div>
  </div>
  <div id="topEnergyTitle" class="topModuleTitle hide">
    <div class="topModuleIcon"><svg viewBox="0 0 24 24"><path d="M13 2 5.5 13H11l-1 9 8.5-12H13z"/></svg></div>
    <div><h1>Năng lượng</h1><p>Theo dõi điện, nước và điện mặt trời</p></div>
  </div>
  <div id="topInventoryTitle" class="topModuleTitle hide">
    <div class="topModuleIcon inventoryTopIcon"><svg viewBox="0 0 24 24"><path d="M4 7h16v13H4zM7 4h10v3M8 11h3M13 11h3M8 15h8"/></svg></div>
    <div><h1>Dụng cụ - Vật tư</h1><p>Quản lý tồn kho và dụng cụ kỹ thuật</p></div>
  </div>
  <div id="topMaintenanceTitle" class="topModuleTitle hide">
    <div class="topModuleIcon maintenanceTopIcon"><svg viewBox="0 0 24 24"><path d="m14.7 6.3 3-3 3 3-3 3M13.5 7.5 4 17v3h3l9.5-9.5"/></svg></div>
    <div><h1>Bảo trì thiết bị</h1><p>Kế hoạch, lịch sử và nhắc hạn bảo trì</p></div>
  </div>
  <div id="topContractorTitle" class="topModuleTitle contractorTopTitle hide">
    <div class="topModuleIcon contractorTopIcon"><svg viewBox="0 0 24 24"><path d="M4 20h16M6 20V8h12v12M9 8V5h6v3M9 12h2M13 12h2M9 16h6"/></svg></div>
    <div><h1>Nhà thầu</h1><p class="buildingNameText">Dự án</p></div>
  </div>

  <div class="headerTools">
    <div class="inventoryHeaderControls">
        <div class="inventoryTabs">
        <button class="active" type="button" data-inventory-tab="materials">
          <svg viewBox="0 0 24 24"><path d="M4 7h16v13H4zM7 4h10v3M8 11h8M8 15h5"/></svg>
          <span>Vật tư tiêu hao</span>
        </button>
        <button type="button" data-inventory-tab="tools">
          <svg viewBox="0 0 24 24"><path d="m14 6 4-4 4 4-4 4M13 7 4 16v4h4l9-9M5 15l4 4"/></svg>
          <span>Dụng cụ kỹ thuật</span>
        </button>
        </div>
        <div class="inventoryContext">
          <span class="inventoryContextProject"><small>DỰ ÁN</small><b class="buildingNameText">Dự án</b></span>
          <label class="inventoryYearControl"><small>NĂM</small><select id="inventoryYear"></select></label>
        </div>
      </div>
    <div class="headerSearch">
      <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>
      <input id="globalSearch" placeholder="Tìm công việc...">
    </div>
    <div class="filterWrap">
      <button id="toggleFilter" class="iconAction" type="button" title="Bộ lọc"><svg viewBox="0 0 24 24"><path d="M4 5h16M7 12h10M10 19h4"/></svg></button>
      <div id="filterBar" class="filterBar filterPopover hide"><select id="quickRange"><option value="">Khoảng thời gian</option><option value="today">Hôm nay</option><option value="week">Tuần này</option><option value="month">Tháng này</option></select><select id="filterType"><option value="">Tất cả loại</option><option>Hằng ngày</option><option>Bảo trì</option><option>Sự cố</option></select><select id="filterStatus"><option value="">Tất cả trạng thái</option><option>Đã hoàn thành</option><option>Đang thực hiện</option><option>Chờ xử lý</option></select><label>Từ ngày<input id="fromDate" type="date"></label><label>Đến ngày<input id="toDate" type="date"></label><button id="clear" class="clearFilter" type="button">Xóa lọc</button></div>
    </div>
    <button id="exportBtn" class="pdfAction" type="button" title="Xuất PDF"><b>PDF</b><span>⇩</span></button>
    <button class="headerBell" type="button" title="Thông báo"><svg viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></svg><i></i></button>
  </div>
  <div class="account">
    <div id="headerAvatar" class="headerAvatar">E</div>
    <div><span id="headerRole"></span></div>
  </div>
</header>

<div id="homePage" class="page homeDashboard">
  <section class="homeWelcome">
    <div class="homeWelcomeCopy">
      <span class="homeEyebrow">ESTA · PROPERTY MANAGEMENT</span>
      <h1>Tổng quan vận hành</h1>
      <div class="homeSystemState"><i></i><span>Hệ thống hoạt động bình thường</span><small id="homeUpdatedAt">Cập nhật vừa xong</small></div>
    </div>
    <div class="homeBlueprint" aria-hidden="true">
      <svg viewBox="0 0 300 150"><path d="M18 132h265M48 132V64l40-26v94M88 132V28l56-18v122M144 132V49l62-21v104M206 132V72l48-13v73M61 78h14M61 95h14M61 112h14M105 42h18M105 62h18M105 82h18M105 102h18M162 61h22M162 82h22M162 103h22M220 84h18M220 103h18"/></svg>
      <span>ESTA</span>
    </div>
  </section>

  <section class="homeKpis">
    <article class="kpiCard kpiBlue"><div class="kpiIcon"><svg viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16M8 14h3M8 17h5"/></svg></div><div><small>CÔNG VIỆC HÔM NAY</small><strong id="homeToday">0</strong><span>Trong ngày hiện tại</span></div></article>
    <article class="kpiCard kpiAmber"><div class="kpiIcon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></div><div><small>ĐANG THỰC HIỆN</small><strong id="homeDoing">0</strong><span>Cần tiếp tục xử lý</span></div></article>
    <article class="kpiCard kpiGreen"><div class="kpiIcon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/></svg></div><div><small>HOÀN THÀNH</small><strong id="homeDone">0</strong><span>Đã xử lý xong</span></div></article>
    <article class="kpiCard kpiRed"><div class="kpiIcon"><svg viewBox="0 0 24 24"><path d="M12 8v5M12 17h.01"/><circle cx="12" cy="12" r="9"/></svg></div><div><small>CHỜ XỬ LÝ</small><strong id="homeWait">0</strong><span>Cần theo dõi</span></div></article>
  </section>

  <section id="homeAdminProjects" class="homePanel homeAdminProjects hide">
    <div class="homePanelHead"><div><span class="panelKicker">DỰ ÁN</span><h2>Dự án đang quản lý</h2><p>Truy cập nhanh vào từng tòa nhà.</p></div><button id="homeOpenProjects" type="button">Quản lý dự án →</button></div>
    <div id="homeProjectGrid" class="homeProjectGrid"></div>
  </section>

  <section class="homeMainGrid">
    <div class="homePanel recentPanel">
      <div class="homePanelHead"><div><span class="panelKicker">CÔNG VIỆC</span><h2>Công việc gần đây</h2><p>Các đầu việc mới nhất của dự án.</p></div><button id="homeViewAllTasks" type="button">Xem tất cả →</button></div>
      <div id="homeRecentTasks" class="homeRecentTasks"></div>
    </div>

    <div class="homePanel energyPanel">
      <div class="homePanelHead"><div><span class="panelKicker">NĂNG LƯỢNG</span><h2>Năng lượng tháng này</h2><p>Tổng hợp nhanh chỉ số tiêu thụ.</p></div><button id="homeOpenEnergy" type="button">Chi tiết →</button></div>
      <div class="homeEnergyList">
        <article><div class="energyMiniIcon electric"><svg viewBox="0 0 24 24"><path d="M13 2 5.5 13H11l-1 9 8.5-12H13z"/></svg></div><div><span>Điện</span><strong id="homeElectric">—</strong><small>kWh tiêu thụ</small></div></article>
        <article><div class="energyMiniIcon water"><svg viewBox="0 0 24 24"><path d="M12 3s6 6.2 6 11a6 6 0 0 1-12 0c0-4.8 6-11 6-11z"/></svg></div><div><span>Nước</span><strong id="homeWater">—</strong><small>m³ tiêu thụ</small></div></article>
        <article><div class="energyMiniIcon solar"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1"/></svg></div><div><span>Solar</span><strong id="homeSolar">—</strong><small>kWh sản lượng</small></div></article>
      </div>
    </div>
  </section>

  <section class="homeBottomGrid">
    <div class="homePanel quickPanel">
      <div class="homePanelHead"><div><span class="panelKicker">TRUY CẬP NHANH</span><h2>Thao tác thường dùng</h2></div></div>
      <div class="quickActions">
        <button id="quickAddTask"><span class="quickIcon blue"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></span><div><b>Thêm công việc</b><small>Ghi nhận công việc kỹ thuật</small></div><i>→</i></button>
        <button id="quickElectric"><span class="quickIcon cyan"><svg viewBox="0 0 24 24"><path d="M13 2 5.5 13H11l-1 9 8.5-12H13z"/></svg></span><div><b>Ghi chỉ số điện</b><small>Cập nhật kWh mới nhất</small></div><i>→</i></button>
        <button id="quickWater"><span class="quickIcon aqua"><svg viewBox="0 0 24 24"><path d="M12 3s6 6.2 6 11a6 6 0 0 1-12 0c0-4.8 6-11 6-11z"/></svg></span><div><b>Ghi chỉ số nước</b><small>Cập nhật m³ mới nhất</small></div><i>→</i></button>
        <button id="quickReport"><span class="quickIcon bronze"><svg viewBox="0 0 24 24"><path d="M6 3h9l3 3v15H6zM9 10h6M9 14h6M9 18h4"/></svg></span><div><b>Xuất báo cáo</b><small>Tổng hợp dữ liệu vận hành</small></div><i>→</i></button>
      </div>
    </div>

    <div class="homePanel activityPanel">
      <div class="homePanelHead"><div><span class="panelKicker">HOẠT ĐỘNG</span><h2>Hoạt động gần đây</h2></div></div>
      <div id="homeActivity" class="homeActivity"></div>
    </div>
  </section>
</div>
<div id="adminPage" class="page modulePage hide">
  <section class="adminHero">
    <div><span class="adminEyebrow">ESTA · CENTRAL ADMIN</span><h1>Quản trị dự án</h1><p>Quản lý tài khoản và truy cập từng dự án.</p></div>
    <div class="adminConnectionWrap"><div id="adminConnection" class="adminConnection warn">Chưa kết nối tài khoản Admin trung tâm</div><button id="adminActivateCentral" class="secondary small" type="button">Kích hoạt Admin trung tâm</button></div>
  </section>

  <section class="adminSection">
    <div class="adminSectionHead"><div><h2>Dự án</h2><p>Chọn một dự án để mở giao diện vận hành tương ứng.</p></div><div class="adminProjectHeadActions"><span id="adminProjectCount">0 dự án</span><button id="adminSettingsBtn" class="settingsGearBtn" type="button" title="Cài đặt">⚙ <span>Cài đặt</span></button></div></div>
    <div id="adminProjectGrid" class="adminProjectGrid"></div>
  </section>

</div>
<div id="workHero" class="heroStrip hide"></div><div id="workPage" class="page modulePage proModulePage"><section class="pageHead proPageHead"><div class="headIcon"><svg viewBox="0 0 24 24"><path d="M9 5h6M9 3h6v4H9z"/><rect x="5" y="5" width="14" height="16" rx="2"/><path d="M8.5 11l1.5 1.5 3-3M14.5 11H17M8.5 16l1.5 1.5 3-3M14.5 16H17"/></svg></div><div><span class="pageEyebrow">WORK ORDER MANAGEMENT</span><h1>Công việc kỹ thuật</h1><p>Quản lý, phân công và theo dõi công việc vận hành hằng ngày.</p></div><div class="headMeta"><span><i></i> Ngày: <b id="today"></b></span><span><i></i> Tòa nhà: <b class="buildingNameText">62 Trần Huy Liệu</b></span></div></section>

<section class="workEntryCard">
  <div class="workEntryHeader">
    <div>
      <span>ESTA · WORK ORDER</span>
      <h2 id="workEntryTitle">Thêm công việc</h2>
      <p>Ghi nhận công việc kỹ thuật và phân công người thực hiện.</p>
    </div>
    <div class="workEntryHeaderIcon" aria-hidden="true">
      <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
    </div>
  </div>

  <form id="taskForm" class="workEntryForm">
    <input id="editId" type="hidden">

    <label class="workField workDate requiredField">
      <span>Ngày</span>
      <input id="date" type="date" required>
    </label>

    <label class="workField workContent requiredField">
      <span>Nội dung</span>
      <input id="content" required placeholder="Nhập nội dung công việc...">
    </label>

    <label class="workField workType requiredField">
      <span>Loại</span>
      <select id="type">
        <option>Hằng ngày</option>
        <option>Bảo trì</option>
        <option>Sự cố</option>
      </select>
    </label>

    <label class="workField workStatus requiredField">
      <span>Trạng thái</span>
      <select id="status">
        <option>Đã hoàn thành</option>
        <option selected>Đang thực hiện</option>
        <option>Chờ xử lý</option>
      </select>
    </label>

    <label class="workField workPerformer requiredField">
      <span>Người thực hiện</span>
      <div class="peopleSelect" data-people-kind="task">
        <input id="performer" type="hidden">
        <button id="taskPeopleButton" class="peopleSelectBtn" type="button">
          <span>Chọn người thực hiện</span><b>⌄</b>
        </button>
        <div id="taskPeopleMenu" class="peopleSelectMenu hide">
          <div id="taskPeopleOptions" class="peopleOptions"></div>
          <button class="peopleEditBtn" type="button" data-people-edit>✎ Chỉnh sửa danh sách</button>
        </div>
      </div>
    </label>

    <label class="workField workNote">
      <span>Ghi chú</span>
      <input id="note" placeholder="Nhập ghi chú...">
    </label>

    <label class="workField workImage">
      <span>Hình ảnh</span>
      <div class="imageNativeActions">
        <input id="images" class="nativeImageInput" type="file" accept="image/*" multiple>
        <input id="cameraNativeInput" class="nativeImageInput" type="file" accept="image/*" capture="environment">
        <button id="openNativeCamera" type="button" class="imageActionBtn cameraBtn">
          <svg viewBox="0 0 24 24"><path d="M4 8h4l2-3h4l2 3h4v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>
          <span>Chụp</span>
        </button>
        <button id="openNativeLibrary" type="button" class="imageActionBtn libraryBtn">
          <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m5 18 5-5 3 3 2-2 4 4"/></svg>
          <span>Chọn</span>
        </button>
      </div>
    </label>

    <div class="workFormActions">
      <button id="cancelEdit" type="button" class="workCancel hide">Hủy</button>
      <button id="saveBtn" class="workSave" type="submit">
        <svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        <span>Lưu</span>
      </button>
    </div>
  </form>

  <div id="imageInfo" class="workImageInfo"></div>
  <div id="pendingImagePreview" class="pendingImagePreview workPendingImages"></div>
</section>

<input id="search" type="hidden">


<section class="stats"><article><i class="blue"><svg viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16M8 14h3M8 17h5"/></svg></i><div><small>CÔNG VIỆC HÔM NAY</small><strong id="statToday">0</strong></div></article><article><i class="orange"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></i><div><small>ĐANG XỬ LÝ</small><strong id="statDoing">0</strong></div></article><article><i class="green"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/></svg></i><div><small>HOÀN THÀNH</small><strong id="statDone">0</strong></div></article><article><i class="red"><svg viewBox="0 0 24 24"><path d="M12 8v5M12 17h.01"/><circle cx="12" cy="12" r="9"/></svg></i><div><small>CHỜ XỬ LÝ</small><strong id="statWait">0</strong></div></article></section>
<section class="tableCard premiumTableCard"><div class="tableTop"><div><b>Danh sách công việc kỹ thuật</b> <span id="count"></span></div></div><div class="desktopTable"><table><thead><tr><th>STT</th><th>Nội dung công việc</th><th>Loại</th><th>Trạng thái</th><th>Ngày</th><th>Người thực hiện</th><th>Hình ảnh</th><th>Ghi chú</th><th>Thao tác</th></tr></thead><tbody id="tbody"></tbody></table></div><div id="mobileCards"></div><div id="empty" class="empty hide">Chưa có công việc phù hợp.</div></section>
</div>
<div id="energyHero" class="heroStrip hide"></div>
<div id="energyPage" class="page modulePage proModulePage hide">
  <section class="pageHead proPageHead energyHead">
    <div class="headIcon energyIcon"><svg viewBox="0 0 24 24"><path d="M13 2 5.5 13H11l-1 9 8.5-12H13z"/></svg></div>
    <div><span class="pageEyebrow">ENERGY MANAGEMENT</span><h1>Năng lượng</h1><p>Ghi chỉ số, theo dõi tiêu thụ và kiểm soát dữ liệu năng lượng tòa nhà.</p></div>
    <div class="headMeta"><span><i></i> Ngày: <b id="energyToday"></b></span><span><i></i> Tòa nhà: <b class="buildingNameText">62 Trần Huy Liệu</b></span></div>
  </section>

  <section class="energyTabs" aria-label="Loại chỉ số">
    <button class="active" data-energy-type="electric"><svg viewBox="0 0 24 24"><path d="M13 2 5.5 13H11l-1 9 8.5-12H13z"/></svg><span>Chỉ số điện</span></button>
    <button data-energy-type="water"><svg viewBox="0 0 24 24"><path d="M12 3s6 6.2 6 11a6 6 0 0 1-12 0c0-4.8 6-11 6-11z"/></svg><span>Chỉ số nước</span></button>
    <button data-energy-type="solar"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1"/></svg><span>Năng lượng mặt trời</span></button>
  </section>

  <section class="energyCard premiumFormCard">
    <div class="formSectionHead energyCardTitle"><div><span>ESTA · METER READING</span><h2 id="energyFormTitle">Ghi chỉ số điện</h2><p id="energyUnitHint">Đơn vị: kWh</p></div><div class="formSectionMark energyMark"><svg viewBox="0 0 24 24"><path d="M13 2 5.5 13H11l-1 9 8.5-12H13z"/></svg></div></div>
    <form id="energyForm" class="energyForm">
      <input id="energyEditId" type="hidden">
      <label><span>Ngày ghi</span><input id="energyDate" type="date" required></label>
      <label><span id="energyValueLabel">Chỉ số điện (kWh)</span><input id="energyValue" type="number" step="0.01" min="0" required placeholder="Nhập chỉ số"></label>
      <label class="energyImageField"><span>Hình ảnh đồng hồ</span><input id="energyImage" type="file" accept="image/*"></label>
      <label class="energyPerformerField"><span>Người thực hiện</span><div class="peopleSelect" data-people-kind="energy"><input id="energyPerformer" type="hidden"><button id="energyPeopleButton" class="peopleSelectBtn" type="button"><span>Chọn người thực hiện</span><b>⌄</b></button><div id="energyPeopleMenu" class="peopleSelectMenu hide"><div id="energyPeopleOptions" class="peopleOptions"></div><button class="peopleEditBtn" type="button" data-people-edit>✎ Chỉnh sửa danh sách</button></div></div></label>
      <label class="energyNoteField"><span>Ghi chú</span><input id="energyNote" maxlength="500" placeholder="Nhập ghi chú..."></label>
      <div class="energyActions"><button id="energySaveBtn" class="primary" type="submit">Lưu</button><button id="energyCancelEdit" type="button" class="secondary hide">Hủy</button></div>
    </form>
    <div id="energyImagePreview" class="energyImagePreview"></div>
  </section>

  <section class="energyTableCard premiumTableCard">
    <div class="energyTableTop">
      <div class="energyTitleBlock"><div class="energyTitleLine"><h2 id="energyTableTitle">Bảng theo dõi chỉ số điện</h2><div id="energyTotalInline" class="energyTotalInline"><span>Tổng tiêu thụ</span><strong>—</strong></div></div><p id="energySummaryText">Theo dõi lịch sử chỉ số và mức tiêu thụ theo ngày.</p></div>
      <div class="energyTopTools">
        <div class="energyFilters">
          <span class="filterLabel">Lọc</span>
          <div class="rangeButtons"><button data-erange="today">Hôm nay</button><button data-erange="week">Tuần</button><button data-erange="month">Tháng</button><button data-erange="all" class="active">Tất cả</button></div>
          <label>Từ<input id="energyFromDate" type="date"></label>
          <label>Đến<input id="energyToDate" type="date"></label>
          <button id="energyApplyFilter" class="primary small" type="button">Áp dụng</button>
          <button id="energyClearFilter" class="secondary small" type="button">Xóa</button>
        </div>
        <button id="energyExportPdf" class="pdfAction" type="button"><b>PDF</b> ⇩ Xuất PDF</button>
      </div>
    </div>
    <div class="energySummaryCards">
      <article><small>BẢN GHI</small><strong id="energyRecordCount">0</strong></article>
      <article><small>CHỈ SỐ MỚI NHẤT</small><strong id="energyLatestValue">—</strong></article>
      <article><small>TIÊU THỤ KỲ LỌC</small><strong id="energyPeriodUse">—</strong></article>
    </div>
    <div class="desktopTable energyDesktopTable">
      <table><thead><tr><th>Ngày</th><th>Thứ</th><th id="energyValueColumn">Chỉ số (kWh)</th><th>Chênh lệch</th><th>Người thực hiện</th><th>Hình ảnh</th><th>Ghi chú</th><th>Thao tác</th></tr></thead><tbody id="energyTbody"></tbody></table>
    </div>
    <div id="energyMobileCards"></div>
    <div id="energyEmpty" class="empty hide">Chưa có dữ liệu chỉ số.</div>
    <div class="energyLegend"><span>■ Chủ nhật</span><span>Chênh lệch = chỉ số hiện tại − chỉ số lần trước</span></div>
  </section>
</div>
<div id="inventoryPage" class="page inventoryPage hide">
  

  <section id="inventoryMaterialsPane" class="inventoryPane inventoryWorkspace">
    <div class="inventoryToolbar">
      <div>
        <span class="inventoryKicker">VẬT TƯ TIÊU HAO</span>
        <h2>Nhập - xuất - tồn vật tư tiêu hao <span id="materialTitleCount">(0 mục)</span></h2>
        <p>Theo dõi tồn đầu, nhập, xuất và tồn cuối theo từng tháng trong năm.</p>
      </div>
      <div class="inventoryToolbarActions">
        <div class="inventorySearch"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg><input id="materialSearch" placeholder="Tìm tên vật tư..."></div>
        <button id="materialExportPdf" class="inventorySecondary" type="button">PDF ⇩</button>
        <button id="openStockTxn" class="inventorySecondary" type="button">⇄ Nhập / Xuất</button>
        <button id="addMaterialBtn" class="inventoryPrimary" type="button">＋ Thêm vật tư</button>
      </div>
    </div>

    <div id="materialMonthTabs" class="materialMonthTabs">
      <button type="button" data-material-month="1">Th01</button>
      <button type="button" data-material-month="2">Th02</button>
      <button type="button" data-material-month="3">Th03</button>
      <button type="button" data-material-month="4">Th04</button>
      <button type="button" data-material-month="5">Th05</button>
      <button type="button" data-material-month="6">Th06</button>
      <button type="button" data-material-month="7">Th07</button>
      <button type="button" data-material-month="8">Th08</button>
      <button type="button" data-material-month="9">Th09</button>
      <button type="button" data-material-month="10">Th10</button>
      <button type="button" data-material-month="11">Th11</button>
      <button type="button" data-material-month="12">Th12</button>
    </div>

    <div class="materialPeriodSummary">
      <div class="materialPeriodCurrent">
        <span>THÁNG ĐANG XEM</span>
        <strong id="materialSelectedMonth">Tháng 01 / 2026</strong>
      </div>
      <div class="materialPeriodFormula">
        <span>Tồn cuối kỳ</span>
        <b>=</b>
        <span>Tồn đầu kỳ</span>
        <b>+</b>
        <span>Nhập</span>
        <b>−</b>
        <span>Xuất</span>
      </div>
    </div>

    <div class="inventoryStats monthlyStats">
      <article><span class="invStatIcon green"><svg viewBox="0 0 24 24"><path d="M12 19V5M7 10l5-5 5 5"/></svg></span><div><small>TỔNG NHẬP THÁNG</small><b id="materialMonthIn">0</b><em>Phát sinh trong tháng</em></div></article>
      <article><span class="invStatIcon amber"><svg viewBox="0 0 24 24"><path d="M12 5v14M7 14l5 5 5-5"/></svg></span><div><small>TỔNG XUẤT THÁNG</small><b id="materialMonthOut">0</b><em>Đã sử dụng trong tháng</em></div></article>
      <article><span class="invStatIcon blue"><svg viewBox="0 0 24 24"><path d="M4 7h16v13H4zM7 4h10v3M8 11h8M8 15h5"/></svg></span><div><small>MẶT HÀNG CÒN TỒN</small><b id="materialInStockCount">0</b><em>Tồn cuối tháng &gt; 0</em></div></article>
      <article><span class="invStatIcon red"><svg viewBox="0 0 24 24"><path d="M12 8v5M12 17h.01"/><circle cx="12" cy="12" r="9"/></svg></span><div><small>SẮP HẾT</small><b id="materialLowStock">0</b><em>Theo mức tồn tối thiểu</em></div></article>
    </div>

    <section id="stockAlertPanel" class="stockAlertPanel">
      <div class="stockAlertHead">
        <div class="stockAlertTitle">
          <span class="stockAlertIcon" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M12 3 2.8 19h18.4L12 3z"/><path d="M12 9v4M12 17h.01"/></svg>
          </span>
          <div>
            <span class="inventoryKicker">CẢNH BÁO TỒN KHO</span>
            <h3>Vật tư cần bổ sung <b id="stockAlertCount">0</b></h3>
            <p>Hệ thống tự cảnh báo khi tồn hiện tại bằng hoặc thấp hơn mức tồn tối thiểu đã thiết lập.</p>
          </div>
        </div>
        <button id="stockAlertOnly" class="stockAlertFilterBtn" type="button">Chỉ xem cảnh báo</button>
      </div>
      <div id="stockAlertList" class="stockAlertList"></div>
    </section>

    <div class="inventoryExamples">
      <span>Gợi ý vật tư:</span>
      <button type="button" data-material-sample="Băng keo điện 3M|Cuộn">Băng keo điện 3M</button>
      <button type="button" data-material-sample="Đèn LED âm trần 12W|Cái">Đèn LED âm trần 12W</button>
      <button type="button" data-material-sample="Dây rút nhựa 200mm|Bịch">Dây rút nhựa</button>
      <button type="button" data-material-sample="Cầu chì 10A|Cái">Cầu chì 10A</button>
      <button type="button" data-material-sample="Đầu cos điện|Bịch">Đầu cos điện</button>
    </div>

    <div class="inventoryTableCard materialMonthlyCard">
      <div class="inventoryTableHint"><span>BẢNG CHI TIẾT</span><b id="materialMonthLabel">Tháng 01 / 2026</b></div>
      <div class="inventoryTableScroll">
        <table class="materialMonthlyTable">
          <colgroup>
            <col class="col-stt"><col class="col-name"><col class="col-unit"><col class="col-open">
            <col class="col-in"><col class="col-out"><col class="col-close"><col class="col-actions">
          </colgroup>
          <thead>
            <tr><th>STT</th><th>Tên vật tư</th><th>ĐVT</th><th>Tồn đầu kỳ</th><th>Nhập</th><th>Xuất</th><th>Tồn cuối kỳ</th><th>Thao tác</th></tr>
          </thead>
          <tbody id="materialMatrixBody"></tbody>
        </table>
      </div>
      <div id="materialEmpty" class="inventoryEmpty hide">Chưa có vật tư. Anh có thể chọn một gợi ý phía trên hoặc bấm “Thêm vật tư”.</div>
    </div>

    <div class="inventoryTableCard transactionCard">
      <div class="inventorySectionHead">
        <div><span class="inventoryKicker">LỊCH SỬ KHO</span><h3>Nhập / xuất trong tháng</h3><p id="materialTxnSubtitle">Theo dõi các lần phát sinh vật tư của tháng đang chọn.</p></div>
      </div>
      <div class="inventoryTableScroll">
        <table class="transactionTable">
          <colgroup>
            <col class="col-date"><col class="col-material"><col class="col-type"><col class="col-qty">
            <col class="col-person"><col class="col-note"><col class="col-actions">
          </colgroup>
          <thead><tr><th>Ngày</th><th>Vật tư</th><th>Loại</th><th>Số lượng</th><th>Người thực hiện</th><th>Ghi chú</th><th>Thao tác</th></tr></thead>
          <tbody id="materialTxnBody"></tbody>
        </table>
      </div>
      <div id="materialTxnEmpty" class="inventoryEmpty hide">Chưa có giao dịch nhập / xuất trong tháng này.</div>
    </div>
  </section>

  <section id="inventoryToolsPane" class="inventoryPane inventoryWorkspace hide">
    <div class="inventoryToolbar">
      <div>
        <span class="inventoryKicker">DỤNG CỤ KỸ THUẬT</span>
        <h2>Danh mục dụng cụ và thiết bị cầm tay</h2>
        <p>Lưu số lượng, tình trạng, vị trí và người phụ trách của từng dụng cụ.</p>
      </div>
      <div class="inventoryToolbarActions">
        <div class="inventorySearch"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg><input id="toolSearch" placeholder="Tìm dụng cụ..."></div>
        <button id="toolExportPdf" class="inventorySecondary" type="button">PDF ⇩</button>
        <button id="addToolBtn" class="inventoryPrimary" type="button">＋ Thêm dụng cụ</button>
      </div>
    </div>

    <div class="inventoryStats toolsStats">
      <article><span class="invStatIcon blue"><svg viewBox="0 0 24 24"><path d="m14 6 4-4 4 4-4 4M13 7 4 16v4h4l9-9"/></svg></span><div><small>DỤNG CỤ</small><b id="toolCount">0</b><em>Danh mục</em></div></article>
      <article><span class="invStatIcon green"><svg viewBox="0 0 24 24"><path d="m7 12 3 3 7-7"/><circle cx="12" cy="12" r="9"/></svg></span><div><small>TÌNH TRẠNG TỐT</small><b id="toolGoodCount">0</b><em>Sẵn sàng sử dụng</em></div></article>
      <article><span class="invStatIcon amber"><svg viewBox="0 0 24 24"><path d="M12 8v4M12 16h.01"/><circle cx="12" cy="12" r="9"/></svg></span><div><small>CẦN KIỂM TRA</small><b id="toolRepairCount">0</b><em>Cần sửa / hỏng</em></div></article>
    </div>

    <div class="inventoryExamples">
      <span>Gợi ý dụng cụ:</span>
      <button type="button" data-tool-sample="Đồng hồ vạn năng|Cái">Đồng hồ vạn năng</button>
      <button type="button" data-tool-sample="Ampe kìm|Cái">Ampe kìm</button>
      <button type="button" data-tool-sample="Máy khoan pin|Bộ">Máy khoan pin</button>
      <button type="button" data-tool-sample="Thang nhôm chữ A|Cái">Thang nhôm</button>
      <button type="button" data-tool-sample="Máy đo nhiệt độ laser|Cái">Máy đo nhiệt độ laser</button>
    </div>

    <div class="inventoryTableCard">
      <div class="inventoryTableScroll">
        <table class="toolsTable">
          <colgroup>
            <col class="tool-col-stt"><col class="tool-col-name"><col class="tool-col-brand"><col class="tool-col-qty">
            <col class="tool-col-location"><col class="tool-col-status"><col class="tool-col-note"><col class="tool-col-actions">
          </colgroup>
          <thead><tr><th>STT</th><th>Tên dụng cụ</th><th>Nhãn hiệu</th><th>Số lượng</th><th>Vị trí lưu</th><th>Tình trạng</th><th>Ghi chú</th><th>Thao tác</th></tr></thead>
          <tbody id="toolsBody"></tbody>
        </table>
      </div>
      <div id="toolsEmpty" class="inventoryEmpty hide">Chưa có dụng cụ kỹ thuật.</div>
    </div>
  </section>
</div>
<div id="maintenancePage" class="page maintenancePage hide">
  <section class="maintenanceHero">
    <div>
      <span>ESTA · PREVENTIVE MAINTENANCE</span>
      <h1>Bảo trì thiết bị kỹ thuật</h1>
      <p>Quản lý danh mục thiết bị, chu kỳ bảo trì, công việc đến hạn và lịch sử thực hiện theo từng dự án.</p>
    </div>
    <div class="maintenanceHeroActions">
      <button id="maintenanceExportPdf" class="inventorySecondary" type="button">PDF ⇩ Báo cáo</button>
      <button id="addMaintenanceAsset" class="inventoryPrimary" type="button">＋ Thêm thiết bị</button>
    </div>
  </section>

  <section class="maintenanceStats">
    <article><span class="maintStatIcon blue"><svg viewBox="0 0 24 24"><path d="M4 20h16M6 20V8l6-4 6 4v12M9 12h6M9 16h6"/></svg></span><div><small>THIẾT BỊ</small><b id="maintAssetCount">0</b><em>Đang quản lý</em></div></article>
    <article><span class="maintStatIcon red"><svg viewBox="0 0 24 24"><path d="M12 8v5M12 17h.01"/><circle cx="12" cy="12" r="9"/></svg></span><div><small>QUÁ HẠN</small><b id="maintOverdueCount">0</b><em>Cần xử lý ngay</em></div></article>
    <article><span class="maintStatIcon amber"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></span><div><small>ĐẾN HẠN 30 NGÀY</small><b id="maintDueSoonCount">0</b><em>Lên kế hoạch sớm</em></div></article>
    <article><span class="maintStatIcon green"><svg viewBox="0 0 24 24"><path d="m7 12 3 3 7-7"/><circle cx="12" cy="12" r="9"/></svg></span><div><small>ĐÃ BẢO TRÌ NĂM</small><b id="maintDoneYearCount">0</b><em>Lượt hoàn thành</em></div></article>
  </section>

  <section class="maintenanceSchedule">
    <div class="maintenanceScheduleHead">
      <div><span class="inventoryKicker">KẾ HOẠCH 12 THÁNG</span><h2>Lịch bảo trì theo tháng</h2></div>
      <button id="maintenanceMonthClear" type="button">Xem tất cả</button>
    </div>
    <div id="maintenanceMonthStrip" class="maintenanceMonthStrip"></div>
  </section>

  <section class="maintenanceBoard">
    <div class="maintenanceToolbar">
      <div>
        <span class="inventoryKicker">KẾ HOẠCH BẢO TRÌ</span>
        <h2>Thiết bị và lịch bảo trì</h2>
        <p>Màu trạng thái được tính từ ngày bảo trì kế tiếp.</p>
      </div>
      <div class="inventoryToolbarActions">
        <div class="inventorySearch"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg><input id="maintenanceSearch" placeholder="Tìm thiết bị..."></div>
        <select id="maintenanceSystemFilter"><option value="">Tất cả hệ thống</option><option>HVAC</option><option>Điện</option><option>PCCC</option><option>Cấp thoát nước</option><option>Máy phát điện</option><option>Thang máy</option><option>Khác</option></select>
        <select id="maintenanceDueFilter"><option value="">Tất cả lịch</option><option value="overdue">Quá hạn</option><option value="soon">Đến hạn 30 ngày</option><option value="ok">Đúng kế hoạch</option><option value="unknown">Chưa đặt lịch</option></select>
      </div>
    </div>

    <div class="inventoryExamples maintenanceExamples">
      <span>Gợi ý thiết bị:</span>
      <button type="button" data-maint-sample="FCU tầng 6|HVAC|90">FCU / AHU</button>
      <button type="button" data-maint-sample="Máy bơm PCCC|PCCC|30">Bơm PCCC</button>
      <button type="button" data-maint-sample="Máy phát điện|Máy phát điện|30">Máy phát điện</button>
      <button type="button" data-maint-sample="Tủ điện MSB|Điện|90">Tủ điện MSB</button>
      <button type="button" data-maint-sample="Bơm cấp nước|Cấp thoát nước|60">Bơm cấp nước</button>
    </div>

    <div class="maintenanceAssetGrid" id="maintenanceAssetGrid"></div>
    <div id="maintenanceEmpty" class="inventoryEmpty hide">Chưa có thiết bị. Có thể chọn một gợi ý phía trên hoặc bấm “Thêm thiết bị”.</div>
  </section>

  <section class="inventoryTableCard maintenanceHistoryCard">
    <div class="inventorySectionHead">
      <div><span class="inventoryKicker">NHẬT KÝ BẢO TRÌ</span><h3>Lịch sử thực hiện</h3><p>Lưu người thực hiện, nội dung, kết quả và chi phí nếu có.</p></div>
    </div>
    <div class="inventoryTableScroll">
      <table class="maintenanceHistoryTable">
        <thead><tr><th>Ngày</th><th>Thiết bị</th><th>Loại</th><th>Người thực hiện</th><th>Nội dung</th><th>Kết quả</th><th>Hạn kế tiếp</th><th>Chi phí</th><th>Thao tác</th></tr></thead>
        <tbody id="maintenanceHistoryBody"></tbody>
      </table>
    </div>
    <div id="maintenanceHistoryEmpty" class="inventoryEmpty hide">Chưa có lịch sử bảo trì.</div>
  </section>
</div>
<div id="contractorPage" class="page contractorPage hide">
  <section class="contractorOverview" id="contractorOverview">
    <div class="contractorIntro">
      <div class="contractorIntroCopy">
        <span>Life In Your Business.</span>
        <h1>Nhà thầu</h1>
        <i></i>
        <p>Lưu thông tin liên hệ và toàn bộ lịch sử công việc nhà thầu đã thực hiện tại từng dự án.</p>
      </div>
      <div class="contractorSkyline" aria-hidden="true">
        <b class="sky s1"></b><b class="sky s2"></b><b class="sky s3"></b><b class="sky s4"></b><b class="sky s5"></b>
      </div>
      <div class="contractorIntroActions">
        <button id="contractorExportPdf" class="contractorBtn ghost" type="button">PDF ⇩</button>
        <button id="addContractorBtn" class="contractorBtn primary" type="button">＋ <span>Thêm nhà thầu</span></button>
      </div>
    </div>

    <div class="contractorStats">
      <article class="contractorStatFeatured"><span class="contractorStatIcon"><svg viewBox="0 0 24 24"><path d="M4 20h16M6 20V8h12v12M9 8V5h6v3"/></svg></span><div><b id="contractorCount">0</b><small>NHÀ THẦU</small><em>Đang lưu trong dự án</em></div></article>
      <article><span class="contractorStatIcon bronze"><svg viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/></svg></span><div><b id="contractorYearJobCount">0</b><small>CÔNG VIỆC NĂM NAY</small><em>Lịch sử thực hiện</em></div></article>
      <article><span class="contractorStatIcon amber"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></span><div><b id="contractorOpenJobCount">0</b><small>ĐANG THỰC HIỆN</small><em>Công việc chưa kết thúc</em></div></article>
      <article><span class="contractorStatIcon green"><svg viewBox="0 0 24 24"><path d="m7 12 3 3 7-7"/><circle cx="12" cy="12" r="9"/></svg></span><div><b id="contractorDoneJobCount">0</b><small>HOÀN THÀNH</small><em>Công việc đã xử lý</em></div></article>
    </div>

    <div class="contractorDirectory">
      <div class="contractorToolbar">
        <div>
          <h2>Danh sách nhà thầu <span id="contractorResultCount">(0)</span></h2>
          <p>Bấm vào tên nhà thầu để xem toàn bộ công việc đã thực hiện.</p>
        </div>
        <div class="contractorToolbarRight">
          <div class="contractorSearch"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg><input id="contractorSearch" placeholder="Tìm nhà thầu, người liên hệ, SĐT..."></div>
          <select id="contractorStatusFilter" class="contractorStatusFilterHidden"><option value="">Tất cả trạng thái</option><option>Đang hợp tác</option><option>Tạm ngưng</option><option>Ngừng hợp tác</option></select>
        </div>
      </div>
      <div id="contractorSpecialtyFilters" class="contractorSpecialtyFilters">
        <button class="active" type="button" data-contractor-specialty="">Tất cả</button>
        <button type="button" data-contractor-specialty="ĐHKK">ĐHKK</button>
        <button type="button" data-contractor-specialty="PCCC">PCCC</button>
        <button type="button" data-contractor-specialty="Thang máy">Thang máy</button>
        <button type="button" data-contractor-specialty="Điện">Điện</button>
        <button type="button" data-contractor-specialty="Cấp thoát nước">Cấp thoát nước</button>
        <button type="button" data-contractor-specialty="Vệ sinh">Vệ sinh</button>
      </div>

      <div class="contractorListHeader" aria-hidden="true">
        <span>NHÀ THẦU</span>
        <span>NGƯỜI LIÊN HỆ</span>
        <span>SĐT LIÊN HỆ</span>
        <span>LĨNH VỰC</span>
        <span>CÔNG VIỆC</span>
        <span>GẦN NHẤT</span>
        <span>THAO TÁC</span>
      </div>
    <div id="contractorGrid" class="contractorGrid"></div>
    <div id="contractorEmpty" class="contractorEmpty hide">
      <svg viewBox="0 0 24 24"><path d="M4 20h16M6 20V8h12v12M9 8V5h6v3"/></svg>
      <b>Chưa có nhà thầu</b>
      <span>Bấm “Thêm nhà thầu” để tạo hồ sơ đầu tiên cho dự án.</span>
    </div>
    </div>
  </section>

  <section id="contractorDetail" class="contractorDetail hide">
    <div class="contractorDetailTop">
      <div class="contractorDetailNav">
        <button id="contractorBackBtn" class="contractorBackBtn" type="button">← Danh sách nhà thầu</button>
      </div>
      <div class="contractorDetailActions">
        <button id="contractorDetailPdf" class="contractorBtn ghost" type="button">PDF ⇩ Hồ sơ</button>
        <button id="editContractorBtn" class="contractorBtn ghost" type="button">✎ Sửa thông tin</button>
        <button id="addContractorJobBtn" class="contractorBtn primary" type="button">＋ Thêm công việc</button>
        <button id="contractorDetailCloseBtn" class="contractorDetailCloseBtn" type="button" title="Đóng" aria-label="Đóng">×</button>
      </div>
    </div>

    <div class="contractorProfile">
      <div class="contractorProfileIcon">
        <svg viewBox="0 0 24 24"><path d="M4 20h16M6 20V8h12v12M9 8V5h6v3M9 12h2M13 12h2M9 16h6"/></svg>
      </div>
      <div class="contractorProfileMain">
        <span id="contractorDetailSpecialty">NHÀ THẦU KỸ THUẬT</span>
        <h1 id="contractorDetailName">Tên nhà thầu</h1>
        <p id="contractorDetailNote">—</p>
      </div>
      <span id="contractorDetailStatus" class="contractorStatusBadge active">Đang hợp tác</span>
    </div>

    <div class="contractorContactGrid contractorContactGrid3">
      <article><span class="contractorContactIcon"><svg viewBox="0 0 24 24"><path d="M6 3h4l2 5-3 2a15 15 0 0 0 5 5l2-3 5 2v4c0 2-2 3-4 3C9 20 4 15 3 7c0-2 1-4 3-4z"/></svg></span><div><small>SỐ ĐIỆN THOẠI</small><a id="contractorDetailPhone" href="#">—</a></div></article>
      <article><span class="contractorContactIcon"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-5 4-7 8-7s7 2 8 7"/></svg></span><div><small>NGƯỜI LIÊN HỆ</small><b id="contractorDetailContact">—</b></div></article>
      <article><span class="contractorContactIcon"><svg viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/></svg></span><div><small>THỜI HẠN HỢP ĐỒNG</small><b id="contractorDetailContractTerm">—</b></div></article>
    </div>

    <div class="contractorJobsPanel">
      <div class="contractorJobsHead">
        <div><span class="contractorKicker">LỊCH SỬ CÔNG VIỆC</span><h2>Công việc đã thực hiện <span id="contractorJobCount">(0)</span></h2></div>
        <div class="contractorJobFilters">
          <div class="contractorSearch compact"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg><input id="contractorJobSearch" placeholder="Tìm nội dung, nguyên nhân..."></div>
          <select id="contractorJobStatusFilter"><option value="">Tất cả tình trạng</option><option>Đang thực hiện</option><option>Hoàn thành</option><option>Chờ xử lý</option><option>Tạm dừng</option></select>
        </div>
      </div>

      <div id="contractorJobList" class="contractorJobList"></div>
      <div id="contractorJobEmpty" class="contractorEmpty small hide">
        <b>Chưa có lịch sử công việc</b>
        <span>Bấm “Thêm công việc” để ghi nhận lần thực hiện đầu tiên.</span>
      </div>
    </div>
  </section>
</div>
</main></div>
<div id="contractorModal" class="modal hide">
  <div class="modalCard contractorModalCard">
    <button id="closeContractorModal" class="modalClose" type="button">×</button>
    <div class="contractorModalHead"><span>ESTA · CONTRACTOR PROFILE</span><h3 id="contractorModalTitle">Thêm nhà thầu</h3><p>Thông tin này được lưu riêng theo từng dự án.</p></div>
    <form id="contractorForm" class="contractorForm">
      <input id="contractorId" type="hidden">
      <label class="wide"><span>Tên nhà thầu *</span><input id="contractorName" maxlength="160" required placeholder="VD: Công ty THT"></label>
      <label><span>Số điện thoại</span><input id="contractorPhone" maxlength="40" placeholder="090..."></label>
      <label><span>Người liên hệ</span><input id="contractorContactName" maxlength="120" placeholder="Anh/Chị..."></label>
      <label><span>Lĩnh vực</span><input id="contractorSpecialty" maxlength="120" placeholder="HVAC, PCCC, điện..."></label>
      <label><span>Hợp đồng từ ngày</span><input id="contractorContractStart" type="date"></label>
      <label><span>Hợp đồng đến ngày</span><input id="contractorContractEnd" type="date"></label>
      <label><span>Trạng thái</span><select id="contractorStatus"><option>Đang hợp tác</option><option>Tạm ngưng</option><option>Ngừng hợp tác</option></select></label>
      <label class="wide"><span>Ghi chú</span><textarea id="contractorNote" maxlength="600" rows="3" placeholder="Phạm vi phụ trách, thông tin cần lưu ý..."></textarea></label>
      <div class="contractorFormActions"><button id="cancelContractorModal" type="button" class="contractorBtn ghost">Hủy</button><button type="submit" class="contractorBtn primary">Lưu nhà thầu</button></div>
    </form>
  </div>
</div>

<div id="contractorJobModal" class="modal hide">
  <div class="modalCard contractorModalCard jobModalCard">
    <button id="closeContractorJobModal" class="modalClose" type="button">×</button>
    <div class="contractorModalHead"><span>ESTA · CONTRACTOR WORK LOG</span><h3 id="contractorJobModalTitle">Thêm công việc</h3><p id="contractorJobModalContractor">Nhà thầu</p></div>
    <form id="contractorJobForm" class="contractorForm jobForm">
      <input id="contractorJobId" type="hidden">
      <input id="contractorJobContractorId" type="hidden">
      <label><span>Ngày thực hiện *</span><input id="contractorJobDate" type="date" required></label>
      <label><span>Ngày hoàn thành</span><input id="contractorJobCompletedDate" type="date"></label>
      <label><span>Tình trạng *</span><select id="contractorJobStatus" required><option>Đang thực hiện</option><option>Hoàn thành</option><option>Chờ xử lý</option><option>Tạm dừng</option></select></label>
      <label class="wide full"><span>Nội dung công việc *</span><textarea id="contractorJobContent" rows="4" maxlength="1200" required placeholder="Mô tả công việc nhà thầu thực hiện..."></textarea></label>
      <label class="wide"><span>Nguyên nhân</span><textarea id="contractorJobCause" rows="4" maxlength="1000" placeholder="Nguyên nhân sự cố / lý do thực hiện..."></textarea></label>
      <label class="wide"><span>Hướng xử lý</span><textarea id="contractorJobSolution" rows="4" maxlength="1000" placeholder="Phương án xử lý, thay thế, khắc phục..."></textarea></label>
      <label class="wide full"><span>Ghi chú</span><textarea id="contractorJobNote" rows="3" maxlength="800"></textarea></label>
      <div class="contractorFormActions"><button id="cancelContractorJobModal" type="button" class="contractorBtn ghost">Hủy</button><button type="submit" class="contractorBtn primary">Lưu công việc</button></div>
    </form>
  </div>
</div>
<div id="maintenanceAssetModal" class="modal hide">
  <div class="modalCard inventoryModalCard maintenanceModalCard">
    <button id="closeMaintenanceAssetModal" class="modalClose" type="button">×</button>
    <div class="inventoryModalHead"><span>ESTA · ASSET REGISTER</span><h3 id="maintenanceAssetModalTitle">Thêm thiết bị</h3><p>Chu kỳ bảo trì được dùng để tự tính hạn bảo trì kế tiếp.</p></div>
    <form id="maintenanceAssetForm" class="inventoryForm">
      <input id="maintenanceAssetId" type="hidden">
      <label><span>Mã thiết bị</span><input id="maintenanceCode" maxlength="40" placeholder="VD: HVAC-FCU-06"></label>
      <label class="wide"><span>Tên thiết bị *</span><input id="maintenanceName" maxlength="140" required placeholder="VD: FCU tầng 6"></label>
      <label><span>Hệ thống</span><select id="maintenanceSystem"><option>HVAC</option><option>Điện</option><option>PCCC</option><option>Cấp thoát nước</option><option>Máy phát điện</option><option>Thang máy</option><option>Khác</option></select></label>
      <label><span>Vị trí</span><input id="maintenanceLocation" maxlength="120" placeholder="Tầng / phòng kỹ thuật"></label>
      <label><span>Hãng</span><input id="maintenanceManufacturer" maxlength="100"></label>
      <label><span>Model</span><input id="maintenanceModel" maxlength="100"></label>
      <label><span>Serial</span><input id="maintenanceSerial" maxlength="100"></label>
      <label><span>Chu kỳ (ngày) *</span><input id="maintenanceFrequency" type="number" min="1" required value="30"></label>
      <label><span>Bảo trì gần nhất</span><input id="maintenanceLastDate" type="date"></label>
      <label><span>Hạn kế tiếp</span><input id="maintenanceNextDate" type="date"></label>
      <label><span>Người phụ trách</span><select id="maintenanceAssigned"><option value="">— Chọn —</option></select></label>
      <label><span>Trạng thái</span><select id="maintenanceStatus"><option>Hoạt động</option><option>Tạm dừng</option><option>Hỏng</option><option>Ngừng sử dụng</option></select></label>
      <label class="wide"><span>Ghi chú</span><input id="maintenanceNote" maxlength="400"></label>
      <div class="inventoryFormActions"><button id="cancelMaintenanceAssetModal" type="button" class="inventorySecondary">Hủy</button><button type="submit" class="inventoryPrimary">Lưu thiết bị</button></div>
    </form>
  </div>
</div>

<div id="maintenanceRecordModal" class="modal hide">
  <div class="modalCard inventoryModalCard maintenanceModalCard">
    <button id="closeMaintenanceRecordModal" class="modalClose" type="button">×</button>
    <div class="inventoryModalHead"><span>ESTA · MAINTENANCE LOG</span><h3 id="maintenanceRecordTitle">Ghi nhận bảo trì</h3><p id="maintenanceRecordAssetName">Thiết bị</p></div>
    <form id="maintenanceRecordForm" class="inventoryForm">
      <input id="maintenanceRecordId" type="hidden">
      <input id="maintenanceRecordAssetId" type="hidden">
      <label><span>Ngày thực hiện *</span><input id="maintenanceRecordDate" type="date" required></label>
      <label><span>Loại</span><select id="maintenanceRecordType"><option>Định kỳ</option><option>Kiểm tra</option><option>Khắc phục sự cố</option><option>Thay thế</option></select></label>
      <label><span>Người thực hiện</span><select id="maintenanceRecordPerformer"><option value="">— Chọn —</option></select></label>
      <label><span>Kết quả</span><select id="maintenanceRecordResult"><option>Hoàn thành</option><option>Cần theo dõi</option><option>Cần sửa chữa</option><option>Chưa hoàn thành</option></select></label>
      <label class="wide"><span>Nội dung thực hiện *</span><input id="maintenanceWorkDone" maxlength="500" required placeholder="Vệ sinh, kiểm tra dòng, siết đầu cốt, thay lọc..."></label>
      <label><span>Hạn bảo trì kế tiếp</span><input id="maintenanceRecordNextDate" type="date"></label>
      <label><span>Chi phí (VNĐ)</span><input id="maintenanceCost" type="number" min="0" step="1000" value="0"></label>
      <label class="wide"><span>Ghi chú</span><input id="maintenanceRecordNote" maxlength="400"></label>
      <div class="inventoryFormActions"><button id="cancelMaintenanceRecordModal" type="button" class="inventorySecondary">Hủy</button><button type="submit" class="inventoryPrimary">Lưu nhật ký</button></div>
    </form>
  </div>
</div>
<div id="materialItemModal" class="modal hide">
  <div class="modalCard inventoryModalCard">
    <button id="closeMaterialModal" class="modalClose" type="button">×</button>
    <div class="inventoryModalHead"><span>ESTA · MATERIAL MASTER</span><h3 id="materialModalTitle">Thêm vật tư</h3><p>Vật tư chỉ bắt đầu xuất hiện từ tháng có ngày bắt đầu quản lý; các tháng trước không phát sinh dữ liệu.</p></div>
    <form id="materialItemForm" class="inventoryForm">
      <input id="materialId" type="hidden">
      <label><span>Mã vật tư</span><input id="materialCode" maxlength="40" placeholder="VD: VT-001"></label>
      <label class="wide"><span>Tên vật tư *</span><input id="materialName" maxlength="120" required placeholder="VD: Băng keo điện 3M"></label>
      <label><span>Đơn vị tính *</span><input id="materialUnit" maxlength="30" required value="Cái"></label>
      <label><span>Ngày bắt đầu quản lý *</span><input id="materialTrackingStart" type="date" required></label>
      <label><span>Tồn tại thời điểm bắt đầu</span><input id="materialOpeningQty" type="number" step="0.01" min="0" value="0"></label>
      <label><span>Mức tồn tối thiểu</span><input id="materialMinQty" type="number" step="0.01" min="0" value="0"></label>
      <label class="wide"><span>Ghi chú</span><input id="materialNote" maxlength="300" placeholder="Quy cách, hãng, vị trí lưu..."></label>
      <div class="inventoryFormActions"><button id="cancelMaterialModal" type="button" class="inventorySecondary">Hủy</button><button type="submit" class="inventoryPrimary">Lưu vật tư</button></div>
    </form>
  </div>
</div>

<div id="stockTxnModal" class="modal hide">
  <div class="modalCard inventoryModalCard">
    <button id="closeStockTxnModal" class="modalClose" type="button">×</button>
    <div class="inventoryModalHead"><span>ESTA · STOCK MOVEMENT</span><h3 id="stockTxnModalTitle">Nhập / Xuất vật tư</h3><p>Mọi phát sinh sẽ tự động cập nhật tồn kho theo tháng.</p></div>
    <form id="stockTxnForm" class="inventoryForm">
      <input id="stockTxnId" type="hidden">
      <label class="wide"><span>Vật tư *</span><select id="stockTxnMaterial" required></select></label>
      <label><span>Loại *</span><select id="stockTxnType"><option value="in">Nhập kho</option><option value="out">Xuất kho</option></select></label>
      <label><span>Ngày *</span><input id="stockTxnDate" type="date" required></label>
      <label><span>Số lượng *</span><input id="stockTxnQty" type="number" step="0.01" min="0.01" required></label>
      <label><span>Người thực hiện</span><select id="stockTxnPerformer"><option value="">— Chọn —</option></select></label>
      <label class="wide"><span>Ghi chú</span><input id="stockTxnNote" maxlength="300" placeholder="Nhập mua mới, xuất thay thế, sử dụng tầng..."></label>
      <div class="inventoryFormActions"><button id="cancelStockTxnModal" type="button" class="inventorySecondary">Hủy</button><button type="submit" class="inventoryPrimary">Lưu giao dịch</button></div>
    </form>
  </div>
</div>

<div id="toolItemModal" class="modal hide">
  <div class="modalCard inventoryModalCard">
    <button id="closeToolModal" class="modalClose" type="button">×</button>
    <div class="inventoryModalHead"><span>ESTA · TOOL REGISTER</span><h3 id="toolModalTitle">Thêm dụng cụ</h3><p>Quản lý dụng cụ kỹ thuật riêng cho từng dự án.</p></div>
    <form id="toolItemForm" class="inventoryForm">
      <input id="toolId" type="hidden">
      <label><span>Mã dụng cụ</span><input id="toolCode" maxlength="40" placeholder="VD: DC-001"></label>
      <label class="wide"><span>Tên dụng cụ *</span><input id="toolName" maxlength="120" required placeholder="VD: Đồng hồ vạn năng"></label>
      <label><span>Nhãn hiệu</span><input id="toolBrand" maxlength="100" placeholder="VD: Kyoritsu, Bosch..."></label>
      <label><span>Số lượng *</span><input id="toolQty" type="number" step="0.01" min="0" required value="1"></label>
      <label><span>Đơn vị</span><input id="toolUnit" maxlength="30" value="Cái"></label>
      <label><span>Tình trạng</span><select id="toolCondition"><option>Tốt</option><option>Đang sử dụng</option><option>Cần kiểm tra</option><option>Cần sửa</option><option>Hư hỏng</option><option>Ngừng sử dụng</option></select></label>
      <label><span>Vị trí lưu</span><input id="toolLocation" maxlength="120" placeholder="Kho kỹ thuật, tủ dụng cụ..."></label>
      <label><span>Ngày mua</span><input id="toolAcquiredDate" type="date"></label>
      <label class="wide toolNoteField"><span>Ghi chú</span><input id="toolNote" maxlength="300" placeholder="Model, serial, vị trí sử dụng, tình trạng chi tiết..."></label>
      <div class="inventoryFormActions"><button id="cancelToolModal" type="button" class="inventorySecondary">Hủy</button><button type="submit" class="inventoryPrimary">Lưu dụng cụ</button></div>
    </form>
  </div>
</div>
<div id="peopleManagerModal" class="modal hide">
  <div class="modalCard peopleManagerCard">
    <button id="closePeopleManager" class="modalClose" type="button">×</button>
    <div class="peopleManagerHead">
      <span>ESTA · NHÂN SỰ DỰ ÁN</span>
      <h3>Người thực hiện</h3>
      <p id="peopleManagerProject">Danh sách được lưu riêng cho từng dự án và đồng bộ trên các thiết bị.</p>
    </div>
    <form id="peopleAddForm" class="peopleAddForm">
      <input id="newPersonName" maxlength="100" autocomplete="off" placeholder="Nhập tên người mới..." required>
      <button type="submit">＋ Thêm</button>
    </form>
    <div id="peopleManagerList" class="peopleManagerList"></div>
    <div class="peopleManagerFoot">Thêm hoặc xóa sẽ tự động lưu ngay.</div>
  </div>
</div>
<div id="adminSettingsModal" class="modal hide">
  <div class="modalCard adminSettingsCard">
    <button id="closeAdminSettings" class="modalClose" type="button">×</button>
    <div class="settingsHead"><div><span>ESTA ADMIN</span><h3>⚙ Cài đặt hệ thống</h3><p>Quản lý dự án, tài khoản kỹ thuật và Thùng rác.</p></div></div>
    <div class="settingsTabs">
      <button class="active" type="button" data-settings-tab="projects">▥ Dự án</button>
      <button type="button" data-settings-tab="accounts">👤 Tài khoản kỹ thuật</button>
      <button type="button" data-settings-tab="trash">🗑 Thùng rác</button>
    </div>

    <section id="settingsProjects" class="settingsPane">
      <div class="settingsPaneTitle"><div><h4>Quản lý dự án</h4><p>Thêm dự án mới hoặc đưa dự án đang hoạt động vào Thùng rác.</p></div></div>
      <form id="projectForm" class="projectForm settingsInlineForm">
        <label><span>Mã dự án</span><input id="projectCode" required maxlength="20" placeholder="VD: 68PDL"></label>
        <label><span>Tên dự án</span><input id="projectName" required maxlength="120" placeholder="VD: 68 Phan Đăng Lưu"></label>
        <button class="primary" type="submit">＋ Thêm dự án</button>
        <div id="projectFormMessage" class="adminSetupMessage"></div>
      </form>
      <div id="settingsProjectList" class="settingsList"></div>
    </section>

    <section id="settingsAccounts" class="settingsPane hide">
      <div class="settingsPaneTitle"><div><h4>Tài khoản kỹ thuật</h4><p>Tạo tài khoản và xóa tài khoản kỹ thuật không còn sử dụng.</p></div></div>
      <form id="adminCreateAccountForm" class="adminCreateForm settingsAccountForm">
        <label><span>Tên đăng nhập</span><input id="adminUsername" required minlength="3" placeholder="vd: kythuat62"></label>
        <label><span>Tên hiển thị</span><input id="adminDisplayName" required placeholder="vd: Kỹ thuật 62 THL"></label>
        <label><span>Mật khẩu</span><input id="adminPassword" type="password" required minlength="6" placeholder="Tối thiểu 6 ký tự"></label>
        <label><span>Dự án</span><select id="adminBuildingSelect" required></select></label>
        <label><span>Quyền</span><select id="adminRole"><option value="editor">Được nhập / chỉnh sửa</option><option value="viewer">Chỉ xem</option></select></label>
        <button id="adminCreateBtn" class="primary" type="submit">＋ Tạo tài khoản</button>
      </form>
      <p id="adminCreateHint" class="adminHint">Cần đăng nhập bằng Admin trung tâm để tạo tài khoản thật.</p>
      <div class="settingsListHead"><b>Danh sách tài khoản</b><button id="refreshAdminUsers" class="secondary small" type="button">Làm mới</button></div>
      <div id="adminUsersList" class="adminUsersList"><div class="empty">Chưa tải danh sách tài khoản.</div></div>
    </section>

    <section id="settingsTrash" class="settingsPane hide">
      <div class="settingsPaneTitle"><div><h4>🗑 Thùng rác</h4><p>Dự án đã xóa được giữ lại để có thể khôi phục cùng dữ liệu và phân quyền trước đó.</p></div><button id="refreshTrash" class="secondary small" type="button">Làm mới</button></div>
      <div id="trashProjectList" class="settingsList"><div class="empty">Chưa tải Thùng rác.</div></div>
    </section>
  </div>
</div><div id="adminSetupModal" class="modal hide"><div class="modalCard adminSetupCard"><button id="closeAdminSetup" class="modalClose" type="button">×</button><h3>Kích hoạt Admin trung tâm</h3><p>Tạo tài khoản Admin Supabase lần đầu để quản lý tài khoản cho tất cả dự án.</p><form id="adminSetupForm" class="adminSetupForm"><label><span>Email Admin</span><input id="setupAdminEmail" type="email" required placeholder="email của anh"></label><label><span>Tên hiển thị</span><input id="setupAdminName" required value="Quản trị viên"></label><label><span>Mật khẩu Admin</span><input id="setupAdminPassword" type="password" required minlength="6" placeholder="Tối thiểu 6 ký tự"></label><button class="primary" type="submit">Kích hoạt Admin</button><div id="adminSetupMessage" class="adminSetupMessage"></div></form></div></div><div id="exportModal" class="modal hide"><div class="modalCard exportModalWide"><button id="closeExport" class="modalClose">×</button><h3>Xuất báo cáo PDF</h3><p>Chọn loại báo cáo và khoảng thời gian.</p>
<div class="exportSection"><b>Công việc kỹ thuật</b><div class="exportChoices"><button data-range="today">Hôm nay</button><button data-range="week">Tuần này</button><button data-range="month">Tháng này</button><button data-range="current">Theo bộ lọc hiện tại</button></div></div>
<div class="exportSection combinedSection"><b>Báo cáo tổng hợp 1 file</b><small>Công việc + Chỉ số điện + Chỉ số nước</small><div class="combinedChoices"><button data-combined-range="today">Hôm nay</button><button data-combined-range="week">Tuần này</button><button data-combined-range="month">Tháng này</button><button data-combined-range="all">Toàn bộ</button></div></div>
</div></div><div id="viewer" class="viewer hide"><div class="viewerCard"><button id="closeViewer">×</button><div id="viewerImages"></div></div></div>
<script src="app.js?v=20260924-0140"></script><script src="contractor.js?v=20260924-0140"></script></body></html>
```


---

## FILE: app.js

SHA: 8e8087d8958356380023b1ef40da249b4d34cacd

```javascript
const $=s=>document.querySelector(s);
const SB_URL="https://upcjcrycahdfroxggsdz.supabase.co";
const SB_KEY="sb_publishable_WQiZyrTXCeRr6BgfXAtQSg_zX_eUBsa";
let me=null,centralSession=null,currentAccount=null,currentBuilding={id:"62THL",name:"62 Trần Huy Liệu",role:"editor"};

const taskStorageKeyFor=id=>id==="62THL"?"qlkt62_v1":"qlkt_tasks_"+id;
const taskStorageKey=()=>taskStorageKeyFor(currentBuilding.id);
const load=()=>{try{let v=JSON.parse(localStorage.getItem(taskStorageKey())||"[]");return Array.isArray(v)?v:[]}catch(e){return[]}};
const save=a=>localStorage.setItem(taskStorageKey(),JSON.stringify(a));
const today=()=>new Date().toLocaleDateString("en-CA");
const fmt=d=>new Date(d+"T00:00").toLocaleDateString("vi-VN");
const esc=(s="")=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function toast(s){$("#toast").textContent=s;$("#toast").classList.add("show");setTimeout(()=>$("#toast").classList.remove("show"),1800)}

function sentenceCapitalizeText(value){
 let out="",capitalize=true;
 for(const ch of String(value??"")){
   if(capitalize&&/\p{L}/u.test(ch)){out+=ch.toLocaleUpperCase("vi-VN");capitalize=false;continue}
   out+=ch;
   if(ch==="."||ch==="!"||ch==="?")capitalize=true;
 }
 return out;
}
function shouldAutoCapitalize(el){
 if(!el||!el.closest||!el.closest("#app"))return false;
 if(el.tagName==="TEXTAREA")return true;
 if(el.tagName!=="INPUT")return false;
 const type=(el.getAttribute("type")||"text").toLowerCase();
 if(type!=="text")return false;
 return !["search","globalSearch","user","pass","adminUsername","adminPassword","setupAdminEmail","setupAdminPassword"].includes(el.id);
}
function applyAutoCapitalize(el){
 const start=el.selectionStart,end=el.selectionEnd,next=sentenceCapitalizeText(el.value);
 if(next!==el.value){el.value=next;try{el.setSelectionRange(start,end)}catch(e){}}
}

async function sbFetch(path,{method="GET",body=null,token=null}={}){
 const headers={"apikey":SB_KEY,"Content-Type":"application/json"};
 if(token)headers.Authorization="Bearer "+token;
 const res=await fetch(SB_URL+path,{method,headers,body:body===null?null:JSON.stringify(body)});
 let data=null;try{data=await res.json()}catch(e){}
 if(!res.ok){const err=new Error(data?.msg||data?.message||data?.error_description||data?.error||"Không thể kết nối máy chủ");err.status=res.status;throw err}
 return data;
}
const MEDIA_BUCKET="task-images";
const mediaUrlCache=new Map();
function isStorageRef(v){return typeof v==="string"&&v.startsWith("storage:")}
function storagePathFromRef(v){return isStorageRef(v)?v.slice(8):v}
function mediaPathUrl(path){return path.split("/").map(encodeURIComponent).join("/")}
async function mediaObjectUrl(ref){
 if(!ref)return "";
 if(!isStorageRef(ref))return ref;
 const path=storagePathFromRef(ref),cached=mediaUrlCache.get(path);
 if(cached?.url)return cached.url;
 if(!centralSession?.access_token)throw new Error("Phiên đăng nhập đã hết hạn");
 const res=await fetch(SB_URL+"/storage/v1/object/authenticated/"+MEDIA_BUCKET+"/"+mediaPathUrl(path),{
   headers:{"apikey":SB_KEY,"Authorization":"Bearer "+centralSession.access_token}
 });
 if(!res.ok)throw new Error("Không thể tải hình ảnh");
 const blob=await res.blob(),url=URL.createObjectURL(blob);
 mediaUrlCache.set(path,{url});
 return url;
}
function mediaImgHtml(ref,cls=""){
 if(!ref)return "";
 if(isStorageRef(ref))return '<img class="'+cls+'" data-storage-path="'+esc(storagePathFromRef(ref))+'" alt="Hình ảnh">';
 return '<img class="'+cls+'" src="'+esc(ref)+'" alt="Hình ảnh">';
}
async function hydrateMediaImages(root=document){
 const imgs=[...(root||document).querySelectorAll?.("img[data-storage-path]")||[]];
 await Promise.all(imgs.map(async im=>{
   if(im.dataset.loaded==="1")return;
   try{
     const url=await mediaObjectUrl("storage:"+im.dataset.storagePath);
     im.src=url;im.dataset.loaded="1";
   }catch(e){
     im.classList.add("imageLoadError");
     im.alt="Nhấn để thử lại";
     im.onclick=async ev=>{ev.stopPropagation();im.dataset.loaded="";await hydrateMediaImages(im.parentElement||document)};
   }
 }));
}
window.addEventListener("beforeunload",()=>{for(const x of mediaUrlCache.values())if(x?.url?.startsWith("blob:"))URL.revokeObjectURL(x.url)});
function imageFileToBlob(file){
 return new Promise((resolve,reject)=>{
   if(!file?.type?.startsWith("image/"))return reject(new Error("Chỉ hỗ trợ file hình ảnh"));
   const url=URL.createObjectURL(file),img=new Image();
   img.onload=()=>{
     try{
       const max=1800,scale=Math.min(1,max/Math.max(img.width,img.height)),w=Math.max(1,Math.round(img.width*scale)),h=Math.max(1,Math.round(img.height*scale));
       const cv=document.createElement("canvas");cv.width=w;cv.height=h;
       cv.getContext("2d").drawImage(img,0,0,w,h);
       cv.toBlob(blob=>{URL.revokeObjectURL(url);blob?resolve(blob):reject(new Error("Không thể xử lý hình ảnh"))},"image/jpeg",.74);
     }catch(e){URL.revokeObjectURL(url);reject(e)}
   };
   img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error("Không đọc được hình ảnh này"))};
   img.src=url;
 });
}
async function uploadMediaBlob(blob,kind,recordId,index=0,buildingId=currentBuilding.id){
 if(!centralSession?.access_token)throw new Error("Cần đăng nhập tài khoản trung tâm để tải hình");
 const uid=(crypto.randomUUID?crypto.randomUUID():Date.now()+"-"+Math.random().toString(16).slice(2));
 const path=buildingId+"/"+kind+"/"+recordId+"/"+Date.now()+"-"+index+"-"+uid+".jpg";
 const res=await fetch(SB_URL+"/storage/v1/object/"+MEDIA_BUCKET+"/"+mediaPathUrl(path),{
   method:"POST",
   headers:{"apikey":SB_KEY,"Authorization":"Bearer "+centralSession.access_token,"Content-Type":"image/jpeg","x-upsert":"false"},
   body:blob
 });
 if(!res.ok){let d={};try{d=await res.json()}catch(e){}throw new Error(d?.message||d?.error||"Không thể tải hình lên máy chủ")}
 return "storage:"+path;
}
async function uploadMediaFiles(files,kind,recordId,onProgress,buildingId=currentBuilding.id){
 const list=[...files],refs=new Array(list.length);
 let next=0,done=0;
 const worker=async()=>{
   while(true){
     const i=next++;if(i>=list.length)return;
     const blob=(list[i].type==="image/jpeg"&&String(list[i].name||"").startsWith("camera-"))?list[i]:await imageFileToBlob(list[i]);
     refs[i]=await uploadMediaBlob(blob,kind,recordId,i,buildingId);
     done++;if(onProgress)onProgress(done,list.length);
   }
 };
 const workers=Array.from({length:Math.min(3,list.length)},()=>worker());
 await Promise.all(workers);
 return refs.filter(Boolean);
}
async function uploadLegacyDataUrl(dataUrl,kind,recordId,index){
 const blob=await (await fetch(dataUrl)).blob();
 let out=blob;
 if(blob.type!=="image/jpeg"){
   const f=new File([blob],"legacy-image",{type:blob.type||"image/png"});
   out=await imageFileToBlob(f);
 }
 return uploadMediaBlob(out,kind,recordId,index);
}
async function migrateMediaRows(tasks,energy){
 let changed=false;
 if(!centralSession?.access_token||!canProjectEdit())return {tasks,energy,changed};
 for(const task of tasks||[]){
   if(!Array.isArray(task.imgs))continue;
   for(let i=0;i<task.imgs.length;i++){
     const ref=task.imgs[i];
     if(typeof ref==="string"&&ref.startsWith("data:image/")){
       task.imgs[i]=await uploadLegacyDataUrl(ref,"tasks",task.id,i);
       changed=true;
     }
   }
   task.i=task.imgs.length;
 }
 for(const row of energy||[]){
   if(typeof row.image==="string"&&row.image.startsWith("data:image/")){
     row.image=await uploadLegacyDataUrl(row.image,"energy",row.id,0);
     changed=true;
   }
 }
 return {tasks,energy,changed};
}
let viewerMediaRefs=[];
window.downloadViewerMedia=async index=>{
 const ref=viewerMediaRefs[index];if(!ref)return;
 try{
   let blob;
   if(isStorageRef(ref)){
     const path=storagePathFromRef(ref);
     const res=await fetch(SB_URL+"/storage/v1/object/authenticated/"+MEDIA_BUCKET+"/"+mediaPathUrl(path),{
       headers:{"apikey":SB_KEY,"Authorization":"Bearer "+centralSession.access_token}
     });
     if(!res.ok)throw new Error("Không thể tải hình");
     blob=await res.blob();
   }else{
     const res=await fetch(ref);blob=await res.blob();
   }
   const u=URL.createObjectURL(blob),a=document.createElement("a");
   a.href=u;a.download="ESTA-"+currentBuilding.id+"-hinh-"+(index+1)+".jpg";
   document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1500);
 }catch(e){toast(e.message||"Không thể tải hình")}
};

async function projectSync(action,payload={},buildingId=currentBuilding?.id){
 if(!centralSession?.access_token||!buildingId)return null;
 return sbFetch("/functions/v1/project-sync",{method:"POST",token:centralSession.access_token,body:{action,building_id:buildingId,...payload}});
}
const cloudVersionByBuilding={};
let projectPeople=[],taskSelectedPeople=[],energySelectedPeople=[];
const peopleLocalKey=id=>"esta_people_"+id;
function performerArray(x){
 if(Array.isArray(x?.performers))return [...new Set(x.performers.map(v=>String(v||"").trim()).filter(Boolean))];
 const raw=String(x?.a||x?.performer||"").trim();
 return raw?[...new Set(raw.split(",").map(v=>v.trim()).filter(Boolean))]:[];
}
function existingProjectPeople(){
 const names=[];
 load().forEach(x=>names.push(...performerArray(x)));
 if(typeof energyLoad==="function")energyLoad().forEach(x=>names.push(...performerArray(x)));
 return [...new Set(names.map(v=>v.trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"vi"));
}
function cacheProjectPeople(){
 try{localStorage.setItem(peopleLocalKey(currentBuilding.id),JSON.stringify(projectPeople))}catch(e){}
}
function peopleSelected(kind){return kind==="energy"?energySelectedPeople:taskSelectedPeople}
function setPeopleSelected(kind,names){
 const clean=[...new Set((names||[]).map(v=>String(v||"").trim()).filter(Boolean))];
 if(kind==="energy")energySelectedPeople=clean;else taskSelectedPeople=clean;
 const hidden=kind==="energy"?$("#energyPerformer"):$("#performer");
 if(hidden)hidden.value=clean.join(", ");
 renderPeopleSelector(kind);
}
function personInitials(name){
 return String(name||"").trim().split(/\s+/).slice(-2).map(x=>x[0]||"").join("").toUpperCase()||"•";
}
function renderPeopleSelector(kind){
 const box=kind==="energy"?$("#energyPeopleOptions"):$("#taskPeopleOptions");
 const btn=kind==="energy"?$("#energyPeopleButton"):$("#taskPeopleButton");
 if(!box||!btn)return;
 const selected=peopleSelected(kind);
 const names=[...new Set([...projectPeople.map(x=>x.name),...selected])].filter(Boolean);
 if(!names.length){
   box.innerHTML='<div class="peopleEmpty"><b>Chưa có người thực hiện</b><span>Chọn “Chỉnh sửa danh sách” để thêm nhân sự cho dự án.</span></div>';
 }else{
   box.innerHTML=names.map(name=>{
     const on=selected.includes(name);
     return '<button type="button" class="peopleOption '+(on?"selected":"")+'" data-person="'+encodeURIComponent(name)+'"><span class="peopleName">'+esc(name)+'</span><span class="peopleCheck">'+(on?"✓":"")+'</span></button>';
   }).join("");
   box.querySelectorAll("[data-person]").forEach(el=>el.onclick=e=>{
     e.stopPropagation();
     const name=decodeURIComponent(el.dataset.person),next=[...peopleSelected(kind)];
     const idx=next.indexOf(name);if(idx>=0)next.splice(idx,1);else next.push(name);
     setPeopleSelected(kind,next);
     if(kind==="task")saveDraft();
   });
 }
 const label=btn.querySelector("span");
 if(label){
   label.className="peopleButtonSummary";
   label.innerHTML=!selected.length
     ?'<em>Chọn người thực hiện</em>'
     :selected.slice(0,4).map(name=>'<span class="selectedPersonChip"><b>'+esc(name)+'</b></span>').join("")+(selected.length>4?'<span class="selectedMore">+'+(selected.length-4)+'</span>':"");
 }
 btn.classList.toggle("hasValue",selected.length>0);
}
function renderAllPeopleSelectors(){renderPeopleSelector("task");renderPeopleSelector("energy")}
function closePeopleMenus(){
 $("#taskPeopleMenu")?.classList.add("hide");
 $("#energyPeopleMenu")?.classList.add("hide");
}
function openPeopleManager(){
 closePeopleMenus();
 $("#peopleManagerProject").textContent="Danh sách của "+(currentBuilding?.name||"dự án")+" · tự động lưu riêng theo dự án.";
 $("#peopleManagerModal").classList.remove("hide");
 renderPeopleManager();
}
function renderPeopleManager(){
 const box=$("#peopleManagerList");if(!box)return;
 const writable=canProjectEdit();
 $("#peopleAddForm").classList.toggle("readonly",!writable);
 $("#newPersonName").disabled=!writable;
 $("#peopleAddForm").querySelector("button").disabled=!writable;
 box.innerHTML=projectPeople.length?projectPeople.map(p=>'<div class="peopleManagerRow"><div><b>'+esc(p.name)+'</b></div>'+(writable?'<button type="button" data-delete-person="'+p.id+'">Xóa</button>':'<span class="peopleReadOnly">Chỉ xem</span>')+'</div>').join(""):'<div class="peopleEmpty manager">Chưa có người thực hiện trong dự án này.</div>';
 box.querySelectorAll("[data-delete-person]").forEach(btn=>btn.onclick=()=>deleteProjectPerson(btn.dataset.deletePerson));
}
async function fetchProjectPeople(buildingId=currentBuilding?.id){
 if(!centralSession?.access_token||!buildingId)return [];
 const rows=await sbFetch("/rest/v1/building_people?select=id,name&building_id=eq."+encodeURIComponent(buildingId)+"&order=name.asc",{token:centralSession.access_token});
 return Array.isArray(rows)?rows:[];
}
async function loadProjectPeople(buildingId=currentBuilding?.id){
 if(!buildingId)return;
 let cached=[];try{cached=JSON.parse(localStorage.getItem(peopleLocalKey(buildingId))||"[]")}catch(e){}
 projectPeople=Array.isArray(cached)?cached:[];
 renderAllPeopleSelectors();
 if(!centralSession?.access_token)return;
 try{
   let rows=await fetchProjectPeople(buildingId);
   if(!rows.length&&buildingId===currentBuilding?.id){
     const legacy=existingProjectPeople();
     if(legacy.length&&canProjectEdit()){
       try{
         await sbFetch("/rest/v1/building_people",{method:"POST",token:centralSession.access_token,body:legacy.map(name=>({building_id:buildingId,name}))});
         rows=await fetchProjectPeople(buildingId);
       }catch(e){console.warn("Seed project people failed",e)}
     }else if(legacy.length){
       rows=legacy.map((name,i)=>({id:"legacy-"+i,name}));
     }
   }
   if(buildingId!==currentBuilding?.id)return;
   projectPeople=rows;
   cacheProjectPeople();renderAllPeopleSelectors();renderPeopleManager();
 }catch(e){console.warn("Load project people failed",e)}
}
async function addProjectPerson(name){
 if(!canProjectEdit())return toast("Tài khoản này chỉ có quyền xem");
 name=sentenceCapitalizeText(String(name||"").trim());
 if(!name)return;
 if(projectPeople.some(p=>p.name.toLocaleLowerCase("vi-VN")===name.toLocaleLowerCase("vi-VN")))return toast("Người này đã có trong danh sách");
 try{
   await sbFetch("/rest/v1/building_people",{method:"POST",token:centralSession.access_token,body:{building_id:currentBuilding.id,name}});
   await loadProjectPeople(currentBuilding.id);
   toast("Đã thêm "+name);
 }catch(e){toast(e.status===409?"Người này đã có trong danh sách":e.message)}
}
async function deleteProjectPerson(id){
 if(!canProjectEdit())return toast("Tài khoản này chỉ có quyền xem");
 const person=projectPeople.find(p=>String(p.id)===String(id));if(!person)return;
 if(!confirm("Xóa "+person.name+" khỏi danh sách người thực hiện của dự án?"))return;
 try{
   await sbFetch("/rest/v1/building_people?id=eq."+encodeURIComponent(id)+"&building_id=eq."+encodeURIComponent(currentBuilding.id),{method:"DELETE",token:centralSession.access_token});
   taskSelectedPeople=taskSelectedPeople.filter(x=>x!==person.name);
   energySelectedPeople=energySelectedPeople.filter(x=>x!==person.name);
   $("#performer").value=taskSelectedPeople.join(", ");
   $("#energyPerformer").value=energySelectedPeople.join(", ");
   await loadProjectPeople(currentBuilding.id);
   toast("Đã xóa "+person.name);
 }catch(e){toast(e.message)}
}

$("#taskPeopleButton").onclick=e=>{e.stopPropagation();const m=$("#taskPeopleMenu"),open=m.classList.contains("hide");closePeopleMenus();if(open)m.classList.remove("hide")};
$("#energyPeopleButton").onclick=e=>{e.stopPropagation();const m=$("#energyPeopleMenu"),open=m.classList.contains("hide");closePeopleMenus();if(open)m.classList.remove("hide")};
$("#taskPeopleMenu").onclick=e=>e.stopPropagation();
$("#energyPeopleMenu").onclick=e=>e.stopPropagation();
document.querySelectorAll("[data-people-edit]").forEach(btn=>btn.onclick=e=>{e.stopPropagation();openPeopleManager()});
document.addEventListener("click",e=>{if(!e.target.closest(".peopleSelect"))closePeopleMenus()});
$("#closePeopleManager").onclick=()=>$("#peopleManagerModal").classList.add("hide");
$("#peopleManagerModal").onclick=e=>{if(e.target===$("#peopleManagerModal"))$("#peopleManagerModal").classList.add("hide")};
$("#peopleAddForm").onsubmit=async e=>{e.preventDefault();const input=$("#newPersonName"),name=input.value.trim();if(!name)return;input.value="";await addProjectPerson(name);input.focus()};

function applyCloudSnapshot(building,row){
 if(!row)return;
 localStorage.setItem(building.id==="62THL"?"qlkt62_v1":"qlkt_tasks_"+building.id,JSON.stringify(Array.isArray(row.tasks)?row.tasks:[]));
 localStorage.setItem(building.id==="62THL"?"qlkt62_energy_v1":"qlkt_energy_"+building.id,JSON.stringify(Array.isArray(row.energy)?row.energy:[]));
 cloudVersionByBuilding[building.id]=row.updated_at||"";
 if(currentBuilding?.id===building.id){render();renderEnergy();if(!$("#homePage").classList.contains("hide"))renderHomeDashboard()}
}
function mergeByRecordId(cloudRows,localRows){
 const map=new Map();
 (Array.isArray(cloudRows)?cloudRows:[]).forEach(x=>{if(x&&x.id!==undefined)map.set(String(x.id),x)});
 (Array.isArray(localRows)?localRows:[]).forEach(x=>{if(x&&x.id!==undefined)map.set(String(x.id),x)});
 return [...map.values()];
}
async function syncProjectSnapshot(){
 if(!centralSession?.access_token||!currentBuilding?.id)return;
 try{
   const r=await projectSync("merge_snapshot",{tasks:load(),energy:typeof energyLoad==="function"?energyLoad():[]});
   if(r?.updated_at)cloudVersionByBuilding[currentBuilding.id]=r.updated_at;
 }catch(e){console.warn("Snapshot merge failed",e)}
}
async function syncTaskRecord(action,itemOrId,buildingId=currentBuilding?.id){
 if(!centralSession?.access_token||!buildingId)return;
 try{
   const r=action==="upsert_task"
     ?await projectSync(action,{item:itemOrId},buildingId)
     :await projectSync(action,{id:itemOrId},buildingId);
   if(r?.updated_at)cloudVersionByBuilding[buildingId]=r.updated_at;
   return r;
 }catch(e){throw e}
}
async function appendTaskImages(taskId,images,buildingId){
 if(!images?.length)return;
 const r=await projectSync("append_task_images",{id:taskId,images},buildingId);
 if(r?.updated_at)cloudVersionByBuilding[buildingId]=r.updated_at;
}
async function syncEnergyRecord(action,itemOrId){
 if(!centralSession?.access_token)return;
 try{
   const r=action==="upsert_energy"
     ?await projectSync(action,{item:itemOrId})
     :await projectSync(action,{id:itemOrId});
   if(r?.updated_at)cloudVersionByBuilding[currentBuilding.id]=r.updated_at;
 }catch(e){toast("Đã lưu trên máy nhưng chưa đồng bộ lên máy chủ");throw e}
}
async function loadProjectSnapshot(building){
 if(!centralSession?.access_token||!building?.id)return false;
 const buildingId=building.id;
 currentBuilding={...building};
 const taskKey=taskStorageKeyFor(buildingId);
 const energyKey=buildingId==="62THL"?"qlkt62_energy_v1":"qlkt_energy_"+buildingId;

 // Local storage is only a cache. Preserve any previous browser-only data
 // before replacing the cache with the server snapshot.
 let previousLocalTasks=[],previousLocalEnergy=[];
 try{previousLocalTasks=JSON.parse(localStorage.getItem(taskKey)||"[]")}catch(e){}
 try{previousLocalEnergy=JSON.parse(localStorage.getItem(energyKey)||"[]")}catch(e){}

 try{
   const r=await projectSync("get",{},buildingId);
   const row=r?.snapshot||{building_id:buildingId,tasks:[],energy:[],updated_at:null};
   const cloudTasks=Array.isArray(row.tasks)?row.tasks:[];
   const cloudEnergy=Array.isArray(row.energy)?row.energy:[];

   // Never block project opening because of image migration or stale local cache.
   // The server snapshot is canonical and is applied immediately.
   try{
     if((previousLocalTasks.length||previousLocalEnergy.length)&&
        (JSON.stringify(previousLocalTasks)!==JSON.stringify(cloudTasks)||
         JSON.stringify(previousLocalEnergy)!==JSON.stringify(cloudEnergy))){
       localStorage.setItem("esta_local_backup_"+buildingId,JSON.stringify({
         saved_at:new Date().toISOString(),
         tasks:previousLocalTasks,
         energy:previousLocalEnergy
       }));
     }
   }catch(e){console.warn("Local backup skipped",e)}

   localStorage.setItem(taskKey,JSON.stringify(cloudTasks));
   localStorage.setItem(energyKey,JSON.stringify(cloudEnergy));
   cloudVersionByBuilding[buildingId]=row.updated_at||"";

   // Best-effort legacy base64 migration. It must never prevent the project
   // from loading. Current server data normally already uses Storage refs.
   const hasLegacyMedia=
     cloudTasks.some(t=>Array.isArray(t?.imgs)&&t.imgs.some(x=>typeof x==="string"&&x.startsWith("data:image/")))||
     cloudEnergy.some(x=>typeof x?.image==="string"&&x.image.startsWith("data:image/"));
   if(hasLegacyMedia&&canProjectEdit()){
     (async()=>{
       try{
         const migrated=await migrateMediaRows(
           JSON.parse(JSON.stringify(cloudTasks)),
           JSON.parse(JSON.stringify(cloudEnergy))
         );
         if(!migrated.changed)return;
         localStorage.setItem(taskKey,JSON.stringify(migrated.tasks));
         localStorage.setItem(energyKey,JSON.stringify(migrated.energy));
         const merged=await projectSync("merge_snapshot",{tasks:migrated.tasks,energy:migrated.energy},buildingId);
         if(merged?.updated_at)cloudVersionByBuilding[buildingId]=merged.updated_at;
         if(currentBuilding?.id===buildingId){render();renderEnergy()}
       }catch(err){console.warn("Legacy media migration skipped",err)}
     })();
   }
   return true;
 }catch(e){
   console.warn("Project snapshot load failed",buildingId,e);
   // Keep any valid cache available instead of leaving the page blank.
   if(!Array.isArray(previousLocalTasks))previousLocalTasks=[];
   if(!Array.isArray(previousLocalEnergy))previousLocalEnergy=[];
   try{
     localStorage.setItem(taskKey,JSON.stringify(previousLocalTasks));
     localStorage.setItem(energyKey,JSON.stringify(previousLocalEnergy));
   }catch(_e){}
   toast("Không thể đồng bộ máy chủ · đang dùng dữ liệu đã lưu trên máy");
   return false;
 }
}
async function pollProjectSnapshot(){
 if(!centralSession?.access_token||!currentBuilding?.id||document.hidden)return;
 if($("#adminPage")&&!$("#adminPage").classList.contains("hide"))return;
 try{
   const r=await projectSync("get"),row=r?.snapshot;
   if(row&&row.updated_at&&row.updated_at!==cloudVersionByBuilding[currentBuilding.id])applyCloudSnapshot(currentBuilding,row);
 }catch(e){console.warn("Cloud refresh failed",e)}
}
setInterval(pollProjectSnapshot,5000);
document.addEventListener("visibilitychange",()=>{if(!document.hidden)pollProjectSnapshot()});
window.addEventListener("focus",()=>pollProjectSnapshot());

async function loadCentralAccount(token){
 let p=await sbFetch("/rest/v1/profiles?select=id,email,username,display_name,is_admin,active&id=eq."+encodeURIComponent((await sbFetch("/auth/v1/user",{token})).id),{token});
 let profile=p?.[0];if(!profile||profile.active===false)throw new Error("Tài khoản đã bị khóa");
 if(profile.username==="admin"&&!profile.is_admin){
   try{await sbFetch("/rest/v1/rpc/bootstrap_first_admin",{method:"POST",body:{},token})}catch(e){}
   p=await sbFetch("/rest/v1/profiles?select=id,email,username,display_name,is_admin,active&id=eq."+encodeURIComponent(profile.id),{token});profile=p?.[0]||profile;
 }
 let buildings=[];
 if(profile.is_admin){
   buildings=await sbFetch("/rest/v1/buildings?select=id,name,deleted_at&deleted_at=is.null&order=name.asc",{token});
   buildings=(buildings||[]).map(b=>({...b,role:"admin"}));
 }else{
   const rows=await sbFetch("/rest/v1/building_members?select=building_id,role,buildings(id,name,deleted_at)&user_id=eq."+encodeURIComponent(profile.id),{token});
   buildings=(rows||[]).filter(r=>r.buildings&&!r.buildings.deleted_at).map(r=>({id:r.building_id,name:r.buildings?.name||r.building_id,role:r.role}));
 }
 return {...profile,buildings};
}
async function centralLogin(identifier,password){
 const loginId=String(identifier||"").trim().toLowerCase();
 let data;
 try{
   data=await sbFetch("/functions/v1/central-login",{method:"POST",body:{identifier:loginId,password}});
 }catch(err){
   // Fallback keeps direct email login and legacy project usernames working
   // if the login edge function is temporarily unavailable.
   const email=loginId.includes("@")?loginId:loginId+"@esta-building.app";
   data=await sbFetch("/auth/v1/token?grant_type=password",{method:"POST",body:{email,password}});
 }
 const session={access_token:data.access_token,refresh_token:data.refresh_token,expires_at:data.expires_at||0};
 if(!session.access_token)throw new Error("Không nhận được phiên đăng nhập");
 localStorage.setItem("esta_central_session",JSON.stringify(session));
 const account=await loadCentralAccount(session.access_token);
 return {session,account};
}
async function restoreCentral(){
 let s;try{s=JSON.parse(localStorage.getItem("esta_central_session")||"null")}catch(e){return null}
 if(!s?.access_token)return null;
 try{return {session:s,account:await loadCentralAccount(s.access_token)}}catch(err){
   if(!s.refresh_token){localStorage.removeItem("esta_central_session");return null}
   try{
     const d=await sbFetch("/auth/v1/token?grant_type=refresh_token",{method:"POST",body:{refresh_token:s.refresh_token}});
     s={access_token:d.access_token,refresh_token:d.refresh_token,expires_at:d.expires_at||0};
     localStorage.setItem("esta_central_session",JSON.stringify(s));
     return {session:s,account:await loadCentralAccount(s.access_token)};
   }catch(e){localStorage.removeItem("esta_central_session");return null}
 }
}
function homeInitials(name=""){
 return String(name||"E").trim().split(/\s+/).slice(-2).map(x=>x[0]||"").join("").toUpperCase()||"E";
}
function homeEnergyUse(rows,type){
 const list=(Array.isArray(rows)?rows:[]).filter(x=>x.type===type).sort((a,b)=>String(a.date).localeCompare(String(b.date))||Number(a.id)-Number(b.id));
 const month=today().slice(0,7);
 let total=0,has=false;
 for(let i=1;i<list.length;i++){
   if(!String(list[i].date||"").startsWith(month))continue;
   const d=Number(list[i].value)-Number(list[i-1].value);
   if(Number.isFinite(d)&&d>=0){total+=d;has=true}
 }
 return has?total:null;
}
function homeNumber(v,unit=""){
 return v===null||v===undefined?"—":Number(v).toLocaleString("vi-VN",{maximumFractionDigits:2})+(unit?" "+unit:"");
}
function homeTaskRows(tasks,buildingLabel=""){
 return [...(tasks||[])].sort((a,b)=>String(b.d||"").localeCompare(String(a.d||""))||Number(b.id)-Number(a.id)).slice(0,6).map(x=>{
   const status=x.s||"Đang thực hiện";
   const cls=status==="Đã hoàn thành"?"done":status==="Đang thực hiện"?"doing":"waiting";
   return '<button class="homeTaskRow" type="button" onclick="homeOpenTask('+Number(x.id)+')"><div class="homeTaskLead"><span class="homeTaskDot '+cls+'"></span><div><b>'+esc(x.c||"Công việc kỹ thuật")+'</b><small>'+esc(buildingLabel||x.a||"Kỹ thuật")+' · '+(x.d?fmt(x.d):"—")+'</small></div></div><span class="homeStatus '+cls+'">'+esc(status)+'</span><i>→</i></button>';
 }).join("");
}
function homeActivityRows(tasks,energy,buildingLabel=""){
 const items=[];
 (tasks||[]).forEach(x=>items.push({ts:Number(x.id)||Date.parse((x.d||today())+"T12:00:00"),icon:"task",title:x.c||"Công việc kỹ thuật",sub:(x.s||"Đang thực hiện")+(buildingLabel?" · "+buildingLabel:"")}));
 (energy||[]).forEach(x=>items.push({ts:Date.parse(x.createdAt||((x.date||today())+"T12:00:00"))||Number(x.id)||0,icon:x.type||"electric",title:x.type==="water"?"Đã cập nhật chỉ số nước":x.type==="solar"?"Đã cập nhật điện mặt trời":"Đã cập nhật chỉ số điện",sub:(x.date?fmt(x.date):"")+(buildingLabel?" · "+buildingLabel:"")}));
 return items.sort((a,b)=>b.ts-a.ts).slice(0,5).map(x=>{
   const when=x.ts?new Date(x.ts).toLocaleTimeString("vi-VN",{hour:"2-digit",minute:"2-digit"}):"";
   return '<div class="activityRow"><div class="activityIcon '+esc(x.icon)+'"></div><div><b>'+esc(x.title)+'</b><span>'+esc(x.sub)+'</span></div><time>'+esc(when)+'</time></div>';
 }).join("");
}
function renderHomeProjectCards(){
 const box=$("#homeProjectGrid"),list=currentAccount?.buildings||[];
 if(!box)return;
 box.innerHTML=list.length?list.map((b,i)=>'<button class="homeProjectCard" type="button" onclick="adminOpenBuilding(\''+esc(b.id)+'\')"><div class="projectMonogram">'+esc((b.id||"ES").slice(0,2))+'</div><div><small>'+esc(b.id)+'</small><b>'+esc(b.name||b.id)+'</b><span>ESTA Property Management</span></div><i>→</i></button>').join(""):'<div class="homeEmpty">Chưa có dự án đang hoạt động.</div>';
}
async function renderAdminHomeOverview(){
 $("#homeAdminProjects").classList.toggle("hide",!currentAccount?.is_admin);
 renderHomeProjectCards();
 if(!currentAccount?.is_admin)return;
 try{
   const result=await sbFetch("/functions/v1/admin-overview",{method:"POST",token:centralSession.access_token,body:{}});
   const rows=Array.isArray(result?.rows)?result.rows:[];
   const tasks=[],energy=[];let electricTotal=0,waterTotal=0,solarTotal=0,hasElectric=false,hasWater=false,hasSolar=false;

   rows.forEach(({building:b,snapshot:s})=>{
     const bt=Array.isArray(s?.tasks)?s.tasks:[],be=Array.isArray(s?.energy)?s.energy:[];
     bt.forEach(x=>tasks.push({...x,_building:b?.name||b?.id||"Dự án"}));
     be.forEach(x=>energy.push({...x,_building:b?.name||b?.id||"Dự án"}));
     const ev=homeEnergyUse(be,"electric"),wv=homeEnergyUse(be,"water"),sv=homeEnergyUse(be,"solar");
     if(ev!==null){electricTotal+=ev;hasElectric=true}
     if(wv!==null){waterTotal+=wv;hasWater=true}
     if(sv!==null){solarTotal+=sv;hasSolar=true}
   });

   const td=today();
   $("#homeToday").textContent=tasks.filter(x=>x.d===td).length;
   $("#homeDoing").textContent=tasks.filter(x=>x.s==="Đang thực hiện").length;
   $("#homeDone").textContent=tasks.filter(x=>x.s==="Đã hoàn thành").length;
   $("#homeWait").textContent=tasks.filter(x=>x.s==="Chờ xử lý").length;

   const recent=[...tasks].sort((a,b)=>String(b.d||"").localeCompare(String(a.d||""))||Number(b.id)-Number(a.id)).slice(0,6);
   $("#homeRecentTasks").innerHTML=recent.length?recent.map(x=>{
     const st=x.s||"Đang thực hiện",cl=st==="Đã hoàn thành"?"done":st==="Đang thực hiện"?"doing":"waiting";
     return '<div class="homeTaskRow static"><div class="homeTaskLead"><span class="homeTaskDot '+cl+'"></span><div><b>'+esc(x.c||"Công việc kỹ thuật")+'</b><small>'+esc(x._building||"Dự án")+' · '+(x.d?fmt(x.d):"—")+'</small></div></div><span class="homeStatus '+cl+'">'+esc(st)+'</span></div>';
   }).join(""):'<div class="homeEmpty">Chưa có công việc gần đây.</div>';

   $("#homeElectric").textContent=homeNumber(hasElectric?electricTotal:null);
   $("#homeWater").textContent=homeNumber(hasWater?waterTotal:null);
   $("#homeSolar").textContent=homeNumber(hasSolar?solarTotal:null);
   $("#homeActivity").innerHTML=homeActivityRows(tasks,energy)||'<div class="homeEmpty">Chưa có hoạt động gần đây.</div>';
 }catch(e){
   console.warn("Admin home summary failed",e);
   $("#homeRecentTasks").innerHTML='<div class="homeEmpty">Không tải được dữ liệu tổng quan. Vui lòng thử lại.</div>';
   $("#homeActivity").innerHTML='<div class="homeEmpty">Không tải được hoạt động gần đây.</div>';
 }
}
function renderHomeDashboard(){
 $("#headerAvatar").textContent="E";$("#sideAvatar").textContent="E";
 $("#homeUpdatedAt").textContent="Cập nhật "+new Date().toLocaleTimeString("vi-VN",{hour:"2-digit",minute:"2-digit"});
 const admin=!!currentAccount?.is_admin;
 $("#homeAdminProjects").classList.toggle("hide",!admin);
 if(admin){
   const hp=$("#topHomeTitle p");if(hp)hp.textContent="";
   $("#homeElectric").textContent=$("#homeWater").textContent=$("#homeSolar").textContent="—";
   $("#homeRecentTasks").innerHTML='<div class="homeEmpty">Đang tổng hợp dữ liệu các dự án...</div>';
   $("#homeActivity").innerHTML='<div class="homeEmpty">Đang tải hoạt động...</div>';
   $("#homeToday").textContent=$("#homeDoing").textContent=$("#homeDone").textContent=$("#homeWait").textContent="0";
   renderAdminHomeOverview();
   return;
 }
 const tasks=load(),energy=energyLoad(),td=today();
 $("#homeToday").textContent=tasks.filter(x=>x.d===td).length;
 $("#homeDoing").textContent=tasks.filter(x=>x.s==="Đang thực hiện").length;
 $("#homeDone").textContent=tasks.filter(x=>x.s==="Đã hoàn thành").length;
 $("#homeWait").textContent=tasks.filter(x=>x.s==="Chờ xử lý").length;
 $("#homeRecentTasks").innerHTML=homeTaskRows(tasks)||'<div class="homeEmpty">Chưa có công việc gần đây.</div>';
 $("#homeElectric").textContent=homeNumber(homeEnergyUse(energy,"electric"));
 $("#homeWater").textContent=homeNumber(homeEnergyUse(energy,"water"));
 $("#homeSolar").textContent=homeNumber(homeEnergyUse(energy,"solar"));
 $("#homeActivity").innerHTML=homeActivityRows(tasks,energy)||'<div class="homeEmpty">Chưa có hoạt động gần đây.</div>';
}
function showHome(){
 $("#homePage").classList.remove("hide");
 $("#adminPage").classList.add("hide");$("#workPage").classList.add("hide");$("#energyPage").classList.add("hide");$("#inventoryPage").classList.add("hide");$("#maintenancePage").classList.add("hide");$("#contractorPage").classList.add("hide");
 $("#workHero").classList.add("hide");$("#energyHero").classList.add("hide");
 $("#topHomeTitle").classList.remove("hide");$("#topAdminTitle").classList.add("hide");$("#topWorkTitle").classList.add("hide");$("#topEnergyTitle").classList.add("hide");$("#topInventoryTitle").classList.add("hide");$("#topMaintenanceTitle").classList.add("hide");$("#topContractorTitle").classList.add("hide");
 $("#navHome").classList.add("active");$("#navAdmin").classList.remove("active");$("#navWork").classList.remove("active");$("#navEnergy").classList.remove("active");$("#navInventory").classList.remove("active");$("#navMaintenance").classList.remove("active");$("#navContractor").classList.remove("active");
 $("#app").classList.remove("adminMode","energyMode","inventoryMode","maintenanceMode","contractorMode");$("#app").classList.add("homeMode");
 document.querySelector("aside").classList.remove("open");
 renderHomeDashboard();
}
window.homeOpenTask=id=>{
 if($("#navWork").classList.contains("hide")){toast("Hãy mở một dự án trước");return}
 showModule("work");
 const n=Number(id);if(Number.isFinite(n)&&load().some(x=>Number(x.id)===n))setTimeout(()=>editTask(n),80);
};
function applyBuildingUI(){
 const name=currentBuilding?.name||"Dự án";
 document.querySelectorAll(".buildingNameText").forEach(el=>el.textContent=name);
 const ht=$("#topHomeTitle p"),wt=$("#topWorkTitle p"),et=$("#topEnergyTitle p"),it=$("#topInventoryTitle p"),mt=$("#topMaintenanceTitle p"),ct=$("#topContractorTitle p");
 if(ht)ht.textContent=currentAccount?.is_admin?"":name;
 if(wt)wt.textContent=name;
 if(et)et.textContent=name+" · Điện / Nước / Điện mặt trời";
 if(it)it.textContent=name+" · Kho kỹ thuật";
 if(mt)mt.textContent=name+" · Kế hoạch bảo trì";
 if(ct)ct.textContent=name;
 document.title="ESTA | "+name;
 resetForm(false);render();renderEnergy();renderHomeDashboard();
}
async function enterProject(building){
 currentBuilding={...building};
 sessionStorage.setItem("esta_building",JSON.stringify(currentBuilding));
 taskSelectedPeople=[];energySelectedPeople=[];projectPeople=[];inventoryLoadedBuilding="";maintenanceLoadedBuilding="";contractorLoadedBuilding="";selectedContractorId="";
 $("#navWork").classList.remove("hide");$("#navEnergy").classList.remove("hide");$("#navInventory").classList.remove("hide");$("#navMaintenance").classList.remove("hide");$("#navContractor").classList.remove("hide");

 // Load the two independent data sources separately so one failure cannot
 // prevent the project from opening.
 if(centralSession?.access_token)await loadProjectSnapshot(currentBuilding);
 try{await loadProjectPeople(currentBuilding.id)}catch(e){console.warn("Project people load skipped",e)}

 applyBuildingUI();
 showHome();
}
function openAdminPortal(){
 if(!currentAccount?.is_admin)return;
 $("#homePage").classList.add("hide");$("#adminPage").classList.remove("hide");$("#workPage").classList.add("hide");$("#energyPage").classList.add("hide");$("#inventoryPage").classList.add("hide");$("#maintenancePage").classList.add("hide");$("#contractorPage").classList.add("hide");
 $("#workHero").classList.add("hide");$("#energyHero").classList.add("hide");
 $("#topHomeTitle").classList.add("hide");$("#topAdminTitle").classList.remove("hide");$("#topWorkTitle").classList.add("hide");$("#topEnergyTitle").classList.add("hide");$("#topInventoryTitle").classList.add("hide");$("#topMaintenanceTitle").classList.add("hide");$("#topContractorTitle").classList.add("hide");
 $("#navHome").classList.remove("active");$("#navAdmin").classList.add("active");$("#navWork").classList.remove("active");$("#navEnergy").classList.remove("active");$("#navInventory").classList.remove("active");$("#navMaintenance").classList.remove("active");$("#navContractor").classList.remove("active");
 $("#app").classList.remove("homeMode");$("#app").classList.add("adminMode");renderAdminPortal();
}
window.adminOpenBuilding=async id=>{
 const b=currentAccount?.buildings?.find(x=>x.id===id);if(!b)return;
 try{
   await enterProject(b);
   showModule("work");
 }catch(e){
   console.warn("Open project failed",e);
   applyBuildingUI();
   showModule("work");
   toast("Đã mở dự án bằng dữ liệu khả dụng");
 }
};
window.enterAccount=function(account,session=null){
 currentAccount=account;centralSession=session;me=account.username||account.email||"user";
 $("#login").classList.add("hide");$("#app").classList.remove("hide");
 $("#headerRole").textContent=account.is_admin?"Quản trị viên":(account.buildings?.[0]?.role==="viewer"?"Chỉ xem":"Kỹ thuật viên");
 $("#sideUser").innerHTML=account.is_admin?"Quản trị viên":"Tài khoản dự án";
 $("#navAdmin").classList.toggle("hide",!account.is_admin);
 $("#headerAvatar").textContent="E";$("#sideAvatar").textContent="E";
 if(account.is_admin){$("#navWork").classList.add("hide");$("#navEnergy").classList.add("hide");$("#navInventory").classList.add("hide");$("#navMaintenance").classList.add("hide");$("#navContractor").classList.add("hide");showHome()}
 else if(account.buildings?.length){enterProject(account.buildings[0])}
 else{toast("Tài khoản chưa được phân quyền dự án");}
};

const rememberedLogin=localStorage.getItem("esta_remember_username")||"";
if(rememberedLogin){$("#user").value=rememberedLogin;$("#rememberLogin").checked=true}
$("#forgotPasswordBtn").onclick=()=>toast("Vui lòng liên hệ quản trị viên để được cấp lại mật khẩu.");
$("#rememberLogin").onchange=()=>{
 if(!$("#rememberLogin").checked)localStorage.removeItem("esta_remember_username");
};

$("#togglePassword").onclick=()=>{
 const p=$("#pass"),b=$("#togglePassword");
 const show=p.type==="password";p.type=show?"text":"password";
 b.textContent=show?"◌":"◉";b.setAttribute("aria-label",show?"Ẩn mật khẩu":"Hiện mật khẩu");
};

$("#loginForm").onsubmit=async e=>{
 e.preventDefault();
 const u=$("#user").value.trim(),p=$("#pass").value,er=$("#loginError"),btn=$("#loginBtn");
 er.textContent="";btn.disabled=true;btn.textContent="Đang đăng nhập...";
 try{
   const central=await centralLogin(u,p);
   if($("#rememberLogin").checked)localStorage.setItem("esta_remember_username",u);
   else localStorage.removeItem("esta_remember_username");
   window.enterAccount(central.account,central.session);
 }catch(err){
   er.textContent=err?.status===400||err?.status===401?"Tài khoản hoặc mật khẩu chưa đúng.":"Không thể kết nối hệ thống trung tâm. Vui lòng thử lại.";
 }
 finally{btn.disabled=false;btn.innerHTML='Đăng nhập <b>→</b>'}
};

$("#logout").onclick=async()=>{
 try{if(centralSession?.access_token)await sbFetch("/auth/v1/logout",{method:"POST",token:centralSession.access_token})}catch(e){}
 localStorage.removeItem("esta_central_session");sessionStorage.removeItem("esta_building");location.reload();
};

$("#openAdminSetup").onclick=()=>$("#adminSetupModal").classList.remove("hide");
$("#closeAdminSetup").onclick=()=>$("#adminSetupModal").classList.add("hide");
$("#adminSetupModal").onclick=e=>{if(e.target===$("#adminSetupModal"))$("#adminSetupModal").classList.add("hide")};
$("#adminSetupForm").onsubmit=async e=>{
 e.preventDefault();const msg=$("#adminSetupMessage");msg.textContent="Đang tạo tài khoản...";
 try{
   const email=$("#setupAdminEmail").value.trim().toLowerCase(),password=$("#setupAdminPassword").value,name=$("#setupAdminName").value.trim()||"Quản trị viên";
   const d=await sbFetch("/auth/v1/signup",{method:"POST",body:{email,password,data:{username:"admin",display_name:name}}});
   if(d.access_token){
     await sbFetch("/rest/v1/rpc/bootstrap_first_admin",{method:"POST",body:{},token:d.access_token});
     const session={access_token:d.access_token,refresh_token:d.refresh_token,expires_at:d.expires_at||0};localStorage.setItem("esta_central_session",JSON.stringify(session));
     const account=await loadCentralAccount(d.access_token);$("#adminSetupModal").classList.add("hide");window.enterAccount(account,session);toast("Đã kích hoạt Admin trung tâm");
   }else msg.textContent="Tài khoản đã được tạo. Hãy xác nhận email rồi đăng nhập bằng email Admin.";
 }catch(err){msg.textContent=err.message}
};

$("#backupBtn").onclick=()=>{
 let blob=new Blob([JSON.stringify({version:3,building:currentBuilding,exportedAt:new Date().toISOString(),tasks:load(),energy:energyLoad()},null,2)],{type:"application/json"}),a=document.createElement("a");
 a.href=URL.createObjectURL(blob);a.download="ESTA-"+currentBuilding.id+"-sao-luu-"+today()+".json";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast("Đã tạo file sao lưu");
};
$("#restoreBtn").onclick=()=>$("#restoreFile").click();
$("#restoreFile").onchange=async e=>{let f=e.target.files[0];if(!f)return;try{let d=JSON.parse(await f.text()),tasks=Array.isArray(d)?d:d.tasks;if(!Array.isArray(tasks))throw new Error("File sao lưu không hợp lệ");if(!confirm("Khôi phục sẽ thay thế dữ liệu hiện tại của "+currentBuilding.name+". Tiếp tục?"))return;save(tasks);if(Array.isArray(d.energy))energySaveAll(d.energy);await syncProjectSnapshot();render();renderEnergy();toast("Đã khôi phục và đồng bộ dữ liệu")}catch(err){toast("Không thể đọc file sao lưu")}finally{e.target.value=""}};
$("#menu").onclick=()=>document.querySelector("aside").classList.toggle("open");const DRAFT="qlkt62_draft";function saveDraft(){if($("#editId").value)return;localStorage.setItem(DRAFT,JSON.stringify({d:$("#date").value,c:$("#content").value,t:$("#type").value,s:$("#status").value,a:$("#performer").value,n:$("#note").value}))}function restoreDraft(){try{let d=JSON.parse(localStorage.getItem(DRAFT)||"null");if(!d)return;$("#date").value=d.d||today();$("#content").value=d.c||"";$("#type").value=d.t||"Hằng ngày";$("#status").value=d.s||"Đang thực hiện";setPeopleSelected("task",String(d.a||"").split(",").map(v=>v.trim()).filter(Boolean));$("#note").value=d.n||""}catch(e){}}function resetForm(clearDraft=true){$("#editId").value="";$("#date").value=today();$("#content").value="";$("#type").value="Hằng ngày";$("#status").value="Đang thực hiện";setPeopleSelected("task",[]);$("#note").value="";$("#images").value="";$("#cameraNativeInput").value="";clearPendingTaskFiles();$("#imageInfo").textContent="";$("#saveBtn").textContent="Lưu";$("#cancelEdit").classList.add("hide");if(clearDraft)localStorage.removeItem(DRAFT)}$("#cancelEdit").onclick=resetForm;["date","content","type","status","performer","note"].forEach(id=>$("#"+id).addEventListener("input",saveDraft));let pendingTaskFiles=[],pendingPreviewUrls=[];
function clearPendingTaskFiles(){
 pendingPreviewUrls.forEach(u=>URL.revokeObjectURL(u));
 pendingPreviewUrls=[];pendingTaskFiles=[];
 const box=$("#pendingImagePreview");if(box)box.innerHTML="";
}
function renderPendingTaskFiles(){
 const box=$("#pendingImagePreview");if(!box)return;
 pendingPreviewUrls.forEach(u=>URL.revokeObjectURL(u));pendingPreviewUrls=[];
 box.innerHTML=pendingTaskFiles.map((f,i)=>{
   const u=URL.createObjectURL(f);pendingPreviewUrls.push(u);
   return '<div class="pendingImg"><img src="'+u+'" alt="Ảnh '+(i+1)+'"><button type="button" onclick="removePendingTaskFile('+i+')" aria-label="Xóa ảnh">×</button><span>'+(i+1)+'</span></div>';
 }).join("");
}
window.removePendingTaskFile=i=>{
 if(i<0||i>=pendingTaskFiles.length)return;
 pendingTaskFiles.splice(i,1);
 renderPendingTaskFiles();updateTaskImageInfo();
};
function updateTaskImageInfo(){
 const n=pendingTaskFiles.length;
 $("#imageInfo").textContent=n?"Đã chọn "+n+" hình · Có thể chọn thêm nhiều ảnh từ Thư viện hoặc chụp thêm 1 ảnh":"";
}
function addPendingTaskFiles(fileList){
 const incoming=Array.from(fileList||[]).filter(f=>f&&f.type?.startsWith("image/"));
 if(!incoming.length)return;
 pendingTaskFiles=[...pendingTaskFiles,...incoming];
 renderPendingTaskFiles();updateTaskImageInfo();
}
$("#openNativeCamera").onclick=()=>{
 const input=$("#cameraNativeInput");
 input.value="";
 input.click();
};
$("#openNativeLibrary").onclick=()=>{
 const input=$("#images");
 input.value="";
 input.click();
};
$("#cameraNativeInput").onchange=e=>{
 addPendingTaskFiles(e.target.files);
 e.target.value="";
};
$("#images").onchange=e=>{
 addPendingTaskFiles(e.target.files);
 e.target.value="";
};
$("#taskForm").onsubmit=async e=>{
 e.preventDefault();
 if(!canProjectEdit()){toast("Tài khoản này chỉ có quyền xem");return}
 if(!taskSelectedPeople.length){toast("Vui lòng chọn ít nhất 1 người thực hiện");$("#taskPeopleButton").focus();return}
 const btn=$("#saveBtn");btn.disabled=true;
 try{
   const buildingId=currentBuilding.id,storageKey=taskStorageKeyFor(buildingId);
   let a=load(),editId=Number($("#editId").value),id=editId||Date.now(),old=editId?a.find(x=>x.id===editId):null;
   const files=[...pendingTaskFiles];
   const imgs=Array.isArray(old?.imgs)?[...old.imgs]:[];
   const obj={id,d:$("#date").value,c:$("#content").value.trim(),t:$("#type").value,s:$("#status").value,n:$("#note").value.trim(),a:taskSelectedPeople.join(", "),performers:[...taskSelectedPeople],imgs,i:imgs.length};
   a=editId?a.map(x=>x.id===editId?obj:x):[obj,...a];
   localStorage.setItem(storageKey,JSON.stringify(a));
   resetForm();render();renderHomeDashboard();
   toast(files.length?"Đã lưu · "+files.length+" hình đang tải nền":"Đã lưu công việc");

   (async()=>{
     try{
       const taskSync=syncTaskRecord("upsert_task",obj,buildingId);
       const imageUpload=files.length?uploadMediaFiles(files,"tasks",id,null,buildingId):Promise.resolve([]);
       const [,uploaded]=await Promise.all([taskSync,imageUpload]);
       if(uploaded.length){
         let latest=[];try{latest=JSON.parse(localStorage.getItem(storageKey)||"[]")}catch(e){}
         latest=latest.map(x=>{
           if(String(x.id)!==String(id))return x;
           const merged=[...new Set([...(Array.isArray(x.imgs)?x.imgs:[]),...uploaded])];
           return {...x,imgs:merged,i:merged.length};
         });
         localStorage.setItem(storageKey,JSON.stringify(latest));
         await appendTaskImages(id,uploaded,buildingId);
         if(currentBuilding.id===buildingId){render();hydrateMediaImages($("#tbody"))}
         toast("Đã tải xong "+uploaded.length+" hình");
       }
     }catch(err){
       console.warn(err);
       toast("Công việc đã lưu, nhưng có hình chưa đồng bộ. Hãy thử lại khi mạng ổn định.");
     }
   })();
 }catch(err){toast(err.message||"Không thể lưu công việc")}
 finally{btn.disabled=false}
};
function filtered(fx,ex){let q=($("#search").value+" "+$("#globalSearch").value).toLowerCase().trim(),s=$("#filterStatus").value,t=$("#filterType").value,f=fx===undefined?$("#fromDate").value:fx,e=ex===undefined?$("#toDate").value:ex;return load().filter(x=>(!q||(x.c+" "+x.n+" "+x.a).toLowerCase().includes(q))&&(!s||x.s===s)&&(!t||(x.t||"Hằng ngày")===t)&&(!f||x.d>=f)&&(!e||x.d<=e))}function typeBadge(t){t=t||"Hằng ngày";let c=t==="Bảo trì"?"maintenance":t==="Sự cố"?"incident":"daily";return '<span class="typeBadge '+c+'">'+esc(t)+'</span>'}function statusBadge(s){let c=s==="Đã hoàn thành"?"done":s==="Đang thực hiện"?"doing":"waiting";return '<span class="badge '+c+'">'+esc(s)+'</span>'}function performerChipsHtml(x,limit=3){
 const arr=performerArray(x);
 if(!arr.length)return '<span class="mutedDash">—</span>';
 const visible=arr.slice(0,limit);
 return '<div class="performerChips pro">'+visible.map(n=>'<span title="'+esc(n)+'"><b>'+esc(n)+'</b></span>').join("")+(arr.length>limit?'<em>+'+(arr.length-limit)+'</em>':"")+'</div>';
}
function thumbs(x){if(!x.imgs?.length)return x.i?"📷 "+x.i:"—";return '<div class="thumbs" onclick="viewImages('+x.id+')">'+x.imgs.slice(0,3).map(v=>mediaImgHtml(v)).join("")+(x.imgs.length>3?'<span class="thumbMore">+'+(x.imgs.length-3)+'</span>':'')+'</div>'}function render(){
 const all=load(),a=filtered(),td=today();
 $("#statToday").textContent=all.filter(x=>x.d===td).length;
 $("#statDoing").textContent=all.filter(x=>x.s==="Đang thực hiện").length;
 $("#statDone").textContent=all.filter(x=>x.s==="Đã hoàn thành").length;
 $("#statWait").textContent=all.filter(x=>x.s==="Chờ xử lý").length;
 $("#count").textContent="("+a.length+")";
 $("#empty").classList.toggle("hide",a.length>0);
 $("#tbody").innerHTML=a.map((x,i)=>'<tr><td class="sttCell">'+(i+1)+'</td><td class="taskContentCell"><span class="taskTitle">'+esc(x.c)+'</span><small>'+esc(x.n||"Không có ghi chú")+'</small></td><td>'+typeBadge(x.t)+'</td><td>'+statusBadge(x.s)+'</td><td class="dateCell">'+fmt(x.d)+'</td><td>'+performerChipsHtml(x)+'</td><td>'+thumbs(x)+'</td><td class="noteCell">'+esc(x.n||"—")+'</td><td class="actionCell"><details class="rowActionMenu"><summary title="Thao tác">•••</summary><div><button type="button" onclick="editTask('+x.id+');this.closest(\'details\').removeAttribute(\'open\')">Sửa công việc</button>'+(x.imgs?.length?'<button type="button" onclick="viewImages('+x.id+');this.closest(\'details\').removeAttribute(\'open\')">Xem hình ảnh</button>':'')+'<button class="danger" type="button" onclick="delTask('+x.id+');this.closest(\'details\').removeAttribute(\'open\')">Xóa</button></div></details></td></tr>').join("");
 $("#mobileCards").innerHTML=a.map(x=>'<article class="mcard proTaskCard"><div class="mobileCardTop"><div><small>'+fmt(x.d)+'</small><h4 class="taskTitle">'+esc(x.c)+'</h4></div>'+statusBadge(x.s)+'</div><div class="mobileMeta">'+typeBadge(x.t)+performerChipsHtml(x,2)+'</div><p>'+esc(x.n||"Không có ghi chú")+'</p><div class="mobileCardFoot"><span>'+(x.imgs?.length?"📷 "+x.imgs.length+" hình":"Không có hình")+'</span><button onclick="editTask('+x.id+')">Chỉnh sửa →</button></div></article>').join("");
 hydrateMediaImages($("#tbody"));
}
window.editTask=id=>{if(!canProjectEdit()){toast("Tài khoản này chỉ có quyền xem");return}let x=load().find(y=>y.id===id);$("#editId").value=x.id;$("#date").value=x.d;$("#content").value=x.c;$("#type").value=x.t||"Hằng ngày";$("#status").value=x.s;setPeopleSelected("task",performerArray(x));$("#note").value=x.n;$("#imageInfo").textContent=x.imgs?.length?"Đang có "+x.imgs.length+" hình · Có thể chụp/chọn thêm":"";$("#saveBtn").textContent="Lưu";$("#cancelEdit").classList.remove("hide");scrollTo({top:0,behavior:"smooth"})};window.delTask=async id=>{if(!canProjectEdit()){toast("Tài khoản này chỉ có quyền xem");return}if(confirm("Xóa công việc này?")){save(load().filter(x=>x.id!==id));await syncTaskRecord("delete_task",id);render();renderHomeDashboard();toast("Đã xóa")}};window.viewImages=async id=>{let x=load().find(y=>y.id===id);if(!x?.imgs?.length)return;viewerMediaRefs=[...x.imgs];$("#viewerImages").innerHTML=viewerMediaRefs.map((v,i)=>'<div class="viewerMedia">'+mediaImgHtml(v,"viewerLargeImage")+'<button class="viewerDownloadBtn" type="button" onclick="downloadViewerMedia('+i+')">⇩ Tải hình</button></div>').join("");$("#viewer").classList.remove("hide");await hydrateMediaImages($("#viewerImages"))};$("#closeViewer").onclick=()=>$("#viewer").classList.add("hide");$("#toggleFilter").onclick=e=>{e.stopPropagation();$("#filterBar").classList.toggle("hide")};$("#filterBar").onclick=e=>e.stopPropagation();document.addEventListener("click",e=>{if(!$("#filterBar").classList.contains("hide")&&!e.target.closest(".filterWrap"))$("#filterBar").classList.add("hide")});["search","globalSearch","fromDate","toDate"].forEach(x=>$("#"+x).addEventListener("input",render));["filterStatus","filterType"].forEach(x=>$("#"+x).onchange=render);function iso(d){return d.toLocaleDateString("en-CA")}function rangeDates(kind){let d=new Date(),from="",to="";if(kind==="today"){from=to=iso(d)}else if(kind==="week"){let day=(d.getDay()+6)%7,a=new Date(d);a.setDate(d.getDate()-day);let b=new Date(a);b.setDate(a.getDate()+6);from=iso(a);to=iso(b)}else if(kind==="month"){let a=new Date(d.getFullYear(),d.getMonth(),1),b=new Date(d.getFullYear(),d.getMonth()+1,0);from=iso(a);to=iso(b)}return{from,to}}$("#quickRange").onchange=()=>{let v=$("#quickRange").value;if(!v)return;let r=rangeDates(v);$("#fromDate").value=r.from;$("#toDate").value=r.to;render()};$("#clear").onclick=()=>{$("#search").value=$("#globalSearch").value=$("#fromDate").value=$("#toDate").value=$("#filterStatus").value=$("#filterType").value=$("#quickRange").value="";render()};function reportHtml(a){let from=$("#fromDate").value,to=$("#toDate").value,period=from||to?((from?fmt(from):"Đầu kỳ")+" - "+(to?fmt(to):"Hiện tại")):"Toàn bộ dữ liệu";let done=a.filter(x=>x.s==="Đã hoàn thành").length,doing=a.filter(x=>x.s==="Đang thực hiện").length,wait=a.filter(x=>x.s==="Chờ xử lý").length;return `<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>Báo cáo công việc kỹ thuật</title><style>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap");
@page{size:A4;margin:14mm 13mm 16mm}*{box-sizing:border-box}body{font-family:"Inter";color:#1f2937;font-size:11px;margin:0}.header{border-bottom:3px solid #123d6b;padding-bottom:10px;display:flex;justify-content:space-between;align-items:flex-start}.brand{font-weight:800;color:#123d6b;font-size:16px}.brand small{display:block;font-size:8px;letter-spacing:.7px;color:#64748b;margin-top:3px}.doc{text-align:right;font-size:9px;color:#64748b}.title{text-align:center;padding:15px 0 12px}.title h1{font-size:19px;color:#123d6b;margin:0 0 5px}.title p{margin:0;font-size:10px;color:#64748b}.summary{display:grid;grid-template-columns:2fr repeat(4,1fr);border:1px solid #cbd5e1;margin-bottom:14px}.summary>div{padding:8px;border-right:1px solid #cbd5e1}.summary>div:last-child{border:0}.summary span{display:block;color:#64748b;font-size:8px;text-transform:uppercase}.summary b{display:block;margin-top:3px;font-size:12px;color:#123d6b}.job{page-break-inside:avoid;border:1px solid #cbd5e1;margin:0 0 11px}.jobHead{background:#edf4fb;padding:7px 9px;border-bottom:1px solid #cbd5e1;display:flex;gap:7px;align-items:flex-start}.no{background:#123d6b;color:#fff;min-width:21px;height:21px;border-radius:50%;display:grid;place-items:center;font-size:9px}.jobHead h3{margin:2px 0 0;font-size:11px;color:#173d67}.details{display:grid;grid-template-columns:1fr 1fr 1fr;padding:7px 9px;gap:5px 12px}.details div{font-size:9px}.details span{color:#64748b}.note{margin:0 9px 8px;padding:7px;background:#f8fafc;border-left:3px solid #94a3b8;font-size:9px}.photos{padding:0 9px 9px;display:grid;grid-template-columns:repeat(2,1fr);gap:7px}.photos img{width:100%;height:185px;object-fit:contain;border:1px solid #d8e0e8;background:#fff}.photoTitle{grid-column:1/-1;font-weight:700;font-size:9px;color:#475569}.sign{page-break-inside:avoid;display:flex;justify-content:space-around;text-align:center;margin-top:25px;font-size:10px}.sign div{width:38%}.sign small{display:block;margin-top:4px;color:#64748b}.signSpace{height:60px}.foot{position:fixed;bottom:-8mm;left:0;right:0;text-align:center;color:#94a3b8;font-size:8px}
</style></head><body><div class="header"><div class="brand">ESTA<small>BUILDING MANAGEMENT</small></div><div class="doc"><b>TÒA NHÀ ${esc(currentBuilding.name).toLocaleUpperCase("vi-VN")}</b><br>TP. Hồ Chí Minh</div></div><div class="title"><h1>BÁO CÁO CÔNG VIỆC KỸ THUẬT</h1><p>Thời gian báo cáo: <b>${period}</b></p></div><div class="summary"><div><span>Tòa nhà</span><b>${esc(currentBuilding.name)}</b></div><div><span>Tổng công việc</span><b>${a.length}</b></div><div><span>Hoàn thành</span><b>${done}</b></div><div><span>Đang xử lý</span><b>${doing}</b></div><div><span>Chờ xử lý</span><b>${wait}</b></div></div>
${a.map((x,i)=>`<section class="job"><div class="jobHead"><div class="no">${i+1}</div><h3>${esc(x.c)}</h3></div><div class="details"><div><span>Ngày thực hiện:</span> <b>${fmt(x.d)}</b></div><div><span>Loại công việc:</span> <b>${esc(x.t||"Hằng ngày")}</b></div><div><span>Trạng thái:</span> <b>${esc(x.s)}</b></div><div><span>Người thực hiện:</span> <b>${esc(x.a||"—")}</b></div></div>${x.n?`<div class="note"><b>Ghi chú:</b> ${esc(x.n)}</div>`:""}${x.imgs?.length?`<div class="photos"><div class="photoTitle">HÌNH ẢNH THỰC TẾ</div>${x.imgs.map(v=>'<img src="'+v+'">').join("")}</div>`:""}</section>`).join("")}<div class="sign"><div><b>NGƯỜI LẬP BÁO CÁO</b><small>(Ký và ghi rõ họ tên)</small><div class="signSpace"></div></div><div><b>ĐẠI DIỆN BAN QUẢN LÝ</b><small>(Ký và ghi rõ họ tên)</small><div class="signSpace"></div></div></div><div class="foot">ESTA Building Management · ${esc(currentBuilding.name)}</div><script>window.onload=()=>setTimeout(()=>window.print(),700)<\/script></body></html>`}function openReport(a){if(!a.length){toast("Không có dữ liệu để xuất PDF");return}let w=open("","_blank");w.document.write(reportHtml(a));w.document.close()}$("#exportBtn").onclick=()=>$("#exportModal").classList.remove("hide");$("#closeExport").onclick=()=>$("#exportModal").classList.add("hide");$("#exportModal").onclick=e=>{if(e.target===$("#exportModal"))$("#exportModal").classList.add("hide")};document.querySelectorAll(".exportChoices button").forEach(b=>b.onclick=()=>{let kind=b.dataset.range,a;if(kind==="current")a=filtered();else{let r=rangeDates(kind);a=filtered(r.from,r.to)}$("#exportModal").classList.add("hide");openReport(a)});document.addEventListener("keydown",e=>{if(e.key==="Escape"){$("#viewer").classList.add("hide");$("#exportModal").classList.add("hide")}});$("#today").textContent=new Date().toLocaleDateString("vi-VN")

/* ===== MODULE NĂNG LƯỢNG ===== */
const energyStorageKey=()=>currentBuilding.id==="62THL"?"qlkt62_energy_v1":"qlkt_energy_"+currentBuilding.id;
let energyType="electric";
const ENERGY_META={
 electric:{name:"Chỉ số điện",form:"Ghi chỉ số điện",unit:"kWh",valueLabel:"Chỉ số điện (kWh)"},
 water:{name:"Chỉ số nước",form:"Ghi chỉ số nước",unit:"m³",valueLabel:"Chỉ số nước (m³)"},
 solar:{name:"Năng lượng mặt trời",form:"Ghi sản lượng điện mặt trời",unit:"kWh",valueLabel:"Sản lượng điện (kWh)"}
};
function energyLoad(){try{const a=JSON.parse(localStorage.getItem(energyStorageKey())||"[]");return Array.isArray(a)?a:[]}catch(e){return[]}}
function energySaveAll(a){localStorage.setItem(energyStorageKey(),JSON.stringify(a))}
function showModule(name){
 const pages={work:"#workPage",energy:"#energyPage",inventory:"#inventoryPage",maintenance:"#maintenancePage",contractor:"#contractorPage"};
 const tops={work:"#topWorkTitle",energy:"#topEnergyTitle",inventory:"#topInventoryTitle",maintenance:"#topMaintenanceTitle",contractor:"#topContractorTitle"};
 const navs={work:"#navWork",energy:"#navEnergy",inventory:"#navInventory",maintenance:"#navMaintenance",contractor:"#navContractor"};
 $("#homePage").classList.add("hide");$("#adminPage").classList.add("hide");
 Object.values(pages).forEach(s=>$(s)?.classList.add("hide"));
 $("#workHero").classList.add("hide");$("#energyHero").classList.add("hide");
 $("#topHomeTitle").classList.add("hide");$("#topAdminTitle").classList.add("hide");
 Object.values(tops).forEach(s=>$(s)?.classList.add("hide"));
 $("#navHome").classList.remove("active");$("#navAdmin").classList.remove("active");
 Object.values(navs).forEach(s=>$(s)?.classList.remove("active"));
 $(pages[name])?.classList.remove("hide");$(tops[name])?.classList.remove("hide");$(navs[name])?.classList.add("active");
 $("#app").classList.remove("adminMode","homeMode","energyMode","inventoryMode","maintenanceMode","contractorMode");
 $("#app").classList.add(name+"Mode");
 document.querySelector("aside").classList.remove("open");
 if(name==="energy")renderEnergy();
 if(name==="inventory"){
   const now=new Date();
   inventoryActiveMonth=now.getMonth()+1;
   inventorySetYears();
   if($("#inventoryYear"))$("#inventoryYear").value=String(now.getFullYear());
   setInventoryTab("materials");
   loadInventoryData(currentBuilding.id);
 }
 if(name==="maintenance")loadMaintenanceData(currentBuilding.id);
 if(name==="contractor"){selectedContractorId="";$("#contractorPage").classList.remove("contractorDetailMode");$("#contractorDetail").classList.add("hide");$("#contractorOverview").classList.remove("hide");loadContractorData(currentBuilding.id)}
}
$("#navHome").onclick=()=>showHome();
$("#navAdmin").onclick=()=>openAdminPortal();
$("#navWork").onclick=()=>showModule("work");
$("#navEnergy").onclick=()=>showModule("energy");
$("#navInventory").onclick=()=>showModule("inventory");
$("#navMaintenance").onclick=()=>showModule("maintenance");
$("#navContractor").onclick=()=>showModule("contractor");
$("#homeViewAllTasks").onclick=()=>$("#navWork").classList.contains("hide")?toast("Hãy mở một dự án trước"):showModule("work");
$("#homeOpenEnergy").onclick=()=>$("#navEnergy").classList.contains("hide")?toast("Hãy mở một dự án trước"):showModule("energy");
$("#homeOpenProjects").onclick=()=>openAdminPortal();
$("#quickAddTask").onclick=()=>{if($("#navWork").classList.contains("hide"))return toast("Hãy mở một dự án trước");showModule("work");setTimeout(()=>$("#content").focus(),60)};
$("#quickElectric").onclick=()=>{if($("#navEnergy").classList.contains("hide"))return toast("Hãy mở một dự án trước");energyType="electric";showModule("energy");document.querySelectorAll("[data-energy-type]").forEach(b=>b.classList.toggle("active",b.dataset.energyType==="electric"));resetEnergyForm();setTimeout(()=>$("#energyValue").focus(),60)};
$("#quickWater").onclick=()=>{if($("#navEnergy").classList.contains("hide"))return toast("Hãy mở một dự án trước");energyType="water";showModule("energy");document.querySelectorAll("[data-energy-type]").forEach(b=>b.classList.toggle("active",b.dataset.energyType==="water"));resetEnergyForm();setTimeout(()=>$("#energyValue").focus(),60)};
$("#quickReport").onclick=()=>{if($("#navWork").classList.contains("hide"))return toast("Hãy mở một dự án trước");showModule("work");setTimeout(()=>$("#exportModal").classList.remove("hide"),60)};

$("#energyToday").textContent=new Date().toLocaleDateString("vi-VN");
document.querySelectorAll("[data-energy-type]").forEach(b=>b.onclick=()=>{
 energyType=b.dataset.energyType;
 document.querySelectorAll("[data-energy-type]").forEach(x=>x.classList.toggle("active",x===b));
 resetEnergyForm();
 renderEnergy();
});
function resetEnergyForm(){
 const m=ENERGY_META[energyType];
 $("#energyEditId").value="";
 $("#energyDate").value=today();
 $("#energyValue").value="";
 setPeopleSelected("energy",[]);
 $("#energyNote").value="";
 $("#energyImage").value="";
 $("#energyImagePreview").innerHTML="";
 $("#energySaveBtn").textContent="Lưu";
 $("#energyCancelEdit").classList.add("hide");
 $("#energyFormTitle").textContent=m.form;
 $("#energyUnitHint").textContent="Đơn vị: "+m.unit;
 $("#energyValueLabel").textContent=m.valueLabel;
 $("#energyValueColumn").textContent="Chỉ số ("+m.unit+")";
 $("#energyTableTitle").textContent="Bảng theo dõi "+m.name.toLowerCase();
}
$("#energyCancelEdit").onclick=resetEnergyForm;
let energyPreviewObjectUrl="";
$("#energyImage").onchange=e=>{
 const f=e.target.files[0];
 if(energyPreviewObjectUrl){URL.revokeObjectURL(energyPreviewObjectUrl);energyPreviewObjectUrl=""}
 if(!f){$("#energyImagePreview").innerHTML="";return}
 if(!f.type.startsWith("image/")){toast("Chỉ hỗ trợ file hình ảnh");e.target.value="";return}
 energyPreviewObjectUrl=URL.createObjectURL(f);
 $("#energyImagePreview").innerHTML='<img src="'+energyPreviewObjectUrl+'" alt="Ảnh đồng hồ"><span>Ảnh đã chọn</span>';
};
$("#energyForm").onsubmit=async e=>{
 e.preventDefault();
 if(!canProjectEdit()){toast("Tài khoản này chỉ có quyền xem");return}
 if(!energySelectedPeople.length){toast("Vui lòng chọn ít nhất 1 người thực hiện");$("#energyPeopleButton").focus();return}
 const btn=$("#energySaveBtn");btn.disabled=true;
 try{
  const editId=$("#energyEditId").value,id=editId||Date.now();
  const all=energyLoad(),old=editId?all.find(x=>String(x.id)===String(editId)):null;
  let image=old?.image||"";
  const f=$("#energyImage").files[0];
  if(f){
    const blob=await imageFileToBlob(f);
    image=await uploadMediaBlob(blob,"energy",id,0);
  }
  const obj={
    id,
    type:energyType,
    date:$("#energyDate").value,
    value:Number($("#energyValue").value),
    a:energySelectedPeople.join(", "),
    performers:[...energySelectedPeople],
    note:$("#energyNote").value.trim(),
    image,
    createdAt:old?.createdAt||new Date().toISOString()
  };
  const next=editId?all.map(x=>String(x.id)===String(editId)?obj:x):[obj,...all];
  energySaveAll(next);
  await syncEnergyRecord("upsert_energy",obj);
  resetEnergyForm();renderEnergy();renderHomeDashboard();toast(editId?"Đã cập nhật chỉ số":"Đã lưu chỉ số");
 }catch(err){toast(err.message||"Không thể lưu dữ liệu")}
 finally{btn.disabled=false}
};
function energyRangeFiltered(){
 let a=energyLoad().filter(x=>x.type===energyType);
 const f=$("#energyFromDate").value,e=$("#energyToDate").value;
 if(f)a=a.filter(x=>x.date>=f);
 if(e)a=a.filter(x=>x.date<=e);
 return a.sort((x,y)=>x.date.localeCompare(y.date)||Number(x.id)-Number(y.id));
}
function energyFmt(v){return Number(v).toLocaleString("vi-VN",{maximumFractionDigits:2})}
function weekday(d){return new Date(d+"T00:00:00").toLocaleDateString("vi-VN",{weekday:"long"})}
function energyRows(){
 const all=energyLoad().filter(x=>x.type===energyType).sort((a,b)=>a.date.localeCompare(b.date)||Number(a.id)-Number(b.id));
 const prevMap={};
 all.forEach((x,i)=>prevMap[String(x.id)]=i?x.value-all[i-1].value:null);
 return energyRangeFiltered().map(x=>({...x,diff:prevMap[String(x.id)]}));
}
function renderEnergy(){
 const m=ENERGY_META[energyType];
 $("#energyFormTitle").textContent=m.form;
 $("#energyUnitHint").textContent="Đơn vị: "+m.unit;
 $("#energyValueLabel").textContent=m.valueLabel;
 $("#energyValueColumn").textContent="Chỉ số ("+m.unit+")";
 $("#energyTableTitle").textContent="Bảng theo dõi "+m.name.toLowerCase();
 const rows=energyRows(),latest=rows.length?rows[rows.length-1]:null;
 const usableDiffs=rows.filter(x=>typeof x.diff==="number"&&Number.isFinite(x.diff)&&x.diff>=0);
 const totalUse=usableDiffs.length?usableDiffs.reduce((s,x)=>s+x.diff,0):null;
 const totalLabel=energyType==="electric"?"Tổng điện":energyType==="water"?"Tổng nước":"Tổng điện mặt trời";
 $("#energyRecordCount").textContent=rows.length;
 $("#energyLatestValue").textContent=latest?energyFmt(latest.value)+" "+m.unit:"—";
 $("#energyPeriodUse").textContent=totalUse!==null?energyFmt(totalUse)+" "+m.unit:"—";
 const totalBox=$("#energyTotalInline");
 if(totalBox){totalBox.querySelector("span").textContent=totalLabel;totalBox.querySelector("strong").textContent=totalUse!==null?energyFmt(totalUse)+" "+m.unit:"—"}
 $("#energyEmpty").classList.toggle("hide",rows.length>0);
 $("#energyTbody").innerHTML=rows.map(x=>{
   const sun=new Date(x.date+"T00:00:00").getDay()===0;
   const diff=x.diff===null?"—":(x.diff>=0?"+":"")+energyFmt(x.diff);
   const img=x.image?'<span class="energyThumbWrap" onclick="viewEnergyImage(\''+x.id+'\')">'+mediaImgHtml(x.image,"energyThumb")+'</span>':"—";
   return '<tr class="'+(sun?"sunday":"")+'"><td class="dateCell">'+fmt(x.date)+'</td><td>'+weekday(x.date)+'</td><td class="meterValue"><b>'+energyFmt(x.value)+'</b></td><td class="meterDiff">'+diff+'</td><td>'+performerChipsHtml(x)+'</td><td>'+img+'</td><td class="noteCell">'+esc(x.note||"—")+'</td><td class="actionCell"><details class="rowActionMenu"><summary title="Thao tác">•••</summary><div><button type="button" onclick="editEnergy(\''+x.id+'\');this.closest(\'details\').removeAttribute(\'open\')">Sửa bản ghi</button>'+(x.image?'<button type="button" onclick="viewEnergyImage(\''+x.id+'\');this.closest(\'details\').removeAttribute(\'open\')">Xem hình ảnh</button>':'')+'<button class="danger" type="button" onclick="deleteEnergy(\''+x.id+'\');this.closest(\'details\').removeAttribute(\'open\')">Xóa</button></div></details></td></tr>'
 }).join("");
 $("#energyMobileCards").innerHTML=rows.map(x=>'<article class="mcard proEnergyCard '+(new Date(x.date+"T00:00:00").getDay()===0?"sunday":"")+'"><div class="mobileCardTop"><div><small>'+weekday(x.date)+' · '+fmt(x.date)+'</small><h4>'+energyFmt(x.value)+' '+m.unit+'</h4></div><span class="mobileDiff">'+(x.diff===null?"—":(x.diff>=0?"+":"")+energyFmt(x.diff))+'</span></div><div class="mobileMeta">'+performerChipsHtml(x,2)+'</div><p>'+esc(x.note||"Không có ghi chú")+'</p><div class="mobileCardFoot"><span>'+(x.image?"Có hình đồng hồ":"Không có hình")+'</span><button onclick="editEnergy(\''+x.id+'\')">Chỉnh sửa →</button></div></article>').join("");
 $("#energySummaryText").textContent=rows.length?"Đang hiển thị "+rows.length+" bản ghi · Tổng được tính theo bộ lọc hiện tại.":"Theo dõi lịch sử chỉ số và mức tiêu thụ theo ngày.";
 hydrateMediaImages($("#energyTbody"));
}
window.editEnergy=id=>{
 if(!canProjectEdit()){toast("Tài khoản này chỉ có quyền xem");return}
 const x=energyLoad().find(v=>String(v.id)===String(id));if(!x)return;
 energyType=x.type;
 document.querySelectorAll("[data-energy-type]").forEach(b=>b.classList.toggle("active",b.dataset.energyType===energyType));
 $("#energyEditId").value=x.id;$("#energyDate").value=x.date;$("#energyValue").value=x.value;setPeopleSelected("energy",performerArray(x));$("#energyNote").value=x.note||"";
 $("#energyImagePreview").innerHTML=x.image?mediaImgHtml(x.image,"")+'<span>Ảnh hiện tại</span>':"";hydrateMediaImages($("#energyImagePreview"));
 $("#energySaveBtn").textContent="Cập nhật";$("#energyCancelEdit").classList.remove("hide");renderEnergy();
 window.scrollTo({top:0,behavior:"smooth"});
};
window.deleteEnergy=async id=>{if(!canProjectEdit()){toast("Tài khoản này chỉ có quyền xem");return}if(!confirm("Xóa bản ghi chỉ số này?"))return;energySaveAll(energyLoad().filter(x=>String(x.id)!==String(id)));await syncEnergyRecord("delete_energy",id);renderEnergy();renderHomeDashboard();toast("Đã xóa bản ghi")};
window.viewEnergyImage=async id=>{const x=energyLoad().find(v=>String(v.id)===String(id));if(!x?.image)return;viewerMediaRefs=[x.image];$("#viewerImages").innerHTML='<div class="viewerMedia">'+mediaImgHtml(x.image,"viewerLargeImage")+'<button class="viewerDownloadBtn" type="button" onclick="downloadViewerMedia(0)">⇩ Tải hình</button></div>';$("#viewer").classList.remove("hide");await hydrateMediaImages($("#viewerImages"))};
function setEnergyRange(kind){
 document.querySelectorAll("[data-erange]").forEach(b=>b.classList.toggle("active",b.dataset.erange===kind));
 if(kind==="all"){$("#energyFromDate").value="";$("#energyToDate").value=""}
 else{const r=rangeDates(kind);$("#energyFromDate").value=r.from;$("#energyToDate").value=r.to}
 renderEnergy();
}
document.querySelectorAll("[data-erange]").forEach(b=>b.onclick=()=>setEnergyRange(b.dataset.erange));
$("#energyApplyFilter").onclick=renderEnergy;
$("#energyClearFilter").onclick=()=>setEnergyRange("all");
function energyReportHtml(rows){
 const m=ENERGY_META[energyType],f=$("#energyFromDate").value,e=$("#energyToDate").value,period=f||e?((f?fmt(f):"Đầu kỳ")+" - "+(e?fmt(e):"Hiện tại")):"Toàn bộ dữ liệu";
 return '<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>Báo cáo '+m.name+'</title><style>@import url("https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap");@page{size:A4;margin:14mm}body{font-family:"Inter";color:#1f2937;font-size:10px}.head{display:flex;justify-content:space-between;border-bottom:3px solid #0e4d7e;padding-bottom:9px}.brand{font-size:18px;font-weight:800;color:#0e4d7e}.brand small{display:block;font-size:8px;color:#64748b;letter-spacing:1px}.title{text-align:center;margin:16px 0}.title h1{font-size:18px;color:#0e4d7e;margin:0 0 5px}.title p{margin:0;color:#64748b}table{width:100%;border-collapse:collapse}th,td{border:1px solid #cbd5e1;padding:7px;text-align:left}th{background:#edf4fb;color:#214d72}.sun{background:#fff7d6}.photo{width:75px;height:55px;object-fit:cover}.foot{margin-top:25px;text-align:center;color:#94a3b8;font-size:8px}</style></head><body><div class="head"><div class="brand">ESTA<small>BUILDING MANAGEMENT</small></div><div>'+esc(currentBuilding.name).toLocaleUpperCase("vi-VN")+'<br>TP. Hồ Chí Minh</div></div><div class="title"><h1>BÁO CÁO '+m.name.toUpperCase()+'</h1><p>Thời gian: <b>'+period+'</b></p></div><table><thead><tr><th>Ngày</th><th>Thứ</th><th>Chỉ số ('+m.unit+')</th><th>Chênh lệch</th><th>Người thực hiện</th><th>Hình ảnh</th><th>Ghi chú</th></tr></thead><tbody>'+rows.map(x=>'<tr class="'+(new Date(x.date+"T00:00:00").getDay()===0?"sun":"")+'"><td>'+fmt(x.date)+'</td><td>'+weekday(x.date)+'</td><td><b>'+energyFmt(x.value)+'</b></td><td>'+(x.diff===null?"—":(x.diff>=0?"+":"")+energyFmt(x.diff))+'</td><td>'+esc(performerArray(x).join(", ")||"—")+'</td><td>'+(x.image?'<img class="photo" src="'+x.image+'">':"—")+'</td><td>'+esc(x.note||"—")+'</td></tr>').join("")+'</tbody></table><div class="foot">ESTA · Quản lý năng lượng · '+esc(currentBuilding.name)+'</div><script>window.onload=()=>setTimeout(()=>window.print(),600)<\/script></body></html>'
}
$("#energyExportPdf").onclick=()=>{const rows=energyRows();if(!rows.length){toast("Không có dữ liệu để xuất PDF");return}const w=open("","_blank");w.document.write(energyReportHtml(rows));w.document.close()};

function energyRowsForTypeRange(type,from,to){
 const all=energyLoad().filter(x=>x.type===type).sort((a,b)=>a.date.localeCompare(b.date)||Number(a.id)-Number(b.id));
 return all.filter(x=>(!from||x.date>=from)&&(!to||x.date<=to)).map(x=>{
   const idx=all.findIndex(v=>String(v.id)===String(x.id));
   const diff=idx>0?Number(x.value)-Number(all[idx-1].value):null;
   return {...x,diff};
 });
}
function combinedReportHtml(kind){
 let from="",to="",period="Toàn bộ dữ liệu";
 if(kind!=="all"){const r=rangeDates(kind);from=r.from;to=r.to;period=fmt(from)+" - "+fmt(to)}
 const tasks=load().filter(x=>(!from||x.d>=from)&&(!to||x.d<=to)).sort((a,b)=>a.d.localeCompare(b.d));
 const elec=energyRowsForTypeRange("electric",from,to),water=energyRowsForTypeRange("water",from,to);
 const total=(rows)=>rows.filter(x=>typeof x.diff==="number"&&Number.isFinite(x.diff)&&x.diff>=0).reduce((s,x)=>s+x.diff,0);
 const totalElec=total(elec),totalWater=total(water);
 const taskRows=tasks.length?tasks.map((x,i)=>'<tr><td>'+(i+1)+'</td><td>'+fmt(x.d)+'</td><td>'+esc(x.c)+'</td><td>'+esc(x.t)+'</td><td>'+esc(x.s)+'</td><td>'+esc(x.a||"—")+'</td><td>'+esc(x.n||"—")+'</td></tr>').join(""):'<tr><td colspan="7">Không có công việc trong kỳ.</td></tr>';
 const meterTable=(rows,unit)=>rows.length?rows.map(x=>'<tr class="'+(new Date(x.date+"T00:00:00").getDay()===0?"sun":"")+'"><td>'+fmt(x.date)+'</td><td>'+weekday(x.date)+'</td><td>'+energyFmt(x.value)+'</td><td>'+(x.diff===null?"—":(x.diff>=0?"+":"")+energyFmt(x.diff))+'</td><td>'+esc(performerArray(x).join(", ")||"—")+'</td><td>'+esc(x.note||"—")+'</td></tr>').join(""):'<tr><td colspan="6">Không có dữ liệu trong kỳ.</td></tr>';
 return '<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>Báo cáo tổng hợp ESTA</title><style>@import url("https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap");@page{size:A4;margin:12mm}*{box-sizing:border-box}body{font-family:"Inter";color:#1f2937;font-size:9px;margin:0}.head{display:flex;justify-content:space-between;border-bottom:3px solid #123d6b;padding-bottom:8px}.brand{font-size:18px;font-weight:800;color:#123d6b}.brand small{display:block;font-size:7px;letter-spacing:1px;color:#64748b}.title{text-align:center;margin:14px 0}.title h1{font-size:18px;color:#123d6b;margin:0 0 4px}.title p{margin:0;color:#64748b}.summary{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-bottom:12px}.summary div{border:1px solid #cbd5e1;border-radius:5px;padding:8px}.summary span{display:block;color:#64748b;font-size:7px}.summary b{display:block;margin-top:3px;color:#123d6b;font-size:12px}.section{page-break-before:auto;margin-top:15px}.section.page{page-break-before:always}.section h2{font-size:13px;color:#123d6b;margin:0 0 7px;padding-bottom:4px;border-bottom:2px solid #dbe7f0}table{width:100%;border-collapse:collapse}th,td{border:1px solid #cbd5e1;padding:6px;vertical-align:top}th{background:#edf4fb;color:#214d72}.sun{background:#fff7d6}.tot{margin:6px 0 8px;text-align:right;font-size:10px;color:#123d6b}.foot{margin-top:18px;text-align:center;color:#94a3b8;font-size:7px}</style></head><body><div class="head"><div class="brand">ESTA<small>BUILDING MANAGEMENT</small></div><div>'+esc(currentBuilding.name).toLocaleUpperCase("vi-VN")+'<br>TP. Hồ Chí Minh</div></div><div class="title"><h1>BÁO CÁO TỔNG HỢP KỸ THUẬT</h1><p>Thời gian: <b>'+period+'</b></p></div><div class="summary"><div><span>CÔNG VIỆC</span><b>'+tasks.length+'</b></div><div><span>TỔNG ĐIỆN</span><b>'+energyFmt(totalElec)+' kWh</b></div><div><span>TỔNG NƯỚC</span><b>'+energyFmt(totalWater)+' m³</b></div></div><div class="section"><h2>1. Công việc kỹ thuật</h2><table><thead><tr><th>STT</th><th>Ngày</th><th>Nội dung</th><th>Loại</th><th>Trạng thái</th><th>Người thực hiện</th><th>Ghi chú</th></tr></thead><tbody>'+taskRows+'</tbody></table></div><div class="section page"><h2>2. Chỉ số điện</h2><div class="tot"><b>Tổng tiêu thụ: '+energyFmt(totalElec)+' kWh</b></div><table><thead><tr><th>Ngày</th><th>Thứ</th><th>Chỉ số (kWh)</th><th>Chênh lệch</th><th>Người thực hiện</th><th>Ghi chú</th></tr></thead><tbody>'+meterTable(elec,"kWh")+'</tbody></table></div><div class="section page"><h2>3. Chỉ số nước</h2><div class="tot"><b>Tổng tiêu thụ: '+energyFmt(totalWater)+' m³</b></div><table><thead><tr><th>Ngày</th><th>Thứ</th><th>Chỉ số (m³)</th><th>Chênh lệch</th><th>Người thực hiện</th><th>Ghi chú</th></tr></thead><tbody>'+meterTable(water,"m³")+'</tbody></table></div><div class="foot">ESTA Building Management · Báo cáo tổng hợp · '+esc(currentBuilding.name)+'</div><script>window.onload=()=>setTimeout(()=>window.print(),700)<\/script></body></html>';
}
document.querySelectorAll("[data-combined-range]").forEach(b=>b.onclick=()=>{
 const kind=b.dataset.combinedRange;
 $("#exportModal").classList.add("hide");
 const w=open("","_blank");
 if(!w){toast("Trình duyệt đang chặn cửa sổ xuất PDF");return}
 w.document.write(combinedReportHtml(kind));w.document.close();
});

resetEnergyForm();
renderEnergy();
$("#app").addEventListener("input",e=>{if(shouldAutoCapitalize(e.target))applyAutoCapitalize(e.target)});



/* ===== DỤNG CỤ - VẬT TƯ ===== */
let inventoryMaterials=[],inventoryTransactions=[],inventoryTools=[],inventoryLoadedBuilding="",inventoryActiveTab="materials",inventoryActiveMonth=new Date().getMonth()+1,inventoryShowAlertsOnly=false;
const INV_MONTHS=["T1","T2","T3","T4","T5","T6","T7","T8","T9","T10","T11","T12"];
function inventoryNum(v){const n=Number(v||0);return Number.isFinite(n)?n:0}
function inventoryFmt(v){return inventoryNum(v).toLocaleString("vi-VN",{maximumFractionDigits:2})}
function inventoryYearValue(){return Number($("#inventoryYear")?.value)||new Date().getFullYear()}
function inventorySetYears(){
 const el=$("#inventoryYear");if(!el)return;
 const now=new Date().getFullYear(),old=Number(el.value)||now;
 el.innerHTML=Array.from({length:8},(_,i)=>now+2-i).map(y=>'<option value="'+y+'">'+y+'</option>').join("");
 el.value=String([...el.options].some(o=>Number(o.value)===old)?old:now);
}
function inventoryTxFor(materialId){return inventoryTransactions.filter(x=>String(x.material_id)===String(materialId))}
function inventoryTrackingStart(material){
 const raw=String(material?.tracking_start_date||material?.created_at||today()).slice(0,10);
 return /^\d{4}-\d{2}-\d{2}$/.test(raw)?raw:today();
}
function inventoryMonthEnd(year,month){
 const d=new Date(Number(year),Number(month),0);
 return d.toLocaleDateString("en-CA");
}
function inventoryStockAsOf(material,date){
 const cutoff=String(date||today()).slice(0,10),start=inventoryTrackingStart(material);
 if(cutoff<start)return null;
 return inventoryNum(material?.opening_qty)+inventoryTxFor(material?.id)
   .filter(x=>String(x.tx_date||"")>=start&&String(x.tx_date||"")<=cutoff)
   .reduce((s,x)=>s+(x.tx_type==="in"?inventoryNum(x.qty):-inventoryNum(x.qty)),0);
}
function inventorySnapshot(material,year=inventoryYearValue()){
 const trackingStart=inventoryTrackingStart(material);
 const tx=inventoryTxFor(material.id)
   .filter(x=>String(x.tx_date||"")>=trackingStart)
   .slice()
   .sort((a,b)=>String(a.tx_date).localeCompare(String(b.tx_date))||String(a.created_at||"").localeCompare(String(b.created_at||"")));
 const months=[];let totalIn=0,totalOut=0;
 for(let m=1;m<=12;m++){
   const monthStart=year+"-"+String(m).padStart(2,"0")+"-01";
   const monthEnd=inventoryMonthEnd(year,m);
   if(monthEnd<trackingStart){
     months.push({active:false,begin:null,inQty:0,outQty:0,stock:null});
     continue;
   }
   const begin=inventoryNum(material.opening_qty)+tx
     .filter(x=>String(x.tx_date||"")<monthStart)
     .reduce((s,x)=>s+(x.tx_type==="in"?inventoryNum(x.qty):-inventoryNum(x.qty)),0);
   let inn=0,out=0;
   tx.filter(x=>String(x.tx_date||"")>=monthStart&&String(x.tx_date||"")<=monthEnd).forEach(x=>{
     if(x.tx_type==="in")inn+=inventoryNum(x.qty);else out+=inventoryNum(x.qty);
   });
   totalIn+=inn;totalOut+=out;
   months.push({active:true,begin,inQty:inn,outQty:out,stock:begin+inn-out});
 }
 const current=inventoryStockAsOf(material,today());
 const activeMonths=months.filter(x=>x.active);
 return {
   trackingStart,
   opening:activeMonths.length?activeMonths[0].begin:null,
   totalIn,totalOut,
   closing:activeMonths.length?activeMonths[activeMonths.length-1].stock:null,
   current,
   months
 };
}
function inventoryFillPeople(){
 const names=projectPeople.map(x=>x.name).filter(Boolean);
 ["stockTxnPerformer","maintenanceAssigned","maintenanceRecordPerformer"].forEach(id=>{
   const el=$("#"+id);if(!el)return;
   const old=el.value;
   el.innerHTML='<option value="">— Chọn —</option>'+names.map(n=>'<option value="'+esc(n)+'">'+esc(n)+'</option>').join("");
   if(names.includes(old))el.value=old;
 });
}
async function loadInventoryData(buildingId=currentBuilding?.id,force=false){
 if(!centralSession?.access_token||!buildingId)return;
 if(!force&&inventoryLoadedBuilding===buildingId){renderInventory();return}
 try{
   const b=encodeURIComponent(buildingId),token=centralSession.access_token;
   [inventoryMaterials,inventoryTransactions,inventoryTools]=await Promise.all([
     sbFetch("/rest/v1/inventory_materials?select=*&building_id=eq."+b+"&order=name.asc",{token}),
     sbFetch("/rest/v1/inventory_material_transactions?select=*&building_id=eq."+b+"&order=tx_date.desc,created_at.desc",{token}),
     sbFetch("/rest/v1/inventory_tools?select=*&building_id=eq."+b+"&order=name.asc",{token})
   ]);
   inventoryMaterials=Array.isArray(inventoryMaterials)?inventoryMaterials:[];
   inventoryTransactions=Array.isArray(inventoryTransactions)?inventoryTransactions:[];
   inventoryTools=Array.isArray(inventoryTools)?inventoryTools:[];
   inventoryLoadedBuilding=buildingId;inventoryShowAlertsOnly=false;inventoryFillPeople();renderInventory();
 }catch(e){console.warn("Load inventory failed",e);toast("Không tải được dữ liệu vật tư")}
}
function renderInventory(){
 inventorySetYears();
 renderMaterials();
 renderTools();
}
function inventoryStockAlerts(){
 const y=new Date().getFullYear();
 return inventoryMaterials.map(m=>{
   const current=inventorySnapshot(m,y).current,min=inventoryNum(m.min_qty);
   const severity=current<=0?"out":min>0&&current<=min?"low":"ok";
   return {m,current,min,severity};
 }).filter(x=>x.severity!=="ok").sort((a,b)=>{
   const rank={out:0,low:1};
   return rank[a.severity]-rank[b.severity]||a.current-b.current||String(a.m.name).localeCompare(String(b.m.name),"vi");
 });
}
function renderStockAlerts(){
 const alerts=inventoryStockAlerts();
 $("#stockAlertCount").textContent=alerts.length;
 $("#stockAlertOnly").classList.toggle("active",inventoryShowAlertsOnly);
 $("#stockAlertOnly").textContent=inventoryShowAlertsOnly?"Hiện tất cả vật tư":"Chỉ xem cảnh báo";
 const box=$("#stockAlertList");
 if(!alerts.length){
   box.innerHTML='<div class="stockAlertEmpty"><span>✓</span><div><b>Tồn kho đang ổn định</b><small>Không có vật tư nào bằng hoặc thấp hơn mức tồn tối thiểu.</small></div></div>';
   return;
 }
 box.innerHTML=alerts.map(({m,current,min,severity})=>{
   const out=severity==="out";
   return '<article class="stockAlertItem '+severity+'">'+
     '<div class="stockAlertStatus">'+(out?"HẾT HÀNG":"SẮP HẾT")+'</div>'+
     '<div class="stockAlertName"><b>'+esc(m.name)+'</b><small>'+esc(m.code||"Không mã")+' · '+esc(m.unit)+'</small></div>'+
     '<div class="stockAlertMetric"><span>Tồn hiện tại</span><b>'+inventoryFmt(current)+' '+esc(m.unit)+'</b></div>'+
     '<div class="stockAlertMetric"><span>Mức tối thiểu</span><b>'+inventoryFmt(min)+' '+esc(m.unit)+'</b></div>'+
     '<div class="stockAlertActions"><button type="button" onclick="openLowStockReplenish(\''+m.id+'\')">＋ Nhập kho</button><button type="button" class="ghost" onclick="editMaterial(\''+m.id+'\')">Sửa định mức</button></div>'+
   '</article>';
 }).join("");
}
window.openLowStockReplenish=id=>{
 openStockTxnModal(id);
 $("#stockTxnType").value="in";
 $("#stockTxnDate").value=today();
 setTimeout(()=>$("#stockTxnQty").focus(),50);
};
function renderMaterials(){
 const y=inventoryYearValue(),month=Math.max(1,Math.min(12,Number(inventoryActiveMonth)||1));
 const q=($("#materialSearch")?.value||"").trim().toLocaleLowerCase("vi-VN");
 const alertIds=new Set(inventoryStockAlerts().map(x=>String(x.m.id)));
 const monthEnd=inventoryMonthEnd(y,month);
 const list=inventoryMaterials.filter(m=>inventoryTrackingStart(m)<=monthEnd&&(!inventoryShowAlertsOnly||alertIds.has(String(m.id)))&&(!q||[m.name,m.code,m.unit,m.note].some(v=>String(v||"").toLocaleLowerCase("vi-VN").includes(q))));
 const snaps=list.map(m=>{const s=inventorySnapshot(m,y);return {m,s,mm:s.months[month-1]}}).filter(x=>x.mm?.active);

 document.querySelectorAll("[data-material-month]").forEach(b=>{
   const active=Number(b.dataset.materialMonth)===month;
   b.classList.toggle("active",active);
   b.setAttribute("aria-current",active?"true":"false");
 });
 const monthText="Tháng "+String(month).padStart(2,"0")+" / "+y;
 $("#materialMonthLabel").textContent=monthText;
 $("#materialSelectedMonth").textContent=monthText;
 $("#materialTitleCount").textContent="("+list.length+" mục)";

 const allMonth=inventoryMaterials.map(m=>({m,mm:inventorySnapshot(m,y).months[month-1]})).filter(x=>x.mm?.active);
 const totalIn=allMonth.reduce((s,x)=>s+inventoryNum(x.mm?.inQty),0);
 const totalOut=allMonth.reduce((s,x)=>s+inventoryNum(x.mm?.outQty),0);
 const inStock=allMonth.filter(x=>inventoryNum(x.mm?.stock)>0).length;
 const low=allMonth.filter(x=>inventoryNum(x.m.min_qty)>0&&inventoryNum(x.mm?.stock)<=inventoryNum(x.m.min_qty)).length;
 $("#materialMonthIn").textContent=inventoryFmt(totalIn);
 $("#materialMonthOut").textContent=inventoryFmt(totalOut);
 $("#materialInStockCount").textContent=inStock;
 $("#materialLowStock").textContent=low;
 renderStockAlerts();

 const moveIcon='<svg viewBox="0 0 24 24"><path d="M7 7h10M13 3l4 4-4 4M17 17H7M11 13l-4 4 4 4"/></svg>';
 const editIcon='<svg viewBox="0 0 24 24"><path d="M4 20h4l11-11-4-4L4 16v4zM13.5 6.5l4 4"/></svg>';
 const trashIcon='<svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5"/></svg>';

 $("#materialMatrixBody").innerHTML=snaps.map(({m,mm},i)=>{
   const lowRow=inventoryNum(m.min_qty)>0&&inventoryNum(mm.stock)<=inventoryNum(m.min_qty);
   return '<tr class="'+(lowRow?"lowStock":"")+'">'+
     '<td class="sttCell">'+(i+1)+'</td>'+
     '<td class="materialNameCell"><b>'+esc(m.name)+'</b><small>'+esc(m.code||"")+(inventoryTrackingStart(m).slice(0,7)===y+"-"+String(month).padStart(2,"0")?' · Bắt đầu '+fmt(inventoryTrackingStart(m)):'')+'</small></td>'+
     '<td>'+esc(m.unit)+'</td>'+
     '<td><b>'+inventoryFmt(mm.begin)+'</b></td>'+
     '<td class="inText">'+inventoryFmt(mm.inQty)+'</td>'+
     '<td class="outText">'+inventoryFmt(mm.outQty)+'</td>'+
     '<td><b class="stockFinal '+(lowRow?"low":"")+'">'+inventoryFmt(mm.stock)+'</b></td>'+
     '<td><div class="invRowActions compact">'+
       '<button class="move" title="Nhập / Xuất" onclick="openStockTxnModal(\''+m.id+'\')">'+moveIcon+'</button>'+
       '<button title="Sửa" onclick="editMaterial(\''+m.id+'\')">'+editIcon+'</button>'+
       '<button title="Xóa" class="danger" onclick="deleteMaterial(\''+m.id+'\')">'+trashIcon+'</button>'+
     '</div></td>'+
   '</tr>';
 }).join("");
 $("#materialEmpty").classList.toggle("hide",list.length>0);

 const byId=Object.fromEntries(inventoryMaterials.map(m=>[m.id,m]));
 const prefix=y+"-"+String(month).padStart(2,"0");
 const tx=inventoryTransactions.filter(x=>String(x.tx_date||"").startsWith(prefix)&&byId[x.material_id]&&inventoryTrackingStart(byId[x.material_id])<=String(x.tx_date||"")).slice(0,60);
 $("#materialTxnSubtitle").textContent="Các phát sinh trong tháng "+String(month).padStart(2,"0")+" / "+y+".";
 $("#materialTxnBody").innerHTML=tx.map(x=>'<tr><td>'+fmt(x.tx_date)+'</td><td><b>'+esc(byId[x.material_id]?.name||"Vật tư đã xóa")+'</b></td><td><span class="stockType '+x.tx_type+'">'+(x.tx_type==="in"?"Nhập":"Xuất")+'</span></td><td><b>'+inventoryFmt(x.qty)+'</b></td><td>'+esc(x.performer||"—")+'</td><td>'+esc(x.note||"—")+'</td><td><button class="miniDanger" onclick="deleteStockTxn(\''+x.id+'\')">'+trashIcon+'</button></td></tr>').join("");
 $("#materialTxnEmpty").classList.toggle("hide",tx.length>0);

 const sel=$("#stockTxnMaterial"),old=sel.value;
 const selectable=inventoryMaterials.filter(m=>inventoryTrackingStart(m)<=monthEnd);
 sel.innerHTML='<option value="">— Chọn vật tư —</option>'+selectable.map(m=>'<option value="'+m.id+'">'+esc(m.name)+' · tồn '+inventoryFmt(inventoryStockAsOf(m,today())??0)+' '+esc(m.unit)+'</option>').join("");
 if(selectable.some(m=>m.id===old))sel.value=old;
}
function renderTools(){
 const q=($("#toolSearch")?.value||"").trim().toLocaleLowerCase("vi-VN");
 const list=inventoryTools.filter(t=>!q||[t.name,t.code,t.brand,t.location,t.note,t.condition_status].some(v=>String(v||"").toLocaleLowerCase("vi-VN").includes(q)));
 $("#toolCount").textContent=inventoryTools.length;
 $("#toolGoodCount").textContent=inventoryTools.filter(x=>x.condition_status==="Tốt"||x.condition_status==="Đang sử dụng").length;
 $("#toolRepairCount").textContent=inventoryTools.filter(x=>["Cần kiểm tra","Cần sửa","Hỏng","Hư hỏng"].includes(x.condition_status)).length;

 const editIcon='<svg viewBox="0 0 24 24"><path d="M4 20h4l11-11-4-4L4 16v4zM13.5 6.5l4 4"/></svg>';
 const trashIcon='<svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5"/></svg>';

 $("#toolsBody").innerHTML=list.map((t,i)=>'<tr>'+
   '<td class="sttCell">'+(i+1)+'</td>'+
   '<td class="toolNameCell"><div><b>'+esc(t.name)+'</b><small>'+esc(t.code||"")+'</small></div></td>'+
   '<td>'+esc(t.brand||"—")+'</td>'+
   '<td><b>'+inventoryFmt(t.qty)+'</b> <small>'+esc(t.unit)+'</small></td>'+
   '<td>'+esc(t.location||"—")+'</td>'+
   '<td><span class="toolCondition '+(["Tốt","Đang sử dụng"].includes(t.condition_status)?"good":["Hỏng","Hư hỏng","Cần sửa"].includes(t.condition_status)?"bad":"warn")+'">'+esc(t.condition_status)+'</span></td>'+
   '<td class="toolNoteCell" title="'+esc(t.note||"")+'">'+esc(t.note||"—")+'</td>'+
   '<td><div class="invRowActions compact"><button title="Sửa" onclick="editTool(\''+t.id+'\')">'+editIcon+'</button><button title="Xóa" class="danger" onclick="deleteTool(\''+t.id+'\')">'+trashIcon+'</button></div></td>'+
 '</tr>').join("");
 $("#toolsEmpty").classList.toggle("hide",list.length>0);
}
function setInventoryTab(tab){
 inventoryActiveTab=tab;
 if(tab==="materials"&&$("#inventoryPage")&&!$("#inventoryPage").classList.contains("hide")){
   const now=new Date();
   inventoryActiveMonth=now.getMonth()+1;
   inventorySetYears();
   if($("#inventoryYear"))$("#inventoryYear").value=String(now.getFullYear());
 }
 document.querySelectorAll("[data-inventory-tab]").forEach(b=>b.classList.toggle("active",b.dataset.inventoryTab===tab));
 $("#inventoryMaterialsPane").classList.toggle("hide",tab!=="materials");
 $("#inventoryToolsPane").classList.toggle("hide",tab!=="tools");
}
function resetMaterialForm(sampleName="",sampleUnit="Cái"){
 $("#materialId").value="";$("#materialCode").value="";$("#materialName").value=sampleName;$("#materialUnit").value=sampleUnit||"Cái";
 $("#materialTrackingStart").value=today();$("#materialTrackingStart").max=today();$("#materialOpeningQty").value="0";$("#materialMinQty").value="0";$("#materialNote").value="";
 $("#materialModalTitle").textContent="Thêm vật tư";
}
function openMaterialModal(sampleName="",sampleUnit="Cái"){resetMaterialForm(sampleName,sampleUnit);$("#materialItemModal").classList.remove("hide");setTimeout(()=>$("#materialName").focus(),40)}
window.editMaterial=id=>{
 const m=inventoryMaterials.find(x=>String(x.id)===String(id));if(!m)return;
 $("#materialId").value=m.id;$("#materialCode").value=m.code||"";$("#materialName").value=m.name;$("#materialUnit").value=m.unit;$("#materialTrackingStart").value=inventoryTrackingStart(m);$("#materialTrackingStart").max=today();$("#materialOpeningQty").value=m.opening_qty;$("#materialMinQty").value=m.min_qty;$("#materialNote").value=m.note||"";
 $("#materialModalTitle").textContent="Chỉnh sửa vật tư";$("#materialItemModal").classList.remove("hide");
};
window.deleteMaterial=async id=>{
 if(!canProjectEdit())return toast("Tài khoản này chỉ có quyền xem");
 const m=inventoryMaterials.find(x=>String(x.id)===String(id));if(!m||!confirm("Xóa vật tư “"+m.name+"” và toàn bộ lịch sử nhập/xuất?"))return;
 try{await sbFetch("/rest/v1/inventory_materials?id=eq."+encodeURIComponent(id)+"&building_id=eq."+encodeURIComponent(currentBuilding.id),{method:"DELETE",token:centralSession.access_token});await loadInventoryData(currentBuilding.id,true);toast("Đã xóa vật tư")}catch(e){toast(e.message)}
};
window.openStockTxnModal=id=>{
 if(!inventoryMaterials.length)return toast("Hãy thêm vật tư trước");
 const y=inventoryYearValue(),m=Math.max(1,Math.min(12,Number(inventoryActiveMonth)||1));
 const now=new Date(),same=y===now.getFullYear()&&m===now.getMonth()+1;
 const day=same?now.getDate():1;
 const maxDay=new Date(y,m,0).getDate();
 const date=y+"-"+String(m).padStart(2,"0")+"-"+String(Math.min(day,maxDay)).padStart(2,"0");
 $("#stockTxnId").value="";$("#stockTxnDate").value=date;$("#stockTxnType").value="in";$("#stockTxnQty").value="";$("#stockTxnPerformer").value="";$("#stockTxnNote").value="";
 renderMaterials();if(id)$("#stockTxnMaterial").value=id;
 const chosen=inventoryMaterials.find(x=>x.id===$("#stockTxnMaterial").value);
 $("#stockTxnDate").max=today();
 $("#stockTxnDate").min=chosen?inventoryTrackingStart(chosen):"";
 if(chosen&&$("#stockTxnDate").value<inventoryTrackingStart(chosen))$("#stockTxnDate").value=inventoryTrackingStart(chosen);
 $("#stockTxnModal").classList.remove("hide");
};
window.deleteStockTxn=async id=>{
 if(!canProjectEdit())return toast("Tài khoản này chỉ có quyền xem");
 if(!confirm("Xóa giao dịch nhập/xuất này?"))return;
 try{await sbFetch("/rest/v1/inventory_material_transactions?id=eq."+encodeURIComponent(id)+"&building_id=eq."+encodeURIComponent(currentBuilding.id),{method:"DELETE",token:centralSession.access_token});await loadInventoryData(currentBuilding.id,true);toast("Đã xóa giao dịch")}catch(e){toast(e.message)}
};
function resetToolForm(sampleName="",sampleUnit="Cái"){
 $("#toolId").value="";$("#toolCode").value="";$("#toolName").value=sampleName;$("#toolBrand").value="";$("#toolQty").value="1";$("#toolUnit").value=sampleUnit||"Cái";$("#toolLocation").value="";$("#toolCondition").value="Tốt";$("#toolAcquiredDate").value="";$("#toolNote").value="";$("#toolModalTitle").textContent="Thêm dụng cụ";
}
function openToolModal(sampleName="",sampleUnit="Cái"){resetToolForm(sampleName,sampleUnit);inventoryFillPeople();$("#toolItemModal").classList.remove("hide");setTimeout(()=>$("#toolName").focus(),40)}
window.editTool=id=>{
 const t=inventoryTools.find(x=>String(x.id)===String(id));if(!t)return;
 inventoryFillPeople();$("#toolId").value=t.id;$("#toolCode").value=t.code||"";$("#toolName").value=t.name;$("#toolBrand").value=t.brand||"";$("#toolQty").value=t.qty;$("#toolUnit").value=t.unit;$("#toolLocation").value=t.location||"";$("#toolCondition").value=t.condition_status;$("#toolAcquiredDate").value=t.acquired_date||"";$("#toolNote").value=t.note||"";$("#toolModalTitle").textContent="Chỉnh sửa dụng cụ";$("#toolItemModal").classList.remove("hide");
};
window.deleteTool=async id=>{
 if(!canProjectEdit())return toast("Tài khoản này chỉ có quyền xem");
 const t=inventoryTools.find(x=>String(x.id)===String(id));if(!t||!confirm("Xóa dụng cụ “"+t.name+"”?"))return;
 try{await sbFetch("/rest/v1/inventory_tools?id=eq."+encodeURIComponent(id)+"&building_id=eq."+encodeURIComponent(currentBuilding.id),{method:"DELETE",token:centralSession.access_token});await loadInventoryData(currentBuilding.id,true);toast("Đã xóa dụng cụ")}catch(e){toast(e.message)}
};
function inventoryPrintWindow(html){
 const w=open("","_blank");if(!w){toast("Trình duyệt đang chặn cửa sổ PDF");return}
 w.document.write(html);w.document.close();
}
function inventoryPdfCss(landscape=false){return '@page{size:A4 '+(landscape?"landscape":"portrait")+';margin:10mm}*{box-sizing:border-box}body{font-family:"Inter";color:#243746;font-size:9px;margin:0}.head{display:flex;justify-content:space-between;border-bottom:2px solid #123d5b;padding-bottom:7px;margin-bottom:10px}.brand{font-size:18px;font-weight:800;color:#8c6854}.brand small{display:block;font-size:7px;color:#647988;letter-spacing:1px}.doc{text-align:right;color:#667b89}.title{text-align:center;margin:12px 0}.title h1{font-size:17px;color:#173d58;margin:0 0 4px}.title p{margin:0;color:#6f8390}table{width:100%;border-collapse:collapse}th,td{border:1px solid #cdd8df;padding:4px;vertical-align:top}th{background:#edf4f7;color:#345569;font-size:7px}td b{color:#173d58}.month{font-size:7px;line-height:1.45}.in{color:#25825a}.out{color:#b55f55}.summary{display:flex;gap:8px;margin:10px 0}.summary div{border:1px solid #d6e0e5;padding:7px;flex:1}.summary span{display:block;color:#78909c;font-size:7px}.summary b{font-size:12px}.foot{position:fixed;bottom:-5mm;left:0;right:0;text-align:center;color:#9aa8b0;font-size:7px}';
}
function materialReportHtml(){
 const y=inventoryYearValue(),month=Math.max(1,Math.min(12,Number(inventoryActiveMonth)||1));
 const activeMaterials=inventoryMaterials.filter(m=>inventorySnapshot(m,y).months[month-1]?.active);
 const rows=activeMaterials.map((m,i)=>{
   const mm=inventorySnapshot(m,y).months[month-1];
   return '<tr><td>'+(i+1)+'</td><td><b>'+esc(m.name)+'</b><br>'+esc(m.code||"")+'</td><td>'+esc(m.unit)+'</td><td>'+inventoryFmt(mm.begin)+'</td><td class="in">'+inventoryFmt(mm.inQty)+'</td><td class="out">'+inventoryFmt(mm.outQty)+'</td><td><b>'+inventoryFmt(mm.stock)+'</b></td></tr>';
 }).join("");
 const snaps=activeMaterials.map(m=>({m,mm:inventorySnapshot(m,y).months[month-1]}));
 const tin=snaps.reduce((a,x)=>a+x.mm.inQty,0),tout=snaps.reduce((a,x)=>a+x.mm.outQty,0),instock=snaps.filter(x=>x.mm.stock>0).length,low=snaps.filter(x=>inventoryNum(x.m.min_qty)>0&&x.mm.stock<=inventoryNum(x.m.min_qty)).length;
 return '<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>Vật tư tháng '+month+'-'+y+'</title><style>'+inventoryPdfCss(false)+'</style></head><body><div class="head"><div class="brand">ESTA<small>PROPERTY MANAGEMENT</small></div><div class="doc">'+esc(currentBuilding.name)+'<br>Ngày xuất: '+new Date().toLocaleDateString("vi-VN")+'</div></div><div class="title"><h1>NHẬP - XUẤT - TỒN VẬT TƯ THÁNG '+String(month).padStart(2,"0")+' / '+y+'</h1><p>Vật tư tiêu hao kỹ thuật</p></div><div class="summary"><div><span>Tổng nhập</span><b>'+inventoryFmt(tin)+'</b></div><div><span>Tổng xuất</span><b>'+inventoryFmt(tout)+'</b></div><div><span>Mặt hàng còn tồn</span><b>'+instock+'</b></div><div><span>Sắp hết</span><b>'+low+'</b></div></div><table><thead><tr><th>STT</th><th>Vật tư</th><th>ĐVT</th><th>Tồn đầu</th><th>Nhập</th><th>Xuất</th><th>Tồn cuối</th></tr></thead><tbody>'+rows+'</tbody></table><div class="foot">ESTA · Quản lý vật tư · '+esc(currentBuilding.name)+'</div><script>window.onload=()=>setTimeout(()=>window.print(),600)<\/script></body></html>';
}
function toolReportHtml(){
 const rows=inventoryTools.map((t,i)=>'<tr><td>'+(i+1)+'</td><td><b>'+esc(t.name)+'</b><br>'+esc(t.code||"")+'</td><td>'+esc(t.brand||"—")+'</td><td>'+inventoryFmt(t.qty)+' '+esc(t.unit)+'</td><td>'+esc(t.location||"—")+'</td><td>'+esc(t.keeper||"—")+'</td><td>'+esc(t.condition_status)+'</td></tr>').join("");
 return '<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>Dụng cụ kỹ thuật</title><style>'+inventoryPdfCss(false)+'</style></head><body><div class="head"><div class="brand">ESTA<small>PROPERTY MANAGEMENT</small></div><div class="doc">'+esc(currentBuilding.name)+'<br>Ngày xuất: '+new Date().toLocaleDateString("vi-VN")+'</div></div><div class="title"><h1>DANH MỤC DỤNG CỤ KỸ THUẬT</h1><p>Danh sách, vị trí, tình trạng và người phụ trách</p></div><table><thead><tr><th>STT</th><th>Dụng cụ</th><th>Nhãn hiệu</th><th>Số lượng</th><th>Vị trí lưu</th><th>Tình trạng</th><th>Ghi chú</th></tr></thead><tbody>'+rows+'</tbody></table><div class="foot">ESTA · Dụng cụ kỹ thuật · '+esc(currentBuilding.name)+'</div><script>window.onload=()=>setTimeout(()=>window.print(),600)<\/script></body></html>';
}

/* ===== BẢO TRÌ THIẾT BỊ ===== */
let maintenanceAssets=[],maintenanceRecords=[],maintenanceLoadedBuilding="",maintenanceActiveMonth="";
function addDaysIso(date,days){
 const d=new Date((date||today())+"T00:00:00");d.setDate(d.getDate()+Number(days||0));return d.toLocaleDateString("en-CA");
}
function maintenanceDueClass(asset){
 if(asset.status==="Ngừng sử dụng")return "paused";
 const d=asset.next_due_date;if(!d)return "unknown";
 const now=today(),soon=addDaysIso(now,30);
 if(d<now)return "overdue";if(d<=soon)return "soon";return "ok";
}
function maintenanceDueText(asset){
 const c=maintenanceDueClass(asset);
 return c==="overdue"?"Quá hạn":c==="soon"?"Sắp đến hạn":c==="ok"?"Đúng kế hoạch":c==="paused"?"Ngừng sử dụng":"Chưa đặt lịch";
}
async function loadMaintenanceData(buildingId=currentBuilding?.id,force=false){
 if(!centralSession?.access_token||!buildingId)return;
 if(!force&&maintenanceLoadedBuilding===buildingId){renderMaintenance();return}
 try{
   const b=encodeURIComponent(buildingId),token=centralSession.access_token;
   [maintenanceAssets,maintenanceRecords]=await Promise.all([
     sbFetch("/rest/v1/maintenance_assets?select=*&building_id=eq."+b+"&order=next_due_date.asc.nullslast,name.asc",{token}),
     sbFetch("/rest/v1/maintenance_records?select=*&building_id=eq."+b+"&order=service_date.desc,created_at.desc",{token})
   ]);
   maintenanceAssets=Array.isArray(maintenanceAssets)?maintenanceAssets:[];
   maintenanceRecords=Array.isArray(maintenanceRecords)?maintenanceRecords:[];
   maintenanceLoadedBuilding=buildingId;inventoryFillPeople();renderMaintenance();
 }catch(e){console.warn("Load maintenance failed",e);toast("Không tải được dữ liệu bảo trì")}
}
function renderMaintenance(){
 const q=($("#maintenanceSearch")?.value||"").trim().toLocaleLowerCase("vi-VN"),sys=$("#maintenanceSystemFilter")?.value||"",due=$("#maintenanceDueFilter")?.value||"";
 const year=String(new Date().getFullYear());
 const list=maintenanceAssets.filter(a=>(!sys||a.system_type===sys)&&(!due||maintenanceDueClass(a)===due)&&(!maintenanceActiveMonth||String(a.next_due_date||"").startsWith(year+"-"+String(maintenanceActiveMonth).padStart(2,"0")))&&(!q||[a.name,a.code,a.location,a.system_type,a.assigned_to,a.model].some(v=>String(v||"").toLocaleLowerCase("vi-VN").includes(q))));
 const monthStrip=$("#maintenanceMonthStrip");
 if(monthStrip){
   monthStrip.innerHTML=Array.from({length:12},(_,i)=>{
     const m=i+1,prefix=year+"-"+String(m).padStart(2,"0");
     const count=maintenanceAssets.filter(a=>String(a.next_due_date||"").startsWith(prefix)).length;
     return '<button type="button" class="'+(String(maintenanceActiveMonth)===String(m)?"active":"")+'" data-maint-month="'+m+'"><span>Th'+String(m).padStart(2,"0")+'</span><b>'+count+'</b></button>';
   }).join("");
   monthStrip.querySelectorAll("[data-maint-month]").forEach(b=>b.onclick=()=>{const m=Number(b.dataset.maintMonth);maintenanceActiveMonth=String(maintenanceActiveMonth)===String(m)?"":m;renderMaintenance()});
 }
 $("#maintAssetCount").textContent=maintenanceAssets.length;
 $("#maintOverdueCount").textContent=maintenanceAssets.filter(a=>maintenanceDueClass(a)==="overdue").length;
 $("#maintDueSoonCount").textContent=maintenanceAssets.filter(a=>maintenanceDueClass(a)==="soon").length;
 const yr=String(new Date().getFullYear());
 $("#maintDoneYearCount").textContent=maintenanceRecords.filter(r=>String(r.service_date||"").startsWith(yr)&&r.result_status==="Hoàn thành").length;
 $("#maintenanceAssetGrid").innerHTML=list.map(a=>{
   const cls=maintenanceDueClass(a),last=a.last_service_date?fmt(a.last_service_date):"Chưa có",next=a.next_due_date?fmt(a.next_due_date):"Chưa đặt";
   return '<article class="maintenanceAssetCard '+cls+'"><div class="maintCardTop"><span class="maintSystem">'+esc(a.system_type)+'</span><span class="maintDue '+cls+'">'+maintenanceDueText(a)+'</span></div><h3>'+esc(a.name)+'</h3><p>'+esc(a.code||"Không mã")+' · '+esc(a.location||"Chưa ghi vị trí")+'</p><div class="maintDates"><div><small>Gần nhất</small><b>'+last+'</b></div><div><small>Kế tiếp</small><b>'+next+'</b></div><div><small>Chu kỳ</small><b>'+a.frequency_days+' ngày</b></div></div><div class="maintCardMeta"><span>Phụ trách: <b>'+esc(a.assigned_to||"—")+'</b></span><span>Trạng thái: <b>'+esc(a.status)+'</b></span></div><div class="maintCardActions"><button class="primary" onclick="openMaintenanceRecord(\''+a.id+'\')">＋ Ghi bảo trì</button><button onclick="editMaintenanceAsset(\''+a.id+'\')">Sửa</button><button class="danger" onclick="deleteMaintenanceAsset(\''+a.id+'\')">×</button></div></article>';
 }).join("");
 $("#maintenanceEmpty").classList.toggle("hide",list.length>0);
 const byId=Object.fromEntries(maintenanceAssets.map(a=>[a.id,a]));
 const rec=maintenanceRecords.slice(0,60);
 $("#maintenanceHistoryBody").innerHTML=rec.map(r=>'<tr><td>'+fmt(r.service_date)+'</td><td><b>'+esc(byId[r.asset_id]?.name||"Thiết bị đã xóa")+'</b></td><td>'+esc(r.maintenance_type)+'</td><td>'+esc(r.performer||"—")+'</td><td>'+esc(r.work_done||"—")+'</td><td><span class="maintResult '+(r.result_status==="Hoàn thành"?"good":r.result_status==="Chưa hoàn thành"?"bad":"warn")+'">'+esc(r.result_status)+'</span></td><td>'+(r.next_due_date?fmt(r.next_due_date):"—")+'</td><td>'+inventoryFmt(r.cost)+' đ</td><td><button class="miniDanger" onclick="deleteMaintenanceRecord(\''+r.id+'\')">Xóa</button></td></tr>').join("");
 $("#maintenanceHistoryEmpty").classList.toggle("hide",rec.length>0);
}
function resetMaintenanceAssetForm(name="",system="HVAC",freq=30){
 $("#maintenanceAssetId").value="";$("#maintenanceCode").value="";$("#maintenanceName").value=name;$("#maintenanceSystem").value=system;$("#maintenanceLocation").value="";$("#maintenanceManufacturer").value="";$("#maintenanceModel").value="";$("#maintenanceSerial").value="";$("#maintenanceFrequency").value=freq;$("#maintenanceLastDate").value="";$("#maintenanceNextDate").value="";$("#maintenanceAssigned").value="";$("#maintenanceStatus").value="Hoạt động";$("#maintenanceNote").value="";$("#maintenanceAssetModalTitle").textContent="Thêm thiết bị";
}
function openMaintenanceAssetModal(name="",system="HVAC",freq=30){inventoryFillPeople();resetMaintenanceAssetForm(name,system,freq);$("#maintenanceAssetModal").classList.remove("hide");setTimeout(()=>$("#maintenanceName").focus(),40)}
window.editMaintenanceAsset=id=>{
 const a=maintenanceAssets.find(x=>String(x.id)===String(id));if(!a)return;inventoryFillPeople();
 $("#maintenanceAssetId").value=a.id;$("#maintenanceCode").value=a.code||"";$("#maintenanceName").value=a.name;$("#maintenanceSystem").value=a.system_type;$("#maintenanceLocation").value=a.location||"";$("#maintenanceManufacturer").value=a.manufacturer||"";$("#maintenanceModel").value=a.model||"";$("#maintenanceSerial").value=a.serial_no||"";$("#maintenanceFrequency").value=a.frequency_days;$("#maintenanceLastDate").value=a.last_service_date||"";$("#maintenanceNextDate").value=a.next_due_date||"";$("#maintenanceAssigned").value=a.assigned_to||"";$("#maintenanceStatus").value=a.status;$("#maintenanceNote").value=a.note||"";$("#maintenanceAssetModalTitle").textContent="Chỉnh sửa thiết bị";$("#maintenanceAssetModal").classList.remove("hide");
};
window.deleteMaintenanceAsset=async id=>{
 if(!canProjectEdit())return toast("Tài khoản này chỉ có quyền xem");
 const a=maintenanceAssets.find(x=>String(x.id)===String(id));if(!a||!confirm("Xóa thiết bị “"+a.name+"” và toàn bộ lịch sử bảo trì?"))return;
 try{await sbFetch("/rest/v1/maintenance_assets?id=eq."+encodeURIComponent(id)+"&building_id=eq."+encodeURIComponent(currentBuilding.id),{method:"DELETE",token:centralSession.access_token});await loadMaintenanceData(currentBuilding.id,true);toast("Đã xóa thiết bị")}catch(e){toast(e.message)}
};
window.openMaintenanceRecord=id=>{
 const a=maintenanceAssets.find(x=>String(x.id)===String(id));if(!a)return;inventoryFillPeople();
 $("#maintenanceRecordId").value="";$("#maintenanceRecordAssetId").value=a.id;$("#maintenanceRecordAssetName").textContent=a.name+" · "+(a.location||a.system_type);$("#maintenanceRecordDate").value=today();$("#maintenanceRecordType").value="Định kỳ";$("#maintenanceRecordPerformer").value=a.assigned_to||"";$("#maintenanceRecordResult").value="Hoàn thành";$("#maintenanceWorkDone").value="";$("#maintenanceRecordNextDate").value=addDaysIso(today(),a.frequency_days);$("#maintenanceCost").value="0";$("#maintenanceRecordNote").value="";$("#maintenanceRecordModal").classList.remove("hide");
};
window.deleteMaintenanceRecord=async id=>{
 if(!canProjectEdit())return toast("Tài khoản này chỉ có quyền xem");
 if(!confirm("Xóa nhật ký bảo trì này?"))return;
 try{await sbFetch("/rest/v1/maintenance_records?id=eq."+encodeURIComponent(id)+"&building_id=eq."+encodeURIComponent(currentBuilding.id),{method:"DELETE",token:centralSession.access_token});await loadMaintenanceData(currentBuilding.id,true);toast("Đã xóa nhật ký")}catch(e){toast(e.message)}
};
function maintenanceReportHtml(){
 const assets=maintenanceAssets.slice().sort((a,b)=>String(a.next_due_date||"9999").localeCompare(String(b.next_due_date||"9999")));
 const rows=assets.map((a,i)=>'<tr><td>'+(i+1)+'</td><td><b>'+esc(a.name)+'</b><br>'+esc(a.code||"")+'</td><td>'+esc(a.system_type)+'</td><td>'+esc(a.location||"—")+'</td><td>'+a.frequency_days+' ngày</td><td>'+(a.last_service_date?fmt(a.last_service_date):"—")+'</td><td>'+(a.next_due_date?fmt(a.next_due_date):"—")+'</td><td>'+maintenanceDueText(a)+'</td><td>'+esc(a.assigned_to||"—")+'</td></tr>').join("");
 const history=maintenanceRecords.slice(0,100).map(r=>'<tr><td>'+fmt(r.service_date)+'</td><td>'+esc(maintenanceAssets.find(a=>a.id===r.asset_id)?.name||"—")+'</td><td>'+esc(r.maintenance_type)+'</td><td>'+esc(r.performer||"—")+'</td><td>'+esc(r.work_done||"—")+'</td><td>'+esc(r.result_status)+'</td><td>'+(r.next_due_date?fmt(r.next_due_date):"—")+'</td></tr>').join("");
 return '<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>Báo cáo bảo trì</title><style>'+inventoryPdfCss(true)+'.page{page-break-before:always}.status{font-weight:700}</style></head><body><div class="head"><div class="brand">ESTA<small>PROPERTY MANAGEMENT</small></div><div class="doc">'+esc(currentBuilding.name)+'<br>Ngày xuất: '+new Date().toLocaleDateString("vi-VN")+'</div></div><div class="title"><h1>KẾ HOẠCH BẢO TRÌ THIẾT BỊ KỸ THUẬT</h1><p>Danh mục · chu kỳ · hạn bảo trì</p></div><div class="summary"><div><span>Thiết bị</span><b>'+maintenanceAssets.length+'</b></div><div><span>Quá hạn</span><b>'+maintenanceAssets.filter(a=>maintenanceDueClass(a)==="overdue").length+'</b></div><div><span>Đến hạn 30 ngày</span><b>'+maintenanceAssets.filter(a=>maintenanceDueClass(a)==="soon").length+'</b></div></div><table><thead><tr><th>STT</th><th>Thiết bị</th><th>Hệ thống</th><th>Vị trí</th><th>Chu kỳ</th><th>Gần nhất</th><th>Kế tiếp</th><th>Tình trạng lịch</th><th>Phụ trách</th></tr></thead><tbody>'+rows+'</tbody></table><div class="page"><div class="title"><h1>NHẬT KÝ BẢO TRÌ</h1></div><table><thead><tr><th>Ngày</th><th>Thiết bị</th><th>Loại</th><th>Người thực hiện</th><th>Nội dung</th><th>Kết quả</th><th>Hạn kế tiếp</th></tr></thead><tbody>'+history+'</tbody></table></div><div class="foot">ESTA · Bảo trì thiết bị · '+esc(currentBuilding.name)+'</div><script>window.onload=()=>setTimeout(()=>window.print(),650)<\/script></body></html>';
}

/* Event wiring: Inventory */
inventorySetYears();
document.querySelectorAll("[data-material-month]").forEach(b=>b.onclick=()=>{inventoryActiveMonth=Number(b.dataset.materialMonth)||1;renderMaterials()});
document.querySelectorAll("[data-inventory-tab]").forEach(b=>b.onclick=()=>setInventoryTab(b.dataset.inventoryTab));
$("#inventoryYear").onchange=()=>renderMaterials();
$("#materialSearch").oninput=renderMaterials;
$("#stockAlertOnly").onclick=()=>{inventoryShowAlertsOnly=!inventoryShowAlertsOnly;renderMaterials()};
$("#toolSearch").oninput=renderTools;
$("#addMaterialBtn").onclick=()=>openMaterialModal();
$("#openStockTxn").onclick=()=>openStockTxnModal();
$("#addToolBtn").onclick=()=>openToolModal();
$("#materialExportPdf").onclick=()=>{if(!inventoryMaterials.length)return toast("Chưa có vật tư để xuất PDF");inventoryPrintWindow(materialReportHtml())};
$("#toolExportPdf").onclick=()=>{if(!inventoryTools.length)return toast("Chưa có dụng cụ để xuất PDF");inventoryPrintWindow(toolReportHtml())};
document.querySelectorAll("[data-material-sample]").forEach(b=>b.onclick=()=>{const [n,u]=b.dataset.materialSample.split("|");openMaterialModal(n,u)});
document.querySelectorAll("[data-tool-sample]").forEach(b=>b.onclick=()=>{const [n,u]=b.dataset.toolSample.split("|");openToolModal(n,u)});
$("#closeMaterialModal").onclick=$("#cancelMaterialModal").onclick=()=>$("#materialItemModal").classList.add("hide");
$("#closeStockTxnModal").onclick=$("#cancelStockTxnModal").onclick=()=>$("#stockTxnModal").classList.add("hide");
$("#closeToolModal").onclick=$("#cancelToolModal").onclick=()=>$("#toolItemModal").classList.add("hide");
$("#materialItemForm").onsubmit=async e=>{
 e.preventDefault();if(!canProjectEdit())return toast("Tài khoản này chỉ có quyền xem");
 const id=$("#materialId").value,trackingStart=$("#materialTrackingStart").value||today();
 if(trackingStart>today())return toast("Ngày bắt đầu quản lý không thể ở tương lai");
 const existingFirstTx=id?inventoryTransactions.filter(x=>String(x.material_id)===String(id)).map(x=>x.tx_date).sort()[0]:null;
 if(existingFirstTx&&trackingStart>existingFirstTx)return toast("Ngày bắt đầu quản lý không thể sau giao dịch đầu tiên "+fmt(existingFirstTx));
 const body={building_id:currentBuilding.id,code:$("#materialCode").value.trim(),name:$("#materialName").value.trim(),unit:$("#materialUnit").value.trim()||"Cái",tracking_start_date:trackingStart,opening_qty:inventoryNum($("#materialOpeningQty").value),min_qty:inventoryNum($("#materialMinQty").value),note:$("#materialNote").value.trim(),updated_at:new Date().toISOString()};
 try{
  if(id)await sbFetch("/rest/v1/inventory_materials?id=eq."+encodeURIComponent(id)+"&building_id=eq."+encodeURIComponent(currentBuilding.id),{method:"PATCH",token:centralSession.access_token,body});
  else await sbFetch("/rest/v1/inventory_materials",{method:"POST",token:centralSession.access_token,body});
  $("#materialItemModal").classList.add("hide");await loadInventoryData(currentBuilding.id,true);toast(id?"Đã cập nhật vật tư":"Đã thêm vật tư");
 }catch(err){toast(err.status===409?"Vật tư này đã có trong dự án":err.message)}
};
$("#stockTxnMaterial").onchange=()=>{
 const m=inventoryMaterials.find(x=>x.id===$("#stockTxnMaterial").value);
 $("#stockTxnDate").min=m?inventoryTrackingStart(m):"";
 $("#stockTxnDate").max=today();
 if(m&&$("#stockTxnDate").value<inventoryTrackingStart(m))$("#stockTxnDate").value=inventoryTrackingStart(m);
};
$("#stockTxnForm").onsubmit=async e=>{
 e.preventDefault();if(!canProjectEdit())return toast("Tài khoản này chỉ có quyền xem");
 const materialId=$("#stockTxnMaterial").value,qty=inventoryNum($("#stockTxnQty").value),txType=$("#stockTxnType").value,date=$("#stockTxnDate").value;
 if(!materialId||qty<=0)return toast("Vui lòng chọn vật tư và số lượng");
 const m=inventoryMaterials.find(x=>x.id===materialId);
 if(!m)return toast("Không tìm thấy vật tư");
 const trackingStart=inventoryTrackingStart(m);
 if(date<trackingStart)return toast("Vật tư này chỉ bắt đầu quản lý từ "+fmt(trackingStart));
 if(date>today())return toast("Không thể nhập/xuất ở ngày tương lai");
 if(txType==="out"){
   const stockAtDate=inventoryStockAsOf(m,date);
   if(stockAtDate===null||qty>stockAtDate)return toast("Số lượng xuất vượt quá tồn kho tại ngày "+fmt(date));
 }
 const body={building_id:currentBuilding.id,material_id:materialId,tx_date:date,tx_type:txType,qty,performer:$("#stockTxnPerformer").value,note:$("#stockTxnNote").value.trim()};
 try{await sbFetch("/rest/v1/inventory_material_transactions",{method:"POST",token:centralSession.access_token,body});$("#stockTxnModal").classList.add("hide");await loadInventoryData(currentBuilding.id,true);toast(txType==="in"?"Đã nhập kho":"Đã xuất kho")}catch(err){toast(err.message)}
};
$("#toolItemForm").onsubmit=async e=>{
 e.preventDefault();if(!canProjectEdit())return toast("Tài khoản này chỉ có quyền xem");
 const id=$("#toolId").value,body={building_id:currentBuilding.id,code:$("#toolCode").value.trim(),name:$("#toolName").value.trim(),brand:$("#toolBrand").value.trim(),qty:inventoryNum($("#toolQty").value),unit:$("#toolUnit").value.trim()||"Cái",location:$("#toolLocation").value.trim(),condition_status:$("#toolCondition").value,keeper:"",acquired_date:$("#toolAcquiredDate").value||null,note:$("#toolNote").value.trim(),updated_at:new Date().toISOString()};
 try{
   if(id)await sbFetch("/rest/v1/inventory_tools?id=eq."+encodeURIComponent(id)+"&building_id=eq."+encodeURIComponent(currentBuilding.id),{method:"PATCH",token:centralSession.access_token,body});
   else await sbFetch("/rest/v1/inventory_tools",{method:"POST",token:centralSession.access_token,body});
   $("#toolItemModal").classList.add("hide");await loadInventoryData(currentBuilding.id,true);toast(id?"Đã cập nhật dụng cụ":"Đã thêm dụng cụ");
 }catch(err){toast(err.status===409?"Dụng cụ này đã có trong dự án":err.message)}
};

/* Event wiring: Maintenance */
$("#maintenanceSearch").oninput=renderMaintenance;
$("#maintenanceSystemFilter").onchange=renderMaintenance;
$("#maintenanceDueFilter").onchange=renderMaintenance;
$("#maintenanceMonthClear").onclick=()=>{maintenanceActiveMonth="";renderMaintenance()};
$("#addMaintenanceAsset").onclick=()=>openMaintenanceAssetModal();
$("#maintenanceExportPdf").onclick=()=>{if(!maintenanceAssets.length)return toast("Chưa có thiết bị để xuất PDF");inventoryPrintWindow(maintenanceReportHtml())};
document.querySelectorAll("[data-maint-sample]").forEach(b=>b.onclick=()=>{const [n,s,f]=b.dataset.maintSample.split("|");openMaintenanceAssetModal(n,s,Number(f))});
$("#closeMaintenanceAssetModal").onclick=$("#cancelMaintenanceAssetModal").onclick=()=>$("#maintenanceAssetModal").classList.add("hide");
$("#closeMaintenanceRecordModal").onclick=$("#cancelMaintenanceRecordModal").onclick=()=>$("#maintenanceRecordModal").classList.add("hide");
$("#maintenanceLastDate").onchange=()=>{if($("#maintenanceLastDate").value&&!$("#maintenanceNextDate").value)$("#maintenanceNextDate").value=addDaysIso($("#maintenanceLastDate").value,Number($("#maintenanceFrequency").value)||30)};
$("#maintenanceFrequency").onchange=()=>{if($("#maintenanceLastDate").value)$("#maintenanceNextDate").value=addDaysIso($("#maintenanceLastDate").value,Number($("#maintenanceFrequency").value)||30)};
$("#maintenanceAssetForm").onsubmit=async e=>{
 e.preventDefault();if(!canProjectEdit())return toast("Tài khoản này chỉ có quyền xem");
 const id=$("#maintenanceAssetId").value,freq=Math.max(1,Number($("#maintenanceFrequency").value)||30),last=$("#maintenanceLastDate").value||null,next=$("#maintenanceNextDate").value||(last?addDaysIso(last,freq):addDaysIso(today(),freq));
 const body={building_id:currentBuilding.id,code:$("#maintenanceCode").value.trim(),name:$("#maintenanceName").value.trim(),system_type:$("#maintenanceSystem").value,location:$("#maintenanceLocation").value.trim(),manufacturer:$("#maintenanceManufacturer").value.trim(),model:$("#maintenanceModel").value.trim(),serial_no:$("#maintenanceSerial").value.trim(),frequency_days:freq,last_service_date:last,next_due_date:next,assigned_to:$("#maintenanceAssigned").value,status:$("#maintenanceStatus").value,note:$("#maintenanceNote").value.trim(),updated_at:new Date().toISOString()};
 try{
   if(id)await sbFetch("/rest/v1/maintenance_assets?id=eq."+encodeURIComponent(id)+"&building_id=eq."+encodeURIComponent(currentBuilding.id),{method:"PATCH",token:centralSession.access_token,body});
   else await sbFetch("/rest/v1/maintenance_assets",{method:"POST",token:centralSession.access_token,body});
   $("#maintenanceAssetModal").classList.add("hide");await loadMaintenanceData(currentBuilding.id,true);toast(id?"Đã cập nhật thiết bị":"Đã thêm thiết bị");
 }catch(err){toast(err.status===409?"Thiết bị cùng tên/vị trí đã có":err.message)}
};
$("#maintenanceRecordForm").onsubmit=async e=>{
 e.preventDefault();if(!canProjectEdit())return toast("Tài khoản này chỉ có quyền xem");
 const assetId=$("#maintenanceRecordAssetId").value,a=maintenanceAssets.find(x=>x.id===assetId);if(!a)return toast("Không tìm thấy thiết bị");
 const serviceDate=$("#maintenanceRecordDate").value,next=$("#maintenanceRecordNextDate").value||addDaysIso(serviceDate,a.frequency_days);
 const body={building_id:currentBuilding.id,asset_id:assetId,service_date:serviceDate,maintenance_type:$("#maintenanceRecordType").value,performer:$("#maintenanceRecordPerformer").value,result_status:$("#maintenanceRecordResult").value,work_done:$("#maintenanceWorkDone").value.trim(),note:$("#maintenanceRecordNote").value.trim(),next_due_date:next,cost:Math.max(0,inventoryNum($("#maintenanceCost").value))};
 try{
   await sbFetch("/rest/v1/maintenance_records",{method:"POST",token:centralSession.access_token,body});
   await sbFetch("/rest/v1/maintenance_assets?id=eq."+encodeURIComponent(assetId)+"&building_id=eq."+encodeURIComponent(currentBuilding.id),{method:"PATCH",token:centralSession.access_token,body:{last_service_date:serviceDate,next_due_date:next,updated_at:new Date().toISOString()}});
   $("#maintenanceRecordModal").classList.add("hide");await loadMaintenanceData(currentBuilding.id,true);toast("Đã lưu nhật ký bảo trì");
 }catch(err){toast(err.message)}
};

/* ===== ADMIN TRUNG TÂM / ĐA DỰ ÁN ===== */
async function adminApi(action,payload={}){
 if(!centralSession?.access_token)throw new Error("Chưa kích hoạt hoặc đăng nhập Admin trung tâm");
 return sbFetch("/functions/v1/admin-users",{method:"POST",token:centralSession.access_token,body:{action,...payload}});
}
function adminProjectCard(b){
 const safeId=esc(b.id),safeName=esc(b.name||b.id);
 return '<div class="adminProjectCard"><button class="adminProjectOpen" type="button" onclick="adminOpenBuilding(\''+safeId+'\')"><div class="adminProjectIcon">▥</div><div><small>'+safeId+'</small><h3>'+safeName+'</h3><p>Mở giao diện Công việc & Năng lượng</p></div><span>→</span></button></div>';
}
function renderAdminProjects(){
 const list=currentAccount?.buildings||[];
 $("#adminProjectCount").textContent=list.length+" dự án";
 $("#adminProjectGrid").innerHTML=list.length?list.map(adminProjectCard).join(""):'<div class="empty">Chưa có dự án.</div>';
 $("#adminBuildingSelect").innerHTML=list.map(b=>'<option value="'+esc(b.id)+'">'+esc(b.name||b.id)+'</option>').join("");
}
async function refreshAdminBuildings(){
 if(!centralSession?.access_token){renderAdminProjects();return}
 currentAccount=await loadCentralAccount(centralSession.access_token);
 renderAdminProjects();
 renderSettingsProjectList();
}
function setSettingsTab(name){
 document.querySelectorAll("[data-settings-tab]").forEach(b=>b.classList.toggle("active",b.dataset.settingsTab===name));
 $("#settingsProjects").classList.toggle("hide",name!=="projects");
 $("#settingsAccounts").classList.toggle("hide",name!=="accounts");
 $("#settingsTrash").classList.toggle("hide",name!=="trash");
 if(name==="projects")renderSettingsProjectList();
 if(name==="accounts")renderAdminUsers();
 if(name==="trash")renderTrashProjects();
}
function openAdminSettings(tab="projects"){
 $("#adminSettingsModal").classList.remove("hide");
 setSettingsTab(tab);
}
$("#adminSettingsBtn").onclick=()=>openAdminSettings("projects");
$("#closeAdminSettings").onclick=()=>$("#adminSettingsModal").classList.add("hide");
$("#adminSettingsModal").onclick=e=>{if(e.target===$("#adminSettingsModal"))$("#adminSettingsModal").classList.add("hide")};
document.querySelectorAll("[data-settings-tab]").forEach(b=>b.onclick=()=>setSettingsTab(b.dataset.settingsTab));

function renderSettingsProjectList(){
 const box=$("#settingsProjectList"),list=currentAccount?.buildings||[];
 if(!list.length){box.innerHTML='<div class="empty">Chưa có dự án đang hoạt động.</div>';return}
 box.innerHTML=list.map(b=>'<div class="settingsRow"><div class="settingsRowMain"><div class="settingsRowIcon">▥</div><div><b>'+esc(b.name||b.id)+'</b><small>'+esc(b.id)+'</small></div></div><button class="settingsDeleteBtn" type="button" onclick="adminDeleteBuilding(\''+esc(b.id)+'\',\''+esc(b.name||b.id).replace(/'/g,"&#39;")+'\')">🗑 Xóa</button></div>').join("");
}
$("#projectForm").onsubmit=async e=>{
 e.preventDefault();
 if(!centralSession?.access_token){$("#adminSettingsModal").classList.add("hide");$("#adminSetupModal").classList.remove("hide");return}
 const msg=$("#projectFormMessage"),btn=$("#projectForm button[type=submit]");
 msg.textContent="Đang tạo dự án...";btn.disabled=true;
 try{
   const id=$("#projectCode").value.trim().toUpperCase().replace(/\s+/g,"");
   const name=sentenceCapitalizeText($("#projectName").value.trim());
   await adminApi("create_building",{id,name});
   $("#projectForm").reset();msg.textContent="";
   await refreshAdminBuildings();
   toast("Đã thêm dự án "+name);
 }catch(err){msg.textContent=err.message}
 finally{btn.disabled=false}
};
window.adminDeleteBuilding=async(id,name)=>{
 if(!centralSession?.access_token){$("#adminSettingsModal").classList.add("hide");$("#adminSetupModal").classList.remove("hide");return}
 const typed=prompt("Dự án sẽ được chuyển vào Thùng rác và có thể khôi phục lại.\n\nĐể xác nhận, nhập chính xác tên dự án:\n"+name);
 if(typed===null)return;
 if(typed.trim()!==name){toast("Tên xác nhận không đúng. Không xóa dự án.");return}
 try{
   await adminApi("delete_building",{id,confirm_name:name});
   await refreshAdminBuildings();
   await renderTrashProjects();
   await renderAdminUsers();
   toast("Đã chuyển "+name+" vào Thùng rác");
 }catch(err){toast(err.message)}
};
async function renderTrashProjects(){
 const box=$("#trashProjectList");
 if(!centralSession?.access_token){box.innerHTML='<div class="adminNeedsCentral"><b>Chưa kết nối Admin trung tâm</b><p>Kích hoạt Admin trung tâm để sử dụng Thùng rác.</p></div>';return}
 box.innerHTML='<div class="empty">Đang tải Thùng rác...</div>';
 try{
   const data=await adminApi("list_deleted_buildings"),list=data.buildings||[];
   box.innerHTML=list.length?list.map(b=>{
     const when=b.deleted_at?new Date(b.deleted_at).toLocaleString("vi-VN"):"";
     return '<div class="settingsRow trashRow"><div class="settingsRowMain"><div class="settingsRowIcon trashIcon">🗑</div><div><b>'+esc(b.name||b.id)+'</b><small>'+esc(b.id)+(when?" · Đã xóa "+esc(when):"")+'</small></div></div><button class="settingsRestoreBtn" type="button" onclick="adminRestoreBuilding(\''+esc(b.id)+'\')">↺ Khôi phục</button></div>';
   }).join(""):'<div class="empty">Thùng rác đang trống.</div>';
 }catch(err){box.innerHTML='<div class="empty">'+esc(err.message)+'</div>'}
}
$("#refreshTrash").onclick=()=>renderTrashProjects();
window.adminRestoreBuilding=async id=>{
 if(!centralSession?.access_token)return;
 try{
   const r=await adminApi("restore_building",{id});
   await refreshAdminBuildings();
   await renderTrashProjects();
   toast("Đã khôi phục dự án "+(r.building?.name||id));
 }catch(err){toast(err.message)}
};

async function renderAdminUsers(){
 const box=$("#adminUsersList");
 if(!currentAccount?.is_admin){box.innerHTML='<div class="empty">Không có quyền Admin.</div>';return}
 if(!centralSession?.access_token){
   box.innerHTML='<div class="adminNeedsCentral"><b>Admin cục bộ đang hoạt động</b><p>Kích hoạt Admin trung tâm để tạo và quản lý tài khoản thật cho các dự án.</p><button type="button" onclick="document.querySelector(\'#adminSettingsModal\').classList.add(\'hide\');document.querySelector(\'#adminSetupModal\').classList.remove(\'hide\')">Kích hoạt ngay</button></div>';
   return;
 }
 box.innerHTML='<div class="empty">Đang tải tài khoản...</div>';
 try{
   const data=await adminApi("list"),users=data.users||[];
   box.innerHTML=users.length?users.map(u=>{
     const projects=(u.buildings||[]).map(b=>'<span>'+esc(b.name||b.id)+'</span>').join("")||'<span>Chưa phân dự án</span>';
     const name=esc(u.display_name||u.username||u.email||"Tài khoản");
     return '<div class="adminUserRow"><div class="adminUserMain"><div class="adminAvatar">'+name.slice(0,1).toLocaleUpperCase("vi-VN")+'</div><div><b>'+name+'</b><small>'+(u.username?esc(u.username):esc(u.email||""))+'</small><div class="adminUserProjects">'+projects+'</div></div></div><div class="adminUserActions">'+(u.is_admin?'<span class="adminBadge">ADMIN</span>':'<button type="button" onclick="adminResetPassword(\''+u.id+'\')">Đổi mật khẩu</button><button type="button" class="'+(u.active?"danger":"success")+'" onclick="adminToggleUser(\''+u.id+'\','+(!u.active)+')">'+(u.active?"Khóa":"Mở khóa")+'</button><button type="button" class="danger" onclick="adminDeleteUser(\''+u.id+'\',\''+name.replace(/'/g,"&#39;")+'\')">🗑 Xóa</button>')+'</div></div>';
   }).join(""):'<div class="empty">Chưa có tài khoản kỹ thuật.</div>';
 }catch(err){box.innerHTML='<div class="empty">'+esc(err.message)+'</div>'}
}
async function renderAdminPortal(){
 renderAdminProjects();
 const connected=!!centralSession?.access_token;
 $("#adminConnection").className="adminConnection "+(connected?"ok":"warn");
 $("#adminConnection").textContent=connected?"Admin trung tâm đã kết nối":"Đang dùng Admin cục bộ";
 $("#adminActivateCentral").classList.toggle("hide",connected);
 $("#adminCreateBtn").disabled=!connected;
 $("#adminCreateHint").textContent=connected?"Tài khoản mới sẽ được tạo trên hệ thống trung tâm và chỉ truy cập dự án đã chọn.":"Kích hoạt Admin trung tâm trước khi tạo tài khoản dự án.";
}
$("#adminActivateCentral").onclick=()=>$("#adminSetupModal").classList.remove("hide");
$("#refreshAdminUsers").onclick=()=>renderAdminUsers();
$("#adminCreateAccountForm").onsubmit=async e=>{
 e.preventDefault();
 const btn=$("#adminCreateBtn");if(!centralSession?.access_token){$("#adminSettingsModal").classList.add("hide");$("#adminSetupModal").classList.remove("hide");return}
 btn.disabled=true;btn.textContent="Đang tạo...";
 try{
   const payload={
     username:$("#adminUsername").value.trim().toLowerCase(),
     password:$("#adminPassword").value,
     display_name:$("#adminDisplayName").value.trim(),
     building_ids:[$("#adminBuildingSelect").value],
     role:$("#adminRole").value
   };
   await adminApi("create",payload);
   $("#adminCreateAccountForm").reset();
   renderAdminProjects();
   await renderAdminUsers();
   toast("Đã tạo tài khoản kỹ thuật");
 }catch(err){toast(err.message)}
 finally{btn.disabled=false;btn.textContent="＋ Tạo tài khoản"}
};
window.adminDeleteUser=async(id,name)=>{
 if(!centralSession?.access_token)return;
 if(!confirm("Xóa vĩnh viễn tài khoản kỹ thuật \""+name+"\"?\n\nTài khoản này sẽ không thể đăng nhập lại."))return;
 try{await adminApi("delete_user",{user_id:id});await renderAdminUsers();toast("Đã xóa tài khoản "+name)}catch(err){toast(err.message)}
};
window.adminResetPassword=async id=>{
 if(!centralSession?.access_token)return;
 const p=prompt("Nhập mật khẩu mới (tối thiểu 6 ký tự):");if(!p)return;
 try{await adminApi("reset_password",{user_id:id,password:p});toast("Đã đổi mật khẩu")}catch(err){toast(err.message)}
};
window.adminToggleUser=async(id,active)=>{
 if(!centralSession?.access_token)return;
 try{await adminApi("set_active",{user_id:id,active});await renderAdminUsers();toast(active?"Đã mở khóa tài khoản":"Đã khóa tài khoản")}catch(err){toast(err.message)}
};

function canProjectEdit(){return !!(currentAccount?.is_admin||currentBuilding.role!=="viewer")}
function setProjectEditability(){
 const canEdit=canProjectEdit();
 ["taskForm","energyForm","materialItemForm","stockTxnForm","toolItemForm","maintenanceAssetForm","maintenanceRecordForm","contractorForm","contractorJobForm"].forEach(fid=>{
   const f=$("#"+fid);if(!f)return;
   f.querySelectorAll("input,select,textarea,button").forEach(el=>{if(el.id!=="cancelEdit"&&el.id!=="energyCancelEdit")el.disabled=!canEdit});
 });
 if($("#backupBtn"))$("#backupBtn").disabled=!canEdit;
 if($("#restoreBtn"))$("#restoreBtn").disabled=!canEdit;
}
const oldApplyBuildingUI=applyBuildingUI;
applyBuildingUI=function(){
 oldApplyBuildingUI();
 setProjectEditability();
 const role=currentAccount?.is_admin?"Quản trị viên":(currentBuilding.role==="viewer"?"Chỉ xem":"Kỹ thuật viên");
 $("#headerRole").textContent=role+" · "+currentBuilding.id;
};

(async function initMultiProjectSession(){
 const restored=await restoreCentral();
 if(restored)window.enterAccount(restored.account,restored.session);
})();

```


---

## FILE: style.css

SHA: f86e22dd4db49a4c57e7cfe267d9ad3764e853b5

```css
*{box-sizing:border-box}html,body{margin:0;min-height:100%;font-family:"Inter";color:#173653;background:#f4f8fc}button,input,select{font:inherit}.hide{display:none!important}button{cursor:pointer}#toast{position:fixed;left:50%;bottom:26px;transform:translateX(-50%) translateY(30px);z-index:1000;padding:11px 16px;border-radius:10px;background:#082d52;color:#fff;font-size:12px;opacity:0;pointer-events:none;transition:.2s;box-shadow:0 14px 40px #00172d40}#toast.show{opacity:1;transform:translateX(-50%) translateY(0)}

/* LOGIN ESTA */
#login{display:grid;grid-template-columns:minmax(0,1fr) 37%;place-items:stretch;min-height:100vh;overflow:hidden;color:#fff;background:linear-gradient(90deg,rgba(1,18,35,.93) 0%,rgba(3,34,59,.34) 58%,rgba(1,18,34,.86) 100%),url("https://images.splitshire.com/full/The-Office-Building-Glowing-Blue-at-Night_BMndD.png") center/cover no-repeat}
.conceptScene{position:relative;min-width:0;min-height:100vh;padding:48px 42px;background:linear-gradient(90deg,rgba(2,18,35,.68),transparent 76%)}
.conceptBrand{position:absolute;left:4.2vw;top:4.2vh;width:300px;z-index:3}.conceptTower{font-size:54px;line-height:.8;color:#fff}.conceptBrand strong{display:block;margin-top:7px;font-size:47px;line-height:1;letter-spacing:9px}.conceptBrand small{display:block;margin-top:7px;font-size:9px;letter-spacing:2.8px;color:#c9e9fb}.conceptBrand i{display:block;width:50px;margin:28px 0 18px;border-top:1px solid #90d9ff}.conceptBrand p{margin:0;font-size:17px;line-height:1.55;font-weight:300;color:#f4fbff}
.systemList{position:absolute;left:4.2vw;top:40vh;display:grid;gap:12px;z-index:3}.systemList>span{display:flex;align-items:center;gap:13px}.systemList b{display:grid;place-items:center;width:43px;height:43px;border:1px solid #63c9ff;border-radius:9px;background:rgba(10,55,91,.38);font-size:18px;color:#e6f7ff;box-shadow:inset 0 0 20px rgba(56,176,243,.08)}.systemList em{font-style:normal;font-size:13px;color:#fff}.systemList small{display:block;margin-top:2px;font-size:9px;color:#c7e4f4}
.smartNodes{position:absolute;right:3vw;top:10vh;width:190px;display:grid;gap:14px;z-index:3}.smartNodes span{padding:12px 14px;border:1px solid rgba(103,205,255,.72);border-radius:10px;background:linear-gradient(135deg,rgba(11,76,123,.68),rgba(14,67,108,.44));backdrop-filter:blur(9px);font-size:12px;box-shadow:0 12px 30px rgba(0,30,60,.12)}.smartNodes small{display:block;margin-top:4px;font-size:8px;color:#d8effc}
.sceneBottom{position:absolute;left:4.2vw;right:3vw;bottom:4.2vh;display:flex;align-items:end;justify-content:space-between;padding-top:14px;border-top:1px solid rgba(95,195,246,.32);z-index:3}.sceneBottom b{font-size:9px;letter-spacing:2px;line-height:1.55}.sceneBottom span{font-size:9px;color:#d8edf8}
.conceptLogin{position:relative;display:grid;place-items:center;min-width:0;min-height:100vh;padding:48px;background:rgba(2,18,34,.20);backdrop-filter:blur(2px)}.lang{position:absolute;right:4vw;top:3.1vh;font-size:11px;letter-spacing:1px}
.loginCard{width:min(370px,100%);padding:38px 34px;border:1px solid rgba(255,255,255,.77);border-radius:23px;background:linear-gradient(145deg,rgba(239,248,255,.92),rgba(211,228,242,.82));backdrop-filter:blur(22px);color:#082d56;box-shadow:0 30px 80px rgba(0,16,35,.35)}
.welcome{display:block;font-size:20px;font-weight:750;color:#0a4f89}.loginSub{margin:5px 0 12px;font-size:12px;color:#365d7e}.loginCard h1{margin:0 0 15px;font-size:32px;letter-spacing:7px;color:#082d56}.loginLocation{position:relative;margin:0 0 19px;padding-left:29px}.loginLocation:before{content:"⌖";position:absolute;left:0;top:-1px;font-size:21px;color:#167bc2}.loginLocation b{display:block;font-size:17px}.loginLocation span{display:block;margin-top:4px;font-size:9px;color:#67829a}.loginCard label{display:block;margin-top:10px;font-size:0}.loginCard input{width:100%;height:49px;padding:0 14px;border:1px solid rgba(67,112,151,.29);border-radius:10px;outline:0;background:rgba(255,255,255,.68);color:#1a405f;font-size:12px}.loginCard input:focus{border-color:#2e9bd8;box-shadow:0 0 0 3px rgba(46,155,216,.10)}.loginCard form button{width:100%;height:50px;margin-top:16px;border:0;border-radius:10px;background:linear-gradient(90deg,#0f5fa5,#0b427c);color:#fff;font-weight:750;font-size:13px;box-shadow:0 10px 24px rgba(9,73,127,.17)}.loginFoot{margin-top:29px;text-align:right;font-size:8px;line-height:1.6;letter-spacing:1px;color:#436987}

/* APP */
#app:not(.hide){display:grid;grid-template-columns:252px minmax(0,1fr);min-height:100vh;background:#f4f8fc}
#app aside{position:sticky;top:0;display:flex;flex-direction:column;width:252px;height:100vh;overflow:auto;padding:22px 16px 16px;background:radial-gradient(circle at 50% 23%,rgba(17,126,207,.2),transparent 28%),linear-gradient(180deg,#061d36 0%,#082946 58%,#061b31 100%);color:#fff;border-right:1px solid rgba(117,195,243,.18);box-shadow:12px 0 35px rgba(5,28,52,.08)}
#app aside::-webkit-scrollbar{width:4px}#app aside::-webkit-scrollbar-thumb{background:#1f5277;border-radius:10px}
.brand{display:flex;align-items:center;gap:12px;padding:2px 7px 20px;border-bottom:1px solid rgba(131,204,247,.15)}.brand .tower{display:grid;place-items:center;width:38px;height:45px;border:1px solid #8bd5ff;border-radius:5px;font-size:25px;color:#dff5ff;background:linear-gradient(180deg,rgba(40,157,227,.15),rgba(8,44,75,.15))}.brand b{display:block;font-size:25px;letter-spacing:5px}.brand small{display:block;margin-top:3px;font-size:7px;letter-spacing:1.8px;color:#8fcaed}
.sideBuilding{position:relative;overflow:hidden;margin:16px 0 15px;padding:18px 14px 15px;min-height:142px;border:1px solid rgba(98,190,245,.25);border-radius:13px;background:linear-gradient(145deg,rgba(17,85,132,.45),rgba(4,31,55,.72));box-shadow:inset 0 1px rgba(255,255,255,.05)}.sideBuilding:before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent 49%,rgba(82,182,242,.09) 50%,transparent 51%),linear-gradient(0deg,transparent 49%,rgba(82,182,242,.07) 50%,transparent 51%);background-size:28px 28px;opacity:.65}.miniTech{position:relative;height:62px;margin-bottom:10px}.miniTech:before{content:"";position:absolute;left:50%;bottom:0;transform:translateX(-50%);width:72px;height:56px;border:1px solid #57c7ff;border-bottom:0;clip-path:polygon(16% 20%,48% 0,82% 18%,92% 100%,7% 100%);background:linear-gradient(180deg,rgba(50,180,255,.16),rgba(50,180,255,.03));box-shadow:0 0 24px rgba(59,180,249,.18)}.miniTech span{position:absolute;right:6px;top:4px;padding:3px 6px;border:1px solid rgba(97,201,255,.5);border-radius:10px;font-size:7px;letter-spacing:1px;color:#9cddff;background:#0a3a60}.miniTech i{display:none}.sideBuilding>b,.sideBuilding>small{position:relative;z-index:2;display:block}.sideBuilding>b{font-size:13px}.sideBuilding>small{margin-top:4px;font-size:9px;color:#91bad4}
nav{margin:7px 0 13px}nav:before{content:"VẬN HÀNH";display:block;padding:0 10px 7px;font-size:7px;letter-spacing:2px;color:#6091b1}nav button{width:100%;height:43px;padding:0 12px;border:1px solid transparent;border-radius:9px;text-align:left;font-size:12px;color:#a9c5d8;background:transparent}nav button.active{color:#fff;border-color:rgba(72,181,244,.27);background:linear-gradient(90deg,rgba(16,125,193,.42),rgba(9,66,110,.28));box-shadow:inset 3px 0 #46bfff}
.smartPanel{margin-top:auto;padding:14px;border:1px solid rgba(90,194,249,.24);border-radius:12px;background:linear-gradient(145deg,rgba(9,65,104,.64),rgba(7,38,66,.72))}.smartPanel>small{font-size:7px;letter-spacing:1.7px;color:#73bee9}.smartPanel>b{display:block;margin:3px 0 11px;font-size:10px;letter-spacing:1.4px}.smartPanel>div{display:grid;grid-template-columns:1fr 1fr;gap:6px}.smartPanel span{padding:6px;border-radius:7px;background:rgba(255,255,255,.05);font-size:8px;color:#bce7ff}.sideQuote{padding:14px 8px;text-align:center;font-size:9px;line-height:1.55;color:#7fa8c2}.sideBottom{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:12px 7px 0;border-top:1px solid rgba(122,190,229,.13);font-size:9px}.sideBottom b{font-size:10px}#logout{padding:7px 9px;border:1px solid rgba(136,198,235,.24);border-radius:7px;background:rgba(255,255,255,.04);color:#b8d6e9;font-size:9px}
#app main{min-width:0;background:#f4f8fc}main>header{position:sticky;top:0;z-index:20;display:flex;align-items:center;gap:10px;height:58px;padding:0 22px;border-bottom:1px solid #dde9f3;background:rgba(255,255,255,.96);backdrop-filter:blur(16px);box-shadow:0 4px 18px rgba(24,65,103,.04)}#menu{display:none}.headerTools{display:flex;align-items:center;justify-content:flex-end;gap:7px;flex:1}.headerSearch{display:flex;align-items:center;gap:7px;width:min(460px,42vw);height:37px;padding:0 11px;border:1px solid #d6e4f3;border-radius:9px;background:#f7faff;color:#4281ca}.headerSearch input{width:100%;border:0;outline:0;background:transparent;font-size:12px;color:#496786}.iconAction,.pdfAction{height:37px;padding:0 11px;border:1px solid #d7e4ef;border-radius:9px;background:#fff;color:#285d88}.pdfAction b{color:#c53b3b}.account{min-width:120px;margin-left:6px;padding-left:13px;border-left:1px solid #e2eaf1}.account span{display:block;font-size:8px;text-transform:uppercase;letter-spacing:1px;color:#7990a5}.account b{display:block;font-size:11px;color:#173b5f}
.heroStrip{position:relative;overflow:hidden;height:88px;padding:18px 24px;background:radial-gradient(circle at 76% 30%,rgba(36,163,238,.27),transparent 24%),linear-gradient(100deg,#082a4c 0%,#0b426d 52%,#082742 100%);border-bottom:1px solid #d8e8f5;color:#fff;display:flex;align-items:center;justify-content:space-between}.heroStrip:before{content:"";position:absolute;right:7%;top:-36px;width:230px;height:170px;border:1px solid rgba(101,202,255,.18);transform:skewX(-17deg)}.heroStrip b{font-size:24px;letter-spacing:5px}.heroStrip>div:first-child span{display:block;margin-top:3px;font-size:8px;letter-spacing:2px;color:#a9d9f6}.heroTech{position:relative;z-index:2;display:flex;gap:7px}.heroTech span{padding:6px 10px;border:1px solid rgba(132,214,255,.33);border-radius:14px;background:rgba(255,255,255,.05);font-size:7px;letter-spacing:1px}
.page{padding:19px 20px 28px}.pageHead{display:grid;grid-template-columns:42px minmax(0,1fr) auto;align-items:center;gap:13px;padding:0 2px 15px}.headIcon{display:grid;place-items:center;width:42px;height:42px;border-radius:11px;background:linear-gradient(145deg,#0f67aa,#0b477c);color:#fff;box-shadow:0 7px 18px rgba(13,88,145,.18)}.pageHead h1{margin:0;font-size:21px;color:#0b3157}.pageHead p{margin:3px 0 0;font-size:10px;color:#748ba0}.headMeta{display:flex;gap:8px}.headMeta span{padding:7px 9px;border:1px solid #dbe8f2;border-radius:8px;background:#fff;font-size:9px;color:#6b8296}.headMeta b{color:#204d73}
.entryBox{padding:14px;border:1px solid #dce8f2;border-radius:13px;background:#fff;box-shadow:0 7px 24px rgba(22,62,99,.05)}.entryRow{display:grid;grid-template-columns:108px minmax(220px,2fr) 116px 128px 124px minmax(130px,1fr) 108px 76px 35px;gap:8px;align-items:end}.entryRow label>span{display:block;margin:0 0 5px;font-size:8px;font-weight:700;color:#657d91}.entryRow input,.entryRow select{width:100%;height:39px;padding:0 9px;border:1px solid #d8e5ef;border-radius:8px;background:#fbfdff;font-size:11px;color:#264660;outline:none}.entryRow input:focus,.entryRow select:focus{border-color:#4daee8;box-shadow:0 0 0 3px rgba(54,161,224,.09)}.imageField input{padding:7px;font-size:8px}#saveBtn{height:39px;border:0;border-radius:8px;background:linear-gradient(90deg,#0f72bb,#0b5593);color:#fff;font-size:10px;font-weight:700;white-space:nowrap}#cancelEdit{height:39px;width:35px;border:1px solid #d6e4ef;border-radius:8px;background:#fff;color:#8a4050}#imageInfo{margin-top:6px;font-size:9px;color:#5d859f}
.filterBar{display:grid;grid-template-columns:1fr 1fr 1fr auto auto auto;gap:8px;align-items:end;margin-top:10px;padding:11px;border:1px solid #dbe8f2;border-radius:11px;background:#fff;box-shadow:0 6px 18px rgba(22,62,99,.04)}.filterBar label{font-size:8px;color:#6c8295}.filterBar select,.filterBar input{width:100%;height:37px;padding:0 9px;border:1px solid #d8e5ef;border-radius:8px;background:#fff;font-size:10px}.clearFilter{height:37px;padding:0 11px;border:1px solid #d5e2ec;border-radius:8px;background:#f8fbfd;color:#557189;font-size:10px}
.stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:11px;margin:14px 0}.stats article{position:relative;overflow:hidden;display:flex;align-items:center;gap:11px;min-height:78px;padding:14px;border:1px solid #dce8f2;border-radius:12px;background:#fff;box-shadow:0 6px 20px rgba(21,62,98,.045)}.stats article:after{content:"";position:absolute;right:-18px;top:-18px;width:65px;height:65px;border-radius:50%;background:rgba(44,145,210,.045)}.stats i{display:grid;place-items:center;width:38px;height:38px;border-radius:10px;font-style:normal;font-size:16px}.stats i.blue{background:#e8f3ff;color:#2378ba}.stats i.orange{background:#fff1df;color:#c97b20}.stats i.green{background:#e8f8ed;color:#23985b}.stats i.red{background:#ffebed;color:#c94858}.stats small{display:block;font-size:7px;letter-spacing:.8px;color:#7d91a4}.stats strong{display:block;margin-top:2px;font-size:22px;color:#163d61}
.tableCard{overflow:hidden;border:1px solid #dce8f2;border-radius:13px;background:#fff;box-shadow:0 8px 26px rgba(21,62,98,.05)}.tableTop{padding:13px 15px;border-bottom:1px solid #e5edf4;background:linear-gradient(180deg,#fff,#fbfdff)}.tableTop b{font-size:13px;color:#173f64}.tableTop span{font-size:9px;color:#71879a}.desktopTable{overflow:auto}.desktopTable table{width:100%;border-collapse:collapse}.desktopTable th{padding:10px 9px;background:#f4f8fc;text-align:left;font-size:8px;letter-spacing:.45px;color:#60778a;white-space:nowrap}.desktopTable td{padding:10px 9px;border-top:1px solid #edf2f6;font-size:10px;vertical-align:top}.desktopTable tbody tr:hover{background:#f8fbfe}.badge,.typeBadge{display:inline-block;padding:4px 7px;border-radius:10px;font-size:8px;font-weight:700;white-space:nowrap}.badge.done{background:#e9f8ee;color:#238752}.badge.doing{background:#fff3df;color:#a76a17}.badge.wait{background:#ffebed;color:#b94150}.typeBadge{background:#eaf3fb;color:#3b6c94}.actions{display:flex;gap:5px}.actions button{padding:5px 7px;border:1px solid #dbe6ef;border-radius:6px;background:#fff;color:#3e6483;font-size:8px}.thumbs{display:flex;gap:4px;flex-wrap:wrap}.thumbs img{width:36px;height:30px;object-fit:cover;border-radius:5px;border:1px solid #d5e3ee;cursor:pointer}.empty{padding:34px;text-align:center;font-size:11px;color:#8294a4}
#mobileCards{display:none}.mcard{padding:12px;border-top:1px solid #edf2f6}.mcard h4{margin:0 0 7px;font-size:13px;color:#173d60}.mcard p{margin:5px 0;font-size:10px;color:#60798e}.viewer{position:fixed;inset:0;z-index:100;background:rgba(0,18,34,.82);display:grid;place-items:center;padding:20px}.viewerCard{position:relative;width:min(900px,96vw);max-height:90vh;overflow:auto;padding:18px;border-radius:13px;background:#fff}.viewerCard>button{position:sticky;top:0;float:right;width:32px;height:32px;border:0;border-radius:50%;background:#123e63;color:#fff}.viewerCard img{display:block;max-width:100%;margin:10px auto;border-radius:8px}

@media(max-width:1200px){#login{grid-template-columns:minmax(0,1fr) 420px}.conceptLogin{padding:28px}.smartNodes{right:2vw}.loginCard{width:340px}#app:not(.hide){grid-template-columns:220px minmax(0,1fr)}#app aside{width:220px;padding-left:12px;padding-right:12px}.entryRow{grid-template-columns:repeat(6,minmax(0,1fr))}.contentField{grid-column:span 2}.noteField{grid-column:span 2}.imageField{grid-column:span 2}#saveBtn{grid-column:span 1}}
@media(max-width:900px){#login{grid-template-columns:1fr}.conceptScene{min-height:48vh}.conceptBrand{left:28px;top:28px;transform:scale(.78);transform-origin:left top}.systemList{left:28px;top:190px;grid-template-columns:repeat(2,170px);gap:8px 16px}.systemList b{width:35px;height:35px}.smartNodes{right:28px;top:34px;width:170px}.sceneBottom{left:28px;right:28px;bottom:20px}.conceptLogin{min-height:52vh;padding:28px}.lang{top:14px;right:24px}.loginCard{width:min(390px,100%)}}
@media(max-width:760px){#app:not(.hide){display:block}#app aside{position:fixed;left:0;top:0;z-index:50;width:240px;transform:translateX(-102%);transition:.22s}#app aside.open{transform:translateX(0)}#menu{display:inline-grid;place-items:center;width:34px;height:34px;border:1px solid #d6e4ef;border-radius:8px;background:#fff;color:#325e81}main>header{height:54px;padding:0 12px}.headerSearch{width:min(230px,48vw)}.account{display:none}.heroStrip{height:70px;padding:14px}.heroStrip b{font-size:19px}.heroStrip>div:first-child span{font-size:6px}.heroTech{display:none}.page{padding:13px 11px 22px}.pageHead{grid-template-columns:36px 1fr}.headIcon{width:36px;height:36px}.pageHead h1{font-size:18px}.headMeta{grid-column:1/-1;justify-content:flex-start;flex-wrap:wrap}.entryRow{grid-template-columns:1fr 1fr;gap:8px}.contentField,.noteField,.imageField{grid-column:1/-1}#saveBtn{grid-column:1/-1}.stats{grid-template-columns:1fr 1fr;gap:8px}.stats article{min-height:69px;padding:11px}.stats strong{font-size:19px}.desktopTable{display:none}#mobileCards{display:block}.filterBar{grid-template-columns:1fr 1fr}.filterBar .clearFilter{grid-column:1/-1}}
@media(max-width:560px){.conceptScene{min-height:315px;padding:20px}.conceptBrand{left:22px;top:22px;transform:scale(.67)}.systemList{display:none}.smartNodes{right:20px;top:24px;width:135px;gap:7px}.smartNodes span{padding:8px 9px;font-size:9px}.smartNodes small{font-size:7px}.sceneBottom{left:22px;right:22px}.sceneBottom span{display:none}.conceptLogin{padding:18px}.loginCard{padding:28px 24px}.welcome{font-size:18px}.loginCard h1{font-size:29px}}

.modal{position:fixed;inset:0;z-index:120;display:grid;place-items:center;padding:20px;background:rgba(2,19,35,.72);backdrop-filter:blur(5px)}.modalCard{position:relative;width:min(430px,94vw);padding:24px;border:1px solid #d7e4ee;border-radius:16px;background:#fff;box-shadow:0 28px 80px rgba(0,20,40,.28)}.modalCard h3{margin:0 0 6px;font-size:18px;color:#123d63}.modalCard p{margin:0 0 18px;font-size:11px;color:#71869a}.modalClose{position:absolute;right:12px;top:12px;width:30px;height:30px;border:0;border-radius:50%;background:#eef4f8;color:#46647d}.exportChoices{display:grid;grid-template-columns:1fr 1fr;gap:9px}.exportChoices button{height:42px;border:1px solid #d7e5ef;border-radius:9px;background:#f8fbfe;color:#24577f;font-size:11px;font-weight:700}.exportChoices button:hover{border-color:#54aada;background:#eef8ff}
@media(max-width:760px){.exportChoices{grid-template-columns:1fr}.filterBar{grid-template-columns:1fr 1fr}}

.sideBackup{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:9px}.sideBackup button{height:30px;border:1px solid rgba(123,192,232,.2);border-radius:7px;background:rgba(255,255,255,.04);color:#a9cce1;font-size:8px}.sideBackup button:hover{background:rgba(48,151,211,.14);color:#fff}

/* UX 2026-09-22: tăng cỡ chữ + popover lọc dưới nút */
#app .pageHead h1{font-size:25px!important}
#app .pageHead p{font-size:13px!important}
#app .headMeta span{font-size:11px!important}
#app .entryRow label>span{font-size:10px!important}
#app .entryRow input,#app .entryRow select{font-size:13px!important;height:42px!important}
#app #saveBtn{font-size:12px!important;height:42px!important}
#app .stats small{font-size:9px!important}
#app .stats strong{font-size:25px!important}
#app .tableTop b{font-size:15px!important}
#app .desktopTable th{font-size:10px!important}
#app .desktopTable td{font-size:12px!important;line-height:1.45!important}
#app .badge,#app .typeBadge{font-size:10px!important}
#app .headerSearch input{font-size:13px!important}
#app .account span{font-size:9px!important}
#app .account b{font-size:12px!important}
#app nav button{font-size:13px!important}
#app .sideBuilding>b{font-size:14px!important}
#app .sideBuilding>small{font-size:10px!important}
#app .smartPanel>small{font-size:8px!important}
#app .smartPanel>b{font-size:11px!important}
#app .smartPanel span{font-size:9px!important}
#app .sideQuote{font-size:10px!important}

.filterWrap{position:relative;display:inline-flex;align-items:center}
.filterPopover{position:absolute!important;top:44px!important;right:0!important;z-index:60!important;width:min(760px,88vw)!important;margin:0!important;padding:12px!important;grid-template-columns:150px 150px 160px 150px 150px auto!important;gap:8px!important;border:1px solid #cddfeb!important;border-radius:12px!important;background:#fff!important;box-shadow:0 18px 45px rgba(10,48,82,.18)!important}
.filterPopover:before{content:"";position:absolute;top:-7px;right:13px;width:12px;height:12px;background:#fff;border-left:1px solid #cddfeb;border-top:1px solid #cddfeb;transform:rotate(45deg)}
.filterPopover select,.filterPopover input{height:40px!important;font-size:11px!important}
.filterPopover label{font-size:9px!important}
.filterPopover .clearFilter{height:40px!important;font-size:11px!important;white-space:nowrap}
@media(max-width:980px){
  .filterPopover{right:-70px!important;width:min(640px,92vw)!important;grid-template-columns:1fr 1fr 1fr!important}
}
@media(max-width:760px){
  #app .pageHead h1{font-size:21px!important}
  #app .pageHead p{font-size:12px!important}
  #app .entryRow label>span{font-size:9px!important}
  #app .entryRow input,#app .entryRow select{font-size:14px!important}
  #app .mcard h4{font-size:15px!important}
  #app .mcard p{font-size:12px!important}
  .filterPopover{position:fixed!important;top:62px!important;left:10px!important;right:10px!important;width:auto!important;grid-template-columns:1fr 1fr!important}
  .filterPopover:before{display:none!important}
}

/* LOGIN dùng đúng ảnh concept ESTA mới */
#login.newLoginBg{grid-template-columns:minmax(0,1fr) 34%!important;background-size:cover!important;background-position:center!important;background-repeat:no-repeat!important}
#login.newLoginBg .conceptScene>*{opacity:0!important;pointer-events:none!important}
#login.newLoginBg .conceptScene{background:transparent!important}
#login.newLoginBg .conceptLogin{background:transparent!important;backdrop-filter:none!important;padding:4.8vh 3.3vw!important}
#login.newLoginBg .lang{display:none!important}
#login.newLoginBg .loginCard{width:min(445px,94%)!important;padding:36px 34px!important;border-radius:22px!important;background:linear-gradient(145deg,rgba(238,247,255,.95),rgba(207,225,241,.90))!important;box-shadow:0 28px 70px rgba(0,15,32,.28)!important}
#login.newLoginBg .welcome{font-size:20px!important}
#login.newLoginBg .loginSub{font-size:13px!important}
#login.newLoginBg .loginCard h1{font-size:36px!important}
#login.newLoginBg .loginLocation b{font-size:18px!important}
#login.newLoginBg .loginLocation span{font-size:10px!important}
#login.newLoginBg .loginCard input{height:52px!important;font-size:13px!important}
#login.newLoginBg .loginCard form button{height:54px!important;font-size:14px!important}
@media(max-width:1100px){
  #login.newLoginBg{grid-template-columns:1fr 390px!important;background-position:52% center!important}
  #login.newLoginBg .loginCard{width:350px!important;padding:30px 28px!important}
}
@media(max-width:760px){
  #login.newLoginBg{display:block!important;background-position:47% center!important}
  #login.newLoginBg .conceptScene{min-height:310px!important}
  #login.newLoginBg .conceptLogin{min-height:auto!important;padding:18px!important;background:linear-gradient(180deg,rgba(3,22,39,.05),rgba(3,22,39,.34))!important}
  #login.newLoginBg .loginCard{width:min(390px,100%)!important}
}

/* FIX LOGIN OVERLAP: ảnh concept chỉ nằm bên trái, form thật nằm riêng bên phải */
#login.newLoginBg{
  grid-template-columns:minmax(0,1fr) 38%!important;
  background:linear-gradient(180deg,#061b31,#082a49)!important;
}
#login.newLoginBg .conceptScene{
  min-height:100vh!important;
  background-image:linear-gradient(90deg,rgba(1,17,31,.10),rgba(2,25,45,.02)),var(--esta-scene)!important;
  background-repeat:no-repeat!important;
  background-size:auto 100%!important;
  background-position:left center!important;
  background-color:#061b31!important;
}
#login.newLoginBg .conceptScene>*{
  opacity:0!important;
  pointer-events:none!important;
}
#login.newLoginBg .conceptLogin{
  min-height:100vh!important;
  background:linear-gradient(180deg,rgba(6,27,49,.96),rgba(7,35,61,.98))!important;
  backdrop-filter:none!important;
  padding:40px!important;
}
#login.newLoginBg .conceptLogin:before{
  content:"";
  position:absolute;
  inset:0;
  background:radial-gradient(circle at 35% 25%,rgba(54,145,205,.12),transparent 35%);
  pointer-events:none;
}
#login.newLoginBg .loginCard{
  position:relative!important;
  z-index:2!important;
  width:min(390px,92%)!important;
  padding:36px 34px!important;
  border-radius:22px!important;
  border:1px solid rgba(255,255,255,.72)!important;
  background:linear-gradient(145deg,rgba(239,248,255,.96),rgba(208,225,241,.92))!important;
  box-shadow:0 28px 70px rgba(0,12,28,.32)!important;
}
#login.newLoginBg .lang{display:block!important;z-index:3!important}
#login.newLoginBg .welcome{font-size:20px!important}
#login.newLoginBg .loginSub{font-size:13px!important}
#login.newLoginBg .loginCard h1{font-size:35px!important}
#login.newLoginBg .loginLocation b{font-size:18px!important}
#login.newLoginBg .loginLocation span{font-size:10px!important}
#login.newLoginBg .loginCard input{height:52px!important;font-size:13px!important}
#login.newLoginBg .loginCard form button{height:54px!important;font-size:14px!important}
@media(max-width:1100px){
  #login.newLoginBg{grid-template-columns:minmax(0,1fr) 410px!important}
  #login.newLoginBg .conceptLogin{padding:24px!important}
  #login.newLoginBg .loginCard{width:350px!important;padding:30px 28px!important}
}
@media(max-width:760px){
  #login.newLoginBg{display:block!important;background:#061b31!important}
  #login.newLoginBg .conceptScene{min-height:300px!important;background-size:auto 100%!important;background-position:left center!important}
  #login.newLoginBg .conceptLogin{min-height:auto!important;padding:18px!important}
  #login.newLoginBg .loginCard{width:min(390px,100%)!important}
}

/* LOGIN ESTA REBUILD 2026-09-22 */
#login.loginRebuild{
  min-height:100vh!important;
  display:grid!important;
  grid-template-columns:minmax(0,1.35fr) minmax(390px,.65fr)!important;
  overflow:hidden!important;
  background:#061a2f!important;
  color:#fff!important;
}
.loginShowcase{
  position:relative;
  min-height:100vh;
  overflow:hidden;
  padding:48px 54px 40px;
  background:
    radial-gradient(circle at 63% 44%,rgba(35,162,233,.16),transparent 28%),
    radial-gradient(circle at 35% 85%,rgba(15,95,154,.18),transparent 34%),
    linear-gradient(135deg,#031427 0%,#082a49 56%,#061a2f 100%);
}
.loginShowcase:before{
  content:"";
  position:absolute;inset:0;
  background-image:
    linear-gradient(rgba(93,190,246,.06) 1px,transparent 1px),
    linear-gradient(90deg,rgba(93,190,246,.06) 1px,transparent 1px);
  background-size:38px 38px;
  mask-image:linear-gradient(90deg,transparent 0%,#000 22%,#000 80%,transparent 100%);
}
.loginBrand{position:relative;z-index:3;display:flex;align-items:center;gap:14px}
.loginBrandIcon{display:grid;place-items:center;width:44px;height:54px;border:1px solid #89d8ff;border-radius:7px;font-size:28px;color:#e7f8ff;background:rgba(14,80,126,.2)}
.loginBrand strong{display:block;font-size:38px;letter-spacing:8px;line-height:1}
.loginBrand small{display:block;margin-top:7px;font-size:9px;letter-spacing:2.7px;color:#9fd4f2}
.loginCopy{position:absolute;z-index:4;left:54px;bottom:112px;max-width:390px}
.loginCopy .eyebrow{font-size:9px;letter-spacing:2.3px;color:#6ec7f7}
.loginCopy h2{margin:10px 0 8px;font-size:34px;line-height:1.22;font-weight:650}
.loginCopy p{margin:0;font-size:13px;color:#b4d4e7}
.digitalBuilding{position:absolute;left:38%;top:16%;width:43%;height:62%;z-index:2}
.digitalBuilding:before,.digitalBuilding:after{content:"";position:absolute;border:1px solid rgba(72,190,255,.45);box-shadow:0 0 26px rgba(54,176,244,.13)}
.digitalBuilding:before{left:4%;top:5%;width:76%;height:85%;transform:skewY(-7deg)}
.digitalBuilding:after{left:18%;top:16%;width:73%;height:68%;transform:skewY(5deg)}
.digitalBuilding .tower{position:absolute;bottom:0;border:1px solid #4fc6ff;background:linear-gradient(180deg,rgba(45,171,235,.18),rgba(5,34,60,.16));box-shadow:0 0 28px rgba(56,183,248,.18)}
.digitalBuilding .t1{left:8%;width:29%;height:78%}.digitalBuilding .t2{left:35%;width:34%;height:100%}.digitalBuilding .t3{left:67%;width:23%;height:67%}
.digitalBuilding .tower:after{content:"";position:absolute;inset:8px;background:repeating-linear-gradient(0deg,rgba(132,219,255,.18) 0 2px,transparent 2px 16px),repeating-linear-gradient(90deg,rgba(132,219,255,.16) 0 1px,transparent 1px 18px)}
.signal{position:absolute;height:1px;background:linear-gradient(90deg,#5ecfff,transparent);transform-origin:left center}
.s1{left:61%;top:25%;width:38%;transform:rotate(-15deg)}.s2{left:63%;top:48%;width:34%;transform:rotate(4deg)}.s3{left:55%;top:66%;width:42%;transform:rotate(13deg)}
.systemPills{position:absolute;z-index:5;right:32px;top:14%;display:grid;gap:12px;width:185px}
.systemPills span{padding:12px 13px;border:1px solid rgba(90,201,255,.48);border-radius:11px;background:linear-gradient(135deg,rgba(15,92,145,.66),rgba(7,51,88,.5));backdrop-filter:blur(8px);box-shadow:0 12px 28px rgba(0,21,42,.12)}
.systemPills b{display:block;font-size:12px}.systemPills small{display:block;margin-top:3px;font-size:8px;color:#c2e4f6}
.systemListNew{position:absolute;z-index:4;left:54px;top:31%;display:grid;grid-template-columns:1fr 1fr;gap:10px 18px}
.systemListNew span{padding:8px 11px;border:1px solid rgba(105,200,248,.2);border-radius:8px;background:rgba(4,37,65,.36);font-size:11px;color:#d8eef9}
.loginShowcaseFoot{position:absolute;z-index:4;left:54px;bottom:36px;font-size:9px;letter-spacing:2.4px;color:#81bedf}

.loginSide{
  position:relative;
  min-height:100vh;
  display:grid;
  place-items:center;
  padding:42px;
  background:
    radial-gradient(circle at 32% 22%,rgba(27,115,173,.12),transparent 36%),
    linear-gradient(180deg,#071f38 0%,#061a2f 100%);
}
.loginSide:before{content:"";position:absolute;left:0;top:0;bottom:0;width:1px;background:linear-gradient(transparent,#2d739f55,transparent)}
.loginLang{position:absolute;right:34px;top:26px;font-size:10px;letter-spacing:1.3px;color:#d8ecf8}
.loginLang i{display:inline-block;width:1px;height:10px;margin:0 9px;background:#6b8ca3;vertical-align:-1px}
.loginCardRebuild{
  width:min(390px,100%)!important;
  padding:38px 34px!important;
  border:1px solid rgba(255,255,255,.7)!important;
  border-radius:24px!important;
  background:linear-gradient(145deg,rgba(238,248,255,.96),rgba(211,228,242,.92))!important;
  color:#0a3158!important;
  box-shadow:0 30px 80px rgba(0,13,30,.38)!important;
  backdrop-filter:blur(20px)!important;
}
.loginCardRebuild .welcome{font-size:21px!important;text-transform:none!important;letter-spacing:0!important;font-weight:750!important;color:#0b4f88!important}
.loginCardRebuild .loginSub{margin:5px 0 12px!important;font-size:12px!important;color:#486a85!important}
.loginCardRebuild h1{margin:0 0 17px!important;font-size:35px!important;letter-spacing:7px!important;color:#0a3158!important}
.loginCardRebuild .loginLocation{margin-bottom:18px!important}
.loginCardRebuild .loginLocation b{font-size:17px!important}.loginCardRebuild .loginLocation span{font-size:9px!important}
.loginCardRebuild label{display:block!important;margin-top:10px!important;font-size:10px!important;color:#5c768b!important}
.loginCardRebuild label>span{display:block;margin:0 0 5px;font-size:10px}
.loginCardRebuild input{width:100%!important;height:50px!important;padding:0 14px!important;border:1px solid #c5d7e4!important;border-radius:10px!important;background:rgba(255,255,255,.72)!important;font-size:13px!important;color:#173f5f!important;outline:none!important}
.loginCardRebuild input:focus{border-color:#49aadd!important;box-shadow:0 0 0 3px rgba(53,157,215,.1)!important}
.loginCardRebuild form button{display:flex!important;align-items:center!important;justify-content:center!important;gap:12px!important;width:100%!important;height:52px!important;margin-top:16px!important;border:0!important;border-radius:10px!important;background:linear-gradient(90deg,#0c5c9e,#0a4279)!important;color:#fff!important;font-size:14px!important;font-weight:750!important;box-shadow:0 12px 25px rgba(7,66,118,.18)!important}
.loginCardRebuild .loginFoot{margin-top:28px!important;text-align:right!important;font-size:8px!important;line-height:1.6!important;letter-spacing:1px!important;color:#52728d!important}

@media(max-width:1100px){
 #login.loginRebuild{grid-template-columns:minmax(0,1fr) 390px!important}
 .loginShowcase{padding:34px}
 .loginBrand strong{font-size:30px}
 .loginCopy{left:34px;bottom:92px}.loginCopy h2{font-size:27px}
 .systemListNew{left:34px;top:34%}
 .systemPills{right:20px;width:155px}
 .digitalBuilding{left:33%;width:48%}
 .loginSide{padding:24px}
 .loginCardRebuild{padding:32px 28px!important}
}
@media(max-width:760px){
 #login.loginRebuild{display:block!important}
 .loginShowcase{min-height:330px;padding:24px}
 .loginBrand strong{font-size:28px}.loginBrand small{font-size:7px}
 .systemListNew{display:none}
 .systemPills{top:92px;right:18px;width:138px;gap:7px}.systemPills span{padding:8px 9px}.systemPills small{display:none}
 .digitalBuilding{left:20%;top:24%;width:56%;height:58%}
 .loginCopy{left:24px;bottom:52px;max-width:250px}.loginCopy .eyebrow{font-size:7px}.loginCopy h2{font-size:20px}.loginCopy p{font-size:10px}
 .loginShowcaseFoot{left:24px;bottom:18px;font-size:7px}
 .loginSide{min-height:auto;padding:18px 16px 26px}
 .loginLang{display:none}
 .loginCardRebuild{width:min(410px,100%)!important;padding:27px 23px!important}
}

/* ===== MODULE NĂNG LƯỢNG ===== */
#app.energyMode .headerSearch,#app.energyMode .filterWrap,#app.energyMode #exportBtn{display:none!important}
.energyHead{margin-bottom:2px}
.energyTabs{display:flex;gap:8px;margin:0 0 12px}
.energyTabs button{height:42px;padding:0 16px;border:1px solid #d5e5ef;border-radius:10px;background:#fff;color:#49687e;font-size:12px;font-weight:700;box-shadow:0 4px 14px rgba(20,66,100,.04)}
.energyTabs button.active{border-color:#1f9f9a;background:#eaf9f7;color:#087f7b;box-shadow:inset 0 -2px #17a6a0}
.energyCard,.energyTableCard{border:1px solid #dce8f2;border-radius:13px;background:#fff;box-shadow:0 8px 26px rgba(21,62,98,.05)}
.energyCard{padding:16px;margin-bottom:13px}
.energyCardTitle{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.energyCardTitle h2,.energyTableTop h2{margin:0;color:#173e61;font-size:16px}
.energyCardTitle p,.energyTableTop p{margin:3px 0 0;color:#7d91a2;font-size:10px}
.energyForm{display:grid;grid-template-columns:145px 170px 190px minmax(220px,1fr) auto;gap:10px;align-items:end}
.energyForm label>span{display:block;margin:0 0 5px;font-size:9px;font-weight:700;color:#62798e}
.energyForm input{width:100%;height:41px;padding:0 10px;border:1px solid #d6e3ed;border-radius:8px;background:#fbfdff;color:#234661;font-size:12px;outline:none}
.energyForm input:focus{border-color:#3ea8a3;box-shadow:0 0 0 3px rgba(34,160,153,.08)}
.energyImageField input{padding:7px;font-size:8px}
.energyNoteField{min-width:0}
.energyActions{display:flex;gap:7px}
.energyActions .primary{height:41px;min-width:90px;border:0;border-radius:8px;background:linear-gradient(90deg,#0d9893,#087f7c);color:#fff;font-size:11px;font-weight:750}
.energyActions .secondary,.secondary.small{height:41px;padding:0 12px;border:1px solid #d2e0e9;border-radius:8px;background:#f8fbfd;color:#557086;font-size:10px}
.energyImagePreview{display:flex;align-items:center;gap:8px;margin-top:10px;font-size:9px;color:#647e93}
.energyImagePreview img{width:74px;height:54px;object-fit:cover;border:1px solid #d3e1ec;border-radius:7px}
.energyTableCard{overflow:hidden}
.energyTableTop{display:flex;align-items:center;justify-content:space-between;padding:14px 15px;border-bottom:1px solid #e4edf4;background:linear-gradient(180deg,#fff,#fbfdff)}
.energyTableTop .pdfAction{height:36px;padding:0 12px;border:1px solid #77bbb6;border-radius:8px;background:#fff;color:#187f7a;font-size:10px}
.energyFilters{display:grid;grid-template-columns:auto auto 145px 145px auto auto;gap:8px;align-items:end;padding:11px 15px;border-bottom:1px solid #e8eff5;background:#fcfeff}
.filterLabel{align-self:center;font-size:9px;font-weight:700;color:#697f91}
.rangeButtons{display:flex;gap:4px}
.rangeButtons button{height:34px;padding:0 10px;border:1px solid #d7e3ec;border-radius:7px;background:#fff;color:#5a7185;font-size:9px}
.rangeButtons button.active{border-color:#34a9a4;background:#e9f8f7;color:#087f7b;font-weight:700}
.energyFilters label{font-size:8px;color:#6c8295}.energyFilters label input{display:block;width:100%;height:34px;margin-top:3px;padding:0 8px;border:1px solid #d7e3ec;border-radius:7px;background:#fff;font-size:9px}
.energyFilters .primary.small{height:34px;padding:0 13px;border:0;border-radius:7px;background:#0c918c;color:#fff;font-size:9px;font-weight:700}
.secondary.small{height:34px!important}
.energySummaryCards{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;padding:11px 15px}
.energySummaryCards article{padding:10px 12px;border:1px solid #e0eaf2;border-radius:9px;background:#f9fcfe}
.energySummaryCards small{display:block;font-size:7px;letter-spacing:.8px;color:#7d91a2}
.energySummaryCards strong{display:block;margin-top:3px;font-size:16px;color:#173f60}
.energyDesktopTable{padding:0 15px 8px}
.energyDesktopTable table{border:1px solid #dfe8ef}
.energyDesktopTable tr.sunday{background:#fff7d9}
.energyThumb{width:42px;height:34px;object-fit:cover;border:1px solid #d0dee8;border-radius:5px;cursor:pointer}
#energyMobileCards{display:none}
.energyLegend{display:flex;gap:20px;padding:8px 15px 12px;color:#7c8f9f;font-size:8px}.energyLegend span:first-child{color:#a27b00}
#energyMobileCards .sunday{background:#fff9e8}
@media(max-width:1350px){
 .energyForm{grid-template-columns:130px 150px 165px minmax(180px,1fr) auto}
 .energyFilters{grid-template-columns:auto auto 135px 135px auto auto}
}
@media(max-width:1100px){
 .energyForm{grid-template-columns:1fr 1fr 1fr}
 .energyNoteField{grid-column:1/3}
 .energyActions{grid-column:3}
 .energyFilters{grid-template-columns:auto 1fr 1fr 1fr}
 .rangeButtons{grid-column:2/5}
}
@media(max-width:760px){
 .energyTabs{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px}
 .energyTabs button{height:46px;padding:0 7px;font-size:10px}
 .energyCard{padding:12px}
 .energyForm{grid-template-columns:1fr 1fr;gap:8px}
 .energyImageField,.energyNoteField{grid-column:1/-1}
 .energyActions{grid-column:1/-1}
 .energyActions .primary,.energyActions .secondary{flex:1}
 .energyTableTop{align-items:flex-start;gap:9px}
 .energyTableTop .pdfAction{white-space:nowrap}
 .energyFilters{grid-template-columns:1fr 1fr;padding:10px}
 .filterLabel{grid-column:1/-1}
 .rangeButtons{grid-column:1/-1;display:grid;grid-template-columns:repeat(4,1fr)}
 .energySummaryCards{grid-template-columns:1fr;padding:10px}
 .energyDesktopTable{display:none}
 #energyMobileCards{display:block}
 .energyLegend{display:block;line-height:1.8}
}

.loginError{min-height:18px;margin-top:9px;font-size:10px;color:#b53346;text-align:center}

/* CRITICAL LOGIN FIX: selector #login.loginRebuild có specificity cao hơn .hide */
#login.loginRebuild.hide{display:none!important}
#app.hide{display:none!important}

/* ===== COMPACT WORK HEADER + LARGE TASK TEXT ===== */
#workHero,#energyHero{display:none!important}
.modulePage{padding:10px 20px 28px!important}
.modulePage>.pageHead{display:none!important}

main>header{
  height:66px!important;
  padding:0 20px!important;
  gap:14px!important;
}
.topModuleTitle{
  display:flex;
  align-items:center;
  gap:10px;
  min-width:260px;
  flex:0 0 auto;
}
.topModuleTitle.hide{display:none!important}
.topModuleIcon{
  display:grid;
  place-items:center;
  width:38px;
  height:38px;
  border-radius:10px;
  background:linear-gradient(145deg,#0f67aa,#0b477c);
  color:#fff;
  box-shadow:0 7px 18px rgba(13,88,145,.16);
  font-size:16px;
}
.topModuleTitle h1{
  margin:0;
  font-size:19px;
  line-height:1.05;
  font-weight:800;
  color:#0b3157;
}
.topModuleTitle p{
  margin:4px 0 0;
  font-size:10px;
  color:#71879a;
}
.headerTools{min-width:0}
.headerSearch{
  width:min(500px,42vw)!important;
  height:40px!important;
}
.headerSearch input{font-size:13.5px!important}
.iconAction,.pdfAction{height:40px!important}

/* Nội dung công việc lớn và dễ đọc hơn */
.tableTop{padding:13px 15px!important}
.tableTop b{font-size:16px!important}
.tableTop span{font-size:10px!important}
.desktopTable th{
  padding:12px 10px!important;
  font-size:10.5px!important;
  letter-spacing:.2px!important;
}
.desktopTable td{
  padding:13px 10px!important;
  font-size:12.5px!important;
  line-height:1.55!important;
}
.desktopTable td:nth-child(2){
  min-width:290px;
  font-size:15px!important;
  line-height:1.55!important;
  font-weight:650!important;
  color:#163d60!important;
}
.desktopTable td:nth-child(6),
.desktopTable td:nth-child(8){font-size:12.5px!important}
.badge,.typeBadge{
  padding:5px 8px!important;
  font-size:10.5px!important;
}
.actions button{
  padding:6px 8px!important;
  font-size:10px!important;
}
.entryRow label>span{font-size:10px!important}
.entryRow input,.entryRow select{font-size:13px!important}
#mobileCards .mcard h4{font-size:14px!important;line-height:1.45!important}
#mobileCards .mcard p{font-size:13px!important;line-height:1.55!important}

@media(max-width:900px){
  main>header{height:62px!important;padding:0 12px!important}
  .topModuleTitle{min-width:0;flex:1}
  .topModuleTitle p{display:none}
  .topModuleTitle h1{font-size:16px}
  .topModuleIcon{width:34px;height:34px}
  .headerTools{flex:0 1 auto}
  .headerSearch{width:min(300px,38vw)!important}
}
@media(max-width:760px){
  .modulePage{padding:10px 12px 24px!important}
  main>header{gap:8px!important}
  .topModuleTitle{gap:7px}
  .topModuleTitle h1{font-size:15px}
  .topModuleIcon{width:32px;height:32px;border-radius:8px}
  .headerSearch{display:none!important}
  .desktopTable td:nth-child(2){font-size:14px!important}
}

/* ===== READABILITY + ENERGY FILTER ROW 2026-09-22 ===== */

/* Công việc: chữ lớn hơn, nét thường, ưu tiên khả năng đọc */
.desktopTable td{
  font-size:14px!important;
  line-height:1.65!important;
  font-weight:400!important;
}
.desktopTable td:nth-child(2){
  min-width:320px!important;
  font-size:17px!important;
  line-height:1.65!important;
  font-weight:400!important;
  color:#173d5d!important;
}
.desktopTable th{
  font-size:11px!important;
  line-height:1.35!important;
}
#mobileCards .mcard h4,
#mobileCards .mcard p{
  font-weight:400!important;
}
#mobileCards .mcard h4{
  font-size:16px!important;
  line-height:1.55!important;
}
#mobileCards .mcard p{
  font-size:14px!important;
  line-height:1.65!important;
}

/* Năng lượng: ghi chú gọn vừa đủ */
.energyForm{
  grid-template-columns:145px 170px 180px 230px auto!important;
}
.energyNoteField{
  width:230px!important;
  max-width:230px!important;
}
.energyNoteField input{
  width:100%!important;
}
.energyDesktopTable th:nth-child(6),
.energyDesktopTable td:nth-child(6){
  width:180px!important;
  max-width:180px!important;
}
.energyDesktopTable td:nth-child(6){
  white-space:nowrap!important;
  overflow:hidden!important;
  text-overflow:ellipsis!important;
}

/* Năng lượng: lọc cùng hàng với nút Xuất PDF */
.energyTableTop{
  display:flex!important;
  align-items:center!important;
  justify-content:space-between!important;
  gap:14px!important;
  padding:12px 14px!important;
  flex-wrap:nowrap!important;
}
.energyTitleBlock{
  flex:0 0 auto;
  min-width:210px;
}
.energyTopTools{
  display:flex;
  align-items:end;
  justify-content:flex-end;
  gap:8px;
  flex:1;
  min-width:0;
}
.energyTopTools .energyFilters{
  display:flex!important;
  align-items:end!important;
  gap:5px!important;
  padding:0!important;
  border:0!important;
  background:transparent!important;
  min-width:0;
  flex-wrap:nowrap!important;
}
.energyTopTools .filterLabel{
  align-self:center!important;
  margin-right:2px!important;
  font-size:9px!important;
  white-space:nowrap;
}
.energyTopTools .rangeButtons{
  display:flex!important;
  gap:3px!important;
  flex-wrap:nowrap!important;
}
.energyTopTools .rangeButtons button{
  height:34px!important;
  padding:0 8px!important;
  font-size:9px!important;
  white-space:nowrap!important;
}
.energyTopTools .energyFilters label{
  width:118px!important;
  font-size:8px!important;
  white-space:nowrap!important;
}
.energyTopTools .energyFilters label input{
  height:34px!important;
  margin-top:2px!important;
  font-size:9px!important;
}
.energyTopTools .energyFilters .small{
  height:34px!important;
  padding:0 9px!important;
  white-space:nowrap!important;
}
.energyTopTools #energyExportPdf{
  flex:0 0 auto;
  height:34px!important;
  white-space:nowrap!important;
}

@media(max-width:1350px){
  .energyForm{
    grid-template-columns:130px 150px 165px 210px auto!important;
  }
  .energyNoteField{
    width:210px!important;
    max-width:210px!important;
  }
  .energyTopTools .rangeButtons button{
    padding:0 6px!important;
  }
  .energyTopTools .energyFilters label{
    width:105px!important;
  }
}
@media(max-width:1100px){
  .energyForm{
    grid-template-columns:1fr 1fr 1fr!important;
  }
  .energyNoteField{
    width:auto!important;
    max-width:none!important;
    grid-column:1/3!important;
  }
  .energyTableTop{
    align-items:flex-start!important;
    flex-wrap:wrap!important;
  }
  .energyTitleBlock{min-width:0}
  .energyTopTools{
    width:100%;
    flex-wrap:wrap!important;
    justify-content:flex-start!important;
  }
  .energyTopTools .energyFilters{
    flex-wrap:wrap!important;
  }
}
@media(max-width:760px){
  .desktopTable td:nth-child(2){
    font-size:16px!important;
  }
  .energyTopTools{
    display:block!important;
  }
  .energyTopTools .energyFilters{
    display:grid!important;
    grid-template-columns:1fr 1fr!important;
    gap:6px!important;
    margin-bottom:7px!important;
  }
  .energyTopTools .filterLabel,
  .energyTopTools .rangeButtons{
    grid-column:1/-1!important;
  }
  .energyTopTools .energyFilters label{
    width:auto!important;
  }
  .energyTopTools #energyExportPdf{
    width:100%!important;
  }
}

/* Sidebar gọn sau khi bỏ thẻ tòa nhà và Smart Building */
#app aside nav{margin-top:16px}
.sideBackup{margin-top:auto!important;padding-top:14px}

/* Tổng tiêu thụ đặt cạnh tiêu đề bảng Năng lượng */
.energyTitleLine{
  display:flex;
  align-items:center;
  gap:12px;
  flex-wrap:wrap;
}
.energyTotalInline{
  display:inline-flex;
  align-items:center;
  gap:7px;
  min-height:30px;
  padding:5px 10px;
  border:1px solid #b9dedb;
  border-radius:8px;
  background:#eefafa;
  color:#0b746f;
  white-space:nowrap;
}
.energyTotalInline span{
  font-size:9px;
  font-weight:600;
}
.energyTotalInline strong{
  font-size:14px;
  font-weight:700;
  color:#075d59;
}
@media(max-width:760px){
  .energyTitleLine{align-items:flex-start;gap:7px}
  .energyTotalInline{min-height:28px;padding:4px 8px}
  .energyTotalInline strong{font-size:13px}
}

/* Xuất báo cáo tổng hợp */
.exportModalWide{width:min(620px,92vw)!important}
.exportSection{padding:12px 0 2px}
.exportSection+ .exportSection{margin-top:12px;padding-top:14px;border-top:1px solid #e3ebf2}
.exportSection>b{display:block;margin-bottom:5px;color:#173f60;font-size:13px}
.exportSection>small{display:block;margin:-1px 0 9px;color:#71879a;font-size:9px}
.combinedChoices{display:grid;grid-template-columns:repeat(4,1fr);gap:7px}
.combinedChoices button{height:38px;border:1px solid #b8d9e8;border-radius:8px;background:#eff9fb;color:#0d6f7b;font-size:10px;font-weight:700}
.combinedChoices button:hover{background:#e0f4f5}
@media(max-width:760px){.combinedChoices{grid-template-columns:1fr 1fr}}

/* ===== ADMIN TRUNG TÂM / ĐA DỰ ÁN ===== */
.adminSetupLink{
  display:block;
  width:100%;
  margin-top:8px;
  border:0;
  background:transparent;
  color:#557a98;
  font-size:9px;
  cursor:pointer;
}
.adminSetupLink:hover{color:#0b5d97;text-decoration:underline}
.adminHero{
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:20px;
  margin-bottom:14px;
  padding:20px 22px;
  border:1px solid #dce8f2;
  border-radius:14px;
  background:linear-gradient(135deg,#0a3155,#0d527f);
  color:#fff;
  box-shadow:0 10px 28px rgba(17,63,100,.08);
}
.adminHero h1{margin:5px 0 6px;font-size:25px;font-weight:700}
.adminHero p{margin:0;max-width:620px;color:#c9e4f4;font-size:12px}
.adminEyebrow{font-size:8px;letter-spacing:2px;color:#7fd2ff}
.adminConnectionWrap{display:flex;align-items:center;gap:8px;flex-wrap:wrap;justify-content:flex-end}
.adminConnection{
  padding:8px 11px;
  border-radius:9px;
  font-size:9px;
  font-weight:700;
  white-space:nowrap;
}
.adminConnection.ok{background:#eaf8ef;color:#1d7f4b;border:1px solid #a9dfbf}
.adminConnection.warn{background:#fff6df;color:#916519;border:1px solid #ead39c}
.adminSection{
  border:1px solid #dce8f2;
  border-radius:13px;
  background:#fff;
  box-shadow:0 7px 24px rgba(22,62,99,.05);
  padding:15px;
}
.adminSectionHead{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  margin-bottom:12px;
}
.adminSectionHead h2{margin:0;font-size:16px;color:#173f61}
.adminSectionHead p{margin:3px 0 0;font-size:9px;color:#778d9f}
.adminSectionHead>span{font-size:9px;color:#6e8496}
.adminProjectGrid{
  display:grid;
  grid-template-columns:repeat(5,minmax(150px,1fr));
  gap:9px;
}
.adminProjectCard{
  display:flex;
  align-items:center;
  gap:10px;
  min-height:92px;
  padding:13px;
  border:1px solid #dce8f2;
  border-radius:11px;
  background:linear-gradient(180deg,#fff,#f8fbfd);
  text-align:left;
  cursor:pointer;
  color:#183f60;
  transition:.18s ease;
}
.adminProjectCard:hover{transform:translateY(-2px);border-color:#8dc4e1;box-shadow:0 9px 20px rgba(29,83,123,.08)}
.adminProjectCard>span{margin-left:auto;font-size:18px;color:#4f8db8}
.adminProjectIcon{display:grid;place-items:center;width:38px;height:38px;border-radius:9px;background:#e8f4fb;color:#0d679f;font-size:18px;flex:0 0 auto}
.adminProjectCard small{display:block;font-size:7px;color:#7890a4}
.adminProjectCard h3{margin:2px 0 3px;font-size:12px;font-weight:700}
.adminProjectCard p{margin:0;font-size:8px;color:#8498a8}
.adminAccountsGrid{display:grid;grid-template-columns:minmax(340px,.8fr) minmax(520px,1.2fr);gap:12px;margin-top:12px}
.adminCreateForm{display:grid;grid-template-columns:1fr 1fr;gap:9px}
.adminCreateForm label>span,.adminSetupForm label>span{display:block;margin:0 0 5px;font-size:9px;font-weight:700;color:#637b8f}
.adminCreateForm input,.adminCreateForm select,.adminSetupForm input{
  width:100%;height:41px;padding:0 10px;border:1px solid #d7e4ed;border-radius:8px;background:#fbfdff;color:#244761;font-size:11px;outline:none
}
.adminCreateForm input:focus,.adminCreateForm select:focus,.adminSetupForm input:focus{border-color:#48a8d6;box-shadow:0 0 0 3px rgba(61,157,208,.09)}
.adminCreateForm .primary{grid-column:1/-1;height:42px;border:0;border-radius:8px;background:linear-gradient(90deg,#0c679f,#0a4b7e);color:#fff;font-weight:700}
.adminHint{margin:10px 0 0;font-size:9px;color:#8094a4}
.adminUsersList{display:grid;gap:8px;max-height:470px;overflow:auto}
.adminUserRow{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px;border:1px solid #e0eaf1;border-radius:9px;background:#fbfdff}
.adminUserMain{display:flex;align-items:center;gap:9px;min-width:0}
.adminAvatar{display:grid;place-items:center;width:34px;height:34px;border-radius:50%;background:#e8f4fb;color:#0b679f;font-size:14px;font-weight:700;flex:0 0 auto}
.adminUserMain b{display:block;font-size:11px;color:#193f5f}
.adminUserMain small{display:block;margin-top:2px;font-size:8px;color:#8397a7}
.adminUserProjects{display:flex;gap:4px;flex-wrap:wrap;margin-top:5px}
.adminUserProjects span{padding:3px 6px;border-radius:10px;background:#edf5fa;color:#53748c;font-size:7px}
.adminUserActions{display:flex;gap:5px;align-items:center;flex:0 0 auto}
.adminUserActions button{height:29px;padding:0 8px;border:1px solid #d7e3eb;border-radius:6px;background:#fff;color:#4a6b83;font-size:8px}
.adminUserActions button.danger{border-color:#edc4c8;color:#a8424d}
.adminUserActions button.success{border-color:#b6dfc6;color:#1f7b4c}
.adminBadge{padding:5px 8px;border-radius:9px;background:#e7f2fb;color:#1b628f;font-size:7px;font-weight:700}
.adminNeedsCentral{padding:18px;text-align:center;border:1px dashed #cfdde7;border-radius:9px;background:#fafcfd;color:#60778b}
.adminNeedsCentral b{font-size:11px}.adminNeedsCentral p{font-size:9px}.adminNeedsCentral button{height:34px;padding:0 12px;border:0;border-radius:7px;background:#0d659d;color:#fff;font-size:9px}
.adminSetupCard{width:min(430px,92vw)!important}
.adminSetupForm{display:grid;gap:10px}
.adminSetupForm .primary{height:42px;border:0;border-radius:8px;background:#0c679f;color:#fff;font-weight:700}
.adminSetupMessage{min-height:18px;font-size:9px;color:#8b5a1b;text-align:center}
#app.adminMode .headerTools{visibility:hidden}
#app.adminMode .account{margin-left:auto}
@media(max-width:1200px){
  .adminProjectGrid{grid-template-columns:repeat(3,1fr)}
  .adminAccountsGrid{grid-template-columns:1fr}
}
@media(max-width:760px){
  .adminHero{display:block;padding:16px}
  .adminConnectionWrap{justify-content:flex-start;margin-top:12px}
  .adminProjectGrid{grid-template-columns:1fr 1fr}
  .adminCreateForm{grid-template-columns:1fr}
  .adminCreateForm .primary{grid-column:auto}
  .adminUserRow{align-items:flex-start;flex-direction:column}
  .adminUserActions{width:100%}
}

/* Admin: thêm / xóa dự án */
.adminProjectHeadActions{display:flex;align-items:center;gap:8px}
.adminProjectHeadActions .primary.small{
  height:34px;
  padding:0 11px;
  border:0;
  border-radius:8px;
  background:#0d679f;
  color:#fff;
  font-size:9px;
  font-weight:700;
}
.adminProjectHeadActions .primary.small:disabled{opacity:.45;cursor:not-allowed}
.adminProjectCard{
  position:relative;
  min-height:92px;
  padding:0!important;
  overflow:visible;
}
.adminProjectOpen{
  width:100%;
  min-height:92px;
  display:flex;
  align-items:center;
  gap:10px;
  padding:13px;
  border:0;
  border-radius:11px;
  background:transparent;
  text-align:left;
  cursor:pointer;
  color:#183f60;
}
.adminProjectDelete{
  position:absolute;
  top:7px;
  right:7px;
  width:25px;
  height:25px;
  display:grid;
  place-items:center;
  border:1px solid #efc6ca;
  border-radius:7px;
  background:#fff;
  color:#b84551;
  font-size:15px;
  line-height:1;
  cursor:pointer;
  opacity:.82;
}
.adminProjectDelete:hover{background:#fff1f2;opacity:1}
.projectModalCard{width:min(430px,92vw)!important}
.projectForm{display:grid;gap:10px}
.projectForm label>span{display:block;margin-bottom:5px;font-size:9px;font-weight:700;color:#637b8f}
.projectForm input{
  width:100%;
  height:42px;
  padding:0 11px;
  border:1px solid #d7e4ed;
  border-radius:8px;
  background:#fbfdff;
  color:#244761;
  font-size:11px;
  outline:none;
}
.projectForm input:focus{border-color:#48a8d6;box-shadow:0 0 0 3px rgba(61,157,208,.09)}
.projectForm .primary{
  height:42px;
  border:0;
  border-radius:8px;
  background:#0c679f;
  color:#fff;
  font-weight:700;
}
@media(max-width:760px){
  .adminProjectHeadActions{width:100%;justify-content:space-between}
}

/* ===== ADMIN SETTINGS HUB ===== */
.settingsGearBtn{
  height:34px;
  display:inline-flex;
  align-items:center;
  gap:6px;
  padding:0 11px;
  border:1px solid #cfe0eb;
  border-radius:8px;
  background:#fff;
  color:#1e5e87;
  font-size:9px;
  font-weight:700;
  cursor:pointer;
}
.settingsGearBtn:hover{background:#f2f8fb;border-color:#9dc8dd}
.adminManageHint{
  display:flex;
  align-items:center;
  gap:12px;
  margin-top:12px;
}
.adminManageHintIcon{
  width:38px;height:38px;display:grid;place-items:center;flex:0 0 auto;
  border-radius:10px;background:#edf5fa;color:#155e8d;font-size:17px
}
.adminManageHint h3{margin:0 0 3px;font-size:12px;color:#1b4564}
.adminManageHint p{margin:0;font-size:9px;color:#71889a;line-height:1.5}
.adminManageHint>button{
  margin-left:auto;height:34px;padding:0 11px;border:1px solid #d5e3ec;border-radius:8px;
  background:#fff;color:#326783;font-size:9px;font-weight:700;white-space:nowrap
}
.adminSettingsCard{
  width:min(920px,94vw)!important;
  max-height:88vh;
  overflow:hidden;
  padding:0!important;
}
.settingsHead{padding:18px 20px 12px;border-bottom:1px solid #e5edf3;background:linear-gradient(180deg,#fff,#f9fcfe)}
.settingsHead span{font-size:7px;letter-spacing:1.6px;color:#7ca0b6}
.settingsHead h3{margin:4px 0 4px;font-size:19px;color:#173f60}
.settingsHead p{margin:0;font-size:9px;color:#738b9c}
.settingsTabs{
  display:flex;
  gap:5px;
  padding:10px 14px;
  border-bottom:1px solid #e5edf3;
  background:#f8fbfd;
}
.settingsTabs button{
  height:34px;padding:0 11px;border:1px solid transparent;border-radius:8px;
  background:transparent;color:#648095;font-size:9px;font-weight:700;cursor:pointer
}
.settingsTabs button.active{background:#fff;border-color:#cfe0eb;color:#0d6598;box-shadow:0 3px 10px rgba(22,70,101,.05)}
.settingsPane{
  padding:15px 17px 18px;
  max-height:66vh;
  overflow:auto;
}
.settingsPaneTitle{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px}
.settingsPaneTitle h4{margin:0;font-size:14px;color:#193f5f}
.settingsPaneTitle p{margin:3px 0 0;font-size:9px;color:#778d9f}
.settingsInlineForm{
  grid-template-columns:150px minmax(220px,1fr) 130px!important;
  align-items:end;
  margin-bottom:13px;
  padding:12px;
  border:1px solid #e1ebf1;
  border-radius:10px;
  background:#f9fcfe;
}
.settingsInlineForm .adminSetupMessage{grid-column:1/-1;text-align:left}
.settingsList{display:grid;gap:7px}
.settingsRow{
  display:flex;align-items:center;justify-content:space-between;gap:10px;
  padding:10px 11px;border:1px solid #e0eaf1;border-radius:9px;background:#fff
}
.settingsRowMain{display:flex;align-items:center;gap:9px;min-width:0}
.settingsRowIcon{
  width:34px;height:34px;display:grid;place-items:center;flex:0 0 auto;
  border-radius:8px;background:#eaf5fb;color:#126b9f;font-size:15px
}
.settingsRowMain b{display:block;font-size:11px;color:#1c435f}
.settingsRowMain small{display:block;margin-top:2px;font-size:8px;color:#8397a7}
.settingsDeleteBtn,.settingsRestoreBtn{
  height:31px;padding:0 9px;border-radius:7px;background:#fff;font-size:8px;font-weight:700;white-space:nowrap;cursor:pointer
}
.settingsDeleteBtn{border:1px solid #edc6ca;color:#a9434f}
.settingsDeleteBtn:hover{background:#fff3f4}
.settingsRestoreBtn{border:1px solid #b8ddc7;color:#24784d}
.settingsRestoreBtn:hover{background:#f0fbf4}
.trashIcon{background:#f8ecee;color:#a84a54}
.settingsAccountForm{margin-bottom:8px}
.settingsListHead{display:flex;align-items:center;justify-content:space-between;margin:14px 0 8px}
.settingsListHead b{font-size:10px;color:#31546d}
#settingsAccounts .adminUsersList{max-height:330px}
@media(max-width:760px){
  .settingsGearBtn span{display:none}
  .adminManageHint{align-items:flex-start;flex-wrap:wrap}
  .adminManageHint>button{margin-left:50px}
  .settingsTabs{overflow-x:auto}
  .settingsTabs button{white-space:nowrap}
  .settingsInlineForm{grid-template-columns:1fr!important}
  .settingsPane{padding:12px}
  .settingsRow{align-items:flex-start}
}

/* Admin: nút Cài đặt nổi bật hơn */
.settingsGearBtn{
  height:40px!important;
  min-width:96px;
  padding:0 13px!important;
  gap:8px!important;
  font-size:17px!important;
  border-radius:10px!important;
}
.settingsGearBtn span{
  font-size:10px!important;
  font-weight:700!important;
}
@media(max-width:760px){
  .settingsGearBtn{
    min-width:40px;
    width:40px;
    padding:0!important;
    justify-content:center;
    font-size:18px!important;
  }
}

/* ===== CLOUD MEDIA / IMAGE VIEWER ===== */
.thumbMore{
  min-width:28px;height:30px;display:grid;place-items:center;
  border:1px solid #d5e3ee;border-radius:5px;background:#edf5fa;
  color:#2f6688;font-size:9px;font-weight:700
}
img[data-storage-path]:not([src]){
  background:linear-gradient(90deg,#eef4f7,#f8fbfd,#eef4f7);
}
.energyThumbWrap{display:inline-block;cursor:pointer}
.viewerMedia{
  position:relative;
  margin:14px 0 20px;
  padding:12px;
  border:1px solid #dce7ef;
  border-radius:12px;
  background:#f7fafc;
}
.viewerMedia .viewerLargeImage{
  display:block;
  max-width:100%;
  max-height:72vh;
  width:auto;
  height:auto;
  margin:0 auto 10px;
  object-fit:contain;
  border-radius:8px;
}
.viewerDownloadBtn{
  display:flex;
  align-items:center;
  justify-content:center;
  gap:6px;
  min-width:110px;
  height:36px;
  margin:8px auto 0;
  padding:0 13px;
  border:1px solid #b9d4e4;
  border-radius:8px;
  background:#fff;
  color:#155e89;
  font-size:10px;
  font-weight:700;
  cursor:pointer;
}
.viewerDownloadBtn:hover{background:#eaf5fb;border-color:#80b8d7}
@media(max-width:760px){
  .viewer{padding:8px!important}
  .viewerCard{width:98vw!important;max-height:94vh!important;padding:10px!important}
  .viewerMedia{padding:7px;margin:9px 0 14px}
  .viewerMedia .viewerLargeImage{max-height:76vh;margin-bottom:8px}
  .viewerDownloadBtn{width:100%;height:40px;font-size:11px}
}

/* Ảnh rõ hơn sau khi chuyển sang Storage */
.thumbs{align-items:center!important;min-height:42px}
.thumbs img{
  width:48px!important;
  height:40px!important;
  object-fit:cover!important;
  background:#eef4f7;
}
.imageLoadError{
  display:block!important;
  border:1px dashed #c7d7e2!important;
  background:#f6f9fb!important;
  min-width:48px;
  min-height:40px;
}
.viewerMedia .imageLoadError{
  width:100%;
  min-height:220px;
  object-fit:contain;
}

/* ===== FORM NHẬP DỄ NHẬN BIẾT + CAMERA CHỤP NHIỀU ===== */
.entryRow{grid-template-columns:108px minmax(235px,2fr) 116px 128px 130px minmax(130px,1fr) minmax(185px,1.15fr) 76px 35px!important}
.entryRow .requiredField>span:after{content:" *";color:#d65a68;font-weight:800}
.entryRow .dateField input{background:#eef6ff!important;border-color:#bdd7ee!important}
.entryRow .contentField input{background:#effaff!important;border-color:#b8dce9!important}
.entryRow .typeField select{background:#f5f1ff!important;border-color:#d4c7ee!important}
.entryRow .statusField select{background:#fff7e8!important;border-color:#ecd4a5!important;color:#805c17!important}
.entryRow .performerField input{background:#eefaf2!important;border-color:#bfdfca!important}
.entryRow .noteField input{background:#f8fafc!important;border-color:#d8e3eb!important}
.entryRow .imageField{min-width:0}
.entryRow .imageField .imageInputActions{display:grid;grid-template-columns:minmax(0,1fr) 86px;gap:5px}
.entryRow .imageField input{min-width:0;background:#f7f3ff!important;border-color:#d7ccec!important}
.cameraMultiBtn{
  height:39px;border:1px solid #bfcfe9;border-radius:8px;background:#eef4ff;color:#315f91;
  font-size:8px;font-weight:700;white-space:nowrap;cursor:pointer;padding:0 7px
}
.cameraMultiBtn:hover{background:#e2edff;border-color:#91add1}
#imageInfo{font-weight:600}

/* Camera chụp liên tục */
#multiCameraModal{background:rgba(3,16,29,.94)!important;padding:0!important}
.multiCameraCard{
  width:min(760px,100vw);height:min(92vh,850px);display:flex;flex-direction:column;
  overflow:hidden;border-radius:16px;background:#071724;color:#fff;box-shadow:0 24px 70px rgba(0,0,0,.4)
}
.multiCameraHead{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px 15px;background:#0c2233}
.multiCameraHead b{display:block;font-size:14px}
.multiCameraHead span{display:block;margin-top:3px;color:#9fc0d5;font-size:9px}
.multiCameraHead>button{width:34px;height:34px;border:0;border-radius:50%;background:#173c55;color:#fff;font-size:20px}
.cameraStage{position:relative;flex:1;min-height:260px;background:#000;overflow:hidden}
#multiCameraVideo{width:100%;height:100%;object-fit:cover;display:block}
.cameraPermissionMsg{
  position:absolute;inset:0;display:grid;place-items:center;padding:30px;text-align:center;
  background:#091a27;color:#f1c5c5;font-size:12px
}
.cameraCapturedStrip{display:flex;gap:6px;min-height:68px;padding:7px 10px;overflow-x:auto;background:#0a1d2b}
.cameraShot{position:relative;flex:0 0 56px;height:54px;border-radius:7px;overflow:hidden;border:1px solid #2f5369}
.cameraShot img{width:100%;height:100%;object-fit:cover}
.cameraShot span{position:absolute;right:3px;bottom:3px;min-width:17px;height:17px;display:grid;place-items:center;border-radius:9px;background:rgba(0,0,0,.62);font-size:8px}
.multiCameraActions{
  display:grid;grid-template-columns:1fr 76px 1fr;align-items:center;gap:12px;padding:12px 15px 16px;background:#0c2233
}
.multiCameraActions button{height:42px;border-radius:9px}
.multiCameraActions .secondary{border:1px solid #31556d;background:#132f43;color:#c5d7e3;font-size:9px}
.multiCameraActions .primary{border:0;background:#0b75b7;color:#fff;font-size:10px;font-weight:700}
.cameraShootBtn{
  width:66px!important;height:66px!important;justify-self:center;border:4px solid #fff!important;border-radius:50%!important;
  background:transparent!important;padding:5px!important
}
.cameraShootBtn span{display:block;width:100%;height:100%;border-radius:50%;background:#fff}
.cameraShootBtn:active span{transform:scale(.88);background:#d9edf8}

@media(max-width:1200px){
 .entryRow{grid-template-columns:repeat(6,minmax(0,1fr))!important}
 .imageField{grid-column:span 2}
}
@media(max-width:760px){
 .entryRow .dateField input,
 .entryRow .contentField input,
 .entryRow .typeField select,
 .entryRow .statusField select,
 .entryRow .performerField input,
 .entryRow .noteField input,
 .entryRow .imageField input{font-size:13px!important}
 .entryRow .requiredField>span{font-size:10px!important}
 .entryRow .imageField .imageInputActions{grid-template-columns:minmax(0,1fr) 105px}
 .cameraMultiBtn{font-size:10px}
 #multiCameraModal{align-items:stretch!important}
 .multiCameraCard{width:100vw;height:100dvh;max-height:none;border-radius:0}
 .multiCameraHead{padding-top:max(12px,env(safe-area-inset-top))}
 .cameraStage{min-height:0}
 .cameraCapturedStrip{min-height:72px}
 .multiCameraActions{padding-bottom:max(14px,env(safe-area-inset-bottom));grid-template-columns:1fr 74px 1fr;gap:8px}
 .cameraShootBtn{width:64px!important;height:64px!important}
}

/* FIX camera: luôn giữ nút CHỤP hiển thị trên điện thoại */
#multiCameraModal{
  overflow:hidden!important;
}
.multiCameraCard{
  position:relative!important;
  display:grid!important;
  grid-template-rows:auto minmax(0,1fr) 72px 96px!important;
  width:min(760px,100vw)!important;
  height:min(92vh,850px)!important;
  max-height:92vh!important;
}
.cameraStage{
  min-height:0!important;
}
.cameraCapturedStrip{
  min-height:72px!important;
  max-height:72px!important;
}
.multiCameraActions{
  position:relative!important;
  z-index:30!important;
  min-height:96px!important;
  padding:10px 14px 14px!important;
  background:#0c2233!important;
  box-shadow:0 -8px 20px rgba(0,0,0,.18);
}
.cameraShootBtn{
  position:relative!important;
  z-index:40!important;
  display:grid!important;
  place-items:center!important;
  width:70px!important;
  height:70px!important;
  min-width:70px!important;
  min-height:70px!important;
  padding:6px!important;
  border:4px solid #fff!important;
  border-radius:50%!important;
  background:#173044!important;
  overflow:visible!important;
}
.cameraShootBtn>span{
  width:46px!important;
  height:46px!important;
  border-radius:50%!important;
  background:#ff4b55!important;
  box-shadow:0 0 0 2px rgba(255,255,255,.12) inset;
}
.cameraShootBtn>small{
  position:absolute!important;
  left:50%!important;
  bottom:-18px!important;
  transform:translateX(-50%)!important;
  color:#fff!important;
  font-size:8px!important;
  font-weight:800!important;
  letter-spacing:.8px!important;
  white-space:nowrap!important;
}
@media(max-width:760px){
  #multiCameraModal{
    display:grid!important;
    place-items:stretch!important;
    height:100vh!important;
    height:100dvh!important;
  }
  #multiCameraModal.hide{display:none!important}
  .multiCameraCard{
    width:100vw!important;
    max-width:none!important;
    height:100vh!important;
    height:100dvh!important;
    max-height:none!important;
    border-radius:0!important;
    grid-template-rows:auto minmax(0,1fr) 72px 104px!important;
  }
  .multiCameraHead{
    min-height:58px!important;
    padding:calc(10px + env(safe-area-inset-top)) 14px 10px!important;
  }
  .cameraStage{
    min-height:0!important;
  }
  .cameraCapturedStrip{
    min-height:72px!important;
    max-height:72px!important;
  }
  .multiCameraActions{
    position:relative!important;
    bottom:auto!important;
    min-height:104px!important;
    padding:10px 10px calc(18px + env(safe-area-inset-bottom))!important;
    grid-template-columns:minmax(0,1fr) 82px minmax(0,1fr)!important;
    gap:8px!important;
  }
  .cameraShootBtn{
    width:72px!important;
    height:72px!important;
    min-width:72px!important;
    min-height:72px!important;
  }
  .cameraShootBtn>span{
    width:48px!important;
    height:48px!important;
  }
  .cameraShootBtn>small{
    bottom:-17px!important;
    font-size:8px!important;
  }
}

/* ===== CAMERA MOBILE HARD FIX: nút chụp luôn cố định ===== */
@media(max-width:760px){
  #multiCameraModal{
    position:fixed!important;
    inset:0!important;
    width:100vw!important;
    height:100vh!important;
    height:100dvh!important;
    padding:0!important;
    margin:0!important;
    overflow:hidden!important;
    z-index:9999!important;
    background:#000!important;
  }
  #multiCameraModal.hide{display:none!important}
  #multiCameraModal:not(.hide){display:block!important}

  .multiCameraCard{
    position:fixed!important;
    inset:0!important;
    width:100vw!important;
    height:100vh!important;
    height:100dvh!important;
    max-width:none!important;
    max-height:none!important;
    margin:0!important;
    padding:0!important;
    border-radius:0!important;
    overflow:hidden!important;
    background:#000!important;
    display:block!important;
  }

  .multiCameraHead{
    position:absolute!important;
    top:0!important;
    left:0!important;
    right:0!important;
    z-index:60!important;
    min-height:62px!important;
    padding:calc(10px + env(safe-area-inset-top)) 14px 10px!important;
    background:linear-gradient(to bottom,rgba(5,20,31,.96),rgba(5,20,31,.82))!important;
  }

  .cameraStage{
    position:absolute!important;
    top:62px!important;
    left:0!important;
    right:0!important;
    bottom:166px!important;
    min-height:0!important;
    overflow:hidden!important;
    background:#000!important;
  }
  #multiCameraVideo{
    position:absolute!important;
    inset:0!important;
    width:100%!important;
    height:100%!important;
    object-fit:cover!important;
  }

  .cameraCapturedStrip{
    position:absolute!important;
    left:0!important;
    right:0!important;
    bottom:94px!important;
    z-index:55!important;
    height:72px!important;
    min-height:72px!important;
    max-height:72px!important;
    padding:7px 10px!important;
    overflow-x:auto!important;
    background:rgba(7,24,36,.96)!important;
  }

  .multiCameraActions{
    position:absolute!important;
    left:0!important;
    right:0!important;
    bottom:0!important;
    z-index:70!important;
    height:94px!important;
    min-height:94px!important;
    display:grid!important;
    grid-template-columns:1fr 82px 1fr!important;
    align-items:center!important;
    gap:8px!important;
    padding:8px 10px calc(12px + env(safe-area-inset-bottom))!important;
    background:#0b2131!important;
    box-shadow:0 -10px 25px rgba(0,0,0,.3)!important;
  }

  .cameraShootBtn{
    position:relative!important;
    display:grid!important;
    place-items:center!important;
    width:74px!important;
    height:74px!important;
    min-width:74px!important;
    min-height:74px!important;
    justify-self:center!important;
    align-self:center!important;
    padding:6px!important;
    border:4px solid #fff!important;
    border-radius:50%!important;
    background:#173044!important;
    z-index:100!important;
  }
  .cameraShootBtn>span{
    display:block!important;
    width:50px!important;
    height:50px!important;
    border-radius:50%!important;
    background:#ff4050!important;
  }
  .cameraShootBtn>small{
    position:absolute!important;
    bottom:-13px!important;
    left:50%!important;
    transform:translateX(-50%)!important;
    color:#fff!important;
    font-size:8px!important;
    font-weight:800!important;
    line-height:1!important;
    white-space:nowrap!important;
  }

  .multiCameraActions .secondary,
  .multiCameraActions .primary{
    width:100%!important;
    min-width:0!important;
    height:42px!important;
    padding:0 7px!important;
    font-size:9px!important;
    overflow:hidden!important;
    text-overflow:ellipsis!important;
    white-space:nowrap!important;
  }
}

/* CAMERA MOBILE VISUAL VIEWPORT FIX */
@media(max-width:760px){
  #multiCameraModal:not(.hide){
    position:fixed!important;
    top:var(--cam-top,0px)!important;
    left:var(--cam-left,0px)!important;
    right:auto!important;
    bottom:auto!important;
    width:var(--cam-width,100vw)!important;
    height:var(--cam-height,100vh)!important;
    min-height:0!important;
    max-height:none!important;
    margin:0!important;
    padding:0!important;
    display:block!important;
    overflow:hidden!important;
    backdrop-filter:none!important;
    -webkit-backdrop-filter:none!important;
    background:#000!important;
    z-index:2147483000!important;
  }
  #multiCameraModal .multiCameraCard{
    position:absolute!important;
    inset:0!important;
    width:100%!important;
    height:100%!important;
    min-height:0!important;
    max-height:none!important;
    display:block!important;
    overflow:visible!important;
    border:0!important;
    border-radius:0!important;
    background:#000!important;
  }
  #multiCameraModal .multiCameraHead{
    position:absolute!important;
    top:0!important;
    left:0!important;
    right:0!important;
    height:58px!important;
    min-height:58px!important;
    z-index:90!important;
    box-sizing:border-box!important;
    padding:10px 14px!important;
    padding-top:max(10px,env(safe-area-inset-top))!important;
    background:rgba(7,27,41,.96)!important;
  }
  #multiCameraModal .cameraStage{
    position:absolute!important;
    top:58px!important;
    left:0!important;
    right:0!important;
    bottom:152px!important;
    min-height:0!important;
    z-index:10!important;
    overflow:hidden!important;
    background:#000!important;
  }
  #multiCameraModal #multiCameraVideo{
    position:absolute!important;
    inset:0!important;
    width:100%!important;
    height:100%!important;
    max-width:none!important;
    max-height:none!important;
    object-fit:cover!important;
    z-index:1!important;
  }
  #multiCameraModal .cameraCapturedStrip{
    position:absolute!important;
    left:0!important;
    right:0!important;
    bottom:82px!important;
    height:70px!important;
    min-height:70px!important;
    max-height:70px!important;
    z-index:95!important;
    padding:7px 10px!important;
    box-sizing:border-box!important;
    background:rgba(7,25,38,.98)!important;
  }
  #multiCameraModal .multiCameraActions{
    position:absolute!important;
    left:0!important;
    right:0!important;
    bottom:0!important;
    height:82px!important;
    min-height:82px!important;
    z-index:100!important;
    box-sizing:border-box!important;
    display:grid!important;
    grid-template-columns:minmax(0,1fr) 82px minmax(0,1fr)!important;
    align-items:center!important;
    gap:8px!important;
    padding:6px 10px max(10px,env(safe-area-inset-bottom))!important;
    background:#0a2233!important;
    overflow:visible!important;
  }
  #multiCameraModal #cameraShoot{
    position:relative!important;
    top:-8px!important;
    z-index:110!important;
    display:grid!important;
    place-items:center!important;
    width:72px!important;
    height:72px!important;
    min-width:72px!important;
    min-height:72px!important;
    margin:0 auto!important;
    padding:6px!important;
    border:4px solid #fff!important;
    border-radius:50%!important;
    background:#18394f!important;
    visibility:visible!important;
    opacity:1!important;
    pointer-events:auto!important;
  }
  #multiCameraModal #cameraShoot>span{
    display:block!important;
    width:48px!important;
    height:48px!important;
    border-radius:50%!important;
    background:#ff3f4f!important;
  }
  #multiCameraModal #cameraShoot>small{
    display:block!important;
    position:absolute!important;
    left:50%!important;
    bottom:-15px!important;
    transform:translateX(-50%)!important;
    color:#fff!important;
    font-size:8px!important;
    font-weight:800!important;
    line-height:1!important;
    white-space:nowrap!important;
  }
}

/* ===== CAMERA MOBILE WINDOW MODE: không fullscreen ===== */
@media(max-width:760px){
  #multiCameraModal{
    position:fixed!important;
    inset:0!important;
    width:auto!important;
    height:auto!important;
    min-height:0!important;
    max-height:none!important;
    padding:12px!important;
    margin:0!important;
    display:grid!important;
    place-items:center!important;
    overflow:auto!important;
    background:rgba(3,16,29,.78)!important;
    backdrop-filter:blur(3px)!important;
    -webkit-backdrop-filter:blur(3px)!important;
    z-index:9999!important;
  }
  #multiCameraModal.hide{display:none!important}
  #multiCameraModal:not(.hide){
    top:0!important;
    left:0!important;
    right:0!important;
    bottom:0!important;
  }

  #multiCameraModal .multiCameraCard{
    position:relative!important;
    inset:auto!important;
    width:min(94vw,560px)!important;
    height:auto!important;
    max-width:94vw!important;
    max-height:86vh!important;
    margin:auto!important;
    padding:0!important;
    display:flex!important;
    flex-direction:column!important;
    overflow:hidden!important;
    border-radius:16px!important;
    background:#071724!important;
    box-shadow:0 18px 55px rgba(0,0,0,.45)!important;
  }

  #multiCameraModal .multiCameraHead{
    position:relative!important;
    inset:auto!important;
    min-height:54px!important;
    height:auto!important;
    padding:10px 12px!important;
    flex:0 0 auto!important;
    background:#0c2233!important;
    z-index:2!important;
  }
  #multiCameraModal .multiCameraHead span{font-size:8px!important}

  #multiCameraModal .cameraStage{
    position:relative!important;
    inset:auto!important;
    top:auto!important;
    left:auto!important;
    right:auto!important;
    bottom:auto!important;
    width:100%!important;
    height:42vh!important;
    min-height:250px!important;
    max-height:390px!important;
    flex:0 0 auto!important;
    overflow:hidden!important;
    background:#000!important;
    z-index:1!important;
  }
  #multiCameraModal #multiCameraVideo{
    position:absolute!important;
    inset:0!important;
    width:100%!important;
    height:100%!important;
    object-fit:cover!important;
  }

  #multiCameraModal .cameraCapturedStrip{
    position:relative!important;
    inset:auto!important;
    left:auto!important;
    right:auto!important;
    bottom:auto!important;
    width:100%!important;
    height:64px!important;
    min-height:64px!important;
    max-height:64px!important;
    flex:0 0 64px!important;
    padding:5px 8px!important;
    overflow-x:auto!important;
    background:#0a1d2b!important;
    z-index:2!important;
  }
  #multiCameraModal .cameraShot{
    flex:0 0 52px!important;
    height:52px!important;
  }

  #multiCameraModal .multiCameraActions{
    position:relative!important;
    inset:auto!important;
    left:auto!important;
    right:auto!important;
    bottom:auto!important;
    width:100%!important;
    height:auto!important;
    min-height:88px!important;
    flex:0 0 auto!important;
    display:grid!important;
    grid-template-columns:minmax(0,1fr) 76px minmax(0,1fr)!important;
    align-items:center!important;
    gap:8px!important;
    padding:9px 10px 13px!important;
    background:#0c2233!important;
    overflow:visible!important;
    z-index:3!important;
  }

  #multiCameraModal #cameraShoot{
    position:relative!important;
    inset:auto!important;
    top:auto!important;
    left:auto!important;
    right:auto!important;
    bottom:auto!important;
    width:66px!important;
    height:66px!important;
    min-width:66px!important;
    min-height:66px!important;
    margin:0 auto!important;
    display:grid!important;
    place-items:center!important;
    padding:6px!important;
    border:4px solid #fff!important;
    border-radius:50%!important;
    background:#173044!important;
    visibility:visible!important;
    opacity:1!important;
    z-index:5!important;
  }
  #multiCameraModal #cameraShoot>span{
    display:block!important;
    width:44px!important;
    height:44px!important;
    border-radius:50%!important;
    background:#ff4050!important;
  }
  #multiCameraModal #cameraShoot>small{
    position:absolute!important;
    left:50%!important;
    bottom:-13px!important;
    transform:translateX(-50%)!important;
    color:#fff!important;
    font-size:8px!important;
    font-weight:800!important;
    white-space:nowrap!important;
  }

  #multiCameraModal .multiCameraActions .secondary,
  #multiCameraModal .multiCameraActions .primary{
    width:100%!important;
    height:40px!important;
    min-width:0!important;
    padding:0 7px!important;
    font-size:9px!important;
    white-space:nowrap!important;
  }
}
@media(max-width:430px){
  #multiCameraModal{padding:8px!important}
  #multiCameraModal .multiCameraCard{width:96vw!important;max-width:96vw!important;max-height:84vh!important}
  #multiCameraModal .cameraStage{height:38vh!important;min-height:220px!important;max-height:330px!important}
}

/* ===== HÌNH ẢNH MOBILE: CAMERA + THƯ VIỆN NATIVE ===== */
.imageNativeActions{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:6px;
}
.nativeImageInput{
  position:absolute!important;
  width:1px!important;
  height:1px!important;
  opacity:0!important;
  pointer-events:none!important;
}
.imageActionBtn{
  height:42px;
  border-radius:8px;
  font-size:10px;
  font-weight:700;
  cursor:pointer;
  white-space:nowrap;
}
.cameraBtn{
  border:1px solid #b8d6ea;
  background:#eef8ff;
  color:#1e668f;
}
.libraryBtn{
  border:1px solid #d5c7ec;
  background:#f7f2ff;
  color:#66508f;
}
.imageActionBtn:active{transform:translateY(1px)}
@media(max-width:760px){
  .imageNativeActions{grid-template-columns:1fr 1fr;gap:8px}
  .imageActionBtn{height:46px;font-size:11px}
  .imageField{grid-column:1/-1!important}
  #imageInfo{font-size:10px!important;line-height:1.45}
}

/* ===== WORKFLOW ẢNH: ưu tiên chọn nhiều từ Thư viện ===== */
.imageHelp{
  display:block;
  margin-top:5px;
  color:#71869a;
  font-size:8px;
  line-height:1.35;
}
.libraryBtn{
  border-color:#9dc8e4!important;
  background:linear-gradient(180deg,#eef9ff,#e5f4ff)!important;
  color:#145f8d!important;
  box-shadow:0 2px 7px rgba(35,117,167,.08);
}
.cameraBtn{
  border-color:#d7e1e8!important;
  background:#f7fafc!important;
  color:#5d7284!important;
}
.pendingImagePreview{
  display:flex;
  gap:7px;
  overflow-x:auto;
  margin-top:7px;
  padding-bottom:2px;
}
.pendingImagePreview:empty{display:none}
.pendingImg{
  position:relative;
  flex:0 0 62px;
  width:62px;
  height:56px;
  border:1px solid #cfdee8;
  border-radius:8px;
  overflow:hidden;
  background:#f2f6f9;
}
.pendingImg img{
  width:100%;
  height:100%;
  object-fit:cover;
  display:block;
}
.pendingImg button{
  position:absolute;
  top:2px;
  right:2px;
  width:20px;
  height:20px;
  padding:0;
  border:0;
  border-radius:50%;
  background:rgba(18,42,58,.78);
  color:#fff;
  font-size:14px;
  line-height:20px;
  cursor:pointer;
}
.pendingImg span{
  position:absolute;
  left:3px;
  bottom:3px;
  min-width:17px;
  height:17px;
  padding:0 4px;
  display:grid;
  place-items:center;
  border-radius:9px;
  background:rgba(18,42,58,.72);
  color:#fff;
  font-size:8px;
}
@media(max-width:760px){
  .imageNativeActions{
    grid-template-columns:1.25fr .9fr!important;
  }
  .libraryBtn{
    font-size:11px!important;
    font-weight:800!important;
  }
  .cameraBtn{font-size:10px!important}
  .imageHelp{
    margin-top:6px;
    font-size:9px!important;
  }
  .pendingImg{
    flex-basis:70px;
    width:70px;
    height:62px;
  }
}

/* =========================================================
   ESTA LOGIN V3 — PREMIUM TECHNICAL OPERATION
   Inspired by the user's reference composition; CSS-only,
   no external background image dependency.
   ========================================================= */
#login.loginV3{
  display:grid!important;
  grid-template-columns:minmax(410px,38%) minmax(0,62%)!important;
  min-height:100vh!important;
  background:#f7fafc!important;
  color:#183954!important;
  overflow:hidden!important;
}
#login.loginV3 .loginPanel{
  position:relative;
  z-index:5;
  min-height:100vh;
  background:
    radial-gradient(circle at 78% 82%,rgba(0,183,220,.055),transparent 28%),
    linear-gradient(180deg,#ffffff 0%,#fbfdff 100%);
  border-right:1px solid #dce7ef;
}
#login.loginV3 .loginPanelInner{
  position:relative;
  width:min(470px,calc(100% - 74px));
  min-height:100vh;
  margin:0 auto;
  padding:44px 0 38px;
  display:flex;
  flex-direction:column;
}
.loginLogo{
  display:flex;
  align-items:center;
  gap:12px;
}
.loginLogoMark{
  position:relative;
  width:45px;
  height:52px;
}
.loginLogoMark i{
  position:absolute;
  bottom:0;
  width:11px;
  border:2px solid #123d63;
  border-bottom-width:3px;
  transform:skewY(-10deg);
}
.loginLogoMark i:nth-child(1){left:2px;height:29px}
.loginLogoMark i:nth-child(2){left:16px;height:43px}
.loginLogoMark i:nth-child(3){left:30px;height:35px}
.loginLogoMark:after{
  content:"";
  position:absolute;
  left:16px;
  top:1px;
  width:2px;
  height:16px;
  background:#1ab5d1;
  transform:rotate(38deg);
  transform-origin:bottom;
}
.loginLogo strong{
  display:block;
  color:#102f4c;
  font-size:25px;
  line-height:1;
  letter-spacing:3.5px;
  font-weight:850;
}
.loginLogo small{
  display:block;
  margin-top:4px;
  color:#647b8e;
  font-size:7px;
  letter-spacing:1.65px;
  font-weight:700;
}
.loginPanelTagline{
  margin-top:28px;
  padding-top:13px;
  border-top:1px solid #dfe8ef;
  color:#7890a2;
  font-size:7px;
  letter-spacing:2px;
  font-weight:700;
}
.loginFormWrap{
  width:100%;
  margin:auto 0;
  padding:48px 0 34px;
}
.loginEyebrow{
  display:block;
  margin-bottom:9px;
  color:#22a8c3;
  font-size:8px;
  letter-spacing:1.8px;
  font-weight:800;
}
.loginFormWrap h1{
  margin:0!important;
  color:#122f4b!important;
  font-size:29px!important;
  line-height:1.12!important;
  letter-spacing:-.5px!important;
  font-weight:820!important;
}
.loginFormWrap>p{
  margin:8px 0 28px;
  color:#718798;
  font-size:11px;
}
.premiumLoginForm label{
  display:block!important;
  margin:0 0 15px!important;
  color:#173a58!important;
  font-size:10px!important;
  font-weight:750!important;
}
.premiumLoginForm label>span{
  display:block;
  margin:0 0 7px!important;
  font-size:10px!important;
}
.loginInputWrap{
  position:relative;
}
.loginInputWrap>b{
  position:absolute;
  left:13px;
  top:50%;
  transform:translateY(-50%);
  z-index:2;
  width:18px;
  text-align:center;
  color:#6f8ca4;
  font-size:14px;
  font-weight:500;
}
#login.loginV3 .premiumLoginForm .loginInputWrap input{
  width:100%!important;
  height:48px!important;
  padding:0 43px 0 40px!important;
  border:1px solid #ccdbe6!important;
  border-radius:6px!important;
  background:#fff!important;
  color:#163a57!important;
  font-size:11px!important;
  outline:0!important;
  transition:border-color .18s,box-shadow .18s,background .18s;
  box-shadow:0 1px 2px rgba(18,47,75,.02)!important;
}
#login.loginV3 .premiumLoginForm .loginInputWrap input::placeholder{color:#a2b0bb}
#login.loginV3 .premiumLoginForm .loginInputWrap input:focus{
  border-color:#27b5d0!important;
  background:#fff!important;
  box-shadow:0 0 0 3px rgba(32,177,205,.10)!important;
}
.passwordToggle{
  position:absolute!important;
  right:6px!important;
  top:50%!important;
  transform:translateY(-50%)!important;
  width:35px!important;
  height:35px!important;
  margin:0!important;
  padding:0!important;
  display:grid!important;
  place-items:center!important;
  border:0!important;
  border-radius:6px!important;
  background:transparent!important;
  color:#7690a5!important;
  font-size:13px!important;
  box-shadow:none!important;
}
.passwordToggle:hover{background:#f0f6fa!important;color:#2f698f!important}
#login.loginV3 .premiumLoginBtn{
  width:100%!important;
  height:50px!important;
  margin:5px 0 0!important;
  display:flex!important;
  align-items:center!important;
  justify-content:center!important;
  gap:12px!important;
  border:0!important;
  border-radius:6px!important;
  background:linear-gradient(90deg,#11b5d3 0%,#15c3d5 54%,#20c9dc 100%)!important;
  color:#fff!important;
  font-size:11px!important;
  font-weight:800!important;
  box-shadow:0 10px 24px rgba(25,180,207,.18)!important;
  transition:transform .15s,box-shadow .15s,filter .15s;
}
#login.loginV3 .premiumLoginBtn:hover{
  transform:translateY(-1px);
  box-shadow:0 13px 29px rgba(25,180,207,.24)!important;
  filter:saturate(1.08);
}
#login.loginV3 .premiumLoginBtn:disabled{opacity:.68;transform:none}
#login.loginV3 .loginError{
  min-height:18px!important;
  margin:8px 0 0!important;
  color:#bd4051!important;
  font-size:9px!important;
  text-align:center!important;
}
#login.loginV3 .adminSetupLink{
  width:auto!important;
  height:auto!important;
  margin:2px auto 0!important;
  padding:3px 6px!important;
  display:block!important;
  border:0!important;
  background:transparent!important;
  box-shadow:none!important;
  color:#90a1ad!important;
  font-size:8px!important;
  font-weight:500!important;
}
#login.loginV3 .adminSetupLink:hover{color:#2789a8!important;text-decoration:none!important}
.loginPanelFooter{
  margin-top:auto;
  padding-top:12px;
  border-top:1px solid #e4ebf0;
  color:#7d91a0;
  font-size:8px;
}
.loginPanelFooter span{color:#2d6c99;font-size:8px}
.loginVersion{
  display:flex;
  justify-content:space-between;
  gap:12px;
  margin-top:35px;
  color:#9aa8b2;
  font-size:6.5px;
  letter-spacing:1px;
}
.loginVersion b{color:#738a9c}

/* Hero */
#login.loginV3 .loginHero{
  position:relative;
  min-height:100vh;
  overflow:hidden;
  background:
    radial-gradient(circle at 72% 75%,rgba(18,157,199,.17),transparent 30%),
    radial-gradient(circle at 18% 25%,rgba(8,117,172,.12),transparent 30%),
    linear-gradient(135deg,#08223a 0%,#051a30 53%,#031424 100%);
  color:#fff;
}
.loginHero:before{
  content:"";
  position:absolute;
  inset:0;
  background:
    linear-gradient(rgba(64,165,207,.035) 1px,transparent 1px),
    linear-gradient(90deg,rgba(64,165,207,.035) 1px,transparent 1px);
  background-size:34px 34px;
  mask-image:linear-gradient(180deg,#000 0%,rgba(0,0,0,.75) 70%,transparent);
}
.heroNoise{
  position:absolute;
  inset:0;
  opacity:.18;
  background-image:
    radial-gradient(circle at 20% 30%,#6adcf4 0 1px,transparent 1.2px),
    radial-gradient(circle at 75% 60%,#50c9e7 0 1px,transparent 1.2px);
  background-size:95px 105px,125px 135px;
}
.heroBrandMini{
  position:absolute;
  z-index:10;
  left:36px;
  top:30px;
  color:#7fd4e9;
  font-size:8px;
  letter-spacing:1.8px;
  font-weight:800;
}
.heroBrandMini span{color:#7898ad}
.loginHeroCopy{
  position:absolute;
  z-index:10;
  left:8.2%;
  top:16%;
  width:min(520px,62%);
}
.heroKicker{
  display:block;
  margin-bottom:13px;
  color:#70cfe7;
  font-size:8px;
  letter-spacing:2px;
  font-weight:800;
}
.loginHeroCopy h2{
  margin:0;
  font-size:clamp(33px,4vw,59px);
  line-height:1.04;
  letter-spacing:-1.6px;
  font-weight:830;
}
.loginHeroCopy h2 em{
  display:block;
  margin-top:3px;
  color:#4cd9ee;
  font-style:normal;
}
.loginHeroCopy>p{
  max-width:515px;
  margin:18px 0 0;
  color:#c2d7e3;
  font-size:11px;
  line-height:1.65;
}
.heroFeatureGrid{
  display:grid;
  grid-template-columns:repeat(3,1fr);
  width:min(520px,100%);
  margin-top:34px;
  padding-top:17px;
  border-top:1px solid rgba(80,182,221,.25);
}
.heroFeatureGrid>div{
  display:flex;
  align-items:center;
  gap:10px;
  min-height:46px;
  padding:0 16px;
  border-right:1px solid rgba(80,182,221,.25);
}
.heroFeatureGrid>div:first-child{padding-left:0}
.heroFeatureGrid>div:last-child{border-right:0}
.heroFeatureGrid i{
  display:grid;
  place-items:center;
  width:31px;
  height:36px;
  border:1px solid rgba(90,213,238,.7);
  border-radius:5px;
  color:#5ddbf0;
  font-style:normal;
  font-size:14px;
}
.heroFeatureGrid span{
  color:#d3e4ed;
  font-size:8px;
  line-height:1.5;
}
.heroBuilding{
  position:absolute;
  right:-3%;
  bottom:8%;
  width:48%;
  height:72%;
  perspective:900px;
  filter:drop-shadow(0 15px 45px rgba(3,11,21,.6));
}
.heroBuilding .hb{
  position:absolute;
  bottom:0;
  border:1px solid rgba(74,185,220,.35);
  background:
    repeating-linear-gradient(0deg,rgba(81,182,215,.10) 0 1px,transparent 1px 19px),
    repeating-linear-gradient(90deg,rgba(81,182,215,.095) 0 1px,transparent 1px 17px),
    linear-gradient(180deg,rgba(9,54,83,.35),rgba(2,19,34,.74));
  box-shadow:inset 0 0 50px rgba(17,115,153,.08),0 0 38px rgba(20,126,169,.09);
}
.heroBuilding .hb:before{
  content:"";
  position:absolute;
  inset:8% 8%;
  background:repeating-linear-gradient(90deg,transparent 0 13px,rgba(101,204,232,.08) 13px 14px);
}
.heroBuilding .hb1{right:3%;width:43%;height:100%;transform:skewY(-3deg)}
.heroBuilding .hb2{right:42%;width:42%;height:70%;transform:skewY(4deg)}
.heroBuilding .hb3{right:72%;width:28%;height:47%;transform:skewY(-5deg)}
.heroGround{
  position:absolute;
  left:-18%;
  right:-10%;
  bottom:-3%;
  height:14%;
  border-top:1px solid rgba(84,199,229,.3);
  background:linear-gradient(180deg,rgba(15,68,94,.18),transparent);
  transform:skewX(-25deg);
}
.heroCircuit{
  position:absolute;
  left:0;
  bottom:0;
  width:60%;
  height:32%;
  opacity:.7;
}
.heroCircuit span{
  position:absolute;
  left:0;
  height:1px;
  background:linear-gradient(90deg,rgba(71,212,239,.1),#3fd3ec 60%,transparent);
  transform-origin:left;
}
.heroCircuit span:after{
  content:"";
  position:absolute;
  right:12%;
  top:-2px;
  width:5px;
  height:5px;
  border:1px solid #4ddcf2;
  border-radius:50%;
}
.heroCircuit .c1{bottom:28%;width:58%;transform:rotate(-4deg)}
.heroCircuit .c2{bottom:17%;width:45%;transform:rotate(3deg)}
.heroCircuit .c3{bottom:46%;width:35%;transform:rotate(-10deg)}
.heroCircuit .c4{bottom:8%;width:68%;transform:rotate(7deg)}
.heroMeta{
  position:absolute;
  right:34%;
  bottom:16%;
  z-index:12;
  color:#79b6c9;
  font-size:7px;
  line-height:2.2;
  letter-spacing:1.2px;
  text-align:right;
}
.heroMeta span{display:block}
.heroFooter{
  position:absolute;
  z-index:12;
  right:30px;
  bottom:24px;
  color:#7898a8;
  font-size:6.5px;
  letter-spacing:1.4px;
}

/* Responsive */
@media(max-width:1100px){
  #login.loginV3{grid-template-columns:430px minmax(0,1fr)!important}
  #login.loginV3 .loginPanelInner{width:360px}
  .loginHeroCopy{left:7%;top:15%;width:66%}
  .loginHeroCopy h2{font-size:38px}
  .heroBuilding{right:-8%;width:51%;opacity:.82}
  .heroFeatureGrid{width:450px}
}
@media(max-width:820px){
  #login.loginV3{
    display:block!important;
    min-height:100vh!important;
    background:#fff!important;
  }
  #login.loginV3 .loginPanel{
    min-height:100vh;
    border-right:0;
  }
  #login.loginV3 .loginPanelInner{
    width:min(420px,calc(100% - 36px));
    min-height:100vh;
    padding:28px 0 24px;
  }
  .loginPanelTagline{margin-top:20px}
  .loginFormWrap{padding:42px 0 30px}
  .loginFormWrap h1{font-size:27px!important}
  .loginVersion{margin-top:24px}
  #login.loginV3 .loginHero{display:none}
}
@media(max-width:430px){
  #login.loginV3 .loginPanelInner{width:calc(100% - 30px)}
  .loginLogo strong{font-size:23px}
  .loginFormWrap{padding-top:36px}
  .loginFormWrap h1{font-size:25px!important}
  #login.loginV3 .premiumLoginForm .loginInputWrap input{height:50px!important;font-size:12px!important}
  #login.loginV3 .premiumLoginBtn{height:50px!important;font-size:12px!important}
}

/* =========================================================
   ESTA LOGIN V4 — CLOSER TO PROVIDED REFERENCE
   Real architectural image + exact 37/63 composition
   ========================================================= */
#login.loginV3{
  grid-template-columns:37% 63%!important;
  background:#fff!important;
}
#login.loginV3 .loginPanel{
  background:#fff!important;
  border-right:0!important;
}
#login.loginV3 .loginPanelInner{
  width:min(430px,calc(100% - 72px))!important;
  padding:42px 0 24px!important;
}
.loginLogo{
  align-items:flex-start!important;
}
.loginLogoMark{
  width:48px!important;
  height:54px!important;
}
.loginLogo strong{
  font-size:24px!important;
  letter-spacing:2.4px!important;
}
.loginLogo small{
  margin-top:5px!important;
  font-size:6.5px!important;
  letter-spacing:1.9px!important;
  color:#5d7486!important;
}
.loginPanelTagline{
  margin-top:22px!important;
  padding-top:0!important;
  border-top:0!important;
  color:#8094a2!important;
  font-size:6.5px!important;
  letter-spacing:1.8px!important;
}
.loginFormWrap{
  width:100%!important;
  margin:auto 0!important;
  padding:24px 0 16px!important;
}
.loginEyebrow{
  display:none!important;
}
.loginFormWrap h1{
  font-size:26px!important;
  line-height:1.1!important;
  color:#15344e!important;
  letter-spacing:-.3px!important;
}
.loginFormWrap>p{
  margin:7px 0 24px!important;
  color:#7b8f9e!important;
  font-size:10px!important;
}
.premiumLoginForm label{
  margin-bottom:13px!important;
  color:#253f55!important;
  font-size:9px!important;
}
.premiumLoginForm label>span{
  margin-bottom:6px!important;
  font-size:9px!important;
}
#login.loginV3 .premiumLoginForm .loginInputWrap input{
  height:44px!important;
  border-radius:4px!important;
  border-color:#d4dfe7!important;
  background:#fff!important;
  font-size:10px!important;
}
.loginInputWrap>b{
  color:#7890a4!important;
  font-size:13px!important;
}
#login.loginV3 .premiumLoginBtn{
  height:46px!important;
  border-radius:4px!important;
  margin-top:6px!important;
  background:linear-gradient(90deg,#12b8d1,#19c6d8)!important;
  font-size:10px!important;
  letter-spacing:.1px!important;
  box-shadow:0 8px 18px rgba(21,185,210,.18)!important;
}
#login.loginV3 .adminSetupLink{
  font-size:7px!important;
  color:#9aa8b2!important;
}
.loginPanelFooter{
  margin-top:14px!important;
  padding-top:11px!important;
  border-top:1px solid #e7edf1!important;
  color:#8999a5!important;
  font-size:7px!important;
}
.loginVersion{
  margin-top:18px!important;
  font-size:6px!important;
  color:#a1adb6!important;
}

/* Use real building imagery; CSS-only building was the main visual gap */
#login.loginV3 .loginHero{
  background:
    linear-gradient(90deg,rgba(4,27,48,.96) 0%,rgba(4,27,48,.84) 34%,rgba(4,27,48,.48) 64%,rgba(3,20,35,.22) 100%),
    linear-gradient(180deg,rgba(2,24,44,.08),rgba(2,19,34,.35)),
    url("https://images.unsplash.com/photo-1770706240294-9af499a58a52?auto=format&fit=crop&fm=jpg&q=82&w=2200") center/cover no-repeat!important;
}
#login.loginV3 .loginHero:before{
  opacity:.72!important;
  background:
    linear-gradient(rgba(54,181,218,.05) 1px,transparent 1px),
    linear-gradient(90deg,rgba(54,181,218,.05) 1px,transparent 1px)!important;
  background-size:36px 36px!important;
  mask-image:linear-gradient(90deg,#000 0%,#000 74%,transparent 100%)!important;
}
#login.loginV3 .loginHero:after{
  content:"";
  position:absolute;
  inset:0;
  pointer-events:none;
  background:
    linear-gradient(90deg,rgba(4,31,53,.88) 0%,rgba(4,31,53,.62) 34%,transparent 70%),
    radial-gradient(circle at 87% 72%,rgba(35,188,220,.10),transparent 28%);
}
#login.loginV3 .heroNoise{
  z-index:2!important;
  opacity:.12!important;
}
#login.loginV3 .heroBrandMini{
  z-index:8!important;
  left:34px!important;
  top:24px!important;
  font-size:6.5px!important;
  letter-spacing:1.6px!important;
  color:#74cce1!important;
}
#login.loginV3 .loginHeroCopy{
  z-index:8!important;
  left:7%!important;
  top:14%!important;
  width:min(560px,61%)!important;
}
.heroKicker{
  margin-bottom:14px!important;
  font-size:7px!important;
  letter-spacing:1.7px!important;
}
.loginHeroCopy h2{
  font-size:clamp(32px,3.2vw,50px)!important;
  line-height:1.03!important;
  letter-spacing:-1px!important;
  font-weight:850!important;
}
.loginHeroCopy h2 em{
  color:#4ad7ea!important;
}
.loginHeroCopy>p{
  max-width:500px!important;
  margin-top:14px!important;
  color:#c2d7e3!important;
  font-size:10px!important;
  line-height:1.55!important;
}
.heroFeatureGrid{
  width:min(515px,100%)!important;
  margin-top:25px!important;
  padding-top:14px!important;
}
.heroFeatureGrid>div{
  min-height:42px!important;
  gap:8px!important;
  padding:0 13px!important;
}
.heroFeatureGrid i{
  width:28px!important;
  height:32px!important;
  border-color:rgba(83,211,236,.72)!important;
  color:#56d7ec!important;
  font-size:12px!important;
}
.heroFeatureGrid span{
  font-size:7px!important;
  line-height:1.4!important;
}
/* Remove fake CSS towers so the hero uses the photographic building */
#login.loginV3 .heroBuilding{
  display:none!important;
}
/* Blueprint accents on left/bottom, closer to the reference */
#login.loginV3 .heroCircuit{
  z-index:6!important;
  left:0!important;
  bottom:2%!important;
  width:58%!important;
  height:35%!important;
  opacity:.9!important;
}
#login.loginV3 .heroCircuit:before{
  content:"";
  position:absolute;
  left:-4%;
  bottom:0;
  width:72%;
  height:88%;
  border:1px solid rgba(64,204,230,.28);
  transform:skewY(-7deg);
  box-shadow:
    inset 0 0 0 12px rgba(30,137,174,.02),
    30px -24px 0 -29px rgba(65,205,230,.3),
    60px -48px 0 -59px rgba(65,205,230,.28);
}
#login.loginV3 .heroCircuit span{
  background:linear-gradient(90deg,rgba(78,216,238,.18),rgba(80,217,239,.82) 58%,transparent)!important;
}
#login.loginV3 .heroMeta{
  z-index:8!important;
  right:27%!important;
  bottom:16%!important;
  font-size:6px!important;
  line-height:2.1!important;
  letter-spacing:1.15px!important;
}
#login.loginV3 .heroFooter{
  z-index:8!important;
  right:26px!important;
  bottom:18px!important;
  font-size:5.5px!important;
  letter-spacing:1.35px!important;
  color:#90aebc!important;
}
@media(max-width:1180px){
  #login.loginV3{grid-template-columns:40% 60%!important}
  #login.loginV3 .loginPanelInner{width:min(390px,calc(100% - 48px))!important}
  #login.loginV3 .loginHeroCopy{left:6%!important;width:67%!important}
  .loginHeroCopy h2{font-size:36px!important}
}
@media(max-width:820px){
  #login.loginV3{display:block!important}
  #login.loginV3 .loginHero{display:none!important}
  #login.loginV3 .loginPanelInner{
    width:min(420px,calc(100% - 34px))!important;
    padding:25px 0 22px!important;
  }
  .loginFormWrap{padding:42px 0 28px!important}
  .loginFormWrap h1{font-size:25px!important}
}

/* =========================================================
   ESTA LOGIN V5 — exact hero artwork from approved reference
   ========================================================= */
#login.loginV3 .loginHero{
  background-image:url("assets/login-hero.webp")!important;
  background-size:100% 100%!important;
  background-position:center!important;
  background-repeat:no-repeat!important;
}
#login.loginV3 .loginHero:before,
#login.loginV3 .loginHero:after,
#login.loginV3 .heroNoise,
#login.loginV3 .heroBrandMini,
#login.loginV3 .loginHeroCopy,
#login.loginV3 .heroBuilding,
#login.loginV3 .heroCircuit,
#login.loginV3 .heroMeta,
#login.loginV3 .heroFooter{
  display:none!important;
}
#login.loginV3 .adminSetupLink{
  display:none!important;
}

/* Match the clean left login panel in the reference */
#login.loginV3 .loginPanelInner{
  width:min(410px,calc(100% - 68px))!important;
  padding:36px 0 22px!important;
}
#login.loginV3 .loginFormWrap{
  margin:auto 0!important;
  padding:28px 0 18px!important;
}
#login.loginV3 .loginFormWrap h1{
  font-size:25px!important;
  font-weight:820!important;
}
#login.loginV3 .loginFormWrap>p{
  margin:7px 0 26px!important;
  font-size:9.5px!important;
}
#login.loginV3 .premiumLoginForm label{
  margin-bottom:14px!important;
}
#login.loginV3 .premiumLoginForm label>span{
  font-size:8.5px!important;
}
#login.loginV3 .premiumLoginForm .loginInputWrap input{
  height:43px!important;
  border-radius:4px!important;
  font-size:10px!important;
}
#login.loginV3 .premiumLoginBtn{
  height:45px!important;
  border-radius:4px!important;
  font-size:10px!important;
}
#login.loginV3 .loginPanelFooter{
  font-size:7px!important;
}
#login.loginV3 .loginVersion{
  margin-top:18px!important;
  font-size:5.8px!important;
}
@media(max-width:820px){
  #login.loginV3 .loginHero{display:none!important}
}

/* =========================================================
   ESTA LOGIN V5 — FULL OVERVIEW / LESS ZOOM / MORE DETAIL
   ========================================================= */
#login.loginV3{
  grid-template-columns:35.5% 64.5%!important;
}
#login.loginV3 .loginPanelInner{
  width:min(420px,calc(100% - 66px))!important;
}

/* Show a full architectural scene instead of a tight crop */
#login.loginV3 .loginHero{
  background-color:#06192b!important;
  background-image:
    linear-gradient(90deg,rgba(4,29,50,.97) 0%,rgba(4,29,50,.88) 34%,rgba(4,29,50,.48) 61%,rgba(3,20,35,.18) 100%),
    linear-gradient(180deg,rgba(5,31,51,.04),rgba(3,17,29,.36)),
    url("https://images.splitshire.com/full/The-Office-Building-Glowing-Blue-at-Night_qMl6R.png")!important;
  background-repeat:no-repeat,no-repeat,no-repeat!important;
  background-size:auto,auto,auto 92%!important;
  background-position:center,center,96% 52%!important;
}
#login.loginV3 .loginHero:after{
  background:
    linear-gradient(90deg,rgba(3,27,47,.92) 0%,rgba(3,27,47,.72) 31%,rgba(3,27,47,.30) 56%,rgba(3,27,47,.04) 82%),
    linear-gradient(0deg,rgba(2,15,26,.56),transparent 35%)!important;
}
#login.loginV3 .loginHeroCopy{
  left:6.4%!important;
  top:12.2%!important;
  width:min(565px,54%)!important;
}
.heroKicker{
  font-size:6.8px!important;
  letter-spacing:2.1px!important;
  color:#72d2e7!important;
}
.loginHeroCopy h2{
  font-size:clamp(31px,2.9vw,45px)!important;
  line-height:1.06!important;
  letter-spacing:-.75px!important;
  max-width:550px!important;
}
.loginHeroCopy>p{
  max-width:455px!important;
  margin-top:15px!important;
  font-size:9.5px!important;
  line-height:1.65!important;
  color:#c4d8e3!important;
}
.heroFeatureGrid{
  width:min(500px,100%)!important;
  margin-top:24px!important;
  padding-top:15px!important;
  border-top:1px solid rgba(86,203,230,.28)!important;
}
.heroFeatureGrid>div{
  padding:0 14px!important;
  gap:9px!important;
  min-height:45px!important;
}
.heroFeatureGrid>div:first-child{padding-left:0!important}
.heroFeatureGrid i{
  flex:0 0 30px!important;
  width:30px!important;
  height:35px!important;
  border-radius:5px!important;
  background:rgba(9,57,82,.34)!important;
}
.heroFeatureGrid span{
  display:block!important;
  color:#dceaf0!important;
  line-height:1.25!important;
}
.heroFeatureGrid span b{
  display:block!important;
  font-size:7.8px!important;
  font-weight:750!important;
  color:#edf8fb!important;
}
.heroFeatureGrid span small{
  display:block!important;
  margin-top:3px!important;
  color:#8fb6c8!important;
  font-size:6.4px!important;
  white-space:nowrap!important;
}

/* Secondary systems line: more informative but visually quiet */
.heroSystemRibbon{
  display:flex;
  flex-wrap:wrap;
  gap:6px;
  max-width:500px;
  margin-top:21px;
}
.heroSystemRibbon span{
  padding:5px 8px;
  border:1px solid rgba(75,190,219,.24);
  border-radius:4px;
  background:rgba(7,48,72,.34);
  color:#8ec5d5;
  font-size:5.8px;
  letter-spacing:.8px;
  font-weight:750;
}

/* Small system summary floating over the lower-right scene */
.heroOverviewCard{
  position:absolute;
  z-index:9;
  right:28px;
  bottom:64px;
  display:grid;
  grid-template-columns:repeat(3,minmax(82px,1fr));
  gap:1px;
  min-width:300px;
  overflow:hidden;
  border:1px solid rgba(92,195,219,.22);
  border-radius:7px;
  background:rgba(4,29,48,.58);
  backdrop-filter:blur(7px);
  box-shadow:0 14px 30px rgba(0,11,22,.18);
}
.heroOverviewCard>div{
  padding:9px 11px 8px;
  border-right:1px solid rgba(95,194,217,.16);
}
.heroOverviewCard>div:last-child{border-right:0}
.heroOverviewCard b{
  display:block;
  color:#5ed9eb;
  font-size:7px;
  letter-spacing:1.15px;
}
.heroOverviewCard span{
  display:block;
  margin-top:3px;
  color:#b8cfd9;
  font-size:5.7px;
  line-height:1.35;
}

/* Vertical technical message kept small so the whole building remains visible */
#login.loginV3 .heroMeta{
  right:27px!important;
  bottom:auto!important;
  top:26%!important;
  padding-left:12px!important;
  border-left:1px solid rgba(74,204,229,.30)!important;
  text-align:left!important;
  font-size:5.5px!important;
  line-height:2.1!important;
  color:#74a9b9!important;
}
#login.loginV3 .heroMeta span:nth-child(4){color:#55d4e9!important}
#login.loginV3 .heroFooter{
  right:28px!important;
  bottom:21px!important;
  color:#8ba6b3!important;
  font-size:5.3px!important;
}
#login.loginV3 .heroCircuit{
  width:48%!important;
  height:29%!important;
  opacity:.72!important;
}
#login.loginV3 .heroCircuit:before{
  width:76%!important;
  height:86%!important;
  border-color:rgba(72,204,229,.22)!important;
}

/* Improve visual breathing room on shorter desktop screens */
@media(max-height:760px) and (min-width:821px){
  #login.loginV3 .loginPanelInner{padding-top:27px!important;padding-bottom:18px!important}
  .loginPanelTagline{margin-top:14px!important}
  .loginFormWrap{padding:18px 0 12px!important}
  .loginFormWrap>p{margin-bottom:18px!important}
  .premiumLoginForm label{margin-bottom:10px!important}
  #login.loginV3 .premiumLoginForm .loginInputWrap input{height:41px!important}
  #login.loginV3 .premiumLoginBtn{height:43px!important}
  #login.loginV3 .loginHeroCopy{top:9.5%!important}
  .heroSystemRibbon{margin-top:14px!important}
  .heroOverviewCard{bottom:49px!important}
}
@media(max-width:1180px) and (min-width:821px){
  #login.loginV3{grid-template-columns:39% 61%!important}
  #login.loginV3 .loginHero{
    background-size:auto,auto,auto 86%!important;
    background-position:center,center,103% 54%!important;
  }
  #login.loginV3 .loginHeroCopy{left:5.5%!important;width:61%!important}
  .loginHeroCopy h2{font-size:34px!important}
  .heroFeatureGrid{width:430px!important}
  .heroOverviewCard{grid-template-columns:1fr!important;min-width:150px!important}
  .heroOverviewCard>div{border-right:0!important;border-bottom:1px solid rgba(95,194,217,.16)}
  .heroOverviewCard>div:last-child{border-bottom:0}
}
@media(max-width:820px){
  .heroSystemRibbon,.heroOverviewCard{display:none!important}
}

/* ===== ESTA LOGIN V7 — FULL HERO IMAGE, NO ZOOM ===== */
#login.loginV7{
  display:grid!important;
  grid-template-columns:minmax(360px,34%) minmax(0,66%)!important;
  min-height:100vh!important;
  background:#f7fafc!important;
  color:#183954!important;
  overflow:hidden!important;
}
#login.loginV7 .loginPanel{
  position:relative!important;
  z-index:3!important;
  min-height:100vh!important;
  background:linear-gradient(180deg,#fff 0%,#fbfdff 100%)!important;
  border-right:1px solid #dce7ef!important;
}
#login.loginV7 .loginPanelInner{
  width:min(410px,calc(100% - 54px))!important;
  min-height:100vh!important;
  margin:0 auto!important;
  padding:36px 0 24px!important;
  display:flex!important;
  flex-direction:column!important;
}
#login.loginV7 .loginFormWrap{margin:auto 0!important;padding:28px 0 20px!important}
#login.loginV7 .loginFormWrap h1{font-size:30px!important;line-height:1.08!important}
#login.loginV7 .loginFormWrap>p{font-size:11px!important;margin:7px 0 24px!important}
#login.loginV7 .premiumLoginForm .loginInputWrap input{height:46px!important;border-radius:6px!important}
#login.loginV7 .premiumLoginBtn{height:48px!important;border-radius:6px!important}
#login.loginV7 .loginHero{
  position:relative!important;
  min-height:100vh!important;
  overflow:hidden!important;
  background:#071c31!important;
}
#login.loginV7 .loginHeroImage{
  position:absolute!important;
  inset:0!important;
  background-color:#071c31!important;
  background-image:var(--esta-login-hero)!important;
  background-repeat:no-repeat!important;
  background-position:center!important;
  background-size:contain!important;
}
#login.loginV7 .loginHeroImage:after{
  content:"";
  position:absolute;
  inset:0;
  pointer-events:none;
  background:
    linear-gradient(90deg,rgba(4,24,42,.18),transparent 18%,transparent 82%,rgba(4,24,42,.12)),
    linear-gradient(180deg,rgba(4,24,42,.06),transparent 18%,transparent 82%,rgba(4,24,42,.18));
}
@media(max-width:1120px){
  #login.loginV7{grid-template-columns:39% 61%!important}
  #login.loginV7 .loginPanelInner{width:min(390px,calc(100% - 42px))!important}
}
@media(max-width:820px){
  #login.loginV7{display:block!important}
  #login.loginV7 .loginHero{display:none!important}
  #login.loginV7 .loginPanelInner{width:min(420px,calc(100% - 30px))!important;padding:26px 0 22px!important}
  #login.loginV7 .loginFormWrap{padding:40px 0 28px!important}
}

/* =========================================================
   ESTA LOGIN V8 — CLEAN ARCHITECTURAL SPLIT DESIGN
   ========================================================= */
#login.loginV8{
  min-height:100vh!important;
  display:grid!important;
  grid-template-columns:30% 70%!important;
  background:#fff!important;
  color:#143654!important;
  overflow:hidden!important;
}
#login.loginV8 .lv8Left{
  position:relative;
  z-index:5;
  min-height:100vh;
  background:
    radial-gradient(circle at 25% 95%,rgba(17,184,215,.045),transparent 30%),
    #fff;
  box-shadow:12px 0 35px rgba(3,24,42,.10);
}
.lv8LeftInner{
  width:min(420px,calc(100% - 56px));
  min-height:100vh;
  margin:0 auto;
  padding:34px 0 26px;
  display:flex;
  flex-direction:column;
}
.lv8Brand{display:flex;align-items:center;gap:13px}
.lv8Mark{position:relative;width:50px;height:58px;flex:0 0 50px}
.lv8Mark i{
  position:absolute;
  bottom:0;
  width:12px;
  border:2px solid #123f69;
  border-bottom-width:4px;
  background:linear-gradient(180deg,rgba(31,181,221,.08),rgba(14,88,142,.04));
  transform:skewY(-10deg)
}
.lv8Mark i:nth-child(1){left:1px;height:31px}
.lv8Mark i:nth-child(2){left:18px;height:49px;border-color:#13b8dc}
.lv8Mark i:nth-child(3){left:35px;height:40px}
.lv8Brand strong{display:block;font-size:31px;line-height:1;letter-spacing:3px;font-weight:850;color:#13385c}
.lv8Brand small{display:block;margin-top:5px;font-size:7px;letter-spacing:1.35px;color:#627c91;font-weight:700}
.lv8BrandLine{
  margin-top:18px;padding-top:12px;border-top:1px solid #e2eaf0;
  color:#7b8f9e;font-size:6.5px;letter-spacing:1.65px;font-weight:700
}
.lv8FormBlock{margin:auto 0;padding:28px 0 22px}
.lv8Welcome{display:block;margin-bottom:8px;color:#173b5d;font-size:16px;font-weight:750}
.lv8FormBlock h1{margin:0!important;color:#143653!important;font-size:29px!important;line-height:1.08!important;font-weight:850!important;letter-spacing:-.35px!important}
.lv8FormBlock>p{margin:9px 0 26px;color:#6f8495;font-size:10.5px;line-height:1.55}
.lv8Form label{display:block;margin:0 0 14px;color:#183d5a;font-size:9.5px;font-weight:750}
.lv8Form label>span{display:block;margin-bottom:7px}
.lv8Input{position:relative}
.lv8Input>b{
  position:absolute;left:13px;top:50%;transform:translateY(-50%);
  z-index:2;width:18px;text-align:center;color:#5f7d96;font-size:14px;font-weight:500
}
#login.loginV8 .lv8Input input{
  width:100%!important;height:47px!important;padding:0 43px 0 40px!important;
  border:1px solid #cfdce6!important;border-radius:7px!important;
  background:#fff!important;color:#173c5c!important;font-size:11px!important;outline:0!important;
  box-shadow:0 1px 2px rgba(15,48,74,.02)!important
}
#login.loginV8 .lv8Input input:focus{
  border-color:#20bad8!important;box-shadow:0 0 0 3px rgba(32,186,216,.11)!important
}
.lv8Input>button{
  position:absolute!important;right:5px!important;top:50%!important;transform:translateY(-50%)!important;
  width:36px!important;height:36px!important;margin:0!important;padding:0!important;border:0!important;border-radius:6px!important;
  background:transparent!important;color:#5f7d96!important;box-shadow:none!important;font-size:12px!important
}
.lv8Input>button:hover{background:#f1f7fa!important}
.lv8Options{display:flex;justify-content:space-between;align-items:center;margin:2px 0 17px}
.lv8Options label{display:flex!important;align-items:center!important;gap:7px!important;margin:0!important;font-size:8.5px!important;font-weight:500!important;color:#607b8e!important}
.lv8Options label>span{margin:0!important}
.lv8Options input{width:14px;height:14px;accent-color:#16b9d7}
.lv8Options>button{border:0;background:transparent;color:#0d86c9;font-size:8.5px;padding:2px;cursor:pointer}
#login.loginV8 .lv8LoginBtn{
  width:100%!important;height:49px!important;margin:0!important;border:0!important;border-radius:7px!important;
  display:flex!important;align-items:center!important;justify-content:center!important;gap:12px!important;
  background:linear-gradient(90deg,#10b9d6 0%,#08a9ef 100%)!important;
  color:#fff!important;font-size:11px!important;font-weight:800!important;
  box-shadow:0 10px 22px rgba(10,169,219,.19)!important
}
#login.loginV8 .lv8LoginBtn:hover{filter:brightness(1.04);transform:translateY(-1px)}
#login.loginV8 .loginError{min-height:18px!important;margin:8px 0 0!important;font-size:9px!important}
.lv8Divider{display:flex;align-items:center;gap:11px;margin:7px 0 12px;color:#9aaab6;font-size:7px}
.lv8Divider:before,.lv8Divider:after{content:"";height:1px;background:#e3ebf0;flex:1}
#login.loginV8 .lv8AdminBtn{
  width:100%!important;height:43px!important;margin:0!important;border:1px solid #88cdea!important;border-radius:7px!important;
  background:#fff!important;color:#285a7c!important;font-size:9.5px!important;font-weight:700!important;box-shadow:none!important
}
#login.loginV8 .lv8AdminBtn:hover{background:#f3fbfe!important;border-color:#4ab6df!important}
.lv8LeftBottom{
  margin-top:auto;padding-top:14px;border-top:1px solid #e7edf2;
  display:flex;align-items:end;justify-content:space-between;gap:15px;color:#8396a5
}
.lv8LeftBottom b{display:block;color:#3c6280;font-size:9px;letter-spacing:2px}
.lv8LeftBottom span{display:block;margin-top:4px;font-size:6px;letter-spacing:.8px}
.lv8LeftBottom small{font-size:7px}

/* HERO */
#login.loginV8 .lv8Hero{
  position:relative;min-height:100vh;overflow:hidden;color:#fff;background-color:#071d33;
  background-image:
    linear-gradient(90deg,rgba(4,31,54,.93) 0%,rgba(4,31,54,.77) 26%,rgba(4,31,54,.40) 52%,rgba(3,24,42,.10) 78%),
    linear-gradient(180deg,rgba(3,25,45,.06),rgba(3,25,45,.26)),
    url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2200&q=88");
  background-repeat:no-repeat;
  background-size:cover;
  background-position:center,center,72% center;
}
.lv8Hero:before{
  content:"";position:absolute;inset:0;pointer-events:none;
  background:
    linear-gradient(rgba(78,191,224,.035) 1px,transparent 1px),
    linear-gradient(90deg,rgba(78,191,224,.035) 1px,transparent 1px);
  background-size:35px 35px;
  mask-image:linear-gradient(90deg,#000 0%,rgba(0,0,0,.62) 62%,transparent 100%)
}
.lv8HeroShade{position:absolute;inset:0;background:linear-gradient(0deg,rgba(2,17,30,.72) 0%,transparent 27%);pointer-events:none}
.lv8Top{
  position:absolute;z-index:5;left:34px;right:34px;top:26px;
  display:flex;justify-content:space-between;align-items:start;gap:20px
}
.lv8Top>span{color:#58d7ec;font-size:7px;line-height:1.45;letter-spacing:1.8px;font-weight:800}
.lv8Top nav{display:flex;gap:17px;flex-wrap:wrap;justify-content:flex-end}
.lv8Top nav b{font-size:6.5px;letter-spacing:.8px;color:#d2e7ef;font-weight:600}
.lv8HeroCopy{position:absolute;z-index:5;left:6.2%;top:14.5%;width:min(610px,57%)}
.lv8Kicker{display:block;margin-bottom:13px;color:#90d8e7;font-size:7px;letter-spacing:1.9px}
.lv8HeroCopy h2{margin:0;font-size:clamp(34px,3.35vw,54px);line-height:1.03;letter-spacing:-1px;font-weight:850;text-shadow:0 3px 18px rgba(0,16,32,.22)}
.lv8HeroCopy h2 em{display:block;margin-top:4px;color:#4ddbf1;font-style:normal}
.lv8HeroCopy>p{max-width:520px;margin:17px 0 0;color:#d0e2e9;font-size:10.5px;line-height:1.65}
.lv8Cards{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:28px;width:min(525px,100%)}
.lv8Cards article{
  min-height:92px;padding:14px 15px;display:flex;align-items:center;gap:13px;
  border:1px solid rgba(129,210,233,.25);border-radius:10px;
  background:linear-gradient(135deg,rgba(26,88,126,.56),rgba(23,67,101,.35));
  backdrop-filter:blur(7px);box-shadow:0 10px 25px rgba(0,17,31,.10)
}
.lv8Cards i{
  flex:0 0 45px;width:45px;height:45px;display:grid;place-items:center;
  border:1px solid rgba(86,218,242,.58);border-radius:50%;
  color:#60e0f3;font-size:19px;font-style:normal;background:rgba(3,39,65,.30)
}
.lv8Cards b{display:block;color:#fff;font-size:9px;letter-spacing:.2px}
.lv8Cards span{display:block;margin-top:5px;color:#c5dce5;font-size:7.5px;line-height:1.5}
.lv8Systems{
  position:absolute;z-index:5;left:6.2%;bottom:12%;display:flex;gap:0;
  border-top:1px solid rgba(95,199,225,.24);padding-top:14px
}
.lv8Systems span{
  min-width:86px;padding:0 14px;display:flex;flex-direction:column;align-items:center;gap:6px;
  border-right:1px solid rgba(95,199,225,.20);color:#63dcf0;font-size:16px
}
.lv8Systems span:first-child{padding-left:0}
.lv8Systems span:last-child{border-right:0}
.lv8Systems b{font-size:6.5px;color:#d3e5ec;font-weight:700;white-space:nowrap}
.lv8HeroSlogan{
  position:absolute;z-index:5;left:6.2%;bottom:5.5%;
  color:#a9c4ce;font-size:6.7px;letter-spacing:1.5px
}

/* RESPONSIVE */
@media(max-width:1180px){
  #login.loginV8{grid-template-columns:36% 64%!important}
  .lv8HeroCopy{width:64%;left:5.3%}
  .lv8HeroCopy h2{font-size:37px}
  .lv8Cards{width:450px}
  .lv8Top nav{gap:10px}
}
@media(max-height:760px) and (min-width:821px){
  .lv8LeftInner{padding-top:24px;padding-bottom:18px}
  .lv8FormBlock{padding:16px 0 12px}
  .lv8FormBlock>p{margin-bottom:16px}
  #login.loginV8 .lv8Input input{height:41px!important}
  #login.loginV8 .lv8LoginBtn{height:43px!important}
  .lv8HeroCopy{top:10.5%}
  .lv8Cards{margin-top:18px}
  .lv8Cards article{min-height:78px;padding:10px 12px}
  .lv8Systems{bottom:10%}
  .lv8HeroSlogan{bottom:3.5%}
}
@media(max-width:820px){
  #login.loginV8{display:block!important;background:#fff!important}
  #login.loginV8 .lv8Hero{display:none!important}
  #login.loginV8 .lv8Left{min-height:100vh}
  .lv8LeftInner{width:min(430px,calc(100% - 30px));padding:25px 0 22px}
  .lv8FormBlock{padding:38px 0 26px}
  .lv8FormBlock h1{font-size:26px!important}
  .lv8Brand strong{font-size:27px}
}

/* =========================================================
   ESTA APP V9 — PREMIUM OPERATIONS DASHBOARD
   Logo bronze + navy/cyan operation system
   ========================================================= */
#app:not(.hide){
  grid-template-columns:236px minmax(0,1fr)!important;
  background:#f4f7fa!important;
}
#app .estaSidebar{
  width:236px!important;
  padding:22px 14px 15px!important;
  background:
    radial-gradient(circle at 24% 8%,rgba(43,132,177,.16),transparent 22%),
    linear-gradient(180deg,#102b46 0%,#0d263f 58%,#0a2036 100%)!important;
  border-right:1px solid rgba(255,255,255,.05)!important;
  box-shadow:12px 0 34px rgba(11,35,57,.07)!important;
}
.estaSidebarBrand{
  gap:12px!important;
  min-height:66px;
  padding:4px 8px 18px!important;
  border-bottom:1px solid rgba(255,255,255,.09)!important;
}
.estaSidebarBrand b{
  color:#d2b9a8!important;
  font-size:25px!important;
  line-height:1!important;
  letter-spacing:4px!important;
  font-weight:650!important;
}
.estaSidebarBrand small{
  color:#8ea9bc!important;
  font-size:6.5px!important;
  letter-spacing:1.5px!important;
  margin-top:5px!important;
}
.estaPetalLogo{
  position:relative;
  width:40px;
  height:40px;
  flex:0 0 40px;
}
.estaPetalLogo span{
  position:absolute;
  left:17px;top:4px;
  width:6px;height:14px;
  border-radius:7px 7px 2px 7px;
  background:#b69580;
  transform-origin:3px 16px;
  opacity:.96;
}
.estaPetalLogo span:nth-child(1){transform:rotate(0deg)}
.estaPetalLogo span:nth-child(2){transform:rotate(60deg)}
.estaPetalLogo span:nth-child(3){transform:rotate(120deg)}
.estaPetalLogo span:nth-child(4){transform:rotate(180deg)}
.estaPetalLogo span:nth-child(5){transform:rotate(240deg)}
.estaPetalLogo span:nth-child(6){transform:rotate(300deg)}
.estaNav{margin:18px 0 14px!important}
.estaNav:before{
  content:"VẬN HÀNH"!important;
  padding:0 11px 9px!important;
  color:#67879e!important;
  font-size:7px!important;
  letter-spacing:2px!important;
}
#app .estaNav button{
  position:relative;
  display:flex;
  align-items:center;
  gap:12px;
  height:46px!important;
  margin:3px 0;
  padding:0 13px!important;
  border:1px solid transparent!important;
  border-radius:11px!important;
  background:transparent!important;
  color:#9fb7c8!important;
  font-size:12px!important;
  font-weight:600;
  transition:.18s ease;
}
#app .estaNav button svg{
  width:19px;height:19px;flex:0 0 19px;
  fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round;
}
#app .estaNav button:hover{
  color:#e9f6fb!important;
  background:rgba(255,255,255,.045)!important;
}
#app .estaNav button.active{
  color:#fff!important;
  border-color:rgba(63,190,225,.16)!important;
  background:linear-gradient(90deg,rgba(24,151,191,.23),rgba(22,87,124,.16))!important;
  box-shadow:none!important;
}
#app .estaNav button.active:before{
  content:"";
  position:absolute;
  left:0;top:9px;bottom:9px;width:3px;
  border-radius:0 4px 4px 0;
  background:#27c3df;
  box-shadow:0 0 12px rgba(39,195,223,.38);
}
#app .estaNav button.active svg{color:#49d1e7}
.estaSidebar .sideBackup{
  margin-top:auto!important;
  grid-template-columns:1fr 1fr!important;
  gap:7px!important;
  padding-top:12px;
  border-top:1px solid rgba(255,255,255,.07);
}
.estaSidebar .sideBackup button{
  display:flex;align-items:center;justify-content:center;gap:6px;
  height:34px!important;
  border:1px solid rgba(255,255,255,.09)!important;
  border-radius:8px!important;
  background:rgba(255,255,255,.035)!important;
  color:#91adbf!important;
  font-size:8px!important;
}
.estaSidebar .sideBackup svg,.sideLogout svg{
  width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round
}
.estaSidebar .sideBottom{
  margin-top:10px;
  min-height:58px;
  padding:10px 5px 0!important;
  border-top:1px solid rgba(255,255,255,.08)!important;
}
.sideUserCard{display:flex;align-items:center;gap:8px;min-width:0}
.sideAvatar{
  width:31px;height:31px;display:grid;place-items:center;flex:0 0 31px;
  border:1px solid rgba(216,185,165,.34);border-radius:50%;
  background:rgba(183,154,135,.14);color:#ddc6b7;
  font-size:9px;font-weight:800;letter-spacing:.4px
}
.sideUserCard #sideUser{min-width:0;color:#88a4b8!important;line-height:1.35}
.sideUserCard #sideUser b{display:inline-block;max-width:125px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#e8f1f5!important;font-size:9px!important}
#app .sideLogout{
  width:31px;height:31px;padding:0!important;display:grid;place-items:center;
  border:1px solid rgba(255,255,255,.08)!important;border-radius:8px!important;
  background:rgba(255,255,255,.035)!important;color:#8da8b9!important;
}
#app .sideLogout:hover{color:#fff!important;background:rgba(210,95,95,.12)!important}

/* Premium topbar */
#app main{background:#f4f7fa!important}
#app .estaTopbar{
  height:70px!important;
  padding:0 22px!important;
  gap:14px!important;
  border-bottom:1px solid #e2e9ef!important;
  background:rgba(255,255,255,.96)!important;
  box-shadow:0 4px 18px rgba(23,55,82,.035)!important;
}
#app .topModuleTitle{
  min-width:245px!important;
  gap:11px!important;
}
#app .topModuleIcon{
  width:38px!important;height:38px!important;display:grid!important;place-items:center!important;
  border-radius:10px!important;
  background:#eef5f9!important;color:#285b7c!important;
  box-shadow:none!important;
}
#app .topModuleIcon.homeIcon{background:#f4eee9!important;color:#8c6854!important}
#app .topModuleIcon svg{
  width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:1.65;stroke-linecap:round;stroke-linejoin:round
}
#app .topModuleTitle h1{font-size:17px!important;font-weight:760!important;color:#183b56!important;letter-spacing:-.15px}
#app .topModuleTitle p{margin-top:4px!important;font-size:9px!important;color:#7890a1!important}
#app .headerTools{gap:8px!important}
#app .headerSearch{
  width:min(390px,34vw)!important;
  height:38px!important;
  border:1px solid #dde6ec!important;
  border-radius:10px!important;
  background:#f7f9fb!important;
  color:#7a94a6!important;
}
#app .headerSearch svg{
  width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round
}
#app .headerSearch input{font-size:10.5px!important;color:#3f5c70!important}
#app .iconAction,#app .pdfAction,#app .headerBell{
  height:38px!important;min-width:38px;border:1px solid #dde6ec!important;border-radius:10px!important;
  background:#fff!important;color:#6e899b!important;box-shadow:none!important
}
#app .iconAction svg,#app .headerBell svg{
  width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round
}
#app .headerBell{position:relative;display:grid;place-items:center;padding:0}
#app .headerBell i{position:absolute;right:7px;top:7px;width:5px;height:5px;border-radius:50%;background:#20bad6;border:1px solid #fff}
#app .pdfAction{font-size:8px!important;display:flex;align-items:center;gap:4px;padding:0 9px!important}
#app .account{
  min-width:150px!important;margin-left:3px!important;padding-left:11px!important;
  display:flex!important;align-items:center;gap:9px!important
}
.headerAvatar{
  width:34px;height:34px;display:grid;place-items:center;flex:0 0 34px;
  border-radius:50%;background:#f1e9e4;color:#80604e;border:1px solid #e3d4ca;
  font-size:9px;font-weight:800;letter-spacing:.4px
}
#app .account>div:last-child{min-width:0}
#app .account b{display:block!important;max-width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:10px!important;color:#1e425e!important}
#app .account span{display:block!important;margin-top:2px;font-size:7px!important;letter-spacing:.65px!important;color:#8497a5!important;text-transform:none!important}
#app.homeMode .filterWrap,#app.homeMode #exportBtn{display:none!important}
#app.adminMode .filterWrap,#app.adminMode #exportBtn{display:none!important}

/* Home dashboard */
.homeDashboard{
  padding:20px 22px 32px!important;
  max-width:1560px;
  margin:0 auto;
}
.homeWelcome{
  position:relative;
  min-height:190px;
  overflow:hidden;
  display:flex;
  align-items:center;
  padding:30px 34px;
  border:1px solid rgba(33,96,133,.12);
  border-radius:20px;
  background:
    radial-gradient(circle at 76% 28%,rgba(45,196,221,.14),transparent 24%),
    linear-gradient(120deg,#123651 0%,#174d68 56%,#17627b 100%);
  color:#fff;
  box-shadow:0 12px 32px rgba(23,65,92,.09);
}
.homeWelcome:before{
  content:"";position:absolute;inset:0;
  background:
    linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),
    linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px);
  background-size:32px 32px;
  mask-image:linear-gradient(90deg,transparent 0%,#000 46%,#000 100%)
}
.homeWelcomeCopy{position:relative;z-index:2;max-width:680px}
.homeEyebrow{display:block;color:#7fd6e8;font-size:7px;letter-spacing:2px;font-weight:800}
.homeWelcome h1{margin:8px 0 5px;font-size:29px;line-height:1.12;font-weight:560;letter-spacing:-.35px}
.homeWelcome h1 b{font-weight:800}
.homeWelcome p{margin:0;color:#c9dde6;font-size:10.5px}
.homeWelcome p strong{color:#fff;font-weight:650}
.homeSystemState{
  display:flex;align-items:center;gap:7px;margin-top:23px;padding-top:14px;
  border-top:1px solid rgba(255,255,255,.12);width:min(500px,100%);
  color:#c7dbe3;font-size:8px
}
.homeSystemState i{width:7px;height:7px;border-radius:50%;background:#50dda0;box-shadow:0 0 0 4px rgba(80,221,160,.10)}
.homeSystemState small{margin-left:auto;color:#91b3c2;font-size:7px}
.homeBlueprint{
  position:absolute;z-index:1;right:20px;bottom:0;width:380px;height:185px;
  opacity:.42;color:#8ed5e5
}
.homeBlueprint svg{position:absolute;right:0;bottom:-3px;width:100%;height:100%;fill:none;stroke:currentColor;stroke-width:1}
.homeBlueprint span{position:absolute;right:52px;top:28px;font-size:25px;letter-spacing:6px;font-weight:800;color:rgba(255,255,255,.24)}
.homeKpis{
  display:grid;
  grid-template-columns:repeat(4,minmax(0,1fr));
  gap:12px;
  margin:14px 0;
}
.kpiCard{
  min-height:112px;
  display:flex;align-items:center;gap:14px;
  padding:17px 18px;
  border:1px solid #e1e8ed;
  border-radius:15px;
  background:#fff;
  box-shadow:0 7px 22px rgba(26,59,82,.035);
}
.kpiIcon{
  width:45px;height:45px;display:grid;place-items:center;flex:0 0 45px;
  border-radius:12px
}
.kpiIcon svg{width:21px;height:21px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.kpiCard small{display:block;color:#7e929f;font-size:7px;letter-spacing:.8px;font-weight:750}
.kpiCard strong{display:block;margin:2px 0 1px;color:#183d58;font-size:25px;line-height:1;font-weight:780}
.kpiCard>div:last-child>span{color:#98a8b3;font-size:7px}
.kpiBlue .kpiIcon{background:#eaf4fb;color:#347cad}
.kpiAmber .kpiIcon{background:#fff4e5;color:#c4852f}
.kpiGreen .kpiIcon{background:#eaf8f1;color:#2b986a}
.kpiRed .kpiIcon{background:#fff0f0;color:#c76565}

.homePanel{
  border:1px solid #e0e8ee;
  border-radius:16px;
  background:#fff;
  box-shadow:0 8px 26px rgba(26,59,82,.035);
}
.homePanelHead{
  min-height:72px;
  display:flex;align-items:center;justify-content:space-between;gap:16px;
  padding:16px 18px;
  border-bottom:1px solid #edf1f4
}
.panelKicker{display:block;color:#a0806b;font-size:6.5px;letter-spacing:1.6px;font-weight:800}
.homePanelHead h2{margin:3px 0 0;color:#193d58;font-size:14px;font-weight:760}
.homePanelHead p{margin:4px 0 0;color:#8a9aa6;font-size:8px}
.homePanelHead>button{
  height:31px;padding:0 10px;border:1px solid #dfe7ec;border-radius:8px;
  background:#fff;color:#557487;font-size:8px;font-weight:650
}
.homePanelHead>button:hover{border-color:#abd7e3;color:#197b9a;background:#f6fbfc}
.homeMainGrid{
  display:grid;
  grid-template-columns:minmax(0,1.65fr) minmax(300px,.8fr);
  gap:14px;
  margin-top:14px
}
.homeRecentTasks{padding:5px 10px 10px}
.homeTaskRow{
  width:100%;
  min-height:58px;
  display:grid;
  grid-template-columns:minmax(0,1fr) auto 20px;
  align-items:center;
  gap:11px;
  padding:9px 9px;
  border:0;
  border-bottom:1px solid #eef2f5;
  background:transparent;
  text-align:left;
  color:#24475f;
}
.homeTaskRow:last-child{border-bottom:0}
.homeTaskRow:not(.static):hover{background:#f8fbfc;border-radius:9px}
.homeTaskLead{display:flex;align-items:center;gap:10px;min-width:0}
.homeTaskDot{width:9px;height:9px;flex:0 0 9px;border-radius:50%;background:#bfcbd3}
.homeTaskDot.doing{background:#e2a947;box-shadow:0 0 0 4px #fff5e4}
.homeTaskDot.done{background:#43a779;box-shadow:0 0 0 4px #eaf8f1}
.homeTaskDot.waiting{background:#d56e6e;box-shadow:0 0 0 4px #fff0f0}
.homeTaskLead>div{min-width:0}
.homeTaskLead b{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#1b405b;font-size:9.5px;font-weight:700}
.homeTaskLead small{display:block;margin-top:3px;color:#8a9ca8;font-size:7.3px}
.homeStatus{padding:4px 7px;border-radius:12px;font-size:6.8px;font-weight:750;white-space:nowrap}
.homeStatus.doing{background:#fff5e5;color:#a36d20}
.homeStatus.done{background:#eaf8f1;color:#287f59}
.homeStatus.waiting{background:#fff0f0;color:#ae5555}
.homeTaskRow>i{color:#9aabb6;font-size:10px;font-style:normal}
.homeEnergyList{padding:8px 16px 16px}
.homeEnergyList article{
  display:flex;align-items:center;gap:12px;min-height:77px;padding:10px 4px;
  border-bottom:1px solid #edf2f5
}
.homeEnergyList article:last-child{border-bottom:0}
.energyMiniIcon{
  width:43px;height:43px;display:grid;place-items:center;flex:0 0 43px;
  border-radius:12px
}
.energyMiniIcon svg{width:21px;height:21px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.energyMiniIcon.electric{background:#edf5ff;color:#3a7eb1}
.energyMiniIcon.water{background:#e8f9fb;color:#258fa2}
.energyMiniIcon.solar{background:#fff5e2;color:#c28a2c}
.homeEnergyList article>div:last-child{min-width:0}
.homeEnergyList span{display:block;color:#6d8392;font-size:8px}
.homeEnergyList strong{display:inline-block;margin:2px 4px 0 0;color:#1c425d;font-size:18px;line-height:1.1}
.homeEnergyList small{color:#9aaaB5;font-size:7px}
.homeBottomGrid{
  display:grid;
  grid-template-columns:minmax(0,1.25fr) minmax(310px,.9fr);
  gap:14px;
  margin-top:14px
}
.quickActions{display:grid;grid-template-columns:1fr 1fr;gap:9px;padding:12px}
.quickActions>button{
  min-height:67px;
  display:grid;grid-template-columns:40px minmax(0,1fr) 16px;align-items:center;gap:10px;
  padding:10px 11px;border:1px solid #e5ebef;border-radius:11px;background:#fbfcfd;text-align:left
}
.quickActions>button:hover{border-color:#cbdde7;background:#f7fbfc;transform:translateY(-1px)}
.quickIcon{
  width:38px;height:38px;display:grid;place-items:center;border-radius:10px
}
.quickIcon svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.quickIcon.blue{background:#eaf4fb;color:#367dac}
.quickIcon.cyan{background:#e7f8fb;color:#218fa4}
.quickIcon.aqua{background:#ecf9f6;color:#308c7a}
.quickIcon.bronze{background:#f4eee9;color:#8c6854}
.quickActions b{display:block;color:#24465d;font-size:8.7px}
.quickActions small{display:block;margin-top:3px;color:#91a0aa;font-size:6.9px}
.quickActions i{color:#9aabb5;font-size:9px;font-style:normal}
.homeActivity{padding:7px 15px 14px}
.activityRow{
  min-height:57px;display:grid;grid-template-columns:30px minmax(0,1fr) auto;align-items:center;gap:9px;
  border-bottom:1px solid #eef2f4
}
.activityRow:last-child{border-bottom:0}
.activityIcon{
  width:28px;height:28px;border-radius:50%;background:#edf5f8;position:relative
}
.activityIcon:before{content:"";position:absolute;left:50%;top:50%;width:8px;height:8px;border-radius:2px;background:#6d9fb5;transform:translate(-50%,-50%)}
.activityIcon.electric:before{clip-path:polygon(55% 0,15% 55%,45% 55%,35% 100%,85% 40%,55% 40%);background:#4c86b0}
.activityIcon.water:before{border-radius:50% 50% 55% 55%;background:#3c9caf}
.activityIcon.solar:before{border-radius:50%;background:#d09a3d}
.activityRow b{display:block;color:#27495f;font-size:8px;font-weight:700}
.activityRow span{display:block;margin-top:3px;color:#91a0aa;font-size:6.7px}
.activityRow time{color:#9aa8b1;font-size:6.5px}
.homeEmpty{padding:27px 12px;text-align:center;color:#94a4af;font-size:8px}
.homeAdminProjects{margin-top:14px}
.homeProjectGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;padding:12px}
.homeProjectCard{
  min-height:78px;display:grid;grid-template-columns:44px minmax(0,1fr) 18px;align-items:center;gap:10px;
  padding:11px;border:1px solid #e4eaee;border-radius:12px;background:#fbfcfd;text-align:left
}
.homeProjectCard:hover{border-color:#c9dce5;background:#f7fbfc;transform:translateY(-1px)}
.projectMonogram{
  width:42px;height:42px;display:grid;place-items:center;border-radius:11px;
  background:linear-gradient(145deg,#f2e9e3,#e7d8ce);color:#80604e;font-size:9px;font-weight:850
}
.homeProjectCard small{display:block;color:#9a806f;font-size:6.2px;letter-spacing:1px;font-weight:750}
.homeProjectCard b{display:block;margin-top:2px;color:#21455e;font-size:9px}
.homeProjectCard span{display:block;margin-top:3px;color:#94a2ad;font-size:6.5px}
.homeProjectCard>i{font-style:normal;color:#9babb5}

/* Polish existing Work / Energy icons */
#app .stats article{border-radius:14px!important;border-color:#e2e9ee!important;box-shadow:0 7px 22px rgba(26,59,82,.035)!important}
#app .stats i{width:42px!important;height:42px!important;border-radius:11px!important}
#app .stats i svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.75;stroke-linecap:round;stroke-linejoin:round}
#app .energyTabs button{display:flex!important;align-items:center!important;justify-content:center!important;gap:8px!important}
#app .energyTabs button svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.75;stroke-linecap:round;stroke-linejoin:round}

/* Responsive dashboard */
@media(max-width:1250px){
  #app:not(.hide){grid-template-columns:218px minmax(0,1fr)!important}
  #app .estaSidebar{width:218px!important}
  .homeKpis{grid-template-columns:1fr 1fr}
  .homeProjectGrid{grid-template-columns:1fr 1fr}
}
@media(max-width:980px){
  .homeMainGrid,.homeBottomGrid{grid-template-columns:1fr}
  .homeBlueprint{right:-65px;opacity:.28}
  #app .headerSearch{width:min(300px,30vw)!important}
}
@media(max-width:760px){
  #app:not(.hide){display:block!important}
  #app .estaSidebar{position:fixed!important;left:0;top:0;z-index:80;width:244px!important}
  #app .estaTopbar{height:62px!important;padding:0 10px!important;gap:8px!important}
  #app .topModuleTitle{min-width:0!important;flex:1}
  #app .topModuleIcon{width:34px!important;height:34px!important}
  #app .topModuleTitle h1{font-size:13px!important}
  #app .topModuleTitle p{font-size:7px!important}
  #app .headerTools{flex:0 0 auto!important}
  #app .headerSearch{display:none!important}
  #app .filterWrap,#app #exportBtn{display:none!important}
  #app .headerBell{display:grid!important}
  #app .account{display:none!important}
  .homeDashboard{padding:12px 10px 24px!important}
  .homeWelcome{min-height:165px;padding:22px 20px;border-radius:16px}
  .homeEyebrow{font-size:6px}
  .homeWelcome h1{font-size:23px}
  .homeWelcome p{font-size:9px}
  .homeSystemState{margin-top:18px;font-size:7px}
  .homeSystemState small{display:none}
  .homeBlueprint{width:220px;height:140px;right:-75px;opacity:.20}
  .homeKpis{grid-template-columns:1fr 1fr;gap:8px;margin:9px 0}
  .kpiCard{min-height:91px;padding:12px;gap:9px;border-radius:12px}
  .kpiIcon{width:37px;height:37px;flex-basis:37px}
  .kpiIcon svg{width:18px;height:18px}
  .kpiCard small{font-size:6px}
  .kpiCard strong{font-size:21px}
  .kpiCard>div:last-child>span{display:none}
  .homeMainGrid,.homeBottomGrid{gap:9px;margin-top:9px}
  .homePanel{border-radius:13px}
  .homePanelHead{min-height:62px;padding:13px}
  .homePanelHead h2{font-size:12px}
  .homePanelHead p{font-size:7px}
  .homePanelHead>button{height:29px;font-size:7px}
  .homeTaskRow{grid-template-columns:minmax(0,1fr) auto;min-height:60px}
  .homeTaskRow>i{display:none}
  .homeStatus{font-size:6px;padding:4px 6px}
  .quickActions{grid-template-columns:1fr;padding:9px}
  .homeProjectGrid{grid-template-columns:1fr;padding:9px}
}
@media(max-width:430px){
  .homeKpis{grid-template-columns:1fr 1fr}
  .kpiCard{display:block}
  .kpiIcon{margin-bottom:8px}
  .homeStatus{display:none}
}

/* =========================================================
   MULTI PERFORMER — project-specific people selector
   ========================================================= */
.peopleSelect{position:relative;min-width:0}
.peopleSelectBtn{
  width:100%!important;height:42px!important;
  display:flex!important;align-items:center!important;justify-content:space-between!important;gap:8px!important;
  padding:0 10px!important;
  border:1px solid #d8e5ef!important;border-radius:8px!important;
  background:#eefaf2!important;color:#6c8190!important;
  font-size:12px!important;font-weight:550!important;text-align:left!important;
  box-shadow:none!important
}
.peopleSelectBtn>span{display:block!important;margin:0!important;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.peopleSelectBtn>b{font-size:12px;color:#7c929f;font-weight:700}
.peopleSelectBtn.hasValue{border-color:#b8dcc5!important;background:#f2fbf5!important;color:#265c42!important}
.peopleSelectBtn:focus{outline:0;box-shadow:0 0 0 3px rgba(58,155,101,.09)!important}
.peopleSelectMenu{
  position:absolute;z-index:95;left:0;top:47px;
  width:max(260px,100%);
  overflow:hidden;
  border:1px solid #d6e3ea;border-radius:11px;
  background:#fff;
  box-shadow:0 16px 38px rgba(27,58,79,.16)
}
.peopleOptions{max-height:235px;overflow:auto;padding:6px}
.peopleOption{
  width:100%;min-height:42px;
  display:grid;grid-template-columns:30px minmax(0,1fr) 22px;align-items:center;gap:8px;
  padding:5px 7px;border:0;border-radius:8px;background:#fff;color:#36556a;text-align:left
}
.peopleOption:hover{background:#f5f9fb}
.peopleOption.selected{background:#eef9f3;color:#215b3f}
.peopleAvatar{
  width:28px;height:28px;display:grid;place-items:center;
  border-radius:50%;background:#f1e9e4;color:#80604e;border:1px solid #e4d7ce;
  font-size:7px;font-weight:800;letter-spacing:.2px
}
.peopleName{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:9px;font-weight:650}
.peopleCheck{
  width:18px;height:18px;display:grid;place-items:center;
  border:1px solid #d6e2e8;border-radius:5px;color:#fff;font-size:9px
}
.peopleOption.selected .peopleCheck{border-color:#55ad79;background:#55ad79}
.peopleEmpty{padding:22px 12px;text-align:center;color:#8b9ca7;font-size:8px;line-height:1.55}
.peopleEditBtn{
  width:100%;height:37px;border:0;border-top:1px solid #e8eef2!important;border-radius:0!important;
  background:#fbfcfd!important;color:#496d82!important;font-size:8.5px!important;font-weight:700!important;
  box-shadow:none!important
}
.peopleEditBtn:hover{background:#f3f8fa!important;color:#1c7796!important}

.performerChips{display:flex;flex-wrap:wrap;gap:4px}
.performerChips span{
  display:inline-block;padding:3px 6px;border-radius:10px;
  background:#eef7f2;color:#397059;border:1px solid #d8eadf;
  font-size:7px;font-weight:650;white-space:nowrap
}

/* People manager */
.peopleManagerCard{width:min(520px,94vw)!important;padding:22px!important}
.peopleManagerHead>span{display:block;color:#a07d68;font-size:6.5px;letter-spacing:1.5px;font-weight:800}
.peopleManagerHead h3{margin:5px 0 4px!important;color:#193f5a!important;font-size:18px!important}
.peopleManagerHead p{margin:0 0 16px!important;color:#8295a2!important;font-size:8.5px!important}
.peopleAddForm{display:grid;grid-template-columns:minmax(0,1fr) 92px;gap:8px;margin-bottom:12px}
.peopleAddForm input{
  width:100%;height:40px;padding:0 11px;border:1px solid #d7e3ea;border-radius:8px;
  outline:0;background:#fbfdfe;color:#294b62;font-size:10px
}
.peopleAddForm input:focus{border-color:#32a8c2;box-shadow:0 0 0 3px rgba(50,168,194,.09)}
.peopleAddForm button{
  height:40px;border:0;border-radius:8px;background:#153f5c;color:#fff;font-size:9px;font-weight:750
}
.peopleAddForm.readonly{opacity:.55}
.peopleManagerList{
  max-height:330px;overflow:auto;border:1px solid #e2e9ed;border-radius:10px;background:#fff
}
.peopleManagerRow{
  min-height:52px;display:flex;align-items:center;justify-content:space-between;gap:10px;
  padding:8px 10px;border-bottom:1px solid #eef2f4
}
.peopleManagerRow:last-child{border-bottom:0}
.peopleManagerRow>div{display:flex;align-items:center;gap:9px;min-width:0}
.peopleManagerRow b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#2b4c62;font-size:9.5px}
.peopleManagerRow>button{
  height:29px;padding:0 9px;border:1px solid #efd4d4;border-radius:7px;
  background:#fff7f7;color:#bd5e5e;font-size:8px
}
.peopleReadOnly{color:#9ba9b2;font-size:7px}
.peopleManagerFoot{margin-top:9px;color:#91a0aa;font-size:7px;text-align:center}

/* Task row: make performer selector readable without widening too much */
#app .entryRow{
  grid-template-columns:108px minmax(230px,2fr) 116px 128px minmax(150px,1.05fr) minmax(130px,1fr) minmax(185px,1.15fr) 76px 35px!important
}
#app .performerField{min-width:0}

/* Energy form gets the same performer control */
#app .energyForm{
  grid-template-columns:130px 155px 165px minmax(170px,.9fr) minmax(190px,1fr) auto!important;
}
#app .energyPerformerField{min-width:0}
#app .energyPerformerField>span{display:block;margin:0 0 5px;font-size:9px;font-weight:700;color:#62798e}
#app .energyForm .peopleSelectBtn{height:41px!important;background:#f2fbf7!important;border-color:#d2e7da!important}
#app .energyForm .peopleSelectMenu{top:46px}

@media(max-width:1280px){
  #app .energyForm{grid-template-columns:repeat(3,minmax(0,1fr))!important}
  #app .energyNoteField{grid-column:span 2}
  #app .energyActions{align-self:end}
}
@media(max-width:1200px){
  #app .entryRow{grid-template-columns:repeat(6,minmax(0,1fr))!important}
  #app .performerField{grid-column:span 2}
}
@media(max-width:760px){
  #app .performerField,#app .energyPerformerField{grid-column:1/-1!important}
  #app .peopleSelectBtn{height:46px!important;font-size:13px!important}
  .peopleSelectMenu{
    position:fixed!important;
    left:10px!important;right:10px!important;top:auto!important;bottom:12px!important;
    width:auto!important;max-height:65vh!important;
    border-radius:14px!important;
    z-index:110!important;
    box-shadow:0 18px 60px rgba(13,39,57,.28)!important
  }
  .peopleOptions{max-height:48vh}
  .peopleOption{min-height:48px}
  .peopleName{font-size:11px}
  .peopleEditBtn{height:44px!important;font-size:10px!important}
  #app .energyForm{grid-template-columns:1fr 1fr!important}
  #app .energyNoteField{grid-column:1/-1!important}
  #app .energyActions{grid-column:1/-1}
  .peopleAddForm{grid-template-columns:1fr 88px}
  .peopleManagerRow{min-height:56px}
}

/* =========================================================
   ESTA ENTERPRISE UI V10 — WORK + ENERGY PROFESSIONAL
   ========================================================= */
:root{
  --esta-navy:#12324f;
  --esta-navy-2:#0d2943;
  --esta-cyan:#19b8d4;
  --esta-bronze:#9a7660;
  --esta-bg:#f4f7fa;
  --esta-card:#fff;
  --esta-border:#e2e9ee;
  --esta-text:#183b56;
  --esta-muted:#718595;
  --esta-green:#2e956b;
  --esta-amber:#bf812e;
  --esta-red:#c45f65;
  --esta-shadow:0 8px 28px rgba(20,55,80,.055);
}

/* Remove old decorative strips: dashboard itself becomes the product visual */
#app:not(.hide) .heroStrip{display:none!important}
#app .proModulePage{
  max-width:1580px;
  margin:0 auto;
  padding:24px 24px 34px!important;
}

/* Page title */
#app .proPageHead{
  min-height:82px;
  grid-template-columns:48px minmax(0,1fr) auto!important;
  gap:14px!important;
  padding:2px 2px 18px!important;
  border-bottom:1px solid #e7edf1;
  margin-bottom:18px;
}
#app .proPageHead .headIcon{
  width:46px!important;height:46px!important;
  border-radius:13px!important;
  background:linear-gradient(145deg,#173f5d,#205f7e)!important;
  color:#fff!important;
  box-shadow:0 9px 22px rgba(19,63,93,.14)!important
}
#app .proPageHead .headIcon.energyIcon{
  background:linear-gradient(145deg,#197f8f,#20a0a4)!important
}
#app .proPageHead .headIcon svg{
  width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:1.65;stroke-linecap:round;stroke-linejoin:round
}
.pageEyebrow{
  display:block;
  margin-bottom:4px;
  color:var(--esta-bronze);
  font-size:7px;
  font-weight:800;
  letter-spacing:1.7px
}
#app .proPageHead h1{
  margin:0!important;
  color:var(--esta-text)!important;
  font-size:25px!important;
  line-height:1.08;
  letter-spacing:-.45px;
  font-weight:780!important
}
#app .proPageHead p{
  margin:5px 0 0!important;
  color:#7f929f!important;
  font-size:10.5px!important
}
#app .proPageHead .headMeta{
  align-self:center;
  display:flex;
  gap:7px;
  flex-wrap:wrap;
  justify-content:flex-end
}
#app .proPageHead .headMeta span{
  display:flex;align-items:center;gap:6px;
  min-height:33px;
  padding:0 10px!important;
  border:1px solid #e1e8ed!important;
  border-radius:9px!important;
  background:#fff!important;
  color:#7b8f9d!important;
  font-size:8px!important;
  box-shadow:0 2px 8px rgba(26,54,73,.025)
}
#app .proPageHead .headMeta i{
  width:6px;height:6px;border-radius:50%;background:#4fb38b;box-shadow:0 0 0 3px #eef8f3
}
#app .proPageHead .headMeta b{color:#315269!important;font-weight:700}

/* Universal form card */
#app .premiumFormCard{
  padding:0!important;
  overflow:visible;
  border:1px solid var(--esta-border)!important;
  border-radius:17px!important;
  background:#fff!important;
  box-shadow:var(--esta-shadow)!important;
  margin-bottom:15px!important
}
.formSectionHead{
  min-height:82px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:18px;
  padding:17px 19px;
  border-bottom:1px solid #edf1f4;
  background:linear-gradient(180deg,#fff,#fcfdfe);
  border-radius:17px 17px 0 0
}
.formSectionHead>div:first-child>span{
  display:block;color:var(--esta-bronze);font-size:6.5px;font-weight:850;letter-spacing:1.5px
}
.formSectionHead h2{
  margin:4px 0 2px!important;color:#1b405a!important;font-size:15px!important;font-weight:780!important
}
.formSectionHead p{
  margin:0!important;color:#8b9ba6!important;font-size:8px!important
}
.formSectionMark{
  width:38px;height:38px;display:grid;place-items:center;flex:0 0 38px;
  border:1px solid #d8e6ec;border-radius:11px;
  background:#f3f8fa;color:#2a758e
}
.formSectionMark.energyMark{background:#eef9f8;color:#238f8d;border-color:#d5ebe8}
.formSectionMark svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}

/* Work form: spacious two-row workstation */
#app .workEntryBox .entryRow{
  display:grid!important;
  grid-template-columns:138px 145px 168px minmax(260px,1.2fr) 104px!important;
  grid-template-areas:
    "date type status performer save"
    "content content note note note"
    "image image image image cancel"!important;
  gap:13px 12px!important;
  align-items:end!important;
  padding:17px 19px 18px!important
}
#app .workEntryBox .dateField{grid-area:date}
#app .workEntryBox .typeField{grid-area:type}
#app .workEntryBox .statusField{grid-area:status}
#app .workEntryBox .performerField{grid-area:performer}
#app .workEntryBox .contentField{grid-area:content}
#app .workEntryBox .noteField{grid-area:note}
#app .workEntryBox .imageField{grid-area:image}
#app .workEntryBox #saveBtn{grid-area:save}
#app .workEntryBox #cancelEdit{grid-area:cancel;justify-self:end}
#app .workEntryBox #imageInfo,#app .workEntryBox #pendingImagePreview{margin-left:19px;margin-right:19px}
#app .workEntryBox #pendingImagePreview{margin-bottom:17px}
#app .entryRow label>span,
#app .energyForm label>span{
  margin:0 0 6px!important;
  color:#617a8b!important;
  font-size:8px!important;
  font-weight:730!important;
  letter-spacing:.08px
}
#app .entryRow input,
#app .entryRow select,
#app .energyForm input{
  height:43px!important;
  padding:0 11px!important;
  border:1px solid #dce5eb!important;
  border-radius:10px!important;
  background:#f9fbfc!important;
  color:#25485f!important;
  font-size:10px!important;
  outline:0!important;
  box-shadow:inset 0 1px 1px rgba(24,57,78,.015)!important;
  transition:.16s ease!important
}
#app .entryRow input:hover,
#app .entryRow select:hover,
#app .energyForm input:hover{border-color:#c7d7df!important;background:#fff!important}
#app .entryRow input:focus,
#app .entryRow select:focus,
#app .energyForm input:focus{
  border-color:#55b3c7!important;
  background:#fff!important;
  box-shadow:0 0 0 3px rgba(56,165,190,.085)!important
}
#app .contentField input{font-weight:650;color:#1f435b!important}
#app .requiredField>span:after{color:#c66868!important}
#app #saveBtn{
  height:43px!important;
  border:0!important;border-radius:10px!important;
  background:linear-gradient(135deg,#173f5d,#17627b)!important;
  color:#fff!important;font-size:9px!important;font-weight:780!important;
  box-shadow:0 8px 17px rgba(19,76,105,.14)!important
}
#app #saveBtn:hover{filter:brightness(1.04);transform:translateY(-1px)}
#app #cancelEdit{
  width:auto!important;min-width:86px!important;height:36px!important;
  padding:0 12px!important;border:1px solid #e3e9ed!important;border-radius:9px!important;
  color:#758a98!important;background:#fff!important;font-size:8px!important
}

/* Native image actions cleaned up */
#app .imageNativeActions{display:flex!important;gap:7px!important;flex-wrap:wrap}
#app .imageNativeActions .imageActionBtn{
  height:38px!important;
  padding:0 12px!important;
  border:1px solid #dbe5ea!important;
  border-radius:9px!important;
  background:#f8fafb!important;
  color:#476779!important;
  font-size:8.5px!important;
  font-weight:700!important;
  box-shadow:none!important
}
#app .imageNativeActions .cameraBtn{background:#eef8fb!important;color:#217a94!important;border-color:#d3e9ef!important}

/* People selector — enterprise multi-select */
#app .peopleSelectBtn{
  min-height:43px!important;height:auto!important;
  padding:5px 9px!important;
  border:1px solid #d9e5df!important;
  border-radius:10px!important;
  background:#f7fbf9!important;
  color:#355f4c!important
}
#app .peopleSelectBtn>span.peopleButtonSummary{
  display:flex!important;align-items:center;gap:5px!important;min-width:0;flex-wrap:nowrap;overflow:hidden
}
.peopleButtonSummary>em{
  display:block;color:#7c919c;font-size:9px;font-style:normal;font-weight:500;white-space:nowrap
}
.selectedPersonChip{
  max-width:150px;height:28px;display:inline-flex!important;align-items:center;gap:5px;
  padding:0 7px 0 4px;border:1px solid #d8e9df;border-radius:999px;
  background:#eef8f2;color:#326148;white-space:nowrap
}
.selectedPersonChip i{
  width:20px;height:20px;display:grid;place-items:center;border-radius:50%;
  background:#d8eee1;color:#2d6848;font-style:normal;font-size:6px;font-weight:850
}
.selectedPersonChip b{overflow:hidden;text-overflow:ellipsis;font-size:7.5px;font-weight:700}
.selectedMore{
  height:26px;display:grid;place-items:center;padding:0 7px;border-radius:999px;
  background:#edf3f6;color:#537084;font-size:7px;font-weight:800
}
#app .peopleSelectBtn>b{margin-left:auto}
#app .peopleSelectMenu{
  top:50px!important;
  min-width:310px!important;
  border:1px solid #dbe5ea!important;
  border-radius:13px!important;
  box-shadow:0 20px 48px rgba(19,51,71,.16)!important;
  overflow:hidden!important
}
.peopleOptions{padding:7px!important}
.peopleOption{min-height:46px!important;border-radius:9px!important;padding:6px 8px!important}
.peopleOption:hover{background:#f6f9fa!important}
.peopleOption.selected{background:#edf8f2!important}
.peopleAvatar{width:30px!important;height:30px!important;font-size:7px!important}
.peopleName{font-size:9px!important;color:#35546a!important}
.peopleEditBtn{
  height:42px!important;
  border-top:1px solid #e8eef2!important;
  background:#fafcfd!important;
  color:#45677c!important;
  font-size:8.5px!important
}
.peopleEmpty b{display:block;color:#506b7b;font-size:9px;margin-bottom:4px}
.peopleEmpty span{display:block;color:#8fa0aa;font-size:7px}

/* Stats become premium KPI cards */
#workPage .stats{
  gap:11px!important;
  margin:0 0 15px!important
}
#workPage .stats article{
  min-height:104px!important;
  padding:16px!important;
  border:1px solid var(--esta-border)!important;
  border-radius:15px!important;
  background:#fff!important;
  box-shadow:var(--esta-shadow)!important
}
#workPage .stats article:after{display:none!important}
#workPage .stats i{
  width:43px!important;height:43px!important;border-radius:12px!important
}
#workPage .stats small{font-size:6.7px!important;letter-spacing:.9px!important;color:#8395a1!important}
#workPage .stats strong{margin-top:5px!important;font-size:25px!important;color:#193e58!important;font-weight:780!important}

/* Premium tables */
#app .premiumTableCard{
  overflow:visible!important;
  border:1px solid var(--esta-border)!important;
  border-radius:16px!important;
  background:#fff!important;
  box-shadow:var(--esta-shadow)!important
}
#app .premiumTableCard .tableTop,
#app .premiumTableCard .energyTableTop{
  min-height:66px!important;
  padding:14px 17px!important;
  border-bottom:1px solid #e9eef1!important;
  background:#fff!important;
  border-radius:16px 16px 0 0
}
#app .premiumTableCard .tableTop b,
#app .premiumTableCard .energyTableTop h2{
  color:#1d425c!important;
  font-size:13px!important;
  font-weight:760!important
}
#app .premiumTableCard .desktopTable{overflow-x:auto}
#app .premiumTableCard table{border-collapse:separate!important;border-spacing:0!important}
#app .premiumTableCard th{
  height:43px;
  padding:0 10px!important;
  border:0!important;
  border-bottom:1px solid #e5ebef!important;
  background:#f7f9fb!important;
  color:#6c8291!important;
  font-size:7px!important;
  font-weight:800!important;
  letter-spacing:.45px!important;
  text-transform:uppercase
}
#app .premiumTableCard td{
  padding:12px 10px!important;
  border:0!important;
  border-bottom:1px solid #eef2f4!important;
  color:#405f72!important;
  font-size:9px!important;
  vertical-align:middle!important;
  line-height:1.45!important
}
#app .premiumTableCard tbody tr:last-child td{border-bottom:0!important}
#app .premiumTableCard tbody tr:hover{background:#fafcfd!important}
.taskContentCell{min-width:240px;max-width:380px}
.taskContentCell>b{
  display:block;
  color:#1f445e;
  font-size:13.5px;
  font-weight:400;
  line-height:1.45;
  letter-spacing:0;
}
.taskContentCell>small{display:none}
.sttCell{width:48px;color:#91a0aa!important;text-align:center}
.dateCell{white-space:nowrap;color:#496b7f!important;font-weight:620}
.noteCell{max-width:220px;color:#748a98!important}
.mutedDash{color:#a3b0b9}
#app .badge,#app .typeBadge{
  padding:5px 8px!important;border-radius:999px!important;
  font-size:7px!important;font-weight:760!important
}
#app .badge.done{background:#eaf8f1!important;color:#277c57!important}
#app .badge.doing{background:#fff4e3!important;color:#9f6a20!important}
#app .badge.waiting,#app .badge.wait{background:#fff0f0!important;color:#ac555a!important}
#app .typeBadge{background:#eef5f9!important;color:#4d7085!important}

/* People chips in table */
.performerChips.pro{display:flex;align-items:center;gap:4px;flex-wrap:wrap;min-width:140px}
.performerChips.pro>span{
  height:26px;display:inline-flex;align-items:center;gap:5px;padding:0 7px 0 3px!important;
  border:1px solid #dfe9e3!important;border-radius:999px!important;
  background:#f3f9f5!important;color:#3a6550!important
}
.performerChips.pro>span i{
  width:19px;height:19px;display:grid;place-items:center;border-radius:50%;
  background:#dcefe3;color:#32664b;font-style:normal;font-size:5.8px;font-weight:850
}
.performerChips.pro>span b{font-size:6.8px;font-weight:700;max-width:86px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.performerChips.pro>em{
  height:24px;display:grid;place-items:center;padding:0 6px;border-radius:999px;
  background:#edf2f5;color:#617989;font-size:6.5px;font-style:normal;font-weight:800
}

/* Row action menu */
.actionCell{width:54px;position:relative}
.rowActionMenu{position:relative;display:inline-block}
.rowActionMenu summary{
  list-style:none;width:32px;height:30px;display:grid;place-items:center;
  border:1px solid #e0e7eb;border-radius:8px;background:#fff;
  color:#6b8392;font-size:11px;font-weight:800;letter-spacing:1px;cursor:pointer
}
.rowActionMenu summary::-webkit-details-marker{display:none}
.rowActionMenu[open] summary{background:#f1f7f9;border-color:#cddde4;color:#2d627a}
.rowActionMenu>div{
  position:absolute;z-index:85;right:0;top:35px;width:150px;
  padding:5px;border:1px solid #dce6eb;border-radius:10px;
  background:#fff;box-shadow:0 14px 34px rgba(20,50,69,.15)
}
.rowActionMenu>div button{
  width:100%;height:34px;padding:0 9px;border:0;border-radius:7px;
  background:#fff;color:#426176;text-align:left;font-size:8px;font-weight:650
}
.rowActionMenu>div button:hover{background:#f5f8fa}
.rowActionMenu>div button.danger{color:#bb5a5f}
.rowActionMenu>div button.danger:hover{background:#fff3f3}

/* Energy navigation and form */
#energyPage .energyTabs{
  display:inline-flex!important;
  gap:5px!important;
  padding:5px!important;
  margin:0 0 14px!important;
  border:1px solid #dfe8ec!important;
  border-radius:12px!important;
  background:#fff!important;
  box-shadow:0 5px 18px rgba(23,58,80,.035)!important
}
#energyPage .energyTabs button{
  height:38px!important;
  padding:0 14px!important;
  border:1px solid transparent!important;
  border-radius:9px!important;
  background:transparent!important;
  color:#6b8190!important;
  font-size:8.5px!important;
  font-weight:700!important
}
#energyPage .energyTabs button svg{width:16px!important;height:16px!important}
#energyPage .energyTabs button.active{
  border-color:#d0e8e6!important;
  background:#edf8f7!important;
  color:#187e7d!important;
  box-shadow:none!important
}
#energyPage .energyCard{padding:0!important}
#energyPage .energyForm{
  display:grid!important;
  grid-template-columns:140px 165px minmax(260px,1.2fr) 112px!important;
  grid-template-areas:
    "edate value eperformer actions"
    "eimage eimage enote enote"!important;
  gap:13px 12px!important;
  padding:17px 19px 18px!important;
  align-items:end!important
}
#energyPage .energyForm>label:nth-of-type(1){grid-area:edate}
#energyPage .energyForm>label:nth-of-type(2){grid-area:value}
#energyPage .energyImageField{grid-area:eimage}
#energyPage .energyPerformerField{grid-area:eperformer}
#energyPage .energyNoteField{grid-area:enote}
#energyPage .energyActions{grid-area:actions;align-self:end}
#energyPage .energyActions .primary{
  height:43px!important;min-width:100px!important;border:0!important;border-radius:10px!important;
  background:linear-gradient(135deg,#147d82,#199899)!important;color:#fff!important;
  font-size:9px!important;font-weight:780!important;box-shadow:0 8px 16px rgba(20,126,130,.13)!important
}
#energyPage .energyActions .secondary{
  height:43px!important;border-radius:10px!important;font-size:8px!important
}
#energyPage .energyImagePreview{margin:0 19px 17px!important}
#energyPage .energySummaryCards{
  gap:10px!important;padding:12px 15px!important;background:#fbfcfd!important;border-bottom:1px solid #e8eef1
}
#energyPage .energySummaryCards article{
  min-height:74px!important;border:1px solid #e1e8ed!important;border-radius:12px!important;background:#fff!important;
  box-shadow:none!important;padding:12px 14px!important
}
#energyPage .energySummaryCards small{font-size:6.5px!important;color:#8395a1!important;letter-spacing:.75px}
#energyPage .energySummaryCards strong{font-size:17px!important;color:#1e455f!important}
#energyPage .energyTotalInline{
  border:1px solid #d9e9e7!important;border-radius:10px!important;background:#f2faf9!important;padding:7px 10px!important
}

/* Filters simpler and more enterprise-like */
#energyPage .energyTopTools{gap:8px!important}
#energyPage .energyFilters{
  gap:6px!important;
  padding:0!important;
  border:0!important;
  background:transparent!important
}
#energyPage .rangeButtons button{
  border-color:#dce5ea!important;border-radius:8px!important;background:#fff!important;font-size:7.5px!important
}
#energyPage .rangeButtons button.active{border-color:#a9d7d4!important;background:#eef8f7!important;color:#147d7c!important}
#energyPage .energyFilters label{font-size:7px!important}
#energyPage .energyFilters label input{height:32px!important;border-radius:8px!important}
#energyPage .energyTableTop .pdfAction{height:34px!important;border-radius:8px!important}
.meterValue b{color:#1c536c;font-size:10px}
.meterDiff{color:#467487!important;font-weight:650}

/* Modal manager */
#peopleManagerModal{backdrop-filter:blur(8px)!important;background:rgba(10,29,44,.64)!important}
.peopleManagerCard{
  width:min(560px,94vw)!important;
  padding:0!important;
  overflow:hidden!important;
  border:1px solid #dbe5ea!important;
  border-radius:18px!important;
  box-shadow:0 28px 80px rgba(9,31,47,.28)!important
}
.peopleManagerCard .modalClose{
  z-index:2;right:14px!important;top:14px!important;
  background:#f1f5f7!important;color:#5d7787!important
}
.peopleManagerHead{
  padding:22px 22px 17px;
  border-bottom:1px solid #e9eef1;
  background:linear-gradient(180deg,#fff,#fafcfd)
}
.peopleManagerHead>span{color:var(--esta-bronze)!important}
.peopleManagerHead h3{font-size:19px!important;letter-spacing:-.2px}
.peopleManagerHead p{margin-bottom:0!important}
.peopleAddForm{margin:16px 18px 11px!important}
.peopleManagerList{margin:0 18px!important;max-height:330px!important}
.peopleManagerRow{min-height:58px!important;padding:9px 11px!important}
.peopleManagerRow b{font-size:9px!important}
.peopleManagerFoot{padding:12px 18px 16px;margin:0!important;color:#8b9ba5!important}

/* Mobile enterprise cards */
#app .proTaskCard,#app .proEnergyCard{
  margin:9px 0!important;
  padding:14px!important;
  border:1px solid #e1e8ed!important;
  border-radius:14px!important;
  background:#fff!important;
  box-shadow:0 7px 22px rgba(22,54,75,.04)!important
}
.mobileCardTop{display:flex;align-items:flex-start;justify-content:space-between;gap:9px}
.mobileCardTop small{display:block;color:#8c9ca6;font-size:7px}
.mobileCardTop h4{margin:4px 0 0!important;color:#21465e!important;font-size:13px!important;line-height:1.4}
.mobileMeta{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin:11px 0 8px}
#app .proTaskCard>p,#app .proEnergyCard>p{margin:8px 0!important;color:#6f8492!important;font-size:9px!important;line-height:1.5}
.mobileCardFoot{
  display:flex;align-items:center;justify-content:space-between;gap:10px;
  padding-top:10px;margin-top:10px;border-top:1px solid #edf1f3
}
.mobileCardFoot>span{color:#8b9ba6;font-size:7px}
.mobileCardFoot>button{
  height:31px;padding:0 10px;border:1px solid #dce6eb;border-radius:8px;
  background:#fff;color:#3e677c;font-size:7.5px;font-weight:700
}
.mobileDiff{
  min-width:44px;height:27px;display:grid;place-items:center;padding:0 7px;
  border-radius:999px;background:#eef8f7;color:#1e8583;font-size:8px;font-weight:750
}

/* Desktop-only polish */
@media(min-width:761px){
  #workPage #mobileCards,#energyPage #energyMobileCards{display:none!important}
}

/* Responsive */
@media(max-width:1180px){
  #app .workEntryBox .entryRow{
    grid-template-columns:1fr 1fr 1fr!important;
    grid-template-areas:
      "date type status"
      "content content content"
      "performer performer save"
      "note note note"
      "image image cancel"!important
  }
  #energyPage .energyForm{
    grid-template-columns:1fr 1fr 1fr!important;
    grid-template-areas:
      "edate value actions"
      "eperformer eperformer eperformer"
      "eimage enote enote"!important
  }
  #app .proPageHead{grid-template-columns:46px 1fr!important}
  #app .proPageHead .headMeta{grid-column:1/-1;justify-content:flex-start}
}
@media(max-width:760px){
  #app .proModulePage{padding:14px 10px 26px!important}
  #app .proPageHead{
    min-height:76px;
    grid-template-columns:40px 1fr!important;
    gap:10px!important;
    margin-bottom:12px;
    padding-bottom:13px!important
  }
  #app .proPageHead .headIcon{width:39px!important;height:39px!important;border-radius:11px!important}
  #app .proPageHead .headIcon svg{width:18px;height:18px}
  .pageEyebrow{font-size:5.5px}
  #app .proPageHead h1{font-size:19px!important}
  #app .proPageHead p{font-size:8px!important}
  #app .proPageHead .headMeta{display:none}
  .formSectionHead{min-height:70px;padding:14px}
  .formSectionHead h2{font-size:14px!important}
  .formSectionHead p{font-size:7px!important}
  .formSectionMark{width:34px;height:34px;flex-basis:34px}
  #app .workEntryBox .entryRow{
    display:grid!important;
    grid-template-columns:1fr 1fr!important;
    grid-template-areas:
      "date type"
      "status status"
      "content content"
      "performer performer"
      "note note"
      "image image"
      "save save"
      "cancel cancel"!important;
    gap:10px!important;
    padding:13px!important
  }
  #app #saveBtn{height:46px!important;font-size:10px!important}
  #app #cancelEdit{justify-self:stretch!important;width:100%!important;height:39px!important}
  #app .entryRow input,#app .entryRow select,#app .energyForm input{height:46px!important;font-size:11px!important}
  #app .peopleSelectBtn{min-height:46px!important}
  #app .peopleSelectMenu{
    position:fixed!important;left:10px!important;right:10px!important;bottom:10px!important;top:auto!important;
    width:auto!important;min-width:0!important;max-height:70vh!important;border-radius:16px!important;z-index:130!important
  }
  .peopleOptions{max-height:51vh!important}
  .selectedPersonChip{max-width:135px}
  #workPage .stats{grid-template-columns:1fr 1fr!important;gap:8px!important}
  #workPage .stats article{min-height:88px!important;padding:12px!important}
  #workPage .stats i{width:37px!important;height:37px!important}
  #workPage .stats strong{font-size:21px!important}
  #workPage .desktopTable,#energyPage .energyDesktopTable{display:none!important}
  #workPage #mobileCards,#energyPage #energyMobileCards{display:block!important}
  #energyPage .energyTabs{display:flex!important;width:100%!important}
  #energyPage .energyTabs button{flex:1;padding:0 8px!important;font-size:7.5px!important}
  #energyPage .energyForm{
    grid-template-columns:1fr 1fr!important;
    grid-template-areas:
      "edate value"
      "eperformer eperformer"
      "eimage eimage"
      "enote enote"
      "actions actions"!important;
    padding:13px!important;
    gap:10px!important
  }
  #energyPage .energyActions .primary{flex:1;height:46px!important}
  #energyPage .energyTableTop{display:block!important}
  #energyPage .energyTopTools{margin-top:12px}
  #energyPage .energyFilters{display:grid!important;grid-template-columns:1fr 1fr!important}
  #energyPage .rangeButtons{grid-column:1/-1;display:grid!important;grid-template-columns:repeat(4,1fr)}
  #energyPage .filterLabel{display:none}
  #energyPage .energySummaryCards{grid-template-columns:1fr!important}
  .peopleManagerCard{width:min(94vw,520px)!important}
}

/* =========================================================
   ESTA INVENTORY + MAINTENANCE V1
   ========================================================= */
.inventoryPage,.maintenancePage{max-width:1580px;margin:0 auto;padding:20px 22px 34px!important}
.inventoryHero,.maintenanceHero{
  min-height:142px;display:flex;align-items:center;justify-content:space-between;gap:24px;
  padding:24px 28px;margin-bottom:13px;border:1px solid #dbe5ea;border-radius:18px;
  background:
    radial-gradient(circle at 84% 10%,rgba(25,184,212,.10),transparent 28%),
    linear-gradient(135deg,#fff 0%,#f8fbfc 100%);
  box-shadow:0 8px 28px rgba(20,55,80,.045)
}
.inventoryHero>div:first-child>span,.maintenanceHero>div:first-child>span{
  display:block;color:#9a7660;font-size:7px;font-weight:850;letter-spacing:1.7px
}
.inventoryHero h1,.maintenanceHero h1{margin:6px 0 5px;color:#173d58;font-size:25px;letter-spacing:-.4px}
.inventoryHero p,.maintenanceHero p{margin:0;max-width:720px;color:#7b8f9c;font-size:10px;line-height:1.55}
.inventoryHeroMeta{display:flex;gap:8px;flex:0 0 auto}
.inventoryHeroMeta>div{
  min-width:145px;padding:10px 12px;border:1px solid #dfe7ec;border-radius:11px;background:#fff
}
.inventoryHeroMeta small{display:block;color:#8b9ca6;font-size:6px;letter-spacing:.8px}
.inventoryHeroMeta b{display:block;margin-top:4px;color:#31536a;font-size:9px}
.inventoryHeroMeta select{
  width:100%;height:28px;margin-top:4px;border:0;background:transparent;color:#31536a;font-size:9px;font-weight:700;outline:0
}
.inventoryTabs{
  display:inline-flex;gap:5px;padding:5px;margin:0 0 13px;border:1px solid #dfe7ec;border-radius:12px;background:#fff
}
.inventoryTabs button{
  height:39px;display:flex;align-items:center;gap:7px;padding:0 14px;border:1px solid transparent;border-radius:9px;
  background:transparent;color:#6e8492;font-size:8.5px;font-weight:720
}
.inventoryTabs button svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.inventoryTabs button.active{border-color:#d9e7ec;background:#eef6f9;color:#245e79}
.inventoryToolbar,.maintenanceToolbar{
  min-height:78px;display:flex;align-items:center;justify-content:space-between;gap:16px;
  padding:16px 18px;border:1px solid #e0e8ed;border-radius:15px;background:#fff;box-shadow:0 6px 22px rgba(20,55,80,.035)
}
.inventoryKicker{display:block;color:#9a7660;font-size:6.5px;font-weight:850;letter-spacing:1.5px}
.inventoryToolbar h2,.maintenanceToolbar h2{margin:4px 0 2px;color:#1b405a;font-size:15px}
.inventoryToolbar p,.maintenanceToolbar p{margin:0;color:#8596a1;font-size:8px}
.inventoryToolbarActions{display:flex;align-items:center;justify-content:flex-end;gap:7px;flex-wrap:wrap}
.inventorySearch{
  height:37px;min-width:220px;display:flex;align-items:center;gap:7px;padding:0 10px;
  border:1px solid #dbe5ea;border-radius:9px;background:#f8fafb
}
.inventorySearch svg{width:14px;height:14px;fill:none;stroke:#76909f;stroke-width:1.8}
.inventorySearch input{width:100%;border:0;outline:0;background:transparent;color:#36556a;font-size:8.5px}
.inventoryPrimary,.inventorySecondary{
  height:37px;padding:0 11px;border-radius:9px;font-size:8px;font-weight:760;white-space:nowrap
}
.inventoryPrimary{border:0;background:linear-gradient(135deg,#173f5d,#17627b);color:#fff;box-shadow:0 6px 14px rgba(19,76,105,.12)}
.inventorySecondary{border:1px solid #dbe5ea;background:#fff;color:#496a7e}
.inventoryPrimary:hover,.inventorySecondary:hover{filter:brightness(.98);transform:translateY(-1px)}
.inventoryStats,.maintenanceStats{
  display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:11px 0
}
.inventoryStats article,.maintenanceStats article{
  min-height:94px;display:flex;align-items:center;gap:12px;padding:14px;
  border:1px solid #e1e8ed;border-radius:14px;background:#fff;box-shadow:0 6px 22px rgba(20,55,80,.032)
}
.invStatIcon,.maintStatIcon{width:40px;height:40px;display:grid;place-items:center;flex:0 0 40px;border-radius:11px}
.invStatIcon svg,.maintStatIcon svg{width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.invStatIcon.blue,.maintStatIcon.blue{background:#eaf4fb;color:#357cae}
.invStatIcon.green,.maintStatIcon.green{background:#eaf8f1;color:#2c946a}
.invStatIcon.amber,.maintStatIcon.amber{background:#fff4e4;color:#bd812f}
.invStatIcon.red,.maintStatIcon.red{background:#fff0f0;color:#c35f64}
.inventoryStats small,.maintenanceStats small{display:block;color:#8295a1;font-size:6.3px;letter-spacing:.75px}
.inventoryStats b,.maintenanceStats b{display:block;margin:3px 0 1px;color:#1b4059;font-size:21px}
.inventoryStats em,.maintenanceStats em{display:block;color:#9aa8b1;font-size:6.5px;font-style:normal}
.toolsStats{grid-template-columns:repeat(3,minmax(0,1fr))}
.inventoryExamples{
  display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin:0 0 10px;padding:0 3px
}
.inventoryExamples>span{color:#8798a3;font-size:7px;font-weight:700}
.inventoryExamples button{
  height:26px;padding:0 8px;border:1px solid #dfe7eb;border-radius:999px;background:#fff;color:#567286;font-size:6.8px
}
.inventoryExamples button:hover{border-color:#bcd8e2;background:#f3f9fb;color:#24738d}
.inventoryTableCard,.maintenanceBoard{
  overflow:visible;margin-bottom:12px;border:1px solid #e0e8ed;border-radius:15px;background:#fff;
  box-shadow:0 7px 24px rgba(20,55,80,.035)
}
.inventoryTableHint{
  padding:9px 13px;border-bottom:1px solid #e8eef1;background:#f8fafb;border-radius:15px 15px 0 0;
  color:#738894;font-size:7px
}
.inventoryTableScroll{width:100%;overflow:auto}
.inventoryTableCard table{width:100%;border-collapse:separate;border-spacing:0;white-space:nowrap}
.inventoryTableCard th{
  height:39px;padding:0 8px;border-bottom:1px solid #dfe7ec;background:#f4f7f9;color:#6b8190;
  font-size:6.5px;font-weight:800;letter-spacing:.35px;text-transform:uppercase
}
.inventoryTableCard td{padding:8px;border-bottom:1px solid #eef2f4;color:#425f72;font-size:7.5px;vertical-align:middle}
.inventoryTableCard tbody tr:last-child td{border-bottom:0}
.materialMatrix{min-width:1700px!important}
.materialMatrix .stickyMaterial{
  position:sticky;left:0;z-index:3;min-width:185px;max-width:210px;background:#fff!important;
  box-shadow:5px 0 10px rgba(32,61,78,.035)
}
.materialMatrix thead .stickyMaterial{z-index:5;background:#f4f7f9!important}
.materialMatrix .stickyMaterial b{display:block;color:#21445c;font-size:8px;white-space:normal}
.materialMatrix .stickyMaterial small{display:block;margin-top:2px;color:#92a0a9;font-size:6px}
.materialMatrix th small{display:block;margin-top:2px;color:#9aa8b1;font-size:5.5px;font-weight:600;letter-spacing:0;text-transform:none}
.monthCell{min-width:76px;text-align:center}
.monthCell span,.monthCell b{display:block}
.monthCell .in,.inText{color:#2f8b64}.monthCell .out,.outText{color:#bc615d}
.monthCell b{margin-top:2px;color:#22465e}
.lowStock td{background:#fffafa}.lowStock .stickyMaterial{background:#fffafa!important}
.stockType{display:inline-block;padding:3px 7px;border-radius:999px;font-size:6.5px;font-weight:780}
.stockType.in{background:#eaf8f1;color:#287e59}.stockType.out{background:#fff0ef;color:#ad5958}
.invRowActions{display:flex;align-items:center;gap:4px}
.invRowActions button,.miniDanger{
  height:27px;padding:0 7px;border:1px solid #dce5ea;border-radius:7px;background:#fff;color:#4f6c7e;font-size:6.5px;font-weight:700
}
.invRowActions button.danger,.miniDanger{border-color:#eed7d7;background:#fff8f8;color:#b75b60}
.toolCondition,.maintResult{display:inline-block;padding:4px 7px;border-radius:999px;font-size:6.5px;font-weight:760}
.toolCondition.good,.maintResult.good{background:#eaf8f1;color:#2d805b}
.toolCondition.warn,.maintResult.warn{background:#fff5e5;color:#a37024}
.toolCondition.bad,.maintResult.bad{background:#fff0f0;color:#ad555b}
.inventoryEmpty{padding:28px 14px;text-align:center;color:#94a3ad;font-size:8px}
.transactionCard{margin-top:12px}
.inventorySectionHead{min-height:65px;padding:14px 16px;border-bottom:1px solid #e9eef1}
.inventorySectionHead h3{margin:4px 0 1px;color:#21445d;font-size:13px}
.inventorySectionHead p{margin:0;color:#8c9ca6;font-size:7.5px}
.toolsTable,.transactionTable,.maintenanceHistoryTable{min-width:980px}

/* Inventory and maintenance modals */
.inventoryModalCard{width:min(680px,94vw)!important;padding:0!important;overflow:hidden!important;border-radius:17px!important}
.inventoryModalHead{padding:19px 20px 14px;border-bottom:1px solid #e9eef1;background:linear-gradient(180deg,#fff,#fbfcfd)}
.inventoryModalHead>span{display:block;color:#9a7660;font-size:6.5px;font-weight:850;letter-spacing:1.5px}
.inventoryModalHead h3{margin:5px 0 2px;color:#183f5a;font-size:18px}
.inventoryModalHead p{margin:0;color:#8798a3;font-size:8px}
.inventoryForm{display:grid;grid-template-columns:1fr 1fr 1fr;gap:11px;padding:16px 20px 20px}
.inventoryForm label{display:block;min-width:0}
.inventoryForm label.wide{grid-column:span 2}
.inventoryForm label>span{display:block;margin-bottom:5px;color:#607889;font-size:7.5px;font-weight:720}
.inventoryForm input,.inventoryForm select{
  width:100%;height:39px;padding:0 9px;border:1px solid #dbe5ea;border-radius:8px;background:#fafcfd;
  color:#294b61;font-size:8.5px;outline:0
}
.inventoryForm input:focus,.inventoryForm select:focus{border-color:#55adc1;box-shadow:0 0 0 3px rgba(64,161,184,.08);background:#fff}
.inventoryFormActions{grid-column:1/-1;display:flex;justify-content:flex-end;gap:7px;padding-top:3px}

/* Maintenance */
.maintenanceHero{background:radial-gradient(circle at 80% 15%,rgba(154,118,96,.09),transparent 25%),linear-gradient(135deg,#fff,#f8fbfc)}
.maintenanceHeroActions{display:flex;gap:7px;flex:0 0 auto}
.maintenanceBoard{padding:0}
.maintenanceBoard .maintenanceToolbar{border:0;border-bottom:1px solid #e8eef1;border-radius:15px 15px 0 0;box-shadow:none}
.maintenanceExamples{padding:11px 16px 3px;margin:0}
.maintenanceAssetGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;padding:11px 14px 14px}
.maintenanceAssetCard{
  position:relative;overflow:hidden;min-height:210px;padding:14px;border:1px solid #e0e7eb;border-radius:13px;background:#fff
}
.maintenanceAssetCard:before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:#8ba1ae}
.maintenanceAssetCard.ok:before{background:#42a67a}.maintenanceAssetCard.soon:before{background:#d7a041}.maintenanceAssetCard.overdue:before{background:#cf676a}
.maintCardTop{display:flex;align-items:center;justify-content:space-between;gap:8px}
.maintSystem{color:#617a8a;font-size:6.5px;font-weight:800;letter-spacing:.5px;text-transform:uppercase}
.maintDue{padding:4px 7px;border-radius:999px;font-size:6px;font-weight:780}
.maintDue.ok{background:#eaf8f1;color:#2c815b}.maintDue.soon{background:#fff5e3;color:#9d6d22}.maintDue.overdue{background:#fff0f0;color:#ad5559}.maintDue.unknown,.maintDue.paused{background:#edf2f5;color:#6c8190}
.maintenanceAssetCard h3{margin:10px 0 3px;color:#1d425c;font-size:13px}
.maintenanceAssetCard>p{margin:0;color:#8a9aa5;font-size:7px}
.maintDates{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin:13px 0;padding:9px;background:#f7f9fa;border-radius:9px}
.maintDates small{display:block;color:#91a0a9;font-size:5.8px}.maintDates b{display:block;margin-top:3px;color:#36566b;font-size:7.2px}
.maintCardMeta{display:flex;flex-wrap:wrap;gap:5px 12px;color:#80929e;font-size:6.7px}
.maintCardMeta b{color:#49677a}
.maintCardActions{display:flex;gap:5px;margin-top:13px;padding-top:10px;border-top:1px solid #edf1f3}
.maintCardActions button{
  height:30px;padding:0 8px;border:1px solid #dce5ea;border-radius:7px;background:#fff;color:#526f80;font-size:6.5px;font-weight:720
}
.maintCardActions button.primary{border-color:#d1e5eb;background:#edf7fa;color:#23768d}
.maintCardActions button.danger{margin-left:auto;border-color:#efd8d8;background:#fff8f8;color:#b75d61}
.maintenanceHistoryCard{margin-top:12px}
#maintenanceSystemFilter{
  height:37px;padding:0 9px;border:1px solid #dbe5ea;border-radius:9px;background:#fff;color:#4d697b;font-size:8px;outline:0
}
.inventoryTopIcon{background:#f3eee9!important;color:#8c6854!important}
.maintenanceTopIcon{background:#eef5f9!important;color:#326d87!important}

/* Module header modes */
#app.inventoryMode .filterWrap,#app.inventoryMode #exportBtn,
#app.maintenanceMode .filterWrap,#app.maintenanceMode #exportBtn{display:none!important}

@media(max-width:1180px){
  .inventoryStats,.maintenanceStats{grid-template-columns:1fr 1fr}
  .maintenanceAssetGrid{grid-template-columns:1fr 1fr}
  .inventoryToolbar,.maintenanceToolbar{align-items:flex-start;flex-direction:column}
  .inventoryToolbarActions{width:100%;justify-content:flex-start}
}
@media(max-width:760px){
  .inventoryPage,.maintenancePage{padding:12px 10px 25px!important}
  .inventoryHero,.maintenanceHero{min-height:0;display:block;padding:18px;border-radius:14px}
  .inventoryHero h1,.maintenanceHero h1{font-size:20px}
  .inventoryHeroMeta{margin-top:13px;display:grid;grid-template-columns:1fr 1fr}
  .inventoryHeroMeta>div{min-width:0}
  .maintenanceHeroActions{margin-top:14px}
  .inventoryTabs{display:flex;width:100%}
  .inventoryTabs button{flex:1;justify-content:center;padding:0 7px}
  .inventoryStats,.maintenanceStats{grid-template-columns:1fr 1fr;gap:7px}
  .inventoryStats article,.maintenanceStats article{min-height:80px;padding:10px;gap:8px}
  .inventoryStats b,.maintenanceStats b{font-size:18px}
  .inventoryToolbar,.maintenanceToolbar{padding:13px}
  .inventoryToolbarActions{display:grid;grid-template-columns:1fr 1fr}
  .inventorySearch{grid-column:1/-1;min-width:0}
  .inventoryPrimary,.inventorySecondary{width:100%}
  .maintenanceAssetGrid{grid-template-columns:1fr;padding:9px}
  .inventoryForm{grid-template-columns:1fr 1fr;padding:14px;gap:9px}
  .inventoryForm label.wide{grid-column:1/-1}
  .toolsStats{grid-template-columns:1fr}
}

/* =========================================================
   INVENTORY V2 — MONTH TABS + COMPACT TOOL REGISTER
   ========================================================= */
#inventoryPage .inventoryToolbar{
  padding:15px 17px!important;
  border-radius:14px!important;
}
#inventoryPage .inventoryToolbar h2{
  font-size:14px!important;
}
#inventoryPage #materialTitleCount{
  color:#718696;
  font-size:11px;
  font-weight:650;
}
.materialMonthTabs{
  display:grid;
  grid-template-columns:repeat(12,minmax(48px,1fr));
  gap:6px;
  margin:10px 0;
  padding:7px;
  border:1px solid #dfe7ec;
  border-radius:12px;
  background:#fff;
  box-shadow:0 5px 18px rgba(20,55,80,.03);
}
.materialMonthTabs button{
  height:34px;
  border:1px solid #dde6eb;
  border-radius:8px;
  background:#f6f9fb;
  color:#476678;
  font-size:8px;
  font-weight:760;
  transition:.15s ease;
}
.materialMonthTabs button:hover{
  border-color:#b7d7df;
  background:#f1f8fa;
}
.materialMonthTabs button.active{
  border-color:#23b6ca;
  background:linear-gradient(135deg,#20b8c8,#25a9bd);
  color:#fff;
  box-shadow:0 5px 13px rgba(32,174,194,.16);
}
#inventoryPage .monthlyStats{
  margin:0 0 10px!important;
}
#inventoryPage .monthlyStats article{
  min-height:82px!important;
  padding:12px 14px!important;
}
#inventoryPage .monthlyStats .invStatIcon{
  width:36px!important;height:36px!important;flex-basis:36px!important;
}
#inventoryPage .monthlyStats b{
  font-size:19px!important;
}

.materialMonthlyCard{
  overflow:hidden!important;
}
.materialMonthlyTable{
  min-width:900px!important;
}
.materialMonthlyTable th{
  height:40px!important;
  padding:0 11px!important;
  background:#f4f7f9!important;
  color:#536e7f!important;
  font-size:7px!important;
}
.materialMonthlyTable td{
  height:48px;
  padding:8px 11px!important;
  font-size:8px!important;
}
.materialMonthlyTable th:first-child,
.materialMonthlyTable td:first-child{
  width:50px;text-align:center
}
.materialNameCell{
  min-width:225px;
}
.materialNameCell b{
  display:block;
  color:#183f59;
  font-size:8.8px;
  font-weight:720;
}
.materialNameCell small{
  display:block;
  margin-top:2px;
  color:#9aa8b1;
  font-size:6.2px;
}
.stockFinal{
  color:#21475f;
  font-size:9px;
}
.stockFinal.low{
  display:inline-block;
  padding:4px 7px;
  border-radius:999px;
  background:#fff0f0;
  color:#b9585d;
}
#inventoryPage .materialMonthlyTable .inText{
  color:#238860!important;
  font-weight:760;
}
#inventoryPage .materialMonthlyTable .outText{
  color:#c06258!important;
  font-weight:760;
}
#inventoryPage .invRowActions.compact{
  justify-content:center;
}
#inventoryPage .invRowActions.compact button{
  width:29px;
  padding:0;
  font-size:9px;
}
#inventoryPage .inventoryTableHint{
  display:flex;
  align-items:center;
  min-height:36px;
  padding:0 12px!important;
  background:#fafcfd!important;
  font-size:7px!important;
}
#inventoryPage .transactionCard{
  margin-top:10px!important;
}

/* Tool register inspired by the user's compact example */
#inventoryToolsPane .inventoryToolbar{
  margin-bottom:10px;
}
#inventoryToolsPane .inventoryStats{
  margin-bottom:10px!important;
}
#inventoryToolsPane .inventoryTableCard{
  overflow:hidden!important;
}
#inventoryToolsPane .toolsTable{
  min-width:880px!important;
}
#inventoryToolsPane .toolsTable th{
  height:42px!important;
  padding:0 11px!important;
  background:#f4f7f9!important;
  color:#526e80!important;
  font-size:7px!important;
}
#inventoryToolsPane .toolsTable td{
  height:52px;
  padding:8px 11px!important;
  font-size:8px!important;
}
#inventoryToolsPane .toolsTable th:first-child,
#inventoryToolsPane .toolsTable td:first-child{
  width:50px;text-align:center;
}
.toolNameCell{
  min-width:210px;
  position:relative;
  padding-left:34px!important;
}
.toolNameCell .toolMiniIcon{
  position:absolute;
  left:10px;
  top:50%;
  transform:translateY(-50%);
  width:18px;height:18px;
  display:grid;place-items:center;
  border-radius:5px;
  background:#eaf7f8;
  color:#1795a5;
  font-size:10px;
  font-weight:800;
}
.toolNameCell b{
  display:block;
  color:#183f59;
  font-size:8.8px;
  font-weight:720;
}
.toolNameCell small{
  display:block;
  margin-top:2px;
  color:#98a7b0;
  font-size:6px;
}
#inventoryToolsPane .toolCondition{
  padding:5px 8px!important;
  border-radius:999px!important;
  font-size:6.8px!important;
}
#inventoryToolsPane .toolCondition.good{
  background:#e9f8ef!important;
  color:#287e58!important;
}
#inventoryToolsPane .toolCondition.warn{
  background:#fff5e5!important;
  color:#a56f22!important;
}
#inventoryToolsPane .toolCondition.bad{
  background:#ffecec!important;
  color:#b75056!important;
}
#inventoryToolsPane .invRowActions.compact button{
  width:30px;
  padding:0;
  font-size:9px;
}

/* Keep month tabs readable without making the page look oversized */
@media(max-width:1250px){
  .materialMonthTabs{
    grid-template-columns:repeat(6,1fr);
  }
}
@media(max-width:760px){
  .materialMonthTabs{
    grid-template-columns:repeat(4,1fr);
    gap:5px;
    padding:6px;
  }
  .materialMonthTabs button{
    height:36px;
    font-size:8px;
  }
  #inventoryPage .monthlyStats{
    grid-template-columns:1fr 1fr!important;
  }
  #inventoryPage .inventoryToolbarActions{
    grid-template-columns:1fr 1fr!important;
  }
  #inventoryPage .inventoryToolbarActions .inventorySearch{
    grid-column:1/-1!important;
  }
}

/* =========================================================
   ESTA INVENTORY V2 — REFERENCE-DRIVEN PROFESSIONAL UI
   ========================================================= */
#inventoryPage.inventoryPage{
  padding:14px 18px 30px!important;
  max-width:1580px!important;
}
#inventoryPage .inventoryControlBar{
  min-height:54px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:14px;
  margin:0 0 10px;
  padding:6px 8px 6px 6px;
  border:1px solid #dfe7ec;
  border-radius:13px;
  background:#fff;
  box-shadow:0 5px 18px rgba(20,55,80,.035);
}
#inventoryPage .inventoryTabs{
  display:flex!important;
  align-items:center!important;
  gap:4px!important;
  width:auto!important;
  margin:0!important;
  padding:0!important;
  border:0!important;
  background:transparent!important;
  box-shadow:none!important;
}
#inventoryPage .inventoryTabs button{
  height:40px!important;
  padding:0 13px!important;
  border:0!important;
  border-radius:9px!important;
  background:transparent!important;
  color:#718596!important;
  font-size:8.5px!important;
  font-weight:720!important;
}
#inventoryPage .inventoryTabs button svg{
  width:16px!important;height:16px!important;
}
#inventoryPage .inventoryTabs button.active{
  background:#eaf4f7!important;
  color:#155a75!important;
  box-shadow:inset 0 0 0 1px #d7e7ec!important;
}
#inventoryPage .inventoryContext{
  display:flex;
  align-items:center;
  gap:8px;
}
#inventoryPage .inventoryContextProject,
#inventoryPage .inventoryYearControl{
  min-height:38px;
  display:flex;
  align-items:center;
  gap:7px;
  padding:0 10px;
  border:1px solid #e1e8ed;
  border-radius:9px;
  background:#fafcfd;
}
#inventoryPage .inventoryContext small{
  color:#92a1aa;
  font-size:5.8px;
  font-weight:750;
  letter-spacing:.75px;
}
#inventoryPage .inventoryContext b{
  color:#35556b;
  font-size:8px;
  white-space:nowrap;
}
#inventoryPage .inventoryYearControl select{
  height:28px;
  border:0;
  outline:0;
  background:transparent;
  color:#234961;
  font-size:8px;
  font-weight:750;
}

/* Dark inventory workspace based on the user's reference */
#inventoryPage .inventoryWorkspace{
  padding:18px!important;
  border:0!important;
  border-radius:18px!important;
  background:
    radial-gradient(circle at 100% 0%,rgba(31,190,207,.07),transparent 24%),
    linear-gradient(180deg,#112942 0%,#10263e 100%)!important;
  box-shadow:0 12px 30px rgba(15,39,63,.10)!important;
}
#inventoryPage .inventoryWorkspace>.inventoryToolbar{
  min-height:66px!important;
  padding:0 0 13px!important;
  border:0!important;
  border-radius:0!important;
  background:transparent!important;
  box-shadow:none!important;
}
#inventoryPage .inventoryWorkspace .inventoryKicker{
  color:#5fc4d2!important;
  font-size:6px!important;
  letter-spacing:1.35px!important;
}
#inventoryPage .inventoryWorkspace .inventoryToolbar h2{
  margin:5px 0 2px!important;
  color:#fff!important;
  font-size:16px!important;
  line-height:1.25!important;
  font-weight:760!important;
}
#inventoryPage .inventoryWorkspace .inventoryToolbar h2 span{
  color:#a8bfd0!important;
  font-size:11px!important;
  font-weight:600!important;
}
#inventoryPage .inventoryWorkspace .inventoryToolbar p{
  color:#91a9ba!important;
  font-size:7.5px!important;
}
#inventoryPage .inventoryWorkspace .inventoryToolbarActions{
  gap:6px!important;
}
#inventoryPage .inventoryWorkspace .inventorySearch{
  width:210px!important;
  min-width:210px!important;
  height:38px!important;
  border:1px solid rgba(255,255,255,.09)!important;
  border-radius:9px!important;
  background:#173a5c!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.02)!important;
}
#inventoryPage .inventoryWorkspace .inventorySearch svg{stroke:#7698ae!important}
#inventoryPage .inventoryWorkspace .inventorySearch input{
  color:#f4f8fa!important;
  font-size:8px!important;
}
#inventoryPage .inventoryWorkspace .inventorySearch input::placeholder{color:#7691a6!important}
#inventoryPage .inventoryWorkspace .inventorySecondary{
  height:38px!important;
  border:1px solid rgba(255,255,255,.12)!important;
  border-radius:9px!important;
  background:#173a5c!important;
  color:#c4d7e3!important;
  box-shadow:none!important;
}
#inventoryPage .inventoryWorkspace .inventoryPrimary{
  height:38px!important;
  border:0!important;
  border-radius:9px!important;
  background:#23bbc8!important;
  color:#082d3d!important;
  font-weight:820!important;
  box-shadow:0 7px 16px rgba(35,187,200,.17)!important;
}

/* Month selector closely follows the reference */
#inventoryPage .materialMonthTabs{
  display:grid!important;
  grid-template-columns:repeat(12,minmax(0,1fr))!important;
  gap:6px!important;
  margin:0 0 12px!important;
}
#inventoryPage .materialMonthTabs button{
  height:35px!important;
  padding:0!important;
  border:0!important;
  border-radius:9px!important;
  background:#173a5c!important;
  color:#d2dee6!important;
  font-size:8px!important;
  font-weight:800!important;
  box-shadow:none!important;
  transition:.15s ease!important;
}
#inventoryPage .materialMonthTabs button:hover{
  background:#1c466d!important;
}
#inventoryPage .materialMonthTabs button.active{
  background:#21b9c7!important;
  color:#072d3c!important;
  box-shadow:0 6px 15px rgba(33,185,199,.16)!important;
}

/* KPI row: flat, compact, no oversized icons */
#inventoryPage .monthlyStats,
#inventoryPage .toolsStats{
  display:grid!important;
  grid-template-columns:repeat(4,minmax(0,1fr))!important;
  gap:9px!important;
  margin:0 0 12px!important;
}
#inventoryPage .toolsStats{grid-template-columns:repeat(3,minmax(0,1fr))!important}
#inventoryPage .monthlyStats article,
#inventoryPage .toolsStats article{
  min-height:72px!important;
  padding:11px 14px!important;
  border:1px solid rgba(255,255,255,.04)!important;
  border-radius:10px!important;
  background:#173956!important;
  box-shadow:none!important;
}
#inventoryPage .monthlyStats .invStatIcon,
#inventoryPage .toolsStats .invStatIcon{
  display:none!important;
}
#inventoryPage .monthlyStats small,
#inventoryPage .toolsStats small{
  color:#8ea7b9!important;
  font-size:6.7px!important;
  letter-spacing:.35px!important;
}
#inventoryPage .monthlyStats b,
#inventoryPage .toolsStats b{
  margin:4px 0 1px!important;
  color:#fff!important;
  font-size:20px!important;
  line-height:1!important;
}
#inventoryPage .monthlyStats article:nth-child(1) b{color:#3bd1a0!important}
#inventoryPage .monthlyStats article:nth-child(2) b{color:#ff967d!important}
#inventoryPage .monthlyStats article:nth-child(4) b{color:#ffbd3f!important}
#inventoryPage .monthlyStats em,
#inventoryPage .toolsStats em{
  color:#748fa4!important;
  font-size:6px!important;
}

/* Suggestions are secondary, not the main visual */
#inventoryPage .inventoryExamples{
  margin:0 0 10px!important;
  padding:0!important;
}
#inventoryPage .inventoryExamples>span{
  color:#7994a8!important;
  font-size:6.5px!important;
}
#inventoryPage .inventoryExamples button{
  height:25px!important;
  padding:0 8px!important;
  border:1px solid rgba(255,255,255,.08)!important;
  border-radius:999px!important;
  background:rgba(255,255,255,.035)!important;
  color:#a9bfcd!important;
  font-size:6.2px!important;
}
#inventoryPage .inventoryExamples button:hover{
  background:#173b5c!important;
  color:#e7f4f7!important;
}

/* White data table nested in navy panel */
#inventoryPage .inventoryTableCard{
  overflow:hidden!important;
  margin:0 0 12px!important;
  border:0!important;
  border-radius:12px!important;
  background:#fff!important;
  box-shadow:0 8px 24px rgba(5,25,42,.14)!important;
}
#inventoryPage .inventoryTableHint{
  min-height:34px!important;
  display:flex!important;
  align-items:center!important;
  padding:0 12px!important;
  border-bottom:1px solid #e5eaee!important;
  background:#f5f7f9!important;
  color:#647b8a!important;
  font-size:7px!important;
}
#inventoryPage .materialMonthlyTable{
  width:100%!important;
  min-width:820px!important;
  table-layout:auto!important;
  border-collapse:separate!important;
  border-spacing:0!important;
}
#inventoryPage .materialMonthlyTable th,
#inventoryPage .toolsTable th{
  height:42px!important;
  padding:0 11px!important;
  border-bottom:1px solid #e1e6ea!important;
  background:#f3f4f6!important;
  color:#263b4a!important;
  font-size:7.3px!important;
  font-weight:800!important;
  text-transform:none!important;
  letter-spacing:0!important;
}
#inventoryPage .materialMonthlyTable td,
#inventoryPage .toolsTable td{
  height:50px!important;
  padding:8px 11px!important;
  border-bottom:1px solid #e8edf0!important;
  background:#fff!important;
  color:#263e50!important;
  font-size:8.2px!important;
}
#inventoryPage .materialMonthlyTable tbody tr:last-child td,
#inventoryPage .toolsTable tbody tr:last-child td{border-bottom:0!important}
#inventoryPage .materialMonthlyTable tbody tr:hover td,
#inventoryPage .toolsTable tbody tr:hover td{background:#fbfdfe!important}
#inventoryPage .materialMonthlyTable .sttCell,
#inventoryPage .toolsTable .sttCell{
  width:54px!important;
  text-align:center!important;
  color:#5e7483!important;
}
#inventoryPage .materialNameCell{min-width:220px!important}
#inventoryPage .materialNameCell b{
  display:block!important;
  color:#163a53!important;
  font-size:8.5px!important;
  font-weight:720!important;
}
#inventoryPage .materialNameCell small{
  display:block!important;
  margin-top:2px!important;
  color:#9aa8b1!important;
  font-size:6px!important;
}
#inventoryPage .materialMonthlyTable .inText{
  color:#22936b!important;
  font-weight:800!important;
}
#inventoryPage .materialMonthlyTable .outText{
  color:#d06e61!important;
  font-weight:800!important;
}
#inventoryPage .stockFinal{
  display:inline-flex!important;
  align-items:center!important;
  justify-content:center!important;
  min-width:42px!important;
  height:26px!important;
  padding:0 8px!important;
  border-radius:8px!important;
  background:#edf6f9!important;
  color:#1f5873!important;
}
#inventoryPage .stockFinal.low{
  background:#fff1e5!important;
  color:#ba6b21!important;
}
#inventoryPage .lowStock td{background:#fffdf9!important}

/* Clean icon-only actions */
#inventoryPage .invRowActions.compact{
  display:flex!important;
  align-items:center!important;
  gap:5px!important;
  justify-content:center!important;
}
#inventoryPage .invRowActions.compact button,
#inventoryPage .miniDanger{
  width:29px!important;
  height:29px!important;
  display:grid!important;
  place-items:center!important;
  padding:0!important;
  border:1px solid #dbe4e9!important;
  border-radius:7px!important;
  background:#fff!important;
  color:#557486!important;
  font-size:0!important;
}
#inventoryPage .invRowActions.compact button.move{
  background:#eef8fa!important;
  border-color:#d2e9ed!important;
  color:#1d8398!important;
}
#inventoryPage .invRowActions.compact button.danger,
#inventoryPage .miniDanger{
  color:#b76565!important;
}
#inventoryPage .invRowActions.compact svg,
#inventoryPage .miniDanger svg{
  width:14px!important;height:14px!important;
  fill:none!important;stroke:currentColor!important;stroke-width:1.7!important;
  stroke-linecap:round!important;stroke-linejoin:round!important;
}

/* Tool table refinements */
#inventoryPage .toolsTable{
  min-width:930px!important;
}
#inventoryPage .toolNameCell{
  min-width:220px!important;
  display:table-cell!important;
}
#inventoryPage .toolNameCell>span.toolMiniIcon{
  width:28px!important;height:28px!important;
  display:inline-grid!important;place-items:center!important;
  margin-right:8px!important;
  border-radius:8px!important;
  background:#edf8f9!important;
  color:#178391!important;
  vertical-align:middle!important;
}
#inventoryPage .toolMiniIcon svg{
  width:15px!important;height:15px!important;
  fill:none!important;stroke:currentColor!important;stroke-width:1.7!important;
  stroke-linecap:round!important;stroke-linejoin:round!important;
}
#inventoryPage .toolNameCell>div{
  display:inline-block!important;
  vertical-align:middle!important;
  max-width:170px!important;
}
#inventoryPage .toolNameCell b{
  display:block!important;
  color:#153a54!important;
  font-size:8.5px!important;
}
#inventoryPage .toolNameCell small{
  display:block!important;
  margin-top:2px!important;
  color:#9aa8b1!important;
  font-size:5.8px!important;
}
#inventoryPage .toolCondition{
  padding:5px 9px!important;
  border-radius:999px!important;
  font-size:6.6px!important;
  font-weight:780!important;
}
#inventoryPage .toolCondition.good{background:#dff7e8!important;color:#267d55!important}
#inventoryPage .toolCondition.warn{background:#fff1d6!important;color:#98651d!important}
#inventoryPage .toolCondition.bad{background:#ffe5e5!important;color:#b44f55!important}

/* History table stays secondary */
#inventoryPage .transactionCard{
  margin-top:12px!important;
  box-shadow:none!important;
}
#inventoryPage .transactionCard .inventorySectionHead{
  min-height:57px!important;
  padding:11px 13px!important;
  background:#f8fafb!important;
}
#inventoryPage .transactionCard .inventoryKicker{color:#8a9aa4!important}
#inventoryPage .transactionCard h3{font-size:11px!important}
#inventoryPage .transactionTable th{background:#f3f5f7!important}
#inventoryPage .stockType{
  padding:4px 8px!important;
  font-size:6.2px!important;
}

/* Mobile */
@media(max-width:900px){
  #inventoryPage .inventoryControlBar{
    align-items:flex-start;
    flex-direction:column;
  }
  #inventoryPage .inventoryContext{
    width:100%;
    justify-content:space-between;
  }
  #inventoryPage .materialMonthTabs{
    grid-template-columns:repeat(6,minmax(0,1fr))!important;
  }
  #inventoryPage .monthlyStats,
  #inventoryPage .toolsStats{
    grid-template-columns:1fr 1fr!important;
  }
}
@media(max-width:760px){
  #inventoryPage.inventoryPage{padding:10px 9px 24px!important}
  #inventoryPage .inventoryWorkspace{padding:12px!important;border-radius:15px!important}
  #inventoryPage .inventoryWorkspace>.inventoryToolbar{
    gap:10px!important;
    padding-bottom:11px!important;
  }
  #inventoryPage .inventoryWorkspace .inventoryToolbarActions{
    display:grid!important;
    grid-template-columns:1fr 1fr!important;
  }
  #inventoryPage .inventoryWorkspace .inventorySearch{
    width:100%!important;min-width:0!important;grid-column:1/-1!important;
  }
  #inventoryPage .materialMonthTabs{
    grid-template-columns:repeat(4,minmax(0,1fr))!important;
    gap:5px!important;
  }
  #inventoryPage .materialMonthTabs button{height:34px!important}
  #inventoryPage .monthlyStats,
  #inventoryPage .toolsStats{grid-template-columns:1fr 1fr!important;gap:7px!important}
  #inventoryPage .monthlyStats article,
  #inventoryPage .toolsStats article{min-height:66px!important;padding:9px 11px!important}
  #inventoryPage .monthlyStats b,
  #inventoryPage .toolsStats b{font-size:18px!important}
  #inventoryPage .inventoryExamples{display:none!important}
}

/* =========================================================
   ESTA MATERIALS V3 — LIGHT / CLEAR / STRONG ACTIVE MONTH
   ========================================================= */
#inventoryMaterialsPane.inventoryWorkspace{
  padding:16px!important;
  border:1px solid #dce6ec!important;
  border-radius:17px!important;
  background:#f4f7fa!important;
  box-shadow:0 8px 26px rgba(18,50,79,.055)!important;
}

/* Header */
#inventoryMaterialsPane>.inventoryToolbar{
  min-height:68px!important;
  padding:0 0 13px!important;
  border:0!important;
  border-radius:0!important;
  background:transparent!important;
  box-shadow:none!important;
}
#inventoryMaterialsPane .inventoryKicker{
  color:#8f6d59!important;
  font-size:6.4px!important;
  letter-spacing:1.45px!important;
}
#inventoryMaterialsPane .inventoryToolbar h2{
  margin:4px 0 2px!important;
  color:#173d58!important;
  font-size:16px!important;
  font-weight:780!important;
}
#inventoryMaterialsPane .inventoryToolbar h2 span{
  color:#8194a2!important;
  font-size:10px!important;
  font-weight:600!important;
}
#inventoryMaterialsPane .inventoryToolbar p{
  color:#8193a0!important;
  font-size:7.6px!important;
}
#inventoryMaterialsPane .inventorySearch{
  width:210px!important;
  min-width:210px!important;
  height:37px!important;
  border:1px solid #dce5ea!important;
  border-radius:9px!important;
  background:#fff!important;
  box-shadow:none!important;
}
#inventoryMaterialsPane .inventorySearch svg{stroke:#6f8796!important}
#inventoryMaterialsPane .inventorySearch input{color:#294a61!important}
#inventoryMaterialsPane .inventorySearch input::placeholder{color:#9aa8b1!important}
#inventoryMaterialsPane .inventorySecondary{
  height:37px!important;
  border:1px solid #d9e3e8!important;
  border-radius:9px!important;
  background:#fff!important;
  color:#49697d!important;
  box-shadow:none!important;
}
#inventoryMaterialsPane .inventoryPrimary{
  height:37px!important;
  border:0!important;
  border-radius:9px!important;
  background:linear-gradient(135deg,#173f5d,#17617a)!important;
  color:#fff!important;
  box-shadow:0 6px 14px rgba(19,76,105,.12)!important;
}

/* Month navigation */
#inventoryMaterialsPane .materialMonthTabs{
  display:grid!important;
  grid-template-columns:repeat(12,minmax(0,1fr))!important;
  gap:7px!important;
  margin:0 0 12px!important;
  padding:10px!important;
  border:1px solid #dfe7ec!important;
  border-radius:13px!important;
  background:#fff!important;
  box-shadow:0 5px 17px rgba(20,55,80,.035)!important;
}
#inventoryMaterialsPane .materialMonthTabs button{
  position:relative!important;
  height:38px!important;
  padding:0!important;
  border:1px solid #dfe6eb!important;
  border-radius:9px!important;
  background:#f7f9fb!important;
  color:#607787!important;
  font-size:8.2px!important;
  font-weight:780!important;
  box-shadow:none!important;
  transition:transform .15s ease,box-shadow .15s ease,border-color .15s ease,background .15s ease!important;
}
#inventoryMaterialsPane .materialMonthTabs button:hover{
  border-color:#b9d6df!important;
  background:#f0f7f9!important;
  color:#28647d!important;
}
#inventoryMaterialsPane .materialMonthTabs button.active{
  z-index:2!important;
  transform:translateY(-2px)!important;
  border-color:#16aaba!important;
  background:linear-gradient(135deg,#1eb8c5 0%,#27c5ce 100%)!important;
  color:#083a48!important;
  font-weight:900!important;
  box-shadow:0 8px 18px rgba(30,184,197,.24)!important;
}
#inventoryMaterialsPane .materialMonthTabs button.active:before{
  content:""!important;
  position:absolute!important;
  left:50%!important;
  bottom:-8px!important;
  width:24px!important;
  height:3px!important;
  border-radius:99px!important;
  background:#18aebb!important;
  transform:translateX(-50%)!important;
}
#inventoryMaterialsPane .materialMonthTabs button.active:after{
  content:"✓"!important;
  position:absolute!important;
  top:4px!important;
  right:5px!important;
  width:13px!important;
  height:13px!important;
  display:grid!important;
  place-items:center!important;
  border-radius:50%!important;
  background:rgba(7,56,68,.13)!important;
  color:#083a48!important;
  font-size:7px!important;
  font-weight:900!important;
}

/* Clear selected-period banner */
#inventoryMaterialsPane .materialPeriodSummary{
  min-height:52px!important;
  display:flex!important;
  align-items:center!important;
  justify-content:space-between!important;
  gap:14px!important;
  margin:0 0 10px!important;
  padding:9px 12px!important;
  border:1px solid #cfe5ea!important;
  border-radius:11px!important;
  background:linear-gradient(90deg,#eef9fb 0%,#f7fcfd 100%)!important;
}
#inventoryMaterialsPane .materialPeriodCurrent span{
  display:block!important;
  color:#5c8190!important;
  font-size:5.8px!important;
  font-weight:820!important;
  letter-spacing:1px!important;
}
#inventoryMaterialsPane .materialPeriodCurrent strong{
  display:block!important;
  margin-top:3px!important;
  color:#156b80!important;
  font-size:11px!important;
  font-weight:850!important;
}
#inventoryMaterialsPane .materialPeriodFormula{
  display:flex!important;
  align-items:center!important;
  gap:6px!important;
  flex-wrap:wrap!important;
}
#inventoryMaterialsPane .materialPeriodFormula span{
  height:24px!important;
  display:inline-flex!important;
  align-items:center!important;
  padding:0 7px!important;
  border:1px solid #d5e7eb!important;
  border-radius:7px!important;
  background:#fff!important;
  color:#506f80!important;
  font-size:6.6px!important;
  font-weight:700!important;
}
#inventoryMaterialsPane .materialPeriodFormula b{
  color:#69a0ad!important;
  font-size:9px!important;
}

/* KPI cards: clean and readable */
#inventoryMaterialsPane .monthlyStats{
  display:grid!important;
  grid-template-columns:repeat(4,minmax(0,1fr))!important;
  gap:9px!important;
  margin:0 0 10px!important;
}
#inventoryMaterialsPane .monthlyStats article{
  position:relative!important;
  min-height:76px!important;
  padding:12px 14px!important;
  border:1px solid #dfe7ec!important;
  border-radius:11px!important;
  background:#fff!important;
  box-shadow:0 5px 16px rgba(20,55,80,.03)!important;
}
#inventoryMaterialsPane .monthlyStats article:before{
  content:""!important;
  position:absolute!important;
  top:0!important;
  left:12px!important;
  right:12px!important;
  height:2px!important;
  border-radius:0 0 4px 4px!important;
  background:#8fb9c6!important;
}
#inventoryMaterialsPane .monthlyStats article:nth-child(1):before{background:#38b887!important}
#inventoryMaterialsPane .monthlyStats article:nth-child(2):before{background:#df8a63!important}
#inventoryMaterialsPane .monthlyStats article:nth-child(3):before{background:#4c93bd!important}
#inventoryMaterialsPane .monthlyStats article:nth-child(4):before{background:#e0ad42!important}
#inventoryMaterialsPane .monthlyStats .invStatIcon{display:none!important}
#inventoryMaterialsPane .monthlyStats small{
  color:#7d909d!important;
  font-size:6.3px!important;
  letter-spacing:.35px!important;
}
#inventoryMaterialsPane .monthlyStats b{
  margin:4px 0 2px!important;
  color:#173d58!important;
  font-size:21px!important;
  line-height:1!important;
}
#inventoryMaterialsPane .monthlyStats article:nth-child(1) b{color:#2c966b!important}
#inventoryMaterialsPane .monthlyStats article:nth-child(2) b{color:#c96f51!important}
#inventoryMaterialsPane .monthlyStats article:nth-child(4) b{color:#b57b1e!important}
#inventoryMaterialsPane .monthlyStats em{
  color:#9aa8b1!important;
  font-size:6.2px!important;
}

/* Suggested materials */
#inventoryMaterialsPane .inventoryExamples{
  margin:0 0 10px!important;
  padding:0 1px!important;
}
#inventoryMaterialsPane .inventoryExamples>span{color:#80939f!important}
#inventoryMaterialsPane .inventoryExamples button{
  border-color:#dce5ea!important;
  background:#fff!important;
  color:#5b7485!important;
}
#inventoryMaterialsPane .inventoryExamples button:hover{
  border-color:#b9d9e1!important;
  background:#f0f8fa!important;
  color:#24677f!important;
}

/* Main monthly table */
#inventoryMaterialsPane .inventoryTableCard{
  overflow:hidden!important;
  border:1px solid #dfe7ec!important;
  border-radius:12px!important;
  background:#fff!important;
  box-shadow:0 7px 22px rgba(20,55,80,.035)!important;
}
#inventoryMaterialsPane .inventoryTableHint{
  min-height:42px!important;
  display:flex!important;
  align-items:center!important;
  justify-content:space-between!important;
  padding:0 13px!important;
  border-bottom:1px solid #e4eaee!important;
  background:#f8fafb!important;
}
#inventoryMaterialsPane .inventoryTableHint>span{
  color:#81939f!important;
  font-size:6.2px!important;
  font-weight:820!important;
  letter-spacing:1px!important;
}
#inventoryMaterialsPane .inventoryTableHint>b{
  height:25px!important;
  display:inline-flex!important;
  align-items:center!important;
  padding:0 9px!important;
  border:1px solid #cde5ea!important;
  border-radius:999px!important;
  background:#ebf8fa!important;
  color:#176b7f!important;
  font-size:7px!important;
  font-weight:820!important;
}
#inventoryMaterialsPane .materialMonthlyTable th{
  background:#f2f5f7!important;
  color:#314b5c!important;
  font-size:7.3px!important;
}
#inventoryMaterialsPane .materialMonthlyTable td{
  color:#314e61!important;
  font-size:8.2px!important;
}
#inventoryMaterialsPane .materialNameCell b{
  color:#173d58!important;
}
#inventoryMaterialsPane .transactionCard{
  margin-top:10px!important;
}

/* Mobile keeps the selected month obvious */
@media(max-width:900px){
  #inventoryMaterialsPane .materialMonthTabs{
    grid-template-columns:repeat(6,minmax(0,1fr))!important;
  }
  #inventoryMaterialsPane .materialPeriodSummary{
    align-items:flex-start!important;
    flex-direction:column!important;
  }
}
@media(max-width:760px){
  #inventoryMaterialsPane.inventoryWorkspace{
    padding:11px!important;
  }
  #inventoryMaterialsPane .materialMonthTabs{
    grid-template-columns:repeat(4,minmax(0,1fr))!important;
    padding:8px!important;
    gap:6px!important;
  }
  #inventoryMaterialsPane .materialMonthTabs button{
    height:36px!important;
  }
  #inventoryMaterialsPane .monthlyStats{
    grid-template-columns:1fr 1fr!important;
    gap:7px!important;
  }
  #inventoryMaterialsPane .materialPeriodFormula{
    display:none!important;
  }
}

/* =========================================================
   ESTA INVENTORY V4 — NAVY PROFESSIONAL / REFERENCE ALIGNED
   ========================================================= */
#inventoryPage.inventoryPage{
  padding:16px 18px 30px!important;
  max-width:1600px!important;
}

/* compact top switcher */
#inventoryPage .inventoryControlBar{
  min-height:58px!important;
  display:flex!important;
  align-items:center!important;
  justify-content:space-between!important;
  gap:14px!important;
  margin:0 0 10px!important;
  padding:8px 10px!important;
  border:1px solid #dfe7ec!important;
  border-radius:13px!important;
  background:#fff!important;
  box-shadow:0 5px 16px rgba(20,55,80,.035)!important;
}
#inventoryPage .inventoryControlBar .inventoryTabs{
  margin:0!important;
  padding:4px!important;
  border:0!important;
  background:#edf3f7!important;
  box-shadow:none!important;
}
#inventoryPage .inventoryControlBar .inventoryTabs button{
  height:34px!important;
  padding:0 12px!important;
  color:#5d7484!important;
}
#inventoryPage .inventoryControlBar .inventoryTabs button.active{
  border-color:#cadde6!important;
  background:#fff!important;
  color:#153d59!important;
  box-shadow:0 2px 7px rgba(20,55,80,.07)!important;
}
#inventoryPage .inventoryContext{
  display:flex!important;
  align-items:center!important;
  gap:7px!important;
}
#inventoryPage .inventoryContextProject,
#inventoryPage .inventoryYearControl{
  min-height:36px!important;
  display:flex!important;
  align-items:center!important;
  gap:8px!important;
  padding:0 10px!important;
  border:1px solid #e0e7eb!important;
  border-radius:9px!important;
  background:#fafcfd!important;
}
#inventoryPage .inventoryContext small{
  color:#95a4ad!important;
  font-size:5.8px!important;
  letter-spacing:.8px!important;
}
#inventoryPage .inventoryContext b,
#inventoryPage .inventoryContext select{
  color:#3d5d70!important;
  font-size:7.5px!important;
  font-weight:750!important;
}

/* one coherent navy work surface, matching the user's reference */
#inventoryPage .inventoryWorkspace{
  padding:17px!important;
  border:0!important;
  border-radius:17px!important;
  background:
    radial-gradient(circle at 92% 2%,rgba(38,166,193,.10),transparent 24%),
    linear-gradient(180deg,#102942 0%,#0e243a 100%)!important;
  box-shadow:0 14px 34px rgba(8,30,49,.13)!important;
}

/* workspace header */
#inventoryPage .inventoryWorkspace>.inventoryToolbar{
  min-height:64px!important;
  padding:0 0 13px!important;
  border:0!important;
  border-bottom:1px solid rgba(255,255,255,.08)!important;
  border-radius:0!important;
  background:transparent!important;
  box-shadow:none!important;
}
#inventoryPage .inventoryWorkspace .inventoryKicker{
  color:#66c9d8!important;
  font-size:6px!important;
  letter-spacing:1.45px!important;
}
#inventoryPage .inventoryWorkspace .inventoryToolbar h2{
  margin:4px 0 2px!important;
  color:#fff!important;
  font-size:15px!important;
  font-weight:760!important;
}
#inventoryPage .inventoryWorkspace .inventoryToolbar h2 span{
  color:#a8bfcd!important;
  font-size:9px!important;
  font-weight:600!important;
}
#inventoryPage .inventoryWorkspace .inventoryToolbar p{
  color:#8fa9ba!important;
  font-size:7.4px!important;
}
#inventoryPage .inventoryWorkspace .inventoryToolbarActions{
  gap:6px!important;
}
#inventoryPage .inventoryWorkspace .inventorySearch{
  width:205px!important;
  min-width:205px!important;
  height:36px!important;
  border:1px solid rgba(144,191,211,.18)!important;
  border-radius:8px!important;
  background:#173754!important;
  box-shadow:none!important;
}
#inventoryPage .inventoryWorkspace .inventorySearch svg{stroke:#84a8ba!important}
#inventoryPage .inventoryWorkspace .inventorySearch input{color:#eaf3f7!important}
#inventoryPage .inventoryWorkspace .inventorySearch input::placeholder{color:#7e9bab!important}
#inventoryPage .inventoryWorkspace .inventorySecondary{
  height:36px!important;
  padding:0 10px!important;
  border:1px solid rgba(155,197,214,.20)!important;
  border-radius:8px!important;
  background:#173754!important;
  color:#c8dbe5!important;
  box-shadow:none!important;
}
#inventoryPage .inventoryWorkspace .inventoryPrimary{
  height:36px!important;
  padding:0 11px!important;
  border:0!important;
  border-radius:8px!important;
  background:linear-gradient(135deg,#20b9c2,#19aebc)!important;
  color:#07394a!important;
  font-weight:820!important;
  box-shadow:0 6px 15px rgba(28,184,195,.19)!important;
}

/* month selector — strong but not oversized */
#inventoryPage #materialMonthTabs{
  display:grid!important;
  grid-template-columns:repeat(12,minmax(0,1fr))!important;
  gap:7px!important;
  margin:13px 0 10px!important;
  padding:0!important;
  border:0!important;
  border-radius:0!important;
  background:transparent!important;
  box-shadow:none!important;
}
#inventoryPage #materialMonthTabs button{
  height:35px!important;
  padding:0!important;
  border:1px solid rgba(139,184,204,.12)!important;
  border-radius:8px!important;
  background:#183955!important;
  color:#d0dee6!important;
  font-size:7.8px!important;
  font-weight:780!important;
  box-shadow:none!important;
  transform:none!important;
}
#inventoryPage #materialMonthTabs button:hover{
  border-color:rgba(79,202,213,.34)!important;
  background:#1c4463!important;
  color:#fff!important;
}
#inventoryPage #materialMonthTabs button.active{
  border-color:#26c1c6!important;
  background:linear-gradient(135deg,#22c6c4,#1fb8c5)!important;
  color:#073747!important;
  font-weight:900!important;
  box-shadow:0 6px 14px rgba(32,190,196,.18)!important;
  transform:none!important;
}
#inventoryPage #materialMonthTabs button.active:before,
#inventoryPage #materialMonthTabs button.active:after{display:none!important}

/* avoid visual clutter; active month is already obvious */
#inventoryPage .materialPeriodSummary{display:none!important}

/* summary cards like the reference, compact */
#inventoryPage .monthlyStats,
#inventoryPage .toolsStats{
  display:grid!important;
  grid-template-columns:repeat(4,minmax(0,1fr))!important;
  gap:8px!important;
  margin:0 0 11px!important;
}
#inventoryPage .toolsStats{grid-template-columns:repeat(3,minmax(0,1fr))!important}
#inventoryPage .monthlyStats article,
#inventoryPage .toolsStats article{
  min-height:67px!important;
  display:block!important;
  padding:10px 12px!important;
  border:1px solid rgba(145,190,210,.10)!important;
  border-radius:9px!important;
  background:#193a58!important;
  box-shadow:none!important;
}
#inventoryPage .monthlyStats article:before{display:none!important}
#inventoryPage .monthlyStats .invStatIcon,
#inventoryPage .toolsStats .invStatIcon{display:none!important}
#inventoryPage .monthlyStats small,
#inventoryPage .toolsStats small{
  color:#91aebd!important;
  font-size:6px!important;
  letter-spacing:.25px!important;
}
#inventoryPage .monthlyStats b,
#inventoryPage .toolsStats b{
  margin:4px 0 0!important;
  color:#fff!important;
  font-size:19px!important;
  line-height:1!important;
}
#inventoryPage .monthlyStats article:nth-child(1) b{color:#46d3a1!important}
#inventoryPage .monthlyStats article:nth-child(2) b{color:#ff806d!important}
#inventoryPage .monthlyStats article:nth-child(4) b{color:#ffc03e!important}
#inventoryPage .monthlyStats em,
#inventoryPage .toolsStats em{
  display:block!important;
  margin-top:3px!important;
  color:#708fa1!important;
  font-size:5.8px!important;
}

/* suggestions become subtle helper chips */
#inventoryPage .inventoryExamples{
  margin:0 0 10px!important;
  padding:0!important;
}
#inventoryPage .inventoryExamples>span{color:#829dad!important;font-size:6.4px!important}
#inventoryPage .inventoryExamples button{
  height:25px!important;
  border:1px solid rgba(138,184,204,.13)!important;
  background:#16334e!important;
  color:#9eb6c4!important;
  font-size:6.3px!important;
}
#inventoryPage .inventoryExamples button:hover{
  border-color:rgba(67,200,210,.34)!important;
  background:#1a405d!important;
  color:#e2f2f5!important;
}

/* white data surface inside navy panel */
#inventoryPage .inventoryTableCard{
  overflow:hidden!important;
  margin:0 0 11px!important;
  border:0!important;
  border-radius:11px!important;
  background:#fff!important;
  box-shadow:0 9px 25px rgba(4,20,33,.18)!important;
}
#inventoryPage .inventoryTableHint{
  min-height:38px!important;
  display:flex!important;
  align-items:center!important;
  justify-content:space-between!important;
  padding:0 12px!important;
  border-bottom:1px solid #e4eaee!important;
  background:#f7f9fa!important;
}
#inventoryPage .inventoryTableHint>span{
  color:#718694!important;
  font-size:6px!important;
  font-weight:820!important;
  letter-spacing:.9px!important;
}
#inventoryPage .inventoryTableHint>b{
  height:23px!important;
  display:inline-flex!important;
  align-items:center!important;
  padding:0 8px!important;
  border:0!important;
  border-radius:999px!important;
  background:#e9f7f8!important;
  color:#17778a!important;
  font-size:6.5px!important;
}
#inventoryPage .materialMonthlyTable{
  width:100%!important;
  min-width:780px!important;
  table-layout:auto!important;
}
#inventoryPage .materialMonthlyTable th,
#inventoryPage .toolsTable th{
  height:40px!important;
  padding:0 10px!important;
  border-bottom:1px solid #e0e5e9!important;
  background:#f1f3f5!important;
  color:#243b4a!important;
  font-size:7.1px!important;
  font-weight:800!important;
  text-transform:none!important;
  letter-spacing:0!important;
}
#inventoryPage .materialMonthlyTable td,
#inventoryPage .toolsTable td{
  height:48px!important;
  padding:7px 10px!important;
  border-bottom:1px solid #e8edf0!important;
  background:#fff!important;
  color:#2c4556!important;
  font-size:8px!important;
}
#inventoryPage .materialMonthlyTable tbody tr:hover td,
#inventoryPage .toolsTable tbody tr:hover td{background:#fbfcfd!important}
#inventoryPage .materialNameCell{min-width:205px!important}
#inventoryPage .materialNameCell b,
#inventoryPage .toolNameCell b{
  color:#153a54!important;
  font-size:8.3px!important;
  font-weight:730!important;
}
#inventoryPage .materialNameCell small,
#inventoryPage .toolNameCell small{
  color:#9ba8b0!important;
  font-size:5.8px!important;
}
#inventoryPage .materialMonthlyTable .inText{color:#1f9568!important;font-weight:850!important}
#inventoryPage .materialMonthlyTable .outText{color:#d3655a!important;font-weight:850!important}
#inventoryPage .stockFinal{
  min-width:38px!important;
  height:25px!important;
  border-radius:7px!important;
  background:#eaf5f8!important;
  color:#205d77!important;
}
#inventoryPage .stockFinal.low{
  background:#fff0df!important;
  color:#bd6e20!important;
}

/* tools table — align with the first reference */
#inventoryPage #inventoryToolsPane .inventoryTableCard{margin-top:10px!important}
#inventoryPage .toolsTable{min-width:850px!important}
#inventoryPage .toolNameCell{min-width:210px!important}
#inventoryPage .toolNameCell>span.toolMiniIcon{
  width:25px!important;height:25px!important;
  margin-right:7px!important;
  border-radius:7px!important;
  background:#e8f7f8!important;
  color:#118392!important;
}
#inventoryPage .toolMiniIcon svg{width:13px!important;height:13px!important}
#inventoryPage .toolCondition{
  padding:4px 8px!important;
  border-radius:999px!important;
  font-size:6.4px!important;
}
#inventoryPage .toolCondition.good{background:#dcf7e6!important;color:#207b51!important}
#inventoryPage .toolCondition.warn{background:#fff0d3!important;color:#94631e!important}
#inventoryPage .toolCondition.bad{background:#ffe1e1!important;color:#b54e55!important}

/* compact icon actions */
#inventoryPage .invRowActions.compact{gap:4px!important}
#inventoryPage .invRowActions.compact button,
#inventoryPage .miniDanger{
  width:28px!important;height:28px!important;
  border:0!important;
  border-radius:7px!important;
  background:#f4f7f9!important;
  color:#527184!important;
}
#inventoryPage .invRowActions.compact button.move{
  background:#eaf7f8!important;
  color:#168292!important;
}
#inventoryPage .invRowActions.compact button.danger,
#inventoryPage .miniDanger{
  background:#fff3f3!important;
  color:#b75b60!important;
}
#inventoryPage .invRowActions.compact svg,
#inventoryPage .miniDanger svg{
  width:13px!important;height:13px!important;
}

/* history remains visually secondary */
#inventoryPage .transactionCard{
  margin-top:10px!important;
  box-shadow:0 7px 20px rgba(4,20,33,.11)!important;
}
#inventoryPage .transactionCard .inventorySectionHead{
  min-height:53px!important;
  padding:10px 12px!important;
  background:#f7f9fa!important;
}
#inventoryPage .transactionCard .inventoryKicker{color:#8396a2!important}
#inventoryPage .transactionCard h3{font-size:10.5px!important}
#inventoryPage .transactionCard p{font-size:6.6px!important}

/* empty messages remain readable inside white table cards */
#inventoryPage .inventoryEmpty{
  background:#fff!important;
  color:#8899a4!important;
  font-size:7.5px!important;
}

/* inventory modals use the same quiet enterprise styling */
.inventoryModalCard{
  border:1px solid #dce5ea!important;
  box-shadow:0 26px 70px rgba(8,31,48,.26)!important;
}
.inventoryModalHead{
  background:linear-gradient(180deg,#fff,#f8fafb)!important;
}
.inventoryModalHead>span{color:#8f6d59!important}
.inventoryForm input,.inventoryForm select{
  border-color:#dbe4e9!important;
  background:#f9fbfc!important;
}
.inventoryForm .inventoryPrimary{
  background:linear-gradient(135deg,#173f5d,#17617a)!important;
  color:#fff!important;
}

/* responsive */
@media(max-width:1100px){
  #inventoryPage #materialMonthTabs{
    grid-template-columns:repeat(6,minmax(0,1fr))!important;
  }
  #inventoryPage .monthlyStats,
  #inventoryPage .toolsStats{
    grid-template-columns:1fr 1fr!important;
  }
}
@media(max-width:760px){
  #inventoryPage.inventoryPage{padding:9px 8px 24px!important}
  #inventoryPage .inventoryControlBar{
    align-items:stretch!important;
    flex-direction:column!important;
  }
  #inventoryPage .inventoryContext{justify-content:space-between!important}
  #inventoryPage .inventoryWorkspace{padding:11px!important;border-radius:14px!important}
  #inventoryPage .inventoryWorkspace>.inventoryToolbar{
    align-items:flex-start!important;
    flex-direction:column!important;
  }
  #inventoryPage .inventoryWorkspace .inventoryToolbarActions{
    width:100%!important;
    display:grid!important;
    grid-template-columns:1fr 1fr!important;
  }
  #inventoryPage .inventoryWorkspace .inventorySearch{
    width:100%!important;min-width:0!important;grid-column:1/-1!important;
  }
  #inventoryPage #materialMonthTabs{
    grid-template-columns:repeat(4,minmax(0,1fr))!important;
    gap:5px!important;
  }
  #inventoryPage #materialMonthTabs button{height:33px!important}
  #inventoryPage .monthlyStats,
  #inventoryPage .toolsStats{
    grid-template-columns:1fr 1fr!important;
    gap:6px!important;
  }
  #inventoryPage .monthlyStats article,
  #inventoryPage .toolsStats article{min-height:60px!important;padding:8px 9px!important}
  #inventoryPage .monthlyStats b,
  #inventoryPage .toolsStats b{font-size:17px!important}
  #inventoryPage .inventoryExamples{display:none!important}
}

/* =========================================================
   ESTA INVENTORY V5 — LIGHT PROFESSIONAL / COMPACT
   Final visual pass for Materials, Tools and Maintenance
   ========================================================= */
#inventoryPage.inventoryPage,
#maintenancePage.maintenancePage{
  max-width:1600px!important;
  padding:16px 18px 30px!important;
  background:transparent!important;
}

/* top selector */
#inventoryPage .inventoryControlBar{
  min-height:56px!important;
  margin:0 0 10px!important;
  padding:8px 10px!important;
  border:1px solid #e0e7eb!important;
  border-radius:12px!important;
  background:#fff!important;
  box-shadow:0 4px 14px rgba(22,55,77,.03)!important;
}
#inventoryPage .inventoryControlBar .inventoryTabs{
  margin:0!important;
  padding:3px!important;
  border:1px solid #e1e8ec!important;
  border-radius:9px!important;
  background:#f3f6f8!important;
}
#inventoryPage .inventoryControlBar .inventoryTabs button{
  height:34px!important;
  padding:0 13px!important;
  border:0!important;
  border-radius:7px!important;
  background:transparent!important;
  color:#617989!important;
  font-size:8.2px!important;
  font-weight:720!important;
}
#inventoryPage .inventoryControlBar .inventoryTabs button.active{
  background:#123b58!important;
  color:#fff!important;
  box-shadow:0 4px 10px rgba(18,59,88,.13)!important;
}
#inventoryPage .inventoryControlBar .inventoryTabs button.active svg{color:#55d0df!important}
#inventoryPage .inventoryContextProject,
#inventoryPage .inventoryYearControl{
  min-height:34px!important;
  padding:0 10px!important;
  border:1px solid #e3e9ed!important;
  border-radius:8px!important;
  background:#fafcfd!important;
}
#inventoryPage .inventoryContext small{font-size:5.6px!important;color:#95a4ad!important}
#inventoryPage .inventoryContext b,
#inventoryPage .inventoryContext select{font-size:7.4px!important;color:#3e5d70!important}

/* white work surface — no full-page dark block */
#inventoryPage .inventoryWorkspace{
  padding:0!important;
  border:1px solid #dfe7ec!important;
  border-radius:15px!important;
  background:#fff!important;
  box-shadow:0 8px 24px rgba(18,53,77,.045)!important;
  overflow:hidden!important;
}

/* section header */
#inventoryPage .inventoryWorkspace>.inventoryToolbar{
  min-height:70px!important;
  padding:13px 15px!important;
  border:0!important;
  border-bottom:1px solid #e9eef1!important;
  border-radius:0!important;
  background:linear-gradient(180deg,#fff,#fbfcfd)!important;
  box-shadow:none!important;
}
#inventoryPage .inventoryWorkspace .inventoryKicker{
  color:#9a7660!important;
  font-size:6px!important;
  letter-spacing:1.35px!important;
}
#inventoryPage .inventoryWorkspace .inventoryToolbar h2{
  margin:4px 0 2px!important;
  color:#173e59!important;
  font-size:14px!important;
  font-weight:780!important;
}
#inventoryPage .inventoryWorkspace .inventoryToolbar h2 span{
  color:#8d9da7!important;
  font-size:8.5px!important;
  font-weight:600!important;
}
#inventoryPage .inventoryWorkspace .inventoryToolbar p{
  color:#8597a2!important;
  font-size:7.4px!important;
}
#inventoryPage .inventoryWorkspace .inventorySearch{
  width:205px!important;
  min-width:205px!important;
  height:35px!important;
  border:1px solid #dce5ea!important;
  border-radius:8px!important;
  background:#f8fafb!important;
}
#inventoryPage .inventoryWorkspace .inventorySearch svg{stroke:#8095a2!important}
#inventoryPage .inventoryWorkspace .inventorySearch input{color:#36586c!important}
#inventoryPage .inventoryWorkspace .inventorySearch input::placeholder{color:#9aa8b1!important}
#inventoryPage .inventoryWorkspace .inventorySecondary{
  height:35px!important;
  padding:0 10px!important;
  border:1px solid #dbe4e9!important;
  border-radius:8px!important;
  background:#fff!important;
  color:#496a7e!important;
  box-shadow:none!important;
}
#inventoryPage .inventoryWorkspace .inventoryPrimary{
  height:35px!important;
  padding:0 11px!important;
  border:0!important;
  border-radius:8px!important;
  background:#123f5d!important;
  color:#fff!important;
  font-weight:790!important;
  box-shadow:0 5px 12px rgba(18,63,93,.13)!important;
}

/* month navigation: one compact navy band */
#inventoryPage #materialMonthTabs{
  display:grid!important;
  grid-template-columns:repeat(12,minmax(0,1fr))!important;
  gap:4px!important;
  margin:12px 14px 9px!important;
  padding:5px!important;
  border:1px solid #183e59!important;
  border-radius:10px!important;
  background:#123650!important;
  box-shadow:none!important;
}
#inventoryPage #materialMonthTabs button{
  height:31px!important;
  padding:0!important;
  border:0!important;
  border-radius:6px!important;
  background:transparent!important;
  color:#b9cad5!important;
  font-size:7.3px!important;
  font-weight:720!important;
  box-shadow:none!important;
}
#inventoryPage #materialMonthTabs button:hover{
  background:rgba(255,255,255,.07)!important;
  color:#fff!important;
}
#inventoryPage #materialMonthTabs button.active{
  background:#20b8c8!important;
  color:#073747!important;
  font-weight:850!important;
  box-shadow:none!important;
}
#inventoryPage .materialPeriodSummary{display:none!important}

/* KPI row, compact and white */
#inventoryPage .monthlyStats,
#inventoryPage .toolsStats{
  display:grid!important;
  grid-template-columns:repeat(4,minmax(0,1fr))!important;
  gap:8px!important;
  margin:0 14px 10px!important;
}
#inventoryPage .toolsStats{grid-template-columns:repeat(3,minmax(0,1fr))!important}
#inventoryPage .monthlyStats article,
#inventoryPage .toolsStats article{
  min-height:64px!important;
  display:flex!important;
  align-items:center!important;
  gap:10px!important;
  padding:9px 11px!important;
  border:1px solid #e3e9ed!important;
  border-radius:10px!important;
  background:#fff!important;
  box-shadow:none!important;
}
#inventoryPage .monthlyStats .invStatIcon,
#inventoryPage .toolsStats .invStatIcon{
  width:32px!important;height:32px!important;display:grid!important;place-items:center!important;flex:0 0 32px!important;
  border-radius:9px!important
}
#inventoryPage .monthlyStats .invStatIcon svg,
#inventoryPage .toolsStats .invStatIcon svg{width:15px!important;height:15px!important}
#inventoryPage .monthlyStats small,
#inventoryPage .toolsStats small{
  color:#8797a1!important;
  font-size:5.8px!important;
  letter-spacing:.45px!important;
}
#inventoryPage .monthlyStats b,
#inventoryPage .toolsStats b{
  margin:2px 0 0!important;
  color:#183f59!important;
  font-size:17px!important;
  line-height:1!important;
}
#inventoryPage .monthlyStats em,
#inventoryPage .toolsStats em{
  display:block!important;
  margin-top:2px!important;
  color:#9daab2!important;
  font-size:5.7px!important;
}
#inventoryPage .monthlyStats article:nth-child(1) b{color:#25835e!important}
#inventoryPage .monthlyStats article:nth-child(2) b{color:#c76259!important}
#inventoryPage .monthlyStats article:nth-child(4) b{color:#c8842e!important}

/* quick sample row */
#inventoryPage .inventoryExamples{
  margin:0 14px 10px!important;
  padding:0!important;
}
#inventoryPage .inventoryExamples>span{font-size:6.3px!important;color:#8a9aa4!important}
#inventoryPage .inventoryExamples button{
  height:24px!important;
  padding:0 8px!important;
  border:1px solid #e0e7eb!important;
  background:#fafcfd!important;
  color:#637b8a!important;
  font-size:6.1px!important;
}
#inventoryPage .inventoryExamples button:hover{
  border-color:#b9d8e1!important;
  background:#f1f8fa!important;
  color:#24748b!important;
}

/* data tables */
#inventoryPage .inventoryTableCard{
  margin:0 14px 11px!important;
  overflow:hidden!important;
  border:1px solid #e0e7eb!important;
  border-radius:10px!important;
  background:#fff!important;
  box-shadow:none!important;
}
#inventoryPage .inventoryTableHint{
  min-height:35px!important;
  padding:0 10px!important;
  border-bottom:1px solid #e2e8ec!important;
  background:#f8fafb!important;
}
#inventoryPage .inventoryTableHint>span{
  color:#7b8e9a!important;
  font-size:5.8px!important;
  font-weight:800!important;
  letter-spacing:.75px!important;
}
#inventoryPage .inventoryTableHint>b{
  height:22px!important;
  display:inline-flex!important;align-items:center!important;
  padding:0 7px!important;
  border-radius:999px!important;
  background:#eaf6f8!important;
  color:#19778b!important;
  font-size:6.2px!important;
}
#inventoryPage .materialMonthlyTable,
#inventoryPage .toolsTable{
  width:100%!important;
  min-width:760px!important;
  table-layout:auto!important;
}
#inventoryPage .materialMonthlyTable th,
#inventoryPage .toolsTable th,
#inventoryPage .transactionTable th{
  height:38px!important;
  padding:0 9px!important;
  border-bottom:1px solid #dbe3e8!important;
  background:#173b56!important;
  color:#eaf2f6!important;
  font-size:6.7px!important;
  font-weight:730!important;
  text-transform:none!important;
  letter-spacing:.08px!important;
}
#inventoryPage .materialMonthlyTable td,
#inventoryPage .toolsTable td,
#inventoryPage .transactionTable td{
  height:46px!important;
  padding:7px 9px!important;
  border-bottom:1px solid #edf1f3!important;
  background:#fff!important;
  color:#37566a!important;
  font-size:7.7px!important;
}
#inventoryPage .materialMonthlyTable tbody tr:hover td,
#inventoryPage .toolsTable tbody tr:hover td,
#inventoryPage .transactionTable tbody tr:hover td{background:#f9fbfc!important}
#inventoryPage .materialNameCell{min-width:210px!important}
#inventoryPage .materialNameCell b,
#inventoryPage .toolNameCell b{color:#173e59!important;font-size:8.2px!important}
#inventoryPage .materialNameCell small,
#inventoryPage .toolNameCell small{color:#9aa7af!important;font-size:5.8px!important}
#inventoryPage .materialMonthlyTable .inText{color:#25865e!important;font-weight:800!important}
#inventoryPage .materialMonthlyTable .outText{color:#c66158!important;font-weight:800!important}
#inventoryPage .stockFinal{
  display:inline-flex!important;align-items:center!important;justify-content:center!important;
  min-width:38px!important;height:24px!important;padding:0 6px!important;
  border-radius:7px!important;background:#eaf4f7!important;color:#245f78!important;
  font-size:7.8px!important
}
#inventoryPage .stockFinal.low{background:#fff0df!important;color:#b66f24!important}

/* compact table actions */
#inventoryPage .invRowActions.compact{display:flex!important;justify-content:center!important;gap:4px!important}
#inventoryPage .invRowActions.compact button,
#inventoryPage .miniDanger{
  width:27px!important;height:27px!important;padding:0!important;
  display:grid!important;place-items:center!important;
  border:1px solid #e0e6ea!important;border-radius:7px!important;
  background:#f8fafb!important;color:#557487!important;
  font-size:8px!important
}
#inventoryPage .invRowActions.compact button:first-child{background:#edf8fa!important;color:#1e7f94!important;border-color:#d7edf1!important}
#inventoryPage .invRowActions.compact button.danger,
#inventoryPage .miniDanger{background:#fff6f6!important;color:#b75b60!important;border-color:#f0dddd!important}

/* transaction history is clearly secondary */
#inventoryPage .transactionCard{margin-top:11px!important}
#inventoryPage .transactionCard .inventorySectionHead{
  min-height:52px!important;
  padding:9px 11px!important;
  background:#f8fafb!important;
}
#inventoryPage .transactionCard .inventoryKicker{color:#8b9aa3!important}
#inventoryPage .transactionCard h3{font-size:10.5px!important;color:#284b62!important}
#inventoryPage .transactionCard p{font-size:6.5px!important}

/* tools */
#inventoryPage #inventoryToolsPane .inventoryStats{margin-top:10px!important}
#inventoryPage #inventoryToolsPane .inventoryTableCard{margin-top:10px!important}
#inventoryPage .toolNameCell{
  min-width:210px!important;
  position:relative!important;
  padding-left:38px!important;
}
#inventoryPage .toolNameCell .toolMiniIcon{
  position:absolute!important;left:10px!important;top:50%!important;transform:translateY(-50%)!important;
  width:21px!important;height:21px!important;display:grid!important;place-items:center!important;
  border-radius:6px!important;background:#e9f6f8!important;color:#188092!important;font-size:9px!important
}
#inventoryPage .toolCondition{
  padding:4px 7px!important;border-radius:999px!important;font-size:6.2px!important;font-weight:740!important
}
#inventoryPage .toolCondition.good{background:#e8f7ef!important;color:#287b58!important}
#inventoryPage .toolCondition.warn{background:#fff4df!important;color:#a36e25!important}
#inventoryPage .toolCondition.bad{background:#ffeded!important;color:#b95459!important}

/* modals */
.inventoryModalCard{
  border-radius:15px!important;
  border:1px solid #dce5ea!important;
  box-shadow:0 25px 68px rgba(10,35,52,.25)!important;
}
.inventoryModalHead{
  padding:17px 18px 13px!important;
  background:linear-gradient(180deg,#fff,#fafcfd)!important
}
.inventoryModalHead h3{font-size:17px!important}
.inventoryForm{padding:14px 18px 18px!important;gap:9px!important}
.inventoryForm input,.inventoryForm select{height:38px!important;border-radius:8px!important}
.inventoryForm .inventoryPrimary{background:#123f5d!important;color:#fff!important}

/* maintenance visual alignment */
#maintenancePage .maintenanceHero{
  min-height:112px!important;
  margin-bottom:10px!important;
  padding:19px 22px!important;
  border:1px solid #dfe7ec!important;
  border-radius:15px!important;
  background:linear-gradient(135deg,#fff,#f8fbfc)!important;
  box-shadow:0 7px 22px rgba(20,55,80,.04)!important
}
#maintenancePage .maintenanceHero h1{font-size:22px!important}
#maintenancePage .maintenanceHero p{font-size:8.5px!important}
#maintenancePage .maintenanceStats{
  grid-template-columns:repeat(4,minmax(0,1fr))!important;
  gap:8px!important;
  margin:0 0 10px!important
}
#maintenancePage .maintenanceStats article{
  min-height:70px!important;
  padding:10px 11px!important;
  border-radius:10px!important;
  box-shadow:none!important
}
#maintenancePage .maintStatIcon{width:34px!important;height:34px!important;flex-basis:34px!important}
#maintenancePage .maintenanceStats b{font-size:18px!important}
#maintenancePage .maintenanceBoard{
  border:1px solid #dfe7ec!important;
  border-radius:14px!important;
  background:#fff!important;
  box-shadow:0 7px 22px rgba(20,55,80,.035)!important
}
#maintenancePage .maintenanceToolbar{
  min-height:68px!important;
  padding:12px 14px!important;
  border-bottom:1px solid #e7edf1!important;
}
#maintenancePage .maintenanceAssetGrid{
  grid-template-columns:repeat(3,minmax(0,1fr))!important;
  gap:8px!important;
  padding:10px!important
}
#maintenancePage .maintenanceAssetCard{
  min-height:195px!important;
  padding:12px!important;
  border-radius:11px!important;
  box-shadow:none!important
}
#maintenancePage .maintenanceAssetCard h3{font-size:12px!important}
#maintenancePage .maintDates{margin:11px 0!important;padding:8px!important}
#maintenancePage .maintCardActions button{height:28px!important}
#maintenancePage .maintenanceHistoryCard{
  margin-top:10px!important;
  border-radius:12px!important;
  box-shadow:none!important
}
#maintenancePage .maintenanceHistoryTable th{
  background:#173b56!important;color:#fff!important
}

@media(max-width:1100px){
  #inventoryPage #materialMonthTabs{grid-template-columns:repeat(6,minmax(0,1fr))!important}
  #inventoryPage .monthlyStats,#inventoryPage .toolsStats{grid-template-columns:1fr 1fr!important}
  #maintenancePage .maintenanceStats{grid-template-columns:1fr 1fr!important}
  #maintenancePage .maintenanceAssetGrid{grid-template-columns:1fr 1fr!important}
}
@media(max-width:760px){
  #inventoryPage.inventoryPage,#maintenancePage.maintenancePage{padding:9px 8px 24px!important}
  #inventoryPage .inventoryControlBar{align-items:stretch!important;flex-direction:column!important}
  #inventoryPage .inventoryContext{justify-content:space-between!important}
  #inventoryPage .inventoryWorkspace>.inventoryToolbar{align-items:flex-start!important;flex-direction:column!important}
  #inventoryPage .inventoryWorkspace .inventoryToolbarActions{
    width:100%!important;display:grid!important;grid-template-columns:1fr 1fr!important
  }
  #inventoryPage .inventoryWorkspace .inventorySearch{grid-column:1/-1!important;width:100%!important;min-width:0!important}
  #inventoryPage #materialMonthTabs{grid-template-columns:repeat(4,minmax(0,1fr))!important;margin:10px!important}
  #inventoryPage .monthlyStats,#inventoryPage .toolsStats{grid-template-columns:1fr 1fr!important;margin:0 10px 9px!important}
  #inventoryPage .inventoryExamples{display:none!important}
  #inventoryPage .inventoryTableCard{margin-left:10px!important;margin-right:10px!important}
  #maintenancePage .maintenanceHero{display:block!important}
  #maintenancePage .maintenanceHeroActions{margin-top:12px!important}
  #maintenancePage .maintenanceStats{grid-template-columns:1fr 1fr!important}
  #maintenancePage .maintenanceAssetGrid{grid-template-columns:1fr!important}
}

#maintenancePage #maintenanceSystemFilter,
#maintenancePage #maintenanceDueFilter{
  height:35px!important;
  padding:0 9px!important;
  border:1px solid #dbe4e9!important;
  border-radius:8px!important;
  background:#fff!important;
  color:#4d697b!important;
  font-size:7.6px!important;
  outline:0!important;
}
#maintenancePage #maintenanceSystemFilter:focus,
#maintenancePage #maintenanceDueFilter:focus{
  border-color:#8ec8d5!important;
  box-shadow:0 0 0 3px rgba(65,158,181,.07)!important;
}

/* Maintenance 12-month planner */
#maintenancePage .maintenanceSchedule{
  margin:0 0 10px!important;
  overflow:hidden!important;
  border:1px solid #dfe7ec!important;
  border-radius:13px!important;
  background:#fff!important;
  box-shadow:0 6px 20px rgba(20,55,80,.03)!important;
}
#maintenancePage .maintenanceScheduleHead{
  min-height:52px!important;
  display:flex!important;
  align-items:center!important;
  justify-content:space-between!important;
  gap:12px!important;
  padding:9px 12px!important;
  border-bottom:1px solid #e8eef1!important;
}
#maintenancePage .maintenanceScheduleHead h2{
  margin:3px 0 0!important;
  color:#21445d!important;
  font-size:11px!important;
}
#maintenancePage #maintenanceMonthClear{
  height:29px!important;
  padding:0 9px!important;
  border:1px solid #dce5ea!important;
  border-radius:7px!important;
  background:#fff!important;
  color:#577385!important;
  font-size:6.8px!important;
  font-weight:700!important;
}
#maintenancePage .maintenanceMonthStrip{
  display:grid!important;
  grid-template-columns:repeat(12,minmax(0,1fr))!important;
  gap:5px!important;
  padding:9px!important;
}
#maintenancePage .maintenanceMonthStrip button{
  min-height:45px!important;
  display:flex!important;
  flex-direction:column!important;
  align-items:center!important;
  justify-content:center!important;
  gap:3px!important;
  border:1px solid #e0e7eb!important;
  border-radius:8px!important;
  background:#f9fbfc!important;
  color:#637b8a!important;
}
#maintenancePage .maintenanceMonthStrip button span{
  font-size:6.2px!important;
  font-weight:760!important;
}
#maintenancePage .maintenanceMonthStrip button b{
  color:#244f69!important;
  font-size:11px!important;
}
#maintenancePage .maintenanceMonthStrip button:hover{
  border-color:#b9d7e0!important;
  background:#f2f8fa!important;
}
#maintenancePage .maintenanceMonthStrip button.active{
  border-color:#173f5d!important;
  background:#173f5d!important;
  color:#dceaf1!important;
}
#maintenancePage .maintenanceMonthStrip button.active b{color:#5dd5e2!important}

@media(max-width:1100px){
  #maintenancePage .maintenanceMonthStrip{grid-template-columns:repeat(6,minmax(0,1fr))!important}
}
@media(max-width:760px){
  #maintenancePage .maintenanceMonthStrip{grid-template-columns:repeat(4,minmax(0,1fr))!important}
}

/* =========================================================
   ESTA READABILITY V12 — DESKTOP + MOBILE
   Tăng cỡ chữ toàn hệ thống, giữ bố cục gọn và dễ thao tác
   ========================================================= */

/* Global app typography */
#app{
  font-size:14px!important;
  line-height:1.45!important;
}
#app button,
#app input,
#app select,
#app textarea{
  font-family:inherit!important;
}

/* Sidebar + header */
#app .estaNav button{
  min-height:50px!important;
  font-size:15px!important;
  font-weight:650!important;
}
#app .estaNav button svg{width:20px!important;height:20px!important}
.estaNav:before{
  font-size:9px!important;
  letter-spacing:1.8px!important;
}
.estaSidebar .sideBackup button{
  min-height:38px!important;
  font-size:11px!important;
}
.sideUserCard #sideUser b{font-size:12px!important}
.sideUserCard #sideUser small,
#app .sideBottom span{font-size:10px!important}
#app .topModuleTitle h1{
  font-size:20px!important;
  line-height:1.15!important;
}
#app .topModuleTitle p{
  font-size:11px!important;
  line-height:1.35!important;
}
#app .headerSearch input{font-size:13px!important}
#app .account b{font-size:12px!important}
#app .account span{font-size:10px!important}

/* General page headings, labels and controls */
#app .pageHead h1,
#app .proPageHead h1,
#app .inventoryHero h1,
#app .maintenanceHero h1{
  font-size:26px!important;
  line-height:1.15!important;
}
#app .pageHead p,
#app .proPageHead p,
#app .inventoryHero p,
#app .maintenanceHero p{
  font-size:12px!important;
  line-height:1.5!important;
}
#app .pageEyebrow,
#app .inventoryKicker,
#app .inventoryHero>div:first-child>span,
#app .maintenanceHero>div:first-child>span{
  font-size:9px!important;
}
#app label>span,
#app .entryRow label>span,
#app .energyForm label>span,
#app .inventoryForm label>span{
  font-size:11px!important;
  line-height:1.25!important;
}
#app input:not([type="hidden"]),
#app select,
#app textarea{
  font-size:13px!important;
}
#app .inventoryPrimary,
#app .inventorySecondary{
  font-size:11px!important;
  min-height:40px!important;
}
#app .inventorySearch input{
  font-size:12px!important;
}

/* Work module */
#workPage .workEntryHeader h2{font-size:19px!important}
#workPage .workEntryHeader p{font-size:11px!important}
#workPage .workEntryHeader>div:first-child>span{font-size:8px!important}
#workPage #taskForm .workField>span{font-size:10px!important}
#workPage #taskForm input:not([type="hidden"]),
#workPage #taskForm select,
#workPage #taskForm .peopleSelectBtn{
  font-size:11.5px!important;
}
#workPage #taskForm .imageActionBtn,
#workPage #taskForm .workSave,
#workPage #taskForm .workCancel{
  font-size:10.5px!important;
}
#workPage .stats small{font-size:10px!important}
#workPage .stats strong{font-size:27px!important}

/* Energy */
#energyPage .energyTabs button{font-size:11px!important}
#energyPage .energyCardTitle h2{font-size:18px!important}
#energyPage .energyCardTitle p{font-size:10px!important}
#energyPage .energySummaryCards small{font-size:9px!important}
#energyPage .energySummaryCards strong{font-size:21px!important}

/* Standard tables: minimum readable size */
#app .desktopTable th,
#app .premiumTableCard th,
#app .inventoryTableCard th{
  font-size:10px!important;
  line-height:1.25!important;
  letter-spacing:.25px!important;
}
#app .desktopTable td,
#app .premiumTableCard td,
#app .inventoryTableCard td{
  font-size:12px!important;
  line-height:1.45!important;
}
#app .badge,
#app .typeBadge,
#app .toolCondition,
#app .maintResult,
#app .stockType{
  font-size:10px!important;
}

/* Inventory / tools */
#inventoryPage .inventoryWorkspace .inventoryToolbar h2,
#inventoryPage .inventoryToolbar h2,
#maintenancePage .maintenanceToolbar h2{
  font-size:20px!important;
  line-height:1.2!important;
}
#inventoryPage .inventoryWorkspace .inventoryToolbar h2 span,
#inventoryPage .inventoryToolbar h2 span{
  font-size:12px!important;
}
#inventoryPage .inventoryWorkspace .inventoryToolbar p,
#inventoryPage .inventoryToolbar p,
#maintenancePage .maintenanceToolbar p{
  font-size:11px!important;
}
#inventoryPage .inventoryExamples>span{
  font-size:10px!important;
}
#inventoryPage .inventoryExamples button{
  min-height:30px!important;
  font-size:9px!important;
  padding:0 10px!important;
}
#inventoryPage .inventoryStats small,
#maintenancePage .maintenanceStats small{
  font-size:9px!important;
}
#inventoryPage .inventoryStats b,
#maintenancePage .maintenanceStats b{
  font-size:24px!important;
}
#inventoryPage .inventoryStats em,
#maintenancePage .maintenanceStats em{
  font-size:9px!important;
}

/* Fix tool names being obscured */
#inventoryPage .toolNameCell{
  min-width:230px!important;
  padding-left:12px!important;
  position:static!important;
}
#inventoryPage .toolNameCell .toolMiniIcon{
  display:none!important;
}
#inventoryPage .toolNameCell>div{
  display:block!important;
  min-width:0!important;
  width:100%!important;
}
#inventoryPage .toolNameCell b{
  display:block!important;
  color:#173e59!important;
  font-size:13px!important;
  line-height:1.35!important;
  white-space:normal!important;
  overflow:visible!important;
  text-overflow:clip!important;
  word-break:break-word!important;
}
#inventoryPage .toolNameCell small{
  display:block!important;
  margin-top:3px!important;
  font-size:10px!important;
  color:#8a9aa5!important;
}
#inventoryPage .toolsTable td{
  font-size:12px!important;
}
#inventoryPage .toolsTable th{
  font-size:10.5px!important;
}
#inventoryPage .toolsTable td:nth-child(3),
#inventoryPage .toolsTable td:nth-child(5),
#inventoryPage .toolsTable td:nth-child(6){
  white-space:normal!important;
}
#inventoryPage .toolCondition{
  font-size:10px!important;
  padding:6px 9px!important;
}
#inventoryPage .invRowActions.compact button{
  width:34px!important;
  height:34px!important;
}
#inventoryPage .invRowActions.compact button svg{
  width:16px!important;
  height:16px!important;
}

/* Material month interface */
#inventoryPage .materialMonthTabs button{
  min-height:38px!important;
  font-size:11px!important;
  font-weight:750!important;
}
#inventoryPage .materialNameCell{
  min-width:220px!important;
}
#inventoryPage .materialNameCell b{
  font-size:13px!important;
  line-height:1.35!important;
  white-space:normal!important;
}
#inventoryPage .materialNameCell small{
  font-size:10px!important;
}
#inventoryPage .materialMonthlyTable td{
  font-size:12px!important;
}
#inventoryPage .materialMonthlyTable th{
  font-size:10.5px!important;
}
#inventoryPage .stockFinal{
  min-width:48px!important;
  height:30px!important;
  font-size:11px!important;
}
#inventoryPage .inventoryTableHint,
#inventoryPage .inventorySectionHead p{
  font-size:10px!important;
}
#inventoryPage .inventorySectionHead h3{
  font-size:16px!important;
}

/* Maintenance */
#maintenancePage .maintenanceAssetCard h3{
  font-size:16px!important;
}
#maintenancePage .maintenanceAssetCard>p{
  font-size:10px!important;
}
#maintenancePage .maintSystem,
#maintenancePage .maintDue,
#maintenancePage .maintDates small,
#maintenancePage .maintCardMeta{
  font-size:9px!important;
}
#maintenancePage .maintDates b{
  font-size:11px!important;
}
#maintenancePage .maintCardActions button{
  min-height:34px!important;
  font-size:9.5px!important;
}

/* Modal readability */
.inventoryModalHead h3,
.peopleManagerHead h3{
  font-size:20px!important;
}
.inventoryModalHead p,
.peopleManagerHead p{
  font-size:11px!important;
}
.inventoryModalHead>span,
.peopleManagerHead>span{
  font-size:9px!important;
}
.inventoryForm input,
.inventoryForm select{
  min-height:42px!important;
  font-size:12px!important;
}
.peopleOption .peopleName{
  font-size:12px!important;
}
.peopleEditBtn{
  font-size:11px!important;
}

/* Home readability */
.homeEyebrow{font-size:9px!important}
.homeWelcome h1{font-size:30px!important}
.homeWelcome p{font-size:12px!important}
.homeSystemState{font-size:10px!important}
.kpiCard small{font-size:9px!important}
.kpiCard strong{font-size:27px!important}
.kpiCard>div:last-child>span{font-size:9px!important}
.homePanelHead h2{font-size:17px!important}
.homePanelHead p{font-size:10px!important}
.homeTaskLead b{font-size:12px!important}
.homeTaskLead small{font-size:10px!important}
.homeStatus{font-size:9px!important}
.homeEnergyList span{font-size:10px!important}
.homeEnergyList strong{font-size:21px!important}
.quickActions b{font-size:11px!important}
.quickActions small{font-size:9px!important}
.activityRow b{font-size:11px!important}
.activityRow span{font-size:9px!important}

/* Mobile: intentionally larger touch/read sizes */
@media(max-width:760px){
  #app{
    font-size:15px!important;
  }
  #app .topModuleTitle h1{font-size:17px!important}
  #app .topModuleTitle p{font-size:10px!important}
  #app .estaNav button{
    min-height:52px!important;
    font-size:15px!important;
  }

  #app .pageHead h1,
  #app .proPageHead h1,
  #app .inventoryHero h1,
  #app .maintenanceHero h1{
    font-size:22px!important;
  }
  #app .pageHead p,
  #app .proPageHead p,
  #app .inventoryHero p,
  #app .maintenanceHero p{
    font-size:12px!important;
  }

  #app label>span,
  #app .entryRow label>span,
  #app .energyForm label>span,
  #app .inventoryForm label>span{
    font-size:12px!important;
  }
  #app input:not([type="hidden"]),
  #app select,
  #app textarea{
    min-height:46px!important;
    font-size:15px!important;
  }
  #app button{
    font-size:12px!important;
  }

  #workPage #taskForm .workField>span{font-size:12px!important}
  #workPage #taskForm input:not([type="hidden"]),
  #workPage #taskForm select,
  #workPage #taskForm .peopleSelectBtn{
    font-size:14px!important;
  }
  #workPage #taskForm .imageActionBtn,
  #workPage #taskForm .workSave{
    font-size:13px!important;
  }

  #app .mcard h4,
  .mobileCardTop h4{
    font-size:16px!important;
  }
  #app .mcard p,
  #app .mcard small,
  .mobileCardFoot>span{
    font-size:12px!important;
  }

  #inventoryPage .inventoryToolbar h2,
  #maintenancePage .maintenanceToolbar h2{
    font-size:18px!important;
  }
  #inventoryPage .inventoryToolbar p,
  #maintenancePage .maintenanceToolbar p{
    font-size:11px!important;
  }
  #inventoryPage .inventorySearch{
    min-height:44px!important;
  }
  #inventoryPage .inventorySearch input{
    font-size:14px!important;
  }
  #inventoryPage .materialMonthTabs{
    gap:7px!important;
    overflow-x:auto!important;
    flex-wrap:nowrap!important;
    padding-bottom:4px!important;
  }
  #inventoryPage .materialMonthTabs button{
    min-width:58px!important;
    min-height:42px!important;
    font-size:12px!important;
    flex:0 0 auto!important;
  }
  #inventoryPage .inventoryStats article,
  #maintenancePage .maintenanceStats article{
    min-height:94px!important;
  }
  #inventoryPage .inventoryStats small,
  #maintenancePage .maintenanceStats small{
    font-size:10px!important;
  }
  #inventoryPage .inventoryStats b,
  #maintenancePage .maintenanceStats b{
    font-size:22px!important;
  }
  #inventoryPage .inventoryStats em,
  #maintenancePage .maintenanceStats em{
    font-size:9px!important;
  }

  #inventoryPage .toolsTable,
  #inventoryPage .materialMonthlyTable{
    min-width:900px!important;
  }
  #inventoryPage .toolsTable th,
  #inventoryPage .materialMonthlyTable th{
    font-size:11px!important;
  }
  #inventoryPage .toolsTable td,
  #inventoryPage .materialMonthlyTable td{
    font-size:13px!important;
    padding:11px 9px!important;
  }
  #inventoryPage .toolNameCell b,
  #inventoryPage .materialNameCell b{
    font-size:14px!important;
  }
  #inventoryPage .toolCondition,
  #inventoryPage .stockType{
    font-size:11px!important;
  }

  .inventoryForm{
    grid-template-columns:1fr!important;
  }
  .inventoryForm label,
  .inventoryForm label.wide{
    grid-column:1/-1!important;
  }
  .inventoryFormActions{
    display:grid!important;
    grid-template-columns:1fr 1fr!important;
  }
  .inventoryFormActions button{
    min-height:46px!important;
    font-size:13px!important;
  }

  #maintenancePage .maintenanceAssetCard h3{font-size:17px!important}
  #maintenancePage .maintenanceAssetCard>p{font-size:11px!important}
  #maintenancePage .maintDates b{font-size:12px!important}
  #maintenancePage .maintCardActions button{font-size:11px!important}
}

/* Work list typography: large, regular-weight content */
#app #workPage .taskContentCell>b{
  font-size:13.5px!important;
  font-weight:400!important;
  line-height:1.45!important;
}
#app #workPage .proTaskCard .mobileCardTop h4{
  font-size:14px!important;
  font-weight:400!important;
  line-height:1.45!important;
}

/* =========================================================
   ESTA UI TUNING — sidebar smaller + work text regular
   ========================================================= */
#app .estaNav button{
  min-height:46px!important;
  font-size:13px!important;
  font-weight:500!important;
  letter-spacing:0!important;
}
#app .estaNav button.active{
  font-weight:600!important;
}
#app .estaNav button svg{
  width:18px!important;
  height:18px!important;
}
.estaNav:before{
  font-size:7.5px!important;
  letter-spacing:1.5px!important;
}

#app #workPage .taskContentCell .taskTitle{
  display:block!important;
  font-size:13px!important;
  font-weight:400!important;
  line-height:1.45!important;
  color:#183b56!important;
}
#app #workPage .proTaskCard .taskTitle{
  font-size:14px!important;
  font-weight:400!important;
  line-height:1.45!important;
  color:#183b56!important;
}

/* =========================================================
   INVENTORY COLUMN ALIGNMENT — 2026-09-23
   Keep header/body perfectly aligned across material + history tables
   ========================================================= */
#inventoryPage .materialMonthlyTable,
#inventoryPage .transactionTable{
  width:100%!important;
  table-layout:fixed!important;
  border-collapse:collapse!important;
}

/* Material monthly table widths */
#inventoryPage .materialMonthlyTable .col-stt{width:5%!important}
#inventoryPage .materialMonthlyTable .col-name{width:30%!important}
#inventoryPage .materialMonthlyTable .col-unit{width:8%!important}
#inventoryPage .materialMonthlyTable .col-open{width:11%!important}
#inventoryPage .materialMonthlyTable .col-in{width:8%!important}
#inventoryPage .materialMonthlyTable .col-out{width:8%!important}
#inventoryPage .materialMonthlyTable .col-close{width:12%!important}
#inventoryPage .materialMonthlyTable .col-actions{width:18%!important}

#inventoryPage .materialMonthlyTable th,
#inventoryPage .materialMonthlyTable td{
  box-sizing:border-box!important;
  vertical-align:middle!important;
  white-space:nowrap!important;
}
#inventoryPage .materialMonthlyTable th:nth-child(1),
#inventoryPage .materialMonthlyTable td:nth-child(1),
#inventoryPage .materialMonthlyTable th:nth-child(3),
#inventoryPage .materialMonthlyTable td:nth-child(3),
#inventoryPage .materialMonthlyTable th:nth-child(4),
#inventoryPage .materialMonthlyTable td:nth-child(4),
#inventoryPage .materialMonthlyTable th:nth-child(5),
#inventoryPage .materialMonthlyTable td:nth-child(5),
#inventoryPage .materialMonthlyTable th:nth-child(6),
#inventoryPage .materialMonthlyTable td:nth-child(6),
#inventoryPage .materialMonthlyTable th:nth-child(7),
#inventoryPage .materialMonthlyTable td:nth-child(7),
#inventoryPage .materialMonthlyTable th:nth-child(8),
#inventoryPage .materialMonthlyTable td:nth-child(8){
  text-align:center!important;
}
#inventoryPage .materialMonthlyTable th:nth-child(2),
#inventoryPage .materialMonthlyTable td:nth-child(2){
  text-align:left!important;
}
#inventoryPage .materialMonthlyTable .sttCell{
  width:auto!important;
  text-align:center!important;
}
#inventoryPage .materialMonthlyTable .materialNameCell{
  min-width:0!important;
  max-width:none!important;
  overflow:hidden!important;
  padding-left:14px!important;
}
#inventoryPage .materialMonthlyTable .materialNameCell b{
  overflow:hidden!important;
  text-overflow:ellipsis!important;
  white-space:nowrap!important;
}
#inventoryPage .materialMonthlyTable .invRowActions.compact{
  justify-content:center!important;
  width:100%!important;
}

/* Transaction history widths */
#inventoryPage .transactionTable .col-date{width:12%!important}
#inventoryPage .transactionTable .col-material{width:24%!important}
#inventoryPage .transactionTable .col-type{width:10%!important}
#inventoryPage .transactionTable .col-qty{width:10%!important}
#inventoryPage .transactionTable .col-person{width:18%!important}
#inventoryPage .transactionTable .col-note{width:18%!important}
#inventoryPage .transactionTable .col-actions{width:8%!important}

#inventoryPage .transactionTable th,
#inventoryPage .transactionTable td{
  box-sizing:border-box!important;
  vertical-align:middle!important;
  white-space:nowrap!important;
}
#inventoryPage .transactionTable th:nth-child(1),
#inventoryPage .transactionTable td:nth-child(1),
#inventoryPage .transactionTable th:nth-child(3),
#inventoryPage .transactionTable td:nth-child(3),
#inventoryPage .transactionTable th:nth-child(4),
#inventoryPage .transactionTable td:nth-child(4),
#inventoryPage .transactionTable th:nth-child(7),
#inventoryPage .transactionTable td:nth-child(7){
  text-align:center!important;
}
#inventoryPage .transactionTable th:nth-child(2),
#inventoryPage .transactionTable td:nth-child(2),
#inventoryPage .transactionTable th:nth-child(5),
#inventoryPage .transactionTable td:nth-child(5),
#inventoryPage .transactionTable th:nth-child(6),
#inventoryPage .transactionTable td:nth-child(6){
  text-align:left!important;
}
#inventoryPage .transactionTable td:nth-child(2),
#inventoryPage .transactionTable td:nth-child(5),
#inventoryPage .transactionTable td:nth-child(6){
  overflow:hidden!important;
  text-overflow:ellipsis!important;
}
#inventoryPage .transactionTable .miniDanger{
  margin:0 auto!important;
}

/* keep clean alignment on normal desktop widths */
@media(min-width:761px){
  #inventoryPage .materialMonthlyTable,
  #inventoryPage .transactionTable{
    min-width:0!important;
  }
}

/* ===== ESTA STOCK ALERTS ===== */
.stockAlertPanel{
  margin:0 0 12px;
  overflow:hidden;
  border:1px solid #e5e2dc;
  border-radius:15px;
  background:#fff;
  box-shadow:0 7px 24px rgba(20,55,80,.035)
}
.stockAlertHead{
  min-height:72px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:16px;
  padding:14px 16px;
  border-bottom:1px solid #eee9e5;
  background:
    radial-gradient(circle at 94% 0%,rgba(197,93,91,.06),transparent 24%),
    linear-gradient(180deg,#fff,#fdfcfb)
}
.stockAlertTitle{display:flex;align-items:center;gap:11px;min-width:0}
.stockAlertIcon{
  width:38px;height:38px;display:grid;place-items:center;flex:0 0 38px;
  border:1px solid #efd8d6;border-radius:11px;background:#fff4f3;color:#bd615f
}
.stockAlertIcon svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.stockAlertTitle h3{margin:4px 0 2px;color:#1e435d;font-size:13px}
.stockAlertTitle h3 b{
  display:inline-grid;place-items:center;min-width:22px;height:22px;margin-left:5px;padding:0 6px;
  border-radius:999px;background:#fff0ef;color:#b95657;font-size:8px
}
.stockAlertTitle p{margin:0;color:#8496a1;font-size:7.5px}
.stockAlertFilterBtn{
  height:34px;padding:0 10px;border:1px solid #dfe7eb;border-radius:8px;
  background:#fff;color:#587487;font-size:7.5px;font-weight:720
}
.stockAlertFilterBtn.active{border-color:#e5c7c6;background:#fff4f3;color:#af5758}
.stockAlertList{display:grid;gap:0}
.stockAlertItem{
  min-height:66px;
  display:grid;
  grid-template-columns:74px minmax(190px,1.5fr) minmax(105px,.8fr) minmax(105px,.8fr) auto;
  align-items:center;
  gap:12px;
  padding:11px 15px;
  border-bottom:1px solid #eef2f4
}
.stockAlertItem:last-child{border-bottom:0}
.stockAlertItem:hover{background:#fbfcfd}
.stockAlertStatus{
  width:max-content;padding:4px 7px;border-radius:999px;
  font-size:6.2px;font-weight:850;letter-spacing:.45px
}
.stockAlertItem.out .stockAlertStatus{background:#fff0ef;color:#b24f52}
.stockAlertItem.low .stockAlertStatus{background:#fff6e7;color:#9b6a21}
.stockAlertName{min-width:0}
.stockAlertName b{display:block;color:#244a63;font-size:8.8px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.stockAlertName small{display:block;margin-top:3px;color:#95a3ac;font-size:6.5px}
.stockAlertMetric span{display:block;color:#8a9aa4;font-size:6.2px}
.stockAlertMetric b{display:block;margin-top:3px;color:#35566b;font-size:8px}
.stockAlertItem.out .stockAlertMetric:first-of-type b{color:#b64f53}
.stockAlertActions{display:flex;align-items:center;justify-content:flex-end;gap:5px}
.stockAlertActions button{
  height:30px;padding:0 8px;border:1px solid #d6e4e9;border-radius:7px;
  background:#edf7fa;color:#23778f;font-size:6.8px;font-weight:760
}
.stockAlertActions button.ghost{background:#fff;color:#607b8b;border-color:#dfe7eb}
.stockAlertEmpty{
  min-height:65px;display:flex;align-items:center;gap:10px;padding:12px 16px;color:#477460
}
.stockAlertEmpty>span{
  width:30px;height:30px;display:grid;place-items:center;border-radius:50%;
  background:#eaf8f1;color:#2f8a63;font-size:13px;font-weight:800
}
.stockAlertEmpty b{display:block;color:#335d4a;font-size:8.5px}
.stockAlertEmpty small{display:block;margin-top:3px;color:#8a9b93;font-size:6.8px}

@media(max-width:980px){
  .stockAlertItem{
    grid-template-columns:70px minmax(150px,1.3fr) 1fr 1fr;
  }
  .stockAlertActions{grid-column:2/-1;justify-content:flex-start}
}
@media(max-width:760px){
  .stockAlertHead{align-items:flex-start;padding:12px}
  .stockAlertTitle p{display:none}
  .stockAlertItem{
    grid-template-columns:70px minmax(0,1fr);
    gap:8px 10px;padding:12px
  }
  .stockAlertMetric{grid-column:span 1}
  .stockAlertActions{grid-column:1/-1}
  .stockAlertActions button{flex:1;height:34px}
}

/* =========================================================
   INVENTORY HEADER COMPACT — align with global search row
   ========================================================= */
#app .inventoryHeaderControls{display:none}
#app.inventoryMode .inventoryHeaderControls{
  display:flex!important;
  align-items:center!important;
  justify-content:space-between!important;
  gap:10px!important;
  flex:1 1 auto!important;
  min-width:0!important;
  max-width:760px!important;
}
#app.inventoryMode .headerSearch{display:none!important}
#app.inventoryMode .headerTools{
  flex:1 1 auto!important;
  min-width:0!important;
  justify-content:flex-end!important;
}
#app.inventoryMode .inventoryHeaderControls .inventoryTabs{
  display:inline-flex!important;
  align-items:center!important;
  gap:4px!important;
  width:auto!important;
  margin:0!important;
  padding:3px!important;
  border:1px solid #dfe7ec!important;
  border-radius:9px!important;
  background:#f7f9fb!important;
  box-shadow:none!important;
}
#app.inventoryMode .inventoryHeaderControls .inventoryTabs button{
  height:32px!important;
  min-width:auto!important;
  padding:0 10px!important;
  border:0!important;
  border-radius:7px!important;
  background:transparent!important;
  color:#5f7888!important;
  font-size:7.4px!important;
  font-weight:760!important;
  white-space:nowrap!important;
}
#app.inventoryMode .inventoryHeaderControls .inventoryTabs button svg{
  width:13px!important;
  height:13px!important;
  flex:0 0 13px!important;
}
#app.inventoryMode .inventoryHeaderControls .inventoryTabs button.active{
  background:#123b58!important;
  color:#fff!important;
  box-shadow:0 3px 8px rgba(18,59,88,.12)!important;
}
#app.inventoryMode .inventoryHeaderControls .inventoryTabs button.active svg{
  color:#57d2df!important;
}
#app.inventoryMode .inventoryHeaderControls .inventoryContext{
  display:flex!important;
  align-items:center!important;
  gap:6px!important;
  margin-left:auto!important;
}
#app.inventoryMode .inventoryHeaderControls .inventoryContextProject,
#app.inventoryMode .inventoryHeaderControls .inventoryYearControl{
  min-height:32px!important;
  height:32px!important;
  display:flex!important;
  align-items:center!important;
  gap:6px!important;
  padding:0 9px!important;
  border:1px solid #e0e7ec!important;
  border-radius:8px!important;
  background:#fff!important;
  box-shadow:none!important;
}
#app.inventoryMode .inventoryHeaderControls .inventoryContext small{
  margin:0!important;
  color:#9aa8b1!important;
  font-size:5.2px!important;
  line-height:1!important;
  letter-spacing:.8px!important;
}
#app.inventoryMode .inventoryHeaderControls .inventoryContext b{
  color:#3e5d70!important;
  font-size:7.2px!important;
  white-space:nowrap!important;
}
#app.inventoryMode .inventoryHeaderControls .inventoryYearControl select{
  width:auto!important;
  min-width:52px!important;
  height:28px!important;
  margin:0!important;
  padding:0 14px 0 0!important;
  border:0!important;
  background:transparent!important;
  color:#36586f!important;
  font-size:7.4px!important;
  font-weight:760!important;
  outline:0!important;
}
#inventoryPage{
  padding-top:14px!important;
}
#inventoryPage>.inventoryControlBar{display:none!important}

@media(max-width:1180px){
  #app.inventoryMode .inventoryHeaderControls{max-width:none!important}
  #app.inventoryMode .inventoryHeaderControls .inventoryTabs button{
    padding:0 8px!important;
  }
  #app.inventoryMode .inventoryHeaderControls .inventoryContextProject{
    display:none!important;
  }
}
@media(max-width:900px){
  #app.inventoryMode .inventoryHeaderControls{
    gap:5px!important;
  }
  #app.inventoryMode .inventoryHeaderControls .inventoryTabs button span{
    display:none!important;
  }
  #app.inventoryMode .inventoryHeaderControls .inventoryTabs button{
    width:34px!important;
    padding:0!important;
    justify-content:center!important;
  }
}
@media(max-width:760px){
  #app.inventoryMode .inventoryHeaderControls{display:none!important}
}

/* =========================================================
   TOOLS TABLE ALIGNMENT V2 — exact header/body columns
   ========================================================= */
#inventoryPage .toolsTable{
  width:100%!important;
  min-width:0!important;
  table-layout:fixed!important;
  border-collapse:collapse!important;
}
#inventoryPage .toolsTable .tool-col-stt{width:5%!important}
#inventoryPage .toolsTable .tool-col-name{width:26%!important}
#inventoryPage .toolsTable .tool-col-brand{width:13%!important}
#inventoryPage .toolsTable .tool-col-qty{width:9%!important}
#inventoryPage .toolsTable .tool-col-location{width:14%!important}
#inventoryPage .toolsTable .tool-col-status{width:12%!important}
#inventoryPage .toolsTable .tool-col-note{width:14%!important}
#inventoryPage .toolsTable .tool-col-actions{width:7%!important}

#inventoryPage .toolsTable th,
#inventoryPage .toolsTable td{
  box-sizing:border-box!important;
  vertical-align:middle!important;
  padding:11px 12px!important;
  overflow:hidden!important;
  text-overflow:ellipsis!important;
}
#inventoryPage .toolsTable th{
  height:44px!important;
  white-space:nowrap!important;
  line-height:1.2!important;
}
#inventoryPage .toolsTable td{
  min-height:54px!important;
  white-space:nowrap!important;
  line-height:1.35!important;
}
#inventoryPage .toolsTable th:nth-child(1),
#inventoryPage .toolsTable td:nth-child(1),
#inventoryPage .toolsTable th:nth-child(4),
#inventoryPage .toolsTable td:nth-child(4),
#inventoryPage .toolsTable th:nth-child(6),
#inventoryPage .toolsTable td:nth-child(6),
#inventoryPage .toolsTable th:nth-child(8),
#inventoryPage .toolsTable td:nth-child(8){
  text-align:center!important;
}
#inventoryPage .toolsTable th:nth-child(2),
#inventoryPage .toolsTable td:nth-child(2),
#inventoryPage .toolsTable th:nth-child(3),
#inventoryPage .toolsTable td:nth-child(3),
#inventoryPage .toolsTable th:nth-child(5),
#inventoryPage .toolsTable td:nth-child(5),
#inventoryPage .toolsTable th:nth-child(7),
#inventoryPage .toolsTable td:nth-child(7){
  text-align:left!important;
}
#inventoryPage .toolsTable .sttCell{
  width:auto!important;
  text-align:center!important;
}
#inventoryPage .toolsTable .toolNameCell{
  min-width:0!important;
  max-width:none!important;
  width:auto!important;
  padding-left:14px!important;
  position:static!important;
}
#inventoryPage .toolsTable .toolNameCell>div{
  min-width:0!important;
  width:100%!important;
}
#inventoryPage .toolsTable .toolNameCell b{
  display:block!important;
  max-width:100%!important;
  overflow:hidden!important;
  text-overflow:ellipsis!important;
  white-space:nowrap!important;
  font-size:13px!important;
  font-weight:650!important;
  line-height:1.35!important;
}
#inventoryPage .toolsTable .toolNameCell small{
  display:none!important;
}
#inventoryPage .toolsTable .toolNoteCell{
  color:#677f8f!important;
  white-space:nowrap!important;
  overflow:hidden!important;
  text-overflow:ellipsis!important;
}
#inventoryPage .toolsTable .toolCondition{
  display:inline-flex!important;
  align-items:center!important;
  justify-content:center!important;
  min-width:82px!important;
  max-width:100%!important;
  white-space:nowrap!important;
}
#inventoryPage .toolsTable .invRowActions.compact{
  width:100%!important;
  display:flex!important;
  justify-content:center!important;
  align-items:center!important;
  gap:6px!important;
}
#inventoryPage .toolsTable .invRowActions.compact button{
  flex:0 0 34px!important;
  width:34px!important;
  min-width:34px!important;
  height:34px!important;
  padding:0!important;
  display:grid!important;
  place-items:center!important;
}

@media(max-width:1050px){
  #inventoryPage .toolsTable{min-width:980px!important}
}

/* =========================================================
   ESTA GLOBAL TYPOGRAPHY V4 — ONE FONT ONLY
   Toàn bộ giao diện ESTA dùng duy nhất Inter.
   ========================================================= */
:root{
  --esta-font:"Inter";
}

html,
body,
body *,
body *::before,
body *::after,
#login,
#login *,
#app,
#app *,
button,
input,
select,
textarea,
option,
optgroup,
table,
thead,
tbody,
tfoot,
tr,
th,
td,
label,
summary,
details,
strong,
b,
em,
i,
small,
span,
p,
a,
h1,h2,h3,h4,h5,h6,
svg text,
input::placeholder,
textarea::placeholder{
  font-family:"Inter"!important;
}

html,
body{
  font-family:"Inter"!important;
  font-optical-sizing:auto;
  font-synthesis:none;
  -webkit-font-smoothing:antialiased;
  -moz-osx-font-smoothing:grayscale;
  text-rendering:optimizeLegibility;
}

button,
input,
select,
textarea,
option,
optgroup{
  font-family:"Inter"!important;
  font-style:normal!important;
}

em,
i{
  font-style:normal;
}

/* Brand cũng dùng cùng Inter, chỉ khác weight/letter-spacing */
.estaSidebarBrand b,
.lv8Brand strong,
.loginLogo strong,
.lv8Brand small,
.estaSidebarBrand small{
  font-family:"Inter"!important;
}

/* =========================================================
   ESTA UNIFIED HOME V12 — đồng bộ toàn trang
   ========================================================= */
#app .homeDashboard{
  max-width:1580px!important;
  padding:20px 22px 34px!important;
  background:#f4f7fa!important;
}
#app .homeWelcome{
  position:relative!important;
  min-height:142px!important;
  padding:22px 24px!important;
  border:1px solid #dfe7ec!important;
  border-radius:16px!important;
  background:
    radial-gradient(circle at 86% 22%,rgba(25,184,212,.055),transparent 24%),
    linear-gradient(180deg,#ffffff 0%,#fbfcfd 100%)!important;
  color:#183b56!important;
  box-shadow:0 8px 28px rgba(20,55,80,.045)!important;
}
#app .homeWelcome:before{
  content:""!important;
  position:absolute!important;
  inset:0!important;
  pointer-events:none!important;
  background:
    linear-gradient(rgba(30,83,112,.018) 1px,transparent 1px),
    linear-gradient(90deg,rgba(30,83,112,.018) 1px,transparent 1px)!important;
  background-size:32px 32px!important;
  mask-image:linear-gradient(90deg,transparent 0%,rgba(0,0,0,.28) 56%,rgba(0,0,0,.7) 100%)!important;
}
#app .homeWelcomeCopy{
  position:relative!important;
  z-index:2!important;
  max-width:720px!important;
}
#app .homeEyebrow{
  display:block!important;
  margin:0 0 6px!important;
  color:#9a7660!important;
  font-size:6.5px!important;
  line-height:1!important;
  letter-spacing:1.7px!important;
  font-weight:850!important;
}
#app .homeWelcome h1{
  margin:0 0 5px!important;
  color:#183b56!important;
  font-size:27px!important;
  line-height:1.12!important;
  letter-spacing:-.35px!important;
  font-weight:560!important;
}
#app .homeWelcome h1 b{
  color:#173d58!important;
  font-weight:800!important;
}
#app .homeWelcome p{
  margin:0!important;
  color:#718595!important;
  font-size:9.5px!important;
  line-height:1.45!important;
}
#app .homeWelcome p strong{
  color:#36566b!important;
  font-weight:700!important;
}
#app .homeSystemState{
  display:inline-flex!important;
  align-items:center!important;
  gap:7px!important;
  width:auto!important;
  margin:17px 0 0!important;
  padding:7px 10px!important;
  border:1px solid #deebe4!important;
  border-radius:999px!important;
  background:#f4faf6!important;
  color:#557466!important;
  font-size:7.5px!important;
}
#app .homeSystemState i{
  width:7px!important;height:7px!important;
  flex:0 0 7px!important;
  border-radius:50%!important;
  background:#46b986!important;
  box-shadow:0 0 0 3px rgba(70,185,134,.10)!important;
}
#app .homeSystemState small{
  margin-left:8px!important;
  padding-left:9px!important;
  border-left:1px solid #d8e7df!important;
  color:#84968d!important;
  font-size:6.8px!important;
}
#app .homeBlueprint{
  right:20px!important;
  bottom:0!important;
  width:330px!important;
  height:135px!important;
  opacity:.16!important;
  color:#416f86!important;
}
#app .homeBlueprint span{
  right:42px!important;
  top:27px!important;
  color:#9a7660!important;
  font-size:20px!important;
  letter-spacing:5px!important;
  font-weight:800!important;
  opacity:.7!important;
}
#app .homeKpis{
  gap:10px!important;
  margin:12px 0!important;
}
#app .kpiCard{
  min-height:98px!important;
  padding:14px 15px!important;
  gap:12px!important;
  border:1px solid #e0e7ec!important;
  border-radius:14px!important;
  background:#fff!important;
  box-shadow:0 6px 22px rgba(20,55,80,.03)!important;
}
#app .kpiIcon{
  width:40px!important;height:40px!important;flex:0 0 40px!important;
  border-radius:10px!important;
}
#app .kpiCard small{
  color:#81939f!important;
  font-size:6.4px!important;
  letter-spacing:.75px!important;
}
#app .kpiCard strong{
  margin:3px 0 1px!important;
  color:#1b4059!important;
  font-size:23px!important;
  line-height:1!important;
}
#app .kpiCard>div:last-child>span{
  color:#97a5ae!important;
  font-size:6.7px!important;
}
#app .homePanel{
  border:1px solid #e0e7ec!important;
  border-radius:14px!important;
  background:#fff!important;
  box-shadow:0 6px 22px rgba(20,55,80,.03)!important;
}
#app .homePanelHead{
  min-height:66px!important;
  padding:14px 16px!important;
  border-bottom:1px solid #ebf0f3!important;
  background:#fff!important;
  border-radius:14px 14px 0 0!important;
}
#app .panelKicker{
  color:#9a7660!important;
  font-size:6px!important;
  letter-spacing:1.4px!important;
  font-weight:850!important;
}
#app .homePanelHead h2{
  margin:3px 0 0!important;
  color:#1b405a!important;
  font-size:13px!important;
  font-weight:760!important;
}
#app .homePanelHead p{
  margin:3px 0 0!important;
  color:#8798a3!important;
  font-size:7.3px!important;
}
#app .homePanelHead>button{
  height:30px!important;
  padding:0 9px!important;
  border:1px solid #dce5ea!important;
  border-radius:8px!important;
  background:#fff!important;
  color:#587487!important;
  font-size:7.3px!important;
  font-weight:700!important;
}
#app .homeMainGrid,
#app .homeBottomGrid{
  gap:12px!important;
  margin-top:12px!important;
}
#app .homeEnergyList,
#app .homeRecentTasks,
#app .quickActions,
#app .homeActivity{
  background:#fff!important;
}
#app .homeEnergyList article{
  min-height:68px!important;
  padding:9px 3px!important;
}
#app .energyMiniIcon{
  width:38px!important;height:38px!important;flex:0 0 38px!important;
  border-radius:10px!important;
}
#app .quickActions{
  gap:8px!important;
  padding:10px!important;
}
#app .quickActions>button{
  min-height:61px!important;
  padding:9px 10px!important;
  border:1px solid #e4eaee!important;
  border-radius:10px!important;
  background:#fbfcfd!important;
}
#app .activityRow{
  min-height:52px!important;
}
@media(max-width:760px){
  #app .homeDashboard{padding:12px 10px 24px!important}
  #app .homeWelcome{
    min-height:150px!important;
    padding:19px 17px!important;
    border-radius:14px!important;
  }
  #app .homeWelcome h1{font-size:22px!important}
  #app .homeWelcome p{font-size:8.5px!important}
  #app .homeSystemState{
    margin-top:14px!important;
    max-width:100%!important;
    font-size:7px!important;
  }
  #app .homeSystemState small{display:none!important}
  #app .homeBlueprint{width:210px!important;height:120px!important;right:-62px!important;opacity:.10!important}
  #app .homeKpis{gap:8px!important;margin:9px 0!important}
  #app .kpiCard{min-height:88px!important;padding:11px!important}
}

/* =========================================================
   ESTA HOME CLEANUP V12 — warm brand palette, no personal identity
   ========================================================= */
#app.homeMode .homeWelcome{
  min-height:154px!important;
  padding:24px 28px!important;
  border:1px solid #e7ddd5!important;
  border-radius:18px!important;
  background:
    radial-gradient(circle at 87% 20%,rgba(154,118,96,.10),transparent 24%),
    linear-gradient(135deg,#fffdfb 0%,#f8f3ef 100%)!important;
  color:#173b56!important;
  box-shadow:0 9px 28px rgba(61,45,36,.045)!important;
}
#app.homeMode .homeWelcome:before{
  background:
    linear-gradient(rgba(154,118,96,.035) 1px,transparent 1px),
    linear-gradient(90deg,rgba(154,118,96,.035) 1px,transparent 1px)!important;
  background-size:30px 30px!important;
  mask-image:linear-gradient(90deg,transparent 0%,rgba(0,0,0,.35) 55%,#000 100%)!important;
}
#app.homeMode .homeEyebrow{
  color:#9a7660!important;
  font-size:7px!important;
  letter-spacing:1.9px!important;
  font-weight:850!important;
}
#app.homeMode .homeWelcome h1{
  margin:8px 0 0!important;
  color:#173b56!important;
  font-size:28px!important;
  font-weight:780!important;
  letter-spacing:-.35px!important;
  text-shadow:none!important;
}
#app.homeMode .homeSystemState{
  width:min(470px,100%)!important;
  margin-top:24px!important;
  padding-top:12px!important;
  border-top:1px solid #eadfd7!important;
  color:#647d8c!important;
}
#app.homeMode .homeSystemState i{
  background:#4bae7c!important;
  box-shadow:0 0 0 4px rgba(75,174,124,.09)!important;
}
#app.homeMode .homeSystemState small{
  color:#8ea0aa!important;
}
#app.homeMode .homeBlueprint{
  color:#a9856f!important;
  opacity:.22!important;
}
#app.homeMode .homeBlueprint span{
  color:rgba(140,104,84,.18)!important;
}
#app.homeMode .kpiCard{
  border-color:#e6e9eb!important;
  box-shadow:0 6px 20px rgba(31,55,71,.03)!important;
}
#app.homeMode .panelKicker{
  color:#9a7660!important;
}
#app.homeMode .homePanel{
  border-color:#e3e8eb!important;
  box-shadow:0 7px 24px rgba(31,55,71,.032)!important;
}
#app.homeMode .homePanelHead>button{
  color:#6c7f89!important;
}
#app.homeMode .homePanelHead>button:hover{
  border-color:#d7c6bb!important;
  color:#8c6854!important;
  background:#fbf7f4!important;
}

/* User identity intentionally hidden from the application chrome. */
#app .headerAvatar,
#app .sideAvatar{
  display:none!important;
}
#app .account{
  min-width:auto!important;
  padding-left:10px!important;
}
#app .account #headerRole{
  display:block!important;
  color:#657c8c!important;
  font-size:8px!important;
  font-weight:700!important;
}
#app .sideUserCard{
  min-width:0!important;
}
#app #sideUser{
  color:#9bb1bf!important;
  font-size:8px!important;
  font-weight:700!important;
  white-space:nowrap!important;
}
@media(max-width:760px){
  #app.homeMode .homeWelcome{
    min-height:138px!important;
    padding:18px 16px!important;
  }
  #app.homeMode .homeWelcome h1{font-size:21px!important}
  #app.homeMode .homeSystemState{margin-top:18px!important}
}

```


---

## FILE: README.md

SHA: 13c8f19829dcdcdaf85aef1dddf53d3a3f520705

```markdown
# Quản lý kỹ thuật - 62 Trần Huy Liệu

Phiên bản V1 của website quản lý kỹ thuật cho dự án **62 Trần Huy Liệu**.

## Phạm vi V1
- Đăng nhập với 2 vai trò: Admin và Kỹ thuật 62 THL.
- Báo cáo công việc hằng ngày.
- Thêm, sửa, xóa công việc.
- Trạng thái công việc và ghi chú.
- Tìm kiếm, lọc ngày và trạng thái.
- Giao diện responsive cho máy tính và điện thoại.

## Lưu ý
V1 dùng tài khoản mẫu và localStorage để thử giao diện. Chưa dùng cho dữ liệu vận hành thật. Bước tiếp theo sẽ chuyển sang Supabase Auth + Database + Storage.

### Tài khoản thử
- Admin: `admin` / `admin123`
- Kỹ thuật: `kythuat62` / `kt62123`

```
