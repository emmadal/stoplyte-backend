import {
  Controller,
  Body,
  Post,
  Get,
  Put,
  Param,
  Res,
  Delete,
} from '@nestjs/common';
import { Response } from 'express';

import { Roles } from 'src/decorators/roles.decorator';
import { Public } from 'src/decorators/public.decorator';
import { AccountsService } from './accounts.service';
import {
  CreateAccountDTO,
  ListPropertyDTO,
  LoginAccountDTO,
  UpdateAccountDTO,
} from './dto/accounts.dto';
import { CreatePropertySubmissionDto } from './dto/home-value.dto';
import { sendEmails } from '../notifications/email/email.creator';
import { UtilsService } from '../utils/utils.service';
import * as mustache from 'mustache';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post('/signup')
  @Public()
  async signup(@Body() createEventDto: CreateAccountDTO, @Res() res: Response) {
    const { user, token } =
      await this.accountsService.createWithPassword(createEventDto);
    this.accountsService.setCookie(token, res);
    const sanitizedData = this.accountsService.sanitizeAccountData(user);
    return res.json(sanitizedData);
  }

  @Post('/signup-with-google')
  @Public()
  async signupWithGoogle(
    @Body() createEventDto: CreateAccountDTO,
    @Res() res: Response,
  ) {
    const { user, token } =
      await this.accountsService.createAccountWithGoogle(createEventDto);
    this.accountsService.setCookie(token, res);
    const sanitizedData = this.accountsService.sanitizeAccountData(user);
    return res.json(sanitizedData);
  }

  @Post('/login')
  @Public()
  async login(@Body() loginEventDto: LoginAccountDTO, @Res() res: Response) {
    const { user, token } = await this.accountsService.login(loginEventDto);
    this.accountsService.setCookie(token, res);
    const sanitizedData = this.accountsService.sanitizeAccountData(user);
    return res.json(sanitizedData);
  }

  @Post('/learn-home-value')
  @Public()
  async submitProperty(
    @Body() createPropertySubmissionDto: CreatePropertySubmissionDto,
  ) {
    const emailDetails = Object.keys(createPropertySubmissionDto)
      .map((key) => {
        return `${key}: ${createPropertySubmissionDto[key]}`;
      })
      .join('\n');

    const html = mustache.render(
      await UtilsService.readModuleFile(
        `./public/mails/en-us/GenericMessage.html`,
      ),
      {
        title: `Stoplyte - Request to Learn Home Value`,
        description: ``,
        details: emailDetails,
      },
    );

    await sendEmails({
      type: 'email',
      title: `Stoplyte - Request to Learn Home Value`,
      message: emailDetails,
      emailContent: {
        emails: ['barrettrwood@gmail.com'],
        html,
      },
    });
  }

  @Get('/me')
  @Roles('user')
  async getMe() {
    return this.accountsService.getMe();
  }

  @Put('/me')
  @Roles('user')
  async updateUserProfile(@Body() updateAccountDTO: UpdateAccountDTO) {
    return this.accountsService.updateAccount(updateAccountDTO);
  }

  @Put('/me/verify')
  @Roles('user')
  async verifyCurrentUser() {
    return this.accountsService.verifyCurrentUser();
  }

  @Put('/me/subscription')
  @Roles('user')
  async updateMySubscription(
    @Body('subscription') subscription: 'buyer' | 'seller',
  ) {
    return this.accountsService.updateSubscription(subscription);
  }

  @Put('/me/properties/:id/claim')
  @Roles('user')
  async claimProperty(
    @Param('id') propertyId: string,
    @Body('listed') listed: boolean,
    @Body('status') status: string,
    @Body('askingPrice') askingPrice: number,
  ) {
    return this.accountsService.claimProperty(
      String(propertyId),
      listed,
      status,
      askingPrice,
    );
  }

  @Put(`/me/properties/:id/unclaim`)
  @Roles('user')
  async unclaimProperty(@Param('id') propertyId: string) {
    return this.accountsService.unclaimProperty(String(propertyId));
  }

  @Put(`/me/properties/:id/list`)
  @Roles('user')
  async listProperty(
    @Param('id') propertyId: string,
    @Body() listPropertyPayload: ListPropertyDTO,
  ) {
    return this.accountsService.listProperty(
      String(propertyId),
      listPropertyPayload,
    );
  }

  @Put(`/me/properties/:id/unlist`)
  @Roles('user')
  async unlistProperty(@Param('id') propertyId: string) {
    return this.accountsService.unlistProperty(String(propertyId));
  }

  @Get('/me/requests')
  @Roles('user')
  async myContactRequests() {
    return this.accountsService.getMyContactRequests();
  }

  @Get('/me/unlisted-requests')
  @Roles('user')
  async getRequestForUnlistedProperties() {
    return this.accountsService.getRequestForUnlistedProperties();
  }

  @Put('/me/request-contact/:uid')
  @Roles('user')
  async requestContact(@Param('uid') contactUid: string) {
    return this.accountsService.requestContact(contactUid);
  }

  @Put('/me/request-contact/:uid/accept')
  @Roles('user')
  async acceptContact(@Param('uid') contactUid: string) {
    return this.accountsService.requestContact(contactUid);
  }

  @Put('/me/request-contact/:uid/decline')
  @Roles('user')
  async declineContact(@Param('uid') contactUid: string) {
    return this.accountsService.declineContact(contactUid);
  }

  @Delete('/me/logout')
  async logout(@Res() res: Response) {
    this.accountsService.removeCookie(res);
    return res.redirect(process.env.FRONTEND_URL);
  }
}
