import { Test, TestingModule } from '@nestjs/testing';
import { ListDatabasesTool } from './list-databases.tool';
import { MySqlService } from '../mysql.service';

describe('ListDatabasesTool', () => {
  let tool: ListDatabasesTool;
  let mockMySqlService: Partial<MySqlService>;

  beforeEach(async () => {
    mockMySqlService = {
      listDatabases: jest.fn().mockResolvedValue(['test_db', 'production_db']),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListDatabasesTool,
        { provide: MySqlService, useValue: mockMySqlService },
      ],
    }).compile();

    tool = module.get<ListDatabasesTool>(ListDatabasesTool);
  });

  it('should be defined', () => {
    expect(tool).toBeDefined();
  });

  describe('listDatabases', () => {
    it('should return database list', async () => {
      const result = await tool.listDatabases();
      expect(result.content[0].type).toBe('text');
      const parsed = JSON.parse(result.content[0].text) as string[];
      expect(parsed).toEqual(['test_db', 'production_db']);
    });
  });
});
