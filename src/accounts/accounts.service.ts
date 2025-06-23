import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  CreateAccountDTO,
  ListPropertyDTO,
  LoginAccountDTO,
  UpdateAccountDTO,
} from './dto/accounts.dto';
import { REQUEST } from '@nestjs/core';
import { Request, Response } from 'express';

// Define the interface for JWT user
interface JwtUser {
  sub: string;
  roles: string[];
}

// Extend the Express Request type to include our JWT user
interface RequestWithUser extends Request {
  user: JwtUser;
}

import axios from 'axios';
import { UtilsService } from 'src/utils/utils.service';

@Injectable()
export class AccountsService {
  constructor(
    @Inject(REQUEST) private readonly request: RequestWithUser,
    private prisma: PrismaService,
    private utilsService: UtilsService,
  ) {}

  public static getUserFromToken(request): { user_id: string } | null {
    const jwtToken: string = request.header('Authorization');

    if (!jwtToken) {
      return null;
    }

    try {
      return JSON.parse(
        Buffer.from(jwtToken.split('.')[1], 'base64').toString(),
      );
    } catch (e) {
      return null;
    }
  }

  public static getUserDetailsFromToken(request, prisma: PrismaService) {
    const tokenInfo = AccountsService.getUserFromToken(request);

    if (!tokenInfo?.user_id) {
      return null;
    }

    return prisma.accounts.findFirst({
      where: {
        uid: tokenInfo.user_id,
      },
    });
  }

  async createWithPassword(createAccountDTO: CreateAccountDTO) {
    const existingUser = await this.prisma.accounts.findFirst({
      where: {
        email: createAccountDTO.email,
      },
    });
    if (existingUser) {
      throw new HttpException('User already exists', HttpStatus.CONFLICT);
    }
    if (
      !createAccountDTO.password.trim() ||
      createAccountDTO.password.trim() === ''
    ) {
      throw new HttpException('Password is required', HttpStatus.BAD_REQUEST);
    }
    createAccountDTO.password = await UtilsService.hashPassword(
      createAccountDTO.password,
    );
    const user = await this.prisma.accounts.create({
      data: createAccountDTO,
    });
    const token = await this.utilsService.generateJWTToken(user.uid);
    return { user, token };
  }

  async createAccountWithGoogle(createAccountDTO: CreateAccountDTO) {
    const existingUser = await this.prisma.accounts.findFirst({
      where: {
        email: createAccountDTO.email,
      },
    });
    if (existingUser) {
      const token = await this.utilsService.generateJWTToken(existingUser.uid);
      return { existingUser, token };
    } else {
      const user = await this.prisma.accounts.create({
        data: createAccountDTO,
      });
      const token = await this.utilsService.generateJWTToken(user.uid);
      return { user, token };
    }
  }

  async refreshAccessToken(accountId: string) {
    const user = await this.prisma.accounts.findUnique({
      where: {
        uid: accountId,
        AND: {
          isActive: true,
        },
      },
    });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const token = await this.utilsService.generateJWTToken(user.uid);
    return token;
  }

  async login(loginEventDto: LoginAccountDTO) {
    const user = await this.prisma.accounts.findFirst({
      where: {
        email: loginEventDto.email,
        AND: {
          isActive: true,
        },
      },
    });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const isPasswordValid = await UtilsService.comparePassword(
      loginEventDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new HttpException(
        'Email or password is incorrect',
        HttpStatus.BAD_REQUEST,
      );
    }
    const token = await this.utilsService.generateJWTToken(user.uid);
    return { user, token };
  }

  updateAccount(updateAccountDTO: UpdateAccountDTO) {
    const tokenInfo = AccountsService.getUserFromToken(this.request);

    if (!tokenInfo) {
      return null;
    }

    return this.prisma.accounts.update({
      data: {
        ...updateAccountDTO,
      },
      where: {
        uid: tokenInfo.user_id,
      },
    });
  }

  async getMe() {
    // Get the user ID from the JWT token that was validated by the JwtAuthGuard
    const user = this.request.user;

    if (!user || !user.sub) {
      throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
    }

    // Find the user in the database using the userId from the JWT payload
    const account = await this.prisma.accounts.findUnique({
      where: {
        uid: user.sub,
      },
      include: {
        claimed_property: {
          select: {
            realstateId: true,
            slug: true,
          },
        },
      },
    });

    if (!account) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // Return sanitized user data (removes sensitive information)
    return this.sanitizeAccountData(account);
  }

  updateSubscription(subscription: 'buyer' | 'seller') {
    const tokenInfo = AccountsService.getUserFromToken(this.request);

    if (!tokenInfo) {
      return null;
    }

    return this.prisma.accounts.update({
      data: {
        subscription: subscription,
      },
      where: {
        uid: tokenInfo.user_id,
      },
    });
  }

