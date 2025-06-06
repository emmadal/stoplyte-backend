class EmailContent {
  emails: string[];
  html: string;
}

class SMSContent {
  phones: string[];
}

export class CreateNotificationDto {
  readonly type: 'email' | 'sms';
  readonly title?: string;
  readonly message?: string;
  readonly emailContent?: EmailContent;
  readonly smsContent?: SMSContent;
}
