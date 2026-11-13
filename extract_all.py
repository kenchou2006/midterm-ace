import sys
import os

REQUIRED_MODULES = [
    ('pymupdf', 'fitz'),
    ('openpyxl', 'openpyxl'),
    ('beautifulsoup4', 'bs4')
]

missing = []
for pkg_name, mod_name in REQUIRED_MODULES:
    try:
        __import__(mod_name)
    except ImportError:
        missing.append(pkg_name)

if missing:
    meta_path = os.path.join('public', 'data', 'exams_meta.json')
    if os.path.exists(meta_path):
        print(f"[Notice] Missing Python dependencies: {', '.join(missing)}")
        print("[Notice] Using existing pre-compiled question banks in public/data/. Skipping re-extraction.")
        sys.exit(0)
    else:
        print(f"[Error] Missing required Python packages: {', '.join(missing)}", file=sys.stderr)
        print("Please install them with: pip install -r requirements.txt", file=sys.stderr)
        sys.exit(1)

import fitz
import openpyxl
import re
import json
import random

RAW_DIR = '題庫原檔'

print("Starting extraction for all exams...")

# ==========================================
# 1. ICTP Extraction
# ==========================================
print("\n--- Processing ICTP ---")
doc_ictp = fitz.open(os.path.join(RAW_DIR, '(2026) ICTP 計算機程式語言國際認證Essentials Level題庫共250題.pdf'))
os.makedirs('public/images/ictp', exist_ok=True)

ictp_questions = []
section_names = {
    1: "第一部分：Python 基礎語法與運算",
    2: "第二部分：資料型態、容器與控制結構",
    3: "第三部分：函式、模組與檔案處理",
    4: "第四部分：演算法、物件與進階應用"
}

current_section = 1
prev_num = 0
global_index = 0

for pno, page in enumerate(doc_ictp):
    # Find all question start headers on this page
    blocks = page.get_text('blocks')
    # Filter text blocks and sort by y0
    q_matches = []
    for b in blocks:
        for m in re.finditer(r'(?:^|\n)\s*(\d+)\.【\s*([A-D])\s*】', b[4]):
            q_matches.append({
                'y0': b[1],
                'num': int(m.group(1)),
                'ans': m.group(2),
                'match_start': m.start(),
                'match_end': m.end(),
                'block_text': b[4]
            })
    q_matches.sort(key=lambda x: x['y0'])
    
    # Images on this page
    imgs = page.get_images()
    img_list = []
    for img in imgs:
        xref = img[0]
        for r in page.get_image_rects(xref):
            img_list.append({
                'center_y': (r.y0 + r.y1) / 2,
                'rect': r,
                'xref': xref
            })
    img_list.sort(key=lambda x: (x['center_y'], x['rect'].x0))
    
    # Also extract full page text to slice question texts
    page_text = page.get_text()
    
    for i, qm in enumerate(q_matches):
        q_num = qm['num']
        if q_num == 1 and prev_num > 10:
            current_section += 1
        prev_num = q_num
        global_index += 1
        
        # Bounding y
        qy0 = qm['y0']
        qy1 = q_matches[i+1]['y0'] if i + 1 < len(q_matches) else 9999.0
        
        # Extract associated images
        q_imgs = [img for img in img_list if qy0 - 5 <= img['center_y'] < qy1]
        img_paths = []
        for img_idx, img_info in enumerate(q_imgs):
            xref = img_info['xref']
            pix = fitz.Pixmap(doc_ictp, xref)
            if pix.n >= 5:
                pix = fitz.Pixmap(fitz.csRGB, pix)
            img_filename = f"ictp_s{current_section}_q{q_num}_{img_idx+1}_{xref}.png"
            img_path = f"public/images/ictp/{img_filename}"
            pix.save(img_path)
            img_paths.append(f"images/ictp/{img_filename}")
        
        # Now extract the question text and options
        # We find the question pattern in page_text
        m_curr = re.search(r'(?:^|\n)\s*' + str(q_num) + r'\.【\s*' + qm['ans'] + r'\s*】', page_text)
        sub_text = ""
        if m_curr:
            curr_pos = m_curr.end()
            if i + 1 < len(q_matches):
                next_qm = q_matches[i+1]
                m_next = re.search(r'(?:^|\n)\s*' + str(next_qm['num']) + r'\.【\s*' + next_qm['ans'] + r'\s*】', page_text[curr_pos:])
                if m_next:
                    sub_text = page_text[curr_pos : curr_pos + m_next.start()]
                else:
                    sub_text = page_text[curr_pos:]
            else:
                sub_text = page_text[curr_pos:]
        
        # Parse options from sub_text
        # Options usually start at (A)
        opt_start = re.search(r'(?:\s|\n|^)\([A-D]\)', sub_text)
        question_stem = ""
        options = []
        if opt_start:
            question_stem = sub_text[:opt_start.start()].strip()
            options_text = sub_text[opt_start.start():].strip()
            # Split options (A), (B), (C), (D)
            opt_splits = re.split(r'(?:\s|\n|^)\(([A-D])\)\s*', options_text)
            # opt_splits format: ['', 'A', textA, 'B', textB, ...]
            for o in range(1, len(opt_splits), 2):
                letter = opt_splits[o]
                otext = opt_splits[o+1].strip() if o+1 < len(opt_splits) else ""
                options.append({'key': letter, 'text': otext})
        else:
            question_stem = sub_text.strip()
            for letter in ['A', 'B', 'C', 'D']:
                options.append({'key': letter, 'text': ''})
                
        keys_present = {o['key'] for o in options}
        for letter in ['A', 'B', 'C', 'D']:
            if letter not in keys_present:
                options.append({'key': letter, 'text': ''})
        options.sort(key=lambda o: o['key'])
                
        ictp_questions.append({
            'id': f"ictp_{current_section}_{q_num}",
            'globalIndex': global_index,
            'examId': 'ictp',
            'section': current_section,
            'sectionName': section_names[current_section],
            'number': q_num,
            'type': 'single',
            'typeLabel': '單選題',
            'question': question_stem if question_stem else "請根據下圖程式碼作答：",
            'options': options,
            'answer': qm['ans'],
            'images': img_paths,
            'page': pno + 1
        })

print(f"ICTP extracted total: {len(ictp_questions)} questions.")

# ==========================================
# 2. AIL Extraction
# ==========================================
print("\n--- Processing AIL ---")
ail_files = [
    ('AIL 國際認證題庫第一份.pdf', '第一份：人工智慧基礎概論與應用', 1),
    ('AIL 國際認證題庫第二份.pdf', '第二份：是非題與複選精選特訓', 2),
    ('AIL 國際認證題庫第三份.pdf', '第三份：單選與複選進階綜合題庫', 3)
]

