/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-console */
const fs = require('fs').promises;
const path = require('path');

const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);

const files = [
  {
    name: 'controller.ts',
    getCode: folderName =>
      `
import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";

const insertDB = catchAsync(async (req: Request, res: Response) => {
  const data = req.body;
  const result = await ${capitalize(folderName)}Service.insertDB(data)

  sendResponse<${capitalize(folderName)}>(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Successfully ${capitalize(folderName)}',
    data: result,
  });
});

export const ${capitalize(folderName)}Controller = {insertDB};
`,
  },
  {
    name: 'service.ts',
    getCode: folderName =>
      `
import {  Prisma,${capitalize(folderName)} } from '@prisma/client';
import prisma from '../../../shared/prisma';

const insertDB = async (data: ${capitalize(folderName)}): Promise<${capitalize(
        folderName
      )}> => {
  const result = await prisma.${folderName}.create({
    data,
  });

  return result;
};

export const ${capitalize(folderName)}Service = {insertDB};
`,
  },
  {
    name: 'validation.ts',
    getCode: folderName =>
      `
import { z } from 'zod';
const create${capitalize(folderName)} = z.object({
  body: z.object({
    year: z.number({
      required_error: 'year is Required (zod)',
    }),
    title: z.string({
      required_error: 'title is Required (zod)',
    })
  }),
});

export const ${capitalize(folderName)}Validation = { create${capitalize(
        folderName
      )} };


`,
  },
  {
    name: 'route.ts',
    getCode: folderName =>
      `/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Router } from 'express';
import { ${capitalize(
        folderName
      )}Controller } from './${folderName}.controller';
import {${capitalize(folderName)}Validation } from './${folderName}.validation';
const router = Router();
router.get('/')
router.post('/')

export const ${capitalize(folderName)}Routes = router;
`,
  },
];

async function createFolderAndFiles(parentDirectory, folderName) {
  try {
    const moduleDirectory = path.join(parentDirectory, folderName);

    // Create the folder
    await fs.mkdir(moduleDirectory);

    // Create the files using for...of loop and async/await
    for (const file of files) {
      const filePath = path.join(moduleDirectory, `${folderName}.${file.name}`);
      await fs.writeFile(filePath, file.getCode(folderName));
      console.log(`Created ${filePath}`);
    }

    console.log('Module and files created successfully.');
  } catch (error) {
    console.error('Error:', error);
  }
}

async function getUserInput() {
  return new Promise(resolve => {
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    readline.question(
      'Enter the Module name (or "exit" to terminate): ',
      folderName => {
        readline.close();
        resolve(folderName);
      }
    );
  });
}

async function start() {
  const parentDirectory = 'src/app/modules';

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const folderName = await getUserInput();

    if (folderName.toLowerCase() === 'exit') {
      process.exit(0);
    }

    await createFolderAndFiles(parentDirectory, folderName);
  }
}

start();
