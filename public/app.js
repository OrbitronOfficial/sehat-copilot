'use strict';

/* ================= Strings ================= */
const STR = {
  en: {
    app_name: 'Sehat Copilot',
    local_note: 'Stored on this device',
    disclaimer: 'Sehat Copilot explains your records. It is not a diagnosis. Always confirm with your doctor.',
    nav_add: 'Add record', nav_timeline: 'Timeline', nav_health: 'My health', nav_ask: 'Ask', nav_abha: 'ABHA & export',
    add_title: 'Add a health record',
    add_sub: 'Upload a prescription, lab report or discharge summary as a photo or PDF.',
    drop_title: 'Drop a file here', drop_hint: 'Photo, PDF or text file. PDF and text up to 3 MB.',
    choose_file: 'Choose file', take_photo: 'Take photo',
    samples_title: 'Try a sample', samples_none: 'No samples available right now.',
    demo_btn: 'Load full demo profile', demo_hint: 'Adds a sample patient with several records and opens the timeline.',
    processing_title: 'Reading your document',
    step_read: 'Reading document', step_extract: 'Extracting', step_check: 'Checking values', step_write: 'Writing summary',
    review_title: 'Review and correct',
    review_sub: 'Compare with the original document. Fix anything that looks wrong, then save.',
    edit_title: 'Edit record',
    original: 'Original document', no_preview: 'The original file is not stored for this record.',
    f_type: 'Document type', f_title: 'Title', f_date: 'Date', f_facility: 'Hospital / lab', f_doctor: 'Doctor', f_followup: 'Follow-up',
    type_lab_report: 'Lab report', type_prescription: 'Prescription', type_discharge_summary: 'Discharge summary',
    type_diagnostic_report: 'Diagnostic report', type_other: 'Other',
    sec_tests: 'Tests', sec_meds: 'Medicines', sec_dx: 'Diagnoses', sec_advice: 'Advice',
    t_name: 'Test name', t_value: 'Value', t_unit: 'Unit', t_low: 'Range low', t_high: 'Range high', t_flag: 'Flag', t_range: 'Reference range',
    m_name: 'Medicine', m_generic: 'Generic name', m_strength: 'Strength', m_dose: 'Dose', m_freq: 'Frequency', m_timing: 'Timing', m_duration: 'Duration', m_instr: 'Instructions',
    add_test: 'Add test', add_med: 'Add medicine', add_dx: 'Add diagnosis', add_advice: 'Add advice', remove: 'Remove',
    no_items: 'None found.',
    flag_normal: 'Normal', flag_low: 'Low', flag_high: 'High', flag_critical: 'Critical', flag_unknown: 'Unknown',
    low_conf: 'Low confidence - please verify', unknown_med: 'Not in our medicine list - please verify',
    handwritten: 'Handwritten', conf_overall: 'Extraction confidence: {p}%', items_check: '{n} items need checking',
    ref_report: 'Range from your report', ref_standard: 'Standard range, not from your report',
    save: 'Save to my records', save_changes: 'Save changes', discard: 'Discard', cancel: 'Cancel', saving: 'Saving...',
    warnings_title: 'Please note',
    timeline_title: 'Health timeline', timeline_sub: 'Your saved records, newest first.',
    tl_empty: 'No records yet. Add your first record to start your timeline.', go_add: 'Add a record',
    filter_all: 'All', undated: 'No date',
    n_abn: '{a} abnormal of {n} tests', n_tests: '{n} tests', n_meds: '{n} medicines',
    back: 'Back to timeline', edit: 'Edit', delete: 'Delete', confirm_delete: 'Delete this record from this device?',
    expl_title: 'In plain language', findings: 'Key findings', questions: 'Questions to ask your doctor',
    med_purpose: 'What your medicines are for', loading_expl: 'Writing a plain-language explanation...',
    expl_fail: 'Could not load the explanation.', retry: 'Try again', structured: 'Details from the document',
    h_source: 'Source',
    health_title: 'My health', health_sub: 'Everything from your saved records in one place.',
    h_patient: 'Patient', h_name: 'Name', h_age: 'Age', h_sex: 'Sex', h_abha: 'ABHA number', not_linked: 'Not linked',
    h_conditions: 'Conditions', first_seen: 'first seen {d}', h_meds: 'Current medicines', from_rec: 'from {d}',
    h_latest: 'Latest test values', h_trends: 'Trends',
    no_trends: 'Trends appear once a test is measured in two or more records.',
    gen_overview: 'Generate overall summary', overview_title: 'Overall summary', highlights: 'Highlights', watch: 'Worth watching',
    none_yet: 'Nothing here yet. Save a record first.', band_note: 'Shaded band is the reference range.',
    ask_title: 'Ask about your records', ask_sub: 'Answers come only from the records saved on this device.',
    ask_ph: 'Type your question', ask_send: 'Ask',
    label_records: 'From your records', label_general: 'General information',
    label_doctor: 'Ask your doctor', label_emergency: 'Emergency',
    pet_name: 'Saathi', pet_sub: 'Your records guide. Not a doctor.', pet_open: 'Open Saathi, your records guide', pet_close: 'Close',
    pet_hello: 'Hi, I am Saathi. I can explain your saved records and show you around. I cannot diagnose or change medicines.',
    pet_tip_add: 'Start here: upload a photo or PDF of a prescription or lab report, or try a sample.',
    pet_tip_review: 'Check each value against the original on the left. Click a value to see the line it was read from, then save.',
    pet_tip_timeline: 'Every saved record is here by date. Open one to see what it means in simple words.',
    pet_tip_health: 'This is your whole picture: conditions, medicines, latest values and how they changed.',
    pet_tip_ask: 'Ask me anything about your saved records. I will tell you where each answer comes from.',
    pet_tip_abha: 'Link a mock ABHA number here, or export all records as a FHIR bundle.',
    pet_q1: 'What changed since my last report?', pet_q2: 'Which values are outside the range?', pet_q3: 'Which medicines am I on?',
    pet_go_ask: 'Open full chat',
    zoom_open: 'Enlarge', zoom_hint: 'Tap the document to zoom in and out.', hw_check: 'Handwritten: check every item against the original',
    sign_in: 'Sign in', sign_out: 'Sign out', guest: 'Guest', demo_user: 'Demo account',
    stat_records: 'Records saved', stat_out: 'Values outside range', stat_meds: 'Current medicines', stat_cond: 'Conditions noted',
    how_1: 'Upload', how_1s: 'A photo or PDF of any prescription or report', how_2: 'Check', how_2s: 'Compare what was read with the original', how_3: 'Understand', how_3s: 'Plain-language summary, timeline and trends',
    q1: 'What changed since my last report?', q2: 'Which medicines am I on and why?', q3: 'Which values should I discuss with my doctor?',
    thinking: 'Looking through your records...', sources: 'Sources', you: 'You', assistant: 'Sehat Copilot',
    ask_empty: 'Save at least one record to ask questions.',
    abha_title: 'ABHA & export',
    abha_about1: 'ABDM (Ayushman Bharat Digital Mission) is India\'s national digital health system. Your ABHA number is a 14-digit health ID that lets records follow you across hospitals.',
    abha_about2: 'Sehat Copilot structures your records in FHIR, the format ABDM uses, so they are ready to share when you choose.',
    abha_demo: 'Demo: simulated ABDM sandbox, no real health data is fetched.',
    abha_link: 'Link ABHA (mock)', abha_label: 'ABHA number', abha_linked: 'Linked: {n}', abha_addr: 'ABHA address',
    abha_import: 'Import records from ABHA (mock)', abha_imported: 'Imported {n} new records from ABHA.',
    abha_bad: 'Enter a 14-digit ABHA number.',
    fhir_title: 'Export for ABDM / FHIR', fhir_note: 'Creates a FHIR R4 bundle of your profile and records.',
    fhir_btn: 'Export FHIR bundle', fhir_prev: 'Preview bundle', fhir_counts: 'Resources in the bundle',
    src_from: 'Read from', src_box: 'Source line', src_hint: 'Click a value to see the line it was read from.',
    unread_title: 'Lines not used', unread_sub: 'These lines looked like data but could not be read reliably, so nothing was guessed. Add them by hand if they matter.',
    unit_skip: '{n} result(s) in a different unit are not compared.',
    consent: 'When you upload, the document is sent to third-party AI services (Google Gemini, with Groq, NVIDIA or OpenRouter as backups) only to read and explain it. Our server stores nothing. Records are kept on this device and you can delete any record or all data at any time.',
    privacy: 'Built around the consent, purpose-limitation and erasure principles of India\'s Digital Personal Data Protection Act, 2023. This is a student prototype, not a certified or audited service. Use sample or non-sensitive documents.',
    data_title: 'Your data', wipe_btn: 'Delete all my data', wipe_hint: 'Removes everything stored on this device.',
    confirm_wipe: 'Delete all records and your profile from this device? This cannot be undone.',
    err_network: 'Could not reach the server. Check your connection and try again.',
    err_server: 'The server returned an error ({code}).',
    err_type: 'This file type is not supported. Please use a photo, PDF or text file.',
    err_size: 'This file is larger than 3 MB. Please choose a smaller file.',
    err_image: 'Could not read this image. Try a different photo.',
    err_generic: 'Something went wrong. Please try again.',
    dismiss: 'Dismiss', working: 'Working...',
    sex_male: 'Male', sex_female: 'Female',
    label_signin: 'Sign in needed',
    signin_msg: 'To ask about your reports, please sign in first. It takes one click with the demo account.',
    use_demo_acct: 'Use demo account',
    mt_title: 'Medicines today', mt_empty: 'No medicines found in your prescriptions yet.',
    slot_morning: 'Morning', slot_afternoon: 'Afternoon', slot_night: 'Night', slot_prn: 'When needed', slot_weekly: 'Weekly', slot_asis: 'As prescribed',
    mt_count: '{x} of {y} taken today', mt_taken: 'taken',
    mt_remind: 'Remind me while this app is open', mt_remind_note: 'Reminders only work while this tab is open.',
    mt_remind_denied: 'Notifications are blocked in this browser, so reminders cannot be shown.',
    mt_note: 'This is the schedule written on your prescriptions. Do not change a medicine without asking your doctor.',
    mt_notif_title: 'Sehat Copilot reminder', mt_notif_body: '{slot}: {n} dose(s) from your prescriptions not ticked yet.',
    ph_title: 'Things to ask your pharmacist', ph_loading: 'Checking your medicines against a small reference list...',
    ph_fail: 'Could not check right now', ph_dup: 'Same ingredient twice: {ingredient} is in {names}',
    ph_none: 'Nothing to flag from our small reference list. That is not a guarantee.',
    sev_major: 'Major', sev_moderate: 'Moderate', sev_minor: 'Minor',
    visit_btn: 'Doctor visit summary', visit_title: 'Summary for my doctor', visit_generated: 'Generated on {d}',
    visit_cond: 'Conditions noted in my records', visit_meds: 'Current medicines', visit_abn: 'Latest values outside the reference range',
    visit_changes: 'Changes over time', visit_q: 'Questions I want to ask', visit_notes: 'My own notes',
    visit_how: 'How taken', visit_since: 'Since', visit_none: 'Nothing to list.',
    visit_noq: 'Open a record to see suggested questions here, or write your own below.',
    visit_footer: 'Prepared from the patient\'s own records by Sehat Copilot. Not a clinical document.',
    visit_print: 'Print or save as PDF', visit_back: 'Back',
    bk_title: 'Backup', bk_download: 'Download backup', bk_restore: 'Restore from backup',
    bk_note: 'Your records live only on this device. A backup file is how you move them to another device.',
    bk_done: 'Restored {n} records from the backup.', bk_saved: 'Backup downloaded.',
    bk_big: 'This file is larger than 40 MB, so it cannot be restored here.', bk_bad: 'This does not look like a Sehat Copilot backup file.'
  },
  hi: {
    app_name: 'सेहत कोपायलट',
    local_note: 'इस डिवाइस पर सहेजा गया',
    disclaimer: 'सेहत कोपायलट आपके रिकॉर्ड को समझाता है। यह निदान नहीं है। हमेशा अपने डॉक्टर से पुष्टि करें।',
    nav_add: 'रिकॉर्ड जोड़ें', nav_timeline: 'टाइमलाइन', nav_health: 'मेरी सेहत', nav_ask: 'पूछें', nav_abha: 'आभा और एक्सपोर्ट',
    add_title: 'स्वास्थ्य रिकॉर्ड जोड़ें',
    add_sub: 'पर्चा, लैब रिपोर्ट या डिस्चार्ज सारांश की फोटो या PDF अपलोड करें।',
    drop_title: 'फ़ाइल यहाँ छोड़ें', drop_hint: 'फोटो, PDF या टेक्स्ट फ़ाइल। PDF और टेक्स्ट अधिकतम 3 MB।',
    choose_file: 'फ़ाइल चुनें', take_photo: 'फोटो लें',
    samples_title: 'नमूना आज़माएँ', samples_none: 'अभी कोई नमूना उपलब्ध नहीं है।',
    demo_btn: 'पूरी डेमो प्रोफ़ाइल लोड करें', demo_hint: 'एक नमूना मरीज़ और कई रिकॉर्ड जोड़कर टाइमलाइन खोलता है।',
    processing_title: 'आपका दस्तावेज़ पढ़ा जा रहा है',
    step_read: 'दस्तावेज़ पढ़ना', step_extract: 'जानकारी निकालना', step_check: 'मान जाँचना', step_write: 'सारांश लिखना',
    review_title: 'जाँचें और सुधारें',
    review_sub: 'मूल दस्तावेज़ से मिलान करें। जो गलत लगे उसे ठीक करें, फिर सहेजें।',
    edit_title: 'रिकॉर्ड संपादित करें',
    original: 'मूल दस्तावेज़', no_preview: 'इस रिकॉर्ड की मूल फ़ाइल सहेजी नहीं गई है।',
    f_type: 'दस्तावेज़ का प्रकार', f_title: 'शीर्षक', f_date: 'तारीख', f_facility: 'अस्पताल / लैब', f_doctor: 'डॉक्टर', f_followup: 'अगली मुलाकात',
    type_lab_report: 'लैब रिपोर्ट', type_prescription: 'पर्चा', type_discharge_summary: 'डिस्चार्ज सारांश',
    type_diagnostic_report: 'जाँच रिपोर्ट', type_other: 'अन्य',
    sec_tests: 'जाँचें', sec_meds: 'दवाइयाँ', sec_dx: 'निदान', sec_advice: 'सलाह',
    t_name: 'जाँच का नाम', t_value: 'मान', t_unit: 'इकाई', t_low: 'सामान्य सीमा (न्यूनतम)', t_high: 'सामान्य सीमा (अधिकतम)', t_flag: 'स्थिति', t_range: 'सामान्य सीमा',
    m_name: 'दवा', m_generic: 'जेनेरिक नाम', m_strength: 'मात्रा (ताकत)', m_dose: 'खुराक', m_freq: 'कितनी बार', m_timing: 'समय', m_duration: 'अवधि', m_instr: 'निर्देश',
    add_test: 'जाँच जोड़ें', add_med: 'दवा जोड़ें', add_dx: 'निदान जोड़ें', add_advice: 'सलाह जोड़ें', remove: 'हटाएँ',
    no_items: 'कुछ नहीं मिला।',
    flag_normal: 'सामान्य', flag_low: 'कम', flag_high: 'अधिक', flag_critical: 'गंभीर', flag_unknown: 'अज्ञात',
    low_conf: 'कम भरोसा - कृपया जाँचें', unknown_med: 'हमारी दवा सूची में नहीं - कृपया जाँचें',
    handwritten: 'हाथ से लिखा', conf_overall: 'जानकारी निकालने का भरोसा: {p}%', items_check: '{n} चीज़ें जाँचने योग्य हैं',
    ref_report: 'सीमा आपकी रिपोर्ट से', ref_standard: 'मानक सीमा, आपकी रिपोर्ट से नहीं',
    save: 'मेरे रिकॉर्ड में सहेजें', save_changes: 'बदलाव सहेजें', discard: 'रद्द करें', cancel: 'वापस', saving: 'सहेजा जा रहा है...',
    warnings_title: 'कृपया ध्यान दें',
    timeline_title: 'स्वास्थ्य टाइमलाइन', timeline_sub: 'आपके सहेजे गए रिकॉर्ड, सबसे नए पहले।',
    tl_empty: 'अभी कोई रिकॉर्ड नहीं है। टाइमलाइन शुरू करने के लिए पहला रिकॉर्ड जोड़ें।', go_add: 'रिकॉर्ड जोड़ें',
    filter_all: 'सभी', undated: 'तारीख नहीं',
    n_abn: '{n} जाँचों में से {a} असामान्य', n_tests: '{n} जाँचें', n_meds: '{n} दवाइयाँ',
    back: 'टाइमलाइन पर वापस', edit: 'संपादित करें', delete: 'हटाएँ', confirm_delete: 'इस रिकॉर्ड को इस डिवाइस से हटाएँ?',
    expl_title: 'आसान भाषा में', findings: 'मुख्य निष्कर्ष', questions: 'डॉक्टर से पूछने के सवाल',
    med_purpose: 'आपकी दवाइयाँ किसलिए हैं', loading_expl: 'आसान भाषा में समझाया जा रहा है...',
    expl_fail: 'स्पष्टीकरण लोड नहीं हो सका।', retry: 'फिर कोशिश करें', structured: 'दस्तावेज़ का विवरण',
    h_source: 'स्रोत',
    health_title: 'मेरी सेहत', health_sub: 'आपके सहेजे गए सभी रिकॉर्ड एक जगह।',
    h_patient: 'मरीज़', h_name: 'नाम', h_age: 'उम्र', h_sex: 'लिंग', h_abha: 'आभा नंबर', not_linked: 'जुड़ा नहीं है',
    h_conditions: 'स्वास्थ्य स्थितियाँ', first_seen: 'पहली बार {d} को दिखा', h_meds: 'वर्तमान दवाइयाँ', from_rec: '{d} के रिकॉर्ड से',
    h_latest: 'नवीनतम जाँच मान', h_trends: 'रुझान',
    no_trends: 'जब कोई जाँच दो या अधिक रिकॉर्ड में हो, तब रुझान दिखेंगे।',
    gen_overview: 'कुल सारांश बनाएँ', overview_title: 'कुल सारांश', highlights: 'मुख्य बातें', watch: 'ध्यान देने योग्य',
    none_yet: 'अभी यहाँ कुछ नहीं है। पहले एक रिकॉर्ड सहेजें।', band_note: 'रंगीन पट्टी सामान्य सीमा दिखाती है।',
    ask_title: 'अपने रिकॉर्ड के बारे में पूछें', ask_sub: 'उत्तर केवल इस डिवाइस पर सहेजे रिकॉर्ड से आते हैं।',
    ask_ph: 'अपना सवाल लिखें', ask_send: 'पूछें',
    label_records: 'आपके रिकॉर्ड से', label_general: 'सामान्य जानकारी',
    label_doctor: 'अपने डॉक्टर से पूछें', label_emergency: 'आपातकाल',
    pet_name: 'साथी', pet_sub: 'आपके रिकॉर्ड का मार्गदर्शक। डॉक्टर नहीं।', pet_open: 'साथी खोलें, आपके रिकॉर्ड का मार्गदर्शक', pet_close: 'बंद करें',
    pet_hello: 'नमस्ते, मैं साथी हूँ। मैं आपके सहेजे रिकॉर्ड समझा सकता हूँ और ऐप में रास्ता दिखा सकता हूँ। मैं निदान नहीं करता और दवा नहीं बदलता।',
    pet_tip_add: 'यहाँ से शुरू करें: पर्ची या लैब रिपोर्ट की फ़ोटो या PDF अपलोड करें, या कोई नमूना आज़माएँ।',
    pet_tip_review: 'हर मान को बाईं ओर के मूल दस्तावेज़ से मिलाएँ। किसी मान पर क्लिक करें तो उसकी स्रोत पंक्ति दिखेगी, फिर सहेजें।',
    pet_tip_timeline: 'आपके सारे रिकॉर्ड यहाँ तारीख़ के अनुसार हैं। किसी को खोलें और सरल शब्दों में उसका मतलब देखें।',
    pet_tip_health: 'यह आपकी पूरी तस्वीर है: बीमारियाँ, दवाएँ, ताज़ा मान और उनमें आया बदलाव।',
    pet_tip_ask: 'अपने सहेजे रिकॉर्ड के बारे में कुछ भी पूछें। मैं बताऊँगा कि हर जवाब कहाँ से आया।',
    pet_tip_abha: 'यहाँ नकली (डेमो) ABHA नंबर जोड़ें, या सारे रिकॉर्ड FHIR बंडल के रूप में निर्यात करें।',
    pet_q1: 'पिछली रिपोर्ट के बाद क्या बदला?', pet_q2: 'कौन से मान सीमा से बाहर हैं?', pet_q3: 'मैं कौन सी दवाएँ ले रहा हूँ?',
    pet_go_ask: 'पूरी चैट खोलें',
    zoom_open: 'बड़ा करें', zoom_hint: 'ज़ूम करने के लिए दस्तावेज़ पर टैप करें।', hw_check: 'हाथ से लिखा है: हर चीज़ को मूल दस्तावेज़ से मिलाएँ',
    sign_in: 'साइन इन', sign_out: 'साइन आउट', guest: 'अतिथि', demo_user: 'डेमो खाता',
    stat_records: 'सहेजे रिकॉर्ड', stat_out: 'सीमा से बाहर मान', stat_meds: 'चालू दवाएँ', stat_cond: 'दर्ज बीमारियाँ',
    how_1: 'अपलोड करें', how_1s: 'किसी भी पर्ची या रिपोर्ट की फ़ोटो या PDF', how_2: 'जाँचें', how_2s: 'पढ़े गए मानों को मूल दस्तावेज़ से मिलाएँ', how_3: 'समझें', how_3s: 'सरल भाषा में सार, टाइमलाइन और रुझान',
    q1: 'पिछली रिपोर्ट के बाद क्या बदला?', q2: 'मैं कौन सी दवाइयाँ ले रहा हूँ और क्यों?', q3: 'किन मानों पर मुझे डॉक्टर से बात करनी चाहिए?',
    thinking: 'आपके रिकॉर्ड देखे जा रहे हैं...', sources: 'स्रोत', you: 'आप', assistant: 'सेहत कोपायलट',
    ask_empty: 'सवाल पूछने के लिए कम से कम एक रिकॉर्ड सहेजें।',
    abha_title: 'आभा और एक्सपोर्ट',
    abha_about1: 'ABDM (आयुष्मान भारत डिजिटल मिशन) भारत की राष्ट्रीय डिजिटल स्वास्थ्य प्रणाली है। आपका आभा नंबर 14 अंकों की स्वास्थ्य आईडी है, जिससे आपके रिकॉर्ड अस्पतालों में आपके साथ चलते हैं।',
    abha_about2: 'सेहत कोपायलट आपके रिकॉर्ड को FHIR में रखता है, जो ABDM का इस्तेमाल किया हुआ प्रारूप है, ताकि आप जब चाहें उन्हें साझा कर सकें।',
    abha_demo: 'डेमो: नकली ABDM सैंडबॉक्स, कोई असली स्वास्थ्य डेटा नहीं लाया जाता।',
    abha_link: 'आभा जोड़ें (डेमो)', abha_label: 'आभा नंबर', abha_linked: 'जुड़ा हुआ: {n}', abha_addr: 'आभा पता',
    abha_import: 'आभा से रिकॉर्ड लाएँ (डेमो)', abha_imported: 'आभा से {n} नए रिकॉर्ड लाए गए।',
    abha_bad: '14 अंकों का आभा नंबर डालें।',
    fhir_title: 'ABDM / FHIR के लिए एक्सपोर्ट', fhir_note: 'आपकी प्रोफ़ाइल और रिकॉर्ड का FHIR R4 बंडल बनाता है।',
    fhir_btn: 'FHIR बंडल एक्सपोर्ट करें', fhir_prev: 'बंडल का पूर्वावलोकन', fhir_counts: 'बंडल में संसाधन',
    src_from: 'यहाँ से पढ़ा', src_box: 'स्रोत पंक्ति', src_hint: 'किसी मान पर क्लिक करें, जिस पंक्ति से वह पढ़ा गया वह दिखेगी।',
    unread_title: 'जो पंक्तियाँ उपयोग नहीं हुईं', unread_sub: 'ये पंक्तियाँ डेटा जैसी लगीं पर ठीक से पढ़ी नहीं जा सकीं, इसलिए कोई अनुमान नहीं लगाया गया। ज़रूरी हों तो खुद जोड़ें।',
    unit_skip: '{n} नतीजे अलग इकाई में हैं, इसलिए उनकी तुलना नहीं की गई।',
    consent: 'अपलोड करने पर दस्तावेज़ केवल पढ़ने और समझाने के लिए बाहरी AI सेवाओं (Google Gemini; बैकअप में Groq, NVIDIA या OpenRouter) को भेजा जाता है। हमारा सर्वर कुछ भी सहेजता नहीं। रिकॉर्ड इसी डिवाइस पर रहते हैं और आप कोई भी रिकॉर्ड या सारा डेटा कभी भी हटा सकते हैं।',
    privacy: 'यह भारत के डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम, 2023 के सहमति, उद्देश्य-सीमा और डेटा हटाने के सिद्धांतों को ध्यान में रखकर बनाया गया है। यह छात्रों का प्रोटोटाइप है, कोई प्रमाणित सेवा नहीं। नमूना या गैर-संवेदनशील दस्तावेज़ ही इस्तेमाल करें।',
    data_title: 'आपका डेटा', wipe_btn: 'मेरा सारा डेटा हटाएँ', wipe_hint: 'इस डिवाइस पर सहेजी हर चीज़ हट जाएगी।',
    confirm_wipe: 'इस डिवाइस से सभी रिकॉर्ड और आपकी प्रोफ़ाइल हटाएँ? इसे वापस नहीं किया जा सकता।',
    err_network: 'सर्वर से संपर्क नहीं हो सका। कनेक्शन जाँचकर फिर कोशिश करें।',
    err_server: 'सर्वर में त्रुटि हुई ({code})।',
    err_type: 'यह फ़ाइल प्रकार समर्थित नहीं है। कृपया फोटो, PDF या टेक्स्ट फ़ाइल चुनें।',
    err_size: 'यह फ़ाइल 3 MB से बड़ी है। कृपया छोटी फ़ाइल चुनें।',
    err_image: 'यह तस्वीर पढ़ी नहीं जा सकी। कोई दूसरी फोटो आज़माएँ।',
    err_generic: 'कुछ गड़बड़ हो गई। कृपया फिर कोशिश करें।',
    dismiss: 'बंद करें', working: 'काम हो रहा है...',
    sex_male: 'पुरुष', sex_female: 'महिला',
    label_signin: 'साइन इन ज़रूरी',
    signin_msg: 'अपनी रिपोर्ट के बारे में पूछने के लिए पहले साइन इन करें। डेमो खाते से बस एक क्लिक में हो जाता है।',
    use_demo_acct: 'डेमो खाता इस्तेमाल करें',
    mt_title: 'आज की दवाइयाँ', mt_empty: 'आपके पर्चों में अभी कोई दवा नहीं मिली।',
    slot_morning: 'सुबह', slot_afternoon: 'दोपहर', slot_night: 'रात', slot_prn: 'ज़रूरत पड़ने पर', slot_weekly: 'साप्ताहिक', slot_asis: 'पर्चे के अनुसार',
    mt_count: 'आज {y} में से {x} ली गईं', mt_taken: 'ली',
    mt_remind: 'ऐप खुला रहने तक मुझे याद दिलाएँ', mt_remind_note: 'याद दिलाना तभी काम करता है जब यह टैब खुला हो।',
    mt_remind_denied: 'इस ब्राउज़र में सूचनाएँ बंद हैं, इसलिए याद दिलाना नहीं दिखाया जा सकता।',
    mt_note: 'यह वही समय-सारणी है जो आपके पर्चों में लिखी है। डॉक्टर से पूछे बिना कोई दवा न बदलें।',
    mt_notif_title: 'सेहत कोपायलट अनुस्मारक', mt_notif_body: '{slot}: आपके पर्चों की {n} खुराक पर अभी निशान नहीं लगा।',
    ph_title: 'फ़ार्मासिस्ट से पूछने की बातें', ph_loading: 'आपकी दवाओं को एक छोटी संदर्भ सूची से मिलाया जा रहा है...',
    ph_fail: 'अभी जाँच नहीं हो सकी', ph_dup: 'एक ही सामग्री दो बार: {ingredient} इनमें है: {names}',
    ph_none: 'हमारी छोटी संदर्भ सूची में बताने लायक कुछ नहीं मिला। यह कोई गारंटी नहीं है।',
    sev_major: 'गंभीर', sev_moderate: 'मध्यम', sev_minor: 'हल्का',
    visit_btn: 'डॉक्टर मुलाकात का सारांश', visit_title: 'मेरे डॉक्टर के लिए सारांश', visit_generated: '{d} को तैयार किया गया',
    visit_cond: 'मेरे रिकॉर्ड में दर्ज स्थितियाँ', visit_meds: 'वर्तमान दवाइयाँ', visit_abn: 'सामान्य सीमा से बाहर नवीनतम मान',
    visit_changes: 'समय के साथ बदलाव', visit_q: 'जो सवाल मैं पूछना चाहता/चाहती हूँ', visit_notes: 'मेरे अपने नोट्स',
    visit_how: 'कैसे ली जाती है', visit_since: 'कब से', visit_none: 'सूची में कुछ नहीं।',
    visit_noq: 'सुझाए गए सवाल देखने के लिए कोई रिकॉर्ड खोलें, या नीचे अपने सवाल लिखें।',
    visit_footer: 'यह सारांश सेहत कोपायलट ने मरीज़ के अपने रिकॉर्ड से तैयार किया है। यह कोई चिकित्सकीय दस्तावेज़ नहीं है।',
    visit_print: 'प्रिंट करें या PDF सहेजें', visit_back: 'वापस',
    bk_title: 'बैकअप', bk_download: 'बैकअप डाउनलोड करें', bk_restore: 'बैकअप से वापस लाएँ',
    bk_note: 'आपके रिकॉर्ड सिर्फ़ इसी डिवाइस पर रहते हैं। बैकअप फ़ाइल से आप उन्हें दूसरे डिवाइस पर ले जा सकते हैं।',
    bk_done: 'बैकअप से {n} रिकॉर्ड वापस लाए गए।', bk_saved: 'बैकअप डाउनलोड हो गया।',
    bk_big: 'यह फ़ाइल 40 MB से बड़ी है, इसलिए यहाँ वापस नहीं लाई जा सकती।', bk_bad: 'यह सेहत कोपायलट की बैकअप फ़ाइल जैसी नहीं लगती।'
  }
};

