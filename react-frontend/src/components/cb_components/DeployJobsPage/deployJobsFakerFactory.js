import { faker } from "@faker-js/faker";
export default (user, count) => {
  let data = [];
  for (let i = 0; i < count; i++) {
    const fake = {
      projectId: faker.datatype.number(""),
      start: faker.datatype.number(""),
      status: faker.datatype.number(""),
      url: faker.datatype.number(""),
      port: faker.datatype.number(""),

      updatedBy: user._id,
      createdBy: user._id,
    };
    data = [...data, fake];
  }
  return data;
};
