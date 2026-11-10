import json

questions = [
    # ==================== Part 1: 照片描述 ====================
    {
        "id": "listening_1_3",
        "globalIndex": 1,
        "examId": "listening",
        "section": 1,
        "sectionName": "第一部分：Part 1 照片描述 (Photographs)",
        "number": 3,
        "type": "single",
        "typeLabel": "單選題",
        "question": "【照片描述題】\n請選出最符合圖片內容的描述：",
        "options": [
            {"key": "A", "text": "The man is using garden clippers. (男子在使用園藝剪刀。)"},
            {"key": "B", "text": "The man is planting flowers. (男子在種花。)"},
            {"key": "C", "text": "The man is adjusting his cap. (男子在調整他的帽子。)"},
            {"key": "D", "text": "The man is spraying fertilizer. (男子在噴灑肥料。)"}
        ],
        "answer": "A",
        "images": ["images/listening/listening_q3_1.jpg"],
        "page": 5
    },
    {
        "id": "listening_1_6",
        "globalIndex": 2,
        "examId": "listening",
        "section": 1,
        "sectionName": "第一部分：Part 1 照片描述 (Photographs)",
        "number": 6,
        "type": "single",
        "typeLabel": "單選題",
        "question": "【照片描述題】\n請選出最符合圖片內容的描述：",
        "options": [
            {"key": "A", "text": "They are waiting at an airport terminal. (他們在機場航廈等候。)"},
            {"key": "B", "text": "Ground staff are shutting the entrance gate. (地勤人員在把登機口關上。)"},
            {"key": "C", "text": "The jet is taking off from a runway. (飛機在跑道上正要起飛。)"},
            {"key": "D", "text": "Passengers are boarding the jet. (乘客正在登機。)"}
        ],
        "answer": "D",
        "images": ["images/listening/listening_q6_1.jpg"],
        "page": 7
    },

    # ==================== Part 2: 應答問題 ====================
    {
        "id": "listening_2_13",
        "globalIndex": 3,
        "examId": "listening",
        "section": 2,
        "sectionName": "第二部分：Part 2 應答問題 (Question-Response)",
        "number": 13,
        "type": "single",
        "typeLabel": "單選題",
        "question": "【應答問題】\nShall we make reservations for dinner?\n(我們晚餐要先預約訂位嗎？)",
        "options": [
            {"key": "A", "text": "Do you have an invitation? (你有邀請函嗎？)"},
            {"key": "B", "text": "They are not required. (這不是必須的。)"},
            {"key": "C", "text": "The restaurant is on Halstead Avenue. (餐廳在霍爾斯特德大道。)"}
        ],
        "answer": "B",
        "images": [],
        "page": 11
    },
    {
        "id": "listening_2_16",
        "globalIndex": 4,
        "examId": "listening",
        "section": 2,
        "sectionName": "第二部分：Part 2 應答問題 (Question-Response)",
        "number": 16,
        "type": "single",
        "typeLabel": "單選題",
        "question": "【應答問題】\nHow many candidates have applied for the position?\n(有多少應徵者申請這個職位？)",
        "options": [
            {"key": "A", "text": "There has been a lot of interest. (有很多人有興趣。)"},
            {"key": "B", "text": "Please fill out the application. (請填這張申請表。)"},
            {"key": "C", "text": "The interview is at our main office. (面試在我們的總部大樓舉行。)"}
        ],
        "answer": "A",
        "images": [],
        "page": 13
    },
    {
        "id": "listening_2_21",
        "globalIndex": 5,
        "examId": "listening",
        "section": 2,
        "sectionName": "第二部分：Part 2 應答問題 (Question-Response)",
        "number": 21,
        "type": "single",
        "typeLabel": "單選題",
        "question": "【應答問題】\nIs email more convenient?\n(用電子郵件會比較方便嗎？)",
        "options": [
            {"key": "A", "text": "I called him yesterday. (我昨天打電話給他了。)"},
            {"key": "B", "text": "By express delivery services. (是透過快遞寄出的。)"},
            {"key": "C", "text": "No, I'd prefer it if you call me. (不，我比較希望你打電話給我。)"}
        ],
        "answer": "C",
        "images": [],
        "page": 16
    },
    {
        "id": "listening_2_27",
        "globalIndex": 6,
        "examId": "listening",
        "section": 2,
        "sectionName": "第二部分：Part 2 應答問題 (Question-Response)",
        "number": 27,
        "type": "single",
        "typeLabel": "單選題",
        "question": "【應答問題】\nWhich parking spaces are reserved for the disabled?\n(哪些停車位是保留給殘障人士的？)",
        "options": [
            {"key": "A", "text": "Fine, I'll take the bus. (很好，我會坐公車。)"},
            {"key": "B", "text": "10 dollars per hour. (每小時 10 美元。)"},
            {"key": "C", "text": "The ones with white signs. (有白色標誌的那些。)"}
        ],
        "answer": "C",
        "images": [],
        "page": 19
    },

    # ==================== Part 3: 簡短對話 ====================
    # Questions 32-34
    {
        "id": "listening_3_32",
        "globalIndex": 7,
        "examId": "listening",
        "section": 3,
        "sectionName": "第三部分：Part 3 簡短對話 (Conversations)",
        "number": 32,
        "type": "single",
        "typeLabel": "單選題",
        "question": "【簡短對話 (第 32-34 題)】\nW: Hi, I need to renew my driver's license as well as change the address. Also, I might have to pay some overdue parking tickets. Here is my license.\nM: You have 60 dollars' worth of unpaid fines. If you'd like me to process your request, you will need to pay the fines first. It's government policy.\nW: OK. I don't have enough cash on me. Is there an ATM nearby?\nM: There's one in the lobby and several at the post office next door.\n\nQ32. What does the woman want to do? (女子想要做什麼？)",
        "options": [
            {"key": "A", "text": "Apply for a permit (申請許可)"},
            {"key": "B", "text": "Purchase a license plate (購買車牌)"},
            {"key": "C", "text": "Talk with the manager (與經理談話)"},
            {"key": "D", "text": "Change information on her license (更改駕照上的資料)"}
        ],
        "answer": "D",
        "images": [],
        "page": 22
    },
    {
        "id": "listening_3_33",
        "globalIndex": 8,
        "examId": "listening",
        "section": 3,
        "sectionName": "第三部分：Part 3 簡短對話 (Conversations)",
        "number": 33,
        "type": "single",
        "typeLabel": "單選題",
        "question": "【簡短對話 (第 32-34 題)】\nW: Hi, I need to renew my driver's license as well as change the address. Also, I might have to pay some overdue parking tickets. Here is my license.\nM: You have 60 dollars' worth of unpaid fines. If you'd like me to process your request, you will need to pay the fines first. It's government policy.\nW: OK. I don't have enough cash on me. Is there an ATM nearby?\nM: There's one in the lobby and several at the post office next door.\n\nQ33. Where is this conversation most likely taking place? (本段會話最有可能在哪裡發生？)",
        "options": [
            {"key": "A", "text": "In a bank (銀行)"},
            {"key": "B", "text": "In the post office (郵局)"},
            {"key": "C", "text": "At a ticket booth (售票亭)"},
            {"key": "D", "text": "At a government service counter (政府機關的櫃台)"}
        ],
        "answer": "D",
        "images": [],
        "page": 22
    },
    {
        "id": "listening_3_34",
        "globalIndex": 9,
        "examId": "listening",
        "section": 3,
        "sectionName": "第三部分：Part 3 簡短對話 (Conversations)",
        "number": 34,
        "type": "single",
        "typeLabel": "單選題",
        "question": "【簡短對話 (第 32-34 題)】\nW: Hi, I need to renew my driver's license as well as change the address. Also, I might have to pay some overdue parking tickets. Here is my license.\nM: You have 60 dollars' worth of unpaid fines. If you'd like me to process your request, you will need to pay the fines first. It's government policy.\nW: OK. I don't have enough cash on me. Is there an ATM nearby?\nM: There's one in the lobby and several at the post office next door.\n\nQ34. Why is the man unable to fulfill the woman's request? (為什麼男子無法完成女子的要求？)",
        "options": [
            {"key": "A", "text": "She arrived late. (她太晚來了。)"},
            {"key": "B", "text": "She went to the wrong department. (她來到錯誤的部門。)"},
            {"key": "C", "text": "She hasn't paid her parking tickets. (她尚未繳納違規停車罰單。)"},
            {"key": "D", "text": "She forgot her password. (她忘記了她的密碼。)"}
        ],
        "answer": "C",
        "images": [],
        "page": 23
    },

    # Questions 35-37
    {
        "id": "listening_3_35",
        "globalIndex": 10,
        "examId": "listening",
        "section": 3,
        "sectionName": "第三部分：Part 3 簡短對話 (Conversations)",
        "number": 35,
        "type": "single",
        "typeLabel": "單選題",
        "question": "【簡短對話 (第 35-37 題)】\nM: Hi, I'm calling to discuss a shipment I received from you recently. Item number 47 was damaged on arrival. It has a noticeable tear. I would like to exchange it.\nW: I apologize for any inconvenience. If you return the item, we will provide a replacement immediately. We will also compensate you for the shipping cost.\nM: OK, thank you.\nW: I'm sorry again that this happened, and in the future we will try to improve our products' packaging.\n\nQ35. Why is the man calling? (男子為什麼打這通電話？)",
        "options": [
            {"key": "A", "text": "To compliment the staff (稱讚這家公司的員工)"},
            {"key": "B", "text": "To complain about their advertising (抱怨這家公司的廣告)"},
            {"key": "C", "text": "To inquire about a shipment schedule (詢問送貨時程)"},
            {"key": "D", "text": "To report a damaged item (回報商品毀損)"}
        ],
        "answer": "D",
        "images": [],
        "page": 24
    },
    {
        "id": "listening_3_36",
        "globalIndex": 11,
        "examId": "listening",
        "section": 3,
        "sectionName": "第三部分：Part 3 簡短對話 (Conversations)",
        "number": 36,
        "type": "single",
        "typeLabel": "單選題",
        "question": "【簡短對話 (第 35-37 題)】\nM: Hi, I'm calling to discuss a shipment I received from you recently. Item number 47 was damaged on arrival. It has a noticeable tear. I would like to exchange it.\nW: I apologize for any inconvenience. If you return the item, we will provide a replacement immediately. We will also compensate you for the shipping cost.\nM: OK, thank you.\nW: I'm sorry again that this happened, and in the future we will try to improve our products' packaging.\n\nQ36. Who most likely is the woman? (女子最有可能為誰？)",
        "options": [
            {"key": "A", "text": "A mailman (郵差)"},
            {"key": "B", "text": "A client (顧客)"},
            {"key": "C", "text": "A customer service representative (客服代表)"},
            {"key": "D", "text": "A product designer (產品設計師)"}
        ],
        "answer": "C",
        "images": [],
        "page": 25
    },
    {
        "id": "listening_3_37",
        "globalIndex": 12,
        "examId": "listening",
        "section": 3,
        "sectionName": "第三部分：Part 3 簡短對話 (Conversations)",
        "number": 37,
        "type": "single",
        "typeLabel": "單選題",
        "question": "【簡短對話 (第 35-37 題)】\nM: Hi, I'm calling to discuss a shipment I received from you recently. Item number 47 was damaged on arrival. It has a noticeable tear. I would like to exchange it.\nW: I apologize for any inconvenience. If you return the item, we will provide a replacement immediately. We will also compensate you for the shipping cost.\nM: OK, thank you.\nW: I'm sorry again that this happened, and in the future we will try to improve our products' packaging.\n\nQ37. What does the woman say they will do in the future? (女子說他們未來會做什麼？)",
        "options": [
            {"key": "A", "text": "Reduce delays (減少延誤)"},
            {"key": "B", "text": "Include a 24-hour help line (新增 24 小時客服專線)"},
            {"key": "C", "text": "Use better packaging (使用更好的包裝)"},
            {"key": "D", "text": "Provide efficient customer service (提供有效率的客戶服務)"}
        ],
        "answer": "C",
        "images": [],
        "page": 25
    },

    # Questions 50-52
    {
        "id": "listening_3_50",
        "globalIndex": 13,
        "examId": "listening",
        "section": 3,
        "sectionName": "第三部分：Part 3 簡短對話 (Conversations)",
        "number": 50,
        "type": "single",
        "typeLabel": "單選題",
        "question": "【簡短對話 (第 50-52 題)】\nM: Good afternoon, Jennifer. Kevin Shelby calling. A few properties you may be interested in have just hit the market. Do you have time to discuss them?\nW: Hi, Kevin. I'm pretty busy, but give me a brief rundown.\nM: The first is a three-bedroom townhouse in Williamstown, and the other is a two-bedroom apartment in St. Arthur.\nW: Forget about St. Arthur; it's too far. However, the Williamstown property sounds like it's right up my alley.\nM: I agree. When would you like to inspect it?\nW: I'm swamped with work all this week. Hmm, let's see. Next Monday lunchtime will work for me.\nM: Great. I'll lock that in and send you the details along with the address via email.\n\nQ50. What is the purpose of the man's telephone call? (男子打這通電話的目的是什麼？)",
        "options": [
            {"key": "A", "text": "To inquire about a service fee (詢問有關服務費的問題)"},
            {"key": "B", "text": "To arrange a possible property inspection (安排查看房屋的機會)"},
            {"key": "C", "text": "To invite a friend to an event (邀請朋友去參加活動)"},
            {"key": "D", "text": "To confirm a shipment date (確認送貨日期)"}
        ],
        "answer": "B",
        "images": [],
        "page": 34
    },
    {
        "id": "listening_3_51",
        "globalIndex": 14,
        "examId": "listening",
        "section": 3,
        "sectionName": "第三部分：Part 3 簡短對話 (Conversations)",
        "number": 51,
        "type": "single",
        "typeLabel": "單選題",
        "question": "【簡短對話 (第 50-52 題)】\nM: Good afternoon, Jennifer. Kevin Shelby calling. A few properties you may be interested in have just hit the market. Do you have time to discuss them?\nW: Hi, Kevin. I'm pretty busy, but give me a brief rundown.\nM: The first is a three-bedroom townhouse in Williamstown, and the other is a two-bedroom apartment in St. Arthur.\nW: Forget about St. Arthur; it's too far. However, the Williamstown property sounds like it's right up my alley.\nM: I agree. When would you like to inspect it?\nW: I'm swamped with work all this week. Hmm, let's see. Next Monday lunchtime will work for me.\nM: Great. I'll lock that in and send you the details along with the address via email.\n\nQ51. What will the woman do on Monday? (女子星期一會做什麼？)",
        "options": [
            {"key": "A", "text": "Work through her lunch break (午休時間也會繼續工作)"},
            {"key": "B", "text": "Have lunch with colleagues (和同事吃午餐)"},
            {"key": "C", "text": "Inspect the factory (視察工廠)"},
            {"key": "D", "text": "View a house (看房子)"}
        ],
        "answer": "D",
        "images": [],
        "page": 35
    },
    {
        "id": "listening_3_52",
        "globalIndex": 15,
        "examId": "listening",
        "section": 3,
        "sectionName": "第三部分：Part 3 簡短對話 (Conversations)",
        "number": 52,
        "type": "single",
        "typeLabel": "單選題",
        "question": "【簡短對話 (第 50-52 題)】\nM: Good afternoon, Jennifer. Kevin Shelby calling. A few properties you may be interested in have just hit the market. Do you have time to discuss them?\nW: Hi, Kevin. I'm pretty busy, but give me a brief rundown.\nM: The first is a three-bedroom townhouse in Williamstown, and the other is a two-bedroom apartment in St. Arthur.\nW: Forget about St. Arthur; it's too far. However, the Williamstown property sounds like it's right up my alley.\nM: I agree. When would you like to inspect it?\nW: I'm swamped with work all this week. Hmm, let's see. Next Monday lunchtime will work for me.\nM: Great. I'll lock that in and send you the details along with the address via email.\n\nQ52. What will the man do? (男子將會做什麼？)",
        "options": [
            {"key": "A", "text": "Send the woman some information (寄一些資訊給女子)"},
            {"key": "B", "text": "Haggle over the price (著手議價)"},
            {"key": "C", "text": "Send the keys to the woman (把鑰匙寄給女子)"},
            {"key": "D", "text": "Give the woman a lift (讓女子搭便車)"}
        ],
        "answer": "A",
        "images": [],
        "page": 35
    },

    # Questions 65-67 (with Sign)
    {
        "id": "listening_3_65",
        "globalIndex": 16,
        "examId": "listening",
        "section": 3,
        "sectionName": "第三部分：Part 3 簡短對話 (Conversations)",
        "number": 65,
        "type": "single",
        "typeLabel": "單選題",
        "question": "【簡短對話與指示牌 (第 65-67 題)】\nW: Hi, Lee. I'm at the convention center. It turns out that the Governor's Pavilion is vacant. Do you want me to see if I can get our convention moved?\nM: Really? The center's administrator said it wasn't available. Well, if it's not being used, then you should try to get our event transferred. The convention room will be far too crowded — not a good impression for over 100 bankers.\nW: That's what I was thinking. I'll take a walk over to the admin center and see what I can do. Do you know where it's situated?\nM: Next to the Memorial Hall entrance. You can't miss it.\n\nQ65. Why does the woman call the man? (女子為什麼打電話給男子？)",
        "options": [
            {"key": "A", "text": "For permission to change a location (請求允許更換地點)"},
            {"key": "B", "text": "For information about a bank (詢問有關銀行的資訊)"},
            {"key": "C", "text": "For confirmation of an event's start time (確認活動的開始時間)"},
            {"key": "D", "text": "For the exchange of some financial details (交換一些財務資料)"}
        ],
        "answer": "A",
        "images": ["images/listening/listening_q65_sign.jpg"],
        "page": 45
    },
    {
        "id": "listening_3_66",
        "globalIndex": 17,
        "examId": "listening",
        "section": 3,
        "sectionName": "第三部分：Part 3 簡短對話 (Conversations)",
        "number": 66,
        "type": "single",
        "typeLabel": "單選題",
        "question": "【簡短對話與指示牌 (第 65-67 題)】\nW: Hi, Lee. I'm at the convention center. It turns out that the Governor's Pavilion is vacant. Do you want me to see if I can get our convention moved?\nM: Really? The center's administrator said it wasn't available. Well, if it's not being used, then you should try to get our event transferred. The convention room will be far too crowded — not a good impression for over 100 bankers.\nW: That's what I was thinking. I'll take a walk over to the admin center and see what I can do. Do you know where it's situated?\nM: Next to the Memorial Hall entrance. You can't miss it.\n\nQ66. What does the woman say about the Governor's Pavilion? (有關州長會館，女子說了什麼？)",
        "options": [
            {"key": "A", "text": "It is next to Convention Room 1. (它在會議室一的旁邊。)"},
            {"key": "B", "text": "It is not being used. (它並非正在使用當中。)"},
            {"key": "C", "text": "It is bigger than the Memorial Hall. (它比紀念堂要大。)"},
            {"key": "D", "text": "It is too expensive to hire. (出租費用太高了。)"}
        ],
        "answer": "B",
        "images": ["images/listening/listening_q65_sign.jpg"],
        "page": 46
    },
    {
        "id": "listening_3_67",
        "globalIndex": 18,
        "examId": "listening",
        "section": 3,
        "sectionName": "第三部分：Part 3 簡短對話 (Conversations)",
        "number": 67,
        "type": "single",
        "typeLabel": "單選題",
        "question": "【簡短對話與指示牌 (第 65-67 題)】\nW: Hi, Lee. I'm at the convention center. It turns out that the Governor's Pavilion is vacant. Do you want me to see if I can get our convention moved?\nM: Really? The center's administrator said it wasn't available. Well, if it's not being used, then you should try to get our event transferred. The convention room will be far too crowded — not a good impression for over 100 bankers.\nW: That's what I was thinking. I'll take a walk over to the admin center and see what I can do. Do you know where it's situated?\nM: Next to the Memorial Hall entrance. You can't miss it.\n\nQ67. Look at the graphic. Which direction will the woman probably walk? (請看圖表。女子可能會往哪個方向走？)",
        "options": [
            {"key": "A", "text": "Straight ahead (往前直走)"},
            {"key": "B", "text": "Straight ahead and then to the left (直走後左轉)"},
            {"key": "C", "text": "To the left (左轉)"},
            {"key": "D", "text": "To the right (右轉)"}
        ],
        "answer": "D",
        "images": ["images/listening/listening_q65_sign.jpg"],
        "page": 46
    },

    # Questions 68-70 (with Directory)
    {
        "id": "listening_3_68",
        "globalIndex": 19,
        "examId": "listening",
        "section": 3,
        "sectionName": "第三部分：Part 3 簡短對話 (Conversations)",
        "number": 68,
        "type": "single",
        "typeLabel": "單選題",
        "question": "【簡短對話與樓層一覽表 (第 68-70 題)】\nM: Good morning. I have a delivery for Mr. Ling on Level Four.\nW: Mr. Ling is not at work this morning. May I sign for the package?\nM: The delivery instructions say that I must hand the parcel directly to Mr. Ling and that he must sign for it personally.\nW: Oh, I see. If you come back anytime after lunch, which ends at two o'clock, he will definitely be in his office. Oh, when you return, you can sign your name in the registration book next to the elevator and make your way directly to Level Four.\nM: Great! Thanks.\n\nQ68. Who most likely is the man? (男子最有可能為誰？)",
        "options": [
            {"key": "A", "text": "A lawyer (律師)"},
            {"key": "B", "text": "A janitor (門警)"},
            {"key": "C", "text": "A delivery person (送貨員)"},
            {"key": "D", "text": "A receptionist (接待員)"}
        ],
        "answer": "C",
        "images": ["images/listening/listening_q68_directory.jpg"],
        "page": 48
    },
    {
        "id": "listening_3_69",
        "globalIndex": 20,
        "examId": "listening",
        "section": 3,
        "sectionName": "第三部分：Part 3 簡短對話 (Conversations)",
        "number": 69,
        "type": "single",
        "typeLabel": "單選題",
        "question": "【簡短對話與樓層一覽表 (第 68-70 題)】\nM: Good morning. I have a delivery for Mr. Ling on Level Four.\nW: Mr. Ling is not at work this morning. May I sign for the package?\nM: The delivery instructions say that I must hand the parcel directly to Mr. Ling and that he must sign for it personally.\nW: Oh, I see. If you come back anytime after lunch, which ends at two o'clock, he will definitely be in his office. Oh, when you return, you can sign your name in the registration book next to the elevator and make your way directly to Level Four.\nM: Great! Thanks.\n\nQ69. What does the woman suggest? (女子建議做什麼事？)",
        "options": [
            {"key": "A", "text": "Making the delivery later (晚一點再送貨過來)"},
            {"key": "B", "text": "Taking the stairs (走樓梯)"},
            {"key": "C", "text": "Asking for directions (問路)"},
            {"key": "D", "text": "Having a lunch break (午休)"}
        ],
        "answer": "A",
        "images": ["images/listening/listening_q68_directory.jpg"],
        "page": 49
    },
    {
        "id": "listening_3_70",
        "globalIndex": 21,
        "examId": "listening",
        "section": 3,
        "sectionName": "第三部分：Part 3 簡短對話 (Conversations)",
        "number": 70,
        "type": "single",
        "typeLabel": "單選題",
        "question": "【簡短對話與樓層一覽表 (第 68-70 題)】\nM: Good morning. I have a delivery for Mr. Ling on Level Four.\nW: Mr. Ling is not at work this morning. May I sign for the package?\nM: The delivery instructions say that I must hand the parcel directly to Mr. Ling and that he must sign for it personally.\nW: Oh, I see. If you come back anytime after lunch, which ends at two o'clock, he will definitely be in his office. Oh, when you return, you can sign your name in the registration book next to the elevator and make your way directly to Level Four.\nM: Great! Thanks.\n\nQ70. Look at the graphic. Which company will the man make the delivery to? (請看圖表。男子將要送貨到哪家公司？)",
        "options": [
            {"key": "A", "text": "Citywide Real Estate (市大房屋仲介公司)"},
            {"key": "B", "text": "Andrews and White Accountants (安德魯斯愛懷德會計師事務所)"},
            {"key": "C", "text": "Morrison Enterprises Inc. (莫里斯企業)"},
            {"key": "D", "text": "Ling Attorneys (林英律師事務所)"}
        ],
        "answer": "D",
        "images": ["images/listening/listening_q68_directory.jpg"],
        "page": 49
    },

    # ==================== Part 4: 簡短獨白 ====================
    # Questions 74-76
    {
        "id": "listening_4_74",
        "globalIndex": 22,
        "examId": "listening",
        "section": 4,
        "sectionName": "第四部分：Part 4 簡短獨白 (Talks)",
        "number": 74,
        "type": "single",
        "typeLabel": "單選題",
        "question": "【會議摘錄獨白 (第 74-76 題)】\nLet's discuss the staffing requirements for our display at the annual Home Gardening Expo, which will be held on the first Saturday in June instead of the last Saturday in June. Last year we had a team of four from the sales department. I think we should double the staff this year by adding four technicians from the engineering and design department. They can answer all the technical questions about lawn mowers. Finally, we should also increase the bonus given to our expo team. I suggest a one-shot payment of $1,000.\n\nQ74. Where does the speaker most likely work? (說話者最可能在哪裡工作？)",
        "options": [
            {"key": "A", "text": "At the Home Gardening Expo (家庭園藝展)"},
            {"key": "B", "text": "At a design company (設計公司)"},
            {"key": "C", "text": "At a lawn mower manufacturer (生產割草機的公司)"},
            {"key": "D", "text": "At an employment agency (人力仲介公司)"}
        ],
        "answer": "C",
        "images": [],
        "page": 53
    },
    {
        "id": "listening_4_75",
        "globalIndex": 23,
        "examId": "listening",
        "section": 4,
        "sectionName": "第四部分：Part 4 簡短獨白 (Talks)",
        "number": 75,
        "type": "single",
        "typeLabel": "單選題",
        "question": "【會議摘錄獨白 (第 74-76 題)】\nLet's discuss the staffing requirements for our display at the annual Home Gardening Expo, which will be held on the first Saturday in June instead of the last Saturday in June. Last year we had a team of four from the sales department. I think we should double the staff this year by adding four technicians from the engineering and design department. They can answer all the technical questions about lawn mowers. Finally, we should also increase the bonus given to our expo team. I suggest a one-shot payment of $1,000.\n\nQ75. What is mentioned about the Home Gardening Expo? (家庭園藝展的什麼事有被提到？)",
        "options": [
            {"key": "A", "text": "It is always held on the same day. (它總是在同一天舉行。)"},
            {"key": "B", "text": "It is getting more popular. (它越來越受歡迎。)"},
            {"key": "C", "text": "It changed the schedule. (它改期了。)"},
            {"key": "D", "text": "It costs $1,000 to attend. (參展要花 1000 美元。)"}
        ],
        "answer": "C",
        "images": [],
        "page": 54
    },
    {
        "id": "listening_4_76",
        "globalIndex": 24,
        "examId": "listening",
        "section": 4,
        "sectionName": "第四部分：Part 4 簡短獨白 (Talks)",
        "number": 76,
        "type": "single",
        "typeLabel": "單選題",
        "question": "【會議摘錄獨白 (第 74-76 題)】\nLet's discuss the staffing requirements for our display at the annual Home Gardening Expo, which will be held on the first Saturday in June instead of the last Saturday in June. Last year we had a team of four from the sales department. I think we should double the staff this year by adding four technicians from the engineering and design department. They can answer all the technical questions about lawn mowers. Finally, we should also increase the bonus given to our expo team. I suggest a one-shot payment of $1,000.\n\nQ76. What will the expo team receive? (這個展覽工作小組將會獲得什麼？)",
        "options": [
            {"key": "A", "text": "An extra payment (加碼的獎金)"},
            {"key": "B", "text": "A lawn mower (一台割草機)"},
            {"key": "C", "text": "Refreshments (點心與飲料)"},
            {"key": "D", "text": "Free tickets (免費入場券)"}
        ],
        "answer": "A",
        "images": [],
        "page": 54
    },

    # Questions 77-79
    {
        "id": "listening_4_77",
        "globalIndex": 25,
        "examId": "listening",
        "section": 4,
        "sectionName": "第四部分：Part 4 簡短獨白 (Talks)",
        "number": 77,
        "type": "single",
        "typeLabel": "單選題",
        "question": "【電話留言獨白 (第 77-79 題)】\nHi, Andrew. I am calling to say that I'll be arriving at work late. There's been an accident on the expressway. The traffic report on the radio said that two trucks have overturned and are blocking all four lanes. I've been stuck in a traffic jam for over 30 minutes, and it looks like I'll be stationary for at least another hour. Oh, I'm supposed to mail the package that's on my desk. Could you take it to the reception desk before the mail is picked up at nine o'clock? Thanks. I'll call back to touch base if there are any developments. See you when I finally arrive.\n\nQ77. Why is the speaker calling? (說話者為什麼打電話？)",
        "options": [
            {"key": "A", "text": "To cancel an appointment (取消約會)"},
            {"key": "B", "text": "To explain his absence (解釋缺席原因)"},
            {"key": "C", "text": "To change a schedule (變更行程)"},
            {"key": "D", "text": "To make a criticism (做出批評)"}
        ],
        "answer": "B",
        "images": [],
        "page": 56
    },
    {
        "id": "listening_4_78",
        "globalIndex": 26,
        "examId": "listening",
        "section": 4,
        "sectionName": "第四部分：Part 4 簡短獨白 (Talks)",
        "number": 78,
        "type": "single",
        "typeLabel": "單選題",
        "question": "【電話留言獨白 (第 77-79 題)】\nHi, Andrew. I am calling to say that I'll be arriving at work late. There's been an accident on the expressway. The traffic report on the radio said that two trucks have overturned and are blocking all four lanes. I've been stuck in a traffic jam for over 30 minutes, and it looks like I'll be stationary for at least another hour. Oh, I'm supposed to mail the package that's on my desk. Could you take it to the reception desk before the mail is picked up at nine o'clock? Thanks. I'll call back to touch base if there are any developments. See you when I finally arrive.\n\nQ78. According to the speaker, what caused the delay? (根據說話者，什麼原因造成遲到？)",
        "options": [
            {"key": "A", "text": "An accident (車禍事故)"},
            {"key": "B", "text": "A flat tire (爆胎)"},
            {"key": "C", "text": "Some roadwork (部分道路施工)"},
            {"key": "D", "text": "A personal problem (個人問題)"}
        ],
        "answer": "A",
        "images": [],
        "page": 57
    },
    {
        "id": "listening_4_79",
        "globalIndex": 27,
        "examId": "listening",
        "section": 4,
        "sectionName": "第四部分：Part 4 簡短獨白 (Talks)",
        "number": 79,
        "type": "single",
        "typeLabel": "單選題",
        "question": "【電話留言獨白 (第 77-79 題)】\nHi, Andrew. I am calling to say that I'll be arriving at work late. There's been an accident on the expressway. The traffic report on the radio said that two trucks have overturned and are blocking all four lanes. I've been stuck in a traffic jam for over 30 minutes, and it looks like I'll be stationary for at least another hour. Oh, I'm supposed to mail the package that's on my desk. Could you take it to the reception desk before the mail is picked up at nine o'clock? Thanks. I'll call back to touch base if there are any developments. See you when I finally arrive.\n\nQ79. What does the speaker request help with? (說話者需要什麼幫忙？)",
        "options": [
            {"key": "A", "text": "Locating a colleague (找到同事)"},
            {"key": "B", "text": "Responding to an email (回覆郵件)"},
            {"key": "C", "text": "Contacting a client (連絡客戶)"},
            {"key": "D", "text": "Mailing a parcel (寄包裹)"}
        ],
        "answer": "D",
        "images": [],
        "page": 57
    },

    # Questions 83-85
    {
        "id": "listening_4_83",
        "globalIndex": 28,
        "examId": "listening",
        "section": 4,
        "sectionName": "第四部分：Part 4 簡短獨白 (Talks)",
        "number": 83,
        "type": "single",
        "typeLabel": "單選題",
        "question": "【會議摘錄獨白 (第 83-85 題)】\nHi, everyone. Before we start this meeting, I'd like to remind everyone that the air conditioners on Level Five will be replaced today. This means the elevators will be without power for about 30 minutes sometime around 10:30 this morning. We will be given 10 minutes' warning beforehand, which will be a brief ring of the fire alarm. During the time without the elevator, I suggest that we use the fire escape to walk up to higher floors and the stairs to walk down to lower floors. It's an annoyance, but it will make it safer on the narrow staircase. It's a pain, but it's not the end of the world.\n\nQ83. According to the speaker, what will take place today? (根據說話者，今天將會發生什麼事？)",
        "options": [
            {"key": "A", "text": "A fire drill (消防演習)"},
            {"key": "B", "text": "A workout session (體能鍛鍊)"},
            {"key": "C", "text": "Maintenance work (維修保養)"},
            {"key": "D", "text": "A software update (軟體更新)"}
        ],
        "answer": "C",
        "images": [],
        "page": 61
    },
    {
        "id": "listening_4_84",
        "globalIndex": 29,
        "examId": "listening",
        "section": 4,
        "sectionName": "第四部分：Part 4 簡短獨白 (Talks)",
        "number": 84,
        "type": "single",
        "typeLabel": "單選題",
        "question": "【會議摘錄獨白 (第 83-85 題)】\nHi, everyone. Before we start this meeting, I'd like to remind everyone that the air conditioners on Level Five will be replaced today. This means the elevators will be without power for about 30 minutes sometime around 10:30 this morning. We will be given 10 minutes' warning beforehand, which will be a brief ring of the fire alarm. During the time without the elevator, I suggest that we use the fire escape to walk up to higher floors and the stairs to walk down to lower floors. It's an annoyance, but it will make it safer on the narrow staircase. It's a pain, but it's not the end of the world.\n\nQ84. What does the speaker suggest? (說話者建議什麼？)",
        "options": [
            {"key": "A", "text": "Turning off the air conditioners (關掉空調)"},
            {"key": "B", "text": "Leaving work 10 minutes early (提早 10 分鐘下班)"},
            {"key": "C", "text": "Using both the fire escape and the stairs (爬太平梯和走樓梯)"},
            {"key": "D", "text": "Ignoring the fire alarm (不去理會火災警報)"}
        ],
        "answer": "C",
        "images": [],
        "page": 62
    },
    {
        "id": "listening_4_85",
        "globalIndex": 30,
        "examId": "listening",
        "section": 4,
        "sectionName": "第四部分：Part 4 簡短獨白 (Talks)",
        "number": 85,
        "type": "single",
        "typeLabel": "單選題",
        "question": "【會議摘錄獨白 (第 83-85 題)】\nHi, everyone. Before we start this meeting, I'd like to remind everyone that the air conditioners on Level Five will be replaced today. This means the elevators will be without power for about 30 minutes sometime around 10:30 this morning. We will be given 10 minutes' warning beforehand, which will be a brief ring of the fire alarm. During the time without the elevator, I suggest that we use the fire escape to walk up to higher floors and the stairs to walk down to lower floors. It's an annoyance, but it will make it safer on the narrow staircase. It's a pain, but it's not the end of the world.\n\nQ85. What does the speaker imply when he says, \"It's a pain, but it's not the end of the world\"? (說話者說『真令人討厭，但還未到世界末日』時，是什麼意思？)",
        "options": [
            {"key": "A", "text": "It's a temporary inconvenience. (那只是短時間的不便而已。)"},
            {"key": "B", "text": "It will be worth the wait. (那是值得等待的。)"},
            {"key": "C", "text": "The fire alarm is very loud. (火警警報器的聲音很大聲。)"},
            {"key": "D", "text": "The practice is dangerous. (這項措施是很危險的。)"}
        ],
        "answer": "A",
        "images": [],
        "page": 62
    },

    # Questions 98-100 (with Chart)
    {
        "id": "listening_4_98",
        "globalIndex": 31,
        "examId": "listening",
        "section": 4,
        "sectionName": "第四部分：Part 4 簡短獨白 (Talks)",
        "number": 98,
        "type": "single",
        "typeLabel": "單選題",
        "question": "【會議摘錄與圖表 (第 98-100 題)】\nAs you can see from the pie chart, our biggest market is Europe, which accounts for most of our revenue. What I'd really like to focus on today is our newest market, though. Although it is currently our smallest revenue stream, I believe it represents a huge potential opportunity for us. It has a population of more than 400 million, making it the fifth largest continent in terms of population size. We think that more and more people there will want cell phone service, so we anticipate it will account for as much as a quarter of our revenue over the next seven years while sales in the North American market will likely decline.\n\nQ98. Look at the graphic. Which region is the speaker mostly talking about? (請看圖表。說話者主要談論的是哪個地區？)",
        "options": [
            {"key": "A", "text": "South America (南美)"},
            {"key": "B", "text": "Asia (亞洲)"},
            {"key": "C", "text": "North America (北美)"},
            {"key": "D", "text": "Europe (歐洲)"}
        ],
        "answer": "A",
        "images": ["images/listening/listening_q98_chart.jpg"],
        "page": 75
    },
    {
        "id": "listening_4_99",
        "globalIndex": 32,
        "examId": "listening",
        "section": 4,
        "sectionName": "第四部分：Part 4 簡短獨白 (Talks)",
        "number": 99,
        "type": "single",
        "typeLabel": "單選題",
        "question": "【會議摘錄與圖表 (第 98-100 題)】\nAs you can see from the pie chart, our biggest market is Europe, which accounts for most of our revenue. What I'd really like to focus on today is our newest market, though. Although it is currently our smallest revenue stream, I believe it represents a huge potential opportunity for us. It has a population of more than 400 million, making it the fifth largest continent in terms of population size. We think that more and more people there will want cell phone service, so we anticipate it will account for as much as a quarter of our revenue over the next seven years while sales in the North American market will likely decline.\n\nQ99. Which type of company does the speaker most likely work for? (說話者最有可能在哪種類型的公司任職？)",
        "options": [
            {"key": "A", "text": "A travel agency (旅行社)"},
            {"key": "B", "text": "A smartphone manufacturer (智慧型手機製造商)"},
            {"key": "C", "text": "A food franchise (食品加盟店)"},
            {"key": "D", "text": "A carmaker (汽車製造商)"}
        ],
        "answer": "B",
        "images": ["images/listening/listening_q98_chart.jpg"],
        "page": 76
    },
    {
        "id": "listening_4_100",
        "globalIndex": 33,
        "examId": "listening",
        "section": 4,
        "sectionName": "第四部分：Part 4 簡短獨白 (Talks)",
        "number": 100,
        "type": "single",
        "typeLabel": "單選題",
        "question": "【會議摘錄與圖表 (第 98-100 題)】\nAs you can see from the pie chart, our biggest market is Europe, which accounts for most of our revenue. What I'd really like to focus on today is our newest market, though. Although it is currently our smallest revenue stream, I believe it represents a huge potential opportunity for us. It has a population of more than 400 million, making it the fifth largest continent in terms of population size. We think that more and more people there will want cell phone service, so we anticipate it will account for as much as a quarter of our revenue over the next seven years while sales in the North American market will likely decline.\n\nQ100. What does the speaker say about the North American market? (關於北美市場，說話者說了什麼？)",
        "options": [
            {"key": "A", "text": "It will eventually reach 30%. (最終將達到 30%。)"},
            {"key": "B", "text": "It has the largest population size. (人口量最大。)"},
            {"key": "C", "text": "It will decrease in the future. (未來會下降。)"},
            {"key": "D", "text": "It needs more investment. (需要更多投資。)"}
        ],
        "answer": "C",
        "images": ["images/listening/listening_q98_chart.jpg"],
        "page": 76
    }
]

with open('public/data/listening.json', 'w', encoding='utf-8') as f:
    json.dump(questions, f, ensure_ascii=False, indent=2)

print(f"Generated listening.json with {len(questions)} questions.")
