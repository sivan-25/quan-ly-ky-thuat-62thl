# -*- coding: utf-8 -*-
import io, os, glob
from PIL import Image, ImageOps
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas as rl_canvas
from reportlab.platypus import (BaseDocTemplate, Flowable, Frame, HRFlowable,
                                KeepTogether, PageTemplate, Paragraph, Spacer,
                                Table, TableStyle)
from reportlab.lib.utils import ImageReader

# Font bootstrap for Vercel: Montserrat only. The report layout below is the
# ESTA_Report_Generator template supplied by the user; only font packaging is adapted.
def _prepare_montserrat():
    font_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "reporting", "fonts")
    return font_dir

AUB = colors.HexColor("#411437")
AUB_D = colors.HexColor("#2B1526")
CREAM = colors.HexColor("#F3DEBF")
CREAM_L = colors.HexColor("#F5ECD0")
COPPER = colors.HexColor("#A46427")
TAUPE = colors.HexColor("#A99586")
STONE = colors.HexColor("#625045")
PALE = colors.HexColor("#FFF8EC")

_FONTS_READY = False
def ensure_fonts():
    global _FONTS_READY
    if _FONTS_READY:
        return
    font_dir = _prepare_montserrat()
    for name, fn in [("Mont","Regular"),("Mont-Light","Light"),("Mont-Medium","Medium"),
                     ("Mont-SemiBold","SemiBold"),("Mont-Bold","Bold"),
                     ("Mont-XBold","ExtraBold"),("Mont-Italic","Italic")]:
        pdfmetrics.registerFont(TTFont(name, os.path.join(font_dir, f"Montserrat-{fn}.ttf")))
    pdfmetrics.registerFontFamily("Mont", normal="Mont", bold="Mont-Bold",
                                  italic="Mont-Italic", boldItalic="Mont-Bold")
    _FONTS_READY = True

PW, PH = A4
MX = 18 * mm
CW = PW - 2 * MX
FOOTER = "ESTA PROPERTY MANAGEMENT  ·  A L'MAK COMPANY  ·  HO CHI MINH CITY"

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

def draw_star(c, cx, cy, r, color):
    import math
    k = 0.22
    pts = []
    for i in range(8):
        ang = math.pi / 4 * i
        rad = r if i % 2 == 0 else r * k * 1.9
        pts.append((cx + rad * math.cos(ang), cy + rad * math.sin(ang)))
    p = c.beginPath(); p.moveTo(*pts[0])
    for pt in pts[1:]: p.lineTo(*pt)
    p.close(); c.setFillColor(color); c.drawPath(p, stroke=0, fill=1)

def tracked(c, x, y, text, font, size, space, color, align="l"):
    w = pdfmetrics.stringWidth(text, font, size) + space * (len(text) - 1)
    if align == "r": x -= w
    c.saveState(); t = c.beginText(x, y); t.setFont(font, size); t.setCharSpace(space)
    t.setFillColor(color); t.textOut(text); c.drawText(t); c.restoreState()

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

def load_image(path):
    im=Image.open(path); im=ImageOps.exif_transpose(im).convert("RGB"); im.thumbnail((1600,1600))
    buf=io.BytesIO(); im.save(buf,"JPEG",quality=85); buf.seek(0); return ImageReader(buf)

def image_orientation(path):
    """Portrait only when height is > width by 10%; otherwise treat as landscape."""
    if not path or not os.path.exists(path):
        return "landscape"
    try:
        im=Image.open(path); im=ImageOps.exif_transpose(im)
        w,h=im.size
        return "portrait" if h > (w * 1.10) else "landscape"
    except Exception:
        return "landscape"

