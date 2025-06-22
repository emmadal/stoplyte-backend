import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import axios from 'axios';
import { AccountsService } from '../accounts/accounts.service';
import { UtilsService } from '../utils/utils.service';
import * as mustache from 'mustache';
import { sendEmails } from '../notifications/email/email.creator';

@Injectable()
export class PropertiesService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private prisma: PrismaService,
    private accountService: AccountsService,
  ) {}

  async autocompleteProperties(searchTerm: string, searchType: string) {
    if (!searchTerm || searchTerm.length < 3) {
      return { result: { data: [], formattedData: [] } };
    }

    const response = await axios.post(
      'https://api.realestateapi.com/v2/AutoComplete',
      {
        search: searchTerm,
        search_types: searchType ? [searchType] : ['C', 'N', 'A', 'G', 'Z'],
      },
      {
        headers: {
          accept: '*/*',
          'content-type': 'application/json',
          'x-api-key': process.env.REALSTATE_API_KEY,
        },
      },
    );
    const data = response.data.data;
    const formattedData = data.map((item) => {
      return `${item.title}`;
    });

    return { result: { data, formattedData } };
  }

  async searchProperties(search: any, filter: any, pagination: any) {
    const currentParams = search || {};

    const params = currentParams.id ? { id: currentParams.id } : currentParams;

    if (params.neighborhoodId) {
      params.neighborhood_id = params.neighborhoodId;

      delete params.neighborhoodId;
      delete params.neighborhoodName;
      delete params.neighborhoodType;
    }

    const size = pagination.pageSize;
    const resultIndex = pagination.page - 1 < 0 ? 0 : pagination.page - 1;

    const { mls_status } = filter || {};

    delete filter.mls_status;
    if (mls_status && mls_status === 'onMarket') {
      filter.mls_active = true;
    } else if (mls_status && mls_status === 'unlisted') {
      filter.mls_active = false;
    } else if (mls_status && mls_status === 'offMarket') {
      const allProperties = await this.prisma.claimed_property.findMany({
        select: {
          realstateId: true,
        },
        where: {
          listed: true,
        },
      });
      filter.ids = allProperties.map((ppt) => ppt.realstateId);
    } else if (mls_status && mls_status === 'notSelling') {
      const allProperties = await this.prisma.claimed_property.findMany({
        select: {
          realstateId: true,
        },
        where: {
          listed: false,
        },
      });
      filter.ids = allProperties.map((ppt) => ppt.realstateId);
    }
    // go through filter and anything that is false or is equal to 0, delete it
    for (const key in filter) {
      if (filter[key] === false || filter[key] === 0) {
        delete filter[key];
      }
    }

    try {
      const response = await axios.post(
        'https://api.realestateapi.com/v2/PropertySearch',
        { ...params, ...filter, ...{ size, resultIndex } },
        {
          headers: {
            accept: '*/*',
            'content-type': 'application/json',
            'x-api-key': process.env.REALSTATE_API_KEY, // Ensure you replace YOUR_API_KEY_HERE with your actual API key
          },
        },
      );
      const data = response.data.data;

      const allProperties = await this.prisma.claimed_property.findMany({
        where: {
          realstateId: {
            in: data.map((property) => String(property.id)),
          },
        },
      });

      data.forEach((property) => {
        property.image = `https://maps.googleapis.com/maps/api/streetview?size=250x170&location=${property.latitude},${property.longitude}&key=${process.env.GOOGLE_API_KEY}`;

        property.stoplyte = allProperties.find(
          (pt) => pt.realstateId === property.id,
        );
      });
      // req.body should contain some properties
      return { result: data, total: response.data.resultCount };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async searchPropertyBySlug(slug: string) {
    const response = await axios.post(
      'https://api.realestateapi.com/v2/PropertyDetail',
      { address: slug.replace(/-/g, ' ') },
      {
        headers: {
          accept: '*/*',
          'content-type': 'application/json',
          'x-api-key': process.env.REALSTATE_API_KEY, // Ensure you replace YOUR_API_KEY_HERE with your actual API key
        },
      },
    );

    const data = response.data.data;
    if (!data) {
      return undefined;
    }

    const { data: avmData } = await axios.post(
      'https://api.realestateapi.com/v2/PropertyAvm',
      { id: data.id },
      {
        headers: {
          accept: '*/*',
          'content-type': 'application/json',
          'x-api-key': process.env.REALSTATE_API_KEY, // Ensure you replace YOUR_API_KEY_HERE with your actual API key
        },
      },
    );

    const currentProperty = await this.prisma.claimed_property.findFirst({
      where: {
        realstateId: String(data.id),
      },
    });

    data.stoplyte = currentProperty;
    data.avm = avmData?.data;
    data.requestContactStatus = (
      await this.getRequestStatus(String(data.id))
    ).requestContactStatus;

    data.image = `https://maps.googleapis.com/maps/api/streetview?size=640x640&location=${data.propertyInfo.latitude},${data.propertyInfo.longitude}&key=${process.env.GOOGLE_API_KEY}`;

    return data;
  }

  async getRequestStatus(id: string) {
    let requestContactStatus = undefined;
    const tokenInfo = await AccountsService.getUserDetailsFromToken(
      this.request,
      this.prisma,
    );
    if (tokenInfo?.uid && tokenInfo.subscription === 'buyer') {
      requestContactStatus = 'no_request';
      const cr = await this.prisma.contact_request.findFirst({
        where: {
          propertyId: id,
          buyer: tokenInfo.uid,
        },
      });

      if (cr) {
        if (cr.buyerApprovedAt !== null && cr.sellerApprovedAt !== null) {
          requestContactStatus = 'has_contact';
        } else if (
          cr.buyerApprovedAt !== null &&
          cr.sellerApprovedAt === null
        ) {
          requestContactStatus = 'current_user_requested';
        } else if (
          cr.buyerApprovedAt === null &&
          cr.sellerApprovedAt !== null
        ) {
          requestContactStatus = 'other_requested';
        }
      }
    }

    return { requestContactStatus };
  }

  async requestDetails(
    propertyId: string,
    email: string,
    message: string,
    phone: string,
  ) {
    const currentUser = await this.accountService.getMe();

    const exists = await this.prisma.contact_unlisted_request.count({
      where: {
        buyer: currentUser?.uid,
        propertyId: propertyId,
      },
    });

    if (exists > 0) {
      return {
        message: 'server.contact_already_requested',
      };
    }

    const { data } = await axios.post(
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

    const propertySlug = data.data.propertyInfo.address.label.replace(
      / /g,
      '-',
    );

    const emailDetails = `The user ${currentUser.displayName} has requested information on the property: ${process.env.FRONTEND_BASE_URL}/properties/${propertySlug}

    Email: ${email}
    Phone: ${phone}
    Message (optional):${message}

    Property Info:
    - Owner Info:
${Object.entries(data.data.ownerInfo)
  .filter(([, value]) => !!value)
  .map(
    ([key, value]) =>
      `  - ${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`,
  )
  .join('\n')}`;

    const html = mustache.render(
      await UtilsService.readModuleFile(
        `./public/mails/en-us/GenericMessage.html`,
      ),
      {
        title: `Stoplyte - Information Request`,
        description: ``,
        details: emailDetails,
      },
    );

    await sendEmails({
      type: 'email',
      title: `Stoplyte - Information Request`,
      message: emailDetails,
      emailContent: {
        emails: ['barrettrwood@gmail.com'],
        html,
      },
    });

    await this.prisma.contact_unlisted_request.create({
      data: {
        buyer: currentUser.uid,
        propertyId,
        propertySlug,
        email,
        message,
        phone,
      },
    });
  }

  async searchPropertiesByGptRequest(query: string, pagination: any) {
    const apiKey = process.env.REALSTATE_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    const url = 'https://api.realestateapi.com/v2/PropGPT';
    const size = pagination?.pageSize ?? 200;
    try {
      const request = await fetch(url, {
        method: 'POST',
        headers: {
          accept: 'text/plain',
          'content-type': 'application/json',
          'x-openai-key': `${openaiKey}`,
          'x-api-key': `${apiKey}`,
        },
        body: JSON.stringify({
          size,
          query,
          model: 'gpt-4o-mini',
        }),
      });
      const response = await request.json();
      // const allProperties = await this.prisma.claimed_property.findMany({
      //   where: {
      //     realstateId: {
      //       in: response?.data.map((property: any) => String(property.id)),
      //     },
      //   },
      // });
      // response?.data.forEach((property: any) => {
      //   property.image = `https://maps.googleapis.com/maps/api/streetview?size=250x170&location=${property.latitude},${property.longitude}&key=${process.env.GOOGLE_API_KEY}`;
      //   property.stoplyte = allProperties.find(
      //     (pt: any) => pt.realstateId === property.id,
      //   );
      // });
      response?.data.forEach((property: any) => {
        property.image = `https://maps.googleapis.com/maps/api/streetview?size=250x170&location=${property.latitude},${property.longitude}&key=${process.env.GOOGLE_API_KEY}`;
        // property.stoplyte = allProperties.find(
        //   (pt: any) => pt.realstateId === property.id,
        // );
      });
      return { result: response?.data, total: response.data?.resultCount };
    } catch (error: any) {
      console.log(error);
      throw error;
    }
  }
}
