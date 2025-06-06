import { ConflictException, Injectable } from '@nestjs/common';
import { CategoryEnum } from './enum/category.enum';
import { PrismaService } from '../database/prisma.service';
import { randomUUID } from 'crypto';
import { CreatePartnerDto } from './dto/create-partners.dto';

@Injectable()
export class PartnersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreatePartnerDto) {
    const existing = await this.prisma.partners.findFirst({
      where: {
        OR: [
          {
            name: { equals: data.name },
            email: { equals: data.email },
          },
        ],
      },
    });
    if (existing) {
      throw new ConflictException(
        `Partner with name '${data.name}' or email '${data.email}' already exists`,
      );
    }
    const uid = randomUUID();
    return this.prisma.partners.create({
      data: {
        uid,
        name: data.name,
        phone: data.phone ?? null,
        date_record: data.date_record ?? new Date(),
        location: data.location ?? null,
        category: data.category ?? null,
        address: data.address ?? null,
        email: data.email.toLowerCase() ?? null,
        website: data.website.toLowerCase() ?? null,
        tags: data.tags.toLowerCase() ?? null,
        image: data.image ?? null,
      },
    });
  }

  async findAll(
    filters: {
      search?: string;
      category?: string;
      location?: string;
    } = {},
  ) {
    const { search, category, location } = filters;
    const and: any[] = [];

    if (search) {
      and.push({
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { tags: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    if (category) {
      and.push({ category });
    }

    if (location) {
      and.push({ location });
    }

    const where = and.length ? { AND: and } : {};
    return this.prisma.partners.findMany({ where });
  }

  async findTrusted() {
    return this.prisma.$queryRaw`
      SELECT *
      FROM "partners"
      ORDER BY RANDOM()
      LIMIT 3;
    `;
  }

  async getLocations(): Promise<string[]> {
    const records = await this.prisma.partners.findMany({
      distinct: ['location'],
      select: { location: true },
    });
    return records.map((r) => r.location).filter((l) => !!l);
  }

  async getCategories(): Promise<string[]> {
    return Object.values(CategoryEnum);
  }
}
