import fitz
import openpyxl
import re
import json
import os

print("Starting extraction for all 4 exams...")

# ==========================================
# 1. ICTP Extraction
# ==========================================
print("\n--- Processing ICTP ---")
doc_ictp = fitz.open('(2026) ICTP 計算機程式語言國際認證Essentials Level題庫共250題.pdf')
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

ail_questions = []
ail_global_index = 0

for filename, part_name, part_num in ail_files:
    doc_ail = fitz.open(filename)
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
            question_stem = body
        elif len(ans_clean) > 1:
            q_type = 'multiple'
            type_label = '複選題'
            # Parse options
            opt_start = re.search(r'(?:\s|\n|^)\([A-E]\)', body)
            if opt_start:
                question_stem = body[:opt_start.start()].strip()
                opts_text = body[opt_start.start():].strip()
                opt_splits = re.split(r'(?:\s|\n|^)\(([A-E])\)\s*', opts_text)
                options = []
                for o in range(1, len(opt_splits), 2):
                    options.append({'key': opt_splits[o], 'text': opt_splits[o+1].strip()})
            else:
                question_stem = body
                options = [{'key': l, 'text': ''} for l in ['A', 'B', 'C', 'D']]
        else:
            q_type = 'single'
            type_label = '單選題'
            opt_start = re.search(r'(?:\s|\n|^)\([A-E]\)', body)
            if opt_start:
                question_stem = body[:opt_start.start()].strip()
                opts_text = body[opt_start.start():].strip()
                opt_splits = re.split(r'(?:\s|\n|^)\(([A-E])\)\s*', opts_text)
                options = []
                for o in range(1, len(opt_splits), 2):
                    options.append({'key': opt_splits[o], 'text': opt_splits[o+1].strip()})
            else:
                question_stem = body
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
doc_eec = fitz.open('EEC企業電子規劃師_網路行銷(114&115)證照題庫(2026_10_12).pdf')
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
    tables = page.find_tables().tables
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
        question_stem = body[:opt_start.start()].strip()
        opts_text = body[opt_start.start():].strip()
        opt_splits = re.split(r'(?:\s|\n|^)\(([A-E])\)\s*', opts_text)
        for o in range(1, len(opt_splits), 2):
            options.append({'key': opt_splits[o], 'text': opt_splits[o+1].strip()})
    else:
        question_stem = body
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
            
    eec_questions.append({
        'id': f"eec_{q['unit'][:3]}_{q['num']}_{eec_global_index}",
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

print(f"EEC extracted total: {len(eec_questions)} questions.")

# ==========================================
# 4. TOEIC Extraction
# ==========================================
print("\n--- Processing TOEIC ---")
wb_toeic = openpyxl.load_workbook('TOEIC 必考單字與片語.xlsx', data_only=True)
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

print(f"TOEIC extracted total: {len(toeic_words)} vocabulary words.")

# Save JSON files
with open('public/data/ictp.json', 'w', encoding='utf-8') as f:
    json.dump(ictp_questions, f, ensure_ascii=False, indent=2)

with open('public/data/ail.json', 'w', encoding='utf-8') as f:
    json.dump(ail_questions, f, ensure_ascii=False, indent=2)

with open('public/data/eec.json', 'w', encoding='utf-8') as f:
    json.dump(eec_questions, f, ensure_ascii=False, indent=2)

with open('public/data/toeic.json', 'w', encoding='utf-8') as f:
    json.dump(toeic_words, f, ensure_ascii=False, indent=2)

# Exams Metadata
exams_meta = [
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