class ImageSlot(Flowable):
    CAP_H=13
    def __init__(self,w,h,path=None,caption="",fit="cover"):
        super().__init__(); self.w,self.h,self.path,self.caption,self.fit=w,h,path,caption,fit
        self.img=load_image(path) if path and os.path.exists(path) else None
    def wrap(self,aw,ah): return self.w,self.h+self.CAP_H
    def draw(self):
        c,w,h,yb=self.canv,self.w,self.h,self.CAP_H
        if self.img:
            iw,ih=self.img.getSize()
            if self.fit=="contain": c.setFillColor(CREAM_L); c.rect(0,yb,w,h,stroke=0,fill=1); sc=min(w/iw,h/ih)
            else: sc=max(w/iw,h/ih)
            dw,dh=iw*sc,ih*sc
            c.saveState(); p=c.beginPath(); p.rect(0,yb,w,h); c.clipPath(p,stroke=0,fill=0)
            c.drawImage(self.img,(w-dw)/2,yb+(h-dh)/2,dw,dh); c.restoreState()
            c.setStrokeColor(STONE); c.setLineWidth(.5); c.rect(0,yb,w,h,stroke=1,fill=0)
        else:
            c.setFillColor(CREAM_L); c.rect(0,yb,w,h,stroke=0,fill=1); c.setStrokeColor(TAUPE)
            c.setLineWidth(.8); c.setDash(3,3); c.rect(.4,yb+.4,w-.8,h-.8,stroke=1,fill=0); c.setDash()
            draw_star(c,w/2,yb+h/2+8,8,TAUPE)
            tracked(c,w/2-(pdfmetrics.stringWidth("HÌNH ẢNH CHƯA CẬP NHẬT","Mont-Bold",6.5)+1.2*21)/2,
                    yb+h/2-9,"HÌNH ẢNH CHƯA CẬP NHẬT","Mont-Bold",6.5,1.2,STONE)
        c.setFillColor(STONE); c.setFont("Mont-Light",7); c.drawString(0,3,self.caption)

class NumberedCanvas(rl_canvas.Canvas):
    def __init__(self,*a,**k): super().__init__(*a,**k); self._saved=[]
    def showPage(self): self._saved.append(dict(self.__dict__)); self._startPage()
    def save(self):
        total=len(self._saved)
        for st in self._saved:
            self.__dict__.update(st); self._footer(total); super().showPage()
        super().save()
    def _footer(self,total):
        c=self; c.setStrokeColor(COPPER); c.setLineWidth(1.5); c.line(MX,16*mm,PW-MX,16*mm)
        tracked(c,MX,11*mm,FOOTER,"Mont-Light",6.2,.9,STONE); c.setFont("Mont-Light",6.8)
        c.setFillColor(STONE); c.drawRightString(PW-MX,11*mm,f"Trang {c._pageNumber} / {total}")

def make_page_fns(step_label):
    def background(c): c.setFillColor(CREAM); c.rect(0,0,PW,PH,stroke=0,fill=1)
    def first(c,doc):
        background(c); bh=38*mm; c.setFillColor(AUB); c.rect(0,PH-bh,PW,bh,stroke=0,fill=1)
        c.setFillColor(COPPER); c.rect(0,PH-bh-1.5,PW,1.5,stroke=0,fill=1)
        tracked(c,PW-MX,PH-17*mm,"BÁO CÁO CÔNG VIỆC KỸ THUẬT","Mont-Bold",8.5,1.4,CREAM,"r")
        tracked(c,PW-MX,PH-23*mm,step_label.upper(),"Mont-Light",7,1.6,CREAM,"r")
    def later(c,doc):
        background(c); bh=12*mm; c.setFillColor(AUB); c.rect(0,PH-bh,PW,bh,stroke=0,fill=1)
        c.setFillColor(COPPER); c.rect(0,PH-bh-1.2,PW,1.2,stroke=0,fill=1)
        tracked(c,PW-MX,PH-7.2*mm,"BÁO CÁO CÔNG VIỆC KỸ THUẬT  ·  "+step_label.upper(),
                "Mont-Light",6.5,1.3,CREAM,"r")
    return first,later

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

