# -*- coding: utf-8 -*-
import io, os, glob
from PIL import Image as PILImage, ImageOps
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas as rl_canvas
from reportlab.platypus import (BaseDocTemplate, Flowable, Frame, HRFlowable,
                                KeepTogether, PageTemplate, Paragraph, Spacer,
                                Table, TableStyle, Image)
from reportlab.lib.utils import ImageReader
from xml.sax.saxutils import escape as xml_escape

from reporting import pdf_common as pdfc

AUB = pdfc.AUB
AUB_D = pdfc.AUB_D
CREAM = pdfc.CREAM
CREAM_L = pdfc.CREAM_L
COPPER = pdfc.COPPER
TAUPE = pdfc.TAUPE
STONE = pdfc.STONE
PALE = pdfc.PALE
PW, PH = pdfc.PW, pdfc.PH
MX, CW = pdfc.MX, pdfc.CW
FOOTER = pdfc.FOOTER
ensure_fonts = pdfc.ensure_fonts
tracked = pdfc.tracked
NumberedCanvas = pdfc.NumberedCanvas

def S(name, **kw):
    base = dict(fontName="Mont", fontSize=8.5, leading=12, textColor=colors.black)
    base.update(kw)
    return ParagraphStyle(name, **base)

ST = {
    "eyebrow": S("eyebrow", fontName="Mont-Bold", fontSize=7.5, textColor=COPPER, leading=10),
    "h1": S("h1", fontName="Mont-Bold", fontSize=19, leading=24, textColor=AUB),
    "lbl": S("lbl", fontName="Mont-Bold", fontSize=6.5, leading=9, textColor=STONE),
    "val": S("val", fontName="Mont-Bold", fontSize=8.5, leading=11, textColor=AUB),
    "th": S("th", fontName="Mont-Bold", fontSize=6.8, leading=9, textColor=PALE),
    "td": S("td", fontSize=8, leading=11),
    "td_b": S("td_b", fontName="Mont-SemiBold", fontSize=8.3, leading=11.5, textColor=AUB),
    "td_s": S("td_s", fontName="Mont-Bold", fontSize=6.8, leading=9, textColor=AUB),
    "note": S("note", fontName="Mont-Light", fontSize=7.6, leading=10.5, textColor=STONE),
    "kpi_n": S("kpi_n", fontName="Mont-XBold", fontSize=24, leading=27, textColor=AUB),
    "kpi_n_d": S("kpi_n_d", fontName="Mont-XBold", fontSize=24, leading=27, textColor=PALE),
    "kpi_l": S("kpi_l", fontName="Mont-Bold", fontSize=6.5, leading=9, textColor=STONE),
    "kpi_l_d": S("kpi_l_d", fontName="Mont-Bold", fontSize=6.5, leading=9, textColor=CREAM),
    "sig": S("sig", fontName="Mont-Bold", fontSize=7, leading=10, textColor=AUB),
    "sig_s": S("sig_s", fontName="Mont-Italic", fontSize=6.8, leading=9, textColor=STONE),
    "card_n": S("card_n", fontName="Mont-XBold", fontSize=15, leading=18, textColor=PALE),
    "card_t": S("card_t", fontName="Mont-Bold", fontSize=11, leading=14, textColor=AUB),
    "sec": S("sec", fontName="Mont-Bold", fontSize=6.8, leading=9, textColor=COPPER),
}

STATUS_STYLE = {
    "Đang thực hiện": (COPPER, COPPER, PALE),
    "Chờ xử lý": (CREAM_L, COPPER, AUB),
    "Hoàn thành": (AUB, AUB, PALE),
}

class Pill(Flowable):
    def __init__(self, text, kind="status", size=6.8, align="LEFT"):
        super().__init__(); self.text,self.kind,self.size=text,kind,size; self.hAlign=align
        self.font="Mont-Bold"; self.w=pdfmetrics.stringWidth(text,self.font,size)+11; self.h=size+7
    def wrap(self,aw,ah): return self.w,self.h
    def draw(self):
        c=self.canv
        if self.kind=="status": fill,line,txt=STATUS_STYLE.get(self.text,(CREAM_L,TAUPE,AUB))
        elif self.text=="Sự cố": fill,line,txt=(AUB,AUB,PALE)
        else: fill,line,txt=(None,TAUPE,STONE)
        c.setLineWidth(.7); c.setStrokeColor(line)
        if fill is not None: c.setFillColor(fill)
        c.roundRect(.4,.4,self.w-.8,self.h-.8,self.h/2-.4,stroke=1,fill=1 if fill is not None else 0)
        c.setFillColor(txt); c.setFont(self.font,self.size)
        c.drawCentredString(self.w/2,self.h/2-self.size*.35,self.text)

def make_page_fns(step_label):
    return pdfc.make_page_fns("BÁO CÁO CÔNG VIỆC KỸ THUẬT", step_label)


def build_doc(path,story_fn,step_label,title):
    ensure_fonts()
    first,later=make_page_fns(step_label)
    doc=BaseDocTemplate(path,pagesize=A4,title=title,author="ESTA Property Management",
        subject="Báo cáo công việc kỹ thuật",creator="ESTA Property Management",leftMargin=MX,rightMargin=MX)
    f1=Frame(MX,21*mm,CW,PH-38*mm-8*mm-21*mm,id="f1",leftPadding=0,rightPadding=0,topPadding=0,bottomPadding=0)
    f2=Frame(MX,21*mm,CW,PH-12*mm-8*mm-21*mm,id="f2",leftPadding=0,rightPadding=0,topPadding=0,bottomPadding=0)
    doc.addPageTemplates([PageTemplate("first",[f1],onPage=first,autoNextPageTemplate="later"),
                          PageTemplate("later",[f2],onPage=later)])
    doc.build(story_fn(),canvasmaker=NumberedCanvas)

def counts(tasks):
    n={"Đang thực hiện":0,"Chờ xử lý":0,"Hoàn thành":0}; n["Sự cố"]=0
    for t in tasks:
        n[t["status"]]=n.get(t["status"],0)+1
        if t.get("type")=="Sự cố": n["Sự cố"]+=1
    return n

def intro(data,eyebrow,title="Danh sách công việc kỹ thuật"):
    P=Paragraph
    meta=Table([
        [P("TÒA NHÀ",ST["lbl"]),P(data["building"],ST["val"]),P("NGÀY BÁO CÁO",ST["lbl"]),P(data["report_date"],ST["val"])],
    ],colWidths=[32*mm,55*mm,28*mm,CW-115*mm])
    meta.setStyle(TableStyle([("VALIGN",(0,0),(-1,-1),"MIDDLE"),("LINEBELOW",(0,0),(-1,-1),.4,TAUPE),
        ("TOPPADDING",(0,0),(-1,-1),3.5),("BOTTOMPADDING",(0,0),(-1,-1),3.5),
        ("LEFTPADDING",(0,0),(-1,-1),0),("RIGHTPADDING",(0,0),(-1,-1),6)]))
    return [P(eyebrow.upper(),ST["eyebrow"]),Spacer(1,3),P(title,ST["h1"]),
            HRFlowable(width="100%",thickness=1.5,color=COPPER,spaceBefore=5,spaceAfter=8),meta,Spacer(1,8)]