let lang = 'en';
const BUNDLED = ['en', 'hi', 'bn', 'te', 'mr', 'ta', 'gu', 'kn', 'ml', 'pa'];
let LANG_CODES = BUNDLED.slice();
const LANG_RTL = {};
const SITE_MAPS = {};
try { const l = localStorage.getItem('sehat_lang'); if (/^[a-z]{2,3}$/.test(l || '')) lang = l; } catch (e) { /* ignore */ }
/* The guide's fixed answers (faq.js) are English; their translations live with the site pages. */
function siteText(text) { const m = SITE_MAPS[lang]; return (m && m[text]) || text; }
async function loadSiteMap(code) {
  if (code === 'en' || SITE_MAPS[code] || BUNDLED.indexOf(code) < 0) return;
  try { const r = await fetch('/i18n/site-' + code + '.json'); SITE_MAPS[code] = r.ok ? await r.json() : {}; } catch (e) { SITE_MAPS[code] = {}; }
}
/* Languages beyond the ten bundled ones: labels are machine-translated in small batches the
   first time the language is chosen, shown as they arrive, and cached in this browser. */
const filling = {};
async function fillLang(code) {
  if (BUNDLED.indexOf(code) >= 0 || filling[code]) return;
  filling[code] = true;
  const keys = Object.keys(STR.en).filter(k => !(k in STR[code]));
  for (let i = 0; i < keys.length; i += 35) {
    const texts = {};
    keys.slice(i, i + 35).forEach(k => { texts[k] = STR.en[k]; });
    try {
      const r = await api('/api/translate', { lang: code, texts });
      Object.assign(STR[code], r.translations || {});
      try { localStorage.setItem('sehat_i18n_' + code, JSON.stringify(STR[code])); } catch (x) { /* ignore */ }
      if (lang === code) render();
    } catch (e) { break; }  // rate limited or offline: keep English for the rest, retry next visit
  }
  filling[code] = false;
}
async function loadLangList() {
  try {
    const r = await api('/api/langs');
    const list = arr(r.languages);
    if (!list.length) return;
    LANG_CODES = list.map(l => l.code);
    list.forEach(l => { LANG_RTL[l.code] = !!l.rtl; });
    const sel = document.getElementById('langSel');
    if (sel) {
      const group = (label, items) => '<optgroup label="' + esc(label) + '">' + items.map(l => '<option value="' + esc(l.code) + '">' + esc(l.native) + (l.native === l.name ? '' : ' · ' + esc(l.name)) + '</option>').join('') + '</optgroup>';
      sel.innerHTML = group('Ready', list.filter(l => l.bundled)) + group('Translated on demand', list.filter(l => !l.bundled));
      sel.value = lang;
    }
    if (LANG_CODES.indexOf(lang) < 0) { lang = 'en'; render(); }
    else if (BUNDLED.indexOf(lang) < 0) { await loadLang(lang); render(); fillLang(lang); }
  } catch (e) { /* keep the ten bundled languages */ }
}
/* English and Hindi labels are written by hand below. The other languages load a
   machine-translated label file on demand; any missing label falls back to English. */
