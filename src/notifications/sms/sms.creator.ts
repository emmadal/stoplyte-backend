import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { CreateNotificationDto } from '../dto/create-notification.dto';

async function sendSMS(message, number) {
  const snsClient = new SNSClient({
    region: process.env.AMZ_REGION,
    credentials: {
      accessKeyId: process.env.AMZ_ACCESS_KEY_ID,
      secretAccessKey: process.env.AMZ_SECRET_ACCESS_KEY,
    },
  });

  number = number.replace('(', '').replace(')', '').replace('-', '');

  if (!String(number).startsWith('+')) {
    number = `+1${number}`;
  }
  const params = {
    Message: message,
    PhoneNumber: number,
  };

  try {
    const command = new PublishCommand(params);
    await snsClient.send(command);
    console.log('SMS sent', params);
  } catch (err) {
    console.log('error sending SMS', err, err.stack);
    return false;
  }
}

export async function sendMultipleSMS(payload: CreateNotificationDto) {
  const { phones } = payload.smsContent;

  for (const phone of phones) {
    if (!phone) continue;

    await sendSMS(`${payload.title} - ${payload.message}`, phone);
  }
}
