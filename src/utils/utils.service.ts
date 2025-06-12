import { Injectable } from '@nestjs/common';
import { subMinutes } from 'date-fns';
import { PrismaService } from '../database/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import path from 'path';
import fs from 'fs';

@Injectable()
export class UtilsService {
  constructor(private jwtService: JwtService) {}

  public static slugify(url: string) {
    const a =
      'àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìıİłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;';
    const b =
      'aaaaaaaaaacccddeeeeeeeegghiiiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------';
    const p = new RegExp(a.split('').join('|'), 'g');

    return url
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with
      .replace(p, (c) => b.charAt(a.indexOf(c))) // Replace special characters
      .replace(/&/g, '-and-') // Replace & with 'and'
      .replace(/[^\w-]+/g, '') // Remove all non-word characters
      .replace(/--+/g, '-') // Replace multiple - with single
      .replace(/^-+/, '') // Trim - from the start of a text
      .replace(/-+$/, ''); // Trim - from the end of a text
  }

  private static _readModuleFile(
    filePath: string,
    callback: (...args: any) => void,
  ): any {
    try {
      const absoluteFilePath = path.resolve(filePath);
      return fs.readFile(absoluteFilePath, 'utf8', callback);
    } catch (e) {
      console.log(e);
      callback(e);
    }
  }

  public static readModuleFile(filePath: string): any {
    return new Promise((resolve, reject) => {
      this._readModuleFile(filePath, (err: any, data: any) => {
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
    return (
      Object.entries(query)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .filter(([key, value]) => value !== undefined)
        .map(([key, value]) => `${key}=${value}`)
        .join('&')
    );
  }

  public static async hashPassword(password: string) {
    const saltOrRounds = 10;
    return await bcrypt.hash(password, saltOrRounds);
  }

  public static async comparePassword(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
  }

  /**
   * Generates a JWT token with enhanced user information
   * @param accountId User's unique identifier
   * @param roles User's roles (optional)
   * @param additionalData Any additional data to include in token (optional)
   * @returns JWT token string
   */
  public async generateJWTToken(
    accountId: string,
    roles: string[] = ['user'],
    additionalData: Record<string, any> = {},
  ) {
    // Create a payload with user ID, roles, and any additional data
    const payload = {
      sub: accountId, // subject (user ID)
      roles, // user roles for authorization
      ...additionalData, // any additional data needed
      iat: Date.now(), // issued at timestamp
    };

    return await this.jwtService.signAsync(payload);
  }
}
