import { faker } from "@faker-js/faker";
export default (user, count, deployerJobIdIds) => {
  let data = [];
  for (let i = 0; i < count; i++) {
    const fake = {
      deployerJobId: deployerJobIdIds[i % deployerJobIdIds.length],
      process: faker.lorem.sentence(""),
      task: faker.lorem.sentence(""),

      updatedBy: user._id,
      createdBy: user._id,
    };
    data = [...data, fake];
  }
  return data;
};