def signatures():
    P=Paragraph
    cols=[("NGƯỜI LẬP BÁO CÁO","(Ký, ghi rõ họ tên)"),
          ("TRƯỞNG BỘ PHẬN KỸ THUẬT","(Ký, ghi rõ họ tên)"),
          ("BAN QUẢN LÝ TÒA NHÀ","(Ký, ghi rõ họ tên)")]
    t=Table([[P(a,ST["sig"]) for a,_ in cols],[P(b,ST["sig_s"]) for _,b in cols],["","",""]],
            colWidths=[CW/3]*3,rowHeights=[None,None,13*mm])
    t.setStyle(TableStyle([("LINEABOVE",(0,0),(-1,0),1.5,COPPER),("TOPPADDING",(0,0),(-1,0),6),
        ("BOTTOMPADDING",(0,0),(-1,-1),1),("LEFTPADDING",(0,0),(-1,-1),0),
        ("RIGHTPADDING",(0,0),(-1,-1),8),("LINEBELOW",(0,2),(-1,2),.4,TAUPE)]))
    return KeepTogether([Spacer(1,6),t])

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
    widths=[8,40,19,28,19,24,36]; widths=[w*mm*CW/(sum(widths)*mm) for w in widths]
    tb=Table(rows,colWidths=widths,repeatRows=1)
    style=[("BACKGROUND",(0,0),(-1,0),AUB),("VALIGN",(0,0),(-1,-1),"MIDDLE"),
        ("TOPPADDING",(0,0),(-1,-1),3.5),("BOTTOMPADDING",(0,0),(-1,-1),3.5),
        ("LEFTPADDING",(0,0),(-1,-1),5),("RIGHTPADDING",(0,0),(-1,-1),4),
        ("LINEBELOW",(0,1),(-1,-1),.4,TAUPE),("LINEBELOW",(0,-1),(-1,-1),1.5,COPPER)]
    for r in range(2,len(rows),2): style.append(("BACKGROUND",(0,r),(-1,r),CREAM_L))
    tb.setStyle(TableStyle(style)); story.append(tb)
    if pointer:
        story += [Spacer(1,10),P("PHẦN 2  ·  CHI TIẾT VÀ HÌNH ẢNH TỪNG CÔNG VIỆC  —  XEM TỪ TRANG 2",ST["sec"])]
    if sign: story.append(signatures())
    return story

IMG_H=76*mm

def _norm_images(t):
    imgs=list(t.get("images") or [])
    out=[]
    for j,im in enumerate(imgs):
        if isinstance(im,str): im={"path":im}
        path=im.get("path")
        if not path or not os.path.exists(path):
            continue
        out.append({
            "path":path,
            "caption":im.get("caption") or "Hình %d"%(j+1),
            "orientation":image_orientation(path)
        })
    return out

def _card_head_meta(idx,t,inner_w):
    P=Paragraph; num_w,pill_w=13*mm,36*mm
    head=Table([[P(f"{idx:02d}",ST["card_n"]),P(t["title"],ST["card_t"]),Pill(t["status"],"status",7.2,"RIGHT")]],
        colWidths=[num_w,inner_w-num_w-pill_w,pill_w])
    head.setStyle(TableStyle([("BACKGROUND",(0,0),(0,0),AUB),("BACKGROUND",(1,0),(-1,0),CREAM_L),
        ("VALIGN",(0,0),(-1,-1),"MIDDLE"),("ALIGN",(0,0),(0,0),"CENTER"),("ALIGN",(2,0),(2,0),"RIGHT"),
        ("TOPPADDING",(0,0),(-1,-1),8),("BOTTOMPADDING",(0,0),(-1,-1),8),
        ("LEFTPADDING",(1,0),(1,0),10),("RIGHTPADDING",(2,0),(2,0),10),
        ("LINEBELOW",(0,0),(-1,0),1.5,COPPER)]))
    third=inner_w/3
    meta=Table([[P("LOẠI CÔNG VIỆC",ST["lbl"]),P("NGÀY THỰC HIỆN",ST["lbl"]),P("NGƯỜI THỰC HIỆN",ST["lbl"])],
        [P(t["type"],ST["val"]),P(t["date"],ST["val"]),P(t.get("assignee") or "—",ST["val"])],
        [P("GHI CHÚ",ST["lbl"]),"",""],[P(t.get("note") or "—",S("nv",fontName="Mont",fontSize=8.3,leading=12)),"",""]],
        colWidths=[third]*3)
    meta.setStyle(TableStyle([("SPAN",(0,2),(2,2)),("SPAN",(0,3),(2,3)),
        ("LEFTPADDING",(0,0),(-1,-1),10),("RIGHTPADDING",(0,0),(-1,-1),6),
        ("TOPPADDING",(0,0),(-1,-1),1),("BOTTOMPADDING",(0,0),(-1,-1),1),
        ("TOPPADDING",(0,0),(-1,0),8),("TOPPADDING",(0,2),(-1,2),6),
        ("BOTTOMPADDING",(0,3),(-1,3),8),("LINEBELOW",(0,1),(-1,1),.4,TAUPE),
        ("BOTTOMPADDING",(0,1),(-1,1),7)]))
    return head,meta

