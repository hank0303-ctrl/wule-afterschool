var SHEET_ID     = '1PvD71bR2OH9Hg6LWM1Ttl1zTXSA_fq3Kit2dsbDqQz0';
var SHEET_NAME   = '報名表';
var NOTIFY_EMAIL = 'a0986517659@gmail.com';

var HEADERS = [
  '送出時間',
  '孩子姓名', '性別', '出生年月日', '年級', '就讀學校', '曾參加武樂課程',
  '報名項目', '課程時間',
  '家長姓名', '與孩子關係', '手機', 'LINE 名稱',
  '緊急聯絡人', '緊急聯絡關係', '緊急聯絡電話',
  '食物過敏', '食物過敏說明',
  '藥物過敏', '藥物過敏說明',
  '特殊病況', '特殊病況說明',
  '特殊照護需求', '特殊照護說明',
  '需服藥', '服藥說明',
  '健康備註',
  '是否需要接送', '學校或安親班名稱', '特殊接送備註',
  '飲食限制', '其他飲食禁忌',
  '照片授權'
];

function doGet(e) {
  return ContentService
    .createTextOutput('OK - 武樂報名表 GAS 運作正常')
    .setMimeType(ContentService.MimeType.TEXT);
}

function syncHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
  } else {
    var currentHeaders = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];

    for (var i = 0; i < HEADERS.length; i++) {
      currentHeaders = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
      if (currentHeaders[i] === HEADERS[i]) {
        continue;
      }

      var foundAt = -1;
      for (var j = i + 1; j < currentHeaders.length; j++) {
        if (currentHeaders[j] === HEADERS[i]) {
          foundAt = j;
          break;
        }
      }

      if (foundAt === -1) {
        if (i < sheet.getLastColumn()) {
          sheet.insertColumnBefore(i + 1);
        } else {
          sheet.insertColumnAfter(sheet.getLastColumn());
        }
      }

      sheet.getRange(1, i + 1).setValue(HEADERS[i]);
    }
  }

  sheet.getRange(1, 1, 1, HEADERS.length)
    .setFontWeight('bold')
    .setBackground('#1B2A4A')
    .setFontColor('#FFFFFF');
  sheet.setFrozenRows(1);
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

    syncHeaders(sheet);

    var row = [
      data.submitTime         || new Date().toLocaleString('zh-TW'),
      data.childName          || '',
      data.gender             || '',
      data.childDob           || '',
      data.grade              || '',
      data.school             || '',
      data.returning          || '',
      data.programItems       || '',
      data.programDetails     || '',
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
        + '報名項目：' + (data.programItems || '') + '\n'
        + '課程時間：' + (data.programDetails || '') + '\n'
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