def _signed_kt_kst(data):
    P=Paragraph
    name=str(data.get("kt_signer_name") or "").strip()
    path=str(data.get("kt_signature_path") or "").strip()
    if not name:
        raise ValueError("Chưa có họ và tên người ký KT")
    sig=""
    if path and os.path.exists(path):
        iw,ih=ImageReader(path).getSize()
        scale=min((58*mm)/max(iw,1),(18*mm)/max(ih,1))
        sig=Image(path,width=max(1,iw*scale),height=max(1,ih*scale))
        sig.hAlign="CENTER"
    sig_name=S("sig_name",fontName="Mont-Bold",fontSize=8,leading=10,textColor=AUB,alignment=1)
    sig_head=S("sig_head",fontName="Mont-Bold",fontSize=7,leading=10,textColor=AUB,alignment=1)
    t=Table([
        [P("KỸ THUẬT (KT)",sig_head),P("KIỂM SOÁT / GIÁM SÁT (KST)",sig_head)],
        [sig,""],
        [P(name,sig_name),""]
    ],colWidths=[CW/2]*2,rowHeights=[None,20*mm,None])
    t.setStyle(TableStyle([
        ("LINEABOVE",(0,0),(-1,0),1.5,COPPER),
        ("ALIGN",(0,0),(-1,-1),"CENTER"),
        ("VALIGN",(0,0),(-1,-1),"MIDDLE"),
        ("TOPPADDING",(0,0),(-1,0),7),
        ("BOTTOMPADDING",(0,0),(-1,-1),1),
        ("LEFTPADDING",(0,0),(-1,-1),4),
        ("RIGHTPADDING",(0,0),(-1,-1),4),
        ("LINEBELOW",(0,2),(-1,2),.4,TAUPE)
    ]))
    return KeepTogether([Spacer(1,8),t])

def signatures(data):
    return _signed_kt_kst(data)

def story_summary(data,sign=True,pointer=False):
    P=Paragraph; tasks=data["tasks"]; n=counts(tasks); story=intro(data,"Phần 1  ·  Báo cáo tổng hợp")
    def kpi(num,label,dark=False):
        return [P(str(num),ST["kpi_n_d" if dark else "kpi_n"]),P(label,ST["kpi_l_d" if dark else "kpi_l"])]
    gap=2.5*mm; kw=(CW-4*gap)/5
    items=[(len(tasks),"TỔNG CÔNG VIỆC",True),(n["Đang thực hiện"],"ĐANG THỰC HIỆN",False),
           (n["Chờ xử lý"],"CHỜ XỬ LÝ",False),(n["Hoàn thành"],"HOÀN THÀNH",False),(n["Sự cố"],"SỰ CỐ",False)]
    cells=[]; widths_k=[]
    for i,(num,lab,dark) in enumerate(items):
        if i: cells.append(""); widths_k.append(gap)
        cells.append(kpi(num,lab,dark)); widths_k.append(kw)
    k=Table([cells],colWidths=widths_k)
    ks=[("TOPPADDING",(0,0),(-1,-1),8),("BOTTOMPADDING",(0,0),(-1,-1),8),
        ("LEFTPADDING",(0,0),(-1,-1),8),("RIGHTPADDING",(0,0),(-1,-1),2),
        ("VALIGN",(0,0),(-1,-1),"TOP"),("BACKGROUND",(0,0),(0,0),AUB)]
    for ci in range(2,len(cells),2):
        ks += [("BACKGROUND",(ci,0),(ci,0),CREAM_L),("LINEABOVE",(ci,0),(ci,0),2,COPPER)]
    k.setStyle(TableStyle(ks)); story += [k,Spacer(1,14)]
    story.append(P("DANH SÁCH CÔNG VIỆC  (%d)"%len(tasks),ST["sec"])); story.append(Spacer(1,4))
    head=["STT","NỘI DUNG CÔNG VIỆC","LOẠI","TRẠNG THÁI","NGÀY","NGƯỜI THỰC HIỆN","GHI CHÚ"]
    rows=[[P(h,ST["th"]) for h in head]]
    for i,t in enumerate(tasks,1):
        rows.append([P(f"{i:02d}",ST["td_s"]),P(t["title"],ST["td_b"]),Pill(t["type"],"tag"),
                     Pill(t["status"],"status"),P(t["date"],ST["td"]),
                     P(t.get("assignee") or "—",ST["td_s"]),P(t.get("note") or "—",ST["note"])])
    widths=[7,36,24,31,18,25,33]; widths=[w*mm*CW/(sum(widths)*mm) for w in widths]
    tb=Table(rows,colWidths=widths,repeatRows=1)
    style=[("BACKGROUND",(0,0),(-1,0),AUB),("VALIGN",(0,0),(-1,-1),"MIDDLE"),
        ("TOPPADDING",(0,0),(-1,-1),3.5),("BOTTOMPADDING",(0,0),(-1,-1),3.5),
        ("LEFTPADDING",(0,0),(-1,-1),5),("RIGHTPADDING",(0,0),(-1,-1),4),
        ("LINEBELOW",(0,1),(-1,-1),.4,TAUPE),("LINEBELOW",(0,-1),(-1,-1),1.5,COPPER)]
    for r in range(2,len(rows),2): style.append(("BACKGROUND",(0,r),(-1,r),CREAM_L))
    tb.setStyle(TableStyle(style)); story.append(tb)
    if pointer:
        story += [Spacer(1,10),P("PHẦN 2  ·  CHI TIẾT VÀ HÌNH ẢNH TỪNG CÔNG VIỆC  —  XEM TỪ TRANG 2",ST["sec"])]
    if sign: story.append(signatures(data))
    return story

def _norm_images(t):
    out=[]
    for j,im in enumerate(list(t.get("images") or [])):
        if isinstance(im, pdfc.ProcessedImage):
            im={"prepared":im}
        if not isinstance(im,dict):
            continue
        prepared=im.get("prepared")
        if not prepared:
            continue
        out.append({
            "prepared":prepared,
            "caption":str(im.get("caption") or ("Hình %d"%(j+1)))
        })
    return out


def _card_head_meta(idx,t,inner_w):
    P=Paragraph
    num_w,pill_w=12*mm,34*mm
    head=Table([[P(f"{idx:02d}",ST["card_n"]),P(t["title"],ST["card_t"]),Pill(t["status"],"status",7.0,"RIGHT")]],
        colWidths=[num_w,inner_w-num_w-pill_w,pill_w])
    head.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(0,0),AUB),("BACKGROUND",(1,0),(-1,0),CREAM_L),
        ("VALIGN",(0,0),(-1,-1),"MIDDLE"),("ALIGN",(0,0),(0,0),"CENTER"),("ALIGN",(2,0),(2,0),"RIGHT"),
        ("TOPPADDING",(0,0),(-1,-1),6),("BOTTOMPADDING",(0,0),(-1,-1),6),
        ("LEFTPADDING",(1,0),(1,0),8),("RIGHTPADDING",(2,0),(2,0),8),
        ("LINEBELOW",(0,0),(-1,0),1.3,COPPER)
    ]))
    info_style=S("work_compact_meta",fontName="Mont",fontSize=7.3,leading=10,textColor=STONE)
    meta_text=(
        "<b>Loại:</b> %s  ·  <b>Ngày:</b> %s  ·  <b>Người thực hiện:</b> %s  ·  <b>Ghi chú:</b> %s"
        % tuple(xml_escape(str(v or "—")) for v in (
            t.get("type"),t.get("date"),t.get("assignee"),t.get("note")
        ))
    )
    meta=Table([[P(meta_text,info_style)]],colWidths=[inner_w])
    meta.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(-1,-1),CREAM_L),
        ("LEFTPADDING",(0,0),(-1,-1),8),("RIGHTPADDING",(0,0),(-1,-1),8),
        ("TOPPADDING",(0,0),(-1,-1),5),("BOTTOMPADDING",(0,0),(-1,-1),6),
        ("LINEBELOW",(0,0),(-1,-1),.35,TAUPE)
    ]))
    return head,meta


