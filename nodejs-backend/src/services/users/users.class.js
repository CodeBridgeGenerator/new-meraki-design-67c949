const { Service } = require("feathers-mongoose");

exports.Users = class Users extends Service {
  async getSchema() {
    return {
      message: `schema`,
    };
  }
};
