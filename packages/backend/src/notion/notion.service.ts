import { Client } from '@notionhq/client';
import * as dotenv from 'dotenv';
dotenv.config();

export class NotionService {
  notion: Client;

  constructor() {
    this.notion = new Client({ auth: process.env.NOTION_API_KEY });
  }

  async appendTextAfterBlock(blockId: string, text: string) {
    try {
      // Append text after the specified block
      await this.notion.blocks.children.append({
        block_id: blockId, // Assuming the parent is a page
        children: [
          {
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [
                {
                  type: 'text',
                  text: {
                    content: text,
                  },
                },
              ],
            },
          },
        ],
      });

      console.log('Text appended successfully.');
    } catch (error) {
      console.error('Failed to append text:', error);
    }
  }
}
