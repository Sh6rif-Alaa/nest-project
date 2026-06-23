import { Injectable } from '@nestjs/common';
import type { Request, Response } from 'express';

@Injectable()
export class AppService {
  getProduct(): any {
    return 'done';
  }

  postProduct(req: Request, res: Response): void {
    res.status(201).json({ message: "created", data: req.body })
  }

  patchProduct(req: Request, res: Response): void {
    res.status(200).json({ message: "updated", data: req.body })
  }

  deleteProduct(req: Request, res: Response): void {
    res.status(200).json({ message: "deleted", data: req.body })
  }
}