def _box(rows):
    card=Table([[r] for r in rows],colWidths=[CW])
    card.setStyle(TableStyle([("BOX",(0,0),(-1,-1),.6,TAUPE),("LEFTPADDING",(0,0),(-1,-1),1),
        ("RIGHTPADDING",(0,0),(-1,-1),1),("TOPPADDING",(0,0),(-1,-1),0),("BOTTOMPADDING",(0,0),(-1,-1),0)]))
    return card

def _img_row(slot,inner_w,first=False,label=None):
    rows=[]
    if label: rows.append([Paragraph(label,ST["sec"])])
    rows.append([slot]); t=Table(rows,colWidths=[inner_w])
    st=[("LEFTPADDING",(0,0),(-1,-1),10),("RIGHTPADDING",(0,0),(-1,-1),10),
        ("TOPPADDING",(0,0),(-1,-1),4),("BOTTOMPADDING",(0,0),(-1,-1),4)]
    if first:
        st.append(("LINEABOVE",(0,0),(-1,0),.4,TAUPE)); st.append(("TOPPADDING",(0,0),(-1,0),6))
    t.setStyle(TableStyle(st)); return t

def _portrait_pair_row(a,b,inner_w,first=False,label=None):
    gap=4*mm
    available=inner_w-20
    sw=(available-gap)/2
    # Tall enough for phone portrait images while still fitting comfortably on A4.
    slots=[
        ImageSlot(sw,92*mm,a["path"],a["caption"],fit="contain"),
        ImageSlot(sw,92*mm,b["path"],b["caption"],fit="contain")
    ]
    rows=[]
    if label: rows.append([Paragraph(label,ST["sec"]),"",""])
    rows.append([slots[0],"",slots[1]])
    t=Table(rows,colWidths=[sw,gap,sw])
    st=[("LEFTPADDING",(0,0),(-1,-1),0),("RIGHTPADDING",(0,0),(-1,-1),0),
        ("TOPPADDING",(0,0),(-1,-1),4),("BOTTOMPADDING",(0,0),(-1,-1),4)]
    if label:
        st += [("SPAN",(0,0),(2,0)),("LEFTPADDING",(0,0),(2,0),10),
               ("TOPPADDING",(0,0),(2,0),4),("BOTTOMPADDING",(0,0),(2,0),5)]
    if first:
        st.append(("LINEABOVE",(0,0),(-1,0),.4,TAUPE))
    t.setStyle(TableStyle(st))
    return t

def _single_auto_row(im,inner_w,first=False,label=None):
    sw=inner_w-20
    # Landscape stays compact/full-width. A lone portrait receives a taller full-width
    # presentation area; the image itself remains proportional and is never cropped.
    h=112*mm if im.get("orientation")=="portrait" else 76*mm
    slot=ImageSlot(sw,h,im["path"],im["caption"],fit="contain")
    return _img_row(slot,inner_w,first=first,label=label)

def _image_groups_in_order(imgs):
    """Preserve upload order; only pair two adjacent portrait images."""
    groups=[]
    i=0
    while i<len(imgs):
        cur=imgs[i]
        if cur.get("orientation")=="portrait" and i+1<len(imgs) and imgs[i+1].get("orientation")=="portrait":
            groups.append(("pair",cur,imgs[i+1]))
            i+=2
        else:
            groups.append(("single",cur))
            i+=1
    return groups