def clean_ail_text(text):
    if not text:
        return ''
    # Remove leaked section headers at end
    text = re.sub(r'[\s\n]*二、\s*複選題[\s\n]*$', '', text)
    text = re.sub(r'[\s\n]*一、\s*(單選題|是非題)[\s\n]*$', '', text)
    
    text = text.replace('\r', '')
    # Collapse multiple blank lines
    text = re.sub(r'[ \t]*\n[ \t\n]*', '\n', text)
    
    # 1. ASCII-ASCII newline -> space
    text = re.sub(r'([a-zA-Z0-9,\.\(\)])\n([a-zA-Z0-9,\.\(\)])', r'\1 \2', text)
    # 2. CJK-CJK newline -> join without space
    cjk = r'[\u4e00-\u9fff\u3400-\u4dbf\uff00-\uffef\u3000-\u303f]'
    text = re.sub(f'({cjk})\n({cjk})', r'\1\2', text)
    # 3. CJK-ASCII or ASCII-CJK newline -> join without newline
    text = re.sub(f'({cjk})\n([a-zA-Z0-9_\\(\\)])', r'\1\2', text)
    text = re.sub(f'([a-zA-Z0-9_\\(\\)])\n({cjk})', r'\1\2', text)
    
    # Any leftover newlines
    text = re.sub(r'\n+', ' ', text)
    # Collapse spaces
    text = re.sub(r'[ \t]+', ' ', text)
    return text.strip()

ail_questions = []
ail_global_index = 0

for filename, part_name, part_num in ail_files:
    doc_ail = fitz.open(os.path.join(RAW_DIR, filename))
    text = ""
    for page in doc_ail:
        text += page.get_text() + "\n"
        
    # Split by: \n(\d+)\.【\s*([A-Za-zOXoxΟοＸｘ]+)\s*】
    parts = re.split(r'\n\s*(\d+)\.【\s*([A-Za-zOXoxΟοＸｘ]+)\s*】', text)
    # Header is parts[0]
    for k in range(1, len(parts), 3):
        q_num = int(parts[k])
        ans_raw = parts[k+1].strip()
        body = parts[k+2].strip()
        
        # Clean answer
        # Standardize O and X
        ans_clean = ""
        for ch in ans_raw:
            if ch in ['O', 'o', 'Ο', 'ο', '0']:
                ans_clean += 'O'
            elif ch in ['X', 'x', 'Ｘ', 'ｘ']:
                ans_clean += 'X'
            elif ch.upper() in 'ABCDE':
                ans_clean += ch.upper()
                
        # Determine question type
        if set(ans_clean).issubset({'O', 'X'}):
            q_type = 'true_false'
            type_label = '是非題'
            options = [
                {'key': 'O', 'text': '正確 (True)'},
                {'key': 'X', 'text': '錯誤 (False)'}
            ]
            question_stem = clean_ail_text(body)
        elif len(ans_clean) > 1:
            q_type = 'multiple'
            type_label = '複選題'
            # Parse options
            opt_start = re.search(r'(?:\s|\n|^)\([A-E]\)', body)
            if opt_start:
                question_stem = clean_ail_text(body[:opt_start.start()])
                opts_text = body[opt_start.start():].strip()
                opt_splits = re.split(r'(?:\s|\n|^)\(([A-E])\)\s*', opts_text)
                options = []
                for o in range(1, len(opt_splits), 2):
                    options.append({'key': opt_splits[o], 'text': clean_ail_text(opt_splits[o+1])})
            else:
                question_stem = clean_ail_text(body)
                options = [{'key': l, 'text': ''} for l in ['A', 'B', 'C', 'D']]
        else:
            q_type = 'single'
            type_label = '單選題'
            opt_start = re.search(r'(?:\s|\n|^)\([A-E]\)', body)
            if opt_start:
                question_stem = clean_ail_text(body[:opt_start.start()])
                opts_text = body[opt_start.start():].strip()
                opt_splits = re.split(r'(?:\s|\n|^)\(([A-E])\)\s*', opts_text)
                options = []
                for o in range(1, len(opt_splits), 2):
                    options.append({'key': opt_splits[o], 'text': clean_ail_text(opt_splits[o+1])})
            else:
                question_stem = clean_ail_text(body)
                options = [{'key': l, 'text': ''} for l in ['A', 'B', 'C', 'D']]
                
        ail_global_index += 1
        ail_questions.append({
            'id': f"ail_{part_num}_{q_type}_{q_num}_{ail_global_index}",
            'globalIndex': ail_global_index,
            'examId': 'ail',
            'section': part_num,
            'sectionName': part_name,
            'number': q_num,
            'type': q_type,
            'typeLabel': type_label,
            'question': question_stem,
            'options': options,
            'answer': ans_clean,
            'images': []
        })

print(f"AIL extracted total: {len(ail_questions)} questions.")

# ==========================================
# 3. EEC Extraction
# ==========================================
print("\n--- Processing EEC ---")
doc_eec = fitz.open(os.path.join(RAW_DIR, 'EEC企業電子規劃師_網路行銷(114&115)證照題庫(2026_10_12).pdf'))
os.makedirs('public/images/eec', exist_ok=True)

# Extract 6 images
eec_img_map = {
    3: 'images/eec/eec_p3_q15.png',
    10: 'images/eec/eec_p10_q22.png',
    21: 'images/eec/eec_p21_q36.png',
    23: 'images/eec/eec_p23_q47.png',
    35: 'images/eec/eec_p35_q10.png',
    36: 'images/eec/eec_p36_q13.png'
}

for pno_target, img_rel_path in eec_img_map.items():
    page = doc_eec[pno_target - 1]
    imgs = page.get_images()
    if imgs:
        xref = imgs[0][0]
        pix = fitz.Pixmap(doc_eec, xref)
        if pix.n >= 5:
            pix = fitz.Pixmap(fitz.csRGB, pix)
        pix.save("public/" + img_rel_path)

eec_raw_questions = []
current_unit = "單元一：行銷概念"

for pno, page in enumerate(doc_eec):
    try:
        tables = page.find_tables(strategy='lines').tables
    except Exception:
        tables = []
    if not tables:
        try:
            tables = page.find_tables().tables
        except Exception:
            tables = []
    for tab in tables:
        for r in tab.extract():
            c0 = (r[0] or '').strip()
            c1 = (r[1] or '').strip()
            if not c0 or c0 == '題目':
                continue
            if '單元' in c0 and (not c1 or c1 == '答案'):
                current_unit = c0.split('\n')[0].strip()
                continue
            
            m = re.match(r'^(\d+)\.\s*(.*)', c0, re.DOTALL)
            if m:
                eec_raw_questions.append({
                    'unit': current_unit,
                    'num': int(m.group(1)),
                    'raw_text': c0,
                    'ans': c1,
                    'page': pno + 1
                })
            elif eec_raw_questions:
                eec_raw_questions[-1]['raw_text'] += '\n' + c0
                if not eec_raw_questions[-1]['ans'] and c1:
                    eec_raw_questions[-1]['ans'] = c1