def _box(rows):
    card=Table([[r] for r in rows],colWidths=[CW])
    card.setStyle(TableStyle([
        ("BOX",(0,0),(-1,-1),.55,TAUPE),
        ("LEFTPADDING",(0,0),(-1,-1),0),("RIGHTPADDING",(0,0),(-1,-1),0),
        ("TOPPADDING",(0,0),(-1,-1),0),("BOTTOMPADDING",(0,0),(-1,-1),0)
    ]))
    return card


def task_card(idx,t,per_row=3):
    inner_w=CW-2
    head,meta=_card_head_meta(idx,t,inner_w)
    imgs=_norm_images(t)
    rows=[head,meta]
    if imgs:
        grid=pdfc.image_grid(
            imgs,
            available_width=inner_w-12,
            cols=3,
            cell_height=pdfc.IMAGE_CELL_HEIGHT,
            gap=pdfc.IMAGE_GAP
        )
        if grid:
            image_holder=Table(
                [[Paragraph("HÌNH ẢNH HIỆN TRƯỜNG",ST["sec"])]]+
                [[g] for g in grid],
                colWidths=[inner_w]
            )
            image_holder.setStyle(TableStyle([
                ("LEFTPADDING",(0,0),(-1,-1),6),("RIGHTPADDING",(0,0),(-1,-1),6),
                ("TOPPADDING",(0,0),(-1,-1),4),("BOTTOMPADDING",(0,0),(-1,-1),4)
            ]))
            rows.append(image_holder)
    return [KeepTogether([_box(rows),Spacer(1,7)])]


def summary_line(tasks):
    n=counts(tasks)
    return "TỔNG %d CÔNG VIỆC  ·  %d ĐANG THỰC HIỆN  ·  %d CHỜ XỬ LÝ  ·  %d HOÀN THÀNH  ·  %d SỰ CỐ"%(
        len(tasks),n["Đang thực hiện"],n["Chờ xử lý"],n["Hoàn thành"],n["Sự cố"])

def story_detail(data,standalone=True):
    tasks=data["tasks"]; P=Paragraph
    story=[Spacer(1,8),P("CHI TIẾT CÔNG VIỆC",ST["sec"]),Spacer(1,5)]
    for i,t in enumerate(tasks,1):
        story += task_card(i,t,3)
    story.append(signatures(data))
    return story


def story_merged(data):
    # Summary and detail flow continuously. No forced "Phần 2" page.
    return story_summary(data,sign=False,pointer=False)+story_detail(data,standalone=False)


# ===== ENERGY REPORT — ESTA STANDARD =====
def energy_signatures(data):
    return _signed_kt_kst(data)

def make_energy_page_fns(report_title, period_label):
    return pdfc.make_page_fns(report_title, period_label)


def build_energy_doc(path,data):
    ensure_fonts()
    report_title="BÁO CÁO "+str(data.get("energy_name") or "NĂNG LƯỢNG").upper()
    first,later=make_energy_page_fns(report_title,data.get("period_label") or "")
    doc=BaseDocTemplate(path,pagesize=A4,title=report_title,
        author="ESTA Property Management",subject="Báo cáo năng lượng",
        creator="ESTA Property Management",leftMargin=MX,rightMargin=MX)
    f1=Frame(MX,21*mm,CW,PH-38*mm-8*mm-21*mm,id="ef1",
             leftPadding=0,rightPadding=0,topPadding=0,bottomPadding=0)
    f2=Frame(MX,21*mm,CW,PH-12*mm-8*mm-21*mm,id="ef2",
             leftPadding=0,rightPadding=0,topPadding=0,bottomPadding=0)
    doc.addPageTemplates([
        PageTemplate("first",[f1],onPage=first,autoNextPageTemplate="later"),
        PageTemplate("later",[f2],onPage=later)
    ])
    doc.build(story_energy(data),canvasmaker=NumberedCanvas)

def _energy_num(v):
    try:
        n=float(v)
        if abs(n-round(n)) < 1e-9:
            return f"{int(round(n)):,}".replace(",",".")
        return f"{n:,.2f}".replace(",","X").replace(".",",").replace("X",".").rstrip("0").rstrip(",")
    except Exception:
        return "—"