def task_card(idx,t,per_row=1):
    inner_w=CW-2
    head,meta=_card_head_meta(idx,t,inner_w)
    imgs=_norm_images(t)

    # No images: show only the work information. Do not render an empty image section.
    if not imgs:
        return [KeepTogether([_box([head,meta]),Spacer(1,9)])]

    groups=_image_groups_in_order(imgs)
    first=groups[0]
    if first[0]=="pair":
        first_img=_portrait_pair_row(first[1],first[2],inner_w,first=True,label="HÌNH ẢNH HIỆN TRƯỜNG")
    else:
        first_img=_single_auto_row(first[1],inner_w,first=True,label="HÌNH ẢNH HIỆN TRƯỜNG")

    out=[KeepTogether([_box([head,meta,first_img]),Spacer(1,9)])]

    for group in groups[1:]:
        cont=Paragraph("%02d  ·  %s  —  <font name='Mont-Light'>hình ảnh (tiếp)</font>"%(idx,t["title"]),ST["sec"])
        row_c=Table([[cont]],colWidths=[inner_w])
        row_c.setStyle(TableStyle([
            ("BACKGROUND",(0,0),(-1,-1),CREAM_L),("LINEBELOW",(0,0),(-1,-1),1.5,COPPER),
            ("LEFTPADDING",(0,0),(-1,-1),10),("TOPPADDING",(0,0),(-1,-1),6),
            ("BOTTOMPADDING",(0,0),(-1,-1),6)
        ]))
        if group[0]=="pair":
            img_row=_portrait_pair_row(group[1],group[2],inner_w)
        else:
            img_row=_single_auto_row(group[1],inner_w)
        out.append(KeepTogether([_box([row_c,img_row]),Spacer(1,9)]))
    return out

def summary_line(tasks):
    n=counts(tasks)
    return "TỔNG %d CÔNG VIỆC  ·  %d ĐANG THỰC HIỆN  ·  %d CHỜ XỬ LÝ  ·  %d HOÀN THÀNH  ·  %d SỰ CỐ"%(
        len(tasks),n["Đang thực hiện"],n["Chờ xử lý"],n["Hoàn thành"],n["Sự cố"])

def story_detail(data,standalone=True):
    tasks=data["tasks"]; P=Paragraph
    if standalone: story=intro(data,"Phần 2  ·  Báo cáo chi tiết kèm hình ảnh")
    else:
        story=[P("PHẦN 2  ·  CHI TIẾT KÈM HÌNH ẢNH",ST["eyebrow"]),Spacer(1,3),
               P("Chi tiết từng công việc",ST["h1"]),
               HRFlowable(width="100%",thickness=1.5,color=COPPER,spaceBefore=5,spaceAfter=6)]
    story += [P(summary_line(tasks),ST["sec"]),Spacer(1,8)]
    for i,t in enumerate(tasks,1): story += task_card(i,t,1)
    story.append(signatures()); return story

def story_merged(data):
    from reportlab.platypus import PageBreak
    return story_summary(data,sign=False,pointer=True)+[PageBreak()]+story_detail(data,standalone=False)


# ===== ENERGY REPORT — ESTA STANDARD =====
def energy_signatures():
    P=Paragraph
    cols=[("KỸ THUẬT (KT)","(Ký, ghi rõ họ tên)"),
          ("KIỂM SOÁT / GIÁM SÁT (KST)","(Ký, ghi rõ họ tên)")]
    t=Table([[P(a,ST["sig"]) for a,_ in cols],
             [P(b,ST["sig_s"]) for _,b in cols],
             ["",""]],
            colWidths=[CW/2]*2,rowHeights=[None,None,14*mm])
    t.setStyle(TableStyle([
        ("LINEABOVE",(0,0),(-1,0),1.5,COPPER),
        ("TOPPADDING",(0,0),(-1,0),7),
        ("BOTTOMPADDING",(0,0),(-1,-1),1),
        ("LEFTPADDING",(0,0),(-1,-1),0),
        ("RIGHTPADDING",(0,0),(-1,-1),10),
        ("LINEBELOW",(0,2),(-1,2),.4,TAUPE)
    ]))
    return KeepTogether([Spacer(1,8),t])

