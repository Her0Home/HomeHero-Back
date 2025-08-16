import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: async (config: ConfigService) => {
        // <- Aquí declarás la constante
        const templatesDir =
          process.env.NODE_ENV === 'production'
            ? join(process.cwd(), 'dist/email/templates') // producción
            : join(process.cwd(), 'src/email/templates');              // desarrollo

        console.log('Templates dir:', templatesDir);
        return {
          transport: {
            host: config.get('MAIL_HOST'),
            port: parseInt(config.get('MAIL_PORT') || '465', 10),
            secure: true,
            auth: {
              user: config.get('MAIL_USER'),
              pass: config.get('MAIL_PASSWORD'),
            },
          },
          defaults: {
            from: `"Gracias por unirte a Home Hero" <${config.get('MAIL_FROM')}>`,
          },
          template: {
            dir: templatesDir,           // <- se usa aquí
            adapter: new HandlebarsAdapter(),
            options: { strict: true },
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}