def story_energy(data):
    P=Paragraph
    rows=data.get("rows") or []
    unit=str(data.get("unit") or "")
    energy_name=str(data.get("energy_name") or "Năng lượng")
    period_label=str(data.get("period_label") or "THEO BỘ LỌC")
    dual=bool(data.get("dual_meter"))
    meter1=str(data.get("meter1_label") or "EVN1")
    meter2=str(data.get("meter2_label") or "EVN2")

    first_value=rows[0].get("value") if rows else None
    last_value=rows[-1].get("value") if rows else None
    usable=[r.get("diff") for r in rows if isinstance(r.get("diff"),(int,float)) and r.get("diff") >= 0]
    total=sum(usable) if usable else None

    if dual:
        usable2=[r.get("diff2") for r in rows if isinstance(r.get("diff2"),(int,float)) and r.get("diff2") >= 0]
        total2=sum(usable2) if usable2 else None
        total_all=(total or 0)+(total2 or 0) if (total is not None or total2 is not None) else None
    else:
        total2=None
        total_all=total

    story=[
        P("PHẦN 1  ·  BÁO CÁO NĂNG LƯỢNG",ST["eyebrow"]),Spacer(1,3),
        P("Báo cáo "+energy_name.lower(),ST["h1"]),
        HRFlowable(width="100%",thickness=1.5,color=COPPER,spaceBefore=5,spaceAfter=8)
    ]

    meta=Table([
        [P("TÒA NHÀ",ST["lbl"]),P(str(data.get("building") or "—"),ST["val"]),
         P("NGÀY BÁO CÁO",ST["lbl"]),P(str(data.get("report_date") or "—"),ST["val"])],
        [P("KỲ BÁO CÁO",ST["lbl"]),P(period_label,ST["val"]),
         P("ĐƠN VỊ",ST["lbl"]),P(unit or "—",ST["val"])]
    ],colWidths=[28*mm,59*mm,28*mm,CW-115*mm])
    meta.setStyle(TableStyle([
        ("VALIGN",(0,0),(-1,-1),"MIDDLE"),
        ("LINEBELOW",(0,0),(-1,-1),.4,TAUPE),
        ("TOPPADDING",(0,0),(-1,-1),3.5),
        ("BOTTOMPADDING",(0,0),(-1,-1),3.5),
        ("LEFTPADDING",(0,0),(-1,-1),0),
        ("RIGHTPADDING",(0,0),(-1,-1),6)
    ]))
    story += [meta,Spacer(1,10)]

    gap=3*mm; kw=(CW-3*gap)/4
    if dual:
        latest2=rows[-1].get("value2") if rows else None
        vals=[
            (len(rows),"BẢN GHI",True),
            ((_energy_num(last_value)+" / "+_energy_num(latest2)) if rows else "—",meter1+" / "+meter2+" CUỐI KỲ",False),
            ((_energy_num(total)+" / "+_energy_num(total2)) if (total is not None or total2 is not None) else "—","TIÊU THỤ "+meter1+" / "+meter2,False),
            ((_energy_num(total_all)) if total_all is not None else "—","TỔNG TIÊU THỤ",False)
        ]
    else:
        vals=[
            (len(rows),"BẢN GHI",True),
            ((_energy_num(first_value)) if first_value is not None else "—","CHỈ SỐ ĐẦU KỲ",False),
            ((_energy_num(last_value)) if last_value is not None else "—","CHỈ SỐ CUỐI KỲ",False),
            ((_energy_num(total_all)) if total_all is not None else "—","TIÊU THỤ KỲ",False)
        ]

    cells=[]; widths=[]
    for i,(num,label,dark) in enumerate(vals):
        if i: cells.append(""); widths.append(gap)
        nstyle=ST["kpi_n_d" if dark else "kpi_n"]
        lstyle=ST["kpi_l_d" if dark else "kpi_l"]
        cells.append([P(str(num),nstyle),P(label,lstyle)]); widths.append(kw)
    k=Table([cells],colWidths=widths)
    ks=[
        ("TOPPADDING",(0,0),(-1,-1),8),("BOTTOMPADDING",(0,0),(-1,-1),8),
        ("LEFTPADDING",(0,0),(-1,-1),8),("RIGHTPADDING",(0,0),(-1,-1),2),
        ("VALIGN",(0,0),(-1,-1),"TOP"),("BACKGROUND",(0,0),(0,0),AUB)
    ]
    for ci in range(2,len(cells),2):
        ks += [("BACKGROUND",(ci,0),(ci,0),CREAM_L),("LINEABOVE",(ci,0),(ci,0),2,COPPER)]
    k.setStyle(TableStyle(ks))
    story += [k,Spacer(1,14)]

    story += [P("BẢNG THEO DÕI CHỈ SỐ",ST["sec"]),Spacer(1,4)]

    if dual:
        head=["STT","NGÀY",meter1,"TT "+meter1,meter2,"TT "+meter2,"TỔNG TT","NGƯỜI THỰC HIỆN","GHI CHÚ"]
        table_rows=[[P(h,ST["th"]) for h in head]]
        for i,r in enumerate(rows,1):
            d1=r.get("diff"); d2=r.get("diff2"); dt=r.get("total_diff")
            table_rows.append([
                P(f"{i:02d}",ST["td_s"]),
                P(str(r.get("date_display") or r.get("date") or "—"),ST["td"]),
                P(_energy_num(r.get("value")),ST["td_b"]),
                P("—" if d1 is None else (("+" if d1 >= 0 else "")+_energy_num(d1)),ST["td_b"]),
                P(_energy_num(r.get("value2")),ST["td_b"]),
                P("—" if d2 is None else (("+" if d2 >= 0 else "")+_energy_num(d2)),ST["td_b"]),
                P("—" if dt is None else (("+" if dt >= 0 else "")+_energy_num(dt)),ST["td_b"]),
                P(str(r.get("performer") or "—"),ST["td_s"]),
                P(str(r.get("note") or "—"),ST["note"])
            ])
        widths=[7,19,17,16,17,16,18,28,36]
    else:
        head=["STT","NGÀY","CHỈ SỐ","CHÊNH LỆCH","NGƯỜI THỰC HIỆN","GHI CHÚ"]
        table_rows=[[P(h,ST["th"]) for h in head]]
        for i,r in enumerate(rows,1):
            diff=r.get("diff")
            diff_text="—" if diff is None else (("+" if diff >= 0 else "")+_energy_num(diff))
            table_rows.append([
                P(f"{i:02d}",ST["td_s"]),
                P(str(r.get("date_display") or r.get("date") or "—"),ST["td"]),
                P(_energy_num(r.get("value")),ST["td_b"]),
                P(diff_text,ST["td_b"]),
                P(str(r.get("performer") or "—"),ST["td_s"]),
                P(str(r.get("note") or "—"),ST["note"])
            ])
        widths=[9,24,27,25,35,54]

    widths=[w*mm*CW/(sum(widths)*mm) for w in widths]
    tb=Table(table_rows,colWidths=widths,repeatRows=1)
    ts=[
        ("BACKGROUND",(0,0),(-1,0),AUB),
        ("VALIGN",(0,0),(-1,-1),"MIDDLE"),
        ("TOPPADDING",(0,0),(-1,-1),4),
        ("BOTTOMPADDING",(0,0),(-1,-1),4),
        ("LEFTPADDING",(0,0),(-1,-1),4),
        ("RIGHTPADDING",(0,0),(-1,-1),3),
        ("LINEBELOW",(0,1),(-1,-1),.4,TAUPE),
        ("LINEBELOW",(0,-1),(-1,-1),1.5,COPPER)
    ]
    for rr in range(2,len(table_rows),2):
        ts.append(("BACKGROUND",(0,rr),(-1,rr),CREAM_L))
    tb.setStyle(TableStyle(ts))
    story += [tb]

    energy_images=[]
    counter=0
    for r in rows:
        pairs=[]
        if r.get("image_prepared"):
            pairs.append((meter1 if dual else energy_name,r.get("image_prepared"),r.get("value")))
        if dual and r.get("image2_prepared"):
            pairs.append((meter2,r.get("image2_prepared"),r.get("value2")))
        for label,prepared,val in pairs:
            counter+=1
            cap="Hình %d · %s · %s · %s"%(counter,str(r.get("date_display") or r.get("date") or ""),label,_energy_num(val))
            energy_images.append({"prepared":prepared,"caption":cap})
    if energy_images:
        story += [Spacer(1,10),P("HÌNH ẢNH ĐỒNG HỒ",ST["sec"]),Spacer(1,5)]
        for grid_row in pdfc.image_grid(energy_images,CW,cols=3,cell_height=pdfc.IMAGE_CELL_HEIGHT,gap=pdfc.IMAGE_GAP):
            story += [grid_row,Spacer(1,5)]

    story.append(energy_signatures(data))
    return story


