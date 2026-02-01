import { google } from "googleapis";

export interface SpreadsheetInfo {
  id: string;
  name: string;
}

export interface ContactData {
  name: string;
  email: string;
  phone: string;
  website: string;
  rawText: string;
}

function createSheetsClient(accessToken: string) {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });
  return google.sheets({ version: "v4", auth: oauth2Client });
}

function createDriveClient(accessToken: string) {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });
  return google.drive({ version: "v3", auth: oauth2Client });
}

export async function listUserSpreadsheets(
  accessToken: string
): Promise<SpreadsheetInfo[]> {
  const drive = createDriveClient(accessToken);

  const response = await drive.files.list({
    q: "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false",
    fields: "files(id, name)",
    orderBy: "modifiedTime desc",
    pageSize: 50,
  });

  return (
    response.data.files?.map((file) => ({
      id: file.id!,
      name: file.name!,
    })) || []
  );
}

export async function createSpreadsheet(
  accessToken: string,
  title: string
): Promise<SpreadsheetInfo> {
  const sheets = createSheetsClient(accessToken);

  const response = await sheets.spreadsheets.create({
    requestBody: {
      properties: { title },
      sheets: [
        {
          properties: { title: "Contacts" },
          data: [
            {
              rowData: [
                {
                  values: [
                    { userEnteredValue: { stringValue: "Name" } },
                    { userEnteredValue: { stringValue: "Phone" } },
                    { userEnteredValue: { stringValue: "Email" } },
                    { userEnteredValue: { stringValue: "Website" } },
                    { userEnteredValue: { stringValue: "Raw Text" } },
                    { userEnteredValue: { stringValue: "Scanned At" } },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  });

  return {
    id: response.data.spreadsheetId!,
    name: title,
  };
}

export async function appendToSpreadsheet(
  accessToken: string,
  spreadsheetId: string,
  data: ContactData
): Promise<void> {
  const sheets = createSheetsClient(accessToken);

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "Contacts!A:F",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [
        [
          data.name,
          data.phone,
          data.email,
          data.website,
          data.rawText,
          new Date().toISOString(),
        ],
      ],
    },
  });
}
