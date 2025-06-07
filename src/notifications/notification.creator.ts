import { CreateNotificationDto } from './dto/create-notification.dto';
import { sendEmails } from './email/email.creator';
import { sendMultipleSMS } from './sms/sms.creator';

export async function sendNotification(
  createNotification: CreateNotificationDto,
) {
  switch (createNotification.type) {
    case 'email':
      await sendEmails(createNotification);
      break;
    case 'sms':
      await sendMultipleSMS(createNotification);
      break;
    default:
      break;
  }
}