def make_energy_page_fns(report_title, period_label):
    short=(report_title or "BÁO CÁO NĂNG LƯỢNG").upper()
    period=(period_label or "").upper()
    def background(c):
        c.setFillColor(CREAM); c.rect(0,0,PW,PH,stroke=0,fill=1)
    def first(c,doc):
        background(c); bh=38*mm
        c.setFillColor(AUB); c.rect(0,PH-bh,PW,bh,stroke=0,fill=1)
        c.setFillColor(COPPER); c.rect(0,PH-bh-1.5,PW,1.5,stroke=0,fill=1)
        tracked(c,PW-MX,PH-17*mm,short,"Mont-Bold",8.5,1.25,CREAM,"r")
        tracked(c,PW-MX,PH-23*mm,period,"Mont-Light",6.8,1.3,CREAM,"r")
    def later(c,doc):
        background(c); bh=12*mm
        c.setFillColor(AUB); c.rect(0,PH-bh,PW,bh,stroke=0,fill=1)
        c.setFillColor(COPPER); c.rect(0,PH-bh-1.2,PW,1.2,stroke=0,fill=1)
        tracked(c,PW-MX,PH-7.2*mm,short+"  ·  "+period,
                "Mont-Light",6.2,1.1,CREAM,"r")
    return first,later

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

    image_rows=[r for r in rows if (r.get("image_path") and os.path.exists(r.get("image_path"))) or (r.get("image2_path") and os.path.exists(r.get("image2_path")))]
    if image_rows:
        from reportlab.platypus import PageBreak
        story += [PageBreak(),P("PHẦN 2  ·  HÌNH ẢNH ĐỒNG HỒ",ST["eyebrow"]),Spacer(1,3),
                  P("Hình ảnh ghi nhận",ST["h1"]),
                  HRFlowable(width="100%",thickness=1.5,color=COPPER,spaceBefore=5,spaceAfter=8)]
        counter=0
        for r in image_rows:
            pairs=[]
            if r.get("image_path") and os.path.exists(r.get("image_path")):
                pairs.append((meter1 if dual else energy_name,r.get("image_path"),r.get("value")))
            if dual and r.get("image2_path") and os.path.exists(r.get("image2_path")):
                pairs.append((meter2,r.get("image2_path"),r.get("value2")))
            for label,path,val in pairs:
                counter+=1
                cap=str(r.get("date_display") or r.get("date") or "")+"  ·  "+_energy_num(val)
                slot=ImageSlot(CW-16,82*mm,path,cap,fit="contain")
                box=Table([[P(f"{counter:02d}  ·  {label}",ST["sec"])],[slot]],colWidths=[CW])
                box.setStyle(TableStyle([
                    ("BOX",(0,0),(-1,-1),.6,TAUPE),
                    ("BACKGROUND",(0,0),(0,0),CREAM_L),
                    ("LINEBELOW",(0,0),(0,0),1.5,COPPER),
                    ("LEFTPADDING",(0,0),(-1,-1),8),
                    ("RIGHTPADDING",(0,0),(-1,-1),8),
                    ("TOPPADDING",(0,0),(-1,-1),5),
                    ("BOTTOMPADDING",(0,0),(-1,-1),5)
                ]))
                story += [KeepTogether([box,Spacer(1,9)])]

    story.append(energy_signatures())
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
    story += [tb,energy_signatures()]
    return story


# ===== VERCEL API HANDLER =====
# -*- coding: utf-8 -*-
import base64
import json
import os
import tempfile
import traceback
import urllib.parse
import urllib.request
from http.server import BaseHTTPRequestHandler


SB_URL = "https://upcjcrycahdfroxggsdz.supabase.co"
SB_KEY = "sb_publishable_WQiZyrTXCeRr6BgfXAtQSg_zX_eUBsa"
MEDIA_BUCKET = "task-images"
OUTPUT_NAME = "ESTA_BaoCao_KyThuat_TongHop_ChiTiet.pdf"

def _json_bytes(obj):
    return json.dumps(obj, ensure_ascii=False).encode("utf-8")

