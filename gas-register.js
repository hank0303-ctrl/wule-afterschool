var SHEET_ID     = '1PvD71bR2OH9Hg6LWM1Ttl1zTXSA_fq3Kit2dsbDqQz0';
var SHEET_NAME   = '報名表';
var NOTIFY_EMAIL = 'a0986517659@gmail.com';

var HEADERS = [
  '送出時間',
  '孩子姓名', '性別', '出生年月日', '年級', '就讀學校', '曾參加武樂課程',
  '家長姓名', '與孩子關係', '手機', 'LINE 名稱',
  '緊急聯絡人', '緊急聯絡關係', '緊急聯絡電話',
  '食物過敏', '食物過敏說明',
  '藥物過敏', '藥物過敏說明',
  '特殊病況', '特殊病況說明',
  '特殊照護需求', '特殊照護說明',
  '需服藥', '服藥說明',
  '健康備註',
  '接送方式', '可接回人員', '接送備註',
  '飲食限制', '其他飲食禁忌',
  '孩子身分證', '孩子生日（保險）', '戶籍地址', '法定代理人', '代理人身分證',
  '照片授權'
];

function doGet(e) {
  return ContentService
    .createTextOutput('OK - 武樂報名表 GAS 運作正常')
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {
    var raw  = e.postData ? e.postData.contents : '';
    var data = {};
    try {
      data = JSON.parse(raw);
    } catch (parseErr) {
      data = { parseError: raw };
    }

    var ss    = SpreadsheetApp.openById(SHEET_ID);
    var sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
    }

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length)
        .setFontWeight('bold')
        .setBackground('#1B2A4A')
        .setFontColor('#FFFFFF');
      sheet.setFrozenRows(1);
    }

    var row = [
      data.submitTime         || new Date().toLocaleString('zh-TW'),
      data.childName          || '',
      data.gender             || '',
      data.childDob           || '',
      data.grade              || '',
      data.school             || '',
      data.returning          || '',
      data.parentName         || '',
      data.relation           || '',
      data.phone              || '',
      data.lineName           || '',
      data.emergencyName      || '',
      data.emergencyRelation  || '',
      data.emergencyPhone     || '',
      data.foodAllergy        || '',
      data.foodAllergyDetail  || '',
      data.drugAllergy        || '',
      data.drugAllergyDetail  || '',
      data.medCond            || '',
      data.medCondDetail      || '',
      data.specialNeeds       || '',
      data.specialNeedsDetail || '',
      data.medication         || '',
      data.medicationDetail   || '',
      data.healthNote         || '',
      data.pickup             || '',
      data.pickupPerson       || '',
      data.pickupNote         || '',
      data.diet               || '',
      data.dietNote           || '',
      data.insChildId         || '',
      data.insChildDob        || '',
      data.insAddress         || '',
      data.guardianName       || '',
      data.guardianId         || '',
      data.photoConsent       || ''
    ];

    sheet.appendRow(row);

    try {
      GmailApp.sendEmail(
        NOTIFY_EMAIL,
        '【武樂】新報名 - ' + (data.childName || '') + '（' + (data.grade || '') + '）',
        '收到一筆新的放學後課程報名表。\n\n'
        + '孩子姓名：' + (data.childName || '') + '\n'
        + '年級：'     + (data.grade || '') + '\n'
        + '家長姓名：' + (data.parentName || '') + '\n'
        + '手機：'     + (data.phone || '') + '\n'
        + '送出時間：' + (data.submitTime || '') + '\n\n'
        + '查看試算表：\nhttps://docs.google.com/spreadsheets/d/' + SHEET_ID
      );
    } catch (mailErr) {}

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