# ===== TECHNICAL TOOLS REPORT — ESTA STANDARD =====
def build_tools_doc(path,data):
    ensure_fonts()
    report_title="BÁO CÁO DỤNG CỤ KỸ THUẬT"
    first,later=make_energy_page_fns(report_title,str(data.get("period_label") or "DANH MỤC HIỆN TẠI"))
    doc=BaseDocTemplate(path,pagesize=A4,title=report_title,
        author="ESTA Property Management",subject="Danh mục dụng cụ kỹ thuật",
        creator="ESTA Property Management",leftMargin=MX,rightMargin=MX)
    f1=Frame(MX,21*mm,CW,PH-38*mm-8*mm-21*mm,id="tf1",
             leftPadding=0,rightPadding=0,topPadding=0,bottomPadding=0)
    f2=Frame(MX,21*mm,CW,PH-12*mm-8*mm-21*mm,id="tf2",
             leftPadding=0,rightPadding=0,topPadding=0,bottomPadding=0)
    doc.addPageTemplates([
        PageTemplate("first",[f1],onPage=first,autoNextPageTemplate="later"),
        PageTemplate("later",[f2],onPage=later)
    ])
    doc.build(story_tools(data),canvasmaker=NumberedCanvas)

def story_tools(data):
    P=Paragraph
    tools=data.get("tools") or []
    good_status={"Tốt","Đang sử dụng"}
    repair_status={"Cần kiểm tra","Cần sửa","Hỏng","Hư hỏng"}
    good=sum(1 for t in tools if str(t.get("condition_status") or "") in good_status)
    repair=sum(1 for t in tools if str(t.get("condition_status") or "") in repair_status)
    total_qty=sum(float(t.get("qty") or 0) for t in tools)

    story=[
        P("PHẦN 1  ·  QUẢN LÝ DỤNG CỤ",ST["eyebrow"]),Spacer(1,3),
        P("Danh mục dụng cụ kỹ thuật",ST["h1"]),
        HRFlowable(width="100%",thickness=1.5,color=COPPER,spaceBefore=5,spaceAfter=8)
    ]

    meta=Table([
        [P("TÒA NHÀ",ST["lbl"]),P(str(data.get("building") or "—"),ST["val"]),
         P("NGÀY BÁO CÁO",ST["lbl"]),P(str(data.get("report_date") or "—"),ST["val"])],
        [P("HẠNG MỤC",ST["lbl"]),P("Dụng cụ kỹ thuật",ST["val"]),
         P("KỲ BÁO CÁO",ST["lbl"]),P(str(data.get("period_label") or "Danh mục hiện tại"),ST["val"])]
    ],colWidths=[28*mm,59*mm,28*mm,CW-115*mm])
    meta.setStyle(TableStyle([
        ("VALIGN",(0,0),(-1,-1),"MIDDLE"),
        ("LINEBELOW",(0,0),(-1,-1),.4,TAUPE),
        ("TOPPADDING",(0,0),(-1,-1),3.5),
        ("BOTTOMPADDING",(0,0),(-1,-1),3.5),
        ("LEFTPADDING",(0,0),(-1,-1),0),
        ("RIGHTPADDING",(0,0),(-1,-1),6)
    ]))
    story += [meta,Spacer(1,10)]

    gap=3*mm; kw=(CW-3*gap)/4
    cards=[
        (len(tools),"DANH MỤC",True),
        (_energy_num(total_qty),"TỔNG SỐ LƯỢNG",False),
        (good,"TỐT / ĐANG DÙNG",False),
        (repair,"CẦN KIỂM TRA / SỬA",False)
    ]
    cells=[]; widths=[]
    for i,(num,label,dark) in enumerate(cards):
        if i: cells.append(""); widths.append(gap)
        cells.append([P(str(num),ST["kpi_n_d" if dark else "kpi_n"]),
                      P(label,ST["kpi_l_d" if dark else "kpi_l"])])
        widths.append(kw)
    k=Table([cells],colWidths=widths)
    ks=[
        ("TOPPADDING",(0,0),(-1,-1),8),("BOTTOMPADDING",(0,0),(-1,-1),8),
        ("LEFTPADDING",(0,0),(-1,-1),8),("RIGHTPADDING",(0,0),(-1,-1),2),
        ("VALIGN",(0,0),(-1,-1),"TOP"),("BACKGROUND",(0,0),(0,0),AUB)
    ]
    for ci in range(2,len(cells),2):
        ks += [("BACKGROUND",(ci,0),(ci,0),CREAM_L),("LINEABOVE",(ci,0),(ci,0),2,COPPER)]
    k.setStyle(TableStyle(ks))
    story += [k,Spacer(1,14)]

    story += [P("DANH SÁCH DỤNG CỤ KỸ THUẬT",ST["sec"]),Spacer(1,4)]
    head=["STT","DỤNG CỤ","NHÃN HIỆU","SỐ LƯỢNG","VỊ TRÍ","PHỤ TRÁCH","TÌNH TRẠNG","GHI CHÚ"]
    rows=[[P(h,ST["th"]) for h in head]]
    for i,t in enumerate(tools,1):
        qty=_energy_num(t.get("qty"))
        unit=str(t.get("unit") or "")
        rows.append([
            P(f"{i:02d}",ST["td_s"]),
            P(str(t.get("name") or "—"),ST["td_b"]),
            P(str(t.get("brand") or "—"),ST["td"]),
            P((qty+(" "+unit if unit else "")),ST["td_b"]),
            P(str(t.get("location") or "—"),ST["td"]),
            P(str(t.get("keeper") or "—"),ST["td_s"]),
            P(str(t.get("condition_status") or "—"),ST["td_b"]),
            P(str(t.get("note") or "—"),ST["note"])
        ])
    col=[8,33,20,20,25,27,24,37]
    col=[w*mm*CW/(sum(col)*mm) for w in col]
    tb=Table(rows,colWidths=col,repeatRows=1)
    style=[
        ("BACKGROUND",(0,0),(-1,0),AUB),
        ("VALIGN",(0,0),(-1,-1),"MIDDLE"),
        ("TOPPADDING",(0,0),(-1,-1),4),
        ("BOTTOMPADDING",(0,0),(-1,-1),4),
        ("LEFTPADDING",(0,0),(-1,-1),4),
        ("RIGHTPADDING",(0,0),(-1,-1),3),
        ("LINEBELOW",(0,1),(-1,-1),.4,TAUPE),
        ("LINEBELOW",(0,-1),(-1,-1),1.5,COPPER)
    ]
    for rr in range(2,len(rows),2):
        style.append(("BACKGROUND",(0,rr),(-1,rr),CREAM_L))
    tb.setStyle(TableStyle(style))
    story += [tb,energy_signatures(data)]
    return story


# ===== GENERIC ESTA TABLE REPORT — ONE STANDARD FOR ALL MODULES =====
def _generic_text(value):
    return xml_escape(str(value if value is not None else "—"))

