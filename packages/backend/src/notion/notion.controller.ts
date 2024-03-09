import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { NotionService } from './notion.service';

@Controller('notion')
export class NotionController {
  constructor(private readonly notionService: NotionService) {}

  @Post('check-access')
  async checkAccessToBlock(
    @Body('notion_url') notionUrl: string,
  ): Promise<{ block_id?: string; error?: string }> {
    const accessResult = await this.notionService.checkAccess(notionUrl);

    if (accessResult.status === 'success') {
      return { block_id: accessResult.blockId };
    } else {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: accessResult.error,
        },
        HttpStatus.FORBIDDEN,
      );
    }
  }
}
