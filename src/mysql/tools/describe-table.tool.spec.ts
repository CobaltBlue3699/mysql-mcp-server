import { Test, TestingModule } from '@nestjs/testing';
import { DescribeTableTool } from './describe-table.tool';
import { MySqlService } from '../mysql.service';

describe('DescribeTableTool', () => {
  let tool: DescribeTableTool;
  let mockMySqlService: Partial<MySqlService>;

  beforeEach(async () => {
    mockMySqlService = {
      describeTable: jest.fn().mockResolvedValue({
        columns: [
          {
            field: 'id',
            type: 'int',
            null: 'NO',
            key: 'PRI',
            default: null,
            extra: 'auto_increment',
          },
          {
            field: 'name',
            type: 'varchar(255)',
            null: 'YES',
            key: '',
            default: null,
            extra: '',
          },
        ],
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DescribeTableTool,
        { provide: MySqlService, useValue: mockMySqlService },
      ],
    }).compile();

    tool = module.get<DescribeTableTool>(DescribeTableTool);
  });

  it('should be defined', () => {
    expect(tool).toBeDefined();
  });

  describe('describeTable', () => {
    it('should return table description', async () => {
      const result = await tool.describeTable({ tableName: 'users' });
      expect(result.content[0].type).toBe('text');
      const parsed = JSON.parse(result.content[0].text) as {
        columns: { field: string }[];
      };
      expect(parsed.columns).toHaveLength(2);
    });
  });
});
