import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import axios from 'axios';
import { SaveSearchDTO, UpdateSearchDTO } from './dto/search.dto';
import { AccountsService } from '../accounts/accounts.service';

@Injectable()
export class BuyersService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private prisma: PrismaService,
  ) {}

  async createSearch(searchDTO: SaveSearchDTO) {
    const tokenInfo = await AccountsService.getUserDetailsFromToken(
      this.request,
      this.prisma,
    );

    if (!tokenInfo) {
      return null;
    }

    if (tokenInfo.subscription !== 'buyer') {
      throw new HttpException(
        'server.invalid_subscription',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.prisma.saved_searches.create({
      data: {
        ...searchDTO,
        buyer: tokenInfo.uid,
      },
    });
  }

  async updateSearch(uid: string, searchDTO: UpdateSearchDTO) {
    const tokenInfo = await AccountsService.getUserFromToken(this.request);

    if (!tokenInfo) {
      return null;
    }

    return this.prisma.saved_searches.updateMany({
      data: {
        ...searchDTO,
      },
      where: {
        uid: uid,
        buyer: tokenInfo.user_id,
      },
    });
  }

  async getPotentialBuyers(filter: any) {
    const tokenInfo = await AccountsService.getUserDetailsFromToken(
      this.request,
      this.prisma,
    );

    if (!tokenInfo) {
      return null;
    }

    if (tokenInfo.subscription !== 'seller') {
      throw new HttpException(
        'server.invalid_subscription',
        HttpStatus.BAD_REQUEST,
      );
    }

    const params = [];

    let query = `select ss.uid, ss."name", ss.needs, ss.desires, ss.markets, ss."hasPreApprovalLetter", ss."workingWithAgent", ss.buyer,  
        ss.search,
      (case 
        when cr."buyerApprovedAt" is not null and cr."sellerApprovedAt" is not null then 'has_contact'
        when cr."buyerApprovedAt" is not null and cr."sellerApprovedAt" is null then 'other_requested'
            when cr."buyerApprovedAt" is null and cr."sellerApprovedAt" is not null then 'current_user_requested'
            else 'no_request'  end) as "requestStatus",
      buyer."displayName" as "buyerName", buyer."email", buyer.phone, buyer."verificationStatus"
      from saved_searches ss 
      inner join accounts buyer on buyer.uid = ss.buyer
      left outer join contact_request cr on cr.buyer = buyer.uid  and cr.seller = '${tokenInfo.uid}'
      where ss."visibleToSellers" = true`;

    if (filter.search) {
      params.push(`%${filter.search}%`);
      query += ` and ss.search->'location'->>'title' ilike $${params.length}`;
    }
    if (filter.property_type) {
      params.push(filter.property_type);
      query += ` and ss.search->>'property_type' = $${params.length}`;
    }

    Object.entries(filter).forEach(([key, value]) => {
      if (typeof value === 'boolean' && value === true) {
        query += ` and ss.search->>'${key}' = '${value}'`;
      }
    });

    function addFilter(field, fieldMin, fieldMax) {
      if (filter[field] && Number(filter[field])) {
        // params.push(Number(filter.mls_listing_price));
        query += ` and 
        ((ss.search->>'${fieldMin}' is not null or ss.search->>'${fieldMax}' is not null) and
        coalesce(ss.search->>'${fieldMin}','0')::numeric <= ${Number(filter[field])} and coalesce(ss.search->>'${fieldMax}','99999999')::numeric >= ${Number(filter[field])})`;
      }
    }

    addFilter(
      'mls_listing_price',
      'mls_listing_price_min',
      'mls_listing_price_max',
    );

    addFilter('beds', 'beds_min', 'beds_max');
    addFilter('baths', 'baths_min', 'baths_max');
    addFilter('building_size', 'building_size_min', 'building_size_max');
    addFilter('lot_size', 'lot_size_min', 'lot_size_max');
    addFilter('year_built', 'year_built_min', 'year_built_max');
    addFilter('stories', 'stories_min', 'stories_max');

    const potentialBuyers: any[] = params.length
      ? await this.prisma.$queryRawUnsafe(query, ...params)
      : await this.prisma.$queryRawUnsafe(query);

    potentialBuyers.forEach((buyer) => {
      if (buyer.requestStatus !== 'has_contact') {
        buyer.buyerName = buyer.buyerName
          .split(' ')
          .map((word) => `${word.substring(0, 1)}`)
          .join(' ');

        delete buyer.email;
        delete buyer.phone;
      }
    });

    return potentialBuyers;
  }

  async getSavedSearches() {
    const tokenInfo = await AccountsService.getUserFromToken(this.request);

    if (!tokenInfo) {
      return null;
    }

    return this.prisma.saved_searches.findMany({
      where: {
        buyer: tokenInfo.user_id,
      },
    });
  }

  async deleteSearch(uid: string) {
    const tokenInfo = await AccountsService.getUserFromToken(this.request);

    if (!tokenInfo) {
      return null;
    }

    return this.prisma.saved_searches.delete({
      where: {
        uid: uid,
        buyer: tokenInfo.user_id,
      },
    });
  }
}
