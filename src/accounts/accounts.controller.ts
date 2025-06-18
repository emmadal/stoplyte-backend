import {
  Controller,
  Body,
  Post,
  Get,
  Put,
  Param,
  Res,
  Delete,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody, ApiCookieAuth } from '@nestjs/swagger';
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

@ApiTags('Accounts')
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post('/signup')
  @Public()
  @ApiOperation({ summary: 'Register a new user account with password' })
  @ApiBody({ type: CreateAccountDTO })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'User account created successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Email already exists' })
  async signup(@Body() createEventDto: CreateAccountDTO, @Res() res: Response) {
    const { user, token } =
      await this.accountsService.createWithPassword(createEventDto);
    this.accountsService.setCookie(token, res);
    const sanitizedData = this.accountsService.sanitizeAccountData(user);
    return res.json(sanitizedData);
  }

  @Post('/signup-with-google')
  @Public()
  @ApiOperation({ summary: 'Register a new user account with Google authentication' })
  @ApiBody({ type: CreateAccountDTO })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'User account created successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
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
  @ApiOperation({ summary: 'Authenticate user and get access token' })
  @ApiBody({ type: LoginAccountDTO })
  @ApiResponse({ status: HttpStatus.OK, description: 'Authentication successful' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid credentials' })
  async login(@Body() loginEventDto: LoginAccountDTO, @Res() res: Response) {
    const { user, token } = await this.accountsService.login(loginEventDto);
    this.accountsService.setCookie(token, res);
    const sanitizedData = this.accountsService.sanitizeAccountData(user);
    return res.json(sanitizedData);
  }

  @Post('/learn-home-value')
  @Public()
  @ApiOperation({ summary: 'Submit property for home value assessment' })
  @ApiBody({ type: CreatePropertySubmissionDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Property submission successful' })
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
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('stk')
  @ApiOperation({ summary: 'Get current user profile information' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User profile retrieved successfully' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not authenticated' })
  async getMe() {
    return this.accountsService.getMe();
  }

  @Put('/me')
  @Roles('user')
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('stk')
  @ApiOperation({ summary: 'Update current user profile information' })
  @ApiBody({ type: UpdateAccountDTO })
  @ApiResponse({ status: HttpStatus.OK, description: 'User profile updated successfully' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not authenticated' })
  async updateUserProfile(@Body() updateAccountDTO: UpdateAccountDTO) {
    return this.accountsService.updateAccount(updateAccountDTO);
  }

  @Put('/me/verify')
  @Roles('user')
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('stk')
  @ApiOperation({ summary: 'Verify current user account' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User verified successfully' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not authenticated' })
  async verifyCurrentUser() {
    return this.accountsService.verifyCurrentUser();
  }

  @Put('/me/subscription')
  @Roles('user')
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('stk')
  @ApiOperation({ summary: 'Update user subscription status' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        subscription: { type: 'string', enum: ['buyer', 'seller'], example: 'buyer' },
      },
    },
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Subscription updated successfully' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not authenticated' })
  async updateMySubscription(
    @Body('subscription') subscription: 'buyer' | 'seller',
  ) {
    return this.accountsService.updateSubscription(subscription);
  }

  @Put('/me/properties/:id/claim')
  @Roles('user')
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('stk')
  @ApiOperation({ summary: 'Claim ownership of a property' })
  @ApiParam({ name: 'id', type: 'string', description: 'Property ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        listed: { type: 'boolean', example: true },
        status: { type: 'string', example: 'active' },
        askingPrice: { type: 'number', example: 450000 },
      },
    },
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Property claimed successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Property not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not authenticated' })
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
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('stk')
  @ApiOperation({ summary: 'Unclaim ownership of a property' })
  @ApiParam({ name: 'id', type: 'string', description: 'Property ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Property unclaimed successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Property not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not authenticated' })
  async unclaimProperty(@Param('id') propertyId: string) {
    return this.accountsService.unclaimProperty(String(propertyId));
  }

  @Put(`/me/properties/:id/list`)
  @Roles('user')
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('stk')
  @ApiOperation({ summary: 'List a property for sale' })
  @ApiParam({ name: 'id', type: 'string', description: 'Property ID' })
  @ApiBody({ type: ListPropertyDTO })
  @ApiResponse({ status: HttpStatus.OK, description: 'Property listed successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Property not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not authenticated' })
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
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('stk')
  @ApiOperation({ summary: 'Remove property listing from market' })
  @ApiParam({ name: 'id', type: 'string', description: 'Property ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Property unlisted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Property not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not authenticated' })
  async unlistProperty(@Param('id') propertyId: string) {
    return this.accountsService.unlistProperty(String(propertyId));
  }

  @Get('/me/requests')
  @Roles('user')
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('stk')
  @ApiOperation({ summary: 'Get all contact requests for current user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Contact requests retrieved successfully' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not authenticated' })
  async myContactRequests() {
    return this.accountsService.getMyContactRequests();
  }

  @Get('/me/unlisted-requests')
  @Roles('user')
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('stk')
  @ApiOperation({ summary: 'Get all requests for unlisted properties' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Unlisted property requests retrieved successfully' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not authenticated' })
  async getRequestForUnlistedProperties() {
    return this.accountsService.getRequestForUnlistedProperties();
  }

  @Put('/me/request-contact/:uid')
  @Roles('user')
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('stk')
  @ApiOperation({ summary: 'Send a contact request to another user' })
  @ApiParam({ name: 'uid', type: 'string', description: 'Target user ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Contact request sent successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not authenticated' })
  async requestContact(@Param('uid') contactUid: string) {
    return this.accountsService.requestContact(contactUid);
  }

  @Put('/me/request-contact/:uid/accept')
  @Roles('user')
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('stk')
  @ApiOperation({ summary: 'Accept a contact request from another user' })
  @ApiParam({ name: 'uid', type: 'string', description: 'Requesting user ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Contact request accepted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Request not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not authenticated' })
  async acceptContact(@Param('uid') contactUid: string) {
    return this.accountsService.requestContact(contactUid);
  }

  @Put('/me/request-contact/:uid/decline')
  @Roles('user')
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('stk')
  @ApiOperation({ summary: 'Decline a contact request from another user' })
  @ApiParam({ name: 'uid', type: 'string', description: 'Requesting user ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Contact request declined successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Request not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not authenticated' })
  async declineContact(@Param('uid') contactUid: string) {
    return this.accountsService.declineContact(contactUid);
  }

  @Delete('/me/logout')
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('stk')
  @ApiOperation({ summary: 'Log out current user and invalidate session' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Logged out successfully' })
  async logout(@Res() res: Response) {
    this.accountsService.removeCookie(res);
    return res.redirect(process.env.FRONTEND_URL);
  }
}