def clean_eec_soft_wraps(text):
    if not text:
        return ''
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    if len(lines) <= 1:
        return text.strip()
    result = lines[0]
    for next_line in lines[1:]:
        prev_char = result[-1] if result else ''
        next_char = next_line[0] if next_line else ''
        is_prev_cjk = '\u4e00' <= prev_char <= '\u9fff' or prev_char in '，。；：！？（）「」《》、'
        is_next_cjk = '\u4e00' <= next_char <= '\u9fff' or next_char in '，。；：！？（）「」《》、'
        if is_prev_cjk and is_next_cjk:
            result += next_line
        elif is_prev_cjk or is_next_cjk:
            if next_char in '，。；：！？（）「」《》、' or prev_char in '，。；：！？（）「」《》、':
                result += next_line
            else:
                result += ' ' + next_line
        else:
            result += ' ' + next_line
    return result

def clean_eec_stem(stem):
    if not stem:
        return ''
    lines = [l.strip() for l in stem.split('\n') if l.strip()]
    if len(lines) <= 1:
        return stem.strip()
    blocks = []
    current_block = [lines[0]]
    for l in lines[1:]:
        if re.match(r'^[\(（][0-9一二三四甲乙丙丁a-zA-Z][\)）]', l) or re.match(r'^[0-9一二三四甲乙丙丁][\.\)）、]', l):
            blocks.append(clean_eec_soft_wraps('\n'.join(current_block)))
            current_block = [l]
        else:
            current_block.append(l)
    blocks.append(clean_eec_soft_wraps('\n'.join(current_block)))
    return '\n'.join(blocks)

eec_questions = []
eec_global_index = 0

for q in eec_raw_questions:
    eec_global_index += 1
    raw = q['raw_text']
    # remove leading '12. '
    m_head = re.match(r'^\d+\.\s*(.*)', raw, re.DOTALL)
    body = m_head.group(1).strip() if m_head else raw
    
    ans_clean = q['ans'].strip().upper()
    is_multi = len(ans_clean) > 1 or '(複選)' in body or '（複選）' in body
    q_type = 'multiple' if is_multi else 'single'
    type_label = '複選題' if is_multi else '單選題'
    
    # Split options
    opt_start = re.search(r'(?:\s|\n|^)\([A-E]\)', body)
    options = []
    if opt_start:
        question_stem = clean_eec_stem(body[:opt_start.start()].strip())
        opts_text = body[opt_start.start():].strip()
        opt_splits = re.split(r'(?:\s|\n|^)\(([A-E])\)\s*', opts_text)
        for o in range(1, len(opt_splits), 2):
            options.append({'key': opt_splits[o], 'text': clean_eec_soft_wraps(opt_splits[o+1].strip())})
    else:
        question_stem = clean_eec_stem(body)
        options = [{'key': l, 'text': ''} for l in ['A', 'B', 'C', 'D']]
        
    # Check if this question gets an image
    q_images = []
    p = q['page']
    # Match specific image questions:
    if '如附圖所示' in question_stem or '如附圖' in question_stem:
        if p in eec_img_map:
            q_images.append(eec_img_map[p])
        elif (p + 1) in eec_img_map:
            q_images.append(eec_img_map[p+1])
            
    unit_prefix = '單元四' if '4' in q['unit'] else q['unit'][:3]
    eec_questions.append({
        'id': f"eec_{unit_prefix}_{q['num']}_{eec_global_index}",
        'globalIndex': eec_global_index,
        'examId': 'eec',
        'section': q['unit'],
        'sectionName': q['unit'],
        'number': q['num'],
        'type': q_type,
        'typeLabel': type_label,
        'question': question_stem,
        'options': options,
        'answer': ans_clean,
        'images': q_images,
        'page': p
    })

if len(eec_questions) == 0 and os.path.exists('public/data/eec.json'):
    try:
        with open('public/data/eec.json', 'r', encoding='utf-8') as f:
            saved_eec = json.load(f)
            if len(saved_eec) > 0:
                print(f"[Fallback] EEC extraction yielded 0 questions; restored {len(saved_eec)} questions from public/data/eec.json")
                eec_questions = saved_eec
    except Exception as e:
        print(f"Failed to restore eec.json: {e}")

print(f"EEC extracted total: {len(eec_questions)} questions.")

# ==========================================
# 4. TOEIC Extraction
# ==========================================
print("\n--- Processing TOEIC ---")
wb_toeic = openpyxl.load_workbook(os.path.join(RAW_DIR, 'TOEIC 必考單字與片語.xlsx'), data_only=True)
toeic_words = []
word_global_index = 0

for sheet_name in wb_toeic.sheetnames:
    sheet = wb_toeic[sheet_name]
    for r in sheet.iter_rows(values_only=True):
        if r[0] is not None and isinstance(r[0], (int, float)) and r[1]:
            word_global_index += 1
            toeic_words.append({
                'id': f"toeic_{word_global_index}",
                'globalIndex': word_global_index,
                'category': sheet_name,
                'no': int(r[0]),
                'word': str(r[1]).strip() if r[1] else '',
                'phonetic': str(r[2]).strip() if r[2] else '',
                'meaning': str(r[3]).strip() if r[3] else '',
                'pos': str(r[4]).strip() if r[4] else '',
                'sentence': str(r[5]).strip() if r[5] else '',
                'translation': str(r[6]).strip() if r[6] else '',
                'notes': str(r[7]).strip() if r[7] else ''
            })

# Pre-compile TOEIC questions with deterministic distractors at build time
toeic_rng = random.Random(42)
toeic_questions = []
for idx, w in enumerate(toeic_words):
    q_num = idx + 1
    other_indices = [i for i in range(len(toeic_words)) if i != idx]
    cat_indices = [i for i in range(len(toeic_words)) if i != idx and toeic_words[i]['category'] == w['category']]
    if len(cat_indices) >= 3:
        distractor_indices = toeic_rng.sample(cat_indices, 3)
    else:
        distractor_indices = toeic_rng.sample(other_indices, 3)
    distractors = [toeic_words[i]['meaning'] for i in distractor_indices]
    
    correct_pos = toeic_rng.randint(0, 3)
    opt_texts = list(distractors)
    opt_texts.insert(correct_pos, w['meaning'])
    
    keys = ['A', 'B', 'C', 'D']
    opts = [{'key': keys[i], 'text': opt_texts[i]} for i in range(4)]
    correct_key = keys[correct_pos]
    
    w_pos_str = f"({w['pos']})" if w['pos'] else ""
    toeic_questions.append({
        'id': f"toeic_{w['category']}_{q_num}",
        'globalIndex': q_num,
        'examId': 'toeic',
        'section': w['category'],
        'sectionName': w['category'],
        'number': q_num,
        'type': 'single',
        'typeLabel': '單選題',
        'question': f"請選出單字「{w['word']}」{w_pos_str} 的正確中文意思：",
        'options': opts,
        'answer': correct_key,
        'images': [],
        'toeicData': w
    })

