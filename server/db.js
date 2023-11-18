import { Sequelize } from 'sequelize';
import config from "./db_config.json" assert {type: 'json'};

const sequelize = new Sequelize(config);

export default sequelize;