async function loadLang(code) {
  if (STR[code]) return;
  if (BUNDLED.indexOf(code) < 0) {
    try { STR[code] = JSON.parse(localStorage.getItem('sehat_i18n_' + code) || '{}') || {}; } catch (e) { STR[code] = {}; }
    return;
  }
  try { const r = await fetch('/i18n/' + code + '.json'); STR[code] = r.ok ? await r.json() : {}; }
  catch (e) { STR[code] = {}; }
}
async function setLang(code) {
  if (LANG_CODES.indexOf(code) < 0) code = 'en';
  await loadLang(code);
  loadSiteMap(code);
  lang = code;
  fillLang(code);
  try { localStorage.setItem('sehat_lang', lang); } catch (x) { /* ignore */ }
  if (S.error) { S.error = null; S.retry = null; }
  render();
}

function t(key, vars) {
  let s = (STR[lang] && STR[lang][key]);
  if (s == null) s = STR.en[key];
  if (s == null) s = key;
  if (vars) for (const k in vars) s = s.split('{' + k + '}').join(vars[k]);
  return s;
}

/* ================= Helpers ================= */
const $ = (sel, root) => (root || document).querySelector(sel);
function esc(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
const clone = o => JSON.parse(JSON.stringify(o));
const isNum = v => v !== null && v !== '' && v !== undefined && typeof v !== 'boolean' && isFinite(Number(v));
const fmtNum = n => String(+Number(n).toFixed(2));
const arr = v => (Array.isArray(v) ? v : []);
const FLAGS = ['normal', 'low', 'high', 'critical', 'unknown'];
const TYPES = ['lab_report', 'prescription', 'discharge_summary', 'diagnostic_report', 'other'];
const FLAGC = { normal: '#15803D', low: '#B45309', high: '#B45309', critical: '#B91C1C', unknown: '#64748B' };
const isLow = c => c !== null && c !== undefined && c !== '' && isFinite(Number(c)) && Number(c) < 0.7;
const normFlag = f => (FLAGS.indexOf(f) >= 0 ? f : 'unknown');
const isAbn = f => f === 'low' || f === 'high' || f === 'critical';

function fmtDate(d, opts) {
  if (!d) return t('undated');
  const s = String(d).slice(0, 10);
  const dt = new Date(s + 'T00:00:00');
  if (isNaN(dt)) return String(d);
  return dt.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', opts || { day: 'numeric', month: 'short', year: 'numeric' });
}
function typeLabel(ty) { return TYPES.indexOf(ty) >= 0 ? t('type_' + ty) : t('type_other'); }
function badge(flag) { const f = normFlag(flag); return '<span class="flag f-' + f + '">' + esc(t('flag_' + f)) + '</span>'; }
function lowTag(c) { return isLow(c) ? '<span class="tag amber">' + esc(t('low_conf')) + '</span>' : ''; }
function refText(x) {
  if (x.ref_text) return x.ref_text;
  const lo = isNum(x.ref_low), hi = isNum(x.ref_high);
  if (lo && hi) return fmtNum(x.ref_low) + ' - ' + fmtNum(x.ref_high);
  if (lo) return '>= ' + fmtNum(x.ref_low);
  if (hi) return '<= ' + fmtNum(x.ref_high);
  return '-';
}
function nl(s) { return esc(s); }

function normalizeRecord(r) {
  r = r && typeof r === 'object' ? r : {};
  r.id = r.id || ('rec_' + Math.random().toString(36).slice(2, 8));
  r.doc_type = TYPES.indexOf(r.doc_type) >= 0 ? r.doc_type : 'other';
  r.title = r.title == null ? '' : r.title;
  r.patient = r.patient && typeof r.patient === 'object' ? r.patient : {};
  r.tests = arr(r.tests).map(x => Object.assign({ name: '', value: '', unit: '', ref_low: null, ref_high: null, flag: 'unknown' }, x || {}));
  r.medicines = arr(r.medicines).map(x => Object.assign({ name: '' }, x || {}));
  r.diagnoses = arr(r.diagnoses).map(x => (typeof x === 'string' ? { name: x, confidence: 1 } : Object.assign({ name: '' }, x || {})));
  r.advice = arr(r.advice).map(x => (x == null ? '' : String(x)));
  r.warnings = arr(r.warnings);
  r.unread = arr(r.unread);
  r.explanation = r.explanation && typeof r.explanation === 'object' ? r.explanation : {};
  return r;
}
const lite = r => { const c = clone(r); delete c.explanation; return c; };

/* ================= Storage ================= */
const mem = { records: new Map(), files: new Map(), meta: new Map() };
let dbPromise = null;
function openDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise(resolve => {
    try {
      const rq = indexedDB.open('sehat', 1);
      rq.onupgradeneeded = () => {
        const d = rq.result;
        d.createObjectStore('records', { keyPath: 'id' });
        d.createObjectStore('files', { keyPath: 'id' });
        d.createObjectStore('meta');
      };
      rq.onsuccess = () => resolve(rq.result);
      rq.onerror = () => resolve(null);
      rq.onblocked = () => resolve(null);
    } catch (e) { resolve(null); }
  });
  return dbPromise;
}
function idbReq(db, store, mode, fn) {
  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(store, mode);
      const r = fn(tx.objectStore(store));
      tx.oncomplete = () => resolve(r ? r.result : undefined);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    } catch (e) { reject(e); }
  });
}
async function dbGetAll(store) {
  const db = await openDB();
  if (db) { try { return await idbReq(db, store, 'readonly', o => o.getAll()); } catch (e) { /* fall back */ } }
  return Array.from(mem[store].values());
}
async function dbGet(store, key) {
  const db = await openDB();
  if (db) { try { const v = await idbReq(db, store, 'readonly', o => o.get(key)); return v === undefined ? null : v; } catch (e) { /* fall back */ } }
  return mem[store].has(key) ? mem[store].get(key) : null;
}
async function dbPut(store, val, key) {
  mem[store].set(store === 'meta' ? key : val.id, val);
  const db = await openDB();
  if (db) { try { await idbReq(db, store, 'readwrite', o => (store === 'meta' ? o.put(val, key) : o.put(val))); } catch (e) { /* mem has it */ } }
}
async function dbDel(store, key) {
  mem[store].delete(key);
  const db = await openDB();
  if (db) { try { await idbReq(db, store, 'readwrite', o => o.delete(key)); } catch (e) { /* ignore */ } }
}
async function dbClear(store) {
  mem[store].clear();
  const db = await openDB();
  if (db) { try { await idbReq(db, store, 'readwrite', o => o.clear()); } catch (e) { /* ignore */ } }
}

/* ================= State ================= */
const S = {
  view: 'add', stage: 'idle', step: 0,
  records: [], patient: null,
  draft: null, editingId: null, pendingFile: null, previewFile: null, dirty: false, reflag: false,
  detailId: null, filter: 'all',
  overview: {}, chat: [], asking: false,
  fhir: null, error: null, retry: null, samples: null, busy: {}, notice: null
};
const getRec = id => S.records.find(r => r.id === id) || null;

/* ================= API ================= */
async function api(path, body) {
  const opt = body === undefined ? {} : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
  let r;
  try { r = await fetch(path, opt); } catch (e) { throw new Error(t('err_network')); }
  let j = null;
  try { j = await r.json(); } catch (e) { /* not json */ }
  if (!r.ok) {
    const err = new Error((j && j.error) || t('err_server', { code: r.status }));
    err.code = j && j.code;
    throw err;
  }
  return j || {};
}
function showError(msg, retry) {
  S.error = msg || t('err_generic');
  S.retry = retry || null;
  paintError();
}
function clearError() { S.error = null; S.retry = null; paintError(); }
function paintError() {
  const el = $('#err');
  if (!el) return;
  if (!S.error) { el.innerHTML = ''; return; }
  el.innerHTML = '<div class="banner" role="alert"><div>' + esc(S.error) + '</div><div class="acts">' +
    (S.retry ? '<button type="button" class="btn small secondary" data-act="retry">' + esc(t('retry')) + '</button>' : '') +
    '<button type="button" class="btn small link" data-act="dismiss">' + esc(t('dismiss')) + '</button></div></div>';
}

/* ================= Files / preview ================= */
function guessMime(name) {
  const n = String(name || '').toLowerCase();
  if (n.endsWith('.pdf')) return 'application/pdf';
  if (n.endsWith('.txt')) return 'text/plain';
  if (n.endsWith('.png')) return 'image/png';
  if (n.endsWith('.webp')) return 'image/webp';
  if (n.endsWith('.jpg') || n.endsWith('.jpeg')) return 'image/jpeg';
  return '';
}
function readAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.onerror = () => reject(new Error(t('err_generic')));
    fr.readAsDataURL(file);
  });
}
function downscale(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      let w = img.naturalWidth, h = img.naturalHeight;
      const m = Math.max(w, h);
      if (m > 1600) { const k = 1600 / m; w = Math.round(w * k); h = Math.round(h * k); }
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      const x = c.getContext('2d');
      x.fillStyle = '#fff'; x.fillRect(0, 0, w, h);
      x.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error(t('err_image'))); };
    img.src = url;
  });
}
function dataUrlText(d) {
  try {
    const bin = atob(String(d).split(',')[1] || '');
    const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch (e) { return ''; }
}
const blobCache = new Map();
function pdfUrl(f) {
  const key = (f.id || 'pending') + ':' + f.dataUrl.length;
  if (!blobCache.has(key)) {
    const bin = atob(f.dataUrl.split(',')[1] || '');
    const a = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i);
    blobCache.set(key, URL.createObjectURL(new Blob([a], { type: 'application/pdf' })));
  }
  return blobCache.get(key);
}
function previewHTML(f) {
  if (!f || !f.dataUrl) return '<p class="muted">' + esc(t('no_preview')) + '</p>';
  const m = f.mime || '';
  try {
    if (m.indexOf('image/') === 0) return '<img src="' + esc(f.dataUrl) + '" alt="' + esc(t('original')) + '">';
    if (m === 'application/pdf') return '<embed src="' + esc(pdfUrl(f)) + '" type="application/pdf">';
    if (m === 'text/plain') return '<pre>' + esc(dataUrlText(f.dataUrl)) + '</pre>';
  } catch (e) { /* fall through */ }
  return '<p class="muted">' + esc(t('no_preview')) + '</p>';
}

/* ================= Upload pipeline ================= */
let stepTimer = null;
function startStepper() {
  stopStepper();
  S.step = 0;
  stepTimer = setInterval(() => {
    if (S.step < 2) { S.step++; if (S.view === 'add' && S.stage === 'processing') render(); }
  }, 1600);
}
function stopStepper() { if (stepTimer) { clearInterval(stepTimer); stepTimer = null; } }

/* Backup reader: when no vision model is free, read the image on this device
   with Tesseract and let the server structure the text. */
