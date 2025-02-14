import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { StatusCodes, SystemResponse } from './libs/response-handler';
import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('General')

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get('/health')
  getHello(
    @Res() res: Response
  ) {
    return res.status(StatusCodes.SUCCESS).send(
      SystemResponse.success('Health-check', this.appService.getHello()),
    );
  }
}
