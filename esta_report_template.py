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
    import fontpkg
    from fontTools.ttLib import TTFont as FTFont
    from fontTools.varLib.instancer import instantiateVariableFont

    out = "/tmp/esta_montserrat"
    os.makedirs(out, exist_ok=True)

    def make_static(label, weight, style="normal"):
        dst = os.path.join(out, f"Montserrat-{label}.ttf")
        if os.path.exists(dst):
            return dst
        src = str(fontpkg.path("Montserrat", weight=weight, style=style, nearest=True))
        ft = FTFont(src)
        if "fvar" in ft:
            axes = {a.axisTag for a in ft["fvar"].axes}
            coords = {}
            if "wght" in axes:
                coords["wght"] = weight
            if "ital" in axes and style == "italic":
                coords["ital"] = 1
            if "slnt" in axes and style == "italic":
                coords["slnt"] = -10
            if coords:
                instantiateVariableFont(ft, coords, inplace=True)
        ft.save(dst)
        return dst

    make_static("Light", 300)
    make_static("Regular", 400)
    make_static("Medium", 500)
    make_static("SemiBold", 600)
    make_static("Bold", 700)
    make_static("ExtraBold", 800)
    make_static("Italic", 400, "italic")
    return out

AUB = colors.HexColor("#411437")
AUB_D = colors.HexColor("#2B1526")
CREAM = colors.HexColor("#F3DEBF")
CREAM_L = colors.HexColor("#F5ECD0")
COPPER = colors.HexColor("#A46427")
TAUPE = colors.HexColor("#A99586")
STONE = colors.HexColor("#625045")
PALE = colors.HexColor("#FFF8EC")

FONT_DIR = _prepare_montserrat()
for name, fn in [("Mont","Regular"),("Mont-Light","Light"),("Mont-Medium","Medium"),
                 ("Mont-SemiBold","SemiBold"),("Mont-Bold","Bold"),
                 ("Mont-XBold","ExtraBold"),("Mont-Italic","Italic")]:
    pdfmetrics.registerFont(TTFont(name, os.path.join(FONT_DIR, f"Montserrat-{fn}.ttf")))
pdfmetrics.registerFontFamily("Mont", normal="Mont", bold="Mont-Bold",
                              italic="Mont-Italic", boldItalic="Mont-Bold")

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
        draw_star(c,MX+6*mm,PH-19*mm,6.5*mm,CREAM); c.setFillColor(CREAM); c.setFont("Mont-XBold",27)
        c.drawString(MX+16*mm,PH-20.5*mm,"ESTA")
        tracked(c,MX+16.3*mm,PH-26.5*mm,"PROPERTY MANAGEMENT","Mont-Light",6.3,2.4,CREAM)
        tracked(c,PW-MX,PH-17*mm,"BÁO CÁO CÔNG VIỆC KỸ THUẬT","Mont-Bold",8.5,1.4,CREAM,"r")
        tracked(c,PW-MX,PH-23*mm,step_label.upper(),"Mont-Light",7,1.6,CREAM,"r")
    def later(c,doc):
        background(c); bh=12*mm; c.setFillColor(AUB); c.rect(0,PH-bh,PW,bh,stroke=0,fill=1)
        c.setFillColor(COPPER); c.rect(0,PH-bh-1.2,PW,1.2,stroke=0,fill=1)
        draw_star(c,MX+2.5*mm,PH-6*mm,2.8*mm,CREAM); c.setFillColor(CREAM); c.setFont("Mont-XBold",10)
        c.drawString(MX+7.5*mm,PH-7.4*mm,"ESTA")
        tracked(c,PW-MX,PH-7.2*mm,"BÁO CÁO CÔNG VIỆC KỸ THUẬT  ·  "+step_label.upper(),
                "Mont-Light",6.5,1.3,CREAM,"r")
    return first,later