def build_generic_doc(path, data):
    ensure_fonts()
    report_title=str(data.get("title") or "BÁO CÁO KỸ THUẬT").upper()
    period_label=str(data.get("period_label") or "THEO DỮ LIỆU HIỆN TẠI")
    first,later=make_energy_page_fns(report_title,period_label)
    doc=BaseDocTemplate(path,pagesize=A4,title=report_title,
        author="ESTA Property Management",subject=report_title,
        creator="ESTA Property Management",leftMargin=MX,rightMargin=MX)
    f1=Frame(MX,21*mm,CW,PH-38*mm-8*mm-21*mm,id="gf1",
             leftPadding=0,rightPadding=0,topPadding=0,bottomPadding=0)
    f2=Frame(MX,21*mm,CW,PH-12*mm-8*mm-21*mm,id="gf2",
             leftPadding=0,rightPadding=0,topPadding=0,bottomPadding=0)
    doc.addPageTemplates([
        PageTemplate("first",[f1],onPage=first,autoNextPageTemplate="later"),
        PageTemplate("later",[f2],onPage=later)
    ])
    doc.build(story_generic(data),canvasmaker=NumberedCanvas)

def story_generic(data):
    P=Paragraph
    columns=data.get("columns") or []
    rows=data.get("rows") or []
    title=str(data.get("title") or "Báo cáo kỹ thuật")
    section=str(data.get("section_label") or "BÁO CÁO KỸ THUẬT")
    table_label=str(data.get("table_label") or "DANH SÁCH")
    period=str(data.get("period_label") or "Theo dữ liệu hiện tại")
    subtitle=str(data.get("subtitle") or "")
    story=[
        P(_generic_text(section.upper()),ST["eyebrow"]),Spacer(1,3),
        P(_generic_text(title),ST["h1"]),
        HRFlowable(width="100%",thickness=1.5,color=COPPER,spaceBefore=5,spaceAfter=8)
    ]
    meta=Table([
        [P("TÒA NHÀ",ST["lbl"]),P(_generic_text(data.get("building") or "—"),ST["val"]),
         P("NGÀY BÁO CÁO",ST["lbl"]),P(_generic_text(data.get("report_date") or "—"),ST["val"])],
        [P("HẠNG MỤC",ST["lbl"]),P(_generic_text(section),ST["val"]),
         P("KỲ BÁO CÁO",ST["lbl"]),P(_generic_text(period),ST["val"])]
    ],colWidths=[28*mm,59*mm,28*mm,CW-115*mm])
    meta.setStyle(TableStyle([
        ("VALIGN",(0,0),(-1,-1),"MIDDLE"),("LINEBELOW",(0,0),(-1,-1),.4,TAUPE),
        ("TOPPADDING",(0,0),(-1,-1),3.5),("BOTTOMPADDING",(0,0),(-1,-1),3.5),
        ("LEFTPADDING",(0,0),(-1,-1),0),("RIGHTPADDING",(0,0),(-1,-1),6)
    ]))
    story += [meta,Spacer(1,10)]
    if subtitle:
        story += [P(_generic_text(subtitle),ST["note"]),Spacer(1,8)]

    summaries=(data.get("summaries") or [])[:4]
    if summaries:
        gap=3*mm
        kw=(CW-gap*(len(summaries)-1))/max(1,len(summaries))
        cells=[]; widths=[]
        for i,item in enumerate(summaries):
            if i: cells.append(""); widths.append(gap)
            dark=bool(item.get("dark")) or i==0
            cells.append([
                P(_generic_text(item.get("value") if item.get("value") is not None else "—"),
                  ST["kpi_n_d" if dark else "kpi_n"]),
                P(_generic_text(item.get("label") or ""),ST["kpi_l_d" if dark else "kpi_l"])
            ])
            widths.append(kw)
        k=Table([cells],colWidths=widths)
        ks=[
            ("TOPPADDING",(0,0),(-1,-1),8),("BOTTOMPADDING",(0,0),(-1,-1),8),
            ("LEFTPADDING",(0,0),(-1,-1),8),("RIGHTPADDING",(0,0),(-1,-1),2),
            ("VALIGN",(0,0),(-1,-1),"TOP")
        ]
        for ci in range(0,len(cells),2):
            if ci==0: ks.append(("BACKGROUND",(ci,0),(ci,0),AUB))
            else: ks += [("BACKGROUND",(ci,0),(ci,0),CREAM_L),("LINEABOVE",(ci,0),(ci,0),2,COPPER)]
        k.setStyle(TableStyle(ks))
        story += [k,Spacer(1,14)]

    story += [P(_generic_text(table_label.upper()),ST["sec"]),Spacer(1,4)]
    head=[P(_generic_text(c.get("label") or ""),ST["th"]) for c in columns]
    table_rows=[head]
    for row in rows:
        vals=list(row) if isinstance(row,(list,tuple)) else []
        vals=(vals+[""]*len(columns))[:len(columns)]
        table_rows.append([
            P(_generic_text(v),ST["td_b"] if i in (0,1) else ST["td"])
            for i,v in enumerate(vals)
        ])
    if len(table_rows)==1:
        table_rows.append([P("Chưa có dữ liệu",ST["note"])] + [""]*(max(1,len(columns))-1))

    weights=[]
    for c in columns:
        try:
            w=float(c.get("weight") or 1)
        except Exception:
            w=1
        weights.append(max(.2,w))
    if not weights: weights=[1]
    total=sum(weights)
    col_widths=[CW*w/total for w in weights]
    tb=Table(table_rows,colWidths=col_widths,repeatRows=1)
    style=[
        ("BACKGROUND",(0,0),(-1,0),AUB),
        ("VALIGN",(0,0),(-1,-1),"MIDDLE"),
        ("TOPPADDING",(0,0),(-1,-1),4),("BOTTOMPADDING",(0,0),(-1,-1),4),
        ("LEFTPADDING",(0,0),(-1,-1),4),("RIGHTPADDING",(0,0),(-1,-1),3),
        ("LINEBELOW",(0,1),(-1,-1),.4,TAUPE),("LINEBELOW",(0,-1),(-1,-1),1.5,COPPER)
    ]
    if len(columns)>0 and len(table_rows)>1:
        style.append(("SPAN",(0,1),(-1,1))) if len(rows)==0 else None
    for rr in range(2,len(table_rows),2):
        style.append(("BACKGROUND",(0,rr),(-1,rr),CREAM_L))
    tb.setStyle(TableStyle(style))
    story += [tb]
    photos=data.get("photos") or []
    if photos:
        story += [Spacer(1,10),P("HÌNH ẢNH ĐÍNH KÈM",ST["sec"]),Spacer(1,5)]
        for grid_row in pdfc.image_grid(photos,CW,cols=3,cell_height=pdfc.IMAGE_CELL_HEIGHT,gap=pdfc.IMAGE_GAP):
            story += [grid_row,Spacer(1,5)]
    story += [energy_signatures(data)]
    return story