  async isPropertyOwner(propertyId: string) {
    const tokenInfo = AccountsService.getUserFromToken(this.request);

    if (!tokenInfo) {
      return false;
    }

    const propertyExists = await this.prisma.claimed_property.count({
      where: {
        realstateId: propertyId,
        owner: tokenInfo.user_id,
      },
    });

    return propertyExists > 0;
  }

  async claimProperty(
    propertyId: string,
    listed: boolean,
    status: string,
    askingPrice: number,
  ) {
    const tokenInfo = AccountsService.getUserFromToken(this.request);

    if (!tokenInfo) {
      return null;
    }

    const propertyExists = await this.prisma.claimed_property.count({
      where: {
        realstateId: propertyId,
      },
    });

    const userInfo = await this.prisma.accounts.findFirst({
      where: {
        uid: tokenInfo.user_id,
      },
    });

    if (userInfo.subscription !== 'seller') {
      throw new HttpException(
        'server.only_sellers_can_claim_properties',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (propertyExists > 0) {
      throw new HttpException(
        'server.property_already_claimed',
        HttpStatus.BAD_REQUEST,
      );
    }

    const propertyOwner = await this.prisma.claimed_property.count({
      where: {
        owner: tokenInfo.user_id,
      },
    });

    if (propertyOwner > 0) {
      throw new HttpException(
        'server.already_own_a_property',
        HttpStatus.BAD_REQUEST,
      );
    }

    const response = await axios.post(
      'https://api.realestateapi.com/v2/PropertyDetail',
      { id: propertyId },
      {
        headers: {
          accept: '*/*',
          'content-type': 'application/json',
          'x-api-key': process.env.REALSTATE_API_KEY, // Ensure you replace YOUR_API_KEY_HERE with your actual API key
        },
      },
    );

    const slug = response.data.data.propertyInfo.address.label.replace(
      / /g,
      '-',
    );

    await this.prisma.claimed_property.create({
      data: {
        realstateId: propertyId,
        owner: tokenInfo.user_id,
        slug: slug,
        listed,
        status,
        askingPrice,
      },
    });
  }

  async claimPropertyForUser(
    propertyId: string,
    userId: string,
    listed: boolean,
    status: string,
    askingPrice: number,
  ) {
    const tokenInfo = AccountsService.getUserFromToken(this.request);

    if (!tokenInfo) {
      return null;
    }

    const propertyExists = await this.prisma.claimed_property.count({
      where: {
        realstateId: propertyId,
      },
    });

    const userInfo = await this.prisma.accounts.findFirst({
      where: {
        uid: userId,
      },
    });

    if (userInfo.subscription !== 'seller') {
      throw new HttpException(
        'server.only_sellers_can_claim_properties',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (propertyExists > 0) {
      throw new HttpException(
        'server.property_already_claimed',
        HttpStatus.BAD_REQUEST,
      );
    }

    const propertyOwner = await this.prisma.claimed_property.count({
      where: {
        owner: userId,
      },
    });

    if (propertyOwner > 0) {
      throw new HttpException(
        'server.already_own_a_property',
        HttpStatus.BAD_REQUEST,
      );
    }

    const response = await axios.post(
      'https://api.realestateapi.com/v2/PropertyDetail',
      { id: propertyId },
      {
        headers: {
          accept: '*/*',
          'content-type': 'application/json',
          'x-api-key': process.env.REALSTATE_API_KEY, // Ensure you replace YOUR_API_KEY_HERE with your actual API key
        },
      },
    );

    const slug = response.data.data.propertyInfo.address.label.replace(
      / /g,
      '-',
    );

    await this.prisma.claimed_property.create({
      data: {
        realstateId: propertyId,
        owner: userId,
        slug: slug,
        listed,
        status,
        askingPrice,
      },
    });
  }

  async unclaimProperty(propertyId: string) {
    const tokenInfo = AccountsService.getUserFromToken(this.request);

    if (!tokenInfo) {
      return null;
    }

    if (!(await this.isPropertyOwner(propertyId))) {
      throw new HttpException(
        'server.you_are_not_the_property_owner',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.prisma.claimed_property.delete({
      where: {
        realstateId: propertyId,
        owner: tokenInfo.user_id,
      },
    });
  }

  async listProperty(propertyId: string, listPropertyPayload: ListPropertyDTO) {
    const tokenInfo = AccountsService.getUserFromToken(this.request);

    if (!tokenInfo) {
      return null;
    }

    if (!(await this.isPropertyOwner(propertyId))) {
      throw new HttpException(
        'server.you_are_not_the_property_owner',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.prisma.claimed_property.update({
      data: {
        ...listPropertyPayload,
        listed: true,
      },
      where: {
        realstateId: propertyId,
      },
    });
  }

  async unlistProperty(propertyId: string) {
    const tokenInfo = AccountsService.getUserFromToken(this.request);

    if (!tokenInfo) {
      return null;
    }

    if (!(await this.isPropertyOwner(propertyId))) {
      throw new HttpException(
        'server.you_are_not_the_property_owner',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.prisma.claimed_property.update({
      data: {
        listed: false,
      },
      where: {
        realstateId: propertyId,
      },
    });
  }

  async requestContact(contactUid: string) {
    const tokenInfo = AccountsService.getUserFromToken(this.request);

    if (!tokenInfo.user_id) {
      return null;
    }

    const currentUser = await this.prisma.accounts.findFirst({
      include: {
        claimed_property: {
          select: {
            realstateId: true,
          },
        },
      },
      where: {
        uid: tokenInfo.user_id,
      },
    });

    const contactDetails = await this.prisma.accounts.findFirst({
      include: {
        claimed_property: {
          select: {
            realstateId: true,
          },
        },
      },
      where: {
        uid: contactUid,
      },
    });

    if (currentUser.subscription === contactDetails.subscription) {
      throw new HttpException(
        'server.invalid_subscription',
        HttpStatus.BAD_REQUEST,
      );
    }

    const seller =
      currentUser.subscription === 'seller' ? currentUser : contactDetails;
    const buyer =
      currentUser.subscription === 'buyer' ? currentUser : contactDetails;

    if (!seller.claimed_property.length) {
      throw new HttpException(
        'server.seller_must_have_at_least_one_property',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.prisma.contact_request.upsert({
      create: {
        seller: seller.uid,
        buyer: buyer.uid,
        initiator: tokenInfo.user_id,
        propertyId: seller.claimed_property[0].realstateId,
        buyerApprovedAt:
          currentUser.subscription === 'buyer' ? new Date() : undefined,
        sellerApprovedAt:
          currentUser.subscription === 'seller' ? new Date() : undefined,
      },
      update: {
        buyerApprovedAt:
          currentUser.subscription === 'buyer' ? new Date() : undefined,
        sellerApprovedAt:
          currentUser.subscription === 'seller' ? new Date() : undefined,
      },
      where: {
        seller_buyer: {
          seller: seller.uid,
          buyer: buyer.uid,
        },
      },
    });
  }

  async declineContact(contactUid: string) {
    const tokenInfo = AccountsService.getUserFromToken(this.request);

    if (!tokenInfo.user_id) {
      return null;
    }

    const currentUser = await this.prisma.accounts.findFirst({
      where: {
        uid: tokenInfo.user_id,
      },
    });

    const seller =
      currentUser.subscription === 'seller' ? currentUser.uid : contactUid;
    const buyer =
      currentUser.subscription === 'buyer' ? currentUser.uid : contactUid;

    await this.prisma.contact_request.delete({
      where: {
        seller_buyer: {
          seller: seller,
          buyer: buyer,
        },
      },
    });
  }

  verifyCurrentUser() {
    const tokenInfo = AccountsService.getUserFromToken(this.request);

    if (!tokenInfo.user_id) {
      return null;
    }

    return this.prisma.accounts.updateMany({
      data: {
        verificationStatus: 'pending',
      },
      where: {
        uid: tokenInfo.user_id,
        verificationStatus: {
          not: 'done',
        },
      },
    });
  }

  async getMyContactRequests() {
    const tokenInfo = await AccountsService.getUserDetailsFromToken(
      this.request,
      this.prisma,
    );

    if (!tokenInfo.uid) {
      return null;
    }

    const where: { buyer?: string; seller?: string } = {};

    where[tokenInfo.subscription] = tokenInfo.uid;

    const requests = await this.prisma.contact_request.findMany({
      include: {
        accounts_contact_request_buyerToaccounts: {
          select: {
            uid: true,
            email: true,
            displayName: true,
          },
        },
        accounts_contact_request_sellerToaccounts: {
          select: {
            uid: true,
            email: true,
            displayName: true,
            claimed_property: {
              select: {
                realstateId: true,
                slug: true,
              },
            },
          },
        },
      },
      where,
    });

    requests.forEach((cr: any) => {
      let requestContactStatus;
      if (cr.buyerApprovedAt !== null && cr.sellerApprovedAt !== null) {
        requestContactStatus = 'has_contact';
      } else if (cr.buyerApprovedAt !== null && cr.sellerApprovedAt === null) {
        requestContactStatus =
          cr.buyer === tokenInfo.uid
            ? 'current_user_requested'
            : 'other_requested';
      } else if (cr.buyerApprovedAt === null && cr.sellerApprovedAt !== null) {
        requestContactStatus =
          cr.seller === tokenInfo.uid
            ? 'current_user_requested'
            : 'other_requested';
      }
      cr.requestContactStatus = requestContactStatus;

      const clearData = requestContactStatus !== 'has_contact';

      if (clearData) {
        delete cr.accounts_contact_request_buyerToaccounts.email;
        delete cr.accounts_contact_request_sellerToaccounts.email;

        cr.accounts_contact_request_buyerToaccounts.displayName =
          cr.accounts_contact_request_buyerToaccounts.displayName
            .split(' ')
            .map((word) => `${word.substring(0, 1)}`)
            .join(' ');

        cr.accounts_contact_request_sellerToaccounts.displayName =
          cr.accounts_contact_request_sellerToaccounts.displayName
            .split(' ')
            .map((word) => `${word.substring(0, 1)}`)
            .join(' ');
      }

      cr.contact =
        tokenInfo.subscription === 'buyer'
          ? cr.accounts_contact_request_sellerToaccounts
          : cr.accounts_contact_request_buyerToaccounts;

      cr.property =
        cr.accounts_contact_request_sellerToaccounts.claimed_property[0];
    });

    return requests;
  }

  getRequestForUnlistedProperties() {
    const tokenInfo = AccountsService.getUserFromToken(this.request);

    if (!tokenInfo?.user_id) {
      return null;
    }

    return this.prisma.contact_unlisted_request.findMany({
      where: {
        buyer: tokenInfo.user_id,
      },
    });
  }

  async createUserFromAdmin(user: {
    phone: string;
    address: string;
    status: string;
  }) {
    const email = `barret+${user.phone}@stoplyte.com`;
    const userInfo = await this.prisma.accounts.findFirst({
      where: {
        email: email,
      },
    });
    if (!userInfo) {
      await this.prisma.accounts.create({
        data: {
          email: email,
          displayName: email,
          subscription: 'seller',
          systemRole: 'user',
        },
      });
    }

    const response = await axios.post(
      'https://api.realestateapi.com/v2/PropertySearch',
      { address: user.address },
      {
        headers: {
          accept: '/',
          'content-type': 'application/json',
          'x-api-key': process.env.REALSTATE_API_KEY,
        },
      },
    );
    const data = response.data.data;
    const statusMap: Record<string, string> = {
      '#00FF00': 'onMarket',
      '#FFFF00': 'offMarket',
      '#FF0000': 'notSelling',
    };

    const mappedStatus = statusMap[user.status.toUpperCase()];

    if (!mappedStatus) {
      throw new Error(`Invalid status color received: ${user.status}`);
    }

    await this.claimPropertyForUser(
      data[0].propertyId,
      userInfo.uid,
      false,
      mappedStatus,
      0,
    );
  }

  public static CACHED_USERS: any = {};

  public static async getUserRole(uid: string, prisma: PrismaService) {
    if (!AccountsService.CACHED_USERS[uid]) {
      const userRole = await prisma.accounts.findFirst({
        select: {
          systemRole: true,
        },
        where: {
          uid,
        },
      });

      AccountsService.CACHED_USERS[uid] = userRole.systemRole;
    }

    return AccountsService.CACHED_USERS[uid];
  }

  public sanitizeAccountData(
    account: Record<string, any>,
  ): Record<string, any> {
    const sensitiveFields = ['password', 'deletedAt', 'isActive', 'createdAt'];

    return Object.entries(account).reduce(
      (sanitized, [key, value]) => {
        if (!sensitiveFields.includes(key)) {
          sanitized[key] = value;
        }
        return sanitized;
      },
      {} as Record<string, any>,
    );
  }

  setCookie(token: string, res: Response) {
    const cookieDuration = 24 * 60 * 60 * 1000;
    const expirationDate = new Date(Date.now() + cookieDuration);
    const isDev = process.env.NODE_ENV === 'development';

    res.cookie('next-auth.session-token', token, {
      httpOnly: true,
      // When using the sameSite: 'none', secure must be true (even in development)
      // For local development with http://localhost, use 'lax' instead
      secure: isDev ? false : true,
      sameSite: isDev ? 'lax' : 'none',
      maxAge: cookieDuration,
      expires: expirationDate,
      path: '/',
      signed: process.env.COOKIE_SECRET ? true : false,
      domain: process.env.COOKIE_DOMAIN || 'localhost',
    });
  }

  removeCookie(res: Response) {
    const isDev = process.env.NODE_ENV === 'development';
    res.clearCookie('stk', {
      httpOnly: true,
      secure: isDev ? false : true,
      sameSite: isDev ? 'lax' : 'none',
      path: '/',
      domain: process.env.COOKIE_DOMAIN || 'localhost',
    });
  }
}
