import { ApiProperty } from '@nestjs/swagger';

class EmailContent {
  @ApiProperty({
    description: 'List of email addresses to send to',
    example: ['user@example.com', 'admin@example.com']
  })
  emails: string[];
  @ApiProperty({
    description: 'HTML content of the email',
    example: '<h1>Welcome to StopLyte</h1><p>Your account has been created successfully.</p>'
  })
  html: string;
}

class SMSContent {
  @ApiProperty({
    description: 'List of phone numbers to send SMS to',
    example: ['+15551234567', '+15557654321']
  })
  phones: string[];
}

export class CreateNotificationDto {
  @ApiProperty({
    description: 'Type of notification',
    enum: ['email', 'sms'],
    example: 'email'
  })
  readonly type: 'email' | 'sms';
  @ApiProperty({
    description: 'Title of the notification',
    example: 'Welcome to StopLyte',
    required: false
  })
  readonly title?: string;
  @ApiProperty({
    description: 'Main message content of the notification',
    example: 'Thank you for registering with our service.',
    required: false
  })
  readonly message?: string;
  @ApiProperty({
    description: 'Email-specific content if type is email',
    required: false,
    type: EmailContent
  })
  readonly emailContent?: EmailContent;
  @ApiProperty({
    description: 'SMS-specific content if type is sms',
    required: false,
    type: SMSContent
  })
  readonly smsContent?: SMSContent;
}