def _prepare_generic_data(payload, token, temp_dir):
    columns=payload.get("columns") or []
    rows=payload.get("rows") or []
    summaries=payload.get("summaries") or []
    if not isinstance(columns,list) or not columns or len(columns)>12:
        raise ValueError("Cột báo cáo không hợp lệ")
    if not isinstance(rows,list) or len(rows)>1500:
        raise ValueError("Dữ liệu báo cáo quá lớn hoặc không hợp lệ")
    clean_columns=[]
    for col in columns:
        if not isinstance(col,dict): col={"label":str(col)}
        clean_columns.append({"label":str(col.get("label") or ""),"weight":col.get("weight") or 1})
    clean_rows=[]
    for row in rows:
        if not isinstance(row,(list,tuple)): continue
        clean_rows.append([str(v if v is not None else "") for v in list(row)[:len(clean_columns)]])
    clean_summaries=[]
    if isinstance(summaries,list):
        for item in summaries[:4]:
            if isinstance(item,dict):
                clean_summaries.append({
                    "value":str(item.get("value") if item.get("value") is not None else "—"),
                    "label":str(item.get("label") or ""),
                    "dark":bool(item.get("dark"))
                })

    raw_photos=payload.get("photos") or []
    photo_items=[]
    if isinstance(raw_photos,list):
        for i,item in enumerate(raw_photos[:180],1):
            if isinstance(item,str):
                item={"ref":item}
            if not isinstance(item,dict):
                continue
            source=str(item.get("ref") or item.get("path") or item.get("url") or "")
            if source:
                photo_items.append({
                    "source":source,
                    "caption":str(item.get("caption") or ("Hình %d"%i)),
                    "id":str(item.get("id") or source)
                })
    prepared_photos,missing=pdfc.prepare_remote_images(photo_items,token,_download_image,source_key="source")

    return {
        "building":str(payload.get("building") or "[CẦN BỔ SUNG]"),
        "report_date":str(payload.get("report_date") or ""),
        "period_label":str(payload.get("period_label") or "THEO DỮ LIỆU HIỆN TẠI"),
        "title":str(payload.get("title") or "BÁO CÁO KỸ THUẬT"),
        "section_label":str(payload.get("section_label") or "BÁO CÁO KỸ THUẬT"),
        "table_label":str(payload.get("table_label") or "DANH SÁCH"),
        "subtitle":str(payload.get("subtitle") or ""),
        "kt_signer_name":str(payload.get("kt_signer_name") or ""),
        "kt_signature_path":str(payload.get("_kt_signature_path") or ""),
        "columns":clean_columns,
        "rows":clean_rows,
        "summaries":clean_summaries,
        "photos":[x for x in prepared_photos if x.get("prepared")],
        "_missing_images":missing
    }


# ===== VERCEL API HANDLER =====
# -*- coding: utf-8 -*-
import base64
import json
import os
import tempfile
import traceback
import urllib.parse
import urllib.request
import urllib.error
from http.server import BaseHTTPRequestHandler


SB_URL = "https://upcjcrycahdfroxggsdz.supabase.co"
SB_KEY = "sb_publishable_WQiZyrTXCeRr6BgfXAtQSg_zX_eUBsa"
MEDIA_BUCKET = "task-images"
OUTPUT_NAME = "ESTA_BaoCao_KyThuat_TongHop_ChiTiet.pdf"

def _prepare_signature(payload, temp_dir):
    name=str(payload.get("kt_signer_name") or "").strip()
    source=str(payload.get("kt_signature_data_url") or "").strip()
    if not name:
        raise ValueError("Chưa có họ và tên người ký KT.")
    payload["kt_signer_name"]=name
    payload["_kt_signature_path"]=""
    if not source:
        return ""
    if not source.startswith("data:image/") or "," not in source:
        raise ValueError("Ảnh chữ ký KT không hợp lệ")
    head,encoded=source.split(",",1)
    if ";base64" not in head.lower():
        raise ValueError("Ảnh chữ ký KT không hợp lệ")
    try:
        raw=base64.b64decode(encoded,validate=True)
    except Exception:
        raise ValueError("Ảnh chữ ký KT không hợp lệ")
    if not raw or len(raw)>1_500_000:
        raise ValueError("Ảnh chữ ký KT quá lớn hoặc không hợp lệ")
    try:
        prepared=pdfc.process_image_bytes(raw,"signature:"+name,0.0)
    except Exception:
        raise ValueError("Không đọc được ảnh chữ ký KT")
    path=os.path.join(temp_dir,"kt_signature.jpg")
    with open(path,"wb") as fh:
        fh.write(prepared.data)
    payload["_kt_signature_path"]=path
    return path


def _json_bytes(obj):
    return json.dumps(obj, ensure_ascii=False).encode("utf-8")

def _validate_token(token):
    if not token:
        raise PermissionError("Thiếu phiên đăng nhập")
    req = urllib.request.Request(
        SB_URL + "/auth/v1/user",
        headers={"apikey": SB_KEY, "Authorization": "Bearer " + token},
    )
    try:
        with urllib.request.urlopen(req, timeout=12) as resp:
            if resp.status != 200:
                raise PermissionError("Phiên đăng nhập không hợp lệ")
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        if exc.code in (401, 403):
            raise PermissionError("Phiên đăng nhập đã hết hạn hoặc không hợp lệ")
        raise

def _download_image(source, token):
    if not source:
        return None, ".jpg"
    if source.startswith("data:image/"):
        head, encoded = source.split(",", 1)
        ext = ".png" if "png" in head.lower() else ".jpg"
        return base64.b64decode(encoded), ext

    headers = {"User-Agent": "ESTA-Report-Generator/1.0"}
    url = source
    if source.startswith("storage:"):
        path = source[8:]
        url = (
            SB_URL
            + "/storage/v1/object/authenticated/"
            + MEDIA_BUCKET
            + "/"
            + urllib.parse.quote(path, safe="/")
        )
        headers["apikey"] = SB_KEY
        headers["Authorization"] = "Bearer " + token
    elif not (source.startswith("https://") or source.startswith("http://")):
        return None, ".jpg"

    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=22) as resp:
        raw = resp.read()
        ctype = (resp.headers.get("Content-Type") or "").lower()
    ext = ".png" if "png" in ctype else ".jpg"
    return raw, ext

def _prepare_data(payload, token, temp_dir):
    data={
        "building":str(payload.get("building") or "[CẦN BỔ SUNG]"),
        "report_date":str(payload.get("report_date") or ""),
        "prepared_by":str(payload.get("prepared_by") or ""),
        "kt_signer_name":str(payload.get("kt_signer_name") or ""),
        "kt_signature_path":str(payload.get("_kt_signature_path") or ""),
        "images_per_row":3,
        "tasks":[]
    }
    tasks=payload.get("tasks") or []
    if not isinstance(tasks,list) or len(tasks)>250:
        raise ValueError("Dữ liệu công việc không hợp lệ")

    flat=[]
    for ti,task in enumerate(tasks):
        if not isinstance(task,dict):
            continue
        out={
            "title":str(task.get("title") or "[CẦN BỔ SUNG]"),
            "type":str(task.get("type") or "Hằng ngày"),
            "status":str(task.get("status") or "Chờ xử lý"),
            "date":str(task.get("date") or data["report_date"] or "[CẦN BỔ SUNG]"),
            "assignee":str(task.get("assignee") or "[CẦN BỔ SUNG]"),
            "note":str(task.get("note") or ""),
            "images":[]
        }
        data["tasks"].append(out)
        images=task.get("images") or []
        if not isinstance(images,list):
            continue
        for ii,image in enumerate(images):
            if isinstance(image,str):
                image={"path":image}
            if not isinstance(image,dict):
                continue
            source=str(image.get("path") or image.get("url") or "")
            if not source:
                continue
            flat.append({
                "source":source,
                "caption":str(image.get("caption") or ("Hình %d"%(ii+1))),
                "task_index":len(data["tasks"])-1,
                "image_index":ii,
                "id":source
            })
    prepared,missing=pdfc.prepare_remote_images(flat,token,_download_image,source_key="source")
    for item in prepared:
        ti=item.get("task_index")
        if item.get("prepared") and isinstance(ti,int) and 0<=ti<len(data["tasks"]):
            data["tasks"][ti]["images"].append({
                "prepared":item["prepared"],
                "caption":item.get("caption") or ("Hình %d"%(len(data["tasks"][ti]["images"])+1))
            })
    return data,missing