def _validate_token(token):
    if not token:
        raise PermissionError("Thiếu phiên đăng nhập")
    req = urllib.request.Request(
        SB_URL + "/auth/v1/user",
        headers={"apikey": SB_KEY, "Authorization": "Bearer " + token},
    )
    with urllib.request.urlopen(req, timeout=12) as resp:
        if resp.status != 200:
            raise PermissionError("Phiên đăng nhập không hợp lệ")
        return json.loads(resp.read().decode("utf-8"))

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
    data = {
        "building": str(payload.get("building") or "[CẦN BỔ SUNG]"),
        "report_date": str(payload.get("report_date") or ""),
        "prepared_by": str(payload.get("prepared_by") or ""),
        "images_per_row": 2 if int(payload.get("images_per_row") or 1) == 2 else 1,
        "tasks": [],
    }
    img_dir = os.path.join(temp_dir, "images")
    os.makedirs(img_dir, exist_ok=True)
    missing_images = 0

    tasks = payload.get("tasks") or []
    if not isinstance(tasks, list) or len(tasks) > 250:
        raise ValueError("Dữ liệu công việc không hợp lệ")

    for ti, task in enumerate(tasks, 1):
        if not isinstance(task, dict):
            continue
        row = {
            "title": str(task.get("title") or "[CẦN BỔ SUNG]"),
            "type": str(task.get("type") or "Hằng ngày"),
            "status": str(task.get("status") or "Chờ xử lý"),
            "date": str(task.get("date") or data["report_date"] or "[CẦN BỔ SUNG]"),
            "assignee": str(task.get("assignee") or "[CẦN BỔ SUNG]"),
            "note": str(task.get("note") or ""),
            "images": [],
        }
        images = task.get("images") or []
        if not isinstance(images, list):
            images = []
        for ii, image in enumerate(images, 1):
            if isinstance(image, str):
                image = {"path": image}
            if not isinstance(image, dict):
                continue
            source = str(image.get("path") or image.get("url") or "")
            caption = str(image.get("caption") or ("Hình %d" % ii))
            try:
                raw, ext = _download_image(source, token)
                if raw:
                    local_path = os.path.join(img_dir, "task_%03d_img_%03d%s" % (ti, ii, ext))
                    with open(local_path, "wb") as fh:
                        fh.write(raw)
                    row["images"].append({"path": local_path, "caption": caption})
                else:
                    missing_images += 1
                    row["images"].append({"path": None, "caption": caption})
            except Exception:
                missing_images += 1
                row["images"].append({"path": None, "caption": caption})
        data["tasks"].append(row)
    return data, missing_images

def _prepare_energy_data(payload, token, temp_dir):
    rows = payload.get("rows") or []
    if not isinstance(rows, list) or len(rows) > 500:
        raise ValueError("Dữ liệu năng lượng không hợp lệ")

    dual_meter = bool(payload.get("dual_meter"))
    data = {
        "building": str(payload.get("building") or "[CẦN BỔ SUNG]"),
        "report_date": str(payload.get("report_date") or ""),
        "energy_name": str(payload.get("energy_name") or "Năng lượng"),
        "unit": str(payload.get("unit") or ""),
        "period_label": str(payload.get("period_label") or "THEO BỘ LỌC"),
        "dual_meter": dual_meter,
        "meter1_label": str(payload.get("meter1_label") or "EVN1"),
        "meter2_label": str(payload.get("meter2_label") or "EVN2"),
        "rows": [],
    }
    img_dir = os.path.join(temp_dir, "energy_images")
    os.makedirs(img_dir, exist_ok=True)
    missing_images = 0

    def download_slot(source, filename):
        nonlocal missing_images
        if not source:
            return None
        try:
            raw, ext = _download_image(str(source), token)
            if raw:
                local_path = os.path.join(img_dir, filename + ext)
                with open(local_path, "wb") as fh:
                    fh.write(raw)
                return local_path
            missing_images += 1
        except Exception:
            missing_images += 1
        return None

    for ri, row in enumerate(rows, 1):
        if not isinstance(row, dict):
            continue
        out = {
            "date": str(row.get("date") or ""),
            "date_display": str(row.get("date_display") or row.get("date") or ""),
            "value": row.get("value"),
            "value2": row.get("value2"),
            "diff": row.get("diff"),
            "diff2": row.get("diff2"),
            "total_diff": row.get("total_diff"),
            "performer": str(row.get("performer") or ""),
            "note": str(row.get("note") or ""),
            "image_path": None,
            "image2_path": None,
        }
        out["image_path"] = download_slot(row.get("image"), "energy_%03d_1" % ri)
        if dual_meter:
            out["image2_path"] = download_slot(row.get("image2"), "energy_%03d_2" % ri)
        data["rows"].append(out)

    data["rows"].sort(key=lambda x: (x.get("date") or ""))
    return data, missing_images

def _prepare_tools_data(payload):
    tools = payload.get("tools") or []
    if not isinstance(tools, list) or len(tools) > 1000:
        raise ValueError("Dữ liệu dụng cụ không hợp lệ")

    data = {
        "building": str(payload.get("building") or "[CẦN BỔ SUNG]"),
        "report_date": str(payload.get("report_date") or ""),
        "period_label": str(payload.get("period_label") or "DANH MỤC HIỆN TẠI"),
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