print(f"TOEIC extracted total: {len(toeic_words)} vocabulary words, pre-compiled {len(toeic_questions)} questions.")

# ==========================================
# 5. Database Management System (DBMS) Extraction
# ==========================================
print("\n--- Processing Database Management System (DBMS) ---")
os.makedirs('public/images/dbms', exist_ok=True)
for old_f in os.listdir('public/images/dbms'):
    if old_f.startswith('dbms_'):
        try:
            os.remove(os.path.join('public/images/dbms', old_f))
        except OSError:
            pass

dbms_pdf_path = os.path.join(RAW_DIR, '資料庫管理系統', '115-1期中考試選擇題.pdf')
doc_dbms = fitz.open(dbms_pdf_path)

def abs_y(pnum, y):
    return (pnum - 1) * 1000.0 + y

# 1. Collect lines
dbms_all_lines = []
for pno, page in enumerate(doc_dbms):
    pnum = pno + 1
    d = page.get_text('dict')
    for b in d['blocks']:
        if b.get('type') == 0:
            for l in b['lines']:
                txt = "".join([s['text'] for s in l['spans']]).strip()
                if not txt:
                    continue
                if re.match(r'^\d{1,2}$', txt) and l['bbox'][1] > 550:
                    continue
                if txt == '試卷內容' or txt == '配分：' or re.match(r'^\[\d+\.\d+\]$', txt):
                    continue
                dbms_all_lines.append({
                    'pnum': pnum,
                    'bbox': l['bbox'],
                    'y0': l['bbox'][1],
                    'y1': l['bbox'][3],
                    'ay0': abs_y(pnum, l['bbox'][1]),
                    'ay1': abs_y(pnum, l['bbox'][3]),
                    'ay': abs_y(pnum, (l['bbox'][1] + l['bbox'][3]) / 2),
                    'text': txt
                })

dbms_all_lines.sort(key=lambda x: x['ay'])

# 2. Collect unique image placements
dbms_all_imgs = []
for pno, page in enumerate(doc_dbms):
    pnum = pno + 1
    seen_rects = set()
    for img in page.get_images():
        xref = img[0]
        for r in page.get_image_rects(xref):
            if pnum == 1 and r.y1 < 100:
                continue
            r_key = (round(r.x0, 1), round(r.y0, 1), round(r.x1, 1), round(r.y1, 1))
            if r_key in seen_rects:
                continue
            seen_rects.add(r_key)
            dbms_all_imgs.append({
                'pnum': pnum,
                'xref': xref,
                'rect': r,
                'ay0': abs_y(pnum, r.y0),
                'ay1': abs_y(pnum, r.y1),
                'ay': abs_y(pnum, (r.y0 + r.y1) / 2)
            })
dbms_all_imgs.sort(key=lambda x: x['ay'])

# 3. Collect radio dots
dbms_all_dots = []
for pno, page in enumerate(doc_dbms):
    pnum = pno + 1
    for dr in page.get_drawings():
        r = dr.get('rect')
        w = r.x1 - r.x0
        h = r.y1 - r.y0
        fill = dr.get('fill')
        if fill and fill != (1.0, 1.0, 1.0) and w < 7 and h < 7:
            dbms_all_dots.append({
                'pnum': pnum,
                'rect': r,
                'ay': abs_y(pnum, (r.y0 + r.y1) / 2),
                'x': (r.x0 + r.x1) / 2
            })
dbms_all_dots.sort(key=lambda x: x['ay'])

# 4. Collect checkmarks (\ue008)
dbms_all_checks = []
for pno, page in enumerate(doc_dbms):
    pnum = pno + 1
    for b in page.get_text('blocks'):
        if '\ue008' in b[4]:
            dbms_all_checks.append({
                'pnum': pnum,
                'ay': abs_y(pnum, (b[1] + b[3]) / 2),
                'x': (b[0] + b[2]) / 2
            })
dbms_all_checks.sort(key=lambda x: x['ay'])

# 5. Question boundaries
dbms_q_indices = []
for idx, l in enumerate(dbms_all_lines):
    txt = l['text']
    m = re.match(r'^(\d{1,2})\.\s*(.*)', txt)
    if m:
        num = int(m.group(1))
        rest = m.group(2)
        if num in [1, 2, 3] and '資料表中' in rest:
            continue
        if 1 <= num <= 74:
            dbms_q_indices.append((num, idx))

dbms_q_indices.sort(key=lambda x: x[0])

# Sections definition
dbms_sections_def = [
    (1, 13, 1, '第一單元：資料庫角色、系統架構與通訊協定'),
    (14, 49, 2, '第二單元：關聯式資料庫原理與資料完整性限制'),
    (50, 64, 3, '第三單元：實體關係模型 (ER Model) 與綱要轉換'),
    (65, 71, 4, '第四單元：資料庫正規化理論與實戰 (1NF/2NF/3NF)'),
    (72, 74, 5, '第五單元：SQL Server 資料庫架構與 DDL 語法')
]

def get_dbms_section(num):
    for start, end, s_id, s_name in dbms_sections_def:
        if start <= num <= end:
            return s_id, s_name
    return 1, '一般單元'

dbms_questions = []

