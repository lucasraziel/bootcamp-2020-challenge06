import { resolve } from 'path';
import multer from 'multer';
import crypto from 'crypto';

const directory = resolve(__dirname, '..', '..', 'tmp');

const uploadConfig = {
  directory,
  storage: multer.diskStorage({
    destination: directory,
    filename: (request, file, callback) => {
      const fileHash = crypto.randomBytes(10).toString('HEX');
      const fileName = `${fileHash}-${file.originalname}`;

      return callback(null, fileName);
    },
  }),
};

export default uploadConfig;
