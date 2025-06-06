import { CreateNotificationDto } from '../dto/create-notification.dto';
import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';

export async function sendEmails(payload: CreateNotificationDto) {
  const sesClient = new SESClient({
    region: process.env.AMZ_REGION,
    credentials: {
      accessKeyId: process.env.AMZ_ACCESS_KEY_ID,
      secretAccessKey: process.env.AMZ_SECRET_ACCESS_KEY,
    },
  });

  payload.emailContent.emails = payload.emailContent.emails.filter(
    (email) => !!email,
  );

  const { emails, html } = payload.emailContent;

  const Destination = {
    ToAddresses: emails,
  };

  const fromAddress = process.env.AMZ_ORIGIN_EMAIL;
  try {
    const params = {
      Destination,
      Source: `${process.env.AMZ_ORIGIN_NAME} <${fromAddress}>`,
      Message: {
        Subject: {
          Data: payload.title,
        },
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: html,
          },
          Text: {
            Data: payload.message,
          },
        },
      },
    };
    const command = new SendEmailCommand(params);
    await sesClient.send(command);

    console.log('Email sent', params);
  } catch (err) {
    console.log('error sending Email', err, err.stack);
    return false;
  }
}
