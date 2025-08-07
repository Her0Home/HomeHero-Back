import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppointmentModule } from './appointment/appointment.module';
import { CategoryModule } from './src/category/category.module';
import { CategoryModule } from './category/category.module';
import { MembershipModule } from './membership/membership.module';
import { SubcategoryModule } from './subcategory/subcategory.module';
import { CategoryModule } from './category/category.module';
import { CategoryModule } from './no-spec/category/category.module';
import { CategoryModule } from './no-spec/category/category.module';
import { CategoryModule } from './category/category.module';

@Module({
  imports: [AppointmentModule, CategoryModule, SubcategoryModule, MembershipModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
