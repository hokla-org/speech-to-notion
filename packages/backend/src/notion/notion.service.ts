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

  // Function to extract the block ID or page ID from the URL
  extractBlockIdFromNotionUrl(notionUrl: string): string | null {
    // This regex is designed to match Notion URLs and extract the block ID or page ID
    // It starts with the Notion domain, followed by an optional path, and then captures the block ID or page ID
    // The first capture group `([a-zA-Z0-9]+)` matches the page ID
    // The second optional capture group `(?:\?.*#)?([a-zA-Z0-9]*)?` is for URLs that include a block ID after a hash
    const NOTION_BLOCK_REGEX =
      /https:\/\/www.notion.so\/.*?([a-zA-Z0-9]+)(?:\?.*#)?([a-zA-Z0-9]*)?$/;

    const match = notionUrl.match(NOTION_BLOCK_REGEX);
    if (!match) return null; // Return null if the URL doesn't match the expected format

    const pageId = match[1];
    const blockId = match[2];
    return blockId || pageId; // Return the block ID if it exists; otherwise, return the page ID
  }

  async checkAccess(
    notionUrl: string,
  ): Promise<
    { status: 'success'; blockId: string } | { status: 'error'; error: string }
  > {
    const blockId = this.extractBlockIdFromNotionUrl(notionUrl);

    if (blockId == null) {
      return {
        status: 'error',
        error:
          'Invalid Notion URL format. Please ensure the URL is a link to a Notion page or Notion block.',
      };
    }

    try {
      // Attempt to retrieve the block to check access
      const response = await this.notion.blocks.retrieve({ block_id: blockId });
      if (response && response.id) {
        return { status: 'success', blockId: response.id }; // Access is verified, return the block ID
      } else {
        return {
          status: 'error',
          error: 'Failed to retrieve the specified block.',
        };
      }
    } catch (error) {
      return {
        status: 'error',
        error: 'Access to the specified Notion block is denied.',
      };
    }
  }
}
