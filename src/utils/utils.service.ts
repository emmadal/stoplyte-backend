import { Injectable } from '@nestjs/common';
import { subDays, subMinutes } from 'date-fns';
import { PrismaService } from '../database/prisma.service';
import path from 'path';
import fs from 'fs';

@Injectable()
export class UtilsService {
  public static slugify(url) {
    const a =
      'àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìıİłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;';
    const b =
      'aaaaaaaaaacccddeeeeeeeegghiiiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------';
    const p = new RegExp(a.split('').join('|'), 'g');

    return url
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(p, (c) => b.charAt(a.indexOf(c))) // Replace special characters
      .replace(/&/g, '-and-') // Replace & with 'and'
      .replace(/[^\w-]+/g, '') // Remove all non-word characters
      .replace(/--+/g, '-') // Replace multiple - with single -
      .replace(/^-+/, '') // Trim - from start of text
      .replace(/-+$/, ''); // Trim - from end of text
  }

  private static _readModuleFile(
    filePath: string,
    callback: (...e) => void,
  ): any {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const path = require('path');
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const fs = require('fs');
      const absoluteFilePath = path.resolve(filePath);
      return fs.readFile(absoluteFilePath, 'utf8', callback);
    } catch (e) {
      console.log(e);
      callback(e);
    }
  }

  public static readModuleFile(filePath: string): any {
    return new Promise((resolve, reject) => {
      this._readModuleFile(filePath, (err, data) => {
        if (err) {
          reject(err);
        }

        resolve(data);
      });
    });
  }

  static async getCachedData(
    cacheKey: string,
    maxTTLMinutes: number,
    prismaService: PrismaService,
  ) {
    const response = await prismaService.cached_response.findFirst({
      where: {
        key: cacheKey,
        ...(maxTTLMinutes
          ? {
              last_cached_datetime: {
                gt: subMinutes(new Date(), maxTTLMinutes),
              },
            }
          : {}),
      },
    });

    return response?.cached_data as any;
  }

  static saveCachedData(
    cacheKey: string,
    cachedData: object,
    prismaService: PrismaService,
  ) {
    return prismaService.cached_response.upsert({
      create: {
        key: cacheKey,
        last_cached_datetime: new Date(),
        cached_data: cachedData,
      },
      update: {
        key: cacheKey,
        last_cached_datetime: new Date(),
        cached_data: cachedData,
      },
      where: {
        key: cacheKey,
      },
    });
  }

  static async getCachedDataDays(
    cacheKey: string,
    maxTTLDays: number,
    prismaService: PrismaService,
  ) {
    return this.getCachedData(cacheKey, maxTTLDays * 24 * 60, prismaService);
  }

  static parseToQuery(query: any) {
    return Object.entries(query)
      .filter(([key, value]) => value !== undefined)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
  }
}