def _prepare_energy_data(payload, token, temp_dir):
    rows=payload.get("rows") or []
    if not isinstance(rows,list) or len(rows)>500:
        raise ValueError("Dữ liệu năng lượng không hợp lệ")

    dual_meter=bool(payload.get("dual_meter"))
    data={
        "building":str(payload.get("building") or "[CẦN BỔ SUNG]"),
        "report_date":str(payload.get("report_date") or ""),
        "energy_name":str(payload.get("energy_name") or "Năng lượng"),
        "unit":str(payload.get("unit") or ""),
        "period_label":str(payload.get("period_label") or "THEO BỘ LỌC"),
        "dual_meter":dual_meter,
        "meter1_label":str(payload.get("meter1_label") or "EVN1"),
        "meter2_label":str(payload.get("meter2_label") or "EVN2"),
        "kt_signer_name":str(payload.get("kt_signer_name") or ""),
        "kt_signature_path":str(payload.get("_kt_signature_path") or ""),
        "rows":[]
    }
    flat=[]
    for ri,row in enumerate(rows):
        if not isinstance(row,dict):
            continue
        out={
            "date":str(row.get("date") or ""),
            "date_display":str(row.get("date_display") or row.get("date") or ""),
            "value":row.get("value"),"value2":row.get("value2"),
            "diff":row.get("diff"),"diff2":row.get("diff2"),"total_diff":row.get("total_diff"),
            "performer":str(row.get("performer") or ""),"note":str(row.get("note") or ""),
            "image_prepared":None,"image2_prepared":None
        }
        data["rows"].append(out)
        row_index=len(data["rows"])-1
        if row.get("image"):
            flat.append({"source":str(row.get("image")),"row_index":row_index,"slot":1,"id":str(row.get("image"))})
        if dual_meter and row.get("image2"):
            flat.append({"source":str(row.get("image2")),"row_index":row_index,"slot":2,"id":str(row.get("image2"))})

    prepared,missing=pdfc.prepare_remote_images(flat,token,_download_image,source_key="source")
    for item in prepared:
        ri=item.get("row_index")
        if not item.get("prepared") or not isinstance(ri,int) or ri<0 or ri>=len(data["rows"]):
            continue
        data["rows"][ri]["image2_prepared" if item.get("slot")==2 else "image_prepared"]=item["prepared"]
    data["rows"].sort(key=lambda x:(x.get("date") or ""))
    return data,missing


def _prepare_tools_data(payload):
    tools = payload.get("tools") or []
    if not isinstance(tools, list) or len(tools) > 1000:
        raise ValueError("Dữ liệu dụng cụ không hợp lệ")

    data = {
        "building": str(payload.get("building") or "[CẦN BỔ SUNG]"),
        "report_date": str(payload.get("report_date") or ""),
        "period_label": str(payload.get("period_label") or "DANH MỤC HIỆN TẠI"),
        "kt_signer_name": str(payload.get("kt_signer_name") or ""),
        "kt_signature_path": str(payload.get("_kt_signature_path") or ""),
        "tools": [],
    }
    for row in tools:
        if not isinstance(row, dict):
            continue
        data["tools"].append({
            "name": str(row.get("name") or ""),
            "brand": str(row.get("brand") or ""),
            "qty": row.get("qty") or 0,
            "unit": str(row.get("unit") or ""),
            "location": str(row.get("location") or ""),
            "keeper": str(row.get("keeper") or ""),
            "condition_status": str(row.get("condition_status") or ""),
            "acquired_date": str(row.get("acquired_date") or ""),
            "note": str(row.get("note") or ""),
        })
    return data

def generate_pdf(payload, token):
    with tempfile.TemporaryDirectory(prefix="esta_report_") as td:
        report_type = str(payload.get("report_type") or "work").lower()
        out_path = os.path.join(td, OUTPUT_NAME)
        _prepare_signature(payload, td)

        if report_type == "operations":
            from reporting.report_center import build_operations_doc
            ensure_fonts()
            missing_images, item_count = build_operations_doc(
                out_path, payload, token, td, _download_image
            )
        elif report_type == "energy":
            data, missing_images = _prepare_energy_data(payload, token, td)
            build_energy_doc(out_path, data)
            item_count = len(data["rows"])
        elif report_type == "tools":
            data = _prepare_tools_data(payload)
            missing_images = 0
            build_tools_doc(out_path, data)
            item_count = len(data["tools"])
        elif report_type == "generic":
            data = _prepare_generic_data(payload, token, td)
            missing_images = int(data.pop("_missing_images", 0) or 0)
            build_generic_doc(out_path, data)
            item_count = len(data["rows"])
        else:
            data, missing_images = _prepare_data(payload, token, td)
            build_doc(
                out_path,
                lambda: story_merged(data),
                "Tổng hợp & chi tiết",
                "ESTA - Báo cáo công việc kỹ thuật",
            )
            item_count = len(data["tasks"])

        with open(out_path, "rb") as fh:
            return fh.read(), missing_images, item_count

class handler(BaseHTTPRequestHandler):
    def _send_json(self, status, obj):
        body = _json_bytes(obj)
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        self._send_json(200, {"ok": True, "generator": "ESTA_Report_Generator", "format": "merged"})

    def do_POST(self):
        try:
            auth = self.headers.get("Authorization", "")
            token = auth[7:].strip() if auth.lower().startswith("bearer ") else ""
            _validate_token(token)

            length = int(self.headers.get("Content-Length") or 0)
            if length <= 0 or length > 2_500_000:
                self._send_json(413, {"error": "Dữ liệu báo cáo quá lớn hoặc trống"})
                return
            payload = json.loads(self.rfile.read(length).decode("utf-8"))
            pdf, missing_images, task_count = generate_pdf(payload, token)

            self.send_response(200)
            self.send_header("Content-Type", "application/pdf")
            self.send_header("Content-Disposition", 'attachment; filename="%s"' % OUTPUT_NAME)
            self.send_header("Content-Length", str(len(pdf)))
            self.send_header("Cache-Control", "no-store")
            self.send_header("X-ESTA-Missing-Images", str(missing_images))
            self.send_header("X-ESTA-Task-Count", str(task_count))
            self.end_headers()
            self.wfile.write(pdf)
        except PermissionError as exc:
            self._send_json(401, {"error": str(exc)})
        except ValueError as exc:
            self._send_json(400, {"error": str(exc)})
        except Exception as exc:
            traceback.print_exc()
            self._send_json(500, {"error": "Không thể tạo PDF ESTA", "detail": str(exc)[:300]})
