import { v2 as cloudinary } from 'cloudinary';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ApiService {
  public getIndex(): string {
    return 'api index page';
  }

  public cloudinary(): { timestamp: number; signature: string } {
    const cloudName = 'do3nweazl';
    const apiKey = '116824275587632';
    const apiSecret = 'Q_7wYI4nbG7Y5x9hr3axUpLi3k8';

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });

    const timestamp = Math.round(new Date().getTime() / 1000);

    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp: timestamp,
        // source: 'uw',
        folder: 'exzi',
      },
      apiSecret,
    );

    return { timestamp, signature };
  }
}
