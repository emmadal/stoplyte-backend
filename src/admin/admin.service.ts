import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import * as ExcelJS from 'exceljs';
import { AccountsService } from 'src/accounts/accounts.service';
import { FirebaseAdminService } from 'src/firebase/firebase-admin.service';

@Injectable()
export class AdminsService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly accountsService: AccountsService,
  ) {}

  handleHeader(header: string, value: any, cell: ExcelJS.Cell, data: any) {
    const handlers = {
      color: () => {
        const fill = cell.fill as ExcelJS.FillPattern;
        const argb = fill?.fgColor?.argb || null;
        data.colorHex = argb ? this.argbToHex(argb) : null;
      },
      'contact number': () => {
        data['phone'] = this.cleanPhone(value);
      },
    };
    if (handlers[header]) {
      handlers[header]();
    } else {
      data[header] = value;
    }
  }

  async processXlsxWithColors(file: Express.Multer.File) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file.buffer);

    const worksheet = workbook.worksheets[0];

    const result = [];

    const headerMap: Record<string, number> = {};
    worksheet.getRow(1).eachCell((cell, colNumber) => {
      const header = cell.value?.toString().toLowerCase();
      if (header) {
        headerMap[header] = colNumber;
      }
    });

    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
      const row = worksheet.getRow(rowNumber);
      const data: any = {};

      Object.entries(headerMap).forEach(([header, colNumber]) => {
        const cell = row.getCell(colNumber);
        const value = cell.value;

        this.handleHeader(header, value, cell, data);
      });

      result.push(data);
    }

    const concurrencyLimit = 5;
    const processingResults = [];

    const queue = [...result];

    const worker = async () => {
      while (queue.length > 0) {
        const userData = queue.shift();
        if (!userData) continue;

        try {
          await this.accountsService.createUserFromAdmin({
            ...userData,
            status: userData.colorHex,
          });
          processingResults.push({ success: true, userData });
        } catch (error) {
          processingResults.push({
            success: false,
            userData,
            error: `Error processing user: ${userData}, ${error}`,
          });
        }
      }
    };

    const workers = Array(concurrencyLimit)
      .fill(null)
      .map(() => worker());

    await Promise.all(workers);

    return {
      success: true,
      total: processingResults.length,
      processed: processingResults.filter((r) => r.success).length,
      failed: processingResults.filter((r) => !r.success).length,
      details: processingResults,
    };
  }

  private argbToHex(argb: string): string {
    return '#' + argb.slice(2);
  }

  private cleanPhone(phone: unknown): string | null {
    if (!phone) return null;

    const phoneStr = phone.toString();

    const firstPart = phoneStr.split(/[\s,;/\\-]+/)[0];
    const cleaned = firstPart.replace(/\D/g, '');

    return cleaned || null;
  }
}
