# Hallmark · print document · Pretendard only by user request
# Long Document · paper white · ink · no imagery or decorative widgets
# Hallmark · pre-emit critique: P4 H4 E4 S4 R5 V4
from pathlib import Path
import re, json, html, sys
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

sys.stdout.reconfigure(encoding='utf-8')
ROOT = Path(__file__).resolve().parents[2]
TMP = ROOT / 'tmp' / 'pdfs'
OUT = ROOT / 'output' / 'pdf'
OUT.mkdir(parents=True, exist_ok=True)
SOURCE = Path(r'C:\Users\USER\Downloads\이재혁_이력서_최종.md')
TEXT = SOURCE.read_text(encoding='utf-8-sig')
FONT = Path(r'C:\Users\USER\Downloads\Pretendard-1.3.9\public\static\alternative')
for weight in ('Regular','Medium','SemiBold','Bold'):
    pdfmetrics.registerFont(TTFont('Pretendard-'+weight, str(FONT/f'Pretendard-{weight}.ttf')))
pdfmetrics.registerFontFamily('Pretendard', normal='Pretendard-Regular', bold='Pretendard-SemiBold', italic='Pretendard-Regular', boldItalic='Pretendard-SemiBold')

W,H = A4
M = 46
CW = W-2*M
INK=colors.HexColor('#20282d')
BODY=colors.HexColor('#323a40')
MUTED=colors.HexColor('#5e686f')
RULE=colors.HexColor('#bdc4c9')
ACCENT=colors.HexColor('#243f51')
SIZE=10.35
LEAD=15.9
styles = {
    'body': ParagraphStyle('body',fontName='Pretendard-Regular',fontSize=SIZE,leading=LEAD,textColor=BODY,wordWrap='CJK',splitLongWords=False),
    'meta': ParagraphStyle('meta',fontName='Pretendard-Regular',fontSize=9.0,leading=13.6,textColor=MUTED,wordWrap='CJK'),
    'sub': ParagraphStyle('sub',fontName='Pretendard-SemiBold',fontSize=12.0,leading=16.6,textColor=INK,wordWrap='CJK'),
    'project': ParagraphStyle('project',fontName='Pretendard-SemiBold',fontSize=16.0,leading=21.5,textColor=INK,wordWrap='CJK'),
    'detail': ParagraphStyle('detail',fontName='Pretendard-Regular',fontSize=9.2,leading=14.3,textColor=BODY,wordWrap='CJK',splitLongWords=False),
}

def formatted(t, emphasize=False):
    t=html.escape(t)
    # Keep Latin words and technical identifiers intact under Korean line breaking.
    t=re.sub(r'[A-Za-z][A-Za-z0-9_./+:-]{4,}',lambda m:'<nobr>'+m[0]+'</nobr>',t)
    if emphasize:
        patterns=[
            '102대 → 23대','102대에서 23대','처리량을 26% 개선',
            '전송 비용을 약 30% 절감','약 5천만 row','12MB → 1.8MB','85% 감소',
            '1,122ms → 186ms','83% 단축','4,449 TPS → 4,820 TPS',
            '943ms → 641ms','1,625ms → 797ms','VOC 0건',
            '3,000 TPS를 p95 52ms, 오류율 0%, 최대 CPU 사용률 21%',
            '서비스 중단 없이 배포',
        ]
        for p in patterns:
            t=t.replace(html.escape(p),'<b>'+html.escape(p)+'</b>')
    return t

def para(t,style='body',width=CW,emphasize=False):
    p=Paragraph(formatted(t,emphasize),styles[style])
    _,h=p.wrap(width,1000)
    return p,h

sections = {}
current=None
for line in TEXT.splitlines():
    if line.startswith('## '):
        current=line[3:]; sections[current]=[]
    elif current: sections[current].append(line)

