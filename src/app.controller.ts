import { Controller, Get, Post, Patch, Delete, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';
import type { Request, Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getProduct(): any {
    return this.appService.getProduct();
  }

  @Post()
  postProduct(@Req() req: Request, @Res() res: Response): void {
    return this.appService.postProduct(req, res);
  }

  @Patch()
  patchProduct(@Req() req: Request, @Res() res: Response): void {
    return this.appService.patchProduct(req, res);
  }

  @Delete()
  deleteProduct(@Req() req: Request, @Res() res: Response): void {
    return this.appService.deleteProduct(req, res);
  }
}