for i, (qnum, start_idx) in enumerate(dbms_q_indices):
    end_idx = dbms_q_indices[i+1][1] if i + 1 < len(dbms_q_indices) else len(dbms_all_lines)
    q_lines = dbms_all_lines[start_idx:end_idx]
    
    start_ay = q_lines[0]['ay0']
    end_ay = dbms_all_lines[end_idx]['ay0'] if i + 1 < len(dbms_q_indices) else 999999.0
    
    # Associated images
    q_imgs = [img for img in dbms_all_imgs if start_ay - 5 <= img['ay'] < end_ay]
    
    # Save images
    saved_imgs = []
    for idx, img_info in enumerate(q_imgs):
        xref = img_info['xref']
        pix = fitz.Pixmap(doc_dbms, xref)
        if pix.n >= 5:
            pix = fitz.Pixmap(fitz.csRGB, pix)
        fname = f"dbms_q{qnum}_{idx+1}.png"
        fpath = os.path.join('public/images/dbms', fname)
        pix.save(fpath)
        saved_imgs.append(f"images/dbms/{fname}")
    
    stem_lines = []
    options = []
    curr_opt = None
    in_options = False
    
    for l in q_lines:
        txt = l['text']
        opt_match = re.match(r'^([a-f])\.(.*)', txt)
        if opt_match and not (qnum == 1 and not in_options and '下列何者' in txt):
            in_options = True
            letter = opt_match.group(1).upper()
            rest_text = opt_match.group(2).strip()
            curr_opt = {
                'key': letter,
                'text': rest_text,
                'ay0': l['ay0'],
                'ay1': l['ay1'],
                'pnum': l['pnum']
            }
            options.append(curr_opt)
        elif in_options and curr_opt:
            if not curr_opt['text']:
                curr_opt['text'] = txt
            else:
                curr_opt['text'] += ' ' + txt
            curr_opt['ay1'] = max(curr_opt['ay1'], l['ay1'])
        else:
            stem_lines.append(txt)
            
    # Clean stem text
    stem_raw = "\n".join(stem_lines)
    stem_clean = re.sub(r'^\s*' + str(qnum) + r'\.\s*', '', stem_raw).strip()
    
    # Custom format polish for complex tables / questions
    if qnum == 49:
        stem_clean = '您正在設定關聯式資料庫中某個資料表的結構。\n對於下列每一項敘述，請選取 [正確] 為 O 或 [錯誤] 為 X：\n\n1. 資料表中欄位的每個值都必須是唯一的。\n2. 資料表中的每個資料列都必須是唯一的。\n3. 資料表中的每個資料行名稱都必須是唯一的。'
    elif qnum == 64:
        stem_clean = '''您接受了某間地方慈善機構的 IT 實習工作。該慈善機構的資料模型有兩個資料表，名為 Chapter 和 Language，如下所示：

【Chapter 資料表】
ChapterId | City          | Region     | Country
1         | Chicago       | Illinois   | USA
2         | Los Angeles   | California | USA
3         | New York City | New York   | USA
4         | Toronto       | Ontario    | Canada

【Language 資料表】
LanguageId | LanguageName | Locale
1          | English      | USA
2          | English      | Canada
3          | Spanish      | Spain
4          | Spanish      | Mexico
5          | French       | France
5          | French       | Canada
6          | German       | Germany

您建立了名為 ChapterLanguage 的第三個資料表來關聯 Chapter 資料表和 Language 資料表。
您需要從 Chapter 和 Language 資料表中選取資料行，以便為 ChapterLanguage 資料表建立複合主索引鍵。
請問您應該選取哪兩個資料行？(請選擇 2 個答案)'''
    elif qnum == 69:
        stem_clean = '您需要將資料庫正規化為第一正規形式 (1NF)。\n請問您必須符合哪兩項需求？(請選擇 2 個答案)'
    elif qnum == 70:
        stem_clean = '''您有一個資料表包含以下資料：

ProductID | ProductCategory
32        | books
25        | books
67        | movies
89        | movies

請問哪一個資料庫詞彙是用來描述 ProductID 與 ProductCategory 之間的關聯性？'''
    elif qnum == 71:
        stem_clean = '''您建立了下列資料表，其中顯示過去寵物表演的獲勝者：

【寵物比賽獲勝者】
ID | Event                   | Year | PetID | Birthdate       | City
1  | Cutest Pet Fest         | 2009 | RG459 | 23-Jun-08       | Chicago
2  | Pet Babies Invitational | 2010 | SP372 | August 12, 2009 | Montreal
3  | Adorable Friends        | 2011 | BD116 | May 1, 2010     | Atlanta
4  | AWHH Fest 2012          | 2012 | FD228 | August 12, 2009 | Detroit

請問哪一個資料行可防止資料表成為第三正規形式 (3NF)？'''
    else:
        lines = [l.strip() for l in stem_clean.split('\n') if l.strip()]
        stem_clean = '\n'.join(lines)
        
    clean_options = []
    for o in options:
        otext = re.sub(r'\s+', ' ', o['text']).strip()
        clean_options.append({'key': o['key'], 'text': otext})
        
    q_dots = [d for d in dbms_all_dots if start_ay - 5 <= d['ay'] < end_ay]
    q_checks = [c for c in dbms_all_checks if start_ay - 5 <= c['ay'] < end_ay]
    
    selected_keys = set()
    for mark in q_dots + q_checks:
        may = mark['ay']
        best_opt = None
        min_dist = 999999
        for opt in options:
            opt_c = (opt['ay0'] + opt['ay1']) / 2
            dist = abs(may - opt_c)
            if dist < min_dist:
                min_dist = dist
                best_opt = opt
        if best_opt:
            selected_keys.add(best_opt['key'])
            
    ans_str = "".join(sorted(list(selected_keys)))
    is_multi = len(ans_str) > 1 or '請選擇2個答案' in stem_clean or '請選擇 2 個答案' in stem_clean
    
    s_id, s_name = get_dbms_section(qnum)
    
    dbms_questions.append({
        'id': f'dbms_{s_id}_{qnum}',
        'globalIndex': qnum,
        'examId': 'dbms',
        'section': s_id,
        'sectionName': s_name,
        'number': qnum,
        'type': 'multiple' if is_multi else 'single',
        'typeLabel': '複選題' if is_multi else '單選題',
        'question': stem_clean,
        'options': clean_options,
        'answer': ans_str,
        'images': saved_imgs,
        'page': q_lines[0]['pnum']
    })

print(f"DBMS extracted total: {len(dbms_questions)} questions.")

# ==========================================
# 6. Information Security (SEC) Extraction
# ==========================================
print("\n--- Processing Information Security (SEC) ---")
import zipfile
import xml.etree.ElementTree as ET

docx_dir = os.path.join(RAW_DIR, '資訊安全概論 總複習')

def extract_docx_paras(docx_path):
    with zipfile.ZipFile(docx_path) as z:
        xml_content = z.read('word/document.xml')
        tree = ET.fromstring(xml_content)
        paras = [''.join([n.text for n in p.iter() if n.tag.endswith('}t') and n.text]).strip() 
                 for p in tree.iter() if p.tag.endswith('}p')]
        paras = [p for p in paras if p]
    return paras

sec_files_def = [
    ('H11410301_1基礎資安概念1.docx', 1, '基礎概念 (一)：資訊系統架構與 CIA 三要素'),
    ('H11410301_1基礎資安概念2.docx', 2, '基礎概念 (二)：安全服務、安全機制與密碼學'),
    ('H11410301_1基礎資安概念3.docx', 3, '基礎概念 (三)：綜合應用與實務案例'),
    ('H11410301_2資安總複習1.docx', 4, '總複習 (一)：高階攻擊技術、事件管理與威脅情報'),
    ('H11410301_2資安總複習2.docx', 5, '總複習 (二)：零信任架構、AI 安全與雲端行動防護'),
    ('H11410301_2資安總複習3.docx', 6, '總複習 (三)：滲透測試、紅隊演練與事件回應'),
    ('H11410301_2資安總複習4.docx', 7, '總複習 (四)：事件回應挑戰與合規標準'),
    ('H11410301_2資安總複習5.docx', 8, '總複習 (五)：新興技術安全挑戰 (AI/雲端/行動/工控)')
]

sec_questions = []
sec_global_index = 0

