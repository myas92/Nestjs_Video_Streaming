import { Controller, Get, Post, Body, Patch, Param, Delete, Res, HttpStatus, Header } from '@nestjs/common';
import { VideoService } from './video.service';
import { statSync, createReadStream } from 'fs';
import { Headers } from '@nestjs/common';
import { Response } from 'express';
@Controller('video')
export class VideoController {
  constructor(private readonly videoService: VideoService) { }

  @Get('stream/:id')
  @Header('Accept-Ranges', 'bytes')
  @Header('Content-Type', 'video/mp4')
  async getStreamVideo(@Param('id') id: string, @Headers() headers, @Res() res: Response) {
    const videoPath = `assets/${id}.mp4`;
    const { size } = statSync(videoPath);
    const videoRange = headers.range;
    if (videoRange) {
      const parts = videoRange.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : size - 1;
      const chunksize = (end - start) + 1;
      const readStreamfile = createReadStream(videoPath, { start, end, highWaterMark:60 });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${size}`,
        'Content-Length': chunksize,
      };
      res.writeHead(HttpStatus.PARTIAL_CONTENT, head); //206
      readStreamfile.pipe(res);
    } else {
      const head = {
        'Content-Length': size,
      };
      res.writeHead(HttpStatus.OK, head);//200
      createReadStream(videoPath).pipe(res);
    }
  }

  @Get()
  findAll() {
    return this.videoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.videoService.findOne(+id);
  }
}