let tesseractLoading = null;
function loadTesseract() {
  if (window.Tesseract) return Promise.resolve();
  if (!tesseractLoading) {
    tesseractLoading = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';
      s.onload = resolve;
      s.onerror = () => { tesseractLoading = null; reject(new Error(t('err_network'))); };
      document.head.appendChild(s);
    });
  }
  return tesseractLoading;
}
async function ocrOnDevice(dataUrl) {
  await loadTesseract();
  const worker = await window.Tesseract.createWorker('eng+hin');
  try {
    const out = await worker.recognize(dataUrl);
    return (out && out.data && out.data.text) || '';
  } finally { await worker.terminate(); }
}
function textToBase64(text) {
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

async function handleFile(file, sampleId) {
  if (!file) return;
  const mime = file.type || guessMime(file.name);
  const isImg = mime.indexOf('image/') === 0;
  if (!(isImg || mime === 'application/pdf' || mime === 'text/plain')) return showError(t('err_type'));
  if (!isImg && file.size > 3 * 1024 * 1024) return showError(t('err_size'));
  clearError();
  S.view = 'add'; S.stage = 'processing'; S.step = 0; S.editingId = null;
  render();
  try {
    let dataUrl, outMime = mime;
    if (isImg) { dataUrl = await downscale(file); outMime = 'image/jpeg'; }
    else dataUrl = await readAsDataURL(file);
    const data = String(dataUrl).split(',')[1] || '';
    const fileObj = { mime: outMime, dataUrl };
    startStepper();
    const name = file.name || 'upload';
    let res;
    try {
      res = await api('/api/extract', { filename: name, mime: outMime, data, lang, sample_id: sampleId || null });
    } catch (e) {
      if (e.code !== 'vision_unavailable' || !isImg) throw e;
      const text = await ocrOnDevice(dataUrl);
      res = await api('/api/extract', { filename: name, mime: 'text/plain', data: textToBase64(text), lang, ocr: 'tesseract' });
    }
    stopStepper();
    S.draft = normalizeRecord(res.record);
    S.pendingFile = fileObj; S.previewFile = null;
    S.dirty = false; S.reflag = false;
    S.stage = 'review';
    render();
    window.scrollTo(0, 0);
  } catch (e) {
    stopStepper();
    S.stage = 'idle';
    render();
    showError(e.message, () => handleFile(file, sampleId));
  }
}

async function runSample(id) {
  const s = arr(S.samples).find(x => x.id === id);
  if (!s) return;
  clearError();
  try {
    const r = await fetch(s.url);
    if (!r.ok) throw new Error(t('err_server', { code: r.status }));
    const b = await r.blob();
    const name = String(s.url).split('?')[0].split('/').pop() || (s.id + '.png');
    const ty = (b.type && b.type !== 'application/octet-stream') ? b.type : guessMime(name);
    handleFile(new File([b], name, { type: ty }), s.id);
  } catch (e) {
    showError(e.message || t('err_network'), () => runSample(id));
  }
}

async function loadSamples() {
  try {
    const r = await api('/api/samples');
    S.samples = arr(r.samples);
  } catch (e) { S.samples = []; }
  if (S.view === 'add' && S.stage === 'idle') render();
}

async function loadDemo() {
  if (S.busy.demo) return;
  S.busy.demo = true; clearError(); render();
  try {
    const d = await api('/api/demo');
    const p = d.patient || {};
    S.patient = { name: p.name || null, age: p.age == null ? null : p.age, sex: p.sex || null, abha: p.abha || null };
    await dbPut('meta', S.patient, 'patient');
    for (const raw of arr(d.records)) {
      const r = normalizeRecord(raw);
      await saveRecordLocal(r);
    }
    S.view = 'timeline'; S.detailId = null;
  } catch (e) {
    showError(e.message, loadDemo);
  }
  S.busy.demo = false; render();
}

async function saveRecordLocal(r) {
  await dbPut('records', r);
  const i = S.records.findIndex(x => x.id === r.id);
  if (i >= 0) S.records[i] = r; else S.records.push(r);
}

/* ================= Review / save ================= */
function setPath(obj, path, val) {
  const parts = path.split('.');
  let o = obj;
  for (let i = 0; i < parts.length - 1; i++) { o = o[parts[i]]; if (o == null) return; }
  o[parts[parts.length - 1]] = val;
}
function onEdit(el) {
  if (!S.draft) return;
  const path = el.dataset.path;
  let v = el.value;
  if (el.dataset.num === 'ref') v = isNum(v) ? Number(v) : null;
  else if (el.dataset.num === 'val') v = isNum(v) ? Number(v) : v;
  setPath(S.draft, path, v);
  S.dirty = true;
  if (/^tests\./.test(path) && /\.(value|unit|ref_low|ref_high|name|flag)$/.test(path)) S.reflag = true;
}
function addRow(kind) {
  const d = S.draft; if (!d) return;
  if (kind === 'tests') d.tests.push({ name: '', value: '', unit: '', ref_low: null, ref_high: null, ref_text: null, ref_source: null, flag: 'unknown', confidence: 1 });
  else if (kind === 'medicines') d.medicines.push({ name: '', generic: null, strength: '', dose: '', frequency: '', timing: '', duration: '', instructions: '', known: true, confidence: 1 });
  else if (kind === 'diagnoses') d.diagnoses.push({ name: '', confidence: 1 });
  else if (kind === 'advice') d.advice.push('');
  S.dirty = true;
  if (kind === 'tests') S.reflag = true;
  render();
}
function delRow(kind, i) {
  const d = S.draft; if (!d || !Array.isArray(d[kind])) return;
  d[kind].splice(i, 1);
  S.dirty = true;
  if (kind === 'tests') S.reflag = true;
  render();
}
function emptyToNull(o, keys) { keys.forEach(k => { if (o[k] === '' || o[k] === undefined) o[k] = null; }); }

async function saveDraft() {
  if (!S.draft || S.busy.save) return;
  S.busy.save = true; clearError(); render();
  try {
    let rec = clone(S.draft);
    emptyToNull(rec, ['date', 'facility', 'doctor', 'follow_up']);
    rec.tests = rec.tests.filter(x => x.name || (x.value !== '' && x.value != null));
    rec.medicines = rec.medicines.filter(x => x.name);
    rec.diagnoses = rec.diagnoses.filter(x => x.name);
    rec.advice = rec.advice.filter(x => x && x.trim());
    rec.medicines.forEach(m => emptyToNull(m, ['generic', 'strength', 'dose', 'frequency', 'timing', 'duration', 'instructions']));
    if (S.reflag) {
      const res = await api('/api/reflag', { record: lite(rec) });
      if (res.record) {
        const ex = rec.explanation;
        rec = Object.assign({}, rec, normalizeRecord(res.record));
        rec.explanation = ex;
      }
    }
    if (S.dirty || S.reflag) rec.explanation = {};
    rec = normalizeRecord(rec);
    if (S.editingId && S.editingId !== rec.id) rec.id = S.editingId;
    await saveRecordLocal(rec);
    if (S.pendingFile) await dbPut('files', { id: rec.id, mime: S.pendingFile.mime, dataUrl: S.pendingFile.dataUrl });
    const p = rec.patient || {};
    if ((!S.patient || !S.patient.name) && (p.name || p.age || p.sex)) {
      S.patient = { name: p.name || null, age: p.age || null, sex: p.sex || null, abha: S.patient ? S.patient.abha || null : null };
      await dbPut('meta', S.patient, 'patient');
    }
    S.draft = null; S.pendingFile = null; S.previewFile = null; S.stage = 'idle'; S.editingId = null;
    S.overview = {};
    S.view = 'detail'; S.detailId = rec.id;
    S.busy.save = false;
    render();
    window.scrollTo(0, 0);
  } catch (e) {
    S.busy.save = false;
    render();
    showError(e.message, saveDraft);
  }
}

function discardDraft() {
  const wasEdit = S.editingId;
  S.draft = null; S.pendingFile = null; S.previewFile = null; S.stage = 'idle'; S.editingId = null;
  if (wasEdit && getRec(wasEdit)) { S.view = 'detail'; S.detailId = wasEdit; } else S.view = 'add';
  clearError(); render();
}

async function startEdit(id) {
  const r = getRec(id); if (!r) return;
  S.draft = normalizeRecord(clone(r));
  S.editingId = id; S.pendingFile = null;
  S.previewFile = await dbGet('files', id);
  S.dirty = false; S.reflag = false;
  S.view = 'add'; S.stage = 'review';
  render(); window.scrollTo(0, 0);
}

async function deleteRecord(id) {
  if (!confirm(t('confirm_delete'))) return;
  await dbDel('records', id);
  await dbDel('files', id);
  S.records = S.records.filter(r => r.id !== id);
  S.overview = {};
  S.view = 'timeline'; S.detailId = null;
  render();
}

/* ================= View: Add ================= */
function viewAdd() {
  if (S.stage === 'processing') return viewProcessing();
  if (S.stage === 'review') return viewReview();
  const samples = S.samples === null
    ? '<p class="muted">' + esc(t('working')) + '</p>'
    : (S.samples.length
      ? '<div class="sample-row">' + S.samples.map(s =>
        '<button type="button" class="btn secondary small" data-act="sample" data-id="' + esc(s.id) + '">' + esc(s.title || s.id) + '</button>').join('') + '</div>'
      : '<p class="muted">' + esc(t('samples_none')) + '</p>');
  return '<div class="page-head"><h1>' + esc(t('add_title')) + '</h1><p>' + esc(t('add_sub')) + '</p></div>' +
    '<div class="dropzone" id="drop">' +
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/></svg>' +
    '<h2>' + esc(t('drop_title')) + '</h2><p class="muted">' + esc(t('drop_hint')) + '</p>' +
    '<div class="row"><button type="button" class="btn" data-act="choose">' + esc(t('choose_file')) + '</button>' +
    '<button type="button" class="btn secondary" data-act="photo">' + esc(t('take_photo')) + '</button></div></div>' +
    '<ol class="how">' + [1, 2, 3].map(n => '<li><span class="how-n">' + n + '</span><div><strong>' + esc(t('how_' + n)) + '</strong><div class="muted small">' + esc(t('how_' + n + 's')) + '</div></div></li>').join('') + '</ol>' +
    '<p class="muted small consent">' + esc(t('consent')) + '</p>' +
    '<div class="card" style="margin-top:16px"><h2 style="margin-bottom:10px">' + esc(t('samples_title')) + '</h2>' + samples +
    '<div style="margin-top:14px;padding-top:14px;border-top:1px solid var(--line)" class="row">' +
    '<button type="button" class="btn secondary" data-act="demo"' + (S.busy.demo ? ' disabled' : '') + '>' + esc(S.busy.demo ? t('working') : t('demo_btn')) + '</button>' +
    '<span class="muted small">' + esc(t('demo_hint')) + '</span></div></div>';
}

function viewProcessing() {
  const steps = ['step_read', 'step_extract', 'step_check', 'step_write'];
  return '<div class="page-head"><h1>' + esc(t('processing_title')) + '</h1></div><div class="card"><ol class="stepper">' +
    steps.map((k, i) => '<li class="' + (i < S.step ? 'done' : (i === S.step ? 'now' : '')) + '"><span class="dot"></span><span>' + esc(t(k)) + '</span></li>').join('') +
    '</ol></div>';
}

function fld(label, path, val, o) {
  o = o || {};
  return '<label class="fld ' + (o.cls || '') + '"><span>' + esc(label) + '</span><input type="' + (o.type || 'text') + '" class="' + (o.mono ? 'mono' : '') +
    '" data-path="' + esc(path) + '"' + (o.num ? ' data-num="' + o.num + '"' : '') + (o.inputmode ? ' inputmode="' + o.inputmode + '"' : '') +
    ' value="' + esc(val) + '"></label>';
}
function sel(label, path, val, opts, o) {
  o = o || {};
  return '<label class="fld ' + (o.cls || '') + '"><span>' + esc(label) + '</span><select data-path="' + esc(path) + '">' +
    opts.map(op => '<option value="' + esc(op[0]) + '"' + (op[0] === val ? ' selected' : '') + '>' + esc(op[1]) + '</option>').join('') + '</select></label>';
}

function srcAttr(x) { return x && x.source_text ? ' data-src="' + esc(x.source_text) + '"' + (x.page ? ' data-page="' + esc(x.page) + '"' : '') : ''; }
function srcLine(x) { return x && x.source_text ? '<div class="srcline"><span class="muted">' + esc(t('src_from')) + ':</span> ' + esc(x.source_text) + '</div>' : ''; }
function testRow(x, i) {
  const p = 'tests.' + i + '.';
  const src = x.ref_source === 'report' ? t('ref_report') : (x.ref_source === 'standard' ? t('ref_standard') : '');
  return '<div class="rowcard"' + srcAttr(x) + '><div class="fields">' +
    fld(t('t_name'), p + 'name', x.name, { cls: 'w2' }) +
    fld(t('t_value'), p + 'value', x.value, { mono: 1, num: 'val' }) +
    fld(t('t_unit'), p + 'unit', x.unit, { mono: 1 }) +
    fld(t('t_low'), p + 'ref_low', x.ref_low, { mono: 1, num: 'ref', inputmode: 'decimal' }) +
    fld(t('t_high'), p + 'ref_high', x.ref_high, { mono: 1, num: 'ref', inputmode: 'decimal' }) +
    sel(t('t_flag'), p + 'flag', normFlag(x.flag), FLAGS.map(f => [f, t('flag_' + f)])) +
    '</div>' + srcLine(x) + '<div class="foot"><div class="tags">' + badge(x.flag) + lowTag(x.confidence) +
    (src ? '<span class="muted small">' + esc(src) + '</span>' : '') +
    '</div><button type="button" class="xbtn" data-act="delrow" data-kind="tests" data-i="' + i + '">' + esc(t('remove')) + '</button></div></div>';
}
function medRow(x, i) {
  const p = 'medicines.' + i + '.';
  return '<div class="rowcard"' + srcAttr(x) + '><div class="fields">' +
    fld(t('m_name'), p + 'name', x.name, { cls: 'w2' }) +
    fld(t('m_generic'), p + 'generic', x.generic) +
    fld(t('m_strength'), p + 'strength', x.strength, { mono: 1 }) +
    fld(t('m_dose'), p + 'dose', x.dose) +
    fld(t('m_freq'), p + 'frequency', x.frequency) +
    fld(t('m_timing'), p + 'timing', x.timing) +
    fld(t('m_duration'), p + 'duration', x.duration) +
    fld(t('m_instr'), p + 'instructions', x.instructions, { cls: 'wide' }) +
    '</div>' + srcLine(x) + '<div class="foot"><div class="tags">' + lowTag(x.confidence) +
    (x.known === false ? '<span class="tag amber">' + esc(t('unknown_med')) + '</span>' : '') +
    '</div><button type="button" class="xbtn" data-act="delrow" data-kind="medicines" data-i="' + i + '">' + esc(t('remove')) + '</button></div></div>';
}

function viewReview() {
  const d = S.draft;
  const f = S.pendingFile || S.previewFile;
  const lowN = d.tests.filter(x => isLow(x.confidence)).length + d.medicines.filter(x => isLow(x.confidence)).length + d.diagnoses.filter(x => isLow(x.confidence)).length;
  const oc = isNum(d.overall_confidence) ? Math.round(Number(d.overall_confidence) * 100) : null;
  const saving = !!S.busy.save;
  return '<div class="page-head"><h1>' + esc(S.editingId ? t('edit_title') : t('review_title')) + '</h1><p>' + esc(t('review_sub')) + '</p></div>' +
    '<div class="row" style="margin-bottom:14px">' +
    (d.handwritten ? '<span class="tag amber hw">' + esc(t('hw_check')) + '</span>' : '') +
    (oc !== null && !d.handwritten ? '<span class="small">' + esc(t('conf_overall', { p: oc })) + '</span><span class="confbar ' + (oc < 70 ? 'low' : '') + '"><i style="width:' + Math.max(0, Math.min(100, oc)) + '%"></i></span>' : '') +
    (lowN ? '<span class="tag amber">' + esc(t('items_check', { n: lowN })) + '</span>' : '') + '</div>' +
    (d.warnings.length ? '<div class="notice"><strong>' + esc(t('warnings_title')) + '</strong><ul>' + d.warnings.map(w => '<li>' + esc(w) + '</li>').join('') + '</ul></div>' : '') +
    (d.unread.length ? '<div class="card unread"><h3>' + esc(t('unread_title')) + '</h3><p class="muted small">' + esc(t('unread_sub')) + '</p><ul>' + d.unread.map(u => '<li><span class="mono">' + esc(u.text) + '</span>' + (u.reason ? ' <span class="muted small">(' + esc(u.reason) + ')</span>' : '') + '</li>').join('') + '</ul></div>' : '') +
    '<div class="review"><div class="card preview-card"><div class="preview-head"><h3>' + esc(t('original')) + '</h3><button type="button" class="btn small secondary" data-zoom="open">' + esc(t('zoom_open')) + '</button></div>' +
    '<div class="srcbox" id="srcbox"><div class="muted small">' + esc(t('src_box')) + '</div><div class="mono" id="srctext">' + esc(t('src_hint')) + '</div></div><div class="preview-doc" data-zoom="open">' + previewHTML(f) + '</div></div>' +
    '<div class="stack"><div class="card"><div class="fields">' +
    sel(t('f_type'), 'doc_type', d.doc_type, TYPES.map(ty => [ty, t('type_' + ty)])) +
    fld(t('f_date'), 'date', d.date, { type: 'date' }) +
    fld(t('f_title'), 'title', d.title, { cls: 'wide' }) +
    fld(t('f_facility'), 'facility', d.facility, { cls: 'w2' }) +
    fld(t('f_doctor'), 'doctor', d.doctor, { cls: 'w2' }) +
    '</div></div>' +
    '<div class="card"><div class="sec-title"><h2>' + esc(t('sec_tests')) + '</h2><button type="button" class="btn small secondary" data-act="addrow" data-kind="tests">' + esc(t('add_test')) + '</button></div>' +
    (d.tests.length ? d.tests.map(testRow).join('') : '<p class="muted">' + esc(t('no_items')) + '</p>') + '</div>' +
    '<div class="card"><div class="sec-title"><h2>' + esc(t('sec_meds')) + '</h2><button type="button" class="btn small secondary" data-act="addrow" data-kind="medicines">' + esc(t('add_med')) + '</button></div>' +
    (d.medicines.length ? d.medicines.map(medRow).join('') : '<p class="muted">' + esc(t('no_items')) + '</p>') + '</div>' +
    '<div class="card"><div class="sec-title"><h2>' + esc(t('sec_dx')) + '</h2><button type="button" class="btn small secondary" data-act="addrow" data-kind="diagnoses">' + esc(t('add_dx')) + '</button></div>' +
    '<div class="chips">' + d.diagnoses.map((x, i) =>
      '<span class="chip-edit"><input type="text" data-path="diagnoses.' + i + '.name" value="' + esc(x.name) + '" aria-label="' + esc(t('sec_dx')) + '">' +
      (isLow(x.confidence) ? '<span class="tag amber">' + esc(t('low_conf')) + '</span>' : '') +
      '<button type="button" class="xbtn" data-act="delrow" data-kind="diagnoses" data-i="' + i + '" aria-label="' + esc(t('remove')) + '">&times;</button></span>').join('') + '</div>' +
    (d.diagnoses.length ? '' : '<p class="muted">' + esc(t('no_items')) + '</p>') + '</div>' +
    '<div class="card"><div class="sec-title"><h2>' + esc(t('sec_advice')) + '</h2><button type="button" class="btn small secondary" data-act="addrow" data-kind="advice">' + esc(t('add_advice')) + '</button></div>' +
    d.advice.map((a, i) => '<div class="advice-row"><input type="text" data-path="advice.' + i + '" value="' + esc(a) + '" aria-label="' + esc(t('sec_advice')) + '">' +
      '<button type="button" class="xbtn" data-act="delrow" data-kind="advice" data-i="' + i + '">' + esc(t('remove')) + '</button></div>').join('') +
    (d.advice.length ? '' : '<p class="muted">' + esc(t('no_items')) + '</p>') +
    '<div class="fields" style="margin-top:10px">' + fld(t('f_followup'), 'follow_up', d.follow_up, { cls: 'wide' }) + '</div></div>' +
    '<div class="actions"><button type="button" class="btn" data-act="save"' + (saving ? ' disabled' : '') + '>' + esc(saving ? t('saving') : (S.editingId ? t('save_changes') : t('save'))) + '</button>' +
    '<button type="button" class="btn secondary" data-act="discard"' + (saving ? ' disabled' : '') + '>' + esc(S.editingId ? t('cancel') : t('discard')) + '</button></div>' +
    '</div></div>';
}

/* ================= View: Timeline ================= */
function sortedRecords() {
  return S.records.slice().sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
}
function viewTimeline() {
  const head = '<div class="page-head"><h1>' + esc(t('timeline_title')) + '</h1><p>' + esc(t('timeline_sub')) + '</p></div>';
  if (!S.records.length) {
    return head + '<div class="card empty"><p>' + esc(t('tl_empty')) + '</p><button type="button" class="btn" data-act="nav" data-view="add">' + esc(t('go_add')) + '</button></div>';
  }
  const present = TYPES.filter(ty => S.records.some(r => r.doc_type === ty));
  if (S.filter !== 'all' && present.indexOf(S.filter) < 0) S.filter = 'all';
  const chips = '<div class="chips" style="margin-bottom:6px"><button type="button" class="chip" data-act="filter" data-type="all" aria-pressed="' + (S.filter === 'all') + '">' + esc(t('filter_all')) + '</button>' +
    present.map(ty => '<button type="button" class="chip" data-act="filter" data-type="' + ty + '" aria-pressed="' + (S.filter === ty) + '">' + esc(t('type_' + ty)) + '</button>').join('') + '</div>';
  const list = sortedRecords().filter(r => S.filter === 'all' || r.doc_type === S.filter);
  let out = '', cur = null;
  list.forEach(r => {
    const key = r.date ? String(r.date).slice(0, 7) : 'none';
    if (key !== cur) {
      if (cur !== null) out += '</div>';
      cur = key;
      const label = key === 'none' ? t('undated') : fmtDate(key + '-01', { month: 'long', year: 'numeric' });
      out += '<div class="tl-month">' + esc(label) + '</div><div class="tl">';
    }
    out += timelineCard(r);
  });
  if (cur !== null) out += '</div>';
  return head + chips + out;
}
function timelineCard(r) {
  const tests = arr(r.tests), abn = tests.filter(x => isAbn(x.flag)).length;
  const ex = (r.explanation && (r.explanation[lang] || r.explanation.en || r.explanation.hi)) || null;
  const counts = [];
  if (tests.length) counts.push(abn ? '<span class="abn">' + esc(t('n_abn', { a: abn, n: tests.length })) + '</span>' : '<span>' + esc(t('n_tests', { n: tests.length })) + '</span>');
  if (arr(r.medicines).length) counts.push('<span>' + esc(t('n_meds', { n: r.medicines.length })) + '</span>');
  return '<div class="tl-item"><button type="button" class="tl-card" data-act="openrec" data-id="' + esc(r.id) + '">' +
    '<div class="top"><span class="mono">' + esc(fmtDate(r.date)) + '</span><span class="badge type">' + esc(typeLabel(r.doc_type)) + '</span>' +
    (r.handwritten ? '<span class="badge">' + esc(t('handwritten')) + '</span>' : '') + '</div>' +
    '<div class="ttl">' + esc(r.title || typeLabel(r.doc_type)) + '</div>' +
    (r.facility ? '<div class="sub">' + esc(r.facility) + '</div>' : '') +
    (counts.length ? '<div class="counts">' + counts.join('') + '</div>' : '') +
    (ex && ex.summary ? '<div class="sum">' + esc(ex.summary) + '</div>' : '') + '</button></div>';
}

/* ================= View: Detail ================= */
function explHTML(ex) {
  ex = ex || {};
  const f = arr(ex.findings), m = arr(ex.medicines), q = arr(ex.questions);
  return (ex.summary ? '<p>' + esc(ex.summary) + '</p>' : '') +
    (f.length ? '<h3>' + esc(t('findings')) + '</h3>' + f.map(x =>
      '<div class="finding"><div class="nm"><span>' + esc(x.name) + '</span>' + badge(x.flag) + '</div>' + (x.meaning ? '<p>' + esc(x.meaning) + '</p>' : '') + '</div>').join('') : '') +
    (m.length ? '<h3>' + esc(t('med_purpose')) + '</h3><ul class="qlist">' + m.map(x => '<li><strong>' + esc(x.name) + '</strong>' + (x.purpose ? ': ' + esc(x.purpose) : '') + '</li>').join('') + '</ul>' : '') +
    (q.length ? '<h3>' + esc(t('questions')) + '</h3><ul class="qlist">' + q.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>' : '') +
    (ex.disclaimer ? '<p class="muted small" style="margin-top:12px">' + esc(ex.disclaimer) + '</p>' : '');
}
function viewDetail() {
  const r = getRec(S.detailId);
  if (!r) { S.view = 'timeline'; return viewTimeline(); }
  const tests = arr(r.tests), meds = arr(r.medicines), dx = arr(r.diagnoses), adv = arr(r.advice);
  const oc = isNum(r.overall_confidence) ? Math.round(Number(r.overall_confidence) * 100) : null;
  const kv = [[t('f_type'), typeLabel(r.doc_type)], [t('f_date'), r.date ? fmtDate(r.date) : ''], [t('f_facility'), r.facility], [t('f_doctor'), r.doctor]]
    .filter(x => x[1]).map(x => '<dt>' + esc(x[0]) + '</dt><dd>' + esc(x[1]) + '</dd>').join('');
  return '<button type="button" class="btn link" data-act="nav" data-view="timeline" style="margin-bottom:8px">&larr; ' + esc(t('back')) + '</button>' +
    '<div class="row between" style="margin-bottom:12px"><div><h1>' + esc(r.title || typeLabel(r.doc_type)) + '</h1>' +
    '<div class="row" style="margin-top:6px"><span class="badge type">' + esc(typeLabel(r.doc_type)) + '</span>' +
    (r.handwritten ? '<span class="badge">' + esc(t('handwritten')) + '</span>' : '') +
    (oc !== null ? '<span class="muted small">' + esc(t('conf_overall', { p: oc })) + '</span>' : '') + '</div></div>' +
    '<div class="row"><button type="button" class="btn secondary" data-act="edit" data-id="' + esc(r.id) + '">' + esc(t('edit')) + '</button>' +
    '<button type="button" class="btn danger" data-act="delete" data-id="' + esc(r.id) + '">' + esc(t('delete')) + '</button></div></div>' +
    (arr(r.warnings).length ? '<div class="notice"><strong>' + esc(t('warnings_title')) + '</strong><ul>' + r.warnings.map(w => '<li>' + esc(w) + '</li>').join('') + '</ul></div>' : '') +
    '<div class="detail"><div class="stack">' +
    '<div class="card expl"><h2 style="margin-bottom:10px">' + esc(t('expl_title')) + '</h2><div id="expl"></div></div>' +
    '<div class="card"><h2 style="margin-bottom:10px">' + esc(t('structured')) + '</h2>' + (kv ? '<dl class="kv" style="margin-bottom:12px">' + kv + '</dl>' : '') +
    (tests.length ? '<h3 style="margin:12px 0 4px">' + esc(t('sec_tests')) + '</h3><div class="tablewrap"><table class="data"><thead><tr><th>' + esc(t('t_name')) + '</th><th>' + esc(t('t_value')) + '</th><th>' + esc(t('t_range')) + '</th><th>' + esc(t('t_flag')) + '</th></tr></thead><tbody>' +
      tests.map(x => '<tr><td>' + esc(x.name) + (isLow(x.confidence) ? '<br>' + lowTag(x.confidence) : '') + '</td><td class="mono">' + esc(x.value) + ' ' + esc(x.unit) + '</td><td class="mono">' + esc(refText(x)) + '</td><td>' + badge(x.flag) + '</td></tr>').join('') + '</tbody></table></div>' : '') +
    (meds.length ? '<h3 style="margin:14px 0 4px">' + esc(t('sec_meds')) + '</h3><div class="tablewrap"><table class="data"><thead><tr><th>' + esc(t('m_name')) + '</th><th>' + esc(t('m_dose')) + '</th><th>' + esc(t('m_freq')) + '</th><th>' + esc(t('m_duration')) + '</th></tr></thead><tbody>' +
      meds.map(x => '<tr><td><strong>' + esc(x.name) + '</strong>' + (x.generic ? '<br><span class="muted small">' + esc(x.generic) + '</span>' : '') +
        (x.instructions ? '<br><span class="small">' + esc(x.instructions) + '</span>' : '') +
        (x.known === false ? '<br><span class="tag amber">' + esc(t('unknown_med')) + '</span>' : '') + (isLow(x.confidence) ? '<br>' + lowTag(x.confidence) : '') + '</td>' +
        '<td class="mono">' + esc([x.strength, x.dose].filter(Boolean).join(' / ')) + '</td><td>' + esc([x.frequency, x.timing].filter(Boolean).join(', ')) + '</td><td>' + esc(x.duration) + '</td></tr>').join('') + '</tbody></table></div>' : '') +
    (dx.length ? '<h3 style="margin:14px 0 6px">' + esc(t('sec_dx')) + '</h3><div class="chips">' + dx.map(x => '<span class="chip static">' + esc(x.name) + '</span>').join('') + '</div>' : '') +
    (adv.length ? '<h3 style="margin:14px 0 6px">' + esc(t('sec_advice')) + '</h3><ul class="qlist">' + adv.map(a => '<li>' + esc(a) + '</li>').join('') + '</ul>' : '') +
    (r.follow_up ? '<p style="margin-top:12px"><strong>' + esc(t('f_followup')) + ':</strong> ' + esc(r.follow_up) + '</p>' : '') +
    '</div></div>' +
    '<div class="card preview-card"><h3 style="margin-bottom:10px">' + esc(t('original')) + '</h3><div id="pv"></div></div></div>';
}

const explInFlight = new Set();
async function afterDetail() {
  const id = S.detailId, r = getRec(id);
  if (!r) return;
  dbGet('files', id).then(f => {
    const el = $('#pv');
    if (el && S.detailId === id && S.view === 'detail') el.innerHTML = previewHTML(f);
  });
  loadExpl(r);
}
async function loadExpl(r) {
  const L = lang;
  const box = () => ((S.view === 'detail' && S.detailId === r.id && lang === L) ? $('#expl') : null);
  let ex = r.explanation && r.explanation[L];
  if (!ex) {
    const key = r.id + ':' + L;
    if (explInFlight.has(key)) { if (box()) box().innerHTML = loadingExpl(); return; }
    explInFlight.add(key);
    if (box()) box().innerHTML = loadingExpl();
    try {
      const res = await api('/api/explain', { record: lite(r), lang: L });
      ex = res.explanation || {};
      r.explanation = r.explanation || {};
      r.explanation[L] = ex;
      await dbPut('records', r);
    } catch (e) {
      explInFlight.delete(key);
      if (box()) box().innerHTML = '<p class="muted">' + esc(t('expl_fail')) + '</p><button type="button" class="btn small secondary" data-act="retryexpl">' + esc(t('retry')) + '</button>';
      showError(e.message);
      return;
    }
    explInFlight.delete(key);
  }
  if (box()) box().innerHTML = explHTML(ex);
}
function loadingExpl() {
  return '<p class="muted">' + esc(t('loading_expl')) + '</p><div class="skeleton" style="width:90%"></div><div class="skeleton" style="width:75%"></div><div class="skeleton" style="width:82%"></div>';
}

/* ================= View: Health ================= */
function profile() {
  const recs = sortedRecords();
  const cond = new Map();
  recs.slice().reverse().forEach(r => arr(r.diagnoses).forEach(d => {
    const k = String(d.name || '').trim().toLowerCase();
    if (k && !cond.has(k)) cond.set(k, { name: d.name, date: r.date, id: r.id });
  }));
  const meds = new Map();
  recs.filter(r => r.doc_type === 'prescription' || r.doc_type === 'discharge_summary').forEach(r => arr(r.medicines).forEach(m => {
    const k = String(m.name || '').trim().toLowerCase();
    if (k && !meds.has(k)) meds.set(k, { m, date: r.date, id: r.id });
  }));
  const latest = new Map();
  recs.forEach(r => arr(r.tests).forEach(x => {
    const k = String(x.name || '').trim().toLowerCase();
    if (k && !latest.has(k)) latest.set(k, { x, date: r.date, id: r.id });
  }));
  const series = new Map();
  recs.slice().reverse().forEach(r => {
    if (!r.date) return;
    arr(r.tests).forEach(x => {
      if (!isNum(x.value)) return;
      const k = String(x.standard_name || x.name || '').trim().toLowerCase();
      if (!k) return;
      const unit = String(x.unit || '').replace(/\s+/g, '').toLowerCase();
      if (!series.has(k)) series.set(k, { name: x.standard_name || x.name, unit: x.unit, ukey: unit, pts: [], skipped: 0 });
      if (series.get(k).ukey !== unit) { series.get(k).skipped++; return; }
      series.get(k).pts.push({ date: String(r.date).slice(0, 10), v: Number(x.value), flag: x.flag, lo: isNum(x.ref_low) ? Number(x.ref_low) : null, hi: isNum(x.ref_high) ? Number(x.ref_high) : null });
    });
  });
  const trends = Array.from(series.values()).filter(s => s.pts.length >= 2);
  return { cond: Array.from(cond.values()), meds: Array.from(meds.values()), latest: Array.from(latest.values()), trends };
}

function chartSVG(s) {
  const W = 360, H = 160, pl = 38, pr = 46, pt = 16, pb = 26;
  const pts = s.pts;
  let band = null;
  for (let i = pts.length - 1; i >= 0; i--) { if (pts[i].lo !== null || pts[i].hi !== null) { band = { lo: pts[i].lo, hi: pts[i].hi }; break; } }
  const vals = pts.map(p => p.v);
  let mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals);
  if (band) { if (band.lo !== null) { mn = Math.min(mn, band.lo); mx = Math.max(mx, band.lo); } if (band.hi !== null) { mn = Math.min(mn, band.hi); mx = Math.max(mx, band.hi); } }
  if (mx === mn) { mx += 1; mn -= 1; }
  const padv = (mx - mn) * 0.12; mn -= padv; mx += padv;
  const ts = pts.map(p => Date.parse(p.date));
  const t0 = Math.min.apply(null, ts), t1 = Math.max.apply(null, ts);
  const X = i => (t1 === t0 ? pl + (W - pl - pr) * (i / Math.max(1, pts.length - 1)) : pl + (ts[i] - t0) / (t1 - t0) * (W - pl - pr));
  const Y = v => pt + (1 - (v - mn) / (mx - mn)) * (H - pt - pb);
  let g = '';
  if (band) {
    const top = band.hi !== null ? Y(band.hi) : pt, bot = band.lo !== null ? Y(band.lo) : H - pb;
    g += '<rect x="' + pl + '" y="' + top.toFixed(1) + '" width="' + (W - pl - pr) + '" height="' + Math.max(1, bot - top).toFixed(1) + '" fill="#0F766E" opacity="0.13"/>';
  }
  g += '<line x1="' + pl + '" y1="' + (H - pb) + '" x2="' + (W - pr) + '" y2="' + (H - pb) + '" stroke="var(--line)"/>';
  g += '<polyline fill="none" stroke="var(--muted)" stroke-width="1.5" points="' + pts.map((p, i) => X(i).toFixed(1) + ',' + Y(p.v).toFixed(1)).join(' ') + '"/>';
  pts.forEach((p, i) => { g += '<circle cx="' + X(i).toFixed(1) + '" cy="' + Y(p.v).toFixed(1) + '" r="4" fill="' + FLAGC[normFlag(p.flag)] + '" stroke="var(--card)" stroke-width="1.5"><title>' + esc(fmtDate(p.date) + ': ' + fmtNum(p.v) + ' ' + (s.unit || '') + ' (' + t('flag_' + normFlag(p.flag)) + ')') + '</title></circle>'; });
  const li = pts.length - 1;
  g += '<text class="last" x="' + (X(li) + 7).toFixed(1) + '" y="' + (Y(pts[li].v) + 3).toFixed(1) + '">' + esc(fmtNum(pts[li].v)) + '</text>';
  g += '<text x="' + (pl - 5) + '" y="' + (pt + 4) + '" text-anchor="end">' + esc(fmtNum(mx)) + '</text>';
  g += '<text x="' + (pl - 5) + '" y="' + (H - pb) + '" text-anchor="end">' + esc(fmtNum(mn)) + '</text>';
  const short = { day: 'numeric', month: 'short', year: '2-digit' };
  g += '<text x="' + pl + '" y="' + (H - 8) + '" text-anchor="start">' + esc(fmtDate(pts[0].date, short)) + '</text>';
  g += '<text x="' + (W - pr) + '" y="' + (H - 8) + '" text-anchor="end">' + esc(fmtDate(pts[li].date, short)) + '</text>';
  return '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(s.name) + '">' + g + '</svg>';
}

function abhaNumber(p) {
  const a = p && p.abha;
  if (!a) return '';
  return typeof a === 'string' ? a : (a.number || a.abha_number || '');
}
function viewHealth() {
  const head = '<div class="page-head"><h1>' + esc(t('health_title')) + '</h1><p>' + esc(t('health_sub')) + '</p></div>';
  if (!S.records.length) return head + '<div class="card empty"><p>' + esc(t('none_yet')) + '</p><button type="button" class="btn" data-act="nav" data-view="add">' + esc(t('go_add')) + '</button></div>';
  const P = profile(), p = S.patient || {};
  const ab = abhaNumber(p);
  const sexLbl = s => { const v = String(s || '').toLowerCase(); return v === 'male' || v === 'm' ? t('sex_male') : (v === 'female' || v === 'f' ? t('sex_female') : (s || '')); };
  const ov = S.overview[lang];
  const out = P.latest.filter(o => ['low', 'high', 'critical'].indexOf(normFlag(o.x.flag)) >= 0).length;
  const tile = (n, label, cls) => '<div class="stat ' + cls + '"><div class="stat-n">' + esc(n) + '</div><div class="stat-l">' + esc(label) + '</div></div>';
  const tiles = '<div class="stats">' + tile(S.records.length, t('stat_records'), 's-teal') + tile(out, t('stat_out'), out ? 's-amber' : 's-green') +
    tile(P.meds.length, t('stat_meds'), 's-blue') + tile(P.cond.length, t('stat_cond'), 's-plain') + '</div>';
  const headV = '<div class="page-head row between"><div><h1>' + esc(t('health_title')) + '</h1><p>' + esc(t('health_sub')) + '</p></div>' +
    '<button type="button" class="btn secondary" data-act="visit">' + esc(t('visit_btn')) + '</button></div>';
  return headV + tiles + '<div class="stack" style="margin-bottom:14px">' + medsTodayCard(P) + pharmacistCard(P) + '</div><div class="health-grid">' +
    '<div class="card"><h2 style="margin-bottom:10px">' + esc(t('h_patient')) + '</h2><dl class="kv"><dt>' + esc(t('h_name')) + '</dt><dd>' + esc(p.name || '-') + '</dd><dt>' + esc(t('h_age')) + '</dt><dd>' + esc(p.age || '-') + '</dd><dt>' + esc(t('h_sex')) + '</dt><dd>' + esc(sexLbl(p.sex) || '-') + '</dd><dt>' + esc(t('h_abha')) + '</dt><dd class="mono">' + esc(ab || t('not_linked')) + '</dd></dl></div>' +
    '<div class="card"><h2 style="margin-bottom:10px">' + esc(t('h_conditions')) + '</h2>' +
    (P.cond.length ? '<ul class="list">' + P.cond.map(c => '<li><span class="l">' + esc(c.name) + '</span><span class="r muted small">' + esc(t('first_seen', { d: fmtDate(c.date) })) + '</span></li>').join('') + '</ul>' : '<p class="muted">' + esc(t('no_items')) + '</p>') + '</div>' +
    '<div class="card"><h2 style="margin-bottom:10px">' + esc(t('h_meds')) + '</h2>' +
    (P.meds.length ? '<ul class="list">' + P.meds.map(o => '<li><span class="l"><strong>' + esc(o.m.name) + '</strong><br><span class="muted small">' + esc([o.m.strength, o.m.dose, o.m.frequency].filter(Boolean).join(' / ')) + '</span></span><span class="r muted small">' + esc(t('from_rec', { d: fmtDate(o.date) })) + '</span></li>').join('') + '</ul>' : '<p class="muted">' + esc(t('no_items')) + '</p>') + '</div>' +
    '<div class="card"><h2 style="margin-bottom:10px">' + esc(t('h_latest')) + '</h2>' +
    (P.latest.length ? '<ul class="list">' + P.latest.map(o => '<li><span class="l">' + esc(o.x.name) + '<br><span class="muted small">' + esc(fmtDate(o.date)) + '</span></span><span class="r"><span class="mono">' + esc(o.x.value) + ' ' + esc(o.x.unit) + '</span><br>' + badge(o.x.flag) + '</span></li>').join('') + '</ul>' : '<p class="muted">' + esc(t('no_items')) + '</p>') + '</div>' +
    '<div class="card full"><h2 style="margin-bottom:10px">' + esc(t('h_trends')) + '</h2>' +
    (P.trends.length ? '<div class="trends">' + P.trends.map(s => '<div class="trend"><h4><span>' + esc(s.name) + '</span><span class="mono muted small">' + esc(s.unit) + '</span></h4>' + chartSVG(s) + (s.skipped ? '<p class="muted small">' + esc(t('unit_skip', { n: s.skipped })) + '</p>' : '') + '</div>').join('') + '</div><p class="muted small" style="margin-top:8px">' + esc(t('band_note')) + '</p>' : '<p class="muted">' + esc(t('no_trends')) + '</p>') + '</div>' +
    '<div class="card full"><div class="row between"><h2>' + esc(t('overview_title')) + '</h2><button type="button" class="btn secondary" data-act="overview"' + (S.busy.overview ? ' disabled' : '') + '>' + esc(S.busy.overview ? t('working') : t('gen_overview')) + '</button></div>' +
    (ov ? '<div style="margin-top:12px">' + (ov.summary ? '<p>' + esc(ov.summary) + '</p>' : '') +
      (arr(ov.highlights).length ? '<h3 style="margin:10px 0 4px">' + esc(t('highlights')) + '</h3><ul class="qlist">' + ov.highlights.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>' : '') +
      (arr(ov.watch).length ? '<h3 style="margin:10px 0 4px">' + esc(t('watch')) + '</h3><ul class="qlist">' + ov.watch.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>' : '') +
      (ov.disclaimer ? '<p class="muted small" style="margin-top:10px">' + esc(ov.disclaimer) + '</p>' : '') + '</div>' : '') + '</div></div>';
}
async function genOverview() {
  if (S.busy.overview) return;
  S.busy.overview = true; clearError(); render();
  const L = lang;
  try {
    const res = await api('/api/overview', { patient: S.patient || {}, records: S.records.map(lite), lang: L });
    S.overview[L] = res.overview || {};
  } catch (e) { showError(e.message, genOverview); }
  S.busy.overview = false; render();
}

/* ================= View: Ask ================= */
function srcChips(ids) {
  return arr(ids).map(id => {
    const r = getRec(id);
    if (!r) return '';
    return '<button type="button" class="chip" data-act="openrec" data-id="' + esc(id) + '">' + esc((r.title || typeLabel(r.doc_type)) + (r.date ? ' (' + fmtDate(r.date) + ')' : '')) + '</button>';
  }).join('');
}
function viewAsk() {
  const head = '<div class="page-head"><h1>' + esc(t('ask_title')) + '</h1><p>' + esc(t('ask_sub')) + '</p></div>';
  if (!S.records.length) return head + '<div class="card empty"><p>' + esc(t('ask_empty')) + '</p><button type="button" class="btn" data-act="nav" data-view="add">' + esc(t('go_add')) + '</button></div>';
  const qs = ['q1', 'q2', 'q3'].map(k => '<button type="button" class="chip" data-act="askq" data-q="' + k + '">' + esc(t(k)) + '</button>').join('');
  const msgs = S.chat.map(m => {
    if (m.role === 'me') return '<div class="msg me"><div class="who">' + esc(t('you')) + '</div>' + esc(m.text) + '</div>';
    const src = srcChips(m.sources);
    const kinds = ['records', 'general', 'doctor', 'emergency', 'signin'];
    const lbl = kinds.indexOf(m.label) >= 0 ? '<span class="lbl lbl-' + m.label + '">' + esc(t('label_' + m.label)) + '</span>' : '';
    return '<div class="msg' + (m.label === 'emergency' ? ' urgent' : '') + '"><div class="who">' + esc(t('assistant')) + lbl + '</div>' + esc(m.label === 'signin' ? t('signin_msg') : m.text) + signinBtns(m) + (src ? '<div class="srcs"><div class="muted small" style="margin-bottom:4px">' + esc(t('sources')) + '</div><div class="chips">' + src + '</div></div>' : '') + '</div>';
  }).join('');
  return head + '<div class="chips">' + qs + '</div>' +
    '<div class="chat" id="chat">' + msgs + (S.asking ? '<div class="msg muted">' + esc(t('thinking')) + '</div>' : '') + '</div>' +
    '<form class="askform" id="askForm"><input type="text" id="askInput" placeholder="' + esc(t('ask_ph')) + '" aria-label="' + esc(t('ask_ph')) + '" autocomplete="off"><button type="submit" class="btn"' + (S.asking ? ' disabled' : '') + '>' + esc(t('ask_send')) + '</button></form>';
}
async function ask(q) {
  q = String(q || '').trim();
  if (!q || S.asking) return;
  S.chat.push({ role: 'me', text: q });
  const known = window.SehatFAQ ? SehatFAQ.answer(q) : null;
  if (known && (known.kind === 'faq' || (known.kind === 'emergency' && !currentUser()))) {
    // what the product is, how it works, pricing, privacy: fixed answers, no model, no sign-in
    S.chat.push({ role: 'bot', text: siteText(known.text), label: known.kind === 'emergency' ? 'emergency' : 'general' });
    render(); scrollChat();
    return;
  }
  if (!currentUser()) {
    // guests: questions about reports need sign-in; nothing is sent to the API
    S.chat.push({ role: 'bot', text: '', label: 'signin', q: q });
    render(); scrollChat();
    return;
  }
  S.asking = true; clearError(); render(); scrollChat();
  try {
    const res = await api('/api/ask', { question: q, records: S.records.map(lite), lang });
    S.chat.push({ role: 'bot', text: res.answer || '', sources: arr(res.sources), label: res.label || null });
  } catch (e) {
    showError(e.message, () => ask(q));
  }
  S.asking = false; render(); scrollChat();
}
function scrollChat() { const c = $('#chat'); if (c) { const f = $('#askForm'); (f || c).scrollIntoView({ block: 'end' }); } }

/* ================= View: ABHA ================= */
function fmtAbha(digits) {
  const d = String(digits || '').replace(/\D/g, '').slice(0, 14);
  const parts = [d.slice(0, 2), d.slice(2, 6), d.slice(6, 10), d.slice(10, 14)].filter(Boolean);
  return parts.join('-');
}
function viewAbha() {
  const p = S.patient || {};
  const linked = abhaNumber(p);
  const addr = p.abha && typeof p.abha === 'object' ? p.abha.address : '';
  const counts = {};
  if (S.fhir) arr(S.fhir.entry).forEach(e => { const rt = e && e.resource && e.resource.resourceType; if (rt) counts[rt] = (counts[rt] || 0) + 1; });
  return '<div class="page-head"><h1>' + esc(t('abha_title')) + '</h1></div><div class="stack">' +
    '<div class="card"><p>' + esc(t('abha_about1')) + '</p><p class="muted" style="margin:0">' + esc(t('abha_about2')) + '</p></div>' +
    '<div class="card"><div class="notice info" style="margin-bottom:12px">' + esc(t('abha_demo')) + '</div>' +
    (linked ? '<p><strong>' + esc(t('abha_linked', { n: '' })) + '</strong><span class="mono">' + esc(linked) + '</span>' + (addr ? '<br><span class="muted small">' + esc(t('abha_addr')) + ': <span class="mono">' + esc(addr) + '</span></span>' : '') + '</p>' +
      '<button type="button" class="btn" data-act="abhaimport"' + (S.busy.abha ? ' disabled' : '') + '>' + esc(S.busy.abha ? t('working') : t('abha_import')) + '</button>' : '') +
    '<form class="abha-form" id="abhaForm" style="' + (linked ? 'margin-top:14px' : '') + '"><label class="fld"><span>' + esc(t('abha_label')) + '</span><input type="text" id="abhaInput" class="mono" inputmode="numeric" placeholder="12-3456-7890-1234" maxlength="17" autocomplete="off"></label>' +
    '<button type="submit" class="btn' + (linked ? ' secondary' : '') + '"' + (S.busy.abha ? ' disabled' : '') + '>' + esc(S.busy.abha ? t('working') : t('abha_link')) + '</button></form>' +
    (S.notice ? '<p class="small" style="margin-top:10px;color:var(--ok)">' + esc(S.notice) + '</p>' : '') + '</div>' +
    '<div class="card"><h2 style="margin-bottom:6px">' + esc(t('fhir_title')) + '</h2><p class="muted">' + esc(t('fhir_note')) + '</p>' +
    '<button type="button" class="btn" data-act="fhir"' + (S.busy.fhir || !S.records.length ? ' disabled' : '') + '>' + esc(S.busy.fhir ? t('working') : t('fhir_btn')) + '</button>' +
    (S.fhir ? '<div style="margin-top:14px"><div class="muted small">' + esc(t('fhir_counts')) + '</div><div class="counts-list">' +
      Object.keys(counts).map(k => '<span class="badge"><span class="mono">' + esc(k) + '</span>&nbsp;' + counts[k] + '</span>').join('') + '</div>' +
      '<details class="preview"><summary>' + esc(t('fhir_prev')) + '</summary><pre>' + esc(JSON.stringify(S.fhir, null, 2)) + '</pre></details></div>' : '') + '</div>' +
    backupCard() +
    '<div class="card"><h2 style="margin-bottom:6px">' + esc(t('data_title')) + '</h2><p class="muted">' + esc(t('consent')) + '</p><p class="muted small">' + esc(t('privacy')) + '</p><p class="muted">' + esc(t('wipe_hint')) + '</p><button type="button" class="btn danger" data-act="wipe">' + esc(t('wipe_btn')) + '</button></div></div>';
}
async function linkAbha(digits, importOnly) {
  if (S.busy.abha) return;
  S.busy.abha = true; S.notice = null; clearError(); render();
  try {
    const res = await api('/api/abha', { abha: digits });
    if (!res.linked) throw new Error(t('err_generic'));
    const old = S.patient || {};
    S.patient = {
      name: old.name || res.name || null, age: old.age == null ? null : old.age, sex: old.sex || null,
      abha: { number: res.abha_number || fmtAbha(digits), address: res.abha_address || '', name: res.name || '' }
    };
    await dbPut('meta', S.patient, 'patient');
    if (importOnly) {
      let n = 0;
      for (const raw of arr(res.records)) {
        const r = normalizeRecord(raw);
        r.source = 'abha';
        if (getRec(r.id)) continue;
        await saveRecordLocal(r); n++;
      }
      S.notice = t('abha_imported', { n: n });
      if (n) S.overview = {};
    }
  } catch (e) { showError(e.message, () => linkAbha(digits, importOnly)); }
  S.busy.abha = false; render();
}
async function exportFhir() {
  if (S.busy.fhir) return;
  S.busy.fhir = true; clearError(); render();
  try {
    const b = await api('/api/fhir', { patient: S.patient || {}, records: S.records.map(lite) });
    S.fhir = b;
    const blob = new Blob([JSON.stringify(b, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'sehat-fhir-bundle.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  } catch (e) { showError(e.message, exportFhir); }
  S.busy.fhir = false; render();
}
async function wipeAll() {
  if (!confirm(t('confirm_wipe'))) return;
  await dbClear('records'); await dbClear('files'); await dbClear('meta');
  S.records = []; S.patient = null; S.overview = {}; S.chat = []; S.fhir = null; S.notice = null;
  S.draft = null; S.stage = 'idle'; S.view = 'add'; S.detailId = null;
  render();
}

/* ================= Sign-in gate for questions ================= */
function signinBtns(m) {
  if (!m || m.label !== 'signin') return '';
  return '<div class="signin-acts"><a class="btn small" href="/login">' + esc(t('sign_in')) + '</a>' +
    '<button type="button" class="btn small secondary" data-act="demoacct" data-i="' + S.chat.indexOf(m) + '">' + esc(t('use_demo_acct')) + '</button></div>';
}
document.addEventListener('click', e => {
  const el = e.target && e.target.closest ? e.target.closest('[data-act="demoacct"]') : null;
  if (!el) return;
  try { localStorage.setItem('sehat_user', JSON.stringify({ name: 'Rahul Sharma', email: 'demo@sehat.local', demo: true })); } catch (x) { /* ignore */ }
  const i = Number(el.dataset.i), m = S.chat[i];
  const q = m && m.q;
  if (m) { if (i > 0 && S.chat[i - 1].role === 'me') S.chat.splice(i - 1, 2); else S.chat.splice(i, 1); }
  render();
  if (q) ask(q);
});

/* ================= Medicines today ================= */
const SLOT_ORDER = ['morning', 'afternoon', 'night', 'asis', 'prn', 'weekly'];
const TAKEN_MEM = {};
function todayKey() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
/* Reads the written frequency and timing of a medicine and returns the slots it falls in. */
function medSlots(m) {
  const all = (String(m.frequency || '') + ' ' + String(m.timing || '')).toLowerCase();
  if (/when needed|if needed|as needed|only when|\bsos\b|\bprn\b/.test(all)) return ['prn'];
  if (/once a week|once weekly|weekly|per week|a week|every week/.test(all)) return ['weekly'];
  if (/four times|4 times|\bqid\b|\bqds\b/.test(all)) return ['morning', 'afternoon', 'night', 'night'];
  if (/three times|3 times|thrice|\btid\b|\btds\b/.test(all)) return ['morning', 'afternoon', 'night'];
  if (/twice|two times|2 times|\bbd\b|\bbid\b/.test(all)) return ['morning', 'night'];
  const pat = all.match(/\b([01])\s*-\s*([01])\s*-\s*([01])\b/);
  if (pat) {
    const o = [];
    if (pat[1] === '1') o.push('morning');
    if (pat[2] === '1') o.push('afternoon');
    if (pat[3] === '1') o.push('night');
    if (o.length) return o;
  }
  const hits = [];
  if (/morning|breakfast/.test(all)) hits.push('morning');
  if (/afternoon|lunch/.test(all)) hits.push('afternoon');
  if (/evening|night|bedtime|bed time|dinner/.test(all)) hits.push('night');
  if (/once|daily|\bod\b|every day|one time|1 time/.test(all)) return [hits[0] || 'asis'];
  return hits.length ? hits : ['asis'];
}
function buildDoses(P) {
  const out = [];
  P.meds.forEach(o => medSlots(o.m).forEach((slot, i) => {
    out.push({ key: String(o.m.name || '').trim().toLowerCase() + '|' + slot + '|' + i, slot, m: o.m, date: o.date });
  }));
  return out;
}
const isTickable = slot => slot === 'morning' || slot === 'afternoon' || slot === 'night' || slot === 'asis';
function takenGet() {
  const k = todayKey();
  if (!TAKEN_MEM[k]) { try { TAKEN_MEM[k] = JSON.parse(localStorage.getItem('sehat_taken_' + k) || '{}') || {}; } catch (e) { TAKEN_MEM[k] = {}; } }
  return TAKEN_MEM[k];
}
function takenSave() { const k = todayKey(); try { localStorage.setItem('sehat_taken_' + k, JSON.stringify(TAKEN_MEM[k] || {})); } catch (e) { /* ignore */ } }
function remindOn() {
  try { return localStorage.getItem('sehat_remind') === '1' && typeof Notification !== 'undefined' && Notification.permission === 'granted'; } catch (e) { return false; }
}
function takenCountText(doses) {
  const tk = takenGet(), list = doses.filter(d => isTickable(d.slot));
  return t('mt_count', { x: list.filter(d => tk[d.key]).length, y: list.length });
}
function medsTodayCard(P) {
  const doses = buildDoses(P), tk = takenGet();
  let h = '<div class="card medday"><h2 style="margin-bottom:10px">' + esc(t('mt_title')) + '</h2>';
  if (!doses.length) return h + '<p class="muted">' + esc(t('mt_empty')) + '</p></div>';
  h += '<p class="small" style="margin:0 0 8px"><strong id="takenCount">' + esc(takenCountText(doses)) + '</strong></p>';
  SLOT_ORDER.forEach(slot => {
    const list = doses.filter(d => d.slot === slot);
    if (!list.length) return;
    h += '<div class="slot"><h3>' + esc(t('slot_' + slot)) + '</h3><ul class="list">' + list.map(d => {
      const m = d.m;
      const detail = [(slot === 'asis' || slot === 'prn' || slot === 'weekly') ? m.frequency : '', m.timing].filter(Boolean).join(', ');
      const body = '<span class="l"><strong>' + esc(m.name) + '</strong>' + (m.strength ? ' <span class="mono">' + esc(m.strength) + '</span>' : '') +
        (detail ? '<br><span class="muted small">' + esc(detail) + '</span>' : '') + '</span>';
      if (!isTickable(slot)) return '<li>' + body + '</li>';
      return '<li><label class="dose"><input type="checkbox" data-dose="' + esc(d.key) + '"' + (tk[d.key] ? ' checked' : '') + '>' + body +
        '<span class="muted small dose-lbl">' + esc(t('mt_taken')) + '</span></label></li>';
    }).join('') + '</ul></div>';
  });
  const supported = typeof Notification !== 'undefined';
  h += '<div class="remind"><label class="dose"><input type="checkbox" data-remind="1"' + (remindOn() ? ' checked' : '') + (supported ? '' : ' disabled') + '><span class="l">' + esc(t('mt_remind')) + '</span></label>' +
    '<p class="muted small" style="margin:4px 0 0">' + esc(t('mt_remind_note')) + '</p>' +
    '<p class="small remind-denied" id="remindDenied" hidden>' + esc(t('mt_remind_denied')) + '</p></div>' +
    '<p class="muted small" style="margin:12px 0 0">' + esc(t('mt_note')) + '</p></div>';
  return h;
}
document.addEventListener('change', async e => {
  const el = e.target;
  if (!el || !el.hasAttribute) return;
  if (el.hasAttribute('data-dose')) {
    const tk = takenGet(), key = el.getAttribute('data-dose');
    if (el.checked) tk[key] = 1; else delete tk[key];
    takenSave();
    const c = document.getElementById('takenCount');
    if (c) c.textContent = takenCountText(buildDoses(profile()));
  } else if (el.hasAttribute('data-remind')) {
    const den = document.getElementById('remindDenied');
    if (den) den.hidden = true;
    if (el.checked) {
      let perm = 'denied';
      try { perm = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission(); } catch (x) { /* ignore */ }
      if (perm !== 'granted') {
        el.checked = false;
        if (den) den.hidden = false;
        try { localStorage.setItem('sehat_remind', '0'); } catch (x) { /* ignore */ }
        return;
      }
    }
    try { localStorage.setItem('sehat_remind', el.checked ? '1' : '0'); } catch (x) { /* ignore */ }
  }
});
/* While the tab is open: one notification per slot per day, at 08:00, 14:00 and 21:00, only if doses are still unticked. */
const REMIND_AT = [['morning', 8], ['afternoon', 14], ['night', 21]];
const REMINDED = {};
function checkReminders() {
  if (!remindOn() || !S.records.length) return;
  const now = new Date(), mins = now.getHours() * 60 + now.getMinutes(), day = todayKey();
  REMIND_AT.forEach(r => {
    const slot = r[0], diff = mins - r[1] * 60, mk = day + slot;
    if (diff < 0 || diff > 2 || REMINDED[mk]) return;
    let sent = {};
    try { sent = JSON.parse(localStorage.getItem('sehat_notified_' + day) || '{}') || {}; } catch (x) { /* ignore */ }
    if (sent[slot]) { REMINDED[mk] = 1; return; }
    REMINDED[mk] = 1; sent[slot] = 1;
    try { localStorage.setItem('sehat_notified_' + day, JSON.stringify(sent)); } catch (x) { /* ignore */ }
    const tk = takenGet();
    const left = buildDoses(profile()).filter(d => d.slot === slot && !tk[d.key]).length;
    if (left) { try { new Notification(t('mt_notif_title'), { body: t('mt_notif_body', { slot: t('slot_' + slot), n: left }) }); } catch (x) { /* ignore */ } }
  });
}
setInterval(checkReminders, 60000);

/* ================= Things to ask your pharmacist ================= */
async function runMedcheck(key, meds) {
  let res = null;
  try { res = await api('/api/medcheck', { medicines: meds, lang }); } catch (e) { /* fail silently */ }
  if (S.medcheck && S.medcheck.key === key) {
    S.medcheck.state = res && typeof res === 'object' ? 'ok' : 'fail';
    S.medcheck.data = res;
    if (S.view === 'health') render();
  }
}
function pharmacistCard(P) {
  if (!P.meds.length) return '';
  const meds = P.meds.map(o => ({ name: o.m.name, generic: o.m.generic, strength: o.m.strength }));
  const key = lang + '|' + JSON.stringify(meds);
  if (!S.medcheck || S.medcheck.key !== key) { S.medcheck = { key, state: 'loading', data: null }; runMedcheck(key, meds); }
  const mc = S.medcheck;
  let h = '<div class="card"><h2 style="margin-bottom:10px">' + esc(t('ph_title')) + '</h2>';
  if (mc.state === 'loading') return h + '<p class="muted">' + esc(t('ph_loading')) + '</p></div>';
  if (mc.state === 'fail') return h + '<p class="muted">' + esc(t('ph_fail')) + '</p></div>';
  const d = mc.data || {}, dups = arr(d.duplicates), ints = arr(d.interactions);
  if (!dups.length && !ints.length) h += '<p>' + esc(t('ph_none')) + '</p>';
  else {
    h += '<ul class="list pharm">' +
      dups.map(x => '<li><span class="l">' + esc(t('ph_dup', { ingredient: x.ingredient, names: arr(x.names).join(', ') })) + '</span></li>').join('') +
      ints.map(x => {
        const nm = arr(x.names), sev = ['major', 'moderate', 'minor'].indexOf(x.severity) >= 0 ? x.severity : 'minor';
        return '<li><span class="l">' + esc((nm[0] || x.a) + ' + ' + (nm[1] || x.b) + ': ' + x.note) + '</span><span class="r"><span class="sev sev-' + sev + '">' + esc(t('sev_' + sev)) + '</span></span></li>';
      }).join('') + '</ul>';
  }
  if (d.disclaimer) h += '<p class="muted small" style="margin:10px 0 0">' + esc(d.disclaimer) + '</p>';
  return h + '</div>';
}

/* ================= Doctor visit summary ================= */
function viewVisit() {
  if (!S.records.length) { S.view = 'health'; return viewHealth(); }
  const P = profile(), p = S.patient || {}, ab = abhaNumber(p);
  const sx = String(p.sex || '').toLowerCase();
  const sexTxt = sx === 'male' || sx === 'm' ? t('sex_male') : (sx === 'female' || sx === 'f' ? t('sex_female') : (p.sex || ''));
  const line = [p.name, p.age ? t('h_age') + ' ' + p.age : '', sexTxt, ab ? t('h_abha') + ' ' + ab : ''].filter(Boolean).join('  |  ');
  const seen = new Set(), qs = [];
  sortedRecords().forEach(r => {
    const ex = r.explanation && r.explanation[lang];
    arr(ex && ex.questions).forEach(q => {
      const s = String(q || '').trim(), k = s.toLowerCase();
      if (s && !seen.has(k) && qs.length < 6) { seen.add(k); qs.push(s); }
    });
  });
  const abn = P.latest.filter(o => isAbn(normFlag(o.x.flag)));
  const th = a => '<thead><tr>' + a.map(x => '<th>' + esc(x) + '</th>').join('') + '</tr></thead>';
  const none = '<p class="muted">' + esc(t('visit_none')) + '</p>';
  const sec = (title, body) => '<section class="visit-sec"><h2>' + esc(title) + '</h2>' + body + '</section>';
  const notes = S.visitNotes || '';
  return '<div class="visit">' +
    '<div class="visit-head"><h1>' + esc(t('visit_title')) + '</h1>' +
    '<p class="visit-pt">' + esc(line || '-') + '</p><p class="muted small">' + esc(t('visit_generated', { d: fmtDate(todayKey()) })) + '</p></div>' +
    sec(t('visit_cond'), P.cond.length ? '<ul class="qlist">' + P.cond.map(c => '<li>' + esc(c.name) + ' <span class="muted small">(' + esc(t('first_seen', { d: fmtDate(c.date) })) + ')</span></li>').join('') + '</ul>' : none) +
    sec(t('visit_meds'), P.meds.length ? '<div class="tablewrap"><table class="data">' + th([t('m_name'), t('m_strength'), t('visit_how'), t('visit_since')]) + '<tbody>' +
      P.meds.map(o => '<tr><td><strong>' + esc(o.m.name) + '</strong></td><td>' + esc(o.m.strength || '') + '</td><td>' + esc([o.m.dose, o.m.frequency, o.m.timing].filter(Boolean).join(', ')) + '</td><td>' + esc(fmtDate(o.date)) + '</td></tr>').join('') + '</tbody></table></div>' : none) +
    sec(t('visit_abn'), abn.length ? '<div class="tablewrap"><table class="data">' + th([t('t_name'), t('t_value'), t('t_range'), t('f_date'), t('t_flag')]) + '<tbody>' +
      abn.map(o => '<tr><td>' + esc(o.x.name) + '</td><td class="mono">' + esc(o.x.value) + ' ' + esc(o.x.unit || '') + '</td><td class="mono">' + esc(refText(o.x)) + '</td><td>' + esc(fmtDate(o.date)) + '</td><td><strong>' + esc(t('flag_' + normFlag(o.x.flag))) + '</strong></td></tr>').join('') + '</tbody></table></div>' : none) +
    sec(t('visit_changes'), P.trends.length ? '<ul class="qlist">' + P.trends.slice(0, 8).map(s => {
      const a = s.pts[0], b = s.pts[s.pts.length - 1], u = s.unit ? ' ' + s.unit : '';
      return '<li><strong>' + esc(s.name) + ':</strong> ' + esc(fmtNum(a.v) + u + ' (' + fmtDate(a.date) + ')  →  ' + fmtNum(b.v) + u + ' (' + fmtDate(b.date) + ')') + '</li>';
    }).join('') + '</ul>' : none) +
    sec(t('visit_q'), (qs.length ? '<ul class="qlist">' + qs.map(q => '<li>' + esc(q) + '</li>').join('') + '</ul>' : '<p class="muted noprint">' + esc(t('visit_noq')) + '</p>') +
      '<h3 style="margin:12px 0 6px">' + esc(t('visit_notes')) + '</h3><textarea id="visitNotes" class="visit-notes" rows="5" aria-label="' + esc(t('visit_notes')) + '">' + esc(notes) + '</textarea>' +
      '<div class="print-notes" id="visitNotesPrint">' + esc(notes) + '</div>') +
    '<p class="muted small visit-foot">' + esc(t('visit_footer')) + '</p>' +
    '<div class="row noprint" style="margin-top:16px"><button type="button" class="btn" data-act="print">' + esc(t('visit_print')) + '</button>' +
    '<button type="button" class="btn secondary" data-act="nav" data-view="health">' + esc(t('visit_back')) + '</button></div></div>';
}
document.addEventListener('click', e => {
  const el = e.target && e.target.closest ? e.target.closest('[data-act]') : null;
  if (!el) return;
  const a = el.dataset.act;
  if (a === 'visit') go('visit');
  else if (a === 'print') window.print();
  else if (a === 'bkdownload') backupDownload();
  else if (a === 'bkrestore') { const i = document.getElementById('restoreInput'); if (i) i.click(); }
});
document.addEventListener('click', e => {
  if (e.target && e.target.closest && e.target.closest('[data-act="nav"]')) S.backupMsg = null;
}, true);
document.addEventListener('input', e => {
  if (!e.target || e.target.id !== 'visitNotes') return;
  S.visitNotes = e.target.value;
  const m = document.getElementById('visitNotesPrint');
  if (m) m.textContent = S.visitNotes;
});

/* ================= Backup and restore ================= */
function backupCard() {
  const m = S.backupMsg;
  return '<div class="card"><h2 style="margin-bottom:6px">' + esc(t('bk_title')) + '</h2><p class="muted">' + esc(t('bk_note')) + '</p>' +
    '<div class="row"><button type="button" class="btn" data-act="bkdownload">' + esc(t('bk_download')) + '</button>' +
    '<button type="button" class="btn secondary" data-act="bkrestore">' + esc(t('bk_restore')) + '</button></div>' +
    '<input type="file" id="restoreInput" accept="application/json,.json" hidden>' +
    (m ? '<p class="small" role="status" style="margin:10px 0 0;color:var(' + (m.ok ? '--ok' : '--crit') + ')">' + esc(m.text) + '</p>' : '') + '</div>';
}
async function backupDownload() {
  try {
    const files = arr(await dbGetAll('files'));
    const payload = { version: 1, exportedAt: new Date().toISOString(), patient: S.patient || null, records: S.records, files };
    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'sehat-backup-' + todayKey() + '.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    S.backupMsg = { ok: true, text: t('bk_saved') };
  } catch (e) { S.backupMsg = { ok: false, text: t('err_generic') }; }
  render();
}
async function backupRestore(file) {
  if (!file) return;
  try {
    if (file.size > 40 * 1024 * 1024) throw new Error(t('bk_big'));
    let j = null;
    try { j = JSON.parse(await file.text()); } catch (x) { throw new Error(t('bk_bad')); }
    const good = j && typeof j === 'object' && j.version === 1 && Array.isArray(j.records) &&
      (j.files === undefined || Array.isArray(j.files)) && (j.patient == null || typeof j.patient === 'object') &&
      j.records.every(r => r && typeof r === 'object' && typeof r.id === 'string' && r.id) &&
      arr(j.files).every(f => f && typeof f === 'object' && typeof f.id === 'string' && f.id && typeof f.dataUrl === 'string' && f.dataUrl.indexOf('data:') === 0);
    if (!good) throw new Error(t('bk_bad'));
    if (j.patient) {
      S.patient = { name: j.patient.name || null, age: j.patient.age == null ? null : j.patient.age, sex: j.patient.sex || null, abha: j.patient.abha || null };
      await dbPut('meta', S.patient, 'patient');
    }
    for (const raw of j.records) await saveRecordLocal(normalizeRecord(raw));
    for (const f of arr(j.files)) await dbPut('files', { id: f.id, mime: String(f.mime || ''), dataUrl: f.dataUrl });
    S.overview = {};
    S.backupMsg = { ok: true, text: t('bk_done', { n: j.records.length }) };
  } catch (e) {
    S.backupMsg = { ok: false, text: (e && (e.message === t('bk_big') || e.message === t('bk_bad'))) ? e.message : t('err_generic') };
  }
  render();
}
document.addEventListener('change', e => {
  if (!e.target || e.target.id !== 'restoreInput') return;
  const f = e.target.files && e.target.files[0];
  e.target.value = '';
  backupRestore(f);
});

/* ================= Render ================= */
const ICONS = {
  add: '<path d="M12 5v14M5 12h14"/>',
  timeline: '<path d="M7 3v18"/><circle cx="7" cy="7" r="1.5"/><circle cx="7" cy="17" r="1.5"/><path d="M11 7h9M11 17h6"/>',
  health: '<path d="M3 12h4l2-6 4 12 2-6h6"/>',
  ask: '<path d="M4 5h16v11H9l-5 4z"/>',
  abha: '<path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z"/>'
};
const NAV = [['add', 'nav_add'], ['timeline', 'nav_timeline'], ['health', 'nav_health'], ['ask', 'nav_ask'], ['abha', 'nav_abha']];

function applyStatic() {
  document.documentElement.lang = lang;
  document.documentElement.dir = LANG_RTL[lang] ? 'rtl' : 'ltr';
  document.title = t('app_name');
  $('#brandName').textContent = t('app_name');
  $('#localNote').textContent = t('local_note');
  $('#disclaimer').textContent = t('disclaimer');
  if ($('#langSel')) $('#langSel').value = lang;
  const cur = S.view === 'detail' ? 'timeline' : (S.view === 'visit' ? 'health' : S.view);
  $('#nav').innerHTML = NAV.map(n => '<button type="button" data-act="nav" data-view="' + n[0] + '"' + (cur === n[0] ? ' aria-current="page"' : '') + '><svg viewBox="0 0 24 24" aria-hidden="true">' + ICONS[n[0]] + '</svg><span>' + esc(t(n[1])) + '</span></button>').join('');
  syncDiscHeight();
}
function syncDiscHeight() {
  const d = $('#disclaimer');
  if (d) document.documentElement.style.setProperty('--disc-h', d.offsetHeight + 'px');
}

function render() {
  applyStatic();
  const v = $('#view');
  let html;
  switch (S.view) {
    case 'timeline': html = viewTimeline(); break;
    case 'detail': html = viewDetail(); break;
    case 'health': html = viewHealth(); break;
    case 'visit': html = viewVisit(); break;
    case 'ask': html = viewAsk(); break;
    case 'abha': html = viewAbha(); break;
    default: html = viewAdd();
  }
  // keep ask input text if re-rendering
  const keep = (S.view === 'ask' && $('#askInput')) ? $('#askInput').value : null;
  v.innerHTML = html;
  if (keep) { const i = $('#askInput'); if (i) i.value = keep; }
  paintError();
  if (S.view === 'detail') afterDetail();
}

function go(view) {
  if (S.view === 'add' && S.stage === 'review' && view !== 'add' && S.dirty && !confirm(t('discard') + '?')) return;
  if (view !== 'add' && S.stage === 'review') { S.draft = null; S.pendingFile = null; S.previewFile = null; S.stage = 'idle'; S.editingId = null; }
  S.view = view; S.notice = null;
  clearError();
  render();
  window.scrollTo(0, 0);
}

/* ================= Events ================= */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el) return;
  const a = el.dataset.act;
  switch (a) {
    case 'lang':
      lang = el.dataset.lang === 'hi' ? 'hi' : 'en';
      try { localStorage.setItem('sehat_lang', lang); } catch (x) { /* ignore */ }
      if (S.error) { S.error = null; S.retry = null; }
      render(); break;
    case 'nav': go(el.dataset.view); break;
    case 'choose': $('#fileInput').click(); break;
    case 'photo': $('#camInput').click(); break;
    case 'sample': runSample(el.dataset.id); break;
    case 'demo': loadDemo(); break;
    case 'addrow': addRow(el.dataset.kind); break;
    case 'delrow': delRow(el.dataset.kind, Number(el.dataset.i)); break;
    case 'save': saveDraft(); break;
    case 'discard': discardDraft(); break;
    case 'filter': S.filter = el.dataset.type; render(); break;
    case 'openrec': S.detailId = el.dataset.id; S.view = 'detail'; clearError(); render(); window.scrollTo(0, 0); break;
    case 'edit': startEdit(el.dataset.id); break;
    case 'delete': deleteRecord(el.dataset.id); break;
    case 'retryexpl': { const r = getRec(S.detailId); if (r) { clearError(); loadExpl(r); } break; }
    case 'overview': genOverview(); break;
    case 'askq': ask(t(el.dataset.q)); break;
    case 'abhaimport': { const d = abhaNumber(S.patient).replace(/\D/g, ''); if (d.length === 14) linkAbha(d, true); break; }
    case 'fhir': exportFhir(); break;
    case 'wipe': wipeAll(); break;
    case 'dismiss': clearError(); break;
    case 'retry': { const fn = S.retry; clearError(); if (fn) fn(); break; }
  }
});

document.addEventListener('input', e => {
  const el = e.target;
  if (el.dataset && el.dataset.path) onEdit(el);
  else if (el.id === 'abhaInput') el.value = fmtAbha(el.value);
});
document.addEventListener('change', e => {
  const el = e.target;
  if (el.dataset && el.dataset.path) { onEdit(el); if (el.dataset.path === 'doc_type') { /* no re-render needed */ } }
});

document.addEventListener('submit', e => {
  const f = e.target;
  if (f.id === 'askForm') {
    e.preventDefault();
    const i = $('#askInput'); const q = i ? i.value : '';
    if (i) i.value = '';
    ask(q);
  } else if (f.id === 'abhaForm') {
    e.preventDefault();
    const d = ($('#abhaInput').value || '').replace(/\D/g, '');
    if (d.length !== 14) return showError(t('abha_bad'));
    linkAbha(d, false);
  }
});

['fileInput', 'camInput'].forEach(id => {
  $('#' + id).addEventListener('change', e => {
    const f = e.target.files && e.target.files[0];
    e.target.value = '';
    handleFile(f);
  });
});

document.addEventListener('dragover', e => {
  e.preventDefault();
  const z = e.target.closest && e.target.closest('#drop');
  const d = $('#drop'); if (d) d.classList.toggle('over', !!z);
});
document.addEventListener('dragleave', e => { if (!e.relatedTarget) { const d = $('#drop'); if (d) d.classList.remove('over'); } });
document.addEventListener('drop', e => {
  e.preventDefault();
  const d = $('#drop'); if (d) d.classList.remove('over');
  if (e.target.closest && e.target.closest('#drop') && e.dataTransfer && e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
});

window.addEventListener('resize', syncDiscHeight);

/* ================= Init ================= */
(async function init() {
  render();
  try {
    S.records = arr(await dbGetAll('records')).map(normalizeRecord);
    S.patient = await dbGet('meta', 'patient');
  } catch (e) { S.records = []; }
  S.ready = true;
  render();
  loadSamples();
})();

/* Source line: focusing or clicking an extracted row shows the line it was read from. */
function showSource(e) {
  const row = e.target && e.target.closest ? e.target.closest('.rowcard[data-src]') : null;
  const box = document.getElementById('srcbox'), text = document.getElementById('srctext');
  if (!row || !box || !text) return;
  document.querySelectorAll('.rowcard.picked').forEach(r => r.classList.remove('picked'));
  row.classList.add('picked');
  box.classList.add('on');
  text.textContent = row.getAttribute('data-src') + (row.getAttribute('data-page') ? '  (p. ' + row.getAttribute('data-page') + ')' : '');
}
document.addEventListener('focusin', showSource);
document.addEventListener('click', showSource);

/* ================= Language selector ================= */
document.addEventListener('change', e => { if (e.target && e.target.id === 'langSel') setLang(e.target.value); });
if (lang !== 'en' && lang !== 'hi') loadLang(lang).then(() => render());

/* ================= Saathi: the floating guide =================
   A helper that stays on every screen. It gives a tip for the current screen and
   answers questions through the same safety-gated /api/ask as the Ask page, sharing
   one conversation with it. It is a guide to the records, not a doctor. */
const PET = { open: false, seen: {}, tipOff: false };
const PET_SVG = '<svg viewBox="0 0 64 64" width="64" height="64" aria-hidden="true" class="pet-svg">' +
  '<ellipse cx="32" cy="59" rx="15" ry="3" fill="#0F172A" opacity=".10"/>' +
  '<path d="M14 40c0-12 8-20 18-20s18 8 18 20v8c0 5-4 9-9 9H23c-5 0-9-4-9-9z" fill="#fff" stroke="#0F766E" stroke-width="2"/>' +
  '<path d="M27 33l5 7 5-7" fill="none" stroke="#0F766E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
  '<circle cx="32" cy="20" r="14" fill="#F3D9C4" stroke="#0F766E" stroke-width="2"/>' +
  '<path d="M18.5 18c1-8 7-12.500 13.500-12.500S44.500 10 45.500 18c-4-3-8-4.500-13.500-4.500S22.500 15 18.500 18z" fill="#0F766E"/>' +
  '<g class="pet-eyes"><circle cx="27" cy="21" r="1.800" fill="#0F172A"/><circle cx="37" cy="21" r="1.800" fill="#0F172A"/></g>' +
  '<path d="M28 26.500c2.500 2 5.500 2 8 0" fill="none" stroke="#0F172A" stroke-width="1.600" stroke-linecap="round"/>' +
  '<path d="M22 34c-3 6-2 13 4 14.500" fill="none" stroke="#334155" stroke-width="1.800" stroke-linecap="round"/>' +
  '<circle cx="28" cy="49" r="3" fill="#fff" stroke="#334155" stroke-width="1.800"/>' +
  '<rect x="38" y="42" width="8" height="8" rx="1.500" fill="#0F766E"/><path d="M42 43.800v4.400M39.800 46h4.400" stroke="#fff" stroke-width="1.400" stroke-linecap="round"/>' +
  '</svg>';
function petScreen() {
  if (S.view === 'add' && S.stage === 'review') return 'review';
  return S.view === 'detail' ? 'timeline' : (S.view === 'visit' ? 'health' : S.view);
}
function petMsgs() {
  const kinds = ['records', 'general', 'doctor', 'emergency', 'signin'];
  const msgs = S.chat.slice(-8).map(m => {
    if (m.role === 'me') return '<div class="pet-msg me">' + esc(m.text) + '</div>';
    const lbl = kinds.indexOf(m.label) >= 0 ? '<span class="lbl lbl-' + m.label + '">' + esc(t('label_' + m.label)) + '</span>' : '';
    return '<div class="pet-msg' + (m.label === 'emergency' ? ' urgent' : '') + '">' + (lbl ? '<div class="pet-lbl">' + lbl + '</div>' : '') + esc(m.label === 'signin' ? t('signin_msg') : m.text) + signinBtns(m) + '</div>';
  }).join('');
  return '<div class="pet-msg">' + esc(t('pet_hello')) + '</div><div class="pet-msg tip">' + esc(t('pet_tip_' + petScreen())) + '</div>' + msgs +
    (S.asking ? '<div class="pet-msg muted">' + esc(t('thinking')) + '</div>' : '');
}
function renderPet() {
  const el = document.getElementById('pet');
  if (!el) return;
  const screen = petScreen();
  // the Ask page is already the full chat, so the floating guide would only cover the input
  if (screen === 'ask') { PET.open = false; el.className = 'pet'; el.innerHTML = ''; return; }
  if (!PET.open) {
    const showTip = !PET.tipOff && !PET.seen[screen] && screen !== 'review';
    el.className = 'pet' + (screen === 'review' ? ' mini' : '');
    // the tip is a nudge, not an overlay: it goes away by itself after a few seconds
    if (showTip) { clearTimeout(PET.timer); PET.timer = setTimeout(() => { PET.seen[screen] = true; renderPet(); }, 7000); }
    el.innerHTML = (showTip ? '<div class="pet-bubble" role="status"><span>' + esc(t('pet_tip_' + screen)) + '</span><button type="button" data-pet="tipoff" aria-label="' + esc(t('pet_close')) + '">&times;</button></div>' : '') +
      '<button type="button" class="pet-btn" data-pet="open" aria-label="' + esc(t('pet_open')) + '">' + PET_SVG + '</button>';
    return;
  }
  const typed = (document.getElementById('petInput') || {}).value || '';
  el.className = 'pet open';
  el.innerHTML = '<section class="pet-panel" role="dialog" aria-label="' + esc(t('pet_name')) + '">' +
    '<header><span class="pet-head">' + PET_SVG + '</span><div><strong>' + esc(t('pet_name')) + '</strong><div class="muted small">' + esc(t('pet_sub')) + '</div></div>' +
    '<button type="button" class="xbtn" data-pet="close" aria-label="' + esc(t('pet_close')) + '">&times;</button></header>' +
    '<div class="pet-body" id="petBody">' + petMsgs() + '</div>' +
    '<div class="pet-chips">' + ['pet_q1', 'pet_q2', 'pet_q3'].map(k => '<button type="button" class="chip" data-pet="q" data-q="' + esc(t(k)) + '">' + esc(t(k)) + '</button>').join('') + '</div>' +
    '<form class="pet-form" id="petForm"><input type="text" id="petInput" placeholder="' + esc(t('ask_ph')) + '" aria-label="' + esc(t('ask_ph')) + '" autocomplete="off"><button type="submit" class="btn small"' + (S.asking ? ' disabled' : '') + '>' + esc(t('ask_send')) + '</button></form>' +
    '<button type="button" class="pet-link" data-pet="goask">' + esc(t('pet_go_ask')) + '</button></section>';
  const input = document.getElementById('petInput');
  if (input && typed) input.value = typed;
  const body = document.getElementById('petBody');
  if (body) body.scrollTop = body.scrollHeight;
}
const renderPage = render;
render = function () { renderPage(); renderPet(); };
document.addEventListener('click', e => {
  const b = e.target && e.target.closest ? e.target.closest('[data-pet]') : null;
  if (!b) return;
  const a = b.getAttribute('data-pet');
  if (a === 'open') { PET.open = true; PET.seen[petScreen()] = true; }
  else if (a === 'close') PET.open = false;
  else if (a === 'tipoff') PET.tipOff = true;
  else if (a === 'q') { ask(b.getAttribute('data-q')); return; }
  else if (a === 'goask') { PET.open = false; go('ask'); return; }
  renderPet();
  if (a === 'open') {
    const panel = document.querySelector('.pet-panel'); if (panel) panel.classList.add('fresh');
    const i = document.getElementById('petInput'); if (i) i.focus();
  }
});
document.addEventListener('submit', e => {
  if (!e.target || e.target.id !== 'petForm') return;
  e.preventDefault();
  const i = document.getElementById('petInput');
  const q = i ? i.value : '';
  if (i) i.value = '';
  ask(q);
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && PET.open) { PET.open = false; renderPet(); } });
renderPet();

/* ================= Account chip =================
   Accounts are a convenience kept in this browser only (see site.js); the app works for
   a guest too, so automated checks and first-time visitors are never blocked by a login. */
function currentUser() {
  try { const u = JSON.parse(localStorage.getItem('sehat_user') || 'null'); return u && u.name ? u : null; } catch (e) { return null; }
}
function renderUser() {
  const el = document.getElementById('userChip');
  if (!el) return;
  const u = currentUser();
  el.textContent = '';
  const who = document.createElement('span');
  who.className = 'who';
  who.textContent = u ? (u.demo ? t('demo_user') : String(u.name).split(' ')[0]) : t('guest');
  const link = document.createElement('a');
  link.href = '/login';
  link.textContent = u ? t('sign_out') : t('sign_in');
  if (u) link.addEventListener('click', () => { try { localStorage.removeItem('sehat_user'); } catch (e) { /* ignore */ } });
  el.appendChild(who); el.appendChild(link);
}
const renderWithPet = render;
render = function () { renderWithPet(); renderUser(); };
renderUser();
/* /app?demo=1 (the landing page's "Try the live demo") loads the demo profile once. */
(async function demoFromLink() {
  if (!/[?&]demo=1\b/.test(location.search)) return;
  for (let i = 0; i < 40 && !S.ready; i++) await new Promise(r => setTimeout(r, 100));
  if (!currentUser()) {
    try { localStorage.setItem('sehat_user', JSON.stringify({ name: 'Rahul Sharma', email: 'demo@sehat.local', demo: true })); } catch (e) { /* ignore */ }
    renderUser();
  }
  if (!S.records.length) await loadDemo();
  try { history.replaceState(null, '', '/app'); } catch (e) { /* ignore */ }
})();

/* ================= Theme =================
   Dark and light share one key with the site pages. The choice is applied before first
   paint by a small script in the page head; this only handles the toggle. */
document.addEventListener('click', e => {
  if (!e.target || !e.target.closest || !e.target.closest('#themeBtn')) return;
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem('sehat_theme', next); } catch (x) { /* ignore */ }
});

/* ================= Enlarge the original =================
   Checking a medicine line against the source must not need scrolling: the original stays
   pinned on the review screen, and one tap opens it full screen, where a tap zooms. */
function closeZoom() { const z = document.getElementById('zoom'); if (z) z.remove(); document.body.classList.remove('zooming'); }
function openZoom() {
  const f = S.pendingFile || S.previewFile;
  if (!f || !f.dataUrl) return;
  closeZoom();
  const z = document.createElement('div');
  z.id = 'zoom'; z.className = 'zoom'; z.setAttribute('role', 'dialog'); z.setAttribute('aria-label', t('original'));
  z.innerHTML = '<div class="zoom-bar"><span>' + esc(t('zoom_hint')) + '</span><button type="button" class="btn small" data-zoom="close">' + esc(t('pet_close')) + '</button></div><div class="zoom-body" data-zoom="toggle">' + previewHTML(f) + '</div>';
  document.body.appendChild(z);
  document.body.classList.add('zooming');
}
document.addEventListener('click', e => {
  const el = e.target && e.target.closest ? e.target.closest('[data-zoom]') : null;
  if (!el) return;
  const a = el.getAttribute('data-zoom');
  if (a === 'open') openZoom();
  else if (a === 'close') closeZoom();
  else if (a === 'toggle') el.classList.toggle('big');
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeZoom(); });

/* load the full language list (43) and the guide's translations for the current language */
loadLangList();
loadSiteMap(lang);