summary=[x[2:] for x in sections['요약'] if x.startswith('- ')]
about=[x for x in sections['About Me'] if x and x!='---']
skills=[x[2:] for x in sections['기술 스택'] if x.startswith('- ')]
edu=[x[2:] for x in sections['학력 및 자격'] if x.startswith('- ')]

companies=[]
company=None; project=None; group=None
for line in sections['경력']:
    if not line or line=='---': continue
    if line.startswith('### '):
        company={'name':line[4:],'intro':[],'projects':[]}; companies.append(company); project=None; group=None
    elif line.startswith('#### '):
        project={'title':line[5:].lstrip('| '),'intro':[],'groups':[]}; company['projects'].append(project); group=None
    elif line.startswith('**'):
        group={'title':line.strip('*'),'bullets':[]}; project['groups'].append(group)
    elif line.startswith('- '): group['bullets'].append(line[2:])
    elif project: project['intro'].append(line)
    else: company['intro'].append(line)

def bh(t): return para(t,width=CW-14,emphasize=True)[1]+5.0
def gh(g): return 12+20+sum(bh(b) for b in g['bullets'])
def ih(p):
    return 32+sum(para(t,'meta' if i in (0,2,3) else 'body')[1]+7 for i,t in enumerate(p['intro']))+10

print('CONTENT HEIGHTS',json.dumps({'summary':sum(bh(s) for s in summary),'about':sum(para(s)[1]+9 for s in about),'skills':sum(para(s,'meta')[1]+4 for s in skills),'projects':[{'title':p['title'],'intro':ih(p),'groups':[(g['title'],round(gh(g),1)) for g in p['groups']]} for c in companies for p in c['projects']]},ensure_ascii=False,indent=2))

class Resume:
    def __init__(self,path,total):
        self.c=canvas.Canvas(str(path),pagesize=A4,pageCompression=1,
                             initialFontName='Pretendard-Regular',initialFontSize=SIZE,initialLeading=LEAD)
        self.c.setTitle('이재혁 | 백엔드 개발자 이력서')
        self.c.setAuthor('이재혁')
        self.c.setSubject('백엔드 개발 경력 및 프로젝트')
        self.c.setCreator('Resume')
        self.n=0; self.total=total; self.y=H-M; self.log=[]
    def new(self,section,first=False):
        if self.n: self.finish()
        self.n+=1; self.y=H-M
        self.c.bookmarkPage(f'page-{self.n}')
        outline=['프로필 및 경력 개요','서울이동통신 - a015','차세대 메시징 플랫폼 - 설계 및 API','차세대 메시징 플랫폼 - 이벤트 및 운영','농협정보시스템 RCS 전송 서버']
        self.c.addOutlineEntry(outline[self.n-1],f'page-{self.n}',level=0,closed=False)
        if not first:
            self.text('이재혁',M,self.y,9.0,'SemiBold',INK)
            self.text(section,W-M,self.y,9.0,'Regular',MUTED,right=True)
            self.line(self.y-13)
            self.y-=43
    def text(self,t,x,y,size=10,weight='Regular',color=BODY,right=False):
        self.c.setFillColor(color); self.c.setFont('Pretendard-'+weight,size)
        (self.c.drawRightString if right else self.c.drawString)(x,y,t)
    def line(self,y,color=RULE,width=.5):
        self.c.setStrokeColor(color); self.c.setLineWidth(width); self.c.line(M,y,W-M,y)
    def p(self,t,style='body',indent=0,after=7,emphasize=False):
        p,h=para(t,style,width=CW-indent,emphasize=emphasize)
        p.drawOn(self.c,M+indent,self.y-h)
        self.y-=h+after
        self.check(t)
    def bullet(self,t):
        self.c.setFillColor(MUTED); self.c.circle(M+3,self.y-7.1,1.2,fill=1,stroke=0)
        self.p(t,indent=14,after=5,emphasize=True)
    def heading(self,t,top=18,size=13):
        self.y-=top
        self.text(t,M,self.y,size,'SemiBold',INK)
        self.y-=14
    def group(self,g,top=18):
        self.heading(g['title'],top=top,size=12)
        for b in g['bullets']: self.bullet(b)
    def company(self,c):
        self.text(c['name'],M,self.y,20,'Bold',INK); self.y-=30
        for t in c['intro']: self.p(t,'meta',after=7)
        self.y-=10
    def project(self,p,continued=False):
        self.p(p['title'],'project',after=8)
        if continued:
            self.y-=3
            return
        for i,t in enumerate(p['intro']):
            self.p(t,style='meta' if i in (0,2,3) else 'body',after=5)
        self.y-=2
    def check(self,t):
        if self.y < 62: raise RuntimeError(f'Page {self.n} overflow y={self.y:.1f}: {t[:40]}')
    def finish(self):
        self.log.append({'page':self.n,'bottom':round(self.y,1)})
        self.line(43,color=RULE,width=.4)
        self.text('이재혁 · 백엔드 개발자',M,27,8.0,'Regular',MUTED)
        self.text(f'{self.n} / {self.total}',W-M,27,8.0,'Medium',MUTED,right=True)
        self.c.showPage()
    def save(self):
        self.finish(); self.c.save()
        (TMP/'layout.json').write_text(json.dumps(self.log,ensure_ascii=False,indent=2),'utf-8')
        print('LAYOUT',self.log)

