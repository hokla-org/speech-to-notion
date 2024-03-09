import { NotionService } from './notion.service';

describe('NotionService', () => {
  let service: NotionService;

  beforeEach(() => {
    service = new NotionService();
  });

  describe('extractIdsFromNotionUrl', () => {
    it('should extract the correct block ID and page ID from a Notion URL containing a block ID', () => {
      const url =
        'https://www.notion.so/SomePageTitle-4879c771fc7e4e29a8d96c7ebb98fccd?pvs=4#824880bc0b9b4d769387fb99a4fb334d';
      const expected = {
        pageId: '4879c771fc7e4e29a8d96c7ebb98fccd',
        blockId: '824880bc0b9b4d769387fb99a4fb334d',
      };
      expect(service.extractIdsFromNotionUrl(url)).toEqual(expected);
    });

    it('should extract the correct page ID from a Notion URL not containing a block ID', () => {
      const url =
        'https://www.notion.so/SomePageTitle-1234567890abcdef12345678';
      const expected = { pageId: '1234567890abcdef12345678', blockId: null };
      expect(service.extractIdsFromNotionUrl(url)).toEqual(expected);
    });

    it('should return null for both page ID and block ID for an invalid Notion URL', () => {
      const url =
        'https://www.someotherdomain.com/SomePageTitle-1234567890abcdef12345678';
      const expected = { pageId: null, blockId: null };
      expect(service.extractIdsFromNotionUrl(url)).toEqual(expected);
    });
  });
});
