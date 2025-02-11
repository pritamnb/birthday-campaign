import { Controller, Post } from '@nestjs/common';
import { CampaignService } from './campaign.service';

@Controller('campaign')
export class CampaignController {
    constructor(private readonly campaignService: CampaignService) { }

    @Post('start')
    async startCampaign() {
        await this.campaignService.startCampaign();
        return { message: 'Campaign started successfully' };
    }
}