def build():
    r=Resume(OUT/'이재혁_이력서.pdf',5)
    c1,c2=companies
    a015=c1['projects'][0]; nextgen,rcs=c2['projects']
    r.new('프로필',first=True)
    r.text('이재혁',M,r.y-4,33,'Bold',INK)
    r.text('백엔드 개발자',W-M,r.y-2,12,'Medium',INK,right=True)
    r.text('연락처: (보류)',W-M,r.y-23,9.2,'Regular',MUTED,right=True)
    r.y-=57
    r.line(r.y,INK,1.25)
    r.y-=9
    r.heading('요약',top=20)
    for s in summary: r.bullet(s)
    r.heading('About Me',top=20)
    for s in about:r.p(s,after=9)
    r.heading('경력 개요',top=19)
    for c in companies:
        role,date=c['intro'][0].split(' | ',1)
        r.text(c['name'],M,r.y,11,'SemiBold',INK)
        r.text(date,W-M,r.y,9,'Regular',MUTED,right=True)
        r.y-=18
        r.p(role,'meta',after=16)
    r.y-=12
    leftwidth=270
    colgap=28
    rightx=M+leftwidth+colgap
    rightwidth=CW-leftwidth-colgap
    r.text('기술 스택',M,r.y,12,'SemiBold',INK)
    r.text('학력 및 자격',rightx,r.y,12,'SemiBold',INK)
    coltop=r.y-17
    ly=coltop
    for s in skills:
        label,value=s.split(': ',1)
        p=Paragraph('<b>'+html.escape(label)+':</b> '+formatted(value),styles['detail'])
        _,ph=p.wrap(leftwidth,1000)
        p.drawOn(r.c,M,ly-ph)
        ly-=ph+8
    ry=coltop
    for s in edu:
        p,ph=para(s,'detail',rightwidth)
        p.drawOn(r.c,rightx,ry-ph)
        ry-=ph+10
    r.y=min(ly,ry)
    r.check('프로필 하단')

    r.new('경력 / 서울이동통신')
    r.company(c1)
    r.project(a015)
    for g in a015['groups']:r.group(g)

    r.new('경력 / 스탠다드 네트웍스')
    r.p(c2['intro'][1],'meta',after=3)
    r.y-=4
    r.project(nextgen)
    for g in nextgen['groups'][:2]:r.group(g)

    r.new('경력 / 스탠다드 네트웍스')
    r.project(nextgen,continued=True)
    for g in nextgen['groups'][2:]:r.group(g)

    r.new('경력 / 스탠다드 네트웍스')
    r.project(rcs)
    for g in rcs['groups']:r.group(g)
    r.save()

if __name__=='__main__':
    build()