for fn, sec_id, sec_name in sec_files_def:
    fpath = os.path.join(docx_dir, fn)
    if not os.path.exists(fpath):
        continue
    paras = extract_docx_paras(fpath)
    i = 0
    while i < len(paras):
        p = paras[i]
        if not re.match(r'^\d+\.', p) and not re.match(r'^[A-D]\.', p):
            i += 1
            continue
        m_q = re.match(r'^(\d+)\.\s*(.*?)(?:\s+([A-D](?:\s+[A-D])*))?$', p)
        if m_q:
            orig_num = int(m_q.group(1))
            q_text = m_q.group(2).strip()
            ans_raw = m_q.group(3) if m_q.group(3) else 'A'
            ans_clean = ''.join(ans_raw.split())
            
            i += 1
            opt_lines = []
            while i < len(paras) and not re.match(r'^\d+\.', paras[i]) and (re.search(r'\b[A-D]\.', paras[i]) or not any(paras[i].startswith(h) for h in ['資訊', '安全', '綜合', '密碼', '實務', '高階', '事件', '合規', '威脅', '零信任', 'AI', '雲端', '工控', '滲透', '資安', '###'])):
                opt_lines.append(paras[i])
                i += 1
            
            combined_opts = ' '.join(opt_lines)
            opts = []
            seen_keys = set()
            opt_matches = list(re.finditer(r'([A-D])\.\s*(.*?)(?=(?:[A-D]\.|$))', combined_opts))
            for om in opt_matches:
                k = om.group(1)
                if k not in seen_keys:
                    seen_keys.add(k)
                    opts.append({'key': k, 'text': om.group(2).strip()})
                
            sec_global_index += 1
            is_multi = len(ans_clean) > 1
            sec_questions.append({
                'id': f'sec_{sec_id}_{sec_global_index}',
                'globalIndex': sec_global_index,
                'examId': 'sec',
                'section': sec_id,
                'sectionName': sec_name,
                'number': sec_global_index,
                'type': 'multiple' if is_multi else 'single',
                'typeLabel': '複選題' if is_multi else '單選題',
                'question': q_text,
                'options': opts,
                'answer': ans_clean,
                'images': []
            })
        else:
            i += 1

print(f"SEC extracted total: {len(sec_questions)} questions.")

# ==========================================
# 7. Network Service Management (NSM) Extraction
# ==========================================
print("\n--- Processing Network Service Management (NSM) ---")
import unicodedata
import random

doc_nsm = fitz.open(os.path.join(RAW_DIR, '網路服務管理 單字.pdf'))
full_text = unicodedata.normalize('NFKC', ''.join(p.get_text() + '\n' for p in doc_nsm))
lines = [l.strip() for l in full_text.split('\n') if l.strip()]

words = []
curr_word = None
curr_meanings = []
def has_chinese(s):
    return any('\u4e00' <= ch <= '\u9fff' for ch in s)

for l in lines:
    if not has_chinese(l):
        if curr_word is not None and not curr_meanings:
            curr_word += ' ' + l
        else:
            if curr_word:
                words.append({'word': curr_word, 'meanings': curr_meanings})
            curr_word = l
            curr_meanings = []
    else:
        if curr_word is None:
            continue
        curr_meanings.append(l)

if curr_word:
    words.append({'word': curr_word, 'meanings': curr_meanings})

cleaned_words = []
seen = set()
for w in words:
    wt = w['word'].strip()
    if wt == 'employ' and wt in seen:
        continue
    seen.add(wt)
    ms = []
    for m in w['meanings']:
        if m == '目的地目的文目的':
            m = '目的地 / 目的端'
        if m not in ms:
            ms.append(m)
    cleaned_words.append({'word': wt, 'meaning': '、'.join(ms)})

nsm_questions = []
total_w = len(cleaned_words)
nsm_sections = [
    (1, 24, 1, '第一單元：基礎傳輸與資料結構'),
    (25, 48, 2, '第二單元：網路硬體、協定與位址'),
    (49, 71, 3, '第三單元：系統管理與網路操作')
]

def get_nsm_section(idx):
    for start, end, s_id, s_name in nsm_sections:
        if start <= idx <= end:
            return s_id, s_name
    return 1, '一般單元'

rng = random.Random(42)

for idx, w in enumerate(cleaned_words):
    q_num = idx + 1
    s_id, s_name = get_nsm_section(q_num)
    
    other_indices = [i for i in range(total_w) if i != idx]
    distractor_indices = rng.sample(other_indices, 3)
    distractors = [cleaned_words[i]['meaning'] for i in distractor_indices]
    
    correct_pos = rng.randint(0, 3)
    opt_texts = list(distractors)
    opt_texts.insert(correct_pos, w['meaning'])
    
    keys = ['A', 'B', 'C', 'D']
    opts = [{'key': keys[i], 'text': opt_texts[i]} for i in range(4)]
    correct_key = keys[correct_pos]
    
    w_word = w['word']
    w_meaning = w['meaning']
    nsm_questions.append({
        'id': f'nsm_{s_id}_{q_num}',
        'globalIndex': q_num,
        'examId': 'nsm',
        'section': s_id,
        'sectionName': s_name,
        'number': q_num,
        'type': 'single',
        'typeLabel': '單選題',
        'question': f'請問英文單字/術語「{w_word}」的中文字義為何？',
        'options': opts,
        'answer': correct_key,
        'images': [],
        'toeicData': {
            'word': w_word,
            'phonetic': '',
            'meaning': w_meaning,
            'pos': '網路術語',
            'sentence': '',
            'translation': '',
            'notes': '網路服務管理核心字彙'
        }
    })

print(f"NSM extracted total: {len(nsm_questions)} questions.")

# Save JSON files
with open('public/data/sec.json', 'w', encoding='utf-8') as f:
    json.dump(sec_questions, f, ensure_ascii=False, indent=2)

with open('public/data/nsm.json', 'w', encoding='utf-8') as f:
    json.dump(nsm_questions, f, ensure_ascii=False, indent=2)

with open('public/data/dbms.json', 'w', encoding='utf-8') as f:
    json.dump(dbms_questions, f, ensure_ascii=False, indent=2)

with open('public/data/ictp.json', 'w', encoding='utf-8') as f:
    json.dump(ictp_questions, f, ensure_ascii=False, indent=2)

with open('public/data/ail.json', 'w', encoding='utf-8') as f:
    json.dump(ail_questions, f, ensure_ascii=False, indent=2)

with open('public/data/eec.json', 'w', encoding='utf-8') as f:
    json.dump(eec_questions, f, ensure_ascii=False, indent=2)

with open('public/data/toeic.json', 'w', encoding='utf-8') as f:
    json.dump(toeic_questions, f, ensure_ascii=False, indent=2)

# ==========================================
# 8. Listening Extraction
# ==========================================
print("\n--- Processing Listening ---")
listening_questions = []
try:
    import extract_listening
    listening_questions = extract_listening.questions
    with open('public/data/listening.json', 'w', encoding='utf-8') as f:
        json.dump(listening_questions, f, ensure_ascii=False, indent=2)
    print(f"Loaded {len(listening_questions)} listening questions.")
