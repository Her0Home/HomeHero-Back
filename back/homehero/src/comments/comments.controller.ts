import { Controller, Get, Post, Body, Param, UseGuards, Request,Query, ParseIntPipe, DefaultValuePipe ,ParseUUIDPipe } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ResponseCommentDto } from './dto/update-comment.dto';
import { LogginGuard } from '../guards/loggin.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { plainToClass } from 'class-transformer';

@ApiTags('comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @UseGuards(LogginGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new comment' })
  @ApiResponse({ status: 201, description: 'Comment created successfully', type: ResponseCommentDto })
  async create(@Request() req, @Body() createCommentDto: CreateCommentDto) {
    const comment = await this.commentsService.create(req.user.id, createCommentDto);
    return plainToClass(ResponseCommentDto, comment, { excludeExtraneousValues: true });
  }

  @Get()
  @ApiOperation({ summary: 'Get all comments' })
  @ApiResponse({ status: 200, description: 'Return all comments', type: [ResponseCommentDto] })
  async findAll() {
    const comments = await this.commentsService.findAll();
    return comments.map(comment => 
      plainToClass(ResponseCommentDto, comment, { excludeExtraneousValues: true })
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a comment by ID' })
  @ApiResponse({ status: 200, description: 'Return the comment', type: ResponseCommentDto })
  async findOne(@Param('id') id: string) {
    const comment = await this.commentsService.findOne(id);
    return plainToClass(ResponseCommentDto, comment, { excludeExtraneousValues: true });
  }

  @Get('appointment/:id')
  @ApiOperation({ summary: 'Get comment by appointment ID' })
  @ApiResponse({ status: 200, description: 'Return the comment for the appointment', type: ResponseCommentDto })
  async findByAppointment(@Param('id') id: string) {
    const comment = await this.commentsService.findByAppointment(id);
    return plainToClass(ResponseCommentDto, comment, { excludeExtraneousValues: true });
  }

  @Get('professional/:id')
  @ApiOperation({ summary: 'Get all comments received by a professional' })
  @ApiResponse({ status: 200, description: 'Return all comments for the professional', type: [ResponseCommentDto] })
  async findByReceiver(@Param('id') id: string) {
    const comments = await this.commentsService.findByReceiver(id);
    return comments.map(comment => 
      plainToClass(ResponseCommentDto, comment, { excludeExtraneousValues: true })
    );
  }

@Get('professional/:id/latest')
  @ApiOperation({ summary: 'Get the 5 latest reviews for a professional' })
  @ApiResponse({ status: 200, description: 'Returns the 5 most recent reviews' })
  async getLatestForProfessional(
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    const comments = await this.commentsService.findLatestForProfessional(id);

    if (!comments || comments.length === 0) {
      return [];
    }
    const formattedData = comments.map(comment => {
      const subcategory = comment.appointment?.professional?.subcategories?.[0]?.name;
      return {
        userName: comment.sender.name,
        userImage: comment.sender.imageProfile,
        date: comment.createdAt,
        rating: comment.rating,
        subcategory: subcategory,
        content: comment.content,
      };
    });

    return formattedData;
  } 
}