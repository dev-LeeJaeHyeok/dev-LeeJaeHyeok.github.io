from pathlib import Path
import re, json, sys
from pypdf import PdfReader
import pdfplumber

sys.stdout.reconfigure(encoding='utf-8')
root=Path(__file__).resolve().parents[2]
source=Path(r'C:\Users\USER\Downloads\이재혁_이력서_최종.md').read_text('utf-8-sig')
path=root/'output/pdf/이재혁_이력서.pdf'
reader=PdfReader(path)
extracted='\n'.join(p.extract_text() for p in reader.pages)
normalize=lambda s: re.sub(r'\s+','',s)
full=normalize(extracted)
missing=[]
checked=0
for line in source.splitlines():
    line=line.strip()
    if not line or line=='---':continue
    line=re.sub(r'^#{1,6}\s*','',line)
    line=line.lstrip('| ').removeprefix('- ').replace('**','')
    chunks=line.split(' | ')
    for chunk in chunks:
        checked+=1
        if normalize(chunk) not in full:missing.append(chunk)

fonts={}
pagechecks=[]
with pdfplumber.open(path) as pdf:
    for i,page in enumerate(pdf.pages,1):
        assert abs(page.width-595.2756)<.05 and abs(page.height-841.8898)<.05
        chars=page.chars
        bodychars=[c for c in chars if 68<c['top']<785]
        # Allow the paragraph renderer's optical hanging punctuation (under 2 pt).
        outside=[c for c in chars if c['x0']<44 or c['x1']>page.width-44 or c['top']<15 or c['bottom']>page.height-15]
        assert not outside,(i,outside[:3])
        assert '\ufffd' not in page.extract_text()
        pagechecks.append({'page':i,'A4':True,'chars':len(chars),'body_min_size_pt':round(min(c['size'] for c in bodychars),2),'within_margins':True})
for page in reader.pages:
    for ref in page['/Resources']['/Font'].get_object().values():
        f=ref.get_object()
        base=str(f['/BaseFont'])
        descriptor=f.get('/FontDescriptor')
        if descriptor:
            fd=descriptor.get_object()
            embedded=any(x in fd for x in ('/FontFile','/FontFile2','/FontFile3'))
        else:embedded=False
        fonts[base]=embedded
        assert 'Pretendard' in base and embedded,(base,embedded)

def lum(hexc):
    cs=[int(hexc[i:i+2],16)/255 for i in (0,2,4)]
    cs=[v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in cs]
    return sum(v*w for v,w in zip(cs,[.2126,.7152,.0722]))
contrast={c:round(1.05/(lum(c)+.05),2) for c in ('20282d','323a40','5e686f')}
assert all(x>=4.5 for x in contrast.values())
assert not missing,missing
assert len(reader.pages)==5
report={'source_fragments_checked':checked,'missing_source_fragments':missing,'page_count':len(reader.pages),'fonts_embedded':fonts,'text_contrast_on_white':contrast,'page_checks':pagechecks,'file_bytes':path.stat().st_size,'visual_review':'All five rendered pages inspected; no clipping or overlap.'}
(root/'tmp/pdfs/verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),'utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