def build_doc(path,story_fn,step_label,title):
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
    P=Paragraph; execs=", ".join(dict.fromkeys(t["assignee"] for t in data["tasks"] if t.get("assignee")))
    meta=Table([
        [P("TÒA NHÀ",ST["lbl"]),P(data["building"],ST["val"]),P("NGÀY BÁO CÁO",ST["lbl"]),P(data["report_date"],ST["val"])],
        [P("ĐƠN VỊ THỰC HIỆN",ST["lbl"]),P(execs or "—",ST["val"]),P("NGƯỜI LẬP",ST["lbl"]),P(data["prepared_by"],ST["val"])],
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
    P=Paragraph; tasks=data["tasks"]; n=counts(tasks); story=intro(data,"Bước 1  ·  Báo cáo tổng hợp")
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
        story += [Spacer(1,10),P("BƯỚC 2  ·  CHI TIẾT VÀ HÌNH ẢNH TỪNG CÔNG VIỆC  —  XEM TỪ TRANG 2",ST["sec"])]
    if sign: story.append(signatures())
    return story

IMG_H=76*mm

def _norm_images(t):
    imgs=list(t.get("images") or [])
    while len(imgs)<2: imgs.append({"path":None,"caption":""})
    out=[]
    for j,im in enumerate(imgs):
        if isinstance(im,str): im={"path":im}
        out.append({"path":im.get("path"),"caption":im.get("caption") or "Hình %d"%(j+1)})
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

def task_card(idx,t,per_row=1):
    inner_w=CW-2; head,meta=_card_head_meta(idx,t,inner_w); imgs=_norm_images(t)
    if per_row==2:
        gap=4*mm; sw=(inner_w-20-gap)/2
        slots=[ImageSlot(sw,52*mm,im["path"],im["caption"]) for im in imgs]
        grid_rows=[]
        for j in range(0,len(slots),2):
            r=slots[j:j+2]
            if len(r)==1: r.append("")
            grid_rows.append([r[0],"",r[1]])
        grid=Table(grid_rows,colWidths=[sw,gap,sw])
        grid.setStyle(TableStyle([("LEFTPADDING",(0,0),(-1,-1),0),("RIGHTPADDING",(0,0),(-1,-1),0),
                                  ("TOPPADDING",(0,0),(-1,-1),0),("BOTTOMPADDING",(0,0),(-1,-1),2)]))
        blk=Table([[Paragraph("HÌNH ẢNH HIỆN TRƯỜNG",ST["sec"])],[grid]],colWidths=[inner_w])
        blk.setStyle(TableStyle([("LEFTPADDING",(0,0),(-1,-1),10),("RIGHTPADDING",(0,0),(-1,-1),10),
            ("TOPPADDING",(0,0),(-1,0),4),("BOTTOMPADDING",(0,0),(-1,0),5),
            ("TOPPADDING",(0,1),(-1,1),0),("BOTTOMPADDING",(0,1),(-1,1),6),
            ("LINEABOVE",(0,0),(-1,0),.4,TAUPE)]))
        return [KeepTogether([_box([head,meta,blk]),Spacer(1,9)])]
    sw=inner_w-20
    slots=[ImageSlot(sw,IMG_H,im["path"],im["caption"],fit="contain") for im in imgs]
    first_rows=[head,meta,_img_row(slots[0],inner_w,first=True,label="HÌNH ẢNH HIỆN TRƯỜNG")]
    if len(slots)>1: first_rows.append(_img_row(slots[1],inner_w))
    out=[KeepTogether([_box(first_rows),Spacer(1,9)])]
    for j in range(2,len(slots)):
        cont=Paragraph("%02d  ·  %s  —  <font name='Mont-Light'>hình ảnh (tiếp)</font>"%(idx,t["title"]),ST["sec"])
        row_c=Table([[cont]],colWidths=[inner_w])
        row_c.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),CREAM_L),("LINEBELOW",(0,0),(-1,-1),1.5,COPPER),
            ("LEFTPADDING",(0,0),(-1,-1),10),("TOPPADDING",(0,0),(-1,-1),6),("BOTTOMPADDING",(0,0),(-1,-1),6)]))
        out.append(KeepTogether([_box([row_c,_img_row(slots[j],inner_w)]),Spacer(1,9)]))
    return out

def summary_line(tasks):
    n=counts(tasks)
    return "TỔNG %d CÔNG VIỆC  ·  %d ĐANG THỰC HIỆN  ·  %d CHỜ XỬ LÝ  ·  %d HOÀN THÀNH  ·  %d SỰ CỐ"%(
        len(tasks),n["Đang thực hiện"],n["Chờ xử lý"],n["Hoàn thành"],n["Sự cố"])

def story_detail(data,standalone=True):
    tasks=data["tasks"]; per_row=int(data.get("images_per_row",1)); P=Paragraph
    if standalone: story=intro(data,"Bước 2  ·  Báo cáo chi tiết kèm hình ảnh")
    else:
        story=[P("BƯỚC 2  ·  CHI TIẾT KÈM HÌNH ẢNH",ST["eyebrow"]),Spacer(1,3),
               P("Chi tiết từng công việc",ST["h1"]),
               HRFlowable(width="100%",thickness=1.5,color=COPPER,spaceBefore=5,spaceAfter=6)]
    story += [P(summary_line(tasks),ST["sec"]),Spacer(1,8)]
    for i,t in enumerate(tasks,1): story += task_card(i,t,per_row)
    story.append(signatures()); return story

def story_merged(data):
    from reportlab.platypus import PageBreak
    return story_summary(data,sign=False,pointer=True)+[PageBreak()]+story_detail(data,standalone=False)