except Exception as e:
    print(f"Warning: Could not process listening questions: {e}")
    if os.path.exists('public/data/listening.json'):
        with open('public/data/listening.json', 'r', encoding='utf-8') as f:
            listening_questions = json.load(f)

# ==========================================
# 9. IoT & NSM HW4 Extraction
# ==========================================
print("\n--- Processing IoT & NSM HW4 ---")
iot_questions = []
nsm_hw4_questions = []
try:
    import extract_new_exams
    iot_questions = extract_new_exams.extract_iot()
    with open('public/data/iot.json', 'w', encoding='utf-8') as f:
        json.dump(iot_questions, f, ensure_ascii=False, indent=2)
    print(f"Loaded {len(iot_questions)} IoT questions.")

    nsm_hw4_questions = extract_new_exams.extract_nsm_hw4()
    with open('public/data/nsm_hw4.json', 'w', encoding='utf-8') as f:
        json.dump(nsm_hw4_questions, f, ensure_ascii=False, indent=2)
    print(f"Loaded {len(nsm_hw4_questions)} NSM HW4 questions.")
except Exception as e:
    print(f"Warning: Could not process IoT / NSM HW4 questions: {e}")
    if os.path.exists('public/data/iot.json'):
        with open('public/data/iot.json', 'r', encoding='utf-8') as f:
            iot_questions = json.load(f)
    if os.path.exists('public/data/nsm_hw4.json'):
        with open('public/data/nsm_hw4.json', 'r', encoding='utf-8') as f:
            nsm_hw4_questions = json.load(f)

