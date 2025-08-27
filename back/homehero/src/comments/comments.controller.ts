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
  @ApiOperation({ summary: 'Get paginated reviews for a professional' })
  @ApiResponse({ status: 200, description: 'Returns paginated reviews' })
  async getLatestForProfessional(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
  ) {
    const skip = (page - 1) * limit;

    const [comments, totalItems] = await this.commentsService.findForProfessionalPaginated(
      id,
      limit,
      skip,
    );
      
    if (totalItems === 0) {
      return {
          data: [],
          meta: { totalItems: 0, itemCount: 0, itemsPerPage: limit, totalPages: 0, currentPage: page },
      };
    }

    const formattedData = comments.map(comment => {
      const subcategory = comment.appointment?.professional?.subcategories?.[0]?.name || 'Servicio General';
      return {
        userName: comment.sender.name,
        userImage: comment.sender.imageProfile,
        date: comment.createdAt,
        rating: comment.rating,
        subcategory: subcategory,
        content: comment.content,
      };
    });

    return {
      data: formattedData,
      meta: {
        totalItems,
        itemCount: formattedData.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      },
    };
  } 
}