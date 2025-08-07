import { registerAs } from "@nestjs/config"
import { config } from "dotenv"

config({path: './.env.development'})
const configTypeorm = {
    type: 'postgres',
    host: process.env.HOST_DB,
    port: process.env.PORT_DB,
    username: process.env.USERNAME_DB,
    password: process.env.PASSWORD_DB,
    database: process.env.NAME_DB,
    logging:true,
    dropSchema: false,
    synchronize: true,
    entities: ['dist/**/*.entity{.ts,.js}'],
}

export default registerAs('typeorm', () => configTypeorm);