# Exams Metadata
exams_meta = [
    {
        'id': 'listening',
        'title': '英文聽力測驗',
        'subTitle': f'TOEIC 多益聽力期中測驗題庫 (共 {len(listening_questions)} 題)',
        'description': '依據指定期中考題號（Part 1 ~ Part 4 共 33 題）完整收錄。附帶題目情境附圖、聽力對話／獨白完整英漢對照逐字稿、題目中英對照與精準詳解。',
        'badge': '多益聽力',
        'color': 'sky',
        'totalQuestions': len(listening_questions),
        'sections': [
            {'id': 1, 'name': '第一部分：Part 1 照片描述 (2題)', 'count': len([q for q in listening_questions if q.get('section') == 1])},
            {'id': 2, 'name': '第二部分：Part 2 應答問題 (4題)', 'count': len([q for q in listening_questions if q.get('section') == 2])},
            {'id': 3, 'name': '第三部分：Part 3 簡短對話 (15題)', 'count': len([q for q in listening_questions if q.get('section') == 3])},
            {'id': 4, 'name': '第四部分：Part 4 簡短獨白 (12題)', 'count': len([q for q in listening_questions if q.get('section') == 4])}
        ],
        'defaultTimeMinutes': 30,
        'passRate': 70
    },
    {
        'id': 'dbms',
        'title': '資料庫管理系統',
        'subTitle': f'期中線上測驗題庫 (共 {len(dbms_questions)} 題)',
        'description': '涵蓋資料庫角色、系統架構、SQL Server 通訊協定、關聯式資料庫觀念、資料完整性限制、ER 模型圖示符號、正規化理論 (1NF/2NF/3NF) 與 SQL DDL 語法等核心考題。',
        'badge': '資料庫期中考',
        'color': 'cyan',
        'totalQuestions': len(dbms_questions),
        'sections': [
            {'id': s_id, 'name': f'{s_name} ({len([q for q in dbms_questions if q["section"] == s_id])}題)', 'count': len([q for q in dbms_questions if q["section"] == s_id])}
            for _, _, s_id, s_name in dbms_sections_def
        ],
        'defaultTimeMinutes': 50,
        'passRate': 70
    },
    {
        'id': 'sec',
        'title': '資訊安全概論',
        'subTitle': '基礎概念與期中/總複習題庫 (共 159 題)',
        'description': '涵蓋系統架構 (SDLC/SSDLC)、CIA 三要素、安全服務與安全機制、密碼學、高階攻擊技術 (APT/DNS放大/供應鏈)、零信任架構、資安事件回應、AI 安全與雲端防護。',
        'badge': '資安概論',
        'color': 'violet',
        'totalQuestions': len(sec_questions),
        'sections': [
            {'id': 1, 'name': '基礎概念 (一)：資訊系統架構與 CIA 三要素 (20題)', 'count': 20},
            {'id': 2, 'name': '基礎概念 (二)：安全服務、安全機制與密碼學 (10題)', 'count': 10},
            {'id': 3, 'name': '基礎概念 (三)：綜合應用與實務案例 (19題)', 'count': 19},
            {'id': 4, 'name': '總複習 (一)：高階攻擊技術、事件管理與威脅情報 (20題)', 'count': 20},
            {'id': 5, 'name': '總複習 (二)：零信任架構、AI 安全與雲端行動防護 (20題)', 'count': 20},
            {'id': 6, 'name': '總複習 (三)：滲透測試、紅隊演練與事件回應 (20題)', 'count': 20},
            {'id': 7, 'name': '總複習 (四)：事件回應挑戰與合規標準 (20題)', 'count': 20},
            {'id': 8, 'name': '總複習 (五)：新興技術安全挑戰 (AI/雲端/行動/工控) (30題)', 'count': 30}
        ],
        'defaultTimeMinutes': 50,
        'passRate': 70
    },
    {
        'id': 'nsm',
        'title': '網路服務管理 (核心英文字彙)',
        'subTitle': '核心英文字彙與專業術語 (共 71 題)',
        'description': '收錄網路服務管理必考核心英文字彙與專業術語（Frame、Routing Table、Flow Control、Mask 等），支援真人語音朗讀、釋義背題與隨堂測驗！',
        'badge': '網服單字',
        'color': 'teal',
        'totalQuestions': len(nsm_questions),
        'sections': [
            {'id': 1, 'name': '第一單元：基礎傳輸與資料結構 (24字)', 'count': 24},
            {'id': 2, 'name': '第二單元：網路硬體、協定與位址 (24字)', 'count': 24},
            {'id': 3, 'name': '第三單元：系統管理與網路操作 (23字)', 'count': 23}
        ],
        'defaultTimeMinutes': 30,
        'passRate': 70
    },
    {
        'id': 'nsm_hw4',
        'title': '網路服務管理 (設備操作 - 作業四)',
        'subTitle': f'作業四 設備操作與 Cisco CLI 實務 (共 {len(nsm_hw4_questions)} 題)',
        'description': '收錄作業四設備操作全題庫。涵蓋 Cisco 路由器與交換器 CLI 指令、running/startup-config、密碼加密、跳線與直線選擇、Trunk/VLAN 架構拓樸圖、SSH/Telnet 遠端登入與安全設定、Catalyst 2950 清除組態等核心考題。已完成正解校驗與詳解！',
        'badge': '網服設備操作',
        'color': 'emerald',
        'totalQuestions': len(nsm_hw4_questions),
        'sections': [
            {'id': 1, 'name': '第一部分：Cisco 基礎操作、設定檔與密碼加密 (8題)', 'count': 8},
            {'id': 2, 'name': '第二部分：網路連線、線材、Trunk 與 VLAN 實務 (9題)', 'count': 9},
            {'id': 3, 'name': '第三部分：SSH 安全連線、Telnet 排錯與設備維護 (8題)', 'count': 8}
        ],
        'defaultTimeMinutes': 30,
        'passRate': 70
    },
    {
        'id': 'iot',
        'title': '物聯網智慧應用及技術',
        'subTitle': f'期中/證照線上測驗題庫 (共 {len(iot_questions)} 題)',
        'description': '收錄物聯網三層架構（感知層/網路層/應用層）、發展戰略、智慧社區/醫療/電網/交通、感測器、ZigBee/藍芽/條碼技術，以及 LoRa、MQTT、CoAP、邊緣運算、IIoT 與 Matter 最新標準考題。',
        'badge': '物聯網期中',
        'color': 'amber',
        'totalQuestions': len(iot_questions),
        'sections': [
            {'id': 1, 'name': '第一單元：物聯網概念、政策與架構分層 (9題)', 'count': 9},
            {'id': 2, 'name': '第二單元：物聯網智慧應用實務 (社區/電網/醫療/交通) (18題)', 'count': 18},
            {'id': 3, 'name': '第三單元：感測裝置、短距通訊與識別技術 (手機/ZigBee/藍芽/條碼) (23題)', 'count': 23},
            {'id': 4, 'name': '第四單元：進階物聯網協定、邊緣運算與資安 (LoRa/MQTT/CoAP/IIoT) (10題)', 'count': 10}
        ],
        'defaultTimeMinutes': 50,
        'passRate': 70
    },
    {
        'id': 'ictp',
        'title': 'ICTP 計算機程式語言國際認證',
        'subTitle': 'Python Essentials Level 題庫 (共 250 題)',
        'description': '涵蓋 Python 語法、運算子、容器型態、控制結構、函式模組、例外處理與演算法等核心觀念，支援程式碼截圖展示。',
        'badge': 'Python 認證',
        'color': 'indigo',
        'totalQuestions': len(ictp_questions),
        'sections': [
            {'id': 1, 'name': '第一部分：Python 基礎語法與運算 (83題)', 'count': 83},
            {'id': 2, 'name': '第二部分：資料型態、容器與控制結構 (58題)', 'count': 58},
            {'id': 3, 'name': '第三部分：函式、模組與檔案處理 (67題)', 'count': 67},
            {'id': 4, 'name': '第四部分：演算法、物件與進階應用 (42題)', 'count': 42}
        ],
        'defaultTimeMinutes': 50,
        'passRate': 70
    },
    {
        'id': 'ail',
        'title': 'AIL 人工智慧國際認證',
        'subTitle': '最新人工智慧概論認證題庫 (共 229 題)',
        'description': '包含單選題、是非題與複選精選題庫，深度考察機器學習、深度學習、大數據、電腦視覺與智慧應用領域。',
        'badge': 'AI 國際證照',
        'color': 'emerald',
        'totalQuestions': len(ail_questions),
        'sections': [
            {'id': 1, 'name': '第一份：人工智慧基礎概論與應用 (單選 72題)', 'count': 72},
            {'id': 2, 'name': '第二份：是非題 (36題) 與 複選題 (23題)', 'count': 59},
            {'id': 3, 'name': '第三份：單選題 (63題) 與 複選題 (35題)', 'count': 98}
        ],
        'defaultTimeMinutes': 50,
        'passRate': 70
    },
    {
        'id': 'eec',
        'title': 'EEC 企業電子規劃師 - 網路行銷',
        'subTitle': '電腦技能基金會 114/115 證照題庫 (共 250 題)',
        'description': '完整 5 大單元題庫，包含 4P/4C 行銷概念、網路消費者行為、SEO 關鍵字、社群行銷與成效分析，支援附圖考題。',
        'badge': '行銷專業證照',
        'color': 'amber',
        'totalQuestions': len(eec_questions),
        'sections': [
            {'id': '單元一：行銷概念', 'name': '單元一：行銷概念 (40題)', 'count': 40},
            {'id': '單元二：網路市場與消費者', 'name': '單元二：網路市場與消費者 (60題)', 'count': 60},
            {'id': '單元三、網路行銷規劃', 'name': '單元三：網路行銷規劃 (90題)', 'count': 90},
            {'id': '單元 4：網路行銷成效分析', 'name': '單元四：網路行銷成效分析 (35題)', 'count': 35},
            {'id': '單元五：顧客模式分析與資料庫行銷', 'name': '單元五：顧客模式分析與資料庫行銷 (25題)', 'count': 25}
        ],
        'defaultTimeMinutes': 60,
        'passRate': 70
    },
    {
        'id': 'toeic',
        'title': 'TOEIC 多益核心必考單字與片語',
        'subTitle': '13 大商務商用領域 (共 1,424 個單字片語)',
        'description': '包含一般商務、金融預算、製造業、辦公室等 13 個分類。支援「英選中」、「中選英」、「例句克漏字填空」測驗與真人發音朗讀！',
        'badge': '職場英語',
        'color': 'rose',
        'totalQuestions': len(toeic_words),
        'sections': [
            {'id': '一般商務', 'name': '一般商務 (113字)', 'count': 113},
            {'id': '製造業', 'name': '製造業 (98字)', 'count': 98},
            {'id': '金融＆預算', 'name': '金融＆預算 (107字)', 'count': 107},
            {'id': '企業發展', 'name': '企業發展 (89字)', 'count': 89},
            {'id': '辦公室', 'name': '辦公室 (144字)', 'count': 144},
            {'id': '人事', 'name': '人事 (113字)', 'count': 113},
            {'id': '採購', 'name': '採購 (113字)', 'count': 113},
            {'id': '技術層面', 'name': '技術層面 (90字)', 'count': 90},
            {'id': '房屋＆公司地產', 'name': '房屋＆公司地產 (96字)', 'count': 96},
            {'id': '旅遊', 'name': '旅遊 (151字)', 'count': 151},
            {'id': '外食', 'name': '外食 (97字)', 'count': 97},
            {'id': '娛樂', 'name': '娛樂 (106字)', 'count': 106},
            {'id': '保健', 'name': '保健 (107字)', 'count': 107}
        ],
        'defaultTimeMinutes': 30,
        'passRate': 70
    }
]

with open('public/data/exams_meta.json', 'w', encoding='utf-8') as f:
    json.dump(exams_meta, f, ensure_ascii=False, indent=2)

print("\nAll data extracted and saved successfully!")
