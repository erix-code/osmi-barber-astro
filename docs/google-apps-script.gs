const SHEET_NAME = "reservas";
const API_KEY = "tu-clave-compartida-opcional";

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || "{}");

    if (API_KEY && body.apiKey !== API_KEY) {
      return jsonResponse({ ok: false, error: "Unauthorized", statusCode: 401 });
    }

    const required = ["name", "phone", "service", "date", "time"];
    for (const field of required) {
      if (!body[field]) {
        return jsonResponse({ ok: false, error: `Missing field: ${field}`, statusCode: 400 });
      }
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    ensureHeader(sheet);

    sheet.appendRow([
      body.timestamp || new Date().toISOString(),
      body.name || "",
      body.phone || "",
      body.service || "",
      body.date || "",
      body.time || "",
      body.notes || "",
      body.status || "new"
    ]);

    return jsonResponse({ ok: true, statusCode: 200 });
  } catch (error) {
    return jsonResponse(
      {
        ok: false,
        error: error && error.message ? error.message : "Unexpected error",
        statusCode: 500
      }
    );
  }
}

function ensureHeader(sheet) {
  const firstRow = sheet.getRange(1, 1, 1, 8).getValues()[0];
  if (firstRow.some((value) => value !== "")) return;
  sheet
    .getRange(1, 1, 1, 8)
    .setValues([["timestamp", "name", "phone", "service", "date", "time", "notes", "status"]]);
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
