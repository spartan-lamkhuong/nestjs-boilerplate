import {
  ReceiveMessageCommand,
  ReceiveMessageCommandInput,
  SendMessageCommand,
  SendMessageCommandInput,
  SQSClient,
} from '@aws-sdk/client-sqs';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SQSService {
  public sqsClient: SQSClient;

  private receiveParams: ReceiveMessageCommandInput = {
    QueueUrl: '',
    MaxNumberOfMessages: 10,
    VisibilityTimeout: 20,
    WaitTimeSeconds: 0,
  };

  private sendParams: SendMessageCommandInput = {
    DelaySeconds: 10,
    QueueUrl: '',
    MessageBody: '',
  };

  constructor(private configService: ConfigService) {
    this.sqsClient = new SQSClient({
      region: this.configService.get('AWS_S3_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_S3_KEY'),
        secretAccessKey: this.configService.get('AWS_S3_SECRET'),
      },
    });
  }

  async send(queueUrl: string, messageBody: string) {
    try {
      return await this.sqsClient.send(
        new SendMessageCommand({
          ...this.sendParams,
          QueueUrl: queueUrl,
          MessageBody: messageBody,
        }),
      );
    } catch (err) {
      throw new Error(err);
    }
  }

  async receive(queueUrl: string) {
    try {
      return await this.sqsClient.send(
        new ReceiveMessageCommand({
          ...this.receiveParams,
          QueueUrl: queueUrl,
        }),
      );
    } catch (err) {
      throw new Error(err);
    }
  }

  getQueueUrl(queueName: string) {
    return `https://sqs.${this.configService.get(
      'AWS_S3_REGION',
    )}.amazonaws.com/${this.configService.get(
      'AWS_ACCOUNT_ID',
    )}/${queueName}?access_key=${this.configService.get(
      'AWS_S3_KEY',
    )}&secret_key=${this.configService.get('AWS_S3_SECRET')}&auto_setup=false`;
  }
}
