/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
import fs from 'fs';
import CreateTransactionService from './CreateTransactionService';
import Transaction from '../models/Transaction';
import AppError from '../errors/AppError';

interface Request {
  path: string;
}

interface TransactionImport {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute({ path }: Request): Promise<Transaction[]> {
    const fileExists = await fs.promises.stat(path);

    if (!fileExists) {
      throw new AppError('Fail in uploading the file');
    }

    const reading = await fs.promises.readFile(path);

    const values = reading
      .toString('utf-8')
      .split('\n')
      .slice(1)
      .filter(text => text.length > 0);

    const transactions: Transaction[] = [];

    for (let i = 0; i < values.length; i++) {
      const [title, type, valueString, category] = values[i]
        .split(',')
        .map(word => word.trim());

      if (
        title &&
        type &&
        valueString &&
        category &&
        (type === 'income' || type === 'outcome')
      ) {
        const value = parseInt(valueString, 10);

        const createTransactionService = new CreateTransactionService();

        const transaction = await createTransactionService.execute({
          title,
          type,
          value,
          category,
        });

        transactions.push(transaction);
      }
    }

    await fs.promises.unlink(path);

    return transactions;
  }
}

export default ImportTransactionsService;
