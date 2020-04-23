import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import TransactionRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';
import Transaction from '../models/Transaction';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionRepository);

    const categoryRepository = getRepository(Category);

    if (type === 'outcome') {
      const hasBalance =
        (await transactionRepository.getBalance()).total >= value;

      if (!hasBalance) {
        throw new AppError('You do not have enough balance');
      }
    }

    const categoryExists = await categoryRepository.findOne({
      where: { title: category },
    });

    const categoryData =
      categoryExists || (await categoryRepository.create({ title: category }));

    await categoryRepository.save(categoryData);

    const transaction = await transactionRepository.create({
      title,
      value,
      type,
      category: categoryData,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
