import { Test, TestingModule } from '@nestjs/testing';
import { ListTablesTool } from './list-tables.tool';
import { MySqlService } from '../mysql.service';

describe('ListTablesTool', () => {
  let tool: ListTablesTool;
  let mockMySqlService: Partial<MySqlService>;

  beforeEach(async () => {
    mockMySqlService = {
      listTables: jest.fn().mockResolvedValue([
        { tableName: 'users', tableType: 'BASE TABLE' },
        { tableName: 'orders', tableType: 'BASE TABLE' },
      ]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListTablesTool,
        { provide: MySqlService, useValue: mockMySqlService },
      ],
    }).compile();

    tool = module.get<ListTablesTool>(ListTablesTool);
  });

  it('should be defined', () => {
    expect(tool).toBeDefined();
  });

  describe('listTables', () => {
    it('should return table list', async () => {
      const result = await tool.listTables();
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      const parsed = JSON.parse(result.content[0].text) as {
        tableName: string;
        tableType: string;
      }[];
      expect(parsed).toHaveLength(2);
      expect(parsed[0].tableName).toBe('users');
    });

    it('should call mysqlService.listTables', async () => {
      await tool.listTables();
      expect(mockMySqlService.listTables).toHaveBeenCalled();
    });
  });
});
