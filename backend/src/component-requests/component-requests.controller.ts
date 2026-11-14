import { Controller, Get, Post, Put, Patch, Delete, Query, Param, Body, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ComponentRequestsService } from './component-requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { TransitionStatusDto } from './dto/transition-status.dto';
import { AddCommentDto } from './dto/add-comment.dto';
import { AuthPrincipal, Principal, RequirePermission } from '../auth/principal';
import { Permission } from '../rbac/rbac.service';

@Controller('api/v1/component-requests')
export class ComponentRequestsController {
  constructor(
    private readonly requestsService: ComponentRequestsService,
  ) {}

  @Get('test')
  testRoute() {
    return { message: 'ComponentRequestsController is working', timestamp: new Date().toISOString() };
  }

  @Get()
  getAllRequests(
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('priority') priority?: string,
    @Query('assignedTo') assignedTo?: string,
    @Query('requestedBy') requestedBy?: string,
  ) {
    return this.requestsService.getAllRequests({
      status,
      category,
      priority,
      assignedTo,
      requestedBy,
    });
  }

  @Get('analytics')
  getAnalytics() {
    return this.requestsService.getRequestAnalytics();
  }

  @Get('duplicates')
  checkDuplicates(
    @Query('title') title: string,
    @Query('description') description?: string,
  ) {
    if (!title) {
      throw new BadRequestException('Title is required');
    }
    return this.requestsService.checkForDuplicates(title, description);
  }

  @Get(':id')
  getRequest(
    @Param('id') id: string,
  ) {
    const request = this.requestsService.getRequest(id);
    if (!request) {
      throw new BadRequestException(`Request '${id}' not found`);
    }
    return request;
  }

  @Post()
  createRequest(
    @Body() createDto: CreateRequestDto,
  ) {
    // Check for duplicates before creating
    const duplicates = this.requestsService.checkForDuplicates(
      createDto.title,
      createDto.description
    );
    if (duplicates.similar.length > 0) {
      return {
        duplicateWarning: true,
        similarRequests: duplicates.similar,
        request: this.requestsService.createRequest(createDto),
      };
    }
    return this.requestsService.createRequest(createDto);
  }

  @Put(':id')
  updateRequest(
    @Param('id') id: string,
    @Body() updateDto: UpdateRequestDto,
  ) {
    const request = this.requestsService.updateRequest(id, updateDto);
    if (!request) {
      throw new BadRequestException(`Request '${id}' not found`);
    }
    return request;
  }

  @Delete(':id')
  deleteRequest(
    @Param('id') id: string,
  ) {
    const deleted = this.requestsService.deleteRequest(id);
    if (!deleted) {
      throw new BadRequestException(`Request '${id}' not found`);
    }
    return { success: true, id };
  }

  @Post(':id/vote')
  voteRequest(
    @Param('id') id: string,
    @Principal() principal: AuthPrincipal,
  ) {
    const request = this.requestsService.voteRequest(id, principal.id);
    if (!request) {
      throw new BadRequestException(`Request '${id}' not found`);
    }
    return request;
  }

  // Triage is for approvers; the frontend shows these actions to roadmap:edit holders
  @RequirePermission(Permission.ROADMAP_EDIT)
  @Patch(':id/status')
  transitionStatus(
    @Param('id') id: string,
    @Body() transitionDto: TransitionStatusDto,
    @Principal() principal: AuthPrincipal,
  ) {
    try {
      const request = this.requestsService.transitionStatus(
        id,
        transitionDto.status,
        principal.id,
        transitionDto.comment
      );
      if (!request) {
        throw new BadRequestException(`Request '${id}' not found`);
      }
      return request;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @RequirePermission(Permission.ROADMAP_EDIT)
  @Post(':id/assign')
  assignRequest(
    @Param('id') id: string,
    @Body() body: { userId: string },
  ) {
    const request = this.requestsService.assignRequest(id, body.userId);
    if (!request) {
      throw new BadRequestException(`Request '${id}' not found`);
    }
    return request;
  }

  @Post(':id/comments')
  addComment(
    @Param('id') id: string,
    @Body() commentDto: AddCommentDto,
  ) {
    const comment = this.requestsService.addComment(id, commentDto);
    return comment;
  }

  @Get(':id/comments')
  getComments(
    @Param('id') id: string,
  ) {
    return this.requestsService.getComments(id);
  }

  @RequirePermission(Permission.ROADMAP_EDIT)
  @Post(':id/approve')
  approveRequest(
    @Param('id') id: string,
    @Body() body: { stage?: 'design' | 'technical' | 'final' },
    @Principal() principal: AuthPrincipal,
  ) {
    const request = this.requestsService.approveRequest(id, principal.id, body.stage);
    if (!request) {
      throw new BadRequestException(`Request '${id}' not found`);
    }
    return request;
  }

  @RequirePermission(Permission.ROADMAP_EDIT)
  @Post(':id/reject')
  rejectRequest(
    @Param('id') id: string,
    @Body() body: { reason: string },
    @Principal() principal: AuthPrincipal,
  ) {
    const request = this.requestsService.rejectRequest(id, principal.id, body.reason);
    if (!request) {
      throw new BadRequestException(`Request '${id}' not found`);
    }
    return request;
  }

  @RequirePermission(Permission.ROADMAP_EDIT)
  @Post(':id/promote')
  promoteToSystem(
    @Param('id') id: string,
    @Body() body: { componentId: string },
  ) {
    const request = this.requestsService.promoteToSystem(id, body.componentId);
    if (!request) {
      throw new BadRequestException(`Request '${id}' not found`);
    }
    return request;
  }

  @Post(':id/link-component')
  linkToComponent(
    @Param('id') id: string,
    @Body() body: { componentId: string },
  ) {
    const request = this.requestsService.linkToComponent(id, body.componentId);
    if (!request) {
      throw new BadRequestException(`Request '${id}' not found`);
    }
    return request;
  }

  @Post(':id/unlink-component')
  unlinkFromComponent(
    @Param('id') id: string,
  ) {
    const request = this.requestsService.unlinkFromComponent(id);
    if (!request) {
      throw new BadRequestException(`Request '${id}' not found`);
    }
    return request;
  }
}
