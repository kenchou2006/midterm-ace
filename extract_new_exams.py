import os
import re
import json
import zipfile
import xml.etree.ElementTree as ET
import email
from email import policy
from bs4 import BeautifulSoup

RAW_DIR = '題庫原檔'

def extract_iot():
    print('--- Processing IoT (物聯網智慧應用及技術) ---')
    iot_docx_path = os.path.join(RAW_DIR, '物聯網智慧應用及技術.docx')
    if not os.path.exists(iot_docx_path):
        print(f"Warning: {iot_docx_path} not found.")
        return []

    with zipfile.ZipFile(iot_docx_path) as z:
        xml_content = z.read('word/document.xml')
        tree = ET.fromstring(xml_content)
        paragraphs = []
        for p in tree.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'):
            texts = [node.text for node in p.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t') if node.text]
            if texts:
                paragraphs.append(''.join(texts).strip())

    parsed_raw = []
    current_q = None

    for p in paragraphs:
        m_header = re.match(r'^第\s*(\d+)\s*題\s*[：:](.*)', p)
        if m_header:
            if current_q:
                parsed_raw.append(current_q)
            q_num = int(m_header.group(1))
            q_title = m_header.group(2).strip()
            current_q = {
                'number': q_num,
                'title': q_title,
                'options': [],
                'answer_raw': ''
            }
            continue
        
        if current_q is None:
            continue
            
        m_opt = re.match(r'^\s*[\(（]([A-Da-d])[\)）]\s*(.*)', p)
        if m_opt and not p.startswith('【正確答案'):
            opt_key = m_opt.group(1).upper()
            opt_text = m_opt.group(2).strip()
            current_q['options'].append({'key': opt_key, 'text': opt_text})
            continue
            
        if p.startswith('【正確答案') or '【正確答案 / 解析】' in p:
            current_q['answer_raw'] = p
            continue
            
        if not current_q['options']:
            current_q['title'] += ' ' + p
        else:
            if current_q['answer_raw']:
                current_q['answer_raw'] += ' ' + p

    if current_q:
        parsed_raw.append(current_q)

    def get_iot_section(q_num):
        if 1 <= q_num <= 9:
            return 1, '第一單元：物聯網概念、政策與架構分層'
        elif 10 <= q_num <= 27:
            return 2, '第二單元：物聯網智慧應用實務 (社區/電網/醫療/交通)'
        elif 28 <= q_num <= 50:
            return 3, '第三單元：感測裝置、短距通訊與識別技術 (手機/ZigBee/藍芽/條碼)'
        else:
            return 4, '第四單元：進階物聯網協定、邊緣運算與資安 (LoRa/MQTT/CoAP/IIoT)'

    iot_questions = []
    for q in parsed_raw:
        q_num = q['number']
        sec_id, sec_name = get_iot_section(q_num)
        
        ans_keys = re.findall(r'[\(（]([A-D])[\)）]', q['answer_raw'])
        clean_keys = []
        for k in ans_keys:
            if k not in clean_keys:
                clean_keys.append(k)
        ans_str = ''.join(sorted(clean_keys))
        
        is_multi = len(clean_keys) > 1 or '複選' in q['title'] or '哪些' in q['title']
        exp = re.sub(r'^【正確答案\s*/?\s*解析】\s*', '', q['answer_raw']).strip()
        
        iot_questions.append({
            'id': f'iot_{sec_id}_{q_num}',
            'globalIndex': q_num,
            'examId': 'iot',
            'section': sec_id,
            'sectionName': sec_name,
            'number': q_num,
            'type': 'multiple' if is_multi else 'single',
            'typeLabel': '複選題' if is_multi else '單選題',
            'question': q['title'],
            'options': q['options'],
            'answer': ans_str,
            'images': [],
            'explanation': exp
        })

    print(f'IoT processed: {len(iot_questions)} questions.')
    return iot_questions


def extract_nsm_hw4():
    print('\n--- Processing NSM HW4 (網路服務管理 作業四 設備操作) ---')
    mhtml_path = os.path.join(RAW_DIR, '網路服務管理 作業四 設備操作.mhtml')
    if not os.path.exists(mhtml_path):
        print(f"Warning: {mhtml_path} not found.")
        return []

    os.makedirs('public/images/nsm', exist_ok=True)

    with open(mhtml_path, 'rb') as fp:
        msg = email.message_from_binary_file(fp, policy=policy.default)
        html_part = None
        for part in msg.walk():
            loc = part.get('Content-Location', '')
            if part.get_content_type() == 'text/html':
                html_part = part
            elif 'WMZYtWm5.png' in loc:
                with open('public/images/nsm/nsm_q10.png', 'wb') as f:
                    f.write(part.get_payload(decode=True))
            elif 'WMfVIeyt.png' in loc:
                with open('public/images/nsm/nsm_q15.png', 'wb') as f:
                    f.write(part.get_payload(decode=True))
            elif 'WMMeF4PD.png' in loc:
                with open('public/images/nsm/nsm_q19.png', 'wb') as f:
                    f.write(part.get_payload(decode=True))

    soup = BeautifulSoup(html_part.get_payload(decode=True).decode('utf-8', errors='replace'), 'html.parser')
    rows = soup.find_all('tr')

    def get_nsm_hw4_section(q_num):
        if 1 <= q_num <= 8:
            return 1, '第一部分：Cisco 基礎操作、設定檔與密碼加密'
        elif 9 <= q_num <= 17:
            return 2, '第二部分：網路連線、線材、Trunk 與 VLAN 實務'
        else:
            return 3, '第三部分：SSH 安全連線、Telnet 排錯與設備維護'

    # Verified standard answers & detailed explanations for NSM HW4
    # (Questions 4, 11, 12, 24 have student errors in original mhtml - verified & corrected here)
    nsm_hw4_answers = {
        1: ('D', '單選題', 'SSH (Secure Shell) 是專門用於安全加密遠端登入與指令傳輸的協定，預設連接埠為 TCP 22。Telnet 則為明文傳輸，不具安全性。'),
        2: ('C', '單選題', '在全域組態模式 Router(config)# 下執行 service password-encryption 指令，可將設定檔中所有現存及未來的明文密碼進行弱加密（Type 7）。'),
        3: ('A', '單選題', 'running-config 儲存在 RAM（記憶體）中，代表路由器目前的動態執行組態，關機或重新啟動後若未儲存將會消失。'),
        4: ('C', '單選題', '【校正說明：原測驗作答複選 A, C 錯誤】若要讓設定檔（如 running-config）中所有密碼不以明文顯示，標準指令為全域模式下的 service password-encryption。enable secret 僅使用 MD5 加密特權模式密碼，不能對其他密碼加密。'),
        5: ('AB', '複選題', 'Telnet 與 SSH 是透過 IP 網路遠端連線管理網路設備的協定（遠端登入 Remote Access）。Console 與 AUX 則為實體線路的本地登入。'),
        6: ('A', '單選題', '在 CLI 中使用 IOS 指令更改主機名稱（hostname），該指令會立即套用於正在執行的組態，儲存在 RAM（running-config）中，直到執行 copy running-config startup-config 才會存入 NVRAM。'),
        7: ('B', '單選題', 'SSH 的核心優點為透過公私鑰加密所有傳輸的資料與密碼（加密傳輸提高安全性），防範封包竊聽與中間人攻擊。'),
        8: ('A', '單選題', 'Cisco 路由器開機時，若在本地 FLASH 找不到 IOS 映像檔且 NVRAM 亦無設定檔，系統開機流程會嘗試透過網路連線到 TFTP 伺服器尋找並下載開機檔案。'),
        9: ('A', '單選題', 'PC 網卡與路由器 FastEthernet 介面兩者在乙太網路標準中同屬 MDI（Medium Dependent Interface）設備，兩台相同類型的設備直接相連時必須使用「跳線（Crossover Cable）」。'),
        10: ('CF', '複選題', '在交換器與路由器／伺服器之間傳遞多個 VLAN（VLAN 3 與 VLAN 4）的訊務時，兩台交換器之間的鏈路（Link C）以及核心交換器連接伺服器/路由器的幹線鏈路（Link F）必須設定為 Trunk（802.1Q 幹線）。'),
        11: ('ABE', '複選題', '【校正說明：原測驗作答 A, B, C, E 錯誤】設定 SSH 登入的核心指令包括：(A) crypto key generate rsa（產生加密金鑰並啟用 SSH）、(B) ip domain-name myCompany.com（設定網域名稱以產生 FQDN 金鑰）、(E) transport input ssh（限制 VTY 線路僅接受 SSH 登入）。line vty 0 4 僅為進入設定模式之指令，非 SSH 專用設定指令；vlan 1 ip 語法錯誤。'),
        12: ('AD', '複選題', '【校正說明：原測驗作答漏選 D 導致錯誤】本地登入（Local / Out-of-band 頻外管理）是指透過實體纜線直接連接設備硬體連接埠，包含 Console 埠與 AUX（Auxiliary 輔助埠）。Telnet 與 SSH 屬於網路遠端登入。'),
        13: ('A', '單選題', 'Cisco IOS 的提示字元中，井字號 #（例如 Router#）代表特權 EXEC 模式（Privileged EXEC Mode / 管理者模式）；大於符號 > 代表使用者 EXEC 模式。'),
        14: ('C', '單選題', 'Telnet 屬於應用層遠端登入協定，可透過 TCP/IP 網路遠端連線至設備 CLI 介面。Console 與 AUX 屬於本地端實體線路連接。'),
        15: ('B', '單選題', '由圖片中的 show version 輸出訊息可見：「191K bytes of NVRAM」。路由器的組態檔案（startup-config）儲存於 NVRAM 中，因此該路由器最大的組態檔案容量即為 191k bytes。'),
        16: ('A', '單選題', '在 Cisco 交換器上建立 802.1Q Trunk 幹線連線時，預設情況下（By default）所有已定義的 VLAN（VLAN 1 ~ 4094）皆被允許通過該 Trunk。'),
        17: ('B', '單選題', '在 Cisco 交換器的預設標準 VLAN 範圍（1 ~ 1005）中，VLAN 1 為預設且不可刪除之 VLAN，1002 ~ 1005 保留給 Token Ring 與 FDDI。因此一般網管人員可以自由增加、修改及刪除的 VLAN ID 範圍為 2 至 1001。'),
        18: ('B', '單選題', '在 Cisco IOS 中產生 RSA 加密金鑰前，必須先設定主機名稱（hostname）與網域名稱（ip domain-name），兩者結合成 FQDN 才能成功產生金鑰啟用 SSH。'),
        19: ('C', '單選題', '圖片中顯示「Password required, but none set」，表示在 line vty 線路上啟用了登入檢查（login），但尚未設定 vty 連線密碼（The vty password is missing），因此 Cisco IOS 基於安全保護拒絕 Telnet 連線。'),
        20: ('A', '單選題', '在虛擬終端線路模式 Router(config-line)# 下，指令 transport input ssh 可強制該 VTY 埠僅接受加密的 SSH 遠端連線，全面封鎖不安全的 Telnet。'),
        21: ('B', '單選題', 'PC 網卡為 MDI 設備，交換器（Switch）埠為 MDI-X 設備。不同類型的網路硬體設備直接相連時，應使用標準「直線（Straight-through Cable）」。'),
        22: ('BCE', '複選題', '將 Cisco Catalyst 2950 交換器完全清除舊組態以重新設定的三大步驟為：1. delete flash:vlan.dat（Delete the VLAN database）；2. erase startup-config（Erase the startup configuration）；3. reload（Restart the switch）。'),
        23: ('B', '單選題', '儲存在 NVRAM（非揮發性記憶體）中、設備關機或重開後依然保留的設定檔案為 startup-config（開機啟動設定檔）。'),
        24: ('ACE', '複選題', '【校正說明：原測驗作答漏選 A, C 錯誤】在 Cisco 設備上設定 SSH 安全登入的正確認證與啟用步驟包括：(A) 設定主機名稱（hostname）；(C) 產生 RSA 金鑰（crypto key generate rsa）；(E) 設定 VTY 僅接受 SSH（transport input ssh）。'),
        25: ('D', '單選題', '當路由器實體介面有限但需連接多個 VLAN 進行繞送時，最佳作法為採用「單臂路由器（Router-on-a-stick）」架構，在單一實體 FastEthernet 介面上建立多個子介面（Sub-interfaces）並配置 802.1Q 封裝與 IP 位址。')
    }

    nsm_hw4_questions = []

    for idx in range(9, 34):
        q_num = idx - 8
        r = rows[idx]
        tds = r.find_all('td')
        q_td = tds[2]
        
        ol = q_td.find('ol')
        q_title = ''
        for c in q_td.children:
            if c == ol:
                break
            if hasattr(c, 'stripped_strings'):
                q_title += ' '.join(c.stripped_strings) + ' '
            elif isinstance(c, str):
                q_title += c.strip() + ' '
        q_title = re.sub(r'^\d+\.\s*', '', q_title.strip())
        
        options = []
        if ol:
            for li_idx, li in enumerate(ol.find_all('li', recursive=False)):
                text = li.get_text(strip=True)
                inp = li.find('input')
                val = inp.get('value', '') if inp else ''
                if text.startswith(val):
                    text = text[len(val):].strip()
                # Clean prefix like B. Each single...
                text = re.sub(r'^[A-Z]\.\s*', '', text)
                options.append({'key': chr(65+li_idx), 'text': text})
                
        images = []
        if q_num == 10:
            images.append('images/nsm/nsm_q10.png')
        elif q_num == 15:
            images.append('images/nsm/nsm_q15.png')
        elif q_num == 19:
            images.append('images/nsm/nsm_q19.png')
            
        sec_id, sec_name = get_nsm_hw4_section(q_num)
        ans_raw, type_label, exp = nsm_hw4_answers[q_num]
        ans_str = ''.join(sorted(re.findall(r'[A-Za-z0-9]', ans_raw)))
        is_multi = len(ans_str) > 1 or type_label == '複選題'
        
        nsm_hw4_questions.append({
            'id': f'nsm_hw4_{sec_id}_{q_num}',
            'globalIndex': q_num,
            'examId': 'nsm_hw4',
            'section': sec_id,
            'sectionName': sec_name,
            'number': q_num,
            'type': 'multiple' if is_multi else 'single',
            'typeLabel': '複選題' if is_multi else '單選題',
            'question': q_title,
            'options': options,
            'answer': ans_str,
            'images': images,
            'explanation': exp
        })

    print(f'NSM HW4 processed: {len(nsm_hw4_questions)} questions.')
    return nsm_hw4_questions


if __name__ == '__main__':
    iot_qs = extract_iot()
    with open('public/data/iot.json', 'w', encoding='utf-8') as f:
        json.dump(iot_qs, f, ensure_ascii=False, indent=2)

    hw4_qs = extract_nsm_hw4()
    with open('public/data/nsm_hw4.json', 'w', encoding='utf-8') as f:
        json.dump(hw4_qs, f, ensure_ascii=False, indent=2)
    print("Finished extracting new exams.